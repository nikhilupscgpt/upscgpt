import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getTierStatus } from '@/lib/tier-gate';
import {
  getMonetisationConfig,
  getIstDayWindow,
  getAnonymousHash,
} from '@/lib/monetisation';

const ACTION_MAP = {
  deep_dive: 'PYQ_DEEP_DIVE_VIEW',
  practice_set: 'PYQ_PRACTICE_START',
};

async function computeUsageState(req, feature = 'deep_dive') {
  const [config, tierStatus] = await Promise.all([
    getMonetisationConfig(),
    getTierStatus(),
  ]);

  const freeLimits = config.freeLimits || {};
  const gatingEnabled = freeLimits.gatingEnabled !== false;
  const isPro = tierStatus.isPro;
  const userId = tierStatus.user?.id || null;
  const anonHash = userId ? null : getAnonymousHash(req);
  const { dayKey, start, end } = getIstDayWindow();

  let limit = null;
  if (!isPro && gatingEnabled) {
    if (feature === 'deep_dive') {
      limit = userId
        ? Number(freeLimits.freeDailyExplanations ?? 5)
        : Number(freeLimits.anonDailyExplanations ?? 2);
    } else if (feature === 'practice_set') {
      limit = userId ? Number(freeLimits.freeDailyPracticeSets ?? 1) : 0;
    }
  }

  const actionName = ACTION_MAP[feature] || 'PYQ_DEEP_DIVE_VIEW';
  const where = {
    action: actionName,
    createdAt: { gte: start, lt: end },
    ...(userId ? { userId } : { entityType: `ANON_${anonHash}` }),
  };

  const logs = await prisma.actionLog.findMany({
    where,
    select: { entityId: true },
  });

  // For deep_dive, deduplicate by entityId (questionId) so re-viewing an already unlocked question today is free
  const unlockedIds = Array.from(new Set(logs.map((l) => l.entityId).filter(Boolean)));
  const used = feature === 'deep_dive' ? unlockedIds.length : logs.length;
  const remaining = limit == null ? null : Math.max(0, limit - used);
  const allowed = isPro || !gatingEnabled || limit == null || used < limit;

  return {
    feature,
    dayKey,
    authenticated: Boolean(userId),
    userId,
    anonHash,
    isPro,
    validUntil: tierStatus.validUntil,
    gatingEnabled,
    used,
    limit,
    remaining,
    allowed,
    unlockedIds,
    freeLimits,
  };
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const feature = searchParams.get('feature') || 'deep_dive';
    const state = await computeUsageState(req, feature);
    return NextResponse.json(state);
  } catch (error) {
    console.error('[Monetisation Usage GET Error]:', error);
    return NextResponse.json({ error: 'Failed to check usage' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const feature = body?.feature || 'deep_dive';
    const entityId = body?.entityId ? String(body.entityId) : null;

    const state = await computeUsageState(req, feature);

    // If question was already unlocked today, allow without incrementing
    if (feature === 'deep_dive' && entityId && state.unlockedIds.includes(entityId)) {
      return NextResponse.json({ ...state, allowed: true, alreadyUnlocked: true });
    }

    if (!state.allowed) {
      return NextResponse.json(
        {
          ...state,
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
      const actionName = ACTION_MAP[feature] || 'PYQ_DEEP_DIVE_VIEW';
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
    return NextResponse.json({ ...updatedState, allowed: true });
  } catch (error) {
    console.error('[Monetisation Usage POST Error]:', error);
    return NextResponse.json({ error: 'Failed to record usage' }, { status: 500 });
  }
}
