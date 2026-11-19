import crypto from 'node:crypto';
import prisma from '@/lib/prisma';
import { getTierStatus } from '@/lib/tier-gate';
import { chooseRateLimitKey, getClientIp, rateLimit, countHits } from '@/lib/rateLimit';
import { recordUsage } from '@/lib/cost/recordUsage';

// In-memory fallback store (shared via globalThis) when rate_limit_hit / UsageLedger tables aren't migrated yet
const memBuckets = globalThis.__pyqAiMemBuckets || (globalThis.__pyqAiMemBuckets = new Map());
if (!globalThis.__pyqAiNeuronsToday) globalThis.__pyqAiNeuronsToday = { day: '', total: 0 };

function getDayKey() {
  return new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

function memCheckAndRecord(bucket, key, limit, windowMs, record) {
  const now = Date.now();
  const fullKey = `${bucket}:${key}`;
  const list = (memBuckets.get(fullKey) || []).filter((ts) => ts > now - windowMs);
  if (list.length >= limit) {
    memBuckets.set(fullKey, list);
    return { allowed: false, remaining: 0 };
  }
  if (record) list.push(now);
  memBuckets.set(fullKey, list);
  return { allowed: true, remaining: Math.max(0, limit - list.length) };
}

function memCount(bucket, key, windowMs) {
  const now = Date.now();
  const fullKey = `${bucket}:${key}`;
  const list = (memBuckets.get(fullKey) || []).filter((ts) => ts > now - windowMs);
  memBuckets.set(fullKey, list);
  return list.length;
}

export const PYQ_AI_LIMITS = {
  GUEST: 3,
  FREE: 10,
  PRO: 50,
};

const BURST_LIMIT = 10;
const BURST_WINDOW_MS = 10 * 60 * 1000;
const DAY_WINDOW_MS = 24 * 60 * 60 * 1000;
const DAILY_NEURON_POOL = 9500; // Free 10,000 Neurons/day with 500-Neuron safety margin
const FREE_POOL_CUTOFF = 0.85; // Reserve final 15% of daily Neurons strictly for PRO

function getTicketSecret() {
  return process.env.PYQ_AI_TICKET_SECRET || process.env.NEXTAUTH_SECRET || 'dev-pyq-ai-secret';
}

export function issueAiTicket({ userId, tier, cachedOnly }) {
  const payload = {
    sub: userId || 'guest',
    tier,
    cachedOnly: Boolean(cachedOnly),
    exp: Date.now() + 5 * 60 * 1000,
    jti: crypto.randomBytes(8).toString('hex'),
  };
  const b64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', getTicketSecret()).update(b64).digest('base64url');
  return `${b64}.${sig}`;
}

export function verifyAiTicket(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [b64, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', getTicketSecret()).update(b64).digest('base64url');
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
    if (!parsed?.exp || parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function verifyTurnstileToken(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true, skipped: true };
  if (!token) return { ok: false, error: 'Please complete the human verification check.' };
  try {
    const form = new URLSearchParams();
    form.append('secret', secret);
    form.append('response', String(token));
    if (ip && ip !== 'unknown') form.append('remoteip', ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
    });
    const data = await res.json();
    return data?.success
      ? { ok: true }
      : { ok: false, error: 'Verification failed. Please retry.' };
  } catch {
    return { ok: false, error: 'Unable to verify Turnstile challenge.' };
  }
}

export async function getAiPoolStatus() {
  let freePaused = false;
  let neuronsToday = 0;

  try {
    const cfg = await prisma.platformConfig.findUnique({
      where: { key: 'ai_free_tier_paused' },
    });
    if (cfg && (cfg.value === true || cfg.value === 'true' || cfg.value?.enabled === true)) {
      freePaused = true;
    }
  } catch {
    // ignore if config table empty/unavailable
  }

  try {
    const since = new Date(Date.now() - DAY_WINDOW_MS);
    const rows = await prisma.$queryRawUnsafe(
      `SELECT COALESCE(SUM((meta->>'neurons')::double precision), 0) AS neurons
       FROM "UsageLedger"
       WHERE provider = 'cloudflare' AND feature = 'pyq-ai' AND "createdAt" >= $1`,
      since
    );
    neuronsToday = Number(rows?.[0]?.neurons || 0);
  } catch {
    const today = getDayKey();
    neuronsToday = globalThis.__pyqAiNeuronsToday.day === today ? globalThis.__pyqAiNeuronsToday.total : 0;
  }

  const poolRatio = Math.min(1, neuronsToday / DAILY_NEURON_POOL);
  const freeCachedOnly = freePaused || poolRatio >= FREE_POOL_CUTOFF;
  return {
    freePaused,
    neuronsToday: Math.round(neuronsToday * 100) / 100,
    dailyPool: DAILY_NEURON_POOL,
    poolPct: Math.round(poolRatio * 100),
    freeCachedOnly,
  };
}

export function buildLimitMessage(tier, reason) {
  if (reason === 'burst') {
    return 'You are asking very fast — please wait a minute before your next AI question.';
  }
  if (tier === 'GUEST') {
    return 'You have used your 3 free guest AI answers for today. Sign in with Google for 10 free AI answers daily, or use the instant PYQ search above.';
  }
  if (tier === 'FREE') {
    return 'You have used all 10 free AI answers for today (resets in 24h). Upgrade to PRO for 50 AI answers daily, or browse matched PYQs above.';
  }
  return 'You have reached today’s 50 PRO AI answers limit. Cached answers and full PYQ search remain unlimited.';
}

export async function getAiQuotaSummary(req) {
  const tierStatus = await getTierStatus();
  const tier = tierStatus.isPro ? 'PRO' : tierStatus.user?.id ? 'FREE' : 'GUEST';
  const limit = PYQ_AI_LIMITS[tier];
  const ip = getClientIp(req);
  const deviceId = req?.headers?.get?.('x-device-id') || null;
  const key = chooseRateLimitKey({ userId: tierStatus.user?.id || null, deviceId, ip });

  const dbUsed = await countHits({ bucket: 'pyq-ai-daily', key, windowMs: DAY_WINDOW_MS });
  const used = Math.max(dbUsed, memCount('pyq-ai-daily', key, DAY_WINDOW_MS));
  const pool = await getAiPoolStatus();
  const cachedOnly = tier !== 'PRO' && pool.freeCachedOnly;

  return {
    tier,
    userId: tierStatus.user?.id || null,
    limit,
    used,
    remaining: Math.max(0, limit - used),
    cachedOnly,
    pool,
    turnstileRequired: tier === 'GUEST' && Boolean(process.env.TURNSTILE_SECRET_KEY),
    turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || null,
  };
}

export async function authorizeAiRequest(req, { turnstileToken = null, consume = true } = {}) {
  const tierStatus = await getTierStatus();
  const tier = tierStatus.isPro ? 'PRO' : tierStatus.user?.id ? 'FREE' : 'GUEST';
  const limit = PYQ_AI_LIMITS[tier];
  const ip = getClientIp(req);
  const deviceId = req?.headers?.get?.('x-device-id') || null;
  const key = chooseRateLimitKey({ userId: tierStatus.user?.id || null, deviceId, ip });

  if (tier === 'GUEST') {
    const ts = await verifyTurnstileToken(turnstileToken, ip);
    if (!ts.ok) {
      return { allowed: false, status: 403, tier, limit, remaining: 0, error: ts.error };
    }
  }

  const memBurst = memCheckAndRecord('pyq-ai-burst', key, BURST_LIMIT, BURST_WINDOW_MS, consume);
  const burst = await rateLimit({
    bucket: 'pyq-ai-burst',
    key,
    limit: BURST_LIMIT,
    windowMs: BURST_WINDOW_MS,
    record: consume,
  });
  if (!burst.allowed || !memBurst.allowed) {
    return {
      allowed: false,
      status: 429,
      tier,
      limit,
      remaining: 0,
      error: buildLimitMessage(tier, 'burst'),
    };
  }

  const memDaily = memCheckAndRecord('pyq-ai-daily', key, limit, DAY_WINDOW_MS, consume);
  const daily = await rateLimit({
    bucket: 'pyq-ai-daily',
    key,
    limit,
    windowMs: DAY_WINDOW_MS,
    record: consume,
  });
  if (!daily.allowed || !memDaily.allowed) {
    return {
      allowed: false,
      status: 429,
      tier,
      limit,
      remaining: 0,
      error: buildLimitMessage(tier, 'daily'),
    };
  }

  const effectiveRemaining = Math.min(
    memDaily.remaining,
    daily.remaining === 0 && daily.allowed && memDaily.remaining > 0 ? memDaily.remaining : daily.remaining
  );

  const pool = await getAiPoolStatus();
  const cachedOnly = tier !== 'PRO' && pool.freeCachedOnly;

  return {
    allowed: true,
    status: 200,
    tier,
    userId: tierStatus.user?.id || null,
    limit,
    remaining: effectiveRemaining,
    cachedOnly,
    pool,
  };
}

export async function logPyqAiUsage({ userId, tier, model, neurons = 0, cacheHit = false, latencyMs = 0 }) {
  const today = getDayKey();
  if (globalThis.__pyqAiNeuronsToday.day !== today) {
    globalThis.__pyqAiNeuronsToday = { day: today, total: 0 };
  }
  globalThis.__pyqAiNeuronsToday.total += Number(neurons) || 0;

  await recordUsage({
    provider: 'cloudflare',
    category: 'ai',
    feature: 'pyq-ai',
    unit: 'request',
    quantity: 1,
    userId: userId || null,
    tier: tier || 'GUEST',
    costPaise: 0,
    meta: {
      model: model || '@cf/meta/llama-3.1-8b-instruct-fast',
      neurons: Number(neurons) || 0,
      cacheHit: Boolean(cacheHit),
      latencyMs: Number(latencyMs) || 0,
    },
  });
}
