import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma, withRetry } from '@/lib/prisma';
import {
  ingestPinJsonl,
  ingestMappingPyqsJsonl,
  MAPPING_SUBJECTS,
  MAP_CATEGORIES,
  normalizeStringArray,
  sanitizeUrl,
} from '@/lib/mapping-engine';
import { CURATED_MAPPING_NODES } from '@/lib/static-mapping-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [dbPins, pyqCount, pyqByExam] = await Promise.all([
      withRetry(() =>
        prisma.placeInNews.findMany({
          orderBy: [{ date: 'desc' }, { updatedAt: 'desc' }],
        })
      ),
      withRetry(() => prisma.mappingPyq.count()),
      withRetry(() =>
        prisma.mappingPyq.groupBy({
          by: ['exam'],
          _count: true,
        })
      ),
    ]);

    const dbBySlug = new Map();
    for (const p of dbPins) {
      dbBySlug.set(p.slug, p);
    }

    // Format DB PIN records
    const formattedPins = dbPins.map((p) => {
      const isStaticOverride = (p.pinId || '').startsWith('STATIC-');
      return {
        id: p.id,
        pinId: p.pinId,
        slug: p.slug,
        date: p.date,
        targetExamYear: p.targetExamYear || 2027,
        pillar: isStaticOverride ? p.hookCategory || 'INDIA_STATIC' : 'PIN',
        isPin: !isStaticOverride,
        isStaticOverride,
        subject: p.subject || 'Geography',
        mapCategory: p.mapCategory || [],
        hookCategory: p.hookCategory || '',
        priority: p.priority || 'High',
        place: p.place,
        aliases: p.aliases || [],
        placeType: p.placeType || '',
        regionScope: p.regionScope || 'India',
        locatedIn: p.locatedIn || { country: 'India', stateOrProvince: '', district: '' },
        lat: p.lat ?? p.coordinates?.lat ?? null,
        lng: p.lng ?? p.coordinates?.lng ?? null,
        neighbours: p.neighbours || [],
        staticFacts: p.staticFacts || [],
        newsTriggers: Array.isArray(p.newsTriggers) ? p.newsTriggers : [],
        upscAngle: p.upscAngle || { preferredFormat: '', framing: '', distractorPool: [] },
        similarPYQ: p.similarPYQ || [],
        updatedAt: p.updatedAt,
      };
    });

    // Include Curated Static Foundation nodes that haven't been overridden in DB yet
    const staticNodes = CURATED_MAPPING_NODES.filter((n) => !dbBySlug.has(n.slug)).map((n) => ({
      id: n.id,
      pinId: `STATIC-${n.id}`,
      slug: n.slug,
      date: n.date || new Date().toISOString().split('T')[0],
      targetExamYear: n.targetExamYear || 2027,
      pillar: n.pillar || 'INDIA_STATIC',
      isPin: false,
      isStaticOverride: false,
      subject: n.subject || 'Geography',
      mapCategory: n.mapCategory || [],
      hookCategory: n.pillar || 'INDIA_STATIC',
      priority: n.priority || 'High',
      place: n.place,
      aliases: n.aliases || [],
      placeType: n.placeType || '',
      regionScope: n.regionScope || 'India',
      locatedIn: n.locatedIn || { country: 'India', stateOrProvince: '', district: '' },
      lat: n.lat ?? null,
      lng: n.lng ?? null,
      neighbours: n.neighbours || [],
      staticFacts: n.staticFacts || [],
      newsTriggers: Array.isArray(n.newsTriggers) ? n.newsTriggers : [],
      upscAngle: n.upscAngle || { preferredFormat: '', framing: '', distractorPool: [] },
      similarPYQ: n.similarPYQ || [],
      updatedAt: null,
    }));

    const allItems = [...formattedPins, ...staticNodes];
    const pinOnlyCount = allItems.filter((i) => i.isPin).length;
    const staticOnlyCount = allItems.filter((i) => !i.isPin).length;

    return NextResponse.json({
      pinCount: pinOnlyCount,
      staticCount: staticOnlyCount,
      totalCount: allItems.length,
      pyqCount,
      pyqByExam,
      recentPins: allItems,
      taxonomy: {
        subjects: MAPPING_SUBJECTS,
        mapCategories: MAP_CATEGORIES,
      },
    });
  } catch (err) {
    console.error('[GET /api/admin/pin/ingest] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch PIN ingestion status' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    let rawJsonl = '';
    let mode = 'pin'; // 'pin' | 'pyq'

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');
      const textBlock = formData.get('jsonl');
      mode = (formData.get('mode') || 'pin').toString();

      if (file && typeof file.text === 'function') {
        rawJsonl = await file.text();
      } else if (textBlock) {
        rawJsonl = textBlock.toString();
      }
    } else {
      const body = await req.json();
      rawJsonl = body.jsonl || body.content || '';
      mode = body.mode || 'pin';
    }

    if (!rawJsonl || !rawJsonl.trim()) {
      return NextResponse.json(
        { error: 'No .jsonl content provided.' },
        { status: 400 }
      );
    }

    if (mode === 'pyq') {
      const summary = await ingestMappingPyqsJsonl(rawJsonl);
      return NextResponse.json({
        mode: 'pyq',
        ...summary,
      });
    }

    const summary = await ingestPinJsonl(rawJsonl);
    return NextResponse.json({
      mode: 'pin',
      ...summary,
    });
  } catch (err) {
    console.error('[POST /api/admin/pin/ingest] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to ingest JSONL' },
      { status: 500 }
    );
  }
}

/**
 * PUT / PATCH: Create or directly edit a single Place in News / Mapping entry
 * Performs a direct replacement update on all edited fields for the given slug.
 */
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const place = (body.place || '').trim();
    if (!place) {
      return NextResponse.json(
        { error: 'Place name is required.' },
        { status: 400 }
      );
    }

    const slug = (
      body.slug ||
      place
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    )
      .trim()
      .toLowerCase();

    const isPin = body.isPin !== false;
    const defaultPinId = isPin
      ? `PIN-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`
      : `STATIC-${slug}`;
    const pinId = (body.pinId || defaultPinId).trim();

    const lat =
      body.lat !== '' && body.lat !== null && body.lat !== undefined && !Number.isNaN(Number(body.lat))
        ? Number(body.lat)
        : null;
    const lng =
      body.lng !== '' && body.lng !== null && body.lng !== undefined && !Number.isNaN(Number(body.lng))
        ? Number(body.lng)
        : null;

    const mapCategory = normalizeStringArray(body.mapCategory);
    const aliases = normalizeStringArray(body.aliases);
    const neighbours = normalizeStringArray(body.neighbours);
    const staticFacts = normalizeStringArray(body.staticFacts);
    const similarPYQ = normalizeStringArray(body.similarPYQ);

    const locatedIn = {
      country: (body.locatedIn?.country || 'India').trim(),
      stateOrProvince: (body.locatedIn?.stateOrProvince || '').trim(),
      district: (body.locatedIn?.district || '').trim(),
    };

    const rawTriggers = Array.isArray(body.newsTriggers) ? body.newsTriggers : [];
    const newsTriggers = rawTriggers
      .filter((t) => t && (t.newsHook || t.source || t.url))
      .map((t) => ({
        date: (t.date || body.date || new Date().toISOString().split('T')[0]).trim(),
        source: (t.source || 'News').trim(),
        url: sanitizeUrl(t.url || ''),
        newsHook: (t.newsHook || '').trim(),
      }));

    const upscAngle = body.upscAngle
      ? {
          preferredFormat: (body.upscAngle.preferredFormat || '').trim(),
          framing: (body.upscAngle.framing || '').trim(),
          distractorPool: normalizeStringArray(body.upscAngle.distractorPool),
        }
      : null;

    const hookCategory = isPin
      ? (body.hookCategory || '').trim() || null
      : body.pillar || body.hookCategory || 'INDIA_STATIC';

    const recordData = {
      place,
      date: (body.date || new Date().toISOString().split('T')[0]).trim(),
      targetExamYear: Number(body.targetExamYear) || 2027,
      subject: (body.subject || 'Geography').trim(),
      mapCategory,
      hookCategory,
      priority: body.priority || 'High',
      aliases,
      placeType: (body.placeType || '').trim() || null,
      regionScope: body.regionScope || 'India',
      locatedIn,
      lat,
      lng,
      coordinates: lat !== null && lng !== null ? { lat, lng } : null,
      neighbours,
      staticFacts,
      newsTriggers,
      upscAngle,
      similarPYQ,
    };

    const saved = await withRetry(() =>
      prisma.placeInNews.upsert({
        where: { slug },
        update: recordData,
        create: {
          slug,
          pinId,
          ...recordData,
        },
      })
    );

    return NextResponse.json({
      success: true,
      item: saved,
    });
  } catch (err) {
    console.error('[PUT /api/admin/pin/ingest] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to save mapping entry' },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  return PUT(req);
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all');
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');

    if (all === 'true') {
      const result = await withRetry(() => prisma.placeInNews.deleteMany({}));
      return NextResponse.json({
        deletedAll: true,
        deletedCount: result.count,
      });
    }

    if (!slug && !id) {
      return NextResponse.json(
        { error: 'Specify slug, id, or all=true to delete.' },
        { status: 400 }
      );
    }

    await withRetry(() =>
      prisma.placeInNews.delete({
        where: slug ? { slug } : { id },
      })
    );

    return NextResponse.json({ deleted: true, slug, id });
  } catch (err) {
    console.error('[DELETE /api/admin/pin/ingest] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to delete PIN entry' },
      { status: 500 }
    );
  }
}
