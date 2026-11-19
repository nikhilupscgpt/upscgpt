import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireApiRole } from '@/lib/security/requireRole';
import { formatQuestionDraftForKb } from '@/lib/pyq/syncFormat';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireApiRole(['ADMIN', 'FACULTY']);
  if (auth.response) return auth.response;

  try {
    const [totalDrafts, incompleteDrafts] = await Promise.all([
      prisma.questionDraft.count(),
      prisma.questionDraft.count({ where: { contentStatus: { not: 'ready' } } }),
    ]);

    let feedbackRows = [];
    try {
      feedbackRows = await prisma.$queryRawUnsafe(
        `SELECT question, reason, COUNT(*)::int AS hits, MAX(asked_at) AS last_asked
         FROM pyq_chat_log
         WHERE reason IN ('thumbs-down', 'not-covered', 'flagged')
         GROUP BY question, reason
         ORDER BY hits DESC, last_asked DESC
         LIMIT 50`
      );
    } catch {
      feedbackRows = [];
    }

    return NextResponse.json({
      ok: true,
      backlog: {
        totalDrafts,
        incompleteDrafts,
        readyDrafts: totalDrafts - incompleteDrafts,
      },
      feedbackQueue: feedbackRows,
    });
  } catch (err) {
    console.error('[GET /api/admin/pyq/ai-sync] Error:', err);
    return NextResponse.json({ error: 'Failed to load AI sync status' }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = await requireApiRole(['ADMIN', 'FACULTY']);
  if (auth.response) return auth.response;

  const workerUrl = process.env.CLOUDFLARE_PYQ_WORKER_URL;
  const secret = process.env.INGEST_SECRET || process.env.INTERNAL_USAGE_SECRET;
  if (!workerUrl || !secret) {
    return NextResponse.json(
      { error: 'CLOUDFLARE_PYQ_WORKER_URL or INGEST_SECRET is not configured.' },
      { status: 500 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const questionId = body?.questionId ? String(body.questionId).trim() : null;
    const sinceDate = body?.since
      ? new Date(body.since)
      : new Date(Date.now() - 24 * 3600 * 1000);

    const drafts = questionId
      ? await prisma.questionDraft.findMany({ where: { id: questionId } })
      : await prisma.questionDraft.findMany({
          where: { updatedAt: { gte: sinceDate } },
          orderBy: { updatedAt: 'desc' },
          take: 100,
        });

    const items = drafts.map(formatQuestionDraftForKb);
    if (!items.length) {
      return NextResponse.json({ ok: true, pushed: 0, skipped: 0, message: 'No updated drafts to sync.' });
    }

    const syncRes = await fetch(`${workerUrl.replace(/\/$/, '')}/admin/sync-docs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ingest-secret': secret,
      },
      body: JSON.stringify({ items }),
    });
    const syncData = await syncRes.json();
    if (!syncRes.ok) {
      return NextResponse.json({ error: syncData?.error || 'Worker sync failed' }, { status: 502 });
    }

    return NextResponse.json({ ok: true, requested: items.length, ...syncData });
  } catch (err) {
    console.error('[POST /api/admin/pyq/ai-sync] Error:', err);
    return NextResponse.json({ error: err.message || 'Sync now failed' }, { status: 500 });
  }
}
