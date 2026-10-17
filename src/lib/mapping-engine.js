import { prisma, withRetry } from './prisma.js';

export const MAPPING_SUBJECTS = [
  'Geography',
  'Environment',
  'Art & Culture',
  'Ancient History',
  'International Relations',
  // Extended subjects present in CDS/UPSC mapping PYQs
  'Agriculture',
  'Modern History',
  'Economy',
  'Medieval History',
];

export const MAP_CATEGORIES = [
  'World – places in news',
  'World – countries, borders & seas',
  'World – physical features',
  'India – relief, hills, coasts & islands',
  'India – rivers, lakes, reservoirs & glaciers',
  'Protected areas (NPs, WLS, tiger reserves)',
  'Wetlands & Ramsar sites',
  'Landforms & volcanoes',
  'Minerals & resources by place',
  'Energy & industrial sites',
  'Ports, highways & corridors',
  'Strategic projects abroad',
  'Tribes, communities & cultural places',
  'Historical & archaeological sites',
];

export const INDIA_STATIC_CATEGORIES = [
  'India – relief, hills, coasts & islands',
  'India – rivers, lakes, reservoirs & glaciers',
  'Protected areas (NPs, WLS, tiger reserves)',
  'Wetlands & Ramsar sites',
  'Minerals & resources by place',
  'Energy & industrial sites',
  'Ports, highways & corridors',
  'Tribes, communities & cultural places',
  'Historical & archaeological sites',
];

export const WORLD_STATIC_CATEGORIES = [
  'World – countries, borders & seas',
  'World – physical features',
  'Landforms & volcanoes',
  'World – places in news',
  'Strategic projects abroad',
];

export const IR_MAP_CATEGORIES = [
  'World – places in news',
  'World – countries, borders & seas',
  'Strategic projects abroad',
  'Ports, highways & corridors',
];

const PRIORITY_RANK = {
  High: 3,
  Medium: 2,
  Low: 1,
};

/**
 * Strips markdown link formatting if present, e.g.
 * "[https://www.pib.gov.in/...](https://www.pib.gov.in/...)" -> "https://www.pib.gov.in/..."
 */
export function sanitizeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  const mdMatch = trimmed.match(/^\[.*?\]\((https?:\/\/[^\s)]+)\)$/i);
  if (mdMatch) return mdMatch[1];
  return trimmed;
}

/**
 * Normalizes a value to an array of unique non-empty trimmed strings
 */
export function normalizeStringArray(val) {
  if (!val) return [];
  const arr = Array.isArray(val) ? val : [val];
  const seen = new Set();
  const out = [];
  for (const item of arr) {
    if (typeof item === 'string') {
      const s = item.trim();
      if (s && !seen.has(s)) {
        seen.add(s);
        out.push(s);
      }
    }
  }
  return out;
}

/**
 * Merges two string arrays preserving order and uniqueness
 */
export function unionStringArrays(existing = [], incoming = []) {
  return normalizeStringArray([...(existing || []), ...(incoming || [])]);
}

/**
 * Merges newsTriggers arrays avoiding duplicate URLs or identical (date + newsHook)
 */
export function mergeNewsTriggers(existingTriggers = [], incomingTriggers = []) {
  const existingArr = Array.isArray(existingTriggers) ? existingTriggers : [];
  const incomingArr = Array.isArray(incomingTriggers) ? incomingTriggers : [];

  const sanitizedExisting = existingArr.map((t) => ({
    date: t?.date || '',
    source: t?.source || '',
    url: sanitizeUrl(t?.url || ''),
    newsHook: (t?.newsHook || '').trim(),
  }));

  const seenUrls = new Set(
    sanitizedExisting.map((t) => t.url.toLowerCase()).filter(Boolean)
  );
  const seenDateHooks = new Set(
    sanitizedExisting
      .map((t) => `${t.date}|${t.newsHook.toLowerCase()}`)
      .filter((k) => k !== '|')
  );

  const merged = [...sanitizedExisting];

  for (const raw of incomingArr) {
    if (!raw || typeof raw !== 'object') continue;
    const item = {
      date: raw.date || '',
      source: raw.source || '',
      url: sanitizeUrl(raw.url || ''),
      newsHook: (raw.newsHook || '').trim(),
    };
    const urlKey = item.url.toLowerCase();
    const dhKey = `${item.date}|${item.newsHook.toLowerCase()}`;

    const isDupUrl = urlKey && seenUrls.has(urlKey);
    const isDupDh = item.newsHook && seenDateHooks.has(dhKey);

    if (!isDupUrl && !isDupDh) {
      if (urlKey) seenUrls.add(urlKey);
      if (item.newsHook) seenDateHooks.add(dhKey);
      merged.push(item);
    }
  }

  // Sort triggers newest first
  merged.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return merged;
}

/**
 * Returns the higher priority between existing and incoming ("High" > "Medium" > "Low")
 */
export function upgradePriority(existingPriority = 'Medium', incomingPriority = 'Medium') {
  const rankA = PRIORITY_RANK[existingPriority] || 2;
  const rankB = PRIORITY_RANK[incomingPriority] || 2;
  return rankB >= rankA ? incomingPriority : existingPriority;
}

/**
 * Parses a raw JSONL string (or JSON array) into an array of objects with line numbers
 */
export function parseJsonlInput(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { records: [], parseErrors: ['Empty input'] };
  }
  const trimmed = rawText.trim();
  if (!trimmed) {
    return { records: [], parseErrors: ['Empty input'] };
  }

  // Support both a JSON array and standard newline-delimited JSONL
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const arr = JSON.parse(trimmed);
      if (Array.isArray(arr)) {
        return {
          records: arr.map((data, idx) => ({ lineNo: idx + 1, data })),
          parseErrors: [],
        };
      }
    } catch (_) {
      // Fall through to line-by-line JSONL parsing
    }
  }

  const lines = trimmed.split(/\r?\n/);
  const records = [];
  const parseErrors = [];

  lines.forEach((line, idx) => {
    const clean = line.trim();
    if (!clean) return;
    try {
      const data = JSON.parse(clean);
      records.push({ lineNo: idx + 1, data });
    } catch (err) {
      parseErrors.push(`Line ${idx + 1}: Invalid JSON (${err.message})`);
    }
  });

  return { records, parseErrors };
}

/**
 * Idempotent UPSERT for Places in News (.jsonl)
 * Matches on `slug`.
 * - If `slug` does not exist: inserts full record.
 * - If `slug` exists: appends new newsTriggers, merges staticFacts/similarPYQ/aliases/neighbours/mapCategory,
 *   updates date to latest trigger date, and upgrades priority if higher.
 */
export async function ingestPinJsonl(rawText) {
  const { records, parseErrors } = parseJsonlInput(rawText);

  let insertedCount = 0;
  let updatedCount = 0;
  const results = [];
  const errors = [...parseErrors];

  for (const { lineNo, data } of records) {
    try {
      const slug = (data.slug || '').trim().toLowerCase();
      const place = (data.place || '').trim();
      if (!slug || !place) {
        errors.push(`Line ${lineNo}: Missing required "slug" or "place"`);
        continue;
      }

      const incomingPinId = (data.id || data.pinId || `PIN-${Date.now()}-${lineNo}`).trim();
      const incomingCategories = normalizeStringArray(data.mapCategory);
      const incomingAliases = normalizeStringArray(data.aliases);
      const incomingNeighbours = normalizeStringArray(data.neighbours);
      const incomingStaticFacts = normalizeStringArray(data.staticFacts);
      const incomingSimilarPyq = normalizeStringArray(data.similarPYQ);
      const incomingTriggers = mergeNewsTriggers([], data.newsTriggers || []);

      const lat =
        typeof data?.coordinates?.lat === 'number'
          ? data.coordinates.lat
          : typeof data?.lat === 'number'
            ? data.lat
            : null;
      const lng =
        typeof data?.coordinates?.lng === 'number'
          ? data.coordinates.lng
          : typeof data?.lng === 'number'
            ? data.lng
            : null;

      const existing = await withRetry(() =>
        prisma.placeInNews.findUnique({ where: { slug } })
      );

      if (!existing) {
        const latestTriggerDate =
          incomingTriggers[0]?.date || data.date || new Date().toISOString().slice(0, 10);

        const created = await withRetry(() =>
          prisma.placeInNews.create({
            data: {
              pinId: incomingPinId,
              slug,
              date: latestTriggerDate,
              targetExamYear: Number(data.targetExamYear) || 2027,
              subject: (data.subject || 'Geography').trim(),
              mapCategory: incomingCategories,
              hookCategory: data.hookCategory || null,
              priority: data.priority || 'Medium',
              place,
              aliases: incomingAliases,
              placeType: data.placeType || null,
              regionScope: data.regionScope || 'India',
              locatedIn: data.locatedIn || null,
              lat,
              lng,
              coordinates: lat !== null && lng !== null ? { lat, lng } : data.coordinates || null,
              neighbours: incomingNeighbours,
              staticFacts: incomingStaticFacts,
              newsTriggers: incomingTriggers,
              upscAngle: data.upscAngle || null,
              similarPYQ: incomingSimilarPyq,
            },
          })
        );
        insertedCount++;
        results.push({ slug, action: 'INSERTED', pinId: created.pinId, place: created.place });
      } else {
        const mergedTriggers = mergeNewsTriggers(existing.newsTriggers, incomingTriggers);
        const mergedFacts = unionStringArrays(existing.staticFacts, incomingStaticFacts);
        const mergedSimilarPyq = unionStringArrays(existing.similarPYQ, incomingSimilarPyq);
        const mergedAliases = unionStringArrays(existing.aliases, incomingAliases);
        const mergedNeighbours = unionStringArrays(existing.neighbours, incomingNeighbours);
        const mergedCategories = unionStringArrays(existing.mapCategory, incomingCategories);

        const candidateDates = [
          existing.date,
          data.date,
          ...(mergedTriggers.map((t) => t.date).filter(Boolean)),
        ].filter(Boolean);
        candidateDates.sort((a, b) => b.localeCompare(a));
        const latestDate = candidateDates[0] || existing.date;

        const upgradedPriority = upgradePriority(
          existing.priority,
          data.priority || existing.priority
        );

        const updatedUpscAngle = data.upscAngle
          ? {
              preferredFormat:
                data.upscAngle.preferredFormat || existing.upscAngle?.preferredFormat || '',
              framing: data.upscAngle.framing || existing.upscAngle?.framing || '',
              distractorPool: unionStringArrays(
                existing.upscAngle?.distractorPool || [],
                data.upscAngle.distractorPool || []
              ),
            }
          : existing.upscAngle;

        const updated = await withRetry(() =>
          prisma.placeInNews.update({
            where: { slug },
            data: {
              date: latestDate,
              targetExamYear: Number(data.targetExamYear) || existing.targetExamYear,
              subject: data.subject ? data.subject.trim() : existing.subject,
              mapCategory: mergedCategories,
              hookCategory: data.hookCategory || existing.hookCategory,
              priority: upgradedPriority,
              place: place || existing.place,
              aliases: mergedAliases,
              placeType: data.placeType || existing.placeType,
              regionScope: data.regionScope || existing.regionScope,
              locatedIn: data.locatedIn || existing.locatedIn,
              lat: lat !== null ? lat : existing.lat,
              lng: lng !== null ? lng : existing.lng,
              coordinates:
                lat !== null && lng !== null
                  ? { lat, lng }
                  : existing.coordinates,
              neighbours: mergedNeighbours,
              staticFacts: mergedFacts,
              newsTriggers: mergedTriggers,
              upscAngle: updatedUpscAngle,
              similarPYQ: mergedSimilarPyq,
            },
          })
        );
        updatedCount++;
        results.push({ slug, action: 'MERGED', pinId: updated.pinId, place: updated.place });
      }
    } catch (err) {
      errors.push(`Line ${lineNo} (${data?.slug || data?.id || 'unknown'}): ${err.message}`);
    }
  }

  return {
    totalParsed: records.length,
    insertedCount,
    updatedCount,
    errorCount: errors.length,
    errors,
    results,
  };
}

/**
 * Idempotent UPSERT for Mapping PYQs (`upsc_cds_mapping_pyqs.jsonl` / `upsc_mapping_pyqs.jsonl`)
 * Links each record to `Question` via `Question.dedupHash == id` and enriches `Question` with mapping tags.
 */
export async function ingestMappingPyqsJsonl(rawText) {
  const { records, parseErrors } = parseJsonlInput(rawText);

  let upsertedCount = 0;
  let linkedToQuestionCount = 0;
  const errors = [...parseErrors];

  // Preload matching Questions by dedupHash for fast batch lookup
  const allIds = records.map((r) => (r.data?.id || '').trim()).filter(Boolean);
  const matchingQuestions = await withRetry(() =>
    prisma.question.findMany({
      where: { dedupHash: { in: allIds } },
      select: { id: true, dedupHash: true, mapCategory: true },
    })
  );
  const questionByDedupHash = new Map(matchingQuestions.map((q) => [q.dedupHash, q]));

  for (const { lineNo, data } of records) {
    try {
      const id = (data.id || '').trim();
      if (!id || !data.stem) {
        errors.push(`Line ${lineNo}: Missing required "id" or "stem"`);
        continue;
      }

      const categories = normalizeStringArray(data.mapCategory);
      const matchedQuestion = questionByDedupHash.get(id);
      const newsLagMonths =
        data.newsLagMonths !== null &&
        data.newsLagMonths !== undefined &&
        data.newsLagMonths !== ''
          ? Number(data.newsLagMonths)
          : null;

      await withRetry(() =>
        prisma.mappingPyq.upsert({
          where: { id },
          create: {
            id,
            questionId: matchedQuestion?.id || null,
            exam: (data.exam || data.examName || 'UPSC CSE Prelims').trim(),
            examYear: Number(data.examYear) || 2023,
            subject: (data.subject || data.srcSubject || 'Geography').trim(),
            mapCategory: categories,
            affairsType: data.affairsType || null,
            newsLagMonths,
            selection: data.selection || null,
            stem: data.stem,
            options: data.options || [],
            correctLabel: (data.correctLabel || 'a').trim(),
            answerText: data.answerText || null,
          },
          update: {
            questionId: matchedQuestion?.id || undefined,
            exam: (data.exam || data.examName || 'UPSC CSE Prelims').trim(),
            examYear: Number(data.examYear) || 2023,
            subject: (data.subject || data.srcSubject || 'Geography').trim(),
            mapCategory: categories,
            affairsType: data.affairsType ?? undefined,
            newsLagMonths,
            selection: data.selection ?? undefined,
            stem: data.stem,
            options: data.options || [],
            correctLabel: (data.correctLabel || 'a').trim(),
            answerText: data.answerText ?? undefined,
          },
        })
      );
      upsertedCount++;

      if (matchedQuestion) {
        const mergedCats = unionStringArrays(matchedQuestion.mapCategory || [], categories);
        await withRetry(() =>
          prisma.question.update({
            where: { id: matchedQuestion.id },
            data: {
              isMapping: true,
              mapCategory: mergedCats,
              affairsType: data.affairsType || null,
              newsLagMonths,
              mappingSelection: data.selection || null,
              answerText: data.answerText || null,
            },
          })
        );
        linkedToQuestionCount++;
      }
    } catch (err) {
      errors.push(`Line ${lineNo} (${data?.id || 'unknown'}): ${err.message}`);
    }
  }

  return {
    totalParsed: records.length,
    upsertedCount,
    linkedToQuestionCount,
    errorCount: errors.length,
    errors,
  };
}

/**
 * Resolves `similarPYQ` string arrays on PIN records against `MappingPyq` (with fallback to `Question.dedupHash`)
 */
export async function resolveSimilarPyqsForPins(pins = []) {
  if (!Array.isArray(pins) || pins.length === 0) return [];

  const allPyqIds = Array.from(
    new Set(pins.flatMap((p) => (Array.isArray(p.similarPYQ) ? p.similarPYQ : [])).filter(Boolean))
  );

  if (allPyqIds.length === 0) {
    return pins.map((p) => ({ ...p, resolvedSimilarPYQs: [] }));
  }

  const matchingQuestions = await withRetry(() =>
    prisma.question.findMany({
      where: {
        OR: [
          { id: { in: allPyqIds } },
          { dedupHash: { in: allPyqIds } },
        ],
      },
      include: { subject: { select: { name: true } } },
    })
  );

  const resolvedMap = new Map();
  for (const q of matchingQuestions) {
    const qId = q.dedupHash || q.id;
    const opts = Array.isArray(q.options) ? q.options : [];
    const matchedOpt = opts.find(
      (o) => (o.label || '').toLowerCase() === (q.correctLabel || '').toLowerCase()
    );

    const item = {
      id: qId,
      questionId: q.id,
      exam: q.examName === 'UPSC CSE Pre' ? 'UPSC CSE Prelims' : (q.examName || 'UPSC CSE Prelims'),
      examYear: q.examYear,
      subject: q.subject?.name || 'Geography',
      mapCategory: q.mapCategory || [],
      affairsType: q.affairsType || null,
      newsLagMonths: q.newsLagMonths || null,
      selection: q.mappingSelection || null,
      stem: q.stem,
      options: q.options || [],
      correctLabel: q.correctLabel,
      answerText: q.answerText || matchedOpt?.text || null,
      explanation: q.explanation || null,
      analysis: q.analysis || null,
    };

    resolvedMap.set(qId, item);
    if (q.id && q.id !== qId) {
      resolvedMap.set(q.id, item);
    }
  }

  return pins.map((p) => ({
    ...p,
    resolvedSimilarPYQs: (p.similarPYQ || [])
      .map((pyqId) => resolvedMap.get(pyqId))
      .filter(Boolean),
  }));
}
