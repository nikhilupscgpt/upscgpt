import { prisma, withRetry } from './prisma.js';

/**
 * UPSC Stem Boilerplate phrases to remove before token matching.
 */
const BOILERPLATE_REGEX = [
  /consider the following statements\s*:?/gi,
  /which of the following statements\s*:?/gi,
  /which of the statements given above is\/are correct\s*\??/gi,
  /which of the following is correct in respect of the above statements\s*\??/gi,
  /which one of the following is the correct\s*:?/gi,
  /which one of the following\s*:?/gi,
  /with reference to\s+/gi,
  /in the context of\s+/gi,
  /statement-i\s*:?/gi,
  /statement-ii\s*:?/gi,
  /select the correct answer using the code given below\s*:?/gi,
  /select the correct answer\s*:?/gi,
  /correct answer\s*:?/gi,
];

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'which', 'what', 'who', 'whom', 'this', 'that', 'these', 'those', 'there', 'their', 'they',
  'it', 'its', 'can', 'could', 'shall', 'should', 'will', 'would', 'may', 'might', 'must',
  'under', 'above', 'below', 'between', 'among', 'through', 'during', 'before', 'after',
  'not', 'no', 'nor', 'only', 'both', 'either', 'neither', 'also', 'such', 'like', 'same',
  'other', 'any', 'all', 'some', 'each', 'every', 'own', 'same', 'so', 'than', 'too', 'very',
  'india', 'indian', 'government', 'country', 'state', 'national', 'act', 'code', 'given',
  'following', 'statement', 'statements', 'correct', 'incorrect', 'respect', 'reference',
]);

/**
 * Clean text and extract high-signal conceptual tokens.
 */
export function extractConceptTokens(text) {
  if (!text || typeof text !== 'string') return [];
  let cleaned = text.toLowerCase();
  for (const regex of BOILERPLATE_REGEX) {
    cleaned = cleaned.replace(regex, ' ');
  }
  // Replace non-alphanumeric with spaces
  cleaned = cleaned.replace(/[^a-z0-9\s-]/g, ' ');

  const rawTokens = cleaned.split(/\s+/).filter(Boolean);
  const meaningful = [];
  const seen = new Set();

  for (const t of rawTokens) {
    if (t.length >= 3 && !STOPWORDS.has(t) && !seen.has(t)) {
      seen.add(t);
      meaningful.push(t);
    }
  }
  return meaningful;
}

/**
 * Searches and scores candidate similar PYQs for a given question.
 */
export async function findSimilarPyqCandidates(questionIdOrDedup, options = {}) {
  const limit = options.limit || 5;

  const target = await withRetry(() =>
    prisma.question.findFirst({
      where: {
        OR: [{ id: questionIdOrDedup }, { dedupHash: questionIdOrDedup }],
      },
      include: {
        subject: { select: { id: true, name: true, slug: true } },
        topic: { select: { id: true, name: true, slug: true } },
      },
    })
  );

  if (!target) {
    throw new Error(`Question ${questionIdOrDedup} not found`);
  }

  const targetTokens = extractConceptTokens(target.stem);
  const targetYear = target.examYear || 0;
  const targetSubjectId = target.subjectId;
  const targetTopicId = target.topicId;

  // Search candidate pool: prefer same subject, different year
  const candidates = await withRetry(() =>
    prisma.question.findMany({
      where: {
        id: { not: target.id },
        ...(targetSubjectId ? { subjectId: targetSubjectId } : {}),
      },
      select: {
        id: true,
        dedupHash: true,
        examName: true,
        examYear: true,
        stem: true,
        options: true,
        correctLabel: true,
        subjectId: true,
        topicId: true,
        analysis: true,
        subject: { select: { name: true } },
        topic: { select: { name: true } },
      },
      take: 400,
    })
  );

  const scored = [];

  for (const c of candidates) {
    const cTokens = extractConceptTokens(c.stem);
    const sharedTokens = targetTokens.filter((t) => cTokens.includes(t));

    if (sharedTokens.length === 0) continue;

    let score = sharedTokens.length * 3;

    // Bonus for same topic
    if (targetTopicId && c.topicId && targetTopicId === c.topicId) {
      score += 6;
    }

    // Bonus for different exam year (cross-year pattern)
    if (targetYear && c.examYear && targetYear !== c.examYear) {
      score += 4;
    }

    // Deduct if same exam year (rarely a "similar predecessor/successor" if in same year)
    if (targetYear && c.examYear && targetYear === c.examYear) {
      score -= 2;
    }

    scored.push({
      id: c.id,
      dedupHash: c.dedupHash,
      examName: c.examName || 'UPSC CSE Pre',
      examYear: c.examYear || null,
      subject: c.subject?.name || 'General Studies',
      topic: c.topic?.name || 'Related Topic',
      stem: c.stem,
      options: c.options,
      correctLabel: c.correctLabel,
      score,
      sharedTokens: sharedTokens.slice(0, 5),
      matchReason: `Shared concepts: ${sharedTokens.slice(0, 4).map((t) => `"${t}"`).join(', ')}`,
      alreadyAttached:
        target.analysis?.similarPyq?.targetId === c.id ||
        target.analysis?.similarPyq?.targetId === c.dedupHash,
    });
  }

  scored.sort((a, b) => b.score - a.score);

  return {
    target: {
      id: target.id,
      dedupHash: target.dedupHash,
      examName: target.examName,
      examYear: target.examYear,
      subject: target.subject?.name,
      topic: target.topic?.name,
      stem: target.stem,
      analysis: target.analysis,
      currentSimilarPyq: target.analysis?.similarPyq || null,
      isVerified: !!target.analysis?.similarPyq?.isVerified,
    },
    candidates: scored.slice(0, limit),
  };
}

/**
 * Attaches a similar PYQ to a question's analysis JSON.
 */
export async function attachSimilarPyq({
  questionId,
  targetId,
  keyTakeaway,
  isVerified = true,
}) {
  const [sourceQ, targetQ] = await Promise.all([
    withRetry(() =>
      prisma.question.findFirst({
        where: { OR: [{ id: questionId }, { dedupHash: questionId }] },
      })
    ),
    withRetry(() =>
      prisma.question.findFirst({
        where: { OR: [{ id: targetId }, { dedupHash: targetId }] },
        include: {
          topic: { select: { name: true } },
          subject: { select: { name: true } },
        },
      })
    ),
  ]);

  if (!sourceQ) throw new Error(`Source question ${questionId} not found`);
  if (!targetQ) throw new Error(`Target question ${targetId} not found`);

  const similarPyqPayload = {
    targetId: targetQ.dedupHash || targetQ.id,
    questionId: targetQ.id,
    examName: targetQ.examName || 'UPSC CSE Pre',
    examYear: targetQ.examYear || null,
    srcTopic: targetQ.topic?.name || targetQ.subject?.name || 'Related Theme',
    stem: targetQ.stem,
    keyTakeaway: keyTakeaway || `Direct concept predecessor in UPSC ${targetQ.examYear || ''}.`,
    isVerified,
    verifiedAt: new Date().toISOString(),
  };

  const currentAnalysis =
    typeof sourceQ.analysis === 'object' && sourceQ.analysis !== null
      ? { ...sourceQ.analysis }
      : {};

  // Store both single similarPyq (for backward compatibility) and array similarPyqs
  currentAnalysis.similarPyq = similarPyqPayload;

  const existingArray = Array.isArray(currentAnalysis.similarPyqs)
    ? [...currentAnalysis.similarPyqs]
    : [];
  const filteredArray = existingArray.filter(
    (item) => item.targetId !== similarPyqPayload.targetId && item.questionId !== targetQ.id
  );
  filteredArray.unshift(similarPyqPayload);
  currentAnalysis.similarPyqs = filteredArray.slice(0, 3); // Keep top 3 family links

  await withRetry(() =>
    prisma.question.update({
      where: { id: sourceQ.id },
      data: { analysis: currentAnalysis },
    })
  );

  return { success: true, similarPyq: similarPyqPayload };
}

/**
 * Detaches / removes a similar PYQ from a question's analysis.
 */
export async function detachSimilarPyq({ questionId, targetId }) {
  const sourceQ = await withRetry(() =>
    prisma.question.findFirst({
      where: { OR: [{ id: questionId }, { dedupHash: questionId }] },
    })
  );

  if (!sourceQ) throw new Error(`Source question ${questionId} not found`);

  const currentAnalysis =
    typeof sourceQ.analysis === 'object' && sourceQ.analysis !== null
      ? { ...sourceQ.analysis }
      : {};

  if (!targetId || currentAnalysis.similarPyq?.targetId === targetId || currentAnalysis.similarPyq?.questionId === targetId) {
    currentAnalysis.similarPyq = null;
  }

  if (Array.isArray(currentAnalysis.similarPyqs)) {
    currentAnalysis.similarPyqs = currentAnalysis.similarPyqs.filter(
      (item) => item.targetId !== targetId && item.questionId !== targetId
    );
    if (currentAnalysis.similarPyqs.length > 0 && !currentAnalysis.similarPyq) {
      currentAnalysis.similarPyq = currentAnalysis.similarPyqs[0];
    }
  }

  await withRetry(() =>
    prisma.question.update({
      where: { id: sourceQ.id },
      data: { analysis: currentAnalysis },
    })
  );

  return { success: true };
}

/**
 * Searches across questions for manual similar PYQ selection.
 */
export async function searchQuestionsForFamily({ query, subject, excludeId, limit = 10 }) {
  const q = (query || '').trim();
  const where = {};

  if (excludeId) {
    where.id = { not: excludeId };
  }

  if (subject && subject !== 'ALL') {
    where.subject = { name: { equals: subject, mode: 'insensitive' } };
  }

  if (q) {
    where.OR = [
      { stem: { contains: q, mode: 'insensitive' } },
      { dedupHash: { contains: q, mode: 'insensitive' } },
      { topic: { name: { contains: q, mode: 'insensitive' } } },
    ];
  }

  const results = await withRetry(() =>
    prisma.question.findMany({
      where,
      select: {
        id: true,
        dedupHash: true,
        examName: true,
        examYear: true,
        stem: true,
        subject: { select: { name: true } },
        topic: { select: { name: true } },
      },
      orderBy: [{ examYear: 'desc' }, { id: 'asc' }],
      take: limit,
    })
  );

  return results;
}
