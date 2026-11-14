import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { gradeAttemptAnswer } from '@/lib/analytics/grading';

export const dynamic = 'force-dynamic';

function getClientIp(req) {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || null;
}

export async function POST(req, context) {
  try {
    const params = await context.params;
    const attemptId = String(params?.id || '').trim();
    if (!attemptId) {
      return NextResponse.json({ error: 'Missing attempt id' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;
    const anonId = req.cookies?.get('upsc_anon_id')?.value || req.headers.get('x-anon-id') || null;

    const body = await req.json().catch(() => ({}));
    const result = await gradeAttemptAnswer({
      attemptId,
      userId,
      anonId,
      sourceType: body?.sourceType || 'pyq',
      sourceId: body?.sourceId,
      selectedLabel: body?.selectedLabel ?? body?.selected,
      timeSpentSec: body?.timeSpentSec,
      flagged: body?.flagged,
      complete: body?.complete,
      ipFull: getClientIp(req),
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data);
  } catch (err) {
    console.error('[POST /api/attempts/[id]/answer] Error:', err);
    return NextResponse.json({ error: 'Failed to grade answer' }, { status: 500 });
  }
}
