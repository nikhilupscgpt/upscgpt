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
  'best', 'reflects', 'chief', 'purpose', 'factors', 'provisions', 'described', 'context',
  'meaning', 'regarding', 'defined', 'implies', 'refers', 'characteristic', 'features',
  'term', 'concept', 'associated', 'constitutes', 'safeguard', 'relates', 'held', 'passed'
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
 * Searches and scores candidate similar PYQs for a given question (published or draft).
 */
export async function findSimilarPyqCandidates(questionIdOrDedup, options = {}) {
  const limit = options.limit || 5;

  let target = await withRetry(() =>
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

  let isDraft = false;
  if (!target) {
    const draft = await withRetry(() =>
      prisma.questionDraft.findFirst({
        where: {
          OR: [{ id: questionIdOrDedup }, { dedupHash: questionIdOrDedup }],
        },
      })
    );

    if (draft) {
      isDraft = true;
      let draftAnalysis = null;
      if (typeof draft.explanation === 'string' && draft.explanation.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(draft.explanation);
          draftAnalysis = parsed.analysis || null;
        } catch {}
      }
      target = {
        id: draft.id,
        dedupHash: draft.dedupHash,
        examName: draft.examName,
        examYear: draft.examYear,
        subjectId: draft.subjectId,
        topicId: draft.topicId,
        subjectName: draft.srcSubject,
        topicName: draft.srcTopic,
        subject: { name: draft.srcSubject },
        topic: { name: draft.srcTopic },
        stem: draft.stem,
        options: draft.options,
        correctLabel: draft.correctLabel,
        analysis: draftAnalysis,
      };
    }
  }

  if (!target) {
    throw new Error(`Question ${questionIdOrDedup} not found`);
  }

  const targetTokens = extractConceptTokens(target.stem);
  const targetYear = target.examYear || 0;
  const targetSubjectId = target.subjectId;
  const targetTopicId = target.topicId;
  const targetSubjectName = target.subject?.name || target.subjectName || '';

  // Search candidate pool: first try same subject ID or name, else general pool
  let candidates = [];
  const candidateWhere = {
    id: { not: target.id },
  };

  if (targetSubjectId) {
    candidateWhere.subjectId = targetSubjectId;
  } else if (targetSubjectName) {
    candidateWhere.subject = { name: { contains: targetSubjectName.split(' ')[0], mode: 'insensitive' } };
  }

  candidates = await withRetry(() =>
    prisma.question.findMany({
      where: candidateWhere,
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
      take: 600,
    })
  );

  // If subject filtering returned very few questions, widen search to all published questions
  if (candidates.length < 20) {
    candidates = await withRetry(() =>
      prisma.question.findMany({
        where: { id: { not: target.id } },
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
        take: 600,
      })
    );
  }

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
  let [sourceQ, targetQ] = await Promise.all([
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

  let isDraft = false;
  if (!sourceQ) {
    sourceQ = await withRetry(() =>
      prisma.questionDraft.findFirst({
        where: { OR: [{ id: questionId }, { dedupHash: questionId }] },
      })
    );
    if (sourceQ) isDraft = true;
  }

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

  let currentAnalysis = {};
  let draftData = {};

  if (isDraft) {
    if (typeof sourceQ.explanation === 'string' && sourceQ.explanation.trim().startsWith('{')) {
      try {
        draftData = JSON.parse(sourceQ.explanation);
        currentAnalysis = draftData.analysis || {};
      } catch {}
    }
  } else {
    currentAnalysis =
      typeof sourceQ.analysis === 'object' && sourceQ.analysis !== null
        ? { ...sourceQ.analysis }
        : {};
  }

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

  if (isDraft) {
    draftData.analysis = currentAnalysis;
    await withRetry(() =>
      prisma.questionDraft.update({
        where: { id: sourceQ.id },
        data: { explanation: JSON.stringify(draftData) },
      })
    );
  } else {
    await withRetry(() =>
      prisma.question.update({
        where: { id: sourceQ.id },
        data: { analysis: currentAnalysis },
      })
    );
  }

  return { success: true, similarPyq: similarPyqPayload };
}

/**
 * Detaches / removes a similar PYQ from a question's analysis.
 */
export async function detachSimilarPyq({ questionId, targetId }) {
  let sourceQ = await withRetry(() =>
    prisma.question.findFirst({
      where: { OR: [{ id: questionId }, { dedupHash: questionId }] },
    })
  );

  let isDraft = false;
  if (!sourceQ) {
    sourceQ = await withRetry(() =>
      prisma.questionDraft.findFirst({
        where: { OR: [{ id: questionId }, { dedupHash: questionId }] },
      })
    );
    if (sourceQ) isDraft = true;
  }

  if (!sourceQ) throw new Error(`Source question ${questionId} not found`);

  let currentAnalysis = {};
  let draftData = {};

  if (isDraft) {
    if (typeof sourceQ.explanation === 'string' && sourceQ.explanation.trim().startsWith('{')) {
      try {
        draftData = JSON.parse(sourceQ.explanation);
        currentAnalysis = draftData.analysis || {};
      } catch {}
    }
  } else {
    currentAnalysis =
      typeof sourceQ.analysis === 'object' && sourceQ.analysis !== null
        ? { ...sourceQ.analysis }
        : {};
  }

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

  if (isDraft) {
    draftData.analysis = currentAnalysis;
    await withRetry(() =>
      prisma.questionDraft.update({
        where: { id: sourceQ.id },
        data: { explanation: JSON.stringify(draftData) },
      })
    );
  } else {
    await withRetry(() =>
      prisma.question.update({
        where: { id: sourceQ.id },
        data: { analysis: currentAnalysis },
      })
    );
  }

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
    const isYear = /^\d{4}$/.test(q);
    if (isYear) {
      where.examYear = parseInt(q, 10);
    } else {
      where.OR = [
        { stem: { contains: q, mode: 'insensitive' } },
        { dedupHash: { contains: q, mode: 'insensitive' } },
        { topic: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }
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

/**
 * Detects cross-year conceptual clusters across UPSC Prelims questions.
 * Groups questions that share high-signal tokens into human-curatable candidate families.
 */
export async function generateSimilarPyqClusters({
  subject = 'ALL',
  status = 'unreviewed', // 'unreviewed', 'verified', 'dismissed', 'all'
  limit = 50,
} = {}) {
  // 1. Fetch dismissed cluster/question IDs from ActionLog
  const dismissedLogs = await withRetry(() =>
    prisma.actionLog.findMany({
      where: { action: 'SIMILAR_PYQ_DISMISSED' },
      select: { entityId: true },
      take: 500,
    })
  ).catch(() => []);

  const dismissedSet = new Set(dismissedLogs.map((l) => l.entityId).filter(Boolean));

  // 2. Fetch question pool
  const where = {};
  if (subject && subject !== 'ALL') {
    where.subject = { name: { contains: subject, mode: 'insensitive' } };
  }

  const pool = await withRetry(() =>
    prisma.question.findMany({
      where,
      select: {
        id: true,
        dedupHash: true,
        examName: true,
        examYear: true,
        questionNo: true,
        stem: true,
        options: true,
        correctLabel: true,
        analysis: true,
        subject: { select: { name: true } },
        topic: { select: { name: true } },
      },
      orderBy: [{ examYear: 'desc' }, { id: 'asc' }],
      take: subject && subject !== 'ALL' ? 300 : 600,
    })
  );

  // 3. Process tokens and document frequency
  const N = pool.length || 1;
  const processed = pool.map((q) => {
    const tokens = extractConceptTokens(q.stem).filter((t) => t.length > 3);
    const isVerified = !!q.analysis?.similarPyq?.isVerified;
    const alreadyLinked =
      Array.isArray(q.analysis?.similarPyqs) && q.analysis.similarPyqs.length > 0;
    return { ...q, tokens, isVerified, alreadyLinked };
  });

  const df = new Map();
  for (const q of processed) {
    for (const t of q.tokens) df.set(t, (df.get(t) || 0) + 1);
  }

  // 4. Inverted index of tokens -> question indices
  const tokenToQIndices = new Map();
  processed.forEach((q, idx) => {
    for (const t of q.tokens) {
      if (!tokenToQIndices.has(t)) tokenToQIndices.set(t, []);
      tokenToQIndices.get(t).push(idx);
    }
  });

  // 5. Build candidate clusters with pairwise multi-token overlap & IDF scoring
  const pairOverlap = new Map();

  for (const [token, indices] of tokenToQIndices.entries()) {
    // Skip words appearing in > 35% of questions in the pool
    if (indices.length > Math.max(12, N * 0.35)) continue;

    for (let i = 0; i < indices.length; i++) {
      for (let j = i + 1; j < indices.length; j++) {
        const idxA = indices[i];
        const idxB = indices[j];
        const qA = processed[idxA];
        const qB = processed[idxB];

        if (qA.examYear === qB.examYear) continue; // Only cross-year matches

        const pairKey = idxA < idxB ? `${idxA}_${idxB}` : `${idxB}_${idxA}`;
        if (!pairOverlap.has(pairKey)) {
          pairOverlap.set(pairKey, { idxA, idxB, tokens: new Set() });
        }
        pairOverlap.get(pairKey).tokens.add(token);
      }
    }
  }

  // Filter pairs with at least 2 shared domain tokens and strong IDF score
  const strongPairs = [];
  for (const [key, pair] of pairOverlap.entries()) {
    if (pair.tokens.size >= 2) {
      let idfScore = 0;
      for (const t of pair.tokens) {
        const docFreq = df.get(t) || 1;
        idfScore += Math.log(N / docFreq) + 2.5;
      }
      if (idfScore >= 8) {
        strongPairs.push({
          idxA: pair.idxA,
          idxB: pair.idxB,
          tokens: Array.from(pair.tokens),
          score: Math.round(idfScore * 10),
        });
      }
    }
  }

  // Sort pairs by score desc
  strongPairs.sort((a, b) => b.score - a.score);

  // 6. Cluster formation with size constraint (max 5 questions per family cluster)
  const clustersList = [];
  const assigned = new Map(); // question index -> cluster index

  for (const pair of strongPairs) {
    const clusterA = assigned.get(pair.idxA);
    const clusterB = assigned.get(pair.idxB);

    if (clusterA === undefined && clusterB === undefined) {
      // New cluster
      const newClusterIdx = clustersList.length;
      clustersList.push({
        qIndices: new Set([pair.idxA, pair.idxB]),
        tokens: new Set(pair.tokens),
        bestScore: pair.score,
      });
      assigned.set(pair.idxA, newClusterIdx);
      assigned.set(pair.idxB, newClusterIdx);
    } else if (clusterA !== undefined && clusterB === undefined) {
      const c = clustersList[clusterA];
      if (c.qIndices.size < 5) {
        c.qIndices.add(pair.idxB);
        pair.tokens.forEach((t) => c.tokens.add(t));
        assigned.set(pair.idxB, clusterA);
      }
    } else if (clusterA === undefined && clusterB !== undefined) {
      const c = clustersList[clusterB];
      if (c.qIndices.size < 5) {
        c.qIndices.add(pair.idxA);
        pair.tokens.forEach((t) => c.tokens.add(t));
        assigned.set(pair.idxA, clusterB);
      }
    } else if (clusterA !== clusterB) {
      // Both already in clusters: merge if combined size <= 5
      const cA = clustersList[clusterA];
      const cB = clustersList[clusterB];
      if (cA && cB && cA.qIndices.size + cB.qIndices.size <= 5) {
        for (const idx of cB.qIndices) {
          cA.qIndices.add(idx);
          assigned.set(idx, clusterA);
        }
        cB.tokens.forEach((t) => cA.tokens.add(t));
        cB.qIndices.clear(); // Empty out merged
      }
    }
  }

  // Format into clusters
  const rawClusters = [];
  let unreviewedCount = 0;
  let verifiedCount = 0;
  let dismissedCount = 0;

  for (const c of clustersList) {
    if (c.qIndices.size < 2) continue;

    const qList = Array.from(c.qIndices).map((idx) => processed[idx]);
    qList.sort((a, b) => (a.examYear || 0) - (b.examYear || 0));

    const sortedIds = qList.map((q) => q.id).sort();
    const clusterId = `cluster_${sortedIds.join('_').slice(0, 48)}`;

    const isDismissed = dismissedSet.has(clusterId) || qList.some((q) => dismissedSet.has(q.id));
    const isClusterVerified = qList.some((q) => q.isVerified);

    let clusterStatus = 'unreviewed';
    if (isDismissed) {
      clusterStatus = 'dismissed';
      dismissedCount++;
    } else if (isClusterVerified) {
      clusterStatus = 'verified';
      verifiedCount++;
    } else {
      unreviewedCount++;
    }

    // Apply status filter
    if (status !== 'all' && clusterStatus !== status) {
      continue;
    }

    const tokenList = Array.from(c.tokens).slice(0, 5);
    const formattedTheme = tokenList
      .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
      .join(', ');

    const subjectName = qList[0].subject?.name || 'General Studies';
    const topicName = qList[0].topic?.name || 'Related Theme';
    const years = Array.from(new Set(qList.map((q) => q.examYear).filter(Boolean)));

    const confidence = Math.min(99, Math.round(72 + tokenList.length * 4 + years.length * 2.5));

    rawClusters.push({
      id: clusterId,
      theme: formattedTheme,
      subject: subjectName,
      topic: topicName,
      confidence,
      status: clusterStatus,
      years,
      sharedConcepts: tokenList,
      defaultTakeaway: `Recurrent concept pattern: ${formattedTheme} tested across UPSC ${years.join(', ')}.`,
      questions: qList.map((q, idx) => ({
        id: q.id,
        dedupHash: q.dedupHash,
        examName: q.examName || 'UPSC CSE Pre',
        examYear: q.examYear,
        questionNo: q.questionNo,
        stem: q.stem,
        options: q.options,
        correctLabel: q.correctLabel,
        subjectName: q.subject?.name,
        topicName: q.topic?.name,
        isAnchor: idx === 0, // Earliest question is anchor by default
        isVerified: q.isVerified,
        alreadyLinked: q.alreadyLinked,
        selected: true, // Selected by default for easy one-click merge
      })),
    });
  }

  // Sort by confidence desc, then years spanned
  rawClusters.sort((a, b) => b.confidence - a.confidence);

  return {
    clusters: rawClusters.slice(0, limit),
    stats: {
      totalFound: rawClusters.length,
      returned: Math.min(rawClusters.length, limit),
      unreviewedCount,
      verifiedCount,
      dismissedCount,
      subject,
      status,
    },
  };
}

/**
 * Merges selected questions in a cluster into an interconnected Similar PYQ family.
 */
export async function mergeClusterQuestions({
  anchorId,
  selectedIds,
  keyTakeaway,
  theme,
}) {
  if (!Array.isArray(selectedIds) || selectedIds.length < 2) {
    throw new Error('At least 2 questions must be selected to form a similar family');
  }

  const anchorTargetId = anchorId || selectedIds[0];
  const questions = await withRetry(() =>
    prisma.question.findMany({
      where: { id: { in: selectedIds } },
      include: {
        subject: { select: { name: true } },
        topic: { select: { name: true } },
      },
    })
  );

  if (questions.length < 2) {
    throw new Error('Could not find enough matching questions to merge in database');
  }

  const anchorQ = questions.find((q) => q.id === anchorTargetId) || questions[0];
  const now = new Date().toISOString();

  // For each question in selectedIds, link to the family
  for (const q of questions) {
    const currentAnalysis =
      typeof q.analysis === 'object' && q.analysis !== null ? { ...q.analysis } : {};

    const otherMembers = questions
      .filter((other) => other.id !== q.id)
      .map((other) => ({
        targetId: other.dedupHash || other.id,
        questionId: other.id,
        examName: other.examName || 'UPSC CSE Pre',
        examYear: other.examYear,
        srcTopic: other.topic?.name || other.subject?.name || 'Related Theme',
        stem: other.stem,
        keyTakeaway:
          keyTakeaway ||
          `Conceptual predecessor/successor in UPSC ${other.examYear} on ${theme || 'related theme'}.`,
        isVerified: true,
        verifiedAt: now,
      }));

    currentAnalysis.similarPyqs = otherMembers;
    currentAnalysis.similarPyq = otherMembers[0] || null;

    await withRetry(() =>
      prisma.question.update({
        where: { id: q.id },
        data: { analysis: currentAnalysis },
      })
    );
  }

  await withRetry(() =>
    prisma.actionLog.create({
      data: {
        action: 'SIMILAR_PYQ_MERGE',
        message: `Merged ${selectedIds.length} questions into family under anchor ${anchorQ.id} (${theme || ''})`,
        entityId: anchorQ.id,
        entityType: 'QUESTION_FAMILY',
        status: 'SUCCESS',
      },
    })
  );

  return { success: true, count: selectedIds.length, anchorId: anchorQ.id };
}

/**
 * Dismisses / rejects a candidate cluster so it won't appear in the unreviewed queue.
 */
export async function rejectCluster({ clusterId, questionIds = [], reason = 'Not conceptually similar' }) {
  await withRetry(() =>
    prisma.actionLog.create({
      data: {
        action: 'SIMILAR_PYQ_DISMISSED',
        message: `Dismissed cluster ${clusterId || ''} with ${questionIds.length} questions: ${reason}`,
        entityId: clusterId || (questionIds.length > 0 ? questionIds[0] : 'CLUSTER'),
        entityType: 'CLUSTER_REJECTION',
        status: 'DISMISSED',
      },
    })
  );

  return { success: true };
}
