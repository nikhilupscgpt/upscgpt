import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { formatQuestionDraftForKb } from '@/lib/pyq/syncFormat';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const expected = process.env.INTERNAL_USAGE_SECRET || process.env.INGEST_SECRET;
  const provided = req.headers.get('x-internal-secret') || '';
  if (!expected || provided !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const sinceRaw = searchParams.get('since');
    const limit = Math.min(200, Math.max(1, Number(searchParams.get('limit') || 100)));
    const sinceDate = sinceRaw ? new Date(sinceRaw) : new Date(Date.now() - 48 * 3600 * 1000);
    const validSince = Number.isNaN(sinceDate.getTime())
      ? new Date(Date.now() - 48 * 3600 * 1000)
      : sinceDate;

    const drafts = await prisma.questionDraft.findMany({
      where: {
        updatedAt: { gte: validSince },
      },
      orderBy: { updatedAt: 'asc' },
      take: limit,
    });

    const items = drafts.map(formatQuestionDraftForKb);
    return NextResponse.json({
      ok: true,
      since: validSince.toISOString(),
      syncedAt: new Date().toISOString(),
      count: items.length,
      items,
    });
  } catch (err) {
    console.error('[GET /api/internal/pyq-sync] Error:', err);
    return NextResponse.json({ error: err.message || 'Sync fetch failed' }, { status: 500 });
  }
}
