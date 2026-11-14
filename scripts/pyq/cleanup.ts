/**
 * Phase 2 Data Integrity & Cleanup script for PYQ Studio (`QuestionDraft`).
 *
 * Defaults to DRY-RUN mode: reads existing QuestionDraft columns, computes
 * all 9 diagnostic CSV reports in `reports/pyq-cleanup/`, and prints a summary.
 * Pass `--apply` ONLY after explicit user approval and after applying the
 * Phase 2 Prisma migration (`20261114182000_pyq_studio_phase2_data`).
 *
 * Never deletes or overwrites `stem`, `options`, `correctLabel`, or `explanation`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { parseExplanationValue } from '../../src/lib/pyq/explanation-schema.ts';
import {
  computeContentStatus,
  detectStemFormat,
  mapExamCode,
} from '../../src/lib/pyq/content-status.ts';
import {
  SUBJECT_ORDER,
  getTopicSyllabusOrder,
} from '../../src/app/prelims/pyq/topicGroups.js';

const prisma = new PrismaClient();
const REPORT_DIR = path.join(process.cwd(), 'reports', 'pyq-cleanup');

function csvCell(value: unknown): string {
  const s = value == null ? '' : String(value);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function writeCsv(filename: string, headers: string[], rows: unknown[][]): void {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const lines = [headers.map(csvCell).join(',')];
  for (const row of rows) {
    lines.push(row.map(csvCell).join(','));
  }
  fs.writeFileSync(path.join(REPORT_DIR, filename), lines.join('\n') + '\n', 'utf8');
}

function normalizeStem(stem: string): string {
  return String(stem || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function computeSyllabusOrder(subject: string | null, topic: string | null): number {
  const sub = (subject || '').trim();
  const subIdx = SUBJECT_ORDER.indexOf(sub);
  const base = (subIdx >= 0 ? subIdx : 99) * 1000;
  const topicOrder = getTopicSyllabusOrder(sub, topic || '');
  return base + (Number.isFinite(topicOrder) ? Math.min(Math.max(topicOrder, 0), 999) : 999);
}

function hasInlineNumberedClauses(stem: string | null): boolean {
  if (!stem) return false;
  // Detect inline numbered statements like "1. ... 2. ..." on the same line
  return /[^\n]\s+2\.\s+\S/.test(stem) || /\b1\.\s+[^\n]+\s+2\.\s+/.test(stem);
}

async function main() {
  const apply = process.argv.includes('--apply');
  console.log(`PYQ Cleanup running in ${apply ? 'APPLY' : 'DRY-RUN'} mode...`);

  const rows = await prisma.questionDraft.findMany({
    select: {
      id: true,
      examName: true,
      examYear: true,
      paper: true,
      questionNo: true,
      srcSubject: true,
      srcTopic: true,
      srcTheme: true,
      stem: true,
      options: true,
      correctLabel: true,
      explanation: true,
      difficulty: true,
      dedupHash: true,
    },
    orderBy: [{ examName: 'asc' }, { examYear: 'asc' }, { questionNo: 'asc' }, { id: 'asc' }],
  });

  // 1. ExamCode mapping
  const examCodeRows: unknown[][] = [];
  let mappedCount = 0;
  let manualReviewExamCount = 0;
  for (const r of rows) {
    const mapped = mapExamCode(r.examName);
    const needsManualReview = mapped === null || mapped === 'CDS';
    if (mapped) mappedCount++;
    if (needsManualReview) manualReviewExamCount++;
    examCodeRows.push([r.id, r.examName ?? '', r.examYear ?? '', mapped ?? '', needsManualReview]);
  }
  writeCsv(
    '01-exam-code-mapping.csv',
    ['id', 'examName', 'examYear', 'mappedExamCode', 'needsManualReview'],
    examCodeRows,
  );

  // 2. Over-100 papers
  const byPaper = new Map<string, { examName: string; examYear: number | null; ids: string[] }>();
  for (const r of rows) {
    const key = `${r.examName ?? 'UNKNOWN'}|${r.examYear ?? 'NULL'}`;
    let entry = byPaper.get(key);
    if (!entry) {
      entry = { examName: r.examName ?? 'UNKNOWN', examYear: r.examYear, ids: [] };
      byPaper.set(key, entry);
    }
    entry.ids.push(r.id);
  }
  const over100Rows: unknown[][] = [];
  for (const entry of byPaper.values()) {
    if (entry.ids.length > 100) {
      over100Rows.push([entry.examName, entry.examYear ?? '', entry.ids.length, entry.ids.join(';')]);
    }
  }
  writeCsv(
    '02-over-100-papers.csv',
    ['examName', 'examYear', 'count', 'questionIds'],
    over100Rows,
  );

  // 3. Exam + Year + QuestionNo clashes
  const byQno = new Map<string, typeof rows>();
  for (const r of rows) {
    const key = `${r.examName ?? ''}|${r.examYear ?? ''}|${r.questionNo ?? ''}`;
    const list = byQno.get(key) || [];
    list.push(r);
    byQno.set(key, list);
  }
  const clashRows: unknown[][] = [];
  for (const group of byQno.values()) {
    if (group.length > 1) {
      const first = group[0];
      const stemsSideBySide = group
        .map((g) => `[${g.id}] ${(g.stem || '').replace(/\s+/g, ' ').slice(0, 120)}`)
        .join(' || ');
      clashRows.push([
        first.examName ?? '',
        first.examYear ?? '',
        first.questionNo ?? '',
        group.length,
        stemsSideBySide,
      ]);
    }
  }
  writeCsv(
    '03-exam-year-qno-clashes.csv',
    ['examName', 'examYear', 'questionNo', 'count', 'stemsSideBySide'],
    clashRows,
  );

  // 4. Near-duplicate stems (normalized first 120 chars)
  const byStemPrefix = new Map<string, typeof rows>();
  for (const r of rows) {
    const norm = normalizeStem(r.stem).slice(0, 120);
    if (!norm) continue;
    const list = byStemPrefix.get(norm) || [];
    list.push(r);
    byStemPrefix.set(norm, list);
  }
  const dupRows: unknown[][] = [];
  for (const [groupKey, group] of byStemPrefix.entries()) {
    if (group.length > 1) {
      dupRows.push([
        groupKey.slice(0, 80),
        group.map((g) => g.id).join(';'),
        group.map((g) => g.dedupHash ?? '').join(';'),
        (group[0].stem || '').replace(/\s+/g, ' ').slice(0, 160),
      ]);
    }
  }
  writeCsv(
    '04-near-duplicate-stems.csv',
    ['groupKey', 'ids', 'dedupHashes', 'sampleStem'],
    dupRows,
  );

  // 5. Answer & option issues
  const answerIssueRows: unknown[][] = [];
  for (const r of rows) {
    const opts = Array.isArray(r.options) ? r.options : [];
    const optCount = opts.length;
    const lbl = (r.correctLabel || '').trim().toUpperCase();
    const validLabels = new Set(['A', 'B', 'C', 'D']);
    const issues: string[] = [];
    if (!lbl) issues.push('missing_correct_label');
    else if (!validLabels.has(lbl)) issues.push('invalid_correct_label');
    if (optCount !== 4) issues.push(`option_count_${optCount}`);
    if (issues.length > 0) {
      answerIssueRows.push([
        r.id,
        r.examName ?? '',
        r.examYear ?? '',
        r.questionNo ?? '',
        issues.join(';'),
        r.correctLabel ?? '',
        optCount,
      ]);
    }
  }
  writeCsv(
    '05-answer-issues.csv',
    ['id', 'examName', 'examYear', 'questionNo', 'issue', 'correctLabel', 'optionCount'],
    answerIssueRows,
  );

  // 6. Explanation JSON parse failures & structured status
  const explFailureRows: unknown[][] = [];
  const parsedExplById = new Map<string, ReturnType<typeof parseExplanationValue>>();
  for (const r of rows) {
    const parsed = parseExplanationValue(r.explanation);
    parsedExplById.set(r.id, parsed);
    if (!parsed.ok) {
      explFailureRows.push([
        r.id,
        parsed.error,
        (r.explanation || '').replace(/\s+/g, ' ').slice(0, 160),
      ]);
    }
  }
  writeCsv(
    '06-explanation-json-failures.csv',
    ['id', 'error', 'sample'],
    explFailureRows,
  );

  // 7. Inline stem format
  const stemFormatRows: unknown[][] = [];
  const stemFormatCounts: Record<string, number> = {};
  let inlineNumberedCount = 0;
  for (const r of rows) {
    const fmt = detectStemFormat(r.stem);
    stemFormatCounts[fmt] = (stemFormatCounts[fmt] || 0) + 1;
    const inlineFlag = hasInlineNumberedClauses(r.stem);
    if (inlineFlag) inlineNumberedCount++;
    if (inlineFlag || fmt !== 'plain') {
      stemFormatRows.push([
        r.id,
        fmt,
        inlineFlag,
        (r.stem || '').replace(/\s+/g, ' ').slice(0, 140),
      ]);
    }
  }
  writeCsv(
    '07-inline-stem-format.csv',
    ['id', 'stemFormat', 'inlineNumberedFlag', 'stemPreview'],
    stemFormatRows,
  );

  // 8. Syllabus order aggregation
  const topicAgg = new Map<
    string,
    { srcSubject: string; srcTopic: string; count: number; order: number; themes: Set<string> }
  >();
  for (const r of rows) {
    const sub = r.srcSubject || '';
    const top = r.srcTopic || '';
    const key = `${sub}|${top}`;
    let entry = topicAgg.get(key);
    if (!entry) {
      entry = {
        srcSubject: sub,
        srcTopic: top,
        count: 0,
        order: computeSyllabusOrder(sub, top),
        themes: new Set<string>(),
      };
      topicAgg.set(key, entry);
    }
    entry.count++;
    if (r.srcTheme && r.srcTheme.trim()) {
      entry.themes.add(r.srcTheme.trim());
    }
  }
  const syllabusRows: unknown[][] = Array.from(topicAgg.values())
    .sort((a, b) => a.order - b.order || a.srcTopic.localeCompare(b.srcTopic))
    .map((e) => [e.srcSubject, e.srcTopic, e.count, e.order, e.themes.size]);
  writeCsv(
    '08-syllabus-order.csv',
    ['srcSubject', 'srcTopic', 'count', 'computedTopicOrder', 'themeCount'],
    syllabusRows,
  );

  // 9. Content status summary
  const statusRows: unknown[][] = [];
  const statusCounts: Record<string, number> = { broken: 0, incomplete: 0, ready: 0 };
  const flagCounts: Record<string, number> = {};
  const computedUpdates: Array<{
    id: string;
    examCode: ReturnType<typeof mapExamCode>;
    explanationJson: unknown;
    stemFormat: ReturnType<typeof detectStemFormat>;
    syllabusOrder: number;
    contentStatus: 'broken' | 'incomplete' | 'ready';
    missingFlags: string[];
  }> = [];

  for (const r of rows) {
    const examCode = mapExamCode(r.examName);
    const parsedExpl = parsedExplById.get(r.id);
    const explanationJson = parsedExpl?.ok ? parsedExpl.data : null;
    const stemFormat = detectStemFormat(r.stem);
    const syllabusOrder = computeSyllabusOrder(r.srcSubject, r.srcTopic);
    const { contentStatus, missingFlags } = computeContentStatus({
      correctLabel: r.correctLabel,
      options: r.options,
      explanation: r.explanation,
      explanationJson,
      srcTheme: r.srcTheme,
      difficulty: r.difficulty,
      examCode,
      examName: r.examName,
    });

    statusCounts[contentStatus] = (statusCounts[contentStatus] || 0) + 1;
    for (const f of missingFlags) {
      flagCounts[f] = (flagCounts[f] || 0) + 1;
    }

    statusRows.push([r.id, contentStatus, missingFlags.join(';')]);
    computedUpdates.push({
      id: r.id,
      examCode,
      explanationJson,
      stemFormat,
      syllabusOrder,
      contentStatus,
      missingFlags,
    });
  }
  writeCsv('09-content-status-summary.csv', ['id', 'contentStatus', 'missingFlags'], statusRows);

  console.log('\n=== PYQ Phase 2 Dry-Run Summary ===');
  console.log(`Total QuestionDraft rows: ${rows.length}`);
  console.log(`01 ExamCode mapped: ${mappedCount}, needsManualReview: ${manualReviewExamCount}`);
  console.log(`02 Over-100 papers: ${over100Rows.length}`);
  console.log(`03 Exam+Year+QNo clash groups: ${clashRows.length}`);
  console.log(`04 Near-duplicate stem groups: ${dupRows.length}`);
  console.log(`05 Answer/option issues: ${answerIssueRows.length}`);
  console.log(`06 Explanation JSON parse failures: ${explFailureRows.length}`);
  console.log(
    `07 Stem formats: ${JSON.stringify(stemFormatCounts)}, inlineNumberedFlag: ${inlineNumberedCount}`,
  );
  console.log(`08 Unique (srcSubject, srcTopic) pairs: ${syllabusRows.length}`);
  console.log(`09 ContentStatus: ${JSON.stringify(statusCounts)}`);
  console.log(`   MissingFlags: ${JSON.stringify(flagCounts)}`);
  console.log(`CSV reports written to ${REPORT_DIR}`);

  if (apply) {
    console.log('\nApplying derived Phase 2 fields to QuestionDraft...');
    const BATCH_SIZE = 50;
    let updated = 0;
    for (let i = 0; i < computedUpdates.length; i += BATCH_SIZE) {
      const batch = computedUpdates.slice(i, i + BATCH_SIZE);
      await prisma.$transaction(
        batch.map((u) =>
          prisma.questionDraft.update({
            where: { id: u.id },
            data: {
              examCode: u.examCode,
              explanationJson: u.explanationJson as never,
              stemFormat: u.stemFormat,
              syllabusOrder: u.syllabusOrder,
              contentStatus: u.contentStatus,
              missingFlags: u.missingFlags,
            },
          }),
        ),
      );
      updated += batch.length;
    }
    console.log(`Applied Phase 2 metadata to ${updated} rows.`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
