import { isDeepDiveReady } from '../pyqExplanationHelper.js';

export type ScrapeLogEvent = (ev: {
  type: 'scrape_suspect';
  userId: string;
  ipFull: string | null;
  detail: Record<string, unknown>;
}) => Promise<unknown>;

async function defaultWriteScrapeEvent(ev: {
  type: 'scrape_suspect';
  userId: string;
  ipFull: string | null;
  detail: Record<string, unknown>;
}) {
  try {
    const mod = await import('../prisma.js');
    const prisma = mod.default;
    await prisma.securityEvent.create({ data: ev });
  } catch {
    // Non-blocking telemetry
  }
}

export const ALLOWED_PYQ_PAGE_SIZES = [25, 50, 100] as const;

export function parsePyqPageSize(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined || raw === '') return 25;
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
  if (!Number.isInteger(n) || !(ALLOWED_PYQ_PAGE_SIZES as readonly number[]).includes(n)) {
    return null;
  }
  return n;
}

export function normalizeOptions(opts: unknown): Array<{ label: string; text: string }> {
  if (Array.isArray(opts)) return opts as Array<{ label: string; text: string }>;
  if (typeof opts === 'string') {
    try {
      const parsed = JSON.parse(opts);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Light list row (< 1 KB): omits `explanation`, `rawText`, and `assets` payloads.
 */
export function toLightPyqRow(q: any) {
  const expl = typeof q.explanation === 'string' ? q.explanation.trim() : '';
  return {
    id: q.id,
    questionNo: q.questionNo ?? null,
    examName: q.examName ?? null,
    examYear: q.examYear ?? null,
    paper: q.paper ?? null,
    srcSubject: q.srcSubject ?? null,
    srcTopic: q.srcTopic ?? null,
    srcTheme: q.srcTheme ?? null,
    stem: typeof q.stem === 'string' ? q.stem : '',
    options: normalizeOptions(q.options),
    correctLabel: q.correctLabel ?? null,
    hasExplanation: expl.length > 0,
    isDeepDiveReady: expl.length > 0 && isDeepDiveReady(q),
    difficulty: q.difficulty ?? null,
    createdAt: q.createdAt ?? null,
  };
}

type WindowBucket = {
  listHits: number[];
  distinctIds: Map<string, number>;
};

function getRateStore(): Map<string, WindowBucket> {
  const g = globalThis as any;
  if (!g.__pyqScrapeBuckets) {
    g.__pyqScrapeBuckets = new Map<string, WindowBucket>();
  }
  return g.__pyqScrapeBuckets;
}

export function resetPyqScrapeBuckets() {
  getRateStore().clear();
}

/**
 * Enforces:
 * - max 60 list requests / 10 min per user
 * - max 400 distinct questions / hour per user (across list + detail)
 * Logs `SecurityEvent(scrape_suspect)` when exceeded.
 */
export async function enforcePyqScrapeLimits(params: {
  userId: string;
  isListRequest?: boolean;
  questionIds?: string[];
  ip?: string | null;
  nowMs?: number;
  logEvent?: ScrapeLogEvent;
}): Promise<{ allowed: true } | { allowed: false; status: 429; error: string }> {
  const now = params.nowMs ?? Date.now();
  const store = getRateStore();
  let bucket = store.get(params.userId);
  if (!bucket) {
    bucket = { listHits: [], distinctIds: new Map() };
    store.set(params.userId, bucket);
  }

  const tenMinAgo = now - 10 * 60 * 1000;
  const oneHourAgo = now - 60 * 60 * 1000;

  bucket.listHits = bucket.listHits.filter((ts) => ts > tenMinAgo);
  for (const [qid, ts] of bucket.distinctIds.entries()) {
    if (ts <= oneHourAgo) bucket.distinctIds.delete(qid);
  }

  const logger = params.logEvent ?? defaultWriteScrapeEvent;

  if (params.isListRequest) {
    if (bucket.listHits.length >= 60) {
      await logger({
        type: 'scrape_suspect',
        userId: params.userId,
        ipFull: params.ip ?? null,
        detail: { reason: 'pyq_list_rate_limit', count10m: bucket.listHits.length },
      }).catch(() => {});
      return {
        allowed: false,
        status: 429,
        error: 'Rate limit exceeded: max 60 PYQ list requests per 10 minutes.',
      };
    }
    bucket.listHits.push(now);
  }

  for (const qid of params.questionIds || []) {
    if (qid) bucket.distinctIds.set(qid, now);
  }

  if (bucket.distinctIds.size > 400) {
    await logger({
      type: 'scrape_suspect',
      userId: params.userId,
      ipFull: params.ip ?? null,
      detail: { reason: 'pyq_distinct_400_1h', distinct1h: bucket.distinctIds.size },
    }).catch(() => {});
    return {
      allowed: false,
      status: 429,
      error: 'Rate limit exceeded: max 400 distinct PYQ questions per hour.',
    };
  }

  return { allowed: true };
}
