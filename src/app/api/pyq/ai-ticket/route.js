import { NextResponse } from 'next/server';
import {
  authorizeAiRequest,
  getAiQuotaSummary,
  issueAiTicket,
} from '@/lib/pyq/aiAccess';

export async function GET(req) {
  try {
    const summary = await getAiQuotaSummary(req);
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    console.error('[GET /api/pyq/ai-ticket] Error:', err);
    return NextResponse.json({ error: 'Unable to read AI quota' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const gate = await authorizeAiRequest(req, {
      turnstileToken: body?.turnstileToken || null,
      consume: false,
    });
    if (!gate.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: gate.error,
          tier: gate.tier,
          limit: gate.limit,
          remaining: gate.remaining,
        },
        { status: gate.status }
      );
    }

    const ticket = issueAiTicket({
      userId: gate.userId,
      tier: gate.tier,
      cachedOnly: gate.cachedOnly,
    });

    return NextResponse.json({
      ok: true,
      ticket,
      tier: gate.tier,
      limit: gate.limit,
      remaining: gate.remaining,
      cachedOnly: gate.cachedOnly,
      pool: gate.pool,
    });
  } catch (err) {
    console.error('[POST /api/pyq/ai-ticket] Error:', err);
    return NextResponse.json({ error: 'Unable to issue AI ticket' }, { status: 500 });
  }
}
