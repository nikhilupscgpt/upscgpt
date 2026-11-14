import { toIp24 } from '../cost/recordUsage.ts';

export const DEFAULT_MAX_PRO_DEVICES = 2;
export const SCRAPE_ITEMS_PER_HOUR_LIMIT = 300;
export const MAX_LIST_PAGE_SIZE = 50;

export function capPageSize(raw, defaultSize = 20): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return defaultSize;
  return Math.min(MAX_LIST_PAGE_SIZE, Math.max(1, Math.round(n)));
}

export function getLoginBackoffSec(failureCount: number): number {
  if (failureCount <= 2) return 0;
  // 15s, 30s, 60s, 120s, ... capped at 1800s (30m)
  return Math.min(1800, 15 * Math.pow(2, failureCount - 3));
}

export async function recordLoginFailure(params: {
  db?: any;
  accountKey: string;
  ipFull?: string | null;
  userId?: string | null;
}) {
  const db = params.db || (await import('../prisma.js')).default;
  if (!db?.securityEvent) return;
  await db.securityEvent
    .create({
      data: {
        type: 'login_failed',
        userId: params.userId || null,
        ipFull: params.ipFull || null,
        detail: {
          accountKey: String(params.accountKey || '').slice(0, 64),
          ip24: toIp24(params.ipFull),
        },
      },
    })
    .catch(() => {});
}

/**
 * Enforces PRD §6.8: PRO accounts allow at most `maxDevices` (default 2) active devices.
 * A 3rd active device revokes the oldest device, logs SecurityEvent(device_evicted),
 * and optionally triggers a security email.
 */
export async function enforceProDeviceLimit(params: {
  db?: any;
  userId: string;
  userEmail?: string | null;
  deviceId: string;
  uaFamily?: string | null;
  maxDevices?: number;
  ipFull?: string | null;
  notifyFn?: (args: { to: string; subject: string; text: string }) => Promise<unknown>;
}) {
  const db = params.db || (await import('../prisma.js')).default;
  const maxDevices = params.maxDevices ?? DEFAULT_MAX_PRO_DEVICES;
  const now = new Date();

  await db.userDevice.upsert({
    where: {
      userId_deviceId: {
        userId: params.userId,
        deviceId: params.deviceId,
      },
    },
    create: {
      userId: params.userId,
      deviceId: params.deviceId,
      uaFamily: params.uaFamily || null,
      firstSeen: now,
      lastSeen: now,
    },
    update: {
      lastSeen: now,
      revokedAt: null,
      ...(params.uaFamily ? { uaFamily: params.uaFamily } : {}),
    },
  });

  const activeDevices = await db.userDevice.findMany({
    where: { userId: params.userId, revokedAt: null },
    orderBy: { lastSeen: 'asc' },
  });

  const evicted: string[] = [];
  if (activeDevices.length > maxDevices) {
    const excess = activeDevices.length - maxDevices;
    const toRevoke = activeDevices.slice(0, excess);
    for (const dev of toRevoke) {
      await db.userDevice.update({
        where: { id: dev.id },
        data: { revokedAt: now },
      });
      evicted.push(dev.deviceId);

      await db.securityEvent
        .create({
          data: {
            type: 'device_evicted',
            userId: params.userId,
            deviceId: dev.deviceId,
            ipFull: params.ipFull || null,
            detail: {
              keptDeviceId: params.deviceId,
              evictedDeviceId: dev.deviceId,
              maxDevices,
            },
          },
        })
        .catch(() => {});
    }

    if (params.userEmail && params.notifyFn) {
      await params
        .notifyFn({
          to: params.userEmail,
          subject: 'upscgpt+ Security Notice: New device sign-in',
          text: `Your PRO account was signed in from a new device. Because PRO accounts allow up to ${maxDevices} active devices, your oldest device session was signed out.`,
        })
        .catch(() => {});
    }
  }

  return { activeCount: Math.min(activeDevices.length, maxDevices), evicted };
}

/**
 * In-memory sliding-window scrape detector (> 300 distinct items/hour -> SecurityEvent + throttle).
 */
const scrapeWindows = new Map<string, { resetAt: number; items: Set<string>; flagged: boolean }>();

export async function checkScrapeGuard(params: {
  db?: any;
  actorKey: string;
  itemIds: string[];
  userId?: string | null;
  anonId?: string | null;
  ipFull?: string | null;
  limitPerHour?: number;
}): Promise<{ allowed: boolean; distinctCount: number }> {
  const limit = params.limitPerHour ?? SCRAPE_ITEMS_PER_HOUR_LIMIT;
  const now = Date.now();
  let win = scrapeWindows.get(params.actorKey);
  if (!win || now >= win.resetAt) {
    win = { resetAt: now + 3600_000, items: new Set<string>(), flagged: false };
    scrapeWindows.set(params.actorKey, win);
  }
  for (const id of params.itemIds) {
    if (id) win.items.add(String(id));
  }

  const distinctCount = win.items.size;
  if (distinctCount > limit) {
    if (!win.flagged) {
      win.flagged = true;
      const db = params.db || (await import('../prisma.js')).default;
      await db.securityEvent
        ?.create({
          data: {
            type: 'scrape_suspect',
            userId: params.userId || null,
            anonId: params.anonId || null,
            ipFull: params.ipFull || null,
            detail: { actorKey: params.actorKey, distinctCount, limit },
          },
        })
        .catch(() => {});
    }
    return { allowed: false, distinctCount };
  }
  return { allowed: true, distinctCount };
}

/**
 * Insert-only Admin AuditLog helper (PRD §6.12).
 */
export async function writeAuditLog(params: {
  db?: any;
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  ip?: string | null;
}) {
  try {
    const db = params.db || (await import('../prisma.js')).default;
    if (!db?.auditLog) return;
    await db.auditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        entity: params.entity,
        entityId: String(params.entityId),
        before: params.before !== undefined ? (params.before as object) : undefined,
        after: params.after !== undefined ? (params.after as object) : undefined,
        ip: params.ip || null,
      },
    });
  } catch (err) {
    console.error('[writeAuditLog] Failed:', (err as Error)?.message);
  }
}

export interface ReconciliationResult {
  paidNotPro: string[];
  proWithoutPayment: string[];
  refundedStillPro: string[];
}

/**
 * PRD §6.11: Checks payment vs entitlement invariants:
 * - paidNotPro: users with a `paid` Order who are NOT currently PRO (and not ADMIN).
 * - proWithoutPayment: active PRO users (non-ADMIN) with zero `paid` Orders (and no `ADMIN_PASS_GRANTED` audit).
 * - refundedStillPro: users whose latest Order is `refunded` and who are still PRO.
 */
export async function findPaymentReconciliationMismatches(params: {
  db?: any;
  now?: Date;
} = {}): Promise<ReconciliationResult> {
  const db = params.db || (await import('../prisma.js')).default;
  const now = params.now || new Date();

  const [users, orders, adminGrants] = await Promise.all([
    db.user.findMany({
      select: { id: true, role: true, tier: true, validUntil: true },
    }),
    db.order.findMany({
      orderBy: { createdAt: 'desc' },
      select: { userId: true, status: true, createdAt: true },
    }),
    db.auditLog
      ? db.auditLog.findMany({
          where: { action: 'ADMIN_PASS_GRANTED' },
          select: { entityId: true },
        })
      : Promise.resolve([]),
  ]);

  const userMap = new Map<string, any>(users.map((u: any) => [u.id, u]));
  const isProActive = (u: any) =>
    u && u.role !== 'ADMIN' && u.tier === 'PRO' && (!u.validUntil || new Date(u.validUntil) > now);

  const paidUsers = new Set<string>();
  const latestOrderStatus = new Map<string, string>();
  for (const o of orders) {
    if (!latestOrderStatus.has(o.userId)) {
      latestOrderStatus.set(o.userId, o.status);
    }
    if (o.status === 'paid') {
      paidUsers.add(o.userId);
    }
  }

  const grantedUsers = new Set<string>(adminGrants.map((g: any) => String(g.entityId)));

  const paidNotPro: string[] = [];
  const proWithoutPayment: string[] = [];
  const refundedStillPro: string[] = [];

  for (const uid of paidUsers) {
    const u = userMap.get(uid);
    if (u && u.role !== 'ADMIN' && !isProActive(u) && latestOrderStatus.get(uid) === 'paid') {
      paidNotPro.push(uid);
    }
  }

  for (const u of users) {
    if (isProActive(u)) {
      if (!paidUsers.has(u.id) && !grantedUsers.has(u.id)) {
        proWithoutPayment.push(u.id);
      }
      if (latestOrderStatus.get(u.id) === 'refunded') {
        refundedStillPro.push(u.id);
      }
    }
  }

  return { paidNotPro, proWithoutPayment, refundedStillPro };
}
