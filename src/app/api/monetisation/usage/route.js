import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { computeUsageState, USAGE_ACTION_MAP } from '@/lib/tier-gate';

export const dynamic = 'force-dynamic';

/**
 * Loads the full stored explanation for a question the caller is entitled to see.
 * Only called after the deep-dive quota check passed (or the user is PRO).
 */
async function loadFullExplanation(entityId) {
  if (!entityId || entityId.length > 64) return null;
  try {
    const draft = await prisma.questionDraft.findUnique({
      where: { id: entityId },
      select: { explanation: true },
    });
    if (draft) return draft.explanation || null;
    const published = await prisma.question.findUnique({
      where: { id: entityId },
      select: { explanation: true, analysis: true },
    });
    if (!published) return null;
    if (published.analysis && typeof published.analysis === 'object') {
      return JSON.stringify({ explanation: published.explanation || '', analysis: published.analysis });
    }
    return published.explanation || null;
  } catch (err) {
    console.error('[Monetisation Usage] Failed to load explanation:', err?.message);
    return null;
  }
}

function publicState(state) {
  // unlockedIds is only needed server-side
  const { unlockedIds, ...rest } = state;
  return rest;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const feature = searchParams.get('feature') || 'deep_dive';
    const state = await computeUsageState(req, feature);
    return NextResponse.json(publicState(state));
  } catch (error) {
    console.error('[Monetisation Usage GET Error]:', error);
    return NextResponse.json({ allowed: false, error: 'Failed to check usage' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const feature = body?.feature === 'practice_set' ? 'practice_set' : 'deep_dive';
    const entityId = body?.entityId ? String(body.entityId).slice(0, 64) : null;
    const wantExplanation = feature === 'deep_dive' && body?.includeExplanation === true && entityId;

    const state = await computeUsageState(req, feature);

    // If question was already unlocked today, allow without incrementing
    if (feature === 'deep_dive' && entityId && state.unlockedIds.includes(entityId)) {
      const explanation = wantExplanation ? await loadFullExplanation(entityId) : undefined;
      return NextResponse.json({
        ...publicState(state),
        allowed: true,
        alreadyUnlocked: true,
        ...(wantExplanation ? { explanation } : {}),
      });
    }

    if (!state.allowed) {
      return NextResponse.json(
        {
          ...publicState(state),
          allowed: false,
          reason: state.authenticated
            ? 'DAILY_FREE_LIMIT_REACHED'
            : 'ANON_LIMIT_REACHED_SIGNIN_REQUIRED',
        },
        { status: 403 }
      );
    }

    // Record usage for non-PRO users when gating is active
    if (!state.isPro && state.gatingEnabled) {
      const actionName = USAGE_ACTION_MAP[feature];
      await prisma.actionLog.create({
        data: {
          userId: state.userId,
          action: actionName,
          entityType: state.userId ? 'QUESTION' : `ANON_${state.anonHash}`,
          entityId: entityId || `set_${Date.now()}`,
          status: 'SUCCESS',
          message: `Daily ${feature} usage recorded (${state.dayKey})`,
        },
      });
    }

    const updatedState = await computeUsageState(req, feature);
    const explanation = wantExplanation ? await loadFullExplanation(entityId) : undefined;
    return NextResponse.json({
      ...publicState(updatedState),
      allowed: true,
      ...(wantExplanation ? { explanation } : {}),
    });
  } catch (error) {
    console.error('[Monetisation Usage POST Error]:', error);
    return NextResponse.json({ allowed: false, error: 'Failed to record usage' }, { status: 500 });
  }
}
