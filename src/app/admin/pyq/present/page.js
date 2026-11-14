import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, permanentRedirect } from "next/navigation";

export const dynamic = 'force-dynamic';

/**
 * Legacy present route — permanently redirects to /admin/studio/present
 * while forwarding ALL query parameters (board, id, ids, deck, session, subject, topic, year).
 */
export default async function LegacyPyqPresentRedirect({ searchParams }) {
  const session = await getServerSession(authOptions).catch(() => null);
  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'FACULTY')) {
    redirect("/admin-login");
  }

  const sp = await searchParams;
  const params = new URLSearchParams();
  if (sp && typeof sp === 'object') {
    for (const [key, val] of Object.entries(sp)) {
      if (Array.isArray(val)) {
        for (const v of val) {
          if (v !== undefined && v !== null && String(v).trim() !== '') {
            params.append(key, String(v));
          }
        }
      } else if (val !== undefined && val !== null && String(val).trim() !== '') {
        params.set(key, String(val));
      }
    }
  }

  if (!params.has('mode')) {
    params.set('mode', 'pyq');
  }

  const qs = params.toString();
  permanentRedirect(qs ? `/admin/studio/present?${qs}` : '/admin/studio/present');
}
