import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  isUserProActive,
  getMonetisationConfig,
  getIstDayWindow,
  getAnonymousHash,
} from "@/lib/monetisation";
import { getStructuredExplanation } from "@/lib/pyqExplanationHelper";

/**
 * Premium Feature Definition
 */
export const PREMIUM_FEATURES = {
  AI_DEEP_DIVE: "ai_deep_dive",
  UNLIMITED_RAG: "unlimited_rag",
  PDF_EXPORT: "pdf_export",
  HISTORICAL_INTEL: "historical_intel",
  PYQ_DEEP_DIVE: "pyq_deep_dive",
  PYQ_PRACTICE: "pyq_practice",
  MICRO_THEME_ANALYTICS: "micro_theme_analytics",
  WRONG_ANSWER_QUEUE: "wrong_answer_queue"
};

/**
 * Server-side Tier Guard
 * @returns {Promise<{isPro: boolean, tier: string, role: string, validUntil: string|null, user: any}>}
 */
export async function getTierStatus() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      isPro: false,
      tier: "FREE",
      role: "USER",
      validUntil: null,
      user: null
    };
  }

  let dbUser = null;
  try {
    dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, role: true, tier: true, validUntil: true }
    });
  } catch (err) {
    console.error("[tier-gate] DB read failed; treating user as FREE", err?.message);
  }

  // Fail closed: never trust the session token for paid access when the DB is unavailable.
  // (Role is also taken from the DB only: a session-claimed ADMIN role would otherwise grant PRO.)
  const effectiveUser = dbUser || { ...session.user, role: "USER", tier: "FREE", validUntil: null };
  const role = effectiveUser?.role || "USER";
  const validUntil = effectiveUser?.validUntil
    ? (typeof effectiveUser.validUntil === "string"
        ? effectiveUser.validUntil
        : effectiveUser.validUntil.toISOString())
    : null;

  const isPro = isUserProActive({
    role,
    tier: effectiveUser?.tier || "FREE",
    validUntil
  });

  // Auto-downgrade in background if DB still says PRO but validUntil has passed
  if (dbUser && dbUser.tier === "PRO" && role !== "ADMIN" && !isPro) {
    prisma.user
      .update({ where: { id: dbUser.id }, data: { tier: "FREE" } })
      .catch(() => {});
  }

  return {
    isPro,
    tier: isPro ? "PRO" : "FREE",
    role,
    validUntil,
    user: {
      ...session.user,
      role,
      tier: isPro ? "PRO" : "FREE",
      validUntil
    }
  };
}

/**
 * Utility to restrict API routes
 */
export async function restrictToPro(featureName = "This feature") {
  const { isPro } = await getTierStatus();

  if (!isPro) {
    throw new Error(`${featureName} requires a Prelims Pass subscription.`);
  }

  return true;
}

/* ------------------------------------------------------------------ */
/* Free-tier usage (deep-dives / practice sets) — server source of truth */
/* ------------------------------------------------------------------ */

export const USAGE_ACTION_MAP = {
  deep_dive: "PYQ_DEEP_DIVE_VIEW",
  practice_set: "PYQ_PRACTICE_START",
};

/**
 * Computes today's (IST) free-tier usage for a feature.
 * `req` only needs `.headers.get()` (a Request, or `{ headers: await headers() }`).
 * Pass `tierStatus` to avoid a second session/DB lookup.
 */
export async function computeUsageState(req, feature = "deep_dive", tierStatus = null) {
  const [config, tier] = await Promise.all([
    getMonetisationConfig(),
    tierStatus ? Promise.resolve(tierStatus) : getTierStatus(),
  ]);

  const freeLimits = config.freeLimits || {};
  const gatingEnabled = freeLimits.gatingEnabled !== false;
  const isPro = tier.isPro;
  const userId = tier.user?.id || null;
  const anonHash = userId ? null : getAnonymousHash(req);
  const { dayKey, start, end } = getIstDayWindow();

  let limit = null;
  if (!isPro && gatingEnabled) {
    if (feature === "deep_dive") {
      limit = userId
        ? Number(freeLimits.freeDailyExplanations ?? 5)
        : Number(freeLimits.anonDailyExplanations ?? 2);
    } else if (feature === "practice_set") {
      limit = userId ? Number(freeLimits.freeDailyPracticeSets ?? 1) : 0;
    }
  }

  const actionName = USAGE_ACTION_MAP[feature] || USAGE_ACTION_MAP.deep_dive;
  let logs = [];
  if (!isPro && gatingEnabled) {
    logs = await prisma.actionLog.findMany({
      where: {
        action: actionName,
        createdAt: { gte: start, lt: end },
        ...(userId ? { userId } : { entityType: `ANON_${anonHash}` }),
      },
      select: { entityId: true },
    });
  }

  // Deduplicate by entityId: re-opening an already-unlocked question (or re-loading the
  // same practice set, keyed `set_<signature>`) today does not consume another unit.
  const unlockedIds = Array.from(new Set(logs.map((l) => l.entityId).filter(Boolean)));
  const used = unlockedIds.length;
  const remaining = limit == null ? null : Math.max(0, limit - used);
  const allowed = isPro || !gatingEnabled || limit == null || used < limit;

  return {
    feature,
    dayKey,
    authenticated: Boolean(userId),
    userId,
    anonHash,
    isPro,
    validUntil: tier.validUntil,
    gatingEnabled,
    used,
    limit,
    remaining,
    allowed,
    unlockedIds,
    freeLimits,
  };
}

/**
 * Reduces a stored PYQ explanation to the basic (free) explanation text, removing the
 * PRO 8-part deep-dive (`analysis`). Mirrors the client parser in pyqExplanationHelper.
 */
export function toBasicExplanation(explanation, correctLabel = null) {
  if (!explanation || typeof explanation !== "string") return explanation || null;
  const { explanationText } = getStructuredExplanation({ explanation, correctLabel });
  return explanationText || null;
}

/** True when the stored explanation carries a structured deep-dive. */
export function hasDeepDive(explanation) {
  if (!explanation || typeof explanation !== "string") return false;
  const { analysis } = getStructuredExplanation({ explanation });
  return Boolean(analysis);
}

/**
 * Applies the deep-dive gate to a list of questions ({ id, explanation, correctLabel }).
 * Entitled (PRO / gating off / already unlocked today) questions keep the full explanation;
 * others get only the basic text plus `deepDiveLocked: true`. The client unlocks a locked
 * deep-dive via POST /api/monetisation/usage, which records quota and returns the full text.
 *
 * @param {Array} questions
 * @param {{ isPro?: boolean, gatingEnabled?: boolean, unlockedIds?: string[] } | null} access
 *   Pass null to lock everything (e.g. cached/ISR pages that cannot be per-user).
 */
export function applyDeepDiveGate(questions, access) {
  const fullAccess = Boolean(access && (access.isPro || access.gatingEnabled === false));
  const unlocked = new Set(access?.unlockedIds || []);
  return (questions || []).map((q) => {
    if (!q || fullAccess || unlocked.has(q.id) || !hasDeepDive(q.explanation)) {
      return q;
    }
    return {
      ...q,
      explanation: toBasicExplanation(q.explanation, q.correctLabel),
      analysis: null,
      deepDiveLocked: true,
    };
  });
}
