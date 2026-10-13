import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { isNewPatternQuestion } from '@/lib/pyqPattern';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    const attemptedIds = new Set(Array.isArray(body.attemptedIds) ? body.attemptedIds : []);
    const focusSubjects = Array.isArray(body.focusSubjects) && body.focusSubjects.length > 0
      ? body.focusSubjects
      : ['Indian Polity', 'Economy'];
    const targetCount = Math.min(Math.max(parseInt(body.targetCount, 10) || 13, 5), 35);

    // Fetch all active question drafts with valid answer keys
    const allQuestions = await prisma.questionDraft.findMany({
      where: { correctLabel: { not: null } },
      select: {
        id: true,
        srcSubject: true,
        examYear: true,
        stem: true,
      },
      orderBy: [{ examYear: 'desc' }, { questionNo: 'asc' }],
    });

    // Partition unattempted vs already attempted
    const unattempted = [];
    const attempted = [];

    for (const q of allQuestions) {
      if (attemptedIds.has(q.id)) {
        attempted.push(q);
      } else {
        unattempted.push(q);
      }
    }

    // Pool to draw from (prefer unattempted, fall back to attempted if exhausted)
    const pool = unattempted.length >= targetCount ? unattempted : [...unattempted, ...attempted];

    // Split pool into focus subjects vs other subjects
    const focusPool = pool.filter(q => focusSubjects.includes(q.srcSubject));
    const otherPool = pool.filter(q => !focusSubjects.includes(q.srcSubject));

    // Allocate 60% to focus subjects, 40% to other subjects
    const focusTarget = Math.round(targetCount * 0.6);
    const otherTarget = targetCount - focusTarget;

    const pickedIds = [];
    const pickedSet = new Set();

    // 1. Pick from focus subjects
    for (const q of focusPool) {
      if (pickedIds.length >= focusTarget) break;
      if (!pickedSet.has(q.id)) {
        pickedIds.push(q.id);
        pickedSet.add(q.id);
      }
    }

    // 2. Pick from other subjects
    for (const q of otherPool) {
      if (pickedIds.length >= targetCount) break;
      if (!pickedSet.has(q.id)) {
        pickedIds.push(q.id);
        pickedSet.add(q.id);
      }
    }

    // 3. Fallback fill if not yet reached targetCount
    if (pickedIds.length < targetCount) {
      for (const q of pool) {
        if (pickedIds.length >= targetCount) break;
        if (!pickedSet.has(q.id)) {
          pickedIds.push(q.id);
          pickedSet.add(q.id);
        }
      }
    }

    return NextResponse.json({
      success: true,
      targetCount,
      questionIds: pickedIds,
      focusSubjectCount: pickedIds.filter(id => {
        const q = allQuestions.find(x => x.id === id);
        return q && focusSubjects.includes(q.srcSubject);
      }).length,
    });
  } catch (error) {
    console.error('[API Daily Drill] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
