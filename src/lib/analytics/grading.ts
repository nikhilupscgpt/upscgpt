export const MAX_TIME_SPENT_SEC = 600;
export const FORGED_TIME_THRESHOLD_SEC = 3600;

export function normalizeLabel(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed || trimmed.length > 64) return null;
  return trimmed;
}

export function clampTimeSpentSec(raw: unknown): { clamped: number; forged: boolean } {
  if (raw === undefined || raw === null) {
    return { clamped: 0, forged: false };
  }
  const num = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(num)) {
    return { clamped: 0, forged: true };
  }
  if (num < 0 || num > FORGED_TIME_THRESHOLD_SEC) {
    return {
      clamped: Math.max(0, Math.min(MAX_TIME_SPENT_SEC, Math.round(num))),
      forged: true,
    };
  }
  return {
    clamped: Math.max(0, Math.min(MAX_TIME_SPENT_SEC, Math.round(num))),
    forged: false,
  };
}

/**
 * Strips answer keys and explanations before sending a question payload to the browser.
 */
export function stripAnswerFields<T extends Record<string, unknown>>(question: T): Omit<T, 'correctLabel' | 'explanation' | 'analysis' | 'answer'> {
  if (!question || typeof question !== 'object') return question;
  const { correctLabel: _c, explanation: _e, analysis: _a, answer: _ans, ...safe } = question;
  return safe;
}

export interface EphemeralQuestionEntry {
  correctLabel: string;
  explanation?: string | null;
  subject?: string | null;
  topic?: string | null;
  examYear?: number | null;
}

export interface ResolvedQuestion {
  correctLabel: string;
  explanation: string | null;
  subject: string | null;
  topic: string | null;
  examYear: number | null;
  questionId: string | null;
}

export interface EnvAtlasItemLike {
  slug: string;
  title: string;
  iucnStatus?: string;
  imageUrl?: string;
  places?: Array<{ name?: string }>;
}

const IUCN_OPTIONS = [
  'Critically Endangered',
  'Endangered',
  'Vulnerable',
  'Near Threatened',
  'Least Concern',
];

function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

/**
 * Generates Environment Atlas quiz questions server-side, separating public prompts
 * from the server-only answer key map.
 */
export function buildEnvAtlasQuiz(items: EnvAtlasItemLike[], count = 5) {
  const pool = shuffleArray(items).slice(0, Math.min(count, items.length));
  const publicQuestions: Array<{
    sourceId: string;
    speciesSlug: string;
    speciesTitle: string;
    imageUrl: string;
    text: string;
    options: Array<{ label: string; text: string }>;
  }> = [];
  const ephemeralQuestions: Record<string, EphemeralQuestionEntry> = {};

  pool.forEach((s, idx) => {
    const sourceId = `env_atlas:${s.slug}:q${idx}`;
    const qType = idx % 2 === 0 ? 'iucn' : 'reserve';
    let text = '';
    let optionTexts: string[] = [];
    let correctText = '';

    if (qType === 'iucn' || !s.places?.length) {
      correctText = s.iucnStatus || 'Endangered';
      const others = shuffleArray(IUCN_OPTIONS.filter((x) => x !== correctText)).slice(0, 3);
      optionTexts = shuffleArray([correctText, ...others]);
      text = `What is the IUCN Red List conservation status of "${s.title}"?`;
    } else {
      const place = s.places[0];
      correctText = s.title;
      const others = shuffleArray(items.filter((x) => x.slug !== s.slug))
        .slice(0, 3)
        .map((x) => x.title);
      optionTexts = shuffleArray([correctText, ...others]);
      text = `Which species is prominently associated with ${place.name}?`;
    }

    const labels = ['a', 'b', 'c', 'd'];
    const correctIndex = optionTexts.indexOf(correctText);
    const correctLabel = labels[correctIndex >= 0 ? correctIndex : 0];

    publicQuestions.push({
      sourceId,
      speciesSlug: s.slug,
      speciesTitle: s.title,
      imageUrl: s.imageUrl || `/species/${s.slug}.webp`,
      text,
      options: optionTexts.map((opt, i) => ({ label: labels[i], text: opt })),
    });

    ephemeralQuestions[sourceId] = {
      correctLabel,
      explanation: `${s.title} — ${correctText}.`,
      subject: 'Environment',
      topic: 'Species Atlas',
      examYear: null,
    };
  });

  return { publicQuestions, ephemeralQuestions };
}

async function logForgedSecurityEvent(
  db: any,
  payload: {
    userId?: string | null;
    anonId?: string | null;
    ipFull?: string | null;
    detail: Record<string, unknown>;
  }
) {
  try {
    if (db.securityEvent) {
      await db.securityEvent.create({
        data: {
          type: 'forged_answer',
          userId: payload.userId || null,
          anonId: payload.anonId || null,
          ipFull: payload.ipFull || null,
          detail: payload.detail as object,
        },
      });
    }
  } catch (err) {
    console.error('[SecurityEvent forged_answer] failed:', err);
  }
}

export async function resolveQuestionKey(
  db: any,
  params: {
    sourceType: string;
    sourceId: string;
    ephemeralQuestions?: Record<string, EphemeralQuestionEntry> | null;
  }
): Promise<ResolvedQuestion | null> {
  const { sourceType, sourceId, ephemeralQuestions } = params;

  if (ephemeralQuestions && typeof ephemeralQuestions === 'object' && sourceId in ephemeralQuestions) {
    const entry = ephemeralQuestions[sourceId];
    if (entry && entry.correctLabel) {
      return {
        correctLabel: entry.correctLabel,
        explanation: entry.explanation || null,
        subject: entry.subject || null,
        topic: entry.topic || null,
        examYear: entry.examYear ?? null,
        questionId: null,
      };
    }
  }

  if (sourceType === 'pyq' || sourceType === 'drill') {
    const draft = await db.questionDraft.findUnique({
      where: { id: sourceId },
      select: {
        id: true,
        correctLabel: true,
        explanation: true,
        srcSubject: true,
        srcTopic: true,
        examYear: true,
      },
    });
    if (draft?.correctLabel) {
      return {
        correctLabel: draft.correctLabel,
        explanation: draft.explanation || null,
        subject: draft.srcSubject || null,
        topic: draft.srcTopic || null,
        examYear: draft.examYear ?? null,
        questionId: null,
      };
    }
  }

  const published = await db.question.findUnique({
    where: { id: sourceId },
    select: {
      id: true,
      correctLabel: true,
      explanation: true,
      analysis: true,
      domain: true,
      examYear: true,
    },
  });
  if (published?.correctLabel) {
    let explanation: string | null = published.explanation || null;
    if (!explanation && published.analysis && typeof published.analysis === 'object') {
      explanation = JSON.stringify({ explanation: '', analysis: published.analysis });
    }
    return {
      correctLabel: published.correctLabel,
      explanation,
      subject: published.domain || null,
      topic: null,
      examYear: published.examYear ?? null,
      questionId: published.id,
    };
  }

  return null;
}

export interface GradeAnswerParams {
  db?: any;
  attemptId: string;
  userId?: string | null;
  anonId?: string | null;
  sourceType: string;
  sourceId: string;
  selectedLabel: unknown;
  timeSpentSec?: unknown;
  flagged?: boolean;
  ipFull?: string | null;
  complete?: boolean;
}

export type GradeAnswerResult =
  | {
      ok: true;
      status: 200;
      data: {
        isCorrect: boolean;
        correctLabel: string;
        explanation: string | null;
        answeredCount: number;
        total: number;
        correct: number;
      };
    }
  | {
      ok: false;
      status: 400 | 403 | 404 | 409;
      error: string;
      code: string;
    };

export async function gradeAttemptAnswer(params: GradeAnswerParams): Promise<GradeAnswerResult> {
  const db = params.db || (await import('../prisma.js')).default;
  const sourceType = String(params.sourceType || '').trim();
  const sourceId = String(params.sourceId || '').trim();

  if (!sourceType || !sourceId || sourceId.length > 128) {
    await logForgedSecurityEvent(db, {
      userId: params.userId,
      anonId: params.anonId,
      ipFull: params.ipFull,
      detail: { reason: 'invalid_source_identifier', attemptId: params.attemptId, sourceType, sourceId },
    });
    return { ok: false, status: 400, error: 'Invalid sourceId', code: 'INVALID_SOURCE_ID' };
  }

  const attempt = await db.attempt.findUnique({
    where: { id: params.attemptId },
    select: {
      id: true,
      userId: true,
      anonId: true,
      total: true,
      ephemeralQuestions: true,
      completedAt: true,
    },
  });

  if (!attempt) {
    return { ok: false, status: 404, error: 'Attempt not found', code: 'ATTEMPT_NOT_FOUND' };
  }

  // Ownership check when attempt is bound to a user or anonId
  if (attempt.userId && attempt.userId !== params.userId) {
    await logForgedSecurityEvent(db, {
      userId: params.userId,
      anonId: params.anonId,
      ipFull: params.ipFull,
      detail: { reason: 'attempt_ownership_mismatch', attemptId: params.attemptId },
    });
    return { ok: false, status: 403, error: 'Forbidden', code: 'FORBIDDEN' };
  }
  if (!attempt.userId && attempt.anonId && params.anonId && attempt.anonId !== params.anonId) {
    return { ok: false, status: 403, error: 'Forbidden', code: 'FORBIDDEN' };
  }

  const normalizedSelected = normalizeLabel(params.selectedLabel);
  if (!normalizedSelected) {
    await logForgedSecurityEvent(db, {
      userId: params.userId,
      anonId: params.anonId,
      ipFull: params.ipFull,
      detail: { reason: 'invalid_selected_label', attemptId: params.attemptId, sourceId },
    });
    return { ok: false, status: 400, error: 'Invalid selectedLabel', code: 'INVALID_LABEL' };
  }

  const { clamped: timeSpentSec, forged: timeForged } = clampTimeSpentSec(params.timeSpentSec);
  if (timeForged) {
    await logForgedSecurityEvent(db, {
      userId: params.userId,
      anonId: params.anonId,
      ipFull: params.ipFull,
      detail: {
        reason: 'forged_time_spent',
        attemptId: params.attemptId,
        sourceId,
        rawTimeSpentSec: params.timeSpentSec,
      },
    });
    return { ok: false, status: 400, error: 'Invalid timeSpentSec', code: 'FORGED_TIME' };
  }

  const existing = await db.attemptAnswer.findUnique({
    where: {
      attemptId_sourceType_sourceId: {
        attemptId: params.attemptId,
        sourceType,
        sourceId,
      },
    },
    select: { id: true },
  });

  if (existing) {
    return { ok: false, status: 409, error: 'Question already answered in this attempt', code: 'DUPLICATE_ANSWER' };
  }

  const resolved = await resolveQuestionKey(db, {
    sourceType,
    sourceId,
    ephemeralQuestions: (attempt.ephemeralQuestions as Record<string, EphemeralQuestionEntry> | null) || null,
  });

  if (!resolved) {
    await logForgedSecurityEvent(db, {
      userId: params.userId,
      anonId: params.anonId,
      ipFull: params.ipFull,
      detail: { reason: 'unknown_source_id', attemptId: params.attemptId, sourceType, sourceId },
    });
    return { ok: false, status: 404, error: 'Question not found', code: 'UNKNOWN_SOURCE_ID' };
  }

  const normalizedCorrect = normalizeLabel(resolved.correctLabel);
  const isCorrect = normalizedCorrect !== null && normalizedSelected === normalizedCorrect;

  await db.attemptAnswer.create({
    data: {
      attemptId: params.attemptId,
      questionId: resolved.questionId,
      sourceType,
      sourceId,
      subject: resolved.subject,
      topic: resolved.topic,
      examYear: resolved.examYear,
      selectedLabel: normalizedSelected,
      isCorrect,
      timeSpentSec,
      flagged: Boolean(params.flagged),
    },
  });

  const [answeredCount, correctCount] = await Promise.all([
    db.attemptAnswer.count({ where: { attemptId: params.attemptId } }),
    db.attemptAnswer.count({ where: { attemptId: params.attemptId, isCorrect: true } }),
  ]);

  const shouldComplete =
    Boolean(params.complete) || (attempt.total > 0 && answeredCount >= attempt.total);

  await db.attempt.update({
    where: { id: params.attemptId },
    data: {
      correct: correctCount,
      ...(shouldComplete && !attempt.completedAt
        ? {
            completedAt: new Date(),
            submittedAt: new Date(),
            score: attempt.total > 0 ? Number(((correctCount / attempt.total) * 100).toFixed(2)) : 0,
          }
        : {}),
    },
  });

  return {
    ok: true,
    status: 200,
    data: {
      isCorrect,
      correctLabel: resolved.correctLabel,
      explanation: resolved.explanation,
      answeredCount,
      total: attempt.total,
      correct: correctCount,
    },
  };
}
