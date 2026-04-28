"use client";

import { useSession } from "next-auth/react";

/**
 * Client-side hook to check user tier and role
 */
export function useTier() {
  const { data: session, status } = useSession();

  const loading = status === "loading";
  const authenticated = status === "authenticated";
  const user = session?.user || null;
  
  const role = user?.role || "USER";
  const tier = user?.tier || "FREE";
  
  // Admins always have PRO access
  const isPro = tier === "PRO" || role === "ADMIN";
  const isAdmin = role === "ADMIN";

  return {
    isPro,
    isAdmin,
    tier,
    user,
    loading,
    authenticated
  };
}
