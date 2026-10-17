import { NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import {
  resolveSimilarPyqsForPins,
  MAPPING_SUBJECTS,
  MAP_CATEGORIES,
} from '@/lib/mapping-engine';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject') || 'ALL';
    const mapCategory = searchParams.get('mapCategory') || 'ALL';
    const priority = searchParams.get('priority') || 'ALL';
    const regionScope = searchParams.get('regionScope') || 'ALL';
    const placeType = searchParams.get('placeType') || 'ALL';
    const targetExamYear = searchParams.get('targetExamYear') || 'ALL';
    const hookCategory = searchParams.get('hookCategory') || 'ALL';
    const search = (searchParams.get('search') || '').trim();
    const sort = searchParams.get('sort') || 'LATEST'; // LATEST | PRIORITY | N_TO_S | S_TO_N | E_TO_W | W_TO_E
    const resolvePyqs = searchParams.get('resolvePyqs') !== 'false';

    const where = {};

    if (subject !== 'ALL') {
      where.subject = subject;
    }
    if (mapCategory !== 'ALL') {
      where.mapCategory = { has: mapCategory };
    }
    if (priority !== 'ALL') {
      where.priority = priority;
    }
    if (regionScope !== 'ALL') {
      where.regionScope = { equals: regionScope, mode: 'insensitive' };
    }
    if (placeType !== 'ALL') {
      where.placeType = { equals: placeType, mode: 'insensitive' };
    }
    if (targetExamYear !== 'ALL' && !Number.isNaN(Number(targetExamYear))) {
      where.targetExamYear = Number(targetExamYear);
    }
    if (hookCategory !== 'ALL') {
      where.hookCategory = { contains: hookCategory, mode: 'insensitive' };
    }
    if (search) {
      where.OR = [
        { place: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { placeType: { contains: search, mode: 'insensitive' } },
        { aliases: { has: search } },
      ];
    }

    let orderBy = [{ date: 'desc' }, { updatedAt: 'desc' }];
    if (sort === 'N_TO_S') {
      orderBy = [{ lat: 'desc' }];
    } else if (sort === 'S_TO_N') {
      orderBy = [{ lat: 'asc' }];
    } else if (sort === 'E_TO_W') {
      orderBy = [{ lng: 'desc' }];
    } else if (sort === 'W_TO_E') {
      orderBy = [{ lng: 'asc' }];
    }

    let pins = await withRetry(() =>
      prisma.placeInNews.findMany({
        where,
        orderBy,
      })
    );

    if (sort === 'PRIORITY') {
      const rank = { High: 3, Medium: 2, Low: 1 };
      pins.sort((a, b) => {
        const diff = (rank[b.priority] || 2) - (rank[a.priority] || 2);
        if (diff !== 0) return diff;
        return (b.date || '').localeCompare(a.date || '');
      });
    }

    if (resolvePyqs) {
      pins = await resolveSimilarPyqsForPins(pins);
    }

    return NextResponse.json({
      count: pins.length,
      pins,
      taxonomy: {
        subjects: MAPPING_SUBJECTS,
        mapCategories: MAP_CATEGORIES,
      },
    });
  } catch (err) {
    console.error('[GET /api/mapping/pin] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch Places in News' },
      { status: 500 }
    );
  }
}
