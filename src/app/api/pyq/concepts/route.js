import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  normalizeKeywordsList,
  slugifyKeyword,
  getBaseKeywordTerm,
  cleanKeywordText,
} from '@/lib/pyqKeywords';

export const dynamic = 'force-dynamic';

const CONCEPT_KEY_PREFIX = 'pyq_concept:';

function parseOptions(rawOptions) {
  if (Array.isArray(rawOptions)) return rawOptions;
  if (typeof rawOptions === 'string') {
    try {
      const parsed = JSON.parse(rawOptions);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return [];
}

function extractKeywordsFromExplanation(rawExp) {
  if (!rawExp || typeof rawExp !== 'string') return [];
  const trimmed = rawExp.trim();
  if (!trimmed.startsWith('{')) return [];
  try {
    const parsed = JSON.parse(trimmed);
    const analysis = parsed.analysis || (parsed.keywords ? parsed : null);
    if (!analysis || !Array.isArray(analysis.keywords)) return [];
    return normalizeKeywordsList(analysis.keywords);
  } catch {
    return [];
  }
}

/**
 * Builds the aggregated Concept Map across all enriched QuestionDrafts
 * and merges any Admin-saved Concept overrides from PlatformConfig.
 */
async function buildConceptMap({ subjectFilter = 'ALL' } = {}) {
  const whereDrafts = {
    explanation: { startsWith: '{' },
  };
  if (subjectFilter && subjectFilter !== 'ALL') {
    whereDrafts.srcSubject = subjectFilter;
  }

  const [drafts, configRows] = await Promise.all([
    prisma.questionDraft.findMany({
      where: whereDrafts,
      select: {
        id: true,
        dedupHash: true,
        questionNo: true,
        examName: true,
        examYear: true,
        srcSubject: true,
        srcTopic: true,
        stem: true,
        options: true,
        correctLabel: true,
        explanation: true,
      },
      orderBy: [{ examYear: 'desc' }, { questionNo: 'asc' }],
    }),
    prisma.platformConfig.findMany({
      where: {
        key: { startsWith: CONCEPT_KEY_PREFIX },
      },
    }),
  ]);

  const conceptMap = new Map();

  // 1. Seed from QuestionDrafts with structured analysis.keywords
  for (const q of drafts) {
    const kws = extractKeywordsFromExplanation(q.explanation);
    if (kws.length === 0) continue;

    for (const kw of kws) {
      const existing = conceptMap.get(kw.slug);
      if (!existing) {
        conceptMap.set(kw.slug, {
          slug: kw.slug,
          term: kw.term,
          shortNote: kw.shortNote || '',
          longContent: kw.longContent || '',
          subject: q.srcSubject || 'General Studies',
          topic: q.srcTopic || 'General',
          questionsMap: new Map([[q.id, q]]),
          yearsSet: new Set(q.examYear ? [q.examYear] : []),
        });
      } else {
        if (
          kw.shortNote &&
          kw.shortNote.length > (existing.shortNote || '').length
        ) {
          existing.shortNote = kw.shortNote;
        }
        if (
          kw.longContent &&
          kw.longContent.length > (existing.longContent || '').length
        ) {
          existing.longContent = kw.longContent;
        }
        existing.questionsMap.set(q.id, q);
        if (q.examYear) existing.yearsSet.add(q.examYear);
      }
    }
  }

  // 2. Merge Admin-saved Concept Overrides / Long-form Content from PlatformConfig
  for (const row of configRows) {
    const slug = row.key.slice(CONCEPT_KEY_PREFIX.length);
    if (!slug) continue;
    try {
      const saved = JSON.parse(row.value);
      const existing = conceptMap.get(slug);
      if (existing) {
        if (saved.term) existing.term = saved.term;
        if (saved.shortNote) existing.shortNote = saved.shortNote;
        if (saved.longContent !== undefined) {
          existing.longContent = saved.longContent;
        }
        if (saved.subject) existing.subject = saved.subject;
        if (saved.topic) existing.topic = saved.topic;
      } else {
        if (
          subjectFilter &&
          subjectFilter !== 'ALL' &&
          saved.subject &&
          saved.subject !== subjectFilter
        ) {
          continue;
        }
        conceptMap.set(slug, {
          slug,
          term: saved.term || slug,
          shortNote: saved.shortNote || '',
          longContent: saved.longContent || '',
          subject: saved.subject || 'General Studies',
          topic: saved.topic || 'General',
          questionsMap: new Map(),
          yearsSet: new Set(),
        });
      }
    } catch {
      // Ignore malformed JSON
    }
  }

  return conceptMap;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slugParam = (searchParams.get('slug') || '').trim();
    const termParam = (searchParams.get('term') || '').trim();
    const shortNoteParam = (searchParams.get('shortNote') || '').trim();
    const query = (searchParams.get('q') || '').trim();
    const subject = (searchParams.get('subject') || 'ALL').trim();

    const conceptMap = await buildConceptMap({
      subjectFilter: slugParam || termParam ? 'ALL' : subject,
    });

    // MODE 1: Single Concept Detail + All Associated PYQs
    if (slugParam || termParam) {
      const targetSlug = slugParam || slugifyKeyword(termParam);
      let concept = conceptMap.get(targetSlug);

      // Fuzzy match if exact slug not found (e.g., base term match)
      if (!concept && termParam) {
        const baseSlug = slugifyKeyword(getBaseKeywordTerm(termParam));
        for (const [kSlug, val] of conceptMap.entries()) {
          if (
            kSlug === baseSlug ||
            kSlug.startsWith(baseSlug + '-') ||
            slugifyKeyword(getBaseKeywordTerm(val.term)) === baseSlug
          ) {
            concept = val;
            break;
          }
        }
      }

      if (!concept) {
        concept = {
          slug: targetSlug,
          term: termParam || targetSlug,
          shortNote: shortNoteParam || '',
          longContent: '',
          subject: subject !== 'ALL' ? subject : 'General Studies',
          topic: 'Conceptual Theme',
          questionsMap: new Map(),
          yearsSet: new Set(),
        };
      } else if (shortNoteParam && !concept.shortNote) {
        concept.shortNote = shortNoteParam;
      }

      // Also discover any other PYQs in the database that mention the base term in their stem/explanation
      const baseTerm = getBaseKeywordTerm(concept.term);
      if (baseTerm && baseTerm.length >= 4) {
        const additionalDrafts = await prisma.questionDraft.findMany({
          where: {
            OR: [
              { stem: { contains: baseTerm, mode: 'insensitive' } },
              { explanation: { contains: baseTerm, mode: 'insensitive' } },
            ],
          },
          take: 25,
          orderBy: [{ examYear: 'desc' }, { questionNo: 'asc' }],
          select: {
            id: true,
            dedupHash: true,
            questionNo: true,
            examName: true,
            examYear: true,
            srcSubject: true,
            srcTopic: true,
            stem: true,
            options: true,
            correctLabel: true,
            explanation: true,
          },
        });

        for (const ad of additionalDrafts) {
          if (!concept.questionsMap.has(ad.id)) {
            concept.questionsMap.set(ad.id, ad);
            if (ad.examYear) concept.yearsSet.add(ad.examYear);
          }
        }
      }

      const associatedQuestions = Array.from(concept.questionsMap.values())
        .sort((a, b) => (b.examYear || 0) - (a.examYear || 0))
        .map(q => ({
          id: q.id,
          dedupHash: q.dedupHash,
          questionNo: q.questionNo,
          examName: q.examName || 'UPSC CSE Pre',
          examYear: q.examYear || 2025,
          srcSubject: q.srcSubject || 'General Studies',
          srcTopic: q.srcTopic || 'General',
          stem: q.stem,
          options: parseOptions(q.options),
          correctLabel: q.correctLabel,
          explanation: q.explanation || null,
        }));

      return NextResponse.json({
        success: true,
        concept: {
          slug: concept.slug,
          term: concept.term,
          shortNote: concept.shortNote || '',
          longContent: concept.longContent || '',
          subject:
            concept.subject ||
            associatedQuestions[0]?.srcSubject ||
            'General Studies',
          topic:
            concept.topic || associatedQuestions[0]?.srcTopic || 'General',
          questionCount: associatedQuestions.length,
          years: Array.from(concept.yearsSet).sort((a, b) => b - a),
        },
        questions: associatedQuestions,
      });
    }

    // MODE 2: Search / Browse Concepts List
    const qLower = query.toLowerCase();
    const results = [];

    for (const item of conceptMap.values()) {
      if (query) {
        const inTerm = item.term.toLowerCase().includes(qLower);
        const inShort = (item.shortNote || '').toLowerCase().includes(qLower);
        const inLong = (item.longContent || '').toLowerCase().includes(qLower);
        const inTopic = (item.topic || '').toLowerCase().includes(qLower);
        if (!inTerm && !inShort && !inLong && !inTopic) continue;
      }

      results.push({
        slug: item.slug,
        term: item.term,
        shortNote: item.shortNote || '',
        longContent: item.longContent || '',
        hasLongContent: Boolean(item.longContent && item.longContent.trim()),
        subject: item.subject,
        topic: item.topic,
        questionCount: item.questionsMap.size,
        years: Array.from(item.yearsSet).sort((a, b) => b - a),
         matchScore: query
          ? item.term.toLowerCase().startsWith(qLower)
            ? 3
            : item.term.toLowerCase().includes(qLower)
              ? 2
              : 1
          : 1,
      });
    }

    results.sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      if (b.questionCount !== a.questionCount)
        return b.questionCount - a.questionCount;
      return a.term.localeCompare(b.term);
    });

    return NextResponse.json({
      success: true,
      count: results.length,
      concepts: results.slice(0, 30),
    });
  } catch (error) {
    console.error('[API /api/pyq/concepts] GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/pyq/concepts
 * Admin endpoint to save/update a Concept's shortNote and longContent (Long-Form Study Note).
 */
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const rawTerm = cleanKeywordText(body.term || '');
    const slug = (body.slug || slugifyKeyword(rawTerm)).trim();

    if (!slug) {
      return NextResponse.json(
        { error: 'Concept term or slug is required' },
        { status: 400 }
      );
    }

    const key = `${CONCEPT_KEY_PREFIX}${slug}`;
    const existingRow = await prisma.platformConfig.findUnique({
      where: { key },
    });

    let currentVal = {};
    if (existingRow?.value) {
      try {
        currentVal = JSON.parse(existingRow.value);
      } catch {
        currentVal = {};
      }
    }

    const updatedPayload = {
      ...currentVal,
      slug,
      term: rawTerm || currentVal.term || slug,
      shortNote:
        body.shortNote !== undefined
          ? String(body.shortNote).trim()
          : currentVal.shortNote || '',
      longContent:
        body.longContent !== undefined
          ? String(body.longContent).trim()
          : currentVal.longContent || '',
      subject: body.subject || currentVal.subject || 'General Studies',
      topic: body.topic || currentVal.topic || 'General',
      updatedAt: new Date().toISOString(),
    };

    await prisma.platformConfig.upsert({
      where: { key },
      update: { value: JSON.stringify(updatedPayload) },
      create: { key, value: JSON.stringify(updatedPayload) },
    });

    return NextResponse.json({
      success: true,
      concept: updatedPayload,
    });
  } catch (error) {
    console.error('[API /api/pyq/concepts] PATCH error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
