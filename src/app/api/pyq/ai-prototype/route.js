import { NextResponse } from 'next/server';
import { authorizeAiRequest, logPyqAiUsage } from '@/lib/pyq/aiAccess';

const DEFAULT_MODEL = '@cf/meta/llama-3.1-8b-instruct-fp8-fast';
const localReplyCache = new Map();

export async function POST(req) {
  try {
    const body = await req.json();
    const question = String(body?.question || '').trim().slice(0, 400);
    if (question.length < 3) {
      return NextResponse.json({ error: 'Please enter at least 3 characters.' }, { status: 400 });
    }

    const t0 = Date.now();
    const gate = await authorizeAiRequest(req, {
      turnstileToken: body?.turnstileToken || null,
      consume: true,
    });
    if (!gate.allowed) {
      return NextResponse.json(
        {
          error: gate.error,
          quota: {
            tier: gate.tier,
            limit: gate.limit,
            remaining: gate.remaining,
            cachedOnly: false,
          },
        },
        { status: gate.status }
      );
    }

    const quota = {
      tier: gate.tier,
      limit: gate.limit,
      remaining: gate.remaining,
      cachedOnly: gate.cachedOnly,
    };

    const missing = Array.isArray(body?.missing) ? body.missing : ['definition'];
    const shownSummary = String(body?.shownSummary || '').slice(0, 500);
    const cacheKey = `v9:${question.toLowerCase()}:${missing.join(',')}`;

    if (localReplyCache.has(cacheKey)) {
      const hit = localReplyCache.get(cacheKey);
      const latencyMs = Date.now() - t0;
      logPyqAiUsage({
        userId: gate.userId,
        tier: gate.tier,
        model: hit.model,
        neurons: 0,
        cacheHit: true,
        latencyMs,
      });
      return NextResponse.json({
        ...hit,
        cached: true,
        elapsedMs: latencyMs,
        quota,
      });
    }

    const workerUrl =
      process.env.CLOUDFLARE_PYQ_WORKER_URL ||
      'https://upscgpt-pyq-ai-bot.upscgpt-ai.workers.dev';

    const wRes = await fetch(workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        missing,
        shownSummary,
        poolPct: gate.pool?.poolPct || 0,
        cachedOnly: gate.cachedOnly,
      }),
    });
    const wData = await wRes.json();
    if (wData?.cachedOnlyMiss) {
      return NextResponse.json({ error: wData.error, quota }, { status: 429 });
    }
    if (wRes.ok && wData?.ok) {
      const latencyMs = Date.now() - t0;
      const neuronsUsed = wData.cached ? 0 : Number(wData.usage?.neurons || 0);
      logPyqAiUsage({
        userId: gate.userId,
        tier: gate.tier,
        model: wData.model || DEFAULT_MODEL,
        neurons: neuronsUsed,
        cacheHit: Boolean(wData.cached),
        latencyMs,
      });
      const result = {
        mode: 'gap-fill',
        model: wData.model || DEFAULT_MODEL,
        cached: Boolean(wData.cached),
        sourceMode: wData.sourceMode || 'general',
        label: wData.label || 'Concept Overview',
        sources: Array.isArray(wData.sources) ? wData.sources : [],
        points: Array.isArray(wData.points) ? wData.points : [],
        empty: Boolean(wData.empty),
        usage: wData.usage || null,
      };
      if (!result.empty) localReplyCache.set(cacheKey, result);
      return NextResponse.json({
        ...result,
        elapsedMs: latencyMs,
        quota,
      });
    }

    return NextResponse.json(
      { error: wData?.error || 'AI explanation temporarily unavailable.', quota },
      { status: 502 }
    );
  } catch (err) {
    console.error('[POST /api/pyq/ai-prototype] Error:', err);
    return NextResponse.json({ error: err.message || 'AI gap helper error' }, { status: 500 });
  }
}
