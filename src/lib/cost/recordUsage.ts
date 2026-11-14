import crypto from 'node:crypto';
import { estimateCostPaise } from './price-table.ts';

export function hashRecipient(raw: string): string {
  return crypto
    .createHash('sha256')
    .update(String(raw || '').trim().toLowerCase())
    .digest('hex');
}

export function toIp24(ip: string | null | undefined): string | null {
  if (!ip) return null;
  const clean = ip.trim();
  const parts = clean.split('.');
  if (parts.length === 4 && parts.every((p) => /^\d+$/.test(p))) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
  }
  return clean.slice(0, 32);
}

export interface RecordUsageParams {
  db?: any;
  provider: string;
  category: 'ai' | 'sms' | 'email' | 'whatsapp' | 'push' | 'payment_fee' | 'storage' | 'maps' | 'search_api';
  feature: string;
  unit: 'tokens_in' | 'tokens_out' | 'sms' | 'email' | 'whatsapp' | 'request' | 'gb';
  quantity: number;
  userId?: string | null;
  tier?: string | null;
  costPaise?: number;
  meta?: {
    model?: string;
    cacheHit?: boolean;
    latencyMs?: number;
    [k: string]: unknown;
  };
}

/**
 * Records a billable provider call in UsageLedger. Never throws into caller flows.
 */
export async function recordUsage(params: RecordUsageParams): Promise<void> {
  try {
    const db = params.db || (await import('../prisma.js')).default;
    if (!db?.usageLedger) return;

    const computedCost =
      typeof params.costPaise === 'number'
        ? Math.max(0, Math.round(params.costPaise))
        : estimateCostPaise({
            provider: params.provider,
            unit: params.unit,
            quantity: params.quantity,
            model: params.meta?.model || null,
            cacheHit: Boolean(params.meta?.cacheHit),
          });

    await db.usageLedger.create({
      data: {
        provider: params.provider,
        category: params.category,
        feature: params.feature,
        unit: params.unit,
        quantity: Number(params.quantity) || 0,
        costPaise: computedCost,
        userId: params.userId || null,
        tier: params.tier || null,
        meta: params.meta ? (params.meta as object) : undefined,
      },
    });
  } catch (err) {
    console.error('[recordUsage] Failed to log usage:', (err as Error)?.message);
  }
}

export interface RecordMessageParams {
  db?: any;
  channel: 'email' | 'sms' | 'whatsapp' | 'push';
  purpose: 'otp' | 'transactional' | 'marketing' | 'alert';
  template: string;
  provider: string;
  providerMsgId?: string | null;
  userId?: string | null;
  to: string;
  campaignId?: string | null;
  status: string;
  costPaise?: number | null;
}

export async function recordMessageLog(params: RecordMessageParams): Promise<void> {
  try {
    const db = params.db || (await import('../prisma.js')).default;
    if (!db?.messageLog) return;

    await db.messageLog.create({
      data: {
        channel: params.channel,
        purpose: params.purpose,
        template: params.template,
        provider: params.provider,
        providerMsgId: params.providerMsgId || null,
        userId: params.userId || null,
        toHash: hashRecipient(params.to),
        campaignId: params.campaignId || null,
        status: params.status,
        costPaise: typeof params.costPaise === 'number' ? params.costPaise : null,
      },
    });
  } catch (err) {
    console.error('[recordMessageLog] Failed to log message:', (err as Error)?.message);
  }
}

export const INDIA_PHONE_RE = /^\+91[6-9]\d{9}$/;

export interface OtpGuardResult {
  allowed: boolean;
  reason?: 'INVALID_INDIAN_PHONE' | 'PHONE_HOURLY_LIMIT' | 'PHONE_DAILY_LIMIT' | 'DEVICE_DAILY_LIMIT';
  captchaRequired: boolean;
  counts: {
    phoneLastHour: number;
    phoneLastDay: number;
    deviceLastDay: number;
  };
}

/**
 * Enforces PRD §6.7 OTP abuse guards:
 * - If channel is sms/whatsapp, phone must be +91 (Indian mobile).
 * - <= 3 / identifier / hour
 * - <= 5 / identifier / day
 * - <= 5 / deviceId / day
 * - captchaRequired = true after 2 requests on the same deviceId in 24h
 */
export async function checkOtpGuards(params: {
  db?: any;
  channel: 'sms' | 'whatsapp' | 'email';
  identifier: string;
  deviceId?: string | null;
  now?: Date;
}): Promise<OtpGuardResult> {
  const db = params.db || (await import('../prisma.js')).default;
  const now = params.now || new Date();
  const cleanId = String(params.identifier || '').trim();

  if (params.channel === 'sms' || params.channel === 'whatsapp') {
    if (!INDIA_PHONE_RE.test(cleanId)) {
      return {
        allowed: false,
        reason: 'INVALID_INDIAN_PHONE',
        captchaRequired: false,
        counts: { phoneLastHour: 0, phoneLastDay: 0, deviceLastDay: 0 },
      };
    }
  }

  const phoneHash = hashRecipient(cleanId);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [phoneLastHour, phoneLastDay, deviceLastDay] = await Promise.all([
    db.otpRequest.count({ where: { phoneHash, createdAt: { gte: oneHourAgo } } }),
    db.otpRequest.count({ where: { phoneHash, createdAt: { gte: oneDayAgo } } }),
    params.deviceId
      ? db.otpRequest.count({ where: { deviceId: params.deviceId, createdAt: { gte: oneDayAgo } } })
      : Promise.resolve(0),
  ]);

  const captchaRequired = Boolean(params.deviceId && deviceLastDay >= 2);

  if (phoneLastHour >= 3) {
    return {
      allowed: false,
      reason: 'PHONE_HOURLY_LIMIT',
      captchaRequired,
      counts: { phoneLastHour, phoneLastDay, deviceLastDay },
    };
  }
  if (phoneLastDay >= 5) {
    return {
      allowed: false,
      reason: 'PHONE_DAILY_LIMIT',
      captchaRequired,
      counts: { phoneLastHour, phoneLastDay, deviceLastDay },
    };
  }
  if (params.deviceId && deviceLastDay >= 5) {
    return {
      allowed: false,
      reason: 'DEVICE_DAILY_LIMIT',
      captchaRequired: true,
      counts: { phoneLastHour, phoneLastDay, deviceLastDay },
    };
  }

  return {
    allowed: true,
    captchaRequired,
    counts: { phoneLastHour, phoneLastDay, deviceLastDay },
  };
}
