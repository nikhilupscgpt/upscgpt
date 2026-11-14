import prisma from '../prisma.js';
import { SUBJECT_ORDER, getTopicSyllabusOrder } from '../../app/prelims/pyq/topicGroups.js';

export type TreeExamFilter = 'UPSC_CSE_PRE' | 'CDS' | 'ALL';

export interface TreeQuestionInput {
  id: string;
  srcSubject: string | null;
  srcTopic: string | null;
  srcTheme: string | null;
  examCode: string | null;
  examName: string | null;
  contentStatus: string | null;
  syllabusOrder: number | null;
}

export interface TreeUsageInput {
  questionId: string;
  presentedAt: Date;
}

export interface TreeCounts {
  total: number;
  cseCount: number;
  cdsCount: number;
  readyCount: number;
  needsExplanationCount: number;
  brokenCount: number;
  recordedCount: number;
  recordedPct: number;
  lastRecordedAt: string | null;
  partsDone: number;
}

export interface TreeThemeNode extends TreeCounts {
  name: string;
}

export interface TreeTopicNode extends TreeCounts {
  name: string;
  order: number;
  themes: TreeThemeNode[];
}

export interface TreeSubjectNode extends TreeCounts {
  name: string;
  order: number;
  topics: TreeTopicNode[];
}

export interface PyqTreeResult {
  exam: TreeExamFilter;
  generatedAt: string;
  totals: TreeCounts;
  subjects: TreeSubjectNode[];
}

export interface SectionSearchHit {
  type: 'subject' | 'topic' | 'theme';
  subject: string;
  topic?: string;
  theme?: string;
  label: string;
  count: number;
  href: string;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
const PART_SIZE_DEFAULT = 20;

interface TreeCacheEntry {
  expiresAt: number;
  data: PyqTreeResult;
}

function getTreeCacheMap(): Map<string, TreeCacheEntry> {
  const g = globalThis as unknown as { __pyqTreeCache?: Map<string, TreeCacheEntry> };
  if (!g.__pyqTreeCache) {
    g.__pyqTreeCache = new Map();
  }
  return g.__pyqTreeCache;
}

export function invalidatePyqTreeCache(): void {
  getTreeCacheMap().clear();
}

function isCdsRow(row: TreeQuestionInput): boolean {
  if (row.examCode) {
    return row.examCode === 'CDS_I' || row.examCode === 'CDS_II' || row.examCode === 'CDS';
  }
  return (row.examName || '').toUpperCase().includes('CDS');
}

function matchesExamFilter(row: TreeQuestionInput, examFilter: TreeExamFilter): boolean {
  if (examFilter === 'ALL') return true;
  const cds = isCdsRow(row);
  return examFilter === 'CDS' ? cds : !cds;
}

interface MutableAgg {
  total: number;
  cseCount: number;
  cdsCount: number;
  readyCount: number;
  needsExplanationCount: number;
  brokenCount: number;
  recordedCount: number;
  lastRecordedMs: number;
}

function createEmptyAgg(): MutableAgg {
  return {
    total: 0,
    cseCount: 0,
    cdsCount: 0,
    readyCount: 0,
    needsExplanationCount: 0,
    brokenCount: 0,
    recordedCount: 0,
    lastRecordedMs: 0,
  };
}

function addRowToAgg(
  agg: MutableAgg,
  row: TreeQuestionInput,
  usageByQ: Map<string, number>,
): void {
  agg.total += 1;
  if (isCdsRow(row)) agg.cdsCount += 1;
  else agg.cseCount += 1;

  if (row.contentStatus === 'broken') agg.brokenCount += 1;
  else if (row.contentStatus === 'ready') agg.readyCount += 1;
  else agg.needsExplanationCount += 1;

  const recMs = usageByQ.get(row.id);
  if (recMs) {
    agg.recordedCount += 1;
    if (recMs > agg.lastRecordedMs) agg.lastRecordedMs = recMs;
  }
}

function finalizeCounts(agg: MutableAgg): TreeCounts {
  const recordedPct = agg.total > 0 ? Math.round((agg.recordedCount / agg.total) * 100) : 0;
  return {
    total: agg.total,
    cseCount: agg.cseCount,
    cdsCount: agg.cdsCount,
    readyCount: agg.readyCount,
    needsExplanationCount: agg.needsExplanationCount,
    brokenCount: agg.brokenCount,
    recordedCount: agg.recordedCount,
    recordedPct,
    lastRecordedAt: agg.lastRecordedMs > 0 ? new Date(agg.lastRecordedMs).toISOString() : null,
    partsDone: Math.floor(agg.recordedCount / PART_SIZE_DEFAULT),
  };
}

export function buildPyqTreeFromRows(
  rows: TreeQuestionInput[],
  usageRows: TreeUsageInput[],
  examFilter: TreeExamFilter = 'UPSC_CSE_PRE',
): PyqTreeResult {
  const usageByQ = new Map<string, number>();
  for (const u of usageRows) {
    const ms = u.presentedAt instanceof Date ? u.presentedAt.getTime() : new Date(u.presentedAt).getTime();
    if (!Number.isFinite(ms)) continue;
    const prev = usageByQ.get(u.questionId) || 0;
    if (ms > prev) usageByQ.set(u.questionId, ms);
  }

  const rootAgg = createEmptyAgg();
  const subjectMap = new Map<
    string,
    {
      agg: MutableAgg;
      topics: Map<
        string,
        {
          agg: MutableAgg;
          order: number;
          themes: Map<string, MutableAgg>;
        }
      >;
    }
  >();

  for (const row of rows) {
    if (!matchesExamFilter(row, examFilter)) continue;

    addRowToAgg(rootAgg, row, usageByQ);

    const subjectName = (row.srcSubject || 'General Studies').trim() || 'General Studies';
    const topicName = (row.srcTopic || 'General').trim() || 'General';
    const themeName = (row.srcTheme || '').trim();

    let subjEntry = subjectMap.get(subjectName);
    if (!subjEntry) {
      subjEntry = { agg: createEmptyAgg(), topics: new Map() };
      subjectMap.set(subjectName, subjEntry);
    }
    addRowToAgg(subjEntry.agg, row, usageByQ);

    let topicEntry = subjEntry.topics.get(topicName);
    if (!topicEntry) {
      const order =
        typeof row.syllabusOrder === 'number'
          ? row.syllabusOrder
          : getTopicSyllabusOrder(subjectName, topicName);
      topicEntry = { agg: createEmptyAgg(), order, themes: new Map() };
      subjEntry.topics.set(topicName, topicEntry);
    }
    addRowToAgg(topicEntry.agg, row, usageByQ);

    if (themeName) {
      let themeAgg = topicEntry.themes.get(themeName);
      if (!themeAgg) {
        themeAgg = createEmptyAgg();
        topicEntry.themes.set(themeName, themeAgg);
      }
      addRowToAgg(themeAgg, row, usageByQ);
    }
  }

  const subjects: TreeSubjectNode[] = Array.from(subjectMap.entries())
    .map(([subName, subVal]) => {
      const subIdx = SUBJECT_ORDER.indexOf(subName);
      const subOrder = subIdx >= 0 ? subIdx : 999;

      const topics: TreeTopicNode[] = Array.from(subVal.topics.entries())
        .map(([topName, topVal]) => {
          const themes: TreeThemeNode[] = Array.from(topVal.themes.entries())
            .map(([thName, thAgg]) => ({
              name: thName,
              ...finalizeCounts(thAgg),
            }))
            .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

          return {
            name: topName,
            order: topVal.order,
            ...finalizeCounts(topVal.agg),
            themes,
          };
        })
        .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

      return {
        name: subName,
        order: subOrder,
        ...finalizeCounts(subVal.agg),
        topics,
      };
    })
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

  return {
    exam: examFilter,
    generatedAt: new Date().toISOString(),
    totals: finalizeCounts(rootAgg),
    subjects,
  };
}

export function searchTreeSections(
  tree: PyqTreeResult,
  query: string,
  limit = 12,
): SectionSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits: SectionSearchHit[] = [];

  for (const subj of tree.subjects) {
    if (subj.name.toLowerCase().includes(q)) {
      hits.push({
        type: 'subject',
        subject: subj.name,
        label: subj.name,
        count: subj.total,
        href: `/admin/studio/pyq?subject=${encodeURIComponent(subj.name)}`,
      });
    }
    for (const top of subj.topics) {
      if (top.name.toLowerCase().includes(q)) {
        const hasThemes = top.themes.length > 0;
        hits.push({
          type: 'topic',
          subject: subj.name,
          topic: top.name,
          label: `${subj.name} › ${top.name}`,
          count: top.total,
          href: hasThemes
            ? `/admin/studio/pyq?subject=${encodeURIComponent(subj.name)}&topic=${encodeURIComponent(top.name)}`
            : `/admin/studio/pyq?view=list&subject=${encodeURIComponent(subj.name)}&topic=${encodeURIComponent(top.name)}`,
        });
      }
      for (const th of top.themes) {
        if (th.name.toLowerCase().includes(q)) {
          hits.push({
            type: 'theme',
            subject: subj.name,
            topic: top.name,
            theme: th.name,
            label: `${subj.name} › ${top.name} › ${th.name}`,
            count: th.total,
            href: `/admin/studio/pyq?view=list&subject=${encodeURIComponent(subj.name)}&topic=${encodeURIComponent(top.name)}&search=${encodeURIComponent(th.name)}`,
          });
        }
      }
    }
  }

  return hits.slice(0, limit);
}

export function normalizeExamFilter(raw: string | null | undefined): TreeExamFilter {
  const val = (raw || '').toUpperCase().trim();
  if (val === 'CDS') return 'CDS';
  if (val === 'ALL') return 'ALL';
  return 'UPSC_CSE_PRE';
}

export async function getCachedPyqTree(
  examFilter: TreeExamFilter = 'UPSC_CSE_PRE',
): Promise<PyqTreeResult> {
  const cache = getTreeCacheMap();
  const cached = cache.get(examFilter);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const [rows, usageRows] = await Promise.all([
    prisma.questionDraft.findMany({
      select: {
        id: true,
        srcSubject: true,
        srcTopic: true,
        srcTheme: true,
        examCode: true,
        examName: true,
        contentStatus: true,
        syllabusOrder: true,
      },
    }),
    prisma.lectureUsage.findMany({
      select: {
        questionId: true,
        presentedAt: true,
      },
    }),
  ]);

  const data = buildPyqTreeFromRows(rows, usageRows, examFilter);
  cache.set(examFilter, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    data,
  });
  return data;
}

export async function getFacultyPrefs(facultyId: string | null | undefined) {
  if (!facultyId) {
    return {
      defaultExam: 'UPSC_CSE_PRE' as TreeExamFilter,
      includeCds: false,
      sortOrder: 'syllabus',
      partSize: 20,
      secondsPerQuestion: 75,
      lastSectionPath: null as string | null,
    };
  }
  const prefs = await prisma.facultyPrefs.findUnique({
    where: { facultyId },
  });
  return {
    defaultExam: normalizeExamFilter(prefs?.defaultExam),
    includeCds: prefs?.includeCds ?? false,
    sortOrder: prefs?.sortOrder ?? 'syllabus',
    partSize: prefs?.partSize ?? 20,
    secondsPerQuestion: prefs?.secondsPerQuestion ?? 75,
    lastSectionPath: prefs?.lastSectionPath ?? null,
  };
}
