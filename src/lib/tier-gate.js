import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { isUserProActive } from "@/lib/monetisation";

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
    // Fallback to session if DB read fails transiently
  }

  const effectiveUser = dbUser || session.user;
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
