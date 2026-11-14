export interface TimestampEntry {
  questionId: string;
  startSec: number;
  replacedBy?: {
    videoRef: string;
    recordedAt: string;
  };
}

export interface UploadPackQuestion {
  id: string;
  examName?: string | null;
  examYear?: number | null;
  questionNo?: number | null;
}

export function splitIntoParts(questionIds: string[], partSize = 20): string[][] {
  const cleanSize = Math.max(1, Math.floor(partSize || 20));
  if (questionIds.length === 0) return [];
  const totalParts = Math.ceil(questionIds.length / cleanSize);
  const balancedSize = Math.ceil(questionIds.length / totalParts);
  const parts: string[][] = [];
  for (let i = 0; i < questionIds.length; i += balancedSize) {
    parts.push(questionIds.slice(i, i + balancedSize));
  }
  return parts;
}

export function estimateRecordingMinutes(count: number, secondsPerQuestion = 75): number {
  if (count <= 0) return 0;
  return Math.max(1, Math.round((count * secondsPerQuestion) / 60));
}

export function formatTimestampSec(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec || 0));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  if (hrs > 0) return `${hrs}:${mm}:${ss}`;
  return `${mm}:${ss}`;
}

export function buildSectionTitle(opts: {
  subject?: string | null;
  topic?: string | null;
  years?: Array<number | null | undefined>;
  part?: number;
  totalParts?: number;
}): string {
  const subj = (opts.subject || 'General Studies').trim();
  const top = (opts.topic || '').trim();
  const validYears = (opts.years || []).filter((y): y is number => typeof y === 'number' && y > 1900);
  const yearRange =
    validYears.length > 0
      ? Math.min(...validYears) === Math.max(...validYears)
        ? `(${Math.min(...validYears)})`
        : `(${Math.min(...validYears)}–${Math.max(...validYears)})`
      : '';

  const sectionLabel = top ? `${subj}: ${top}` : subj;
  const partSuffix =
    opts.totalParts && opts.totalParts > 1 && opts.part
      ? ` | Part ${opts.part}`
      : '';

  return `UPSC Prelims PYQs | ${sectionLabel}${yearRange ? ` ${yearRange}` : ''}${partSuffix}`;
}

export function buildUploadPack(opts: {
  title: string;
  subject?: string | null;
  topic?: string | null;
  questions: UploadPackQuestion[];
  timestamps: TimestampEntry[];
}) {
  const qById = new Map(opts.questions.map((q) => [q.id, q]));
  const tsByQ = new Map(opts.timestamps.map((t) => [t.questionId, t]));

  const orderedEntries = opts.questions.map((q, idx) => {
    const ts = tsByQ.get(q.id);
    const startSec = ts?.startSec ?? idx * 75;
    const examLabel = `${q.examName || 'UPSC CSE'} ${q.examYear || ''} ${q.questionNo ? `Q${q.questionNo}` : ''}`.trim();
    return {
      index: idx + 1,
      questionId: q.id,
      startSec,
      timecode: formatTimestampSec(startSec),
      examLabel,
      replacedBy: ts?.replacedBy || null,
    };
  });

  const chapters = orderedEntries
    .map((e) => `${e.timecode} Q${e.index} ${e.examLabel}${e.replacedBy ? ` [Retake: ${e.replacedBy.videoRef}]` : ''}`)
    .join('\n');

  const questionLines = orderedEntries
    .map((e) => `${e.index}. ${e.examLabel}`)
    .join('\n');

  const description = [
    opts.title,
    '',
    'Questions covered in this lecture:',
    questionLines,
    '',
    'Timestamps:',
    chapters,
  ].join('\n');

  const tags = Array.from(
    new Set(
      [
        'UPSC Prelims',
        'UPSC PYQ',
        opts.subject || null,
        opts.topic || null,
        'IAS Preparation',
      ].filter((x): x is string => Boolean(x && x.trim())),
    ),
  ).join(', ');

  return {
    title: opts.title,
    description,
    chapters,
    tags,
  };
}
