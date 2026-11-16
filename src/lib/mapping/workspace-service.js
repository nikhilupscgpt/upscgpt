import { prisma, withRetry } from '../prisma.js';
import { CURATED_MAPPING_NODES } from '../static-mapping-data.js';
import { MAP_CATEGORIES, MAPPING_SUBJECTS } from '../mapping-engine.js';

/**
 * Pure builder that merges PlaceInNews (filtering archived & child rows, applying STATIC-* overrides),
 * Question PYQs (indexed by dedupHash and id), Curated static nodes, and Organization records.
 */
export function buildMappingWorkspace({
  dbPins = [],
  dbQuestions = [],
  dbOrgs = [],
  curatedNodes: rawCurated = CURATED_MAPPING_NODES,
} = {}) {
  const activePins = dbPins.filter(
    (p) => p && p.tier !== 'archived' && (p.parentId === null || p.parentId === undefined)
  );

  const pyqMap = new Map();
  const formattedPyqs = dbQuestions.map((q) => {
    const qId = q.dedupHash || q.id;
    const exam =
      q.examName === 'UPSC CSE Pre'
        ? 'UPSC CSE Prelims'
        : q.examName || 'UPSC CSE Prelims';

    let ansText = q.answerText;
    if (!ansText && Array.isArray(q.options)) {
      const correctOpt = q.options.find(
        (o) => (o.label || '').toLowerCase() === (q.correctLabel || '').toLowerCase()
      );
      if (correctOpt) ansText = correctOpt.text;
    }

    const item = {
      id: qId,
      questionId: q.id,
      dedupHash: q.dedupHash || null,
      exam,
      examYear: q.examYear || 2024,
      subject: q.subject?.name || 'Geography',
      mapCategory: q.mapCategory || [],
      affairsType: q.affairsType,
      newsLagMonths: q.newsLagMonths,
      selection: q.mappingSelection,
      isMapping: Boolean(q.isMapping),
      stem: q.stem,
      options: q.options || [],
      correctLabel: q.correctLabel,
      answerText: ansText,
      explanation: q.explanation || null,
      analysis: q.analysis || null,
    };

    pyqMap.set(qId, item);
    if (q.id && q.id !== qId) {
      pyqMap.set(q.id, item);
    }
    return item;
  });

  const staticBySlug = new Map(rawCurated.map((n) => [n.slug, n]));
  const dbSlugs = new Set(activePins.map((p) => p.slug));

  const dbNodes = activePins.map((p) => {
    const staticMatch = staticBySlug.get(p.slug);
    const isStaticOverride = (p.pinId || '').startsWith('STATIC-');
    const resolvedPyqs = (p.similarPYQ || [])
      .map((id) => pyqMap.get(id))
      .filter(Boolean)
      .sort((a, b) => (b.examYear || 0) - (a.examYear || 0));

    return {
      id: p.pinId || p.id,
      dbId: p.id,
      slug: p.slug,
      date: isStaticOverride ? null : p.date,
      targetExamYear: p.targetExamYear,
      pillar: isStaticOverride ? p.hookCategory || staticMatch?.pillar || 'INDIA_STATIC' : 'PIN',
      isPin: !isStaticOverride,
      regionScope: p.regionScope || 'India',
      subject: p.subject,
      mapCategory: p.mapCategory || [],
      hookCategory: p.hookCategory,
      priority: p.priority || 'High',
      place: p.place,
      aliases: p.aliases || [],
      placeType: p.placeType || 'Place in News',
      locatedIn: p.locatedIn || {},
      lat: p.lat ?? p.coordinates?.lat ?? null,
      lng: p.lng ?? p.coordinates?.lng ?? null,
      shape: staticMatch?.shape || null,
      neighbours: p.neighbours || [],
      staticFacts: p.staticFacts || [],
      newsTriggers: Array.isArray(p.newsTriggers) ? p.newsTriggers : [],
      upscAngle: p.upscAngle || null,
      similarPYQ: p.similarPYQ || [],
      resolvedSimilarPYQs: resolvedPyqs,
      tier: p.tier || 'daily',
      isMaster: p.tier === 'master',
      linkedIssueSlug: p.linkedIssueSlug || staticMatch?.linkedIssueSlug || null,
      linkedIssueTitle: p.linkedIssueTitle || staticMatch?.linkedIssueTitle || null,
      linkedIssueDomain: p.linkedIssueDomain || staticMatch?.linkedIssueDomain || null,
      riverDetails: staticMatch?.riverDetails || null,
      imageUrl: staticMatch?.imageUrl || null,
    };
  });

  const curatedNodes = rawCurated
    .filter((n) => !dbSlugs.has(n.slug))
    .map((n) => {
      const resolvedPyqs = (n.similarPYQ || [])
        .map((id) => pyqMap.get(id))
        .filter(Boolean)
        .sort((a, b) => (b.examYear || 0) - (a.examYear || 0));

      return {
        ...n,
        isPin: false,
        date: null,
        newsTriggers: n.newsTriggers || [],
        resolvedSimilarPYQs: resolvedPyqs,
      };
    });

  const allNodes = [...dbNodes, ...curatedNodes];
  const pinNodesCount = allNodes.filter((n) => n.isPin).length;
  const curatedNodesCount = allNodes.filter((n) => !n.isPin).length;

  return {
    counts: {
      totalNodes: allNodes.length,
      pinCount: pinNodesCount,
      curatedCount: curatedNodesCount,
      pyqCount: formattedPyqs.length,
      orgCount: dbOrgs.length,
    },
    nodes: allNodes,
    pyqs: formattedPyqs,
    organizations: dbOrgs,
    taxonomy: {
      subjects: MAPPING_SUBJECTS,
      mapCategories: MAP_CATEGORIES,
    },
  };
}

/**
 * Fetches live PostgreSQL data and builds the unified Mapping Workspace payload.
 */
export async function getMappingWorkspaceData() {
  const [dbPins, dbQuestions, dbOrgs] = await Promise.all([
    withRetry(() =>
      prisma.placeInNews.findMany({
        where: {
          tier: { not: 'archived' },
          parentId: null,
        },
        orderBy: [{ date: 'desc' }, { updatedAt: 'desc' }],
      })
    ),
    withRetry(() =>
      prisma.question.findMany({
        where: {
          OR: [
            { isMapping: true },
            { mapCategory: { isEmpty: false } },
            {
              subject: {
                name: {
                  in: [
                    'Geography',
                    'Environment',
                    'Environment & Ecology',
                    'Art & Culture',
                    'Ancient History',
                    'Medieval History',
                    'Modern History',
                    'Agriculture',
                  ],
                },
              },
            },
          ],
        },
        select: {
          id: true,
          dedupHash: true,
          examName: true,
          examYear: true,
          stem: true,
          options: true,
          correctLabel: true,
          answerText: true,
          explanation: true,
          analysis: true,
          mapCategory: true,
          affairsType: true,
          newsLagMonths: true,
          mappingSelection: true,
          isMapping: true,
          subject: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [{ examYear: 'desc' }, { id: 'asc' }],
      })
    ),
    withRetry(() =>
      prisma.organization.findMany({
        orderBy: { shortName: 'asc' },
      })
    ),
  ]);

  return buildMappingWorkspace({ dbPins, dbQuestions, dbOrgs });
}

/**
 * Classifies a workspace node into the 4-pillar user flow.
 */
export function classifyNodePillar(node) {
  if (!node) return 'INDIA_STATIC';
  if (node.isPin) return 'PIN';
  if (node.pillar === 'IR') return 'IR';
  const scope = (node.regionScope || '').toLowerCase();
  return scope === 'world' ? 'WORLD_STATIC' : 'INDIA_STATIC';
}

/**
 * Resolves an ordered list of mappingIds (nodes, organizations, or Question PYQs)
 * into Studio Presenter items with full resolved PYQ explanations & map metadata.
 */
export function resolveMappingDeckItems(requestedIds = [], workspace = null) {
  if (!workspace) return [];
  const { nodes = [], pyqs = [], organizations = [] } = workspace;

  const nodeMap = new Map();
  for (const n of nodes) {
    if (n.id) nodeMap.set(n.id, n);
    if (n.dbId) nodeMap.set(n.dbId, n);
    if (n.slug) nodeMap.set(n.slug, n);
  }

  const pyqMap = new Map();
  for (const q of pyqs) {
    if (q.id) pyqMap.set(q.id, q);
    if (q.questionId) pyqMap.set(q.questionId, q);
    if (q.dedupHash) pyqMap.set(q.dedupHash, q);
  }

  const orgMap = new Map();
  for (const o of organizations) {
    if (o.id) orgMap.set(o.id, o);
    if (o.slug) orgMap.set(o.slug, o);
    if (o.shortName) orgMap.set(`org:${o.shortName}`, o);
  }

  const ids = requestedIds.length > 0 ? requestedIds : nodes.slice(0, 25).map((n) => n.id);
  const resolved = [];

  for (const id of ids) {
    if (nodeMap.has(id)) {
      const n = nodeMap.get(id);
      const pillar = classifyNodePillar(n);
      const located =
        n.locatedIn && typeof n.locatedIn === 'object'
          ? Object.values(n.locatedIn).filter(Boolean).join(', ')
          : n.regionScope || 'India';

      resolved.push({
        id: n.id,
        type: 'mapping',
        sourceType: pillar,
        pillar,
        slug: n.slug,
        title: n.place,
        place: n.place,
        placeType: n.placeType || (n.isPin ? 'Place in News' : 'Geographic Feature'),
        regionScope: n.regionScope || 'India',
        category: Array.isArray(n.mapCategory) ? n.mapCategory : [n.mapCategory].filter(Boolean),
        locationText: located,
        coordinates: n.lat != null && n.lng != null ? { lat: n.lat, lng: n.lng } : null,
        shape: n.shape || null,
        neighbours: n.neighbours || [],
        staticFacts: Array.isArray(n.staticFacts) ? n.staticFacts : [],
        newsHook:
          Array.isArray(n.newsTriggers) && n.newsTriggers.length > 0
            ? n.newsTriggers[0]?.newsHook || n.newsTriggers[0]?.what
            : null,
        newsTriggers: n.newsTriggers || [],
        upscAngle: n.upscAngle || null,
        similarPYQs: n.similarPYQ || [],
        resolvedPYQs: (n.resolvedSimilarPYQs || []).map((q) => ({
          id: q.id,
          questionId: q.questionId,
          stem: q.stem,
          options: q.options || [],
          correctLabel: q.correctLabel,
          answerText: q.answerText,
          explanation: q.explanation,
          analysis: q.analysis,
          exam: q.exam,
          examYear: q.examYear,
        })),
        tier: n.tier || null,
        isMaster: Boolean(n.isMaster),
        linkedIssueSlug: n.linkedIssueSlug || null,
        linkedIssueTitle: n.linkedIssueTitle || null,
        riverDetails: n.riverDetails || null,
        imageUrl: n.imageUrl || null,
        priority: n.priority || 'High',
      });
      continue;
    }

    if (orgMap.has(id)) {
      const o = orgMap.get(id);
      resolved.push({
        id: o.id,
        type: 'mapping',
        sourceType: 'ORG',
        pillar: 'IR',
        slug: o.slug || o.id,
        title: o.shortName || o.name,
        place: o.name || o.shortName,
        placeType: o.orgType || 'International Organisation',
        regionScope: 'World',
        category: [o.orgType || 'IR & Organizations'],
        locationText: o.headquarters || 'Global',
        coordinates:
          typeof o.hqLat === 'number' && typeof o.hqLng === 'number'
            ? { lat: o.hqLat, lng: o.hqLng }
            : null,
        staticFacts: [
          o.headquarters ? `Headquarters: ${o.headquarters}` : null,
          o.foundedYear ? `Founded: ${o.foundedYear}` : null,
          o.indiaMember !== undefined ? `India Member: ${o.indiaMember ? 'Yes' : 'No'}` : null,
          o.mandate || o.description || null,
        ].filter(Boolean),
        resolvedPYQs: [],
        priority: 'High',
      });
      continue;
    }

    if (pyqMap.has(id)) {
      const q = pyqMap.get(id);
      resolved.push({
        id: q.id,
        type: 'mapping',
        sourceType: 'PYQ',
        pillar: 'PYQ',
        title: q.stem,
        place: (q.mapCategory || [])[0] || q.subject || 'Mapping PYQ',
        stem: q.stem,
        options: q.options || [],
        correctLabel: q.correctLabel || '',
        answerText: q.answerText || '',
        explanation: q.explanation || null,
        analysis: q.analysis || null,
        exam: q.exam || 'UPSC CSE Prelims',
        examYear: q.examYear,
        subject: q.subject || 'Geography',
        regionScope: (q.mapCategory || []).some((c) => c.toLowerCase().includes('india'))
          ? 'India'
          : 'World',
        category: q.mapCategory || [],
        locationText: `${q.exam} ${q.examYear}`,
        staticFacts: q.answerText ? [q.answerText] : [],
        resolvedPYQs: [q],
        priority: 'High',
      });
    }
  }

  return resolved;
}
