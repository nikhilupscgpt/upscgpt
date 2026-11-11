import { NextResponse } from 'next/server';
import { getEnvAtlasItems } from '@/lib/env-atlas-engine';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const moduleName = searchParams.get('module') || 'SPECIES';
    const category = searchParams.get('category') || 'ALL';
    const search = searchParams.get('search') || '';

    const data = await getEnvAtlasItems({
      module: moduleName,
      category,
      search,
    });

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err) {
    console.error('[GET /api/environment/items] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch Environment Atlas items' },
      { status: 500 }
    );
  }
}
