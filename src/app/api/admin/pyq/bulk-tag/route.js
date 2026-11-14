import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireApiRole } from '@/lib/security/requireRole';
import { computeContentStatus, mapExamCode } from '@/lib/pyq/content-status';
import { invalidatePyqTreeCache } from '@/lib/pyq/tree-service';

export const dynamic = 'force-dynamic';

export async function PATCH(req) {
  try {
    const auth = await requireApiRole(['ADMIN']);
    if (auth.response) return auth.response;

    const body = await req.json().catch(() => ({}));
    const ids = Array.isArray(body.ids) ? body.ids.filter((x) => typeof x === 'string' && x.trim()) : [];
    const topicFilter = typeof body.untaggedTopic === 'string' ? body.untaggedTopic.trim() : '';

    const patchFields = {};
    if (typeof body.srcTheme === 'string' && body.srcTheme.trim()) patchFields.srcTheme = body.srcTheme.trim();
    if (typeof body.srcTopic === 'string' && body.srcTopic.trim()) patchFields.srcTopic = body.srcTopic.trim();
    if (typeof body.difficulty === 'string' && body.difficulty.trim()) patchFields.difficulty = body.difficulty.trim();
    if (typeof body.examCode === 'string' && ['UPSC_CSE_PRE', 'CDS_I', 'CDS_II', 'CDS'].includes(body.examCode)) {
      patchFields.examCode = body.examCode;
    }

    if (Object.keys(patchFields).length === 0) {
      return NextResponse.json({ error: 'No valid tag fields provided' }, { status: 400 });
    }

    let where;
    if (ids.length > 0) {
      where = { id: { in: ids } };
    } else if (topicFilter) {
      where = {
        srcTopic: topicFilter,
        OR: [{ srcTheme: null }, { srcTheme: '' }],
      };
    } else {
      return NextResponse.json({ error: 'Provide ids or untaggedTopic' }, { status: 400 });
    }

    const targets = await prisma.questionDraft.findMany({
      where,
      select: {
        id: true,
        correctLabel: true,
        options: true,
        explanation: true,
        explanationJson: true,
        srcTheme: true,
        difficulty: true,
        examCode: true,
        examName: true,
      },
    });

    if (targets.length === 0) {
      return NextResponse.json({ updated: 0 });
    }

    const actorId = auth.session?.user?.id || 'admin';

    await prisma.$transaction(
      targets.map((row) => {
        const nextTheme = patchFields.srcTheme ?? row.srcTheme;
        const nextDiff = patchFields.difficulty ?? row.difficulty;
        const nextExamCode = patchFields.examCode ?? row.examCode ?? mapExamCode(row.examName);
        const { contentStatus, missingFlags } = computeContentStatus({
          correctLabel: row.correctLabel,
          options: row.options,
          explanation: row.explanation,
          explanationJson: row.explanationJson,
          srcTheme: nextTheme,
          difficulty: nextDiff,
          examCode: nextExamCode,
          examName: row.examName,
        });
        return prisma.questionDraft.update({
          where: { id: row.id },
          data: {
            ...patchFields,
            examCode: nextExamCode,
            contentStatus,
            missingFlags,
            updatedById: actorId,
          },
        });
      }),
    );

    await prisma.auditLog.create({
      data: {
        actorId,
        action: 'QUESTION_EDITED',
        entity: 'QuestionDraft',
        entityId: targets.map((t) => t.id).slice(0, 5).join(','),
        before: { count: targets.length, filter: topicFilter || 'selected_ids' },
        after: patchFields,
      },
    });

    invalidatePyqTreeCache();
    return NextResponse.json({ updated: targets.length });
  } catch (err) {
    console.error('[PATCH /api/admin/pyq/bulk-tag] Error:', err);
    return NextResponse.json({ error: 'Failed to bulk tag questions' }, { status: 500 });
  }
}
