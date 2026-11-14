import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { buildEnvAtlasQuiz } from '@/lib/analytics/grading';
import { getEnvAtlasItems } from '@/lib/env-atlas-engine';
import { emitServerEvent } from '@/lib/analytics/server';

export const dynamic = 'force-dynamic';

const ALLOWED_MODULES = new Set([
  'pyq_practice',
  'daily_drill',
  'mock',
  'env_atlas',
  'map_quiz',
  'test_pack',
]);

function getAnonId(req) {
  return (
    req.cookies?.get('upsc_anon_id')?.value ||
    req.headers.get('x-anon-id') ||
    null
  );
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;
    let anonId = getAnonId(req);
    let generatedAnonCookie = false;
    if (!userId && !anonId) {
      anonId = `anon_${crypto.randomUUID()}`;
      generatedAnonCookie = true;
    }

    const body = await req.json().catch(() => ({}));
    const rawModule = String(body?.module || 'pyq_practice').trim();
    const moduleName = ALLOWED_MODULES.has(rawModule) ? rawModule : 'pyq_practice';
    const mode = moduleName === 'mock' ? 'TEST' : 'PRACTICE';
    const filters = body?.filters && typeof body.filters === 'object' ? body.filters : null;
    const testPaperId = body?.testPaperId ? String(body.testPaperId).slice(0, 64) : null;

    let total = Math.max(0, Math.min(200, Number(body?.total) || 0));
    let ephemeralQuestions = null;
    let publicQuestions = null;

    // For Environment Atlas quiz, generate questions and answer keys on the server.
    if (moduleName === 'env_atlas' && body?.buildQuiz !== false) {
      const count = Math.max(1, Math.min(20, Number(body?.count) || 5));
      const { items } = await getEnvAtlasItems({
        module: body?.atlasModule || 'SPECIES',
        category: body?.category || 'ALL',
      });
      const built = buildEnvAtlasQuiz(items, count);
      publicQuestions = built.publicQuestions;
      ephemeralQuestions = built.ephemeralQuestions;
      total = publicQuestions.length;
    }

    const attempt = await prisma.attempt.create({
      data: {
        userId,
        anonId,
        mode,
        module: moduleName,
        testPaperId,
        filterSpec: filters,
        filters,
        ephemeralQuestions,
        total,
      },
      select: {
        id: true,
        module: true,
        total: true,
        startedAt: true,
      },
    });

    const isQuiz = moduleName === 'env_atlas' || moduleName === 'map_quiz';
    emitServerEvent({
      name: isQuiz ? 'quiz_start' : 'practice_start',
      props: isQuiz
        ? { module: moduleName, entityId: String(filters?.entityId || moduleName), attemptId: attempt.id }
        : { module: moduleName, attemptId: attempt.id, total: Math.max(1, attempt.total || 1) },
      userId,
      anonId,
      tier: session?.user?.tier || null,
      module: moduleName,
      userAgent: req.headers.get('user-agent'),
    }).catch(() => {});

    const res = NextResponse.json({
      attemptId: attempt.id,
      module: attempt.module,
      total: attempt.total,
      startedAt: attempt.startedAt,
      ...(publicQuestions ? { questions: publicQuestions } : {}),
    });

    if (generatedAnonCookie && anonId) {
      res.cookies.set('upsc_anon_id', anonId, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    return res;
  } catch (err) {
    console.error('[POST /api/attempts] Error:', err);
    return NextResponse.json({ error: 'Failed to start attempt' }, { status: 500 });
  }
}
