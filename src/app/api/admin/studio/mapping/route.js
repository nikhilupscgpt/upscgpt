import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import {
  getMappingWorkspaceData,
  classifyNodePillar,
} from '@/lib/mapping/workspace-service';

export const dynamic = 'force-dynamic';

function formatNodeForStudio(n) {
  const pillar = classifyNodePillar(n);
  const located =
    n.locatedIn && typeof n.locatedIn === 'object'
      ? Object.values(n.locatedIn).filter(Boolean).join(', ')
      : n.regionScope === 'World'
      ? 'Global'
      : 'India';

  return {
    id: n.id,
    dbId: n.dbId || null,
    sourceType: pillar,
    pillar,
    isPin: Boolean(n.isPin),
    tier: n.tier || null,
    isMaster: Boolean(n.isMaster),
    slug: n.slug,
    title: n.place,
    place: n.place,
    aliases: n.aliases || [],
    placeType: n.placeType || (n.isPin ? 'Place in News' : 'Geographic Feature'),
    regionScope: n.regionScope || 'India',
    subject: n.subject || null,
    category: Array.isArray(n.mapCategory)
      ? n.mapCategory
      : [n.mapCategory || 'Physical Geography'].filter(Boolean),
    locationText: located,
    coordinates: n.lat != null && n.lng != null ? { lat: n.lat, lng: n.lng } : null,
    hasShape: Boolean(n.shape),
    neighbours: n.neighbours || [],
    staticFacts: Array.isArray(n.staticFacts) ? n.staticFacts : [],
    newsHook:
      Array.isArray(n.newsTriggers) && n.newsTriggers.length > 0
        ? n.newsTriggers[0]?.newsHook || n.newsTriggers[0]?.what || null
        : null,
    newsTriggers: Array.isArray(n.newsTriggers) ? n.newsTriggers : [],
    upscAngle: n.upscAngle || null,
    similarPYQs: n.similarPYQ || [],
    resolvedPYQs: (n.resolvedSimilarPYQs || []).map((q) => ({
      id: q.id,
      questionId: q.questionId,
      exam: q.exam,
      examYear: q.examYear,
      stem: q.stem,
      hasExplanation: Boolean(q.explanation),
    })),
    date: n.date || null,
    targetExamYear: n.targetExamYear || null,
    linkedIssueSlug: n.linkedIssueSlug || null,
    linkedIssueTitle: n.linkedIssueTitle || null,
    imageUrl: n.imageUrl || null,
    imageCaption: n.isPin ? `${n.place} Satellite & Map Context` : `${n.place} Physical Map`,
    priority: n.priority || 'Medium',
    riverDetails: n.riverDetails || null,
  };
}

function formatOrgForStudio(o) {
  return {
    id: o.id,
    sourceType: 'ORG',
    pillar: 'IR',
    isOrg: true,
    slug: o.slug || o.id,
    title: o.shortName ? `${o.shortName} — ${o.name}` : o.name,
    place: o.name || o.shortName,
    shortName: o.shortName || '',
    aliases: [o.shortName, o.name].filter(Boolean),
    placeType: o.orgType || 'International Organisation',
    regionScope: 'World',
    category: [o.orgType || 'IR & Organizations'],
    locationText: o.headquarters || 'Global',
    coordinates:
      typeof o.hqLat === 'number' && typeof o.hqLng === 'number'
        ? { lat: o.hqLat, lng: o.hqLng }
        : null,
    staticFacts: [
      o.headquarters ? `HQ: ${o.headquarters}` : null,
      o.foundedYear ? `Founded: ${o.foundedYear}` : null,
      o.indiaMember !== undefined ? `India Member: ${o.indiaMember ? 'Yes' : 'No'}` : null,
      o.mandate || o.description || null,
    ].filter(Boolean),
    resolvedPYQs: [],
    priority: 'High',
  };
}

function formatPyqForStudio(q) {
  const categoryList =
    Array.isArray(q.mapCategory) && q.mapCategory.length > 0
      ? q.mapCategory
      : [q.subject || 'Mapping Question'];
  const isIndia = categoryList.some((c) => c.toLowerCase().includes('india'));

  return {
    id: q.id,
    questionId: q.questionId,
    dedupHash: q.dedupHash,
    sourceType: 'PYQ',
    pillar: 'PYQ',
    title: q.stem ? `Q: ${q.stem.slice(0, 95)}${q.stem.length > 95 ? '...' : ''}` : q.id,
    place: categoryList[0] || 'Mapping Question',
    stem: q.stem,
    options: q.options || [],
    correctLabel: q.correctLabel || '',
    answerText: q.answerText || '',
    hasExplanation: Boolean(q.explanation),
    exam: q.exam || 'UPSC CSE Prelims',
    examYear: q.examYear,
    subject: q.subject || 'Geography',
    isMapping: Boolean(q.isMapping),
    regionScope: isIndia ? 'India' : 'World',
    category: categoryList,
    locationText: `${q.exam} ${q.examYear}`,
    staticFacts: q.answerText ? [q.answerText] : [],
    resolvedPYQs: [],
    priority: 'High',
  };
}

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'FACULTY')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const pillar = (searchParams.get('pillar') || 'ALL').toUpperCase(); // ALL | INDIA_STATIC | WORLD_STATIC | PIN | IR | PYQ
    const scope = searchParams.get('scope') || 'ALL';
    const type = (searchParams.get('type') || 'ALL').toUpperCase(); // legacy fallback
    const tier = (searchParams.get('tier') || 'ALL').toLowerCase(); // ALL | master | daily
    const category = searchParams.get('category') || 'ALL';
    const subject = searchParams.get('subject') || 'ALL';
    const year = searchParams.get('year') || 'ALL';
    const search = (searchParams.get('search') || '').trim().toLowerCase();
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));

    const workspace = await getMappingWorkspaceData();

    const formattedNodes = workspace.nodes.map(formatNodeForStudio);
    const formattedOrgs = workspace.organizations.map(formatOrgForStudio);
    const formattedPyqs = workspace.pyqs.map(formatPyqForStudio);

    const indiaStaticCount = formattedNodes.filter((n) => n.pillar === 'INDIA_STATIC').length;
    const worldStaticCount = formattedNodes.filter((n) => n.pillar === 'WORLD_STATIC').length;
    const pinNodes = formattedNodes.filter((n) => n.pillar === 'PIN');
    const irNodesCount = formattedNodes.filter((n) => n.pillar === 'IR').length;

    let pool = [...formattedNodes, ...formattedOrgs, ...formattedPyqs];

    // Pillar filter (or legacy type filter)
    if (pillar !== 'ALL') {
      pool = pool.filter((item) => item.pillar === pillar);
    } else if (type !== 'ALL') {
      if (type === 'STATIC') {
        pool = pool.filter((i) => i.pillar === 'INDIA_STATIC' || i.pillar === 'WORLD_STATIC');
      } else if (type === 'PIN') {
        pool = pool.filter((i) => i.pillar === 'PIN');
      } else if (type === 'PYQ') {
        pool = pool.filter((i) => i.pillar === 'PYQ');
      } else if (type === 'IR') {
        pool = pool.filter((i) => i.pillar === 'IR');
      }
    }

    if (scope !== 'ALL') {
      pool = pool.filter(
        (item) => (item.regionScope || '').toLowerCase() === scope.toLowerCase()
      );
    }

    if (tier !== 'all') {
      pool = pool.filter((item) => (item.tier || '').toLowerCase() === tier);
    }

    if (category !== 'ALL') {
      const targetCat = category.toLowerCase();
      pool = pool.filter((item) =>
        (item.category || []).some((c) => c.toLowerCase().includes(targetCat))
      );
    }

    if (subject !== 'ALL') {
      const targetSub = subject.toLowerCase();
      pool = pool.filter(
        (item) => (item.subject || '').toLowerCase() === targetSub
      );
    }

    if (year !== 'ALL') {
      const targetYear = parseInt(year, 10);
      if (!Number.isNaN(targetYear)) {
        pool = pool.filter(
          (item) => item.examYear === targetYear || item.targetExamYear === targetYear
        );
      }
    }

    if (search) {
      pool = pool.filter((item) => {
        const haystack = [
          item.title,
          item.place,
          item.shortName,
          item.locationText,
          item.stem,
          item.dedupHash,
          ...(item.aliases || []),
          ...(item.staticFacts || []),
          ...(item.category || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(search);
      });
    }

    const total = pool.length;
    const paginatedItems = pool.slice(0, limit);

    return NextResponse.json({
      items: paginatedItems,
      total,
      stats: {
        allCount: formattedNodes.length + formattedOrgs.length + formattedPyqs.length,
        indiaStaticCount,
        worldStaticCount,
        staticCount: indiaStaticCount + worldStaticCount,
        pinCount: pinNodes.length,
        masterPinCount: pinNodes.filter((n) => n.isMaster).length,
        dailyPinCount: pinNodes.filter((n) => !n.isMaster).length,
        irCount: irNodesCount + formattedOrgs.length,
        orgCount: formattedOrgs.length,
        pyqCount: formattedPyqs.length,
      },
      taxonomy: workspace.taxonomy,
    });
  } catch (err) {
    console.error('[API Admin Studio Mapping] Error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch mapping items', details: err.message },
      { status: 500 }
    );
  }
}
