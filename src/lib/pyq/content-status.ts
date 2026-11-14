import {
  hasCoreTakeaway,
  isExplanationPresent,
  parseExplanationValue,
} from './explanation-schema.ts';

export type MissingFlag =
  | 'answer'
  | 'answer_mismatch'
  | 'options'
  | 'explanation'
  | 'takeaway'
  | 'theme'
  | 'difficulty'
  | 'exam';

export type ContentStatus = 'broken' | 'incomplete' | 'ready';

export function mapExamCode(
  examName: string | null | undefined
): 'UPSC_CSE_PRE' | 'CDS_I' | 'CDS_II' | 'CDS' | null {
  const s = String(examName || '').trim();
  if (!s) return null;
  if (/\bcds\b/i.test(s)) {
    if (/\b(ii|2)\b/i.test(s)) return 'CDS_II';
    if (/\b(i|1)\b/i.test(s)) return 'CDS_I';
    return 'CDS';
  }
  if (/upsc|cse|prelims/i.test(s)) return 'UPSC_CSE_PRE';
  return null;
}

export function detectStemFormat(
  stem: string | null | undefined
): 'statements' | 'pairs' | 'assertion' | 'plain' {
  const s = String(stem || '');
  if (/statement[\s-]*i\b|assertion\s*\(a\)|reason\s*\(r\)/i.test(s)) {
    return 'assertion';
  }
  if (/how many of the (above|following)|pairs?\s+given\s+above|matched\s+correctly/i.test(s)) {
    return 'pairs';
  }
  if (/consider the following statements|which of the statements given above/i.test(s)) {
    return 'statements';
  }
  return 'plain';
}

export function computeContentStatus(row: {
  correctLabel?: string | null;
  options?: unknown;
  explanation?: string | null;
  explanationJson?: unknown;
  srcTheme?: string | null;
  difficulty?: string | null;
  examCode?: string | null;
  examName?: string | null;
}): { contentStatus: ContentStatus; missingFlags: MissingFlag[] } {
  const missingFlags: MissingFlag[] = [];

  const opts = Array.isArray(row.options) ? (row.options as any[]) : [];
  const validOpts = opts.filter(
    (o) => o && String(o.label || '').trim() !== '' && String(o.text || '').trim() !== ''
  );
  if (validOpts.length !== 4) {
    missingFlags.push('options');
  }

  const ans = String(row.correctLabel || '').trim().toLowerCase();
  if (!ans) {
    missingFlags.push('answer');
  } else {
    const labels = new Set(validOpts.map((o) => String(o.label).trim().toLowerCase()));
    if (labels.size > 0 && !labels.has(ans)) {
      missingFlags.push('answer_mismatch');
    }
  }

  const parsedExpl = row.explanationJson
    ? parseExplanationValue(row.explanationJson)
    : parseExplanationValue(row.explanation);

  const explPresent = parsedExpl.ok && isExplanationPresent(parsedExpl.data);
  if (!explPresent) {
    missingFlags.push('explanation');
  } else if (!hasCoreTakeaway(parsedExpl.data)) {
    missingFlags.push('takeaway');
  }

  if (!row.srcTheme || !String(row.srcTheme).trim()) {
    missingFlags.push('theme');
  }
  if (!row.difficulty) {
    missingFlags.push('difficulty');
  }

  const code = row.examCode ?? mapExamCode(row.examName);
  if (!code || code === 'CDS') {
    missingFlags.push('exam');
  }

  const isBroken =
    missingFlags.includes('answer') ||
    missingFlags.includes('answer_mismatch') ||
    missingFlags.includes('options');

  const contentStatus: ContentStatus = isBroken
    ? 'broken'
    : missingFlags.includes('explanation')
    ? 'incomplete'
    : 'ready';

  return { contentStatus, missingFlags };
}
