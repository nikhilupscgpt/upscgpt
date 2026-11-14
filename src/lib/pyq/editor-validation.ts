import { parseExplanationValue } from './explanation-schema.ts';
import {
  computeContentStatus,
  detectStemFormat,
  mapExamCode,
} from './content-status.ts';

type ExamCodeValue = NonNullable<ReturnType<typeof mapExamCode>>;
type StemFormatValue = ReturnType<typeof detectStemFormat>;

export interface SaveValidationInput {
  stem?: string | null;
  options?: unknown;
  correctLabel?: string | null;
  explanation?: unknown;
  examCode?: string | null;
  examName?: string | null;
  srcTheme?: string | null;
  difficulty?: string | null;
}

export function validatePyqSavePayload(input: SaveValidationInput):
  | {
      ok: true;
      computed: {
        examCode: ExamCodeValue | null;
        explanationJson: unknown;
        contentStatus: 'broken' | 'incomplete' | 'ready';
        missingFlags: string[];
        stemFormat: StemFormatValue;
      };
    }
  | { ok: false; errors: string[] } {
  const errors: string[] = [];

  const opts = Array.isArray(input.options) ? input.options : [];
  if (opts.length !== 4) {
    errors.push(`Exactly 4 options are required (found ${opts.length}).`);
  } else {
    const emptyOpt = opts.find((o: any) => !String(o?.text || '').trim());
    if (emptyOpt) {
      errors.push('All 4 options must have non-empty text.');
    }
  }

  const label = (input.correctLabel || '').trim().toUpperCase();
  const validLabels = opts.map((o: any) => String(o?.label || '').trim().toUpperCase()).filter(Boolean);
  if (!label) {
    errors.push('Correct answer label (A/B/C/D) is required.');
  } else if (validLabels.length > 0 && !validLabels.includes(label)) {
    errors.push(`Correct answer "${label}" is not among option labels (${validLabels.join(', ')}).`);
  }

  const parsedExpl = parseExplanationValue(input.explanation);
  if (!parsedExpl.ok) {
    errors.push(`Invalid explanation format: ${parsedExpl.error}`);
  }

  const resolvedExamCode =
    (input.examCode && ['UPSC_CSE_PRE', 'CDS_I', 'CDS_II', 'CDS'].includes(input.examCode)
      ? (input.examCode as ExamCodeValue)
      : mapExamCode(input.examName)) || null;

  if (!resolvedExamCode) {
    errors.push('Valid exam code (UPSC_CSE_PRE, CDS_I, CDS_II, or CDS) is required.');
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const explanationJson = parsedExpl.ok ? parsedExpl.data : null;
  const { contentStatus, missingFlags } = computeContentStatus({
    correctLabel: label,
    options: opts,
    explanation: typeof input.explanation === 'string' ? input.explanation : null,
    explanationJson,
    srcTheme: input.srcTheme,
    difficulty: input.difficulty,
    examCode: resolvedExamCode,
    examName: input.examName,
  });

  return {
    ok: true,
    computed: {
      examCode: resolvedExamCode,
      explanationJson,
      contentStatus,
      missingFlags,
      stemFormat: detectStemFormat(input.stem),
    },
  };
}

export interface BacklogRowInput {
  id: string;
  examCode: string | null;
  examName: string | null;
  examYear: number | null;
  srcSubject: string | null;
  srcTopic: string | null;
  srcTheme: string | null;
  contentStatus: string | null;
}

export interface BacklogCell {
  exam: string;
  year: number | null;
  subject: string;
  total: number;
  ready: number;
  needsExplanation: number;
  broken: number;
  untaggedTheme: number;
}

export function buildBacklogMatrix(rows: BacklogRowInput[]): {
  cells: BacklogCell[];
  nextIncompleteId: string | null;
} {
  const map = new Map<string, BacklogCell>();
  let nextIncompleteId: string | null = null;

  for (const r of rows) {
    if (!nextIncompleteId && (r.contentStatus === 'broken' || r.contentStatus === 'incomplete')) {
      nextIncompleteId = r.id;
    }

    const exam = r.examCode || r.examName || 'UNKNOWN';
    const year = r.examYear ?? null;
    const subject = (r.srcSubject || 'General Studies').trim();
    const key = `${exam}|${year ?? 'NULL'}|${subject}`;

    let cell = map.get(key);
    if (!cell) {
      cell = {
        exam,
        year,
        subject,
        total: 0,
        ready: 0,
        needsExplanation: 0,
        broken: 0,
        untaggedTheme: 0,
      };
      map.set(key, cell);
    }
    cell.total += 1;
    if (r.contentStatus === 'broken') cell.broken += 1;
    else if (r.contentStatus === 'ready') cell.ready += 1;
    else cell.needsExplanation += 1;

    if (!r.srcTheme || !r.srcTheme.trim()) {
      cell.untaggedTheme += 1;
    }
  }

  const cells = Array.from(map.values()).sort(
    (a, b) =>
      (b.year ?? 0) - (a.year ?? 0) ||
      a.exam.localeCompare(b.exam) ||
      a.subject.localeCompare(b.subject),
  );

  return { cells, nextIncompleteId };
}
