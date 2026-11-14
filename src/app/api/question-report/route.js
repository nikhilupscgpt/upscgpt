import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { emitServerEvent } from '@/lib/analytics/server';

export const dynamic = 'force-dynamic';

const VALID_REASONS = new Set([
  'wrong_key',
  'typo',
  'outdated',
  'explanation_wrong',
  'other',
]);

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;
    const body = await req.json().catch(() => ({}));

    const sourceType = String(body?.sourceType || '').trim().slice(0, 64);
    const sourceId = String(body?.sourceId || '').trim().slice(0, 128);
    const reason = String(body?.reason || '').trim();
    const note = typeof body?.note === 'string' ? body.note.trim().slice(0, 500) : null;

    if (!sourceType || !sourceId || !VALID_REASONS.has(reason)) {
      return NextResponse.json(
        { error: 'Invalid sourceType, sourceId, or reason' },
        { status: 400 }
      );
    }

    const report = await prisma.questionReport.create({
      data: {
        sourceType,
        sourceId,
        userId,
        reason,
        note: note || null,
      },
      select: { id: true, status: true, createdAt: true },
    });

    emitServerEvent({
      name: 'question_report',
      props: { sourceType, sourceId, reason },
      userId,
      anonId: req.cookies?.get('upsc_anon_id')?.value || null,
      userAgent: req.headers.get('user-agent'),
    }).catch(() => {});

    return NextResponse.json({ ok: true, report });
  } catch (err) {
    console.error('[POST /api/question-report] Error:', err);
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
}
