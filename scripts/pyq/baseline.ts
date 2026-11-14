/**
 * Read-only baseline audit for PYQ Studio PRD §1.1 against `QuestionDraft`.
 * Writes reports/pyq-cleanup/baseline.md without modifying any database rows.
 */
import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function normalizeStem(stem: string): string {
  return String(stem || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseCoreTakeaway(explanation: string | null): boolean {
  if (!explanation) return false;
  const trimmed = explanation.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      const takeaway = parsed?.analysis?.coreTakeaway || parsed?.coreTakeaway;
      return typeof takeaway === 'string' && takeaway.trim().length > 0;
    } catch {
      return false;
    }
  }
  return false;
}

async function main() {
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
  });

  const total = rows.length;
  let cseCount = 0;
  let cdsCount = 0;
  let noExplanation = 0;
  let explainedTotal = 0;
  let explainedNoTakeaway = 0;
  let difficultyEmpty = 0;
  let srcThemeEmpty = 0;
  let srcTopicEmpty = 0;
  let noCorrectLabel = 0;
  let labelMismatch = 0;
  let missingCdsCycle = 0;

  const paperCounts = new Map<string, number>();
  const examYearNoGroups = new Map<string, number>();
  const stemNormMap = new Map<string, string[]>();
  const subjects = new Set<string>();
  const topics = new Set<string>();
  const themes = new Set<string>();

  for (const r of rows) {
    const exam = (r.examName || '').trim();
    if (/cds/i.test(exam)) cdsCount++;
    else cseCount++;

    if (/^cds(\s+\d{4})?$/i.test(exam)) {
      missingCdsCycle++;
    }

    const expl = (r.explanation || '').trim();
    if (!expl) {
      noExplanation++;
    } else {
      explainedTotal++;
      if (!parseCoreTakeaway(expl)) explainedNoTakeaway++;
    }

    if (!r.difficulty) difficultyEmpty++;
    if (!r.srcTheme || !r.srcTheme.trim()) srcThemeEmpty++;
    else themes.add(r.srcTheme.trim());

    if (!r.srcTopic || !r.srcTopic.trim()) srcTopicEmpty++;
    else topics.add(r.srcTopic.trim());

    if (r.srcSubject && r.srcSubject.trim()) subjects.add(r.srcSubject.trim());

    const opts = Array.isArray(r.options) ? (r.options as any[]) : [];
    const labels = new Set(opts.map((o) => String(o?.label || '').trim().toLowerCase()).filter(Boolean));
    const ans = (r.correctLabel || '').trim().toLowerCase();
    if (!ans) {
      noCorrectLabel++;
    } else if (labels.size > 0 && !labels.has(ans)) {
      labelMismatch++;
    }

    if (!/cds/i.test(exam) && r.examYear && r.paper !== 'CSAT') {
      const pk = `${exam || 'UPSC'} ${r.examYear}`;
      paperCounts.set(pk, (paperCounts.get(pk) || 0) + 1);
    }

    const gk = `${exam}|${r.examYear ?? 'null'}|${r.questionNo ?? 'null'}`;
    examYearNoGroups.set(gk, (examYearNoGroups.get(gk) || 0) + 1);

    const norm = normalizeStem(r.stem).slice(0, 140);
    if (norm.length >= 25) {
      const arr = stemNormMap.get(norm) || [];
      arr.push(r.dedupHash);
      stemNormMap.set(norm, arr);
    }
  }

  const over100Papers = [...paperCounts.entries()]
    .filter(([, c]) => c > 100)
    .sort((a, b) => a[0].localeCompare(b[0]));

  const clashGroups = [...examYearNoGroups.values()].filter((c) => c > 1).length;
  const nearDupGroups = [...stemNormMap.values()].filter(
    (hashes) => hashes.length > 1 && new Set(hashes).size > 1
  ).length;

  const avgRowBytes = Math.round(
    rows.reduce((acc, r) => acc + Buffer.byteLength(JSON.stringify(r), 'utf8'), 0) / Math.max(1, total)
  );

  const report = [
    '# PYQ Baseline Audit (`QuestionDraft`)',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '| Metric | Measured |',
    '|---|---|',
    `| Total questions (\`QuestionDraft\`) | ${total} |`,
    `| UPSC CSE / CDS | ${cseCount} / ${cdsCount} |`,
    `| No explanation | ${noExplanation} (${((noExplanation / Math.max(1, total)) * 100).toFixed(1)}%) |`,
    `| Explained but no \`coreTakeaway\` | ${explainedNoTakeaway} of ${explainedTotal} |`,
    `| \`difficulty\` empty | ${difficultyEmpty} |`,
    `| \`srcTheme\` empty / \`srcTopic\` empty | ${srcThemeEmpty} (${((srcThemeEmpty / Math.max(1, total)) * 100).toFixed(1)}%) / ${srcTopicEmpty} |`,
    `| No \`correctLabel\` / label not among options | ${noCorrectLabel} / ${labelMismatch} |`,
    `| Exam name missing I/II ("CDS ...") | ${missingCdsCycle} |`,
    `| UPSC GS1 papers with > 100 questions | ${over100Papers.map(([k, v]) => `${k} (${v})`).join(', ') || 'None'} |`,
    `| Groups sharing exam + year + questionNo | ${clashGroups} |`,
    `| Near-duplicate stems missed by \`dedupHash\` | ${nearDupGroups} |`,
    `| Distinct subjects / topics / themes | ${subjects.size} / ${topics.size} / ${themes.size} |`,
    `| Avg full-row JSON size | ~${(avgRowBytes / 1024).toFixed(2)} KB |`,
    '',
    '## Distinct Subjects',
    ...[...subjects].sort().map((s) => `- ${s}`),
    '',
  ].join('\n');

  const outDir = path.join(process.cwd(), 'reports/pyq-cleanup');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'baseline.md');
  fs.writeFileSync(outPath, report, 'utf8');
  console.log(report);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
