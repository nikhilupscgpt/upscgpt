import { NextResponse } from 'next/server';
import { logPyqAiUsage } from '@/lib/pyq/aiAccess';

export async function POST(req) {
  const expected = process.env.INTERNAL_USAGE_SECRET || process.env.INGEST_SECRET;
  const provided = req.headers.get('x-internal-secret') || '';
  if (!expected || provided !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    await logPyqAiUsage({
      userId: body?.userId || null,
      tier: body?.tier || 'GUEST',
      model: body?.model || null,
      neurons: Number(body?.neurons || 0),
      cacheHit: Boolean(body?.cacheHit),
      latencyMs: Number(body?.latencyMs || 0),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[POST /api/internal/usage] Error:', err);
    return NextResponse.json({ error: 'Usage log failed' }, { status: 500 });
  }
}
