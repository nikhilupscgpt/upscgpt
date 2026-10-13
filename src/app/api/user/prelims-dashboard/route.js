import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { isNewPatternQuestion } from '@/lib/pyqPattern';

export const dynamic = 'force-dynamic';

const SUBJECT_ORDER = [
  'Indian Polity',
  'Economy',
  'Geography',
  'Environment',
  'Science & Technology',
  'Modern History',
  'Ancient History',
  'Medieval History',
  'Art & Culture',
  'Agriculture',
];

const SUBJECT_META = {
  'Indian Polity': { icon: '🏛️', color: '#3b82f6', short: 'Polity' },
  'Economy': { icon: '📈', color: '#10b981', short: 'Economy' },
  'Geography': { icon: '🌍', color: '#06b6d4', short: 'Geography' },
  'Environment': { icon: '🌿', color: '#22c55e', short: 'Environment' },
  'Science & Technology': { icon: '🔬', color: '#8b5cf6', short: 'Sci & Tech' },
  'Modern History': { icon: '📜', color: '#f59e0b', short: 'Modern Hist' },
  'Ancient History': { icon: '🏺', color: '#d97706', short: 'Ancient Hist' },
  'Medieval History': { icon: '🏰', color: '#b45309', short: 'Medieval Hist' },
  'Art & Culture': { icon: '🎨', color: '#ec4899', short: 'Art & Culture' },
  'Agriculture': { icon: '🌾', color: '#84cc16', short: 'Agriculture' },
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id || session.user.email;

    // 1. Fetch Subject Group Counts & Question IDs Mapping
    const [subjectGroups, drafts, recentAttempts] = await Promise.all([
      prisma.questionDraft.groupBy({
        by: ['srcSubject'],
        _count: { id: true },
      }),
      prisma.questionDraft.findMany({
        select: {
          id: true,
          srcSubject: true,
          srcTopic: true,
          stem: true,
        },
      }),
      prisma.attempt.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
        take: 5,
        include: {
          testPaper: { select: { title: true, type: true } },
          _count: { select: { answers: true } },
        },
      }).catch(() => []),
    ]);

    // Build question-to-subject mapping so client can easily compute stats
    const questionSubjectMap = {};
    const subjectQuestionIds = {};
    let totalNewPattern = 0;

    for (const q of drafts) {
      const subj = q.srcSubject || 'General';
      questionSubjectMap[q.id] = subj;
      if (!subjectQuestionIds[subj]) subjectQuestionIds[subj] = [];
      subjectQuestionIds[subj].push(q.id);

      if (isNewPatternQuestion(q)) {
        totalNewPattern++;
      }
    }

    const countsBySubject = {};
    subjectGroups.forEach(g => {
      countsBySubject[g.srcSubject] = g._count.id;
    });

    const subjects = SUBJECT_ORDER.map(name => ({
      name,
      short: SUBJECT_META[name]?.short || name,
      icon: SUBJECT_META[name]?.icon || '📚',
      color: SUBJECT_META[name]?.color || '#3b82f6',
      totalCount: countsBySubject[name] || 0,
      questionIds: subjectQuestionIds[name] || [],
    }));

    return NextResponse.json({
      success: true,
      totalQuestions: drafts.length,
      totalNewPattern,
      subjects,
      questionSubjectMap,
      recentAttempts: recentAttempts.map(a => ({
        id: a.id,
        mode: a.mode,
        title: a.testPaper?.title || 'Practice Drill',
        score: a.score,
        totalAnswered: a._count?.answers || 0,
        startedAt: a.startedAt,
        submittedAt: a.submittedAt,
      })),
    });
  } catch (error) {
    console.error('[Prelims Dashboard API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
