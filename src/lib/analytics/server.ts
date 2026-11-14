import crypto from 'node:crypto';
import { validateEvents, type EventName } from './events.ts';
import { toIp24 } from '../cost/recordUsage.ts';

export function detectDevice(userAgent: string | null | undefined): 'mobile' | 'tablet' | 'desktop' {
  const ua = (userAgent || '').toLowerCase();
  if (!ua) return 'desktop';
  if (ua.includes('ipad') || (ua.includes('android') && !ua.includes('mobile')) || ua.includes('tablet')) {
    return 'tablet';
  }
  if (ua.includes('mobi') || ua.includes('iphone') || ua.includes('android') || ua.includes('capacitor')) {
    return 'mobile';
  }
  return 'desktop';
}

export interface RawEventInsertRow {
  eventId: string;
  clientTs?: string;
  name: string;
  userId?: string | null;
  anonId: string;
  sessionId: string;
  tier?: string | null;
  module?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  props: Record<string, unknown>;
  device: string;
  ip24?: string | null;
}

/**
 * Single multi-row parameterized INSERT into partitioned `event_raw`.
 */
export async function insertEventRawBatch(db: any, rows: RawEventInsertRow[]): Promise<number> {
  if (!rows.length || !db?.$executeRawUnsafe) return 0;

  const values: unknown[] = [];
  const tuples: string[] = [];
  let p = 1;

  for (const r of rows) {
    tuples.push(
      `($${p++}::uuid, $${p++}::timestamptz, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}::jsonb, $${p++}, $${p++})`
    );
    values.push(
      r.eventId,
      r.clientTs || null,
      r.name,
      r.userId || null,
      r.anonId,
      r.sessionId,
      r.tier || 'anon',
      r.module || null,
      r.entityType || null,
      r.entityId || null,
      JSON.stringify(r.props || {}),
      r.device,
      r.ip24 || null
    );
  }

  const sql = `
    INSERT INTO event_raw (
      event_id, client_ts, name, user_id, anon_id, session_id,
      tier, module, entity_type, entity_id, props, device, ip24
    ) VALUES ${tuples.join(', ')}
    ON CONFLICT (created_at, event_id) DO NOTHING
  `;

  await db.$executeRawUnsafe(sql, ...values);
  return rows.length;
}

/**
 * Server-side event emitter for authoritative events (paywall_hit, practice_*, quiz_*, etc.).
 */
export async function emitServerEvent(params: {
  db?: any;
  name: EventName;
  props: Record<string, unknown>;
  userId?: string | null;
  anonId?: string | null;
  sessionId?: string | null;
  tier?: string | null;
  module?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  try {
    const db = params.db || (await import('../prisma.js')).default;
    const eventId = crypto.randomUUID();
    const anonId = params.anonId || (params.userId ? `user_${params.userId}` : 'anon_server');
    const sessionId = params.sessionId || `sess_srv_${Date.now()}`;

    const { accepted } = validateEvents([
      {
        eventId,
        name: params.name,
        anonId,
        sessionId,
        ...(params.module ? { module: params.module } : {}),
        ...(params.entityType ? { entityType: params.entityType } : {}),
        ...(params.entityId ? { entityId: params.entityId } : {}),
        props: params.props || {},
      },
    ]);

    if (!accepted.length) return;
    const ev = accepted[0];

    await insertEventRawBatch(db, [
      {
        eventId: ev.eventId,
        name: ev.name,
        userId: params.userId || null,
        anonId: ev.anonId,
        sessionId: ev.sessionId,
        tier: params.tier ? params.tier.toLowerCase() : params.userId ? 'free' : 'anon',
        module: ev.module || null,
        entityType: ev.entityType || null,
        entityId: ev.entityId || null,
        props: ev.props,
        device: detectDevice(params.userAgent),
        ip24: toIp24(params.ip),
      },
    ]);
  } catch (err) {
    console.error('[emitServerEvent] Failed:', (err as Error)?.message);
  }
}
