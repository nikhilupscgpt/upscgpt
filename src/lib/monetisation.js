import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { getClientIp } from '@/lib/rateLimit';

export const MONETISATION_CONFIG_KEY = 'monetisation:config';

export const DEFAULT_MONETISATION_CONFIG = {
  updatedAt: new Date().toISOString(),
  freeLimits: {
    gatingEnabled: true,
    anonDailyExplanations: 2,
    freeDailyExplanations: 5,
    freeDailyPracticeSets: 1,
    freeMaxQuestionsPerSet: 10,
    freeBookmarksLimit: 25,
    freeMockTestsAllowed: 1,
    lockMicroThemeAnalytics: true,
    lockWrongAnswerQueue: true,
    lockSlidePdfExport: true,
  },
  plans: [
    {
      code: 'PRELIMS_PASS_2027',
      name: 'Prelims Pass 2027',
      badge: 'BEST VALUE · VALID TILL PRELIMS 2027',
      tagline: 'Complete GS PYQ Deep Dives, Unlimited Practice, Micro-Theme Analytics & Test Series',
      basePriceInr: 999,
      mrpInr: 1999,
      validityMode: 'FIXED_DATE', // 'FIXED_DATE' | 'DURATION_DAYS'
      validUntilDate: '2027-06-30T23:59:59.000Z',
      durationDays: 240,
      active: true,
      highlight: true,
      features: [
        'All UPSC Prelims GS PYQs with 8-part Deep-Dive Explanations',
        'Option-by-option elimination breakdown & Value Addition notes',
        'Unlimited custom practice sets across any subject, topic & micro-theme',
        'Full Micro-Theme accuracy, time-spent & weak-area analytics',
        'Smart Wrong-Answer Re-Practice Queue & Unlimited Bookmarks',
        'Full Map-Based PYQ Explorer & Places in News linkage',
        'Original PYQ-based Prelims Test Series (launching Jan 2027)',
        'Printable A4 Lecture Slide / PDF Export',
      ],
      priceSchedule: [
        {
          id: 'pass_early_bird',
          label: 'Early Bird Offer (Till 31 Dec)',
          priceInr: 999,
          startsAt: '2026-10-01',
          endsAt: '2026-12-31',
        },
        {
          id: 'pass_jan_feb',
          label: 'Test Series Launch Window (Jan – Feb)',
          priceInr: 1299,
          startsAt: '2027-01-01',
          endsAt: '2027-02-28',
        },
        {
          id: 'pass_peak',
          label: 'Peak Prelims Window (1 Mar – 15 Apr)',
          priceInr: 1499,
          startsAt: '2027-03-01',
          endsAt: '2027-04-15',
        },
        {
          id: 'pass_sprint',
          label: 'Final Sprint Offer (16 Apr – Prelims)',
          priceInr: 999,
          startsAt: '2027-04-16',
          endsAt: '2027-06-30',
        },
      ],
    },
    {
      code: 'MONTHLY_PASS',
      name: 'Monthly Prelims Pass',
      badge: '30-DAY ACCESS',
      tagline: 'Full access to PYQ Deep Dives, Unlimited Practice & Analytics for 30 days',
      basePriceInr: 199,
      mrpInr: 399,
      validityMode: 'DURATION_DAYS',
      validUntilDate: null,
      durationDays: 30,
      active: true,
      highlight: false,
      features: [
        '30 days of unlimited 8-part PYQ Deep-Dive Explanations',
        'Unlimited custom practice sets & subject/micro-theme filters',
        'Full Micro-Theme accuracy & time-management analytics',
        'Smart Wrong-Answer Re-Practice Queue & Unlimited Bookmarks',
        'Full Map-Based PYQ Explorer',
      ],
      priceSchedule: [
        {
          id: 'mo_early',
          label: 'Standard Monthly (Oct – Feb)',
          priceInr: 199,
          startsAt: '2026-10-01',
          endsAt: '2027-02-28',
        },
        {
          id: 'mo_peak',
          label: 'Peak Season Monthly (1 Mar – 15 Apr)',
          priceInr: 299,
          startsAt: '2027-03-01',
          endsAt: '2027-04-15',
        },
        {
          id: 'mo_sprint',
          label: 'Final Sprint Monthly (16 Apr – Prelims)',
          priceInr: 399,
          startsAt: '2027-04-16',
          endsAt: '2027-06-30',
        },
      ],
    },
  ],
  coupons: [
    {
      code: 'EARLY10',
      description: 'Early Bird 10% Extra Discount',
      discountType: 'PERCENT', // 'PERCENT' | 'FLAT'
      discountValue: 10,
      maxDiscountInr: 300,
      minOrderInr: 199,
      maxUses: 500,
      usedCount: 0,
      validUntil: '2026-12-31T23:59:59.000Z',
      applicablePlans: ['PRELIMS_PASS_2027', 'MONTHLY_PASS'],
      active: true,
    },
  ],
};

let cachedConfig = null;
let cachedAtMs = 0;
const CACHE_TTL_MS = 10 * 1000;

export function invalidateMonetisationCache() {
  cachedConfig = null;
  cachedAtMs = 0;
}

export async function getMonetisationConfig({ bypassCache = false } = {}) {
  const now = Date.now();
  if (!bypassCache && cachedConfig && now - cachedAtMs < CACHE_TTL_MS) {
    return cachedConfig;
  }

  try {
    const row = await prisma.platformConfig.findUnique({
      where: { key: MONETISATION_CONFIG_KEY },
    });

    if (!row || !row.value) {
      cachedConfig = structuredClone(DEFAULT_MONETISATION_CONFIG);
      cachedAtMs = now;
      return cachedConfig;
    }

    const parsed = JSON.parse(row.value);
    const merged = {
      ...DEFAULT_MONETISATION_CONFIG,
      ...parsed,
      freeLimits: {
        ...DEFAULT_MONETISATION_CONFIG.freeLimits,
        ...(parsed.freeLimits || {}),
      },
      plans: Array.isArray(parsed.plans) ? parsed.plans : DEFAULT_MONETISATION_CONFIG.plans,
      coupons: Array.isArray(parsed.coupons) ? parsed.coupons : DEFAULT_MONETISATION_CONFIG.coupons,
    };

    cachedConfig = merged;
    cachedAtMs = now;
    return merged;
  } catch (err) {
    console.error('[Monetisation] Failed to load config from DB, using defaults:', err.message);
    return structuredClone(DEFAULT_MONETISATION_CONFIG);
  }
}

export async function saveMonetisationConfig(config) {
  const cleanConfig = {
    ...DEFAULT_MONETISATION_CONFIG,
    ...config,
    updatedAt: new Date().toISOString(),
    freeLimits: {
      ...DEFAULT_MONETISATION_CONFIG.freeLimits,
      ...(config.freeLimits || {}),
    },
    plans: Array.isArray(config.plans) ? config.plans : DEFAULT_MONETISATION_CONFIG.plans,
    coupons: Array.isArray(config.coupons) ? config.coupons : DEFAULT_MONETISATION_CONFIG.coupons,
  };

  await prisma.platformConfig.upsert({
    where: { key: MONETISATION_CONFIG_KEY },
    create: {
      key: MONETISATION_CONFIG_KEY,
      value: JSON.stringify(cleanConfig),
    },
    update: {
      value: JSON.stringify(cleanConfig),
    },
  });

  invalidateMonetisationCache();
  return cleanConfig;
}

export function getIstDateString(referenceDate = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(referenceDate);
}

export function getIstDayWindow(referenceDate = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(referenceDate);
  const year = Number(parts.find((p) => p.type === 'year')?.value);
  const month = Number(parts.find((p) => p.type === 'month')?.value);
  const day = Number(parts.find((p) => p.type === 'day')?.value);
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const start = new Date(Date.UTC(year, month - 1, day) - istOffsetMs);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  return {
    dayKey: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    start,
    end,
  };
}

/**
 * Resolves the active price for a plan based on its date schedule (in IST).
 */
export function resolveActivePlanPrice(plan, referenceDate = new Date()) {
  if (!plan) return { priceInr: 999, activeWindowLabel: null, activeWindowId: null };

  const todayIst = getIstDateString(referenceDate); // YYYY-MM-DD
  const schedule = Array.isArray(plan.priceSchedule) ? plan.priceSchedule : [];

  for (const win of schedule) {
    if (!win.priceInr) continue;
    const startsOk = !win.startsAt || todayIst >= win.startsAt.slice(0, 10);
    const endsOk = !win.endsAt || todayIst <= win.endsAt.slice(0, 10);
    if (startsOk && endsOk) {
      return {
        priceInr: Number(win.priceInr),
        activeWindowLabel: win.label || null,
        activeWindowId: win.id || null,
      };
    }
  }

  return {
    priceInr: Number(plan.basePriceInr) || 999,
    activeWindowLabel: null,
    activeWindowId: null,
  };
}

/**
 * Validates a coupon code and calculates the discount.
 */
export function evaluateCoupon(config, planCode, basePriceInr, rawCouponCode) {
  if (!rawCouponCode || !String(rawCouponCode).trim()) {
    return { valid: false, discountInr: 0, finalPriceInr: basePriceInr, coupon: null, error: null };
  }

  const code = String(rawCouponCode).trim().toUpperCase();
  const coupons = Array.isArray(config?.coupons) ? config.coupons : [];
  const coupon = coupons.find((c) => String(c.code || '').toUpperCase() === code);

  if (!coupon || !coupon.active) {
    return { valid: false, discountInr: 0, finalPriceInr: basePriceInr, coupon: null, error: 'Invalid or inactive coupon code.' };
  }

  if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
    return { valid: false, discountInr: 0, finalPriceInr: basePriceInr, coupon: null, error: 'This coupon has expired.' };
  }

  if (coupon.maxUses != null && Number(coupon.usedCount || 0) >= Number(coupon.maxUses)) {
    return { valid: false, discountInr: 0, finalPriceInr: basePriceInr, coupon: null, error: 'This coupon has reached its usage limit.' };
  }

  if (
    Array.isArray(coupon.applicablePlans) &&
    coupon.applicablePlans.length > 0 &&
    !coupon.applicablePlans.includes(planCode)
  ) {
    return { valid: false, discountInr: 0, finalPriceInr: basePriceInr, coupon: null, error: 'Coupon is not valid for the selected plan.' };
  }

  if (coupon.minOrderInr != null && basePriceInr < Number(coupon.minOrderInr)) {
    return {
      valid: false,
      discountInr: 0,
      finalPriceInr: basePriceInr,
      coupon: null,
      error: `Minimum order value for this coupon is ₹${coupon.minOrderInr}.`,
    };
  }

  let discountInr = 0;
  if (coupon.discountType === 'PERCENT') {
    discountInr = Math.round((basePriceInr * Number(coupon.discountValue || 0)) / 100);
    if (coupon.maxDiscountInr != null && Number(coupon.maxDiscountInr) > 0) {
      discountInr = Math.min(discountInr, Number(coupon.maxDiscountInr));
    }
  } else {
    discountInr = Math.round(Number(coupon.discountValue || 0));
  }

  discountInr = Math.max(0, Math.min(discountInr, basePriceInr - 1));
  const finalPriceInr = Math.max(1, basePriceInr - discountInr);

  return {
    valid: true,
    discountInr,
    finalPriceInr,
    coupon: {
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    },
    error: null,
  };
}

/** ActionLog actions written once per successful (paid) upgrade, carrying `couponCode` in message JSON. */
export const SUCCESSFUL_UPGRADE_ACTIONS = ['USER_UPGRADED', 'USER_UPGRADED_WEBHOOK'];

/**
 * Counts successful paid upgrades that used a coupon (optionally for one user).
 * Each verified payment writes exactly one USER_UPGRADED / USER_UPGRADED_WEBHOOK log
 * (PaymentLog idempotency guarantees this), so this is the authoritative redemption count.
 */
export async function countCouponRedemptions(couponCode, userId = null) {
  const code = String(couponCode || '').trim();
  if (!code) return 0;
  return prisma.actionLog.count({
    where: {
      action: { in: SUCCESSFUL_UPGRADE_ACTIONS },
      status: 'SUCCESS',
      message: { contains: `"couponCode":${JSON.stringify(code)}`, mode: 'insensitive' },
      ...(userId ? { userId } : {}),
    },
  });
}

/**
 * evaluateCoupon + DB-backed usage checks:
 *  - a user may redeem the same coupon only once (successful payments);
 *  - maxUses is checked against successful redemptions (not just the config counter).
 * Fails closed (coupon rejected) if the usage lookup errors.
 */
export async function evaluateCouponForUser(config, planCode, basePriceInr, rawCouponCode, userId = null) {
  const result = evaluateCoupon(config, planCode, basePriceInr, rawCouponCode);
  if (!result.valid) return result;

  const invalid = (error) => ({
    valid: false,
    discountInr: 0,
    finalPriceInr: basePriceInr,
    coupon: null,
    error,
  });

  const code = String(rawCouponCode).trim().toUpperCase();
  const coupon = (config?.coupons || []).find((c) => String(c.code || '').toUpperCase() === code);

  try {
    if (userId) {
      const mine = await countCouponRedemptions(coupon?.code || code, userId);
      if (mine > 0) return invalid('You have already used this coupon.');
    }
    if (coupon?.maxUses != null) {
      const total = await countCouponRedemptions(coupon.code || code);
      const used = Math.max(total, Number(coupon.usedCount || 0));
      if (used >= Number(coupon.maxUses)) {
        return invalid('This coupon has reached its usage limit.');
      }
    }
  } catch (err) {
    console.error('[Monetisation] Coupon usage lookup failed:', err?.message);
    return invalid('Could not validate this coupon right now. Please try again.');
  }

  return result;
}

/**
 * Resolves full server-side pricing for a plan + optional coupon.
 * Pass `userId` so per-user coupon reuse is blocked.
 */
export async function resolveServerOrderQuote(planCode = 'PRELIMS_PASS_2027', couponCode = null, userId = null) {
  const config = await getMonetisationConfig();
  const plan =
    config.plans.find((p) => p.code === planCode && p.active) ||
    config.plans.find((p) => p.active);

  if (!plan) {
    throw new Error('Selected plan is currently unavailable.');
  }

  const { priceInr: scheduledPriceInr, activeWindowLabel, activeWindowId } = resolveActivePlanPrice(plan);
  const couponEval = await evaluateCouponForUser(config, plan.code, scheduledPriceInr, couponCode, userId);

  if (couponCode && !couponEval.valid) {
    throw new Error(couponEval.error || 'Invalid coupon code.');
  }

  const finalPriceInr = couponEval.valid ? couponEval.finalPriceInr : scheduledPriceInr;
  const amountPaise = Math.round(finalPriceInr * 100);

  return {
    plan,
    scheduledPriceInr,
    activeWindowLabel,
    activeWindowId,
    discountInr: couponEval.discountInr,
    finalPriceInr,
    amountPaise,
    appliedCoupon: couponEval.coupon,
  };
}

/**
 * Calculates the new `validUntil` timestamp when a user purchases a plan.
 */
export function computeValidUntilForPlan(plan, existingValidUntil = null) {
  const now = new Date();
  const baseStart =
    existingValidUntil && new Date(existingValidUntil) > now
      ? new Date(existingValidUntil)
      : now;

  if (plan?.validityMode === 'FIXED_DATE' && plan?.validUntilDate) {
    const fixed = new Date(plan.validUntilDate);
    if (!Number.isNaN(fixed.getTime()) && fixed > baseStart) {
      return fixed;
    }
  }

  const days = Number(plan?.durationDays) || 30;
  return new Date(baseStart.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * Checks whether a user has an active unexpired PRO pass.
 */
export function isUserProActive(user) {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  if (user.tier !== 'PRO') return false;
  if (!user.validUntil) return true;
  return new Date(user.validUntil) > new Date();
}

/**
 * Increments the display counter `usedCount` in PlatformConfig when a payment is verified.
 * NOTE: this is a non-atomic read-modify-write kept for the admin UI; the maxUses limit is
 * enforced from ActionLog redemptions in evaluateCouponForUser().
 */
export async function incrementCouponUsage(couponCode) {
  if (!couponCode) return;
  try {
    const config = await getMonetisationConfig({ bypassCache: true });
    const code = String(couponCode).trim().toUpperCase();
    let updated = false;
    config.coupons = (config.coupons || []).map((c) => {
      if (String(c.code || '').toUpperCase() === code) {
        updated = true;
        return { ...c, usedCount: Number(c.usedCount || 0) + 1 };
      }
      return c;
    });
    if (updated) {
      await saveMonetisationConfig(config);
    }
  } catch (err) {
    console.error('[Monetisation] Failed to increment coupon usage:', err.message);
  }
}

export function getAnonymousHash(req) {
  // Platform-set IP (x-real-ip on Vercel) — not the client-controllable x-forwarded-for.
  const ip = getClientIp(req);
  const ua = req?.headers?.get?.('user-agent') || 'unknown';
  return crypto.createHash('sha256').update(`${ip}|${ua}`).digest('hex').slice(0, 24);
}
