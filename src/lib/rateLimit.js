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

function hashKey(key) {
  return crypto.createHash('sha256').update(String(key)).digest('hex').slice(0, 40);
}

/**
 * Database-backed fixed-window rate limit (no Redis needed).
 * Stores one ActionLog row per hit: action = `RL:<bucket>`, entityId = hashed key.
 *
 * @param {object} opts
 * @param {string} opts.bucket   e.g. 'nano', 'otp-send-email'
 * @param {string} opts.key      e.g. user id, email or IP (hashed before storing)
 * @param {number} opts.limit    max hits allowed in the window
 * @param {number} opts.windowMs window length in ms
 * @param {boolean} [opts.record=true] record this hit when allowed
 * @returns {Promise<{ allowed: boolean, remaining: number, retryAfterSec: number }>}
 */
export async function rateLimit({ bucket, key, limit, windowMs, record = true }) {
  const action = `RL:${bucket}`;
  const entityId = hashKey(key);
  const since = new Date(Date.now() - windowMs);
  try {
    const count = await prisma.actionLog.count({
      where: { action, entityId, createdAt: { gte: since } },
    });
    if (count >= limit) {
      return { allowed: false, remaining: 0, retryAfterSec: Math.ceil(windowMs / 1000) };
    }
    if (record) {
      await prisma.actionLog.create({
        data: { action, entityId, entityType: 'RATE_LIMIT', status: 'SUCCESS' },
      });
    }
    return { allowed: true, remaining: Math.max(0, limit - count - 1), retryAfterSec: 0 };
  } catch (err) {
    // If the DB is unavailable, allow the request rather than take the site down.
    console.error(`[rateLimit] ${bucket} check failed:`, err?.message);
    return { allowed: true, remaining: 0, retryAfterSec: 0 };
  }
}

/** Count hits in a bucket without recording a new one. */
export async function countHits({ bucket, key, windowMs }) {
  try {
    return await prisma.actionLog.count({
      where: {
        action: `RL:${bucket}`,
        entityId: hashKey(key),
        createdAt: { gte: new Date(Date.now() - windowMs) },
      },
    });
  } catch {
    return 0;
  }
}

/** Record a hit without checking (e.g. a failed OTP attempt). */
export async function recordHit({ bucket, key }) {
  try {
    await prisma.actionLog.create({
      data: { action: `RL:${bucket}`, entityId: hashKey(key), entityType: 'RATE_LIMIT', status: 'SUCCESS' },
    });
  } catch (err) {
    console.error(`[rateLimit] record ${bucket} failed:`, err?.message);
  }
}

/** Remove all hits for a key (e.g. after a successful OTP login). */
export async function clearHits({ bucket, key }) {
  try {
    await prisma.actionLog.deleteMany({ where: { action: `RL:${bucket}`, entityId: hashKey(key) } });
  } catch {}
}

/** Standard 429 response body/headers helper. */
export function tooManyRequests(NextResponse, retryAfterSec, message = 'Too many requests. Please try again later.') {
  return NextResponse.json(
    { error: message },
    { status: 429, headers: { 'Retry-After': String(retryAfterSec || 60) } }
  );
}
