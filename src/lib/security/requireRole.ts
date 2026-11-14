import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export type AppRole = 'ADMIN' | 'FACULTY' | 'USER';

export function checkRole(
  session: { user?: { role?: string | null; id?: string | null } } | null | undefined,
  allowedRoles: readonly string[]
): { ok: true } | { ok: false; status: 401 | 403; error: string } {
  if (!session || !session.user) {
    return { ok: false, status: 401, error: 'Unauthorized. Please sign in.' };
  }
  const role = session.user.role || 'USER';
  if (!allowedRoles.includes(role)) {
    return {
      ok: false,
      status: 403,
      error: `Forbidden. Requires one of: ${allowedRoles.join(', ')}.`,
    };
  }
  return { ok: true };
}

export async function requireApiRole(allowedRoles: readonly string[]) {
  const session: any = await getServerSession(authOptions as any);
  const verdict = checkRole(session, allowedRoles);
  if (!verdict.ok) {
    return {
      session: null,
      response: NextResponse.json({ error: verdict.error }, { status: verdict.status }),
    };
  }
  return { session, response: null };
}
