import crypto from 'crypto';
import prisma from '@/lib/prisma';

/**
 * Client IP for rate limiting. On Vercel, `x-real-ip` is set by the platform
 * and cannot be spoofed by the visitor; `x-forwarded-for` is only a fallback.
 */
export function getClientIp(req) {
  const h = req?.headers;
  if (!h) return 'unknown';
  return (
    h.get('x-real-ip') ||
    h.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

/**
 * PRD §6.4: Rate-limit key hierarchy: userId -> deviceId -> ip24.
 */
export function chooseRateLimitKey({ userId = null, deviceId = null, ip = 'unknown' } = {}) {
  if (userId) return `u:${userId}`;
  if (deviceId) return `d:${deviceId}`;
  const parts = String(ip || '').trim().split('.');
  if (parts.length === 4 && parts.every((p) => /^\d+$/.test(p))) {
    return `ip24:${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
  }
  return `ip:${ip || 'unknown'}`;
}

function hashKey(key) {
  return crypto.createHash('sha256').update(String(key)).digest('hex').slice(0, 40);
}

function maybePruneOldHits() {
  if (Math.random() > 0.02) return;
  prisma
    .$executeRawUnsafe(`DELETE FROM rate_limit_hit WHERE created_at < now() - interval '24 hours'`)
    .catch(() => {});
}

/**
 * Database-backed fixed-window rate limit using UNLOGGED `rate_limit_hit` table
 * (never writes RL:* rows to ActionLog).
 */
export async function rateLimit({ bucket, key, limit, windowMs, record = true }) {
  const keyHash = hashKey(key);
  const since = new Date(Date.now() - windowMs);
  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*)::int AS cnt FROM rate_limit_hit WHERE bucket = $1 AND key_hash = $2 AND created_at >= $3`,
      bucket,
      keyHash,
      since
    );
    const count = Number(rows?.[0]?.cnt || 0);
    if (count >= limit) {
      return { allowed: false, remaining: 0, retryAfterSec: Math.ceil(windowMs / 1000) };
    }
    if (record) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO rate_limit_hit (bucket, key_hash) VALUES ($1, $2)`,
        bucket,
        keyHash
      );
      maybePruneOldHits();
    }
    return { allowed: true, remaining: Math.max(0, limit - count - 1), retryAfterSec: 0 };
  } catch (err) {
    console.error(`[rateLimit] ${bucket} check failed:`, err?.message);
    return { allowed: true, remaining: 0, retryAfterSec: 0 };
  }
}

/** Count hits in a bucket without recording a new one. */
export async function countHits({ bucket, key, windowMs }) {
  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*)::int AS cnt FROM rate_limit_hit WHERE bucket = $1 AND key_hash = $2 AND created_at >= $3`,
      bucket,
      hashKey(key),
      new Date(Date.now() - windowMs)
    );
    return Number(rows?.[0]?.cnt || 0);
  } catch {
    return 0;
  }
}

/** Record a hit without checking (e.g. a failed OTP attempt). */
export async function recordHit({ bucket, key }) {
  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO rate_limit_hit (bucket, key_hash) VALUES ($1, $2)`,
      bucket,
      hashKey(key)
    );
    maybePruneOldHits();
  } catch (err) {
    console.error(`[rateLimit] record ${bucket} failed:`, err?.message);
  }
}

/** Remove all hits for a key (e.g. after a successful OTP login). */
export async function clearHits({ bucket, key }) {
  try {
    await prisma.$executeRawUnsafe(
      `DELETE FROM rate_limit_hit WHERE bucket = $1 AND key_hash = $2`,
      bucket,
      hashKey(key)
    );
  } catch {}
}

/** Standard 429 response body/headers helper. */
export function tooManyRequests(NextResponse, retryAfterSec, message = 'Too many requests. Please try again later.') {
  return NextResponse.json(
    { error: message },
    {
      status: 429,
      headers: { 'Retry-After': String(Math.max(1, retryAfterSec || 60)) },
    }
  );
}
