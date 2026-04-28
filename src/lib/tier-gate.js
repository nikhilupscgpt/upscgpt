import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Premium Feature Definition
 */
export const PREMIUM_FEATURES = {
  AI_DEEP_DIVE: "ai_deep_dive",
  UNLIMITED_RAG: "unlimited_rag",
  PDF_EXPORT: "pdf_export",
  HISTORICAL_INTEL: "historical_intel"
};

/**
 * Server-side Tier Guard
 * @returns {Promise<{isPro: boolean, role: string, user: any}>}
 */
export async function getTierStatus() {
  const session = await getServerSession(authOptions);
  
  const role = session?.user?.role || "USER";
  const tier = session?.user?.tier || "FREE";
  
  // Admins always have PRO access
  const isPro = tier === "PRO" || role === "ADMIN";
  
  return {
    isPro,
    tier,
    role,
    user: session?.user || null
  };
}

/**
 * Utility to restrict API routes
 */
export async function restrictToPro(featureName = "This feature") {
  const { isPro } = await getTierStatus();
  
  if (!isPro) {
    throw new Error(`${featureName} requires a PRO subscription.`);
  }
  
  return true;
}
