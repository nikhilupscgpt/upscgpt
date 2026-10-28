import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CURATED_MAPPING_NODES } from "@/lib/static-mapping-data";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'FACULTY')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope') || 'ALL'; // 'ALL' | 'India' | 'World'
    const category = searchParams.get('category') || 'ALL';
    const type = searchParams.get('type') || 'ALL'; // 'ALL' | 'STATIC' | 'PIN' | 'PYQ'
    const search = (searchParams.get('search') || '').trim().toLowerCase();
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));

    const allItems = [];

    // 1. Curated Static Mapping Nodes
    if (type === 'ALL' || type === 'STATIC') {
      for (const node of CURATED_MAPPING_NODES) {
        allItems.push({
          id: node.id,
          sourceType: 'STATIC',
          slug: node.slug,
          title: node.place,
          place: node.place,
          aliases: node.aliases || [],
          placeType: node.placeType || 'Geographic Feature',
          regionScope: node.regionScope || 'India',
          category: Array.isArray(node.mapCategory) ? node.mapCategory : [node.mapCategory || 'Physical Geography'],
          locationText: node.locatedIn?.stateOrProvince || node.locatedIn?.country || (node.regionScope === 'World' ? 'Global' : 'India'),
          coordinates: { lat: node.lat, lng: node.lng },
          staticFacts: node.staticFacts || [],
          similarPYQs: node.similarPYQ || [],
          imageUrl: node.imageUrl || null,
          imageCaption: `${node.place} Physical Map`,
          priority: node.priority || 'Medium',
          riverDetails: node.riverDetails || null,
        });
      }
    }

    // 2. Dynamic Places in News (PIN)
    if (type === 'ALL' || type === 'PIN') {
      const pins = await prisma.placeInNews.findMany({
        take: 100,
        orderBy: { date: 'desc' },
      });

      for (const pin of pins) {
        const located = pin.locatedIn && typeof pin.locatedIn === 'object'
          ? Object.values(pin.locatedIn).filter(Boolean).join(', ')
          : (pin.regionScope === 'World' ? 'World' : 'India');

        allItems.push({
          id: pin.id || pin.pinId,
          sourceType: 'PIN',
          slug: pin.slug,
          title: pin.place,
          place: pin.place,
          aliases: pin.aliases || [],
          placeType: pin.placeType || 'Place in News',
          regionScope: pin.regionScope || 'India',
          category: Array.isArray(pin.mapCategory) && pin.mapCategory.length > 0 ? pin.mapCategory : ['World – places in news'],
          locationText: located,
          coordinates: pin.coordinates || (pin.lat && pin.lng ? { lat: pin.lat, lng: pin.lng } : null),
          staticFacts: Array.isArray(pin.staticFacts) ? pin.staticFacts : [],
          newsHook: Array.isArray(pin.newsTriggers) && pin.newsTriggers.length > 0 ? pin.newsTriggers[0]?.newsHook : null,
          upscAngle: pin.upscAngle || null,
          similarPYQs: pin.similarPYQ || [],
          imageUrl: null,
          imageCaption: `${pin.place} Satellite & Map Context`,
          priority: pin.priority || 'High',
          date: pin.date,
        });
      }
    }

    // 3. Mapping PYQs (236 official questions)
    if (type === 'ALL' || type === 'PYQ') {
      const pyqs = await prisma.mappingPyq.findMany({
        take: 100,
        orderBy: { examYear: 'desc' },
      });

      for (const q of pyqs) {
        const categoryList = Array.isArray(q.mapCategory) && q.mapCategory.length > 0 ? q.mapCategory : ['India – rivers, lakes, reservoirs & glaciers'];
        const isIndia = categoryList.some(c => c.toLowerCase().includes('india'));

        allItems.push({
          id: q.id,
          sourceType: 'PYQ',
          title: `Q: ${q.stem.substring(0, 90)}...`,
          place: categoryList[0] || 'Mapping Question',
          stem: q.stem,
          options: q.options || [],
          correctLabel: q.correctLabel || '',
          answerText: q.answerText || '',
          exam: q.exam || 'UPSC CSE Pre',
          examYear: q.examYear,
          subject: q.subject || 'Geography',
          regionScope: isIndia ? 'India' : 'World',
          category: categoryList,
          locationText: `${q.exam} ${q.examYear}`,
          staticFacts: q.answerText ? [q.answerText] : [],
          imageUrl: null,
          imageCaption: `${q.exam} ${q.examYear} Map Slide`,
          priority: 'High',
        });
      }
    }

    // Filter by Region Scope
    let filtered = allItems;
    if (scope !== 'ALL') {
      filtered = filtered.filter(item => (item.regionScope || '').toLowerCase() === scope.toLowerCase());
    }

    // Filter by Category
    if (category !== 'ALL') {
      const targetCat = category.toLowerCase();
      filtered = filtered.filter(item => 
        item.category.some(c => c.toLowerCase().includes(targetCat))
      );
    }

    // Filter by Search Query
    if (search) {
      filtered = filtered.filter(item => {
        const haystack = [
          item.title,
          item.place,
          item.locationText,
          item.stem,
          ...(item.aliases || []),
          ...(item.staticFacts || []),
          ...(item.category || [])
        ].filter(Boolean).join(' ').toLowerCase();

        return haystack.includes(search);
      });
    }

    const total = filtered.length;
    const paginatedItems = filtered.slice(0, limit);

    return NextResponse.json({
      items: paginatedItems,
      total,
      stats: {
        staticCount: allItems.filter(i => i.sourceType === 'STATIC').length,
        pinCount: allItems.filter(i => i.sourceType === 'PIN').length,
        pyqCount: allItems.filter(i => i.sourceType === 'PYQ').length,
      }
    });
  } catch (err) {
    console.error('[API Admin Studio Mapping] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch mapping items', details: err.message }, { status: 500 });
  }
}
