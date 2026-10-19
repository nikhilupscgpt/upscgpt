"use client";

import { useSession } from "next-auth/react";

/**
 * Client-side hook to check user tier, expiry, and role
 */
export function useTier() {
  const { data: session, status, update } = useSession();

  const loading = status === "loading";
  const authenticated = status === "authenticated";
  const user = session?.user || null;

  const role = user?.role || "USER";
  const rawTier = user?.tier || "FREE";
  const validUntil = user?.validUntil || null;

  const isExpired =
    rawTier === "PRO" &&
    role !== "ADMIN" &&
    validUntil != null &&
    new Date(validUntil) < new Date();

  const isAdmin = role === "ADMIN";
  const isPro = isAdmin || (rawTier === "PRO" && !isExpired);
  const tier = isPro ? "PRO" : "FREE";

  return {
    isPro,
    isAdmin,
    tier,
    validUntil,
    isExpired,
    user,
    loading,
    authenticated,
    refreshSession: update
  };
}
