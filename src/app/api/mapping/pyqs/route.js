import { NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { MAPPING_SUBJECTS, MAP_CATEGORIES } from '@/lib/mapping-engine';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const exam = searchParams.get('exam') || 'ALL'; // ALL | UPSC CSE | CDS
    const subject = searchParams.get('subject') || 'ALL';
    const mapCategory = searchParams.get('mapCategory') || 'ALL';
    const affairsType = searchParams.get('affairsType') || 'ALL';
    const examYear = searchParams.get('examYear') || 'ALL';
    const idsParam = searchParams.get('ids') || '';
    const search = (searchParams.get('search') || '').trim();

    const where = {
      OR: [
        { isMapping: true },
        { mapCategory: { isEmpty: false } },
        {
          subject: {
            name: {
              in: [
                'Geography',
                'Environment',
                'Environment & Ecology',
                'Art & Culture',
                'Ancient History',
                'Medieval History',
                'Modern History',
                'Agriculture',
              ],
            },
          },
        },
      ],
    };

    if (idsParam) {
      const ids = idsParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (ids.length > 0) {
        where.AND = [
          {
            OR: [
              { id: { in: ids } },
              { dedupHash: { in: ids } },
            ],
          },
        ];
      }
    }

    if (exam !== 'ALL') {
      if (exam === 'UPSC CSE' || exam === 'CSE') {
        where.examName = { contains: 'UPSC', mode: 'insensitive' };
      } else if (exam === 'CDS') {
        where.examName = { contains: 'CDS', mode: 'insensitive' };
      } else {
        where.examName = { equals: exam, mode: 'insensitive' };
      }
    }

    if (subject !== 'ALL') {
      where.subject = { name: subject };
    }

    if (mapCategory !== 'ALL') {
      where.mapCategory = { has: mapCategory };
    }

    if (affairsType !== 'ALL') {
      where.affairsType = affairsType;
    }

    if (examYear !== 'ALL' && !Number.isNaN(Number(examYear))) {
      where.examYear = Number(examYear);
    }

    if (search) {
      const searchCondition = {
        OR: [
          { stem: { contains: search, mode: 'insensitive' } },
          { dedupHash: { contains: search, mode: 'insensitive' } },
          { answerText: { contains: search, mode: 'insensitive' } },
        ],
      };
      if (where.AND) {
        where.AND.push(searchCondition);
      } else {
        where.AND = [searchCondition];
      }
    }

    const questions = await withRetry(() =>
      prisma.question.findMany({
        where,
        select: {
          id: true,
          dedupHash: true,
          examName: true,
          examYear: true,
          stem: true,
          options: true,
          correctLabel: true,
          answerText: true,
          explanation: true,
          analysis: true,
          mapCategory: true,
          affairsType: true,
          newsLagMonths: true,
          mappingSelection: true,
          isMapping: true,
          subject: {
            select: {
              name: true,
            },
          },
        },
        orderBy: [{ examYear: 'desc' }, { id: 'asc' }],
      })
    );

    const formatted = questions.map((q) => {
      let ansText = q.answerText;
      if (!ansText && Array.isArray(q.options)) {
        const correctOpt = q.options.find(
          (o) => (o.label || '').toLowerCase() === (q.correctLabel || '').toLowerCase()
        );
        if (correctOpt) ansText = correctOpt.text;
      }
      return {
        id: q.dedupHash || q.id,
        questionId: q.id,
        exam: q.examName === 'UPSC CSE Pre' ? 'UPSC CSE Prelims' : (q.examName || 'UPSC CSE Prelims'),
        examYear: q.examYear || 2024,
        subject: q.subject?.name || 'Geography',
        mapCategory: q.mapCategory || [],
        affairsType: q.affairsType || null,
        newsLagMonths: q.newsLagMonths || null,
        selection: q.mappingSelection || null,
        stem: q.stem,
        options: q.options || [],
        correctLabel: q.correctLabel,
        answerText: ansText,
        explanation: q.explanation || null,
        analysis: q.analysis || null,
      };
    });

    return NextResponse.json({
      count: formatted.length,
      pyqs: formatted,
      taxonomy: {
        subjects: MAPPING_SUBJECTS,
        mapCategories: MAP_CATEGORIES,
      },
    });
  } catch (err) {
    console.error('[GET /api/mapping/pyqs] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch Mapping PYQs' },
      { status: 500 }
    );
  }
}
