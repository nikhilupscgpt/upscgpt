import { NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { CURATED_MAPPING_NODES } from '@/lib/static-mapping-data';
import { MAP_CATEGORIES, MAPPING_SUBJECTS } from '@/lib/mapping-engine';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const [dbPins, dbQuestions, dbOrgs] = await Promise.all([
      withRetry(() =>
        prisma.placeInNews.findMany({
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

    // Build index by both human dedupHash (e.g. GEO-UPSC-2023-08) and DB cuid id
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
        exam,
        examYear: q.examYear || 2024,
        subject: q.subject?.name || 'Geography',
        mapCategory: q.mapCategory || [],
        affairsType: q.affairsType,
        newsLagMonths: q.newsLagMonths,
        selection: q.mappingSelection,
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

    const staticBySlug = new Map(CURATED_MAPPING_NODES.map((n) => [n.slug, n]));
    const dbSlugs = new Set(dbPins.map((p) => p.slug));

    // 1. Database PIN & Overridden Static nodes (Clean 1:1 resolution from curated similarPYQ)
    const dbNodes = dbPins.map((p) => {
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
      };
    });

    // 2. Curated GIS Static & IR Mapping Nodes not overridden in DB
    const curatedNodes = CURATED_MAPPING_NODES.filter((n) => !dbSlugs.has(n.slug)).map((n) => {
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

    return NextResponse.json(
      {
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
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (err) {
    console.error('[GET /api/mapping/workspace] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to load Mapping Workspace' },
      { status: 500 }
    );
  }
}
