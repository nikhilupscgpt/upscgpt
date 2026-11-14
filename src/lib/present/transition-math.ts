/**
 * Transition scale math & single-line header/counter helpers for Present Mode v1.
 */

export interface ScaleResult {
  scale: number;
  effectiveFontPx: number;
  shouldReflow: boolean;
}

/**
 * Computes the CSS transform scale so a full-width question block fits into the
 * 45% left column while preserving identical line breaks.
 * If scaling would drop text below `minFontPx` (28px at 1080p), returns `shouldReflow: true`
 * so the stage falls back to a reflowed 28px layout with internal scroll.
 */
export function computeQuestionScale({
  fullWidth,
  targetLeftWidth,
  baseFontPx,
  minFontPx = 28,
}: {
  fullWidth: number;
  targetLeftWidth: number;
  baseFontPx: number;
  minFontPx?: number;
}): ScaleResult {
  if (!fullWidth || fullWidth <= 0 || !targetLeftWidth || targetLeftWidth <= 0) {
    return { scale: 1, effectiveFontPx: baseFontPx || minFontPx, shouldReflow: false };
  }
  const rawScale = targetLeftWidth / fullWidth;
  const scale = Math.min(1, Math.max(0.1, Number(rawScale.toFixed(4))));
  const effectiveFontPx = Number(((baseFontPx || minFontPx) * scale).toFixed(2));
  const shouldReflow = effectiveFontPx < minFontPx;
  return { scale, effectiveFontPx, shouldReflow };
}

/**
 * Formats the single quiet metadata line at the top-left of the stage:
 * e.g. "UPSC CSE Pre 2026 · Q64 · Polity › Historical Background"
 */
export function buildQuestionMetaLine(
  q: {
    examName?: string;
    examYear?: string | number;
    questionNo?: string | number;
    srcSubject?: string;
    srcTopic?: string;
    gsPapers?: string[] | string;
    domain?: string;
    topic?: string;
  } | null | undefined,
  isTopicMode = false
): string {
  if (!q) return '';
  if (isTopicMode) {
    const gs = Array.isArray(q.gsPapers) ? q.gsPapers.join(', ') : (q.gsPapers || 'GS');
    const taxonomy = [q.domain, q.topic].filter(Boolean).join(' › ');
    return [gs, taxonomy].filter(Boolean).join(' · ');
  }
  const examPart = [q.examName || 'UPSC CSE Pre', q.examYear].filter(Boolean).join(' ').trim();
  const qNoPart = q.questionNo ? `Q${q.questionNo}` : '';
  const taxonomyPart = [q.srcSubject, q.srcTopic].filter(Boolean).join(' › ');
  return [examPart, qNoPart, taxonomyPart].filter(Boolean).join(' · ');
}

/**
 * Formats the single bottom-left counter:
 * "Question X of N · Step Y of M"
 */
export function buildStageCounter(
  qIndex: number,
  totalQuestions: number,
  stepIndex: number,
  totalSteps: number
): string {
  const qNum = Math.max(1, qIndex + 1);
  const qTot = Math.max(1, totalQuestions);
  const sNum = Math.max(1, stepIndex + 1);
  const sTot = Math.max(1, totalSteps);
  return `Question ${qNum} of ${qTot} · Step ${sNum} of ${sTot}`;
}
