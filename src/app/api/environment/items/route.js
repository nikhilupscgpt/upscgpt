import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { getEnvAtlasItems } from '@/lib/env-atlas-engine';

export const dynamic = 'force-dynamic';

const getCachedEnvModuleItems = unstable_cache(
  async (moduleName) => {
    return getEnvAtlasItems({
      module: moduleName,
      category: 'ALL',
      search: '',
    });
  },
  ['env-atlas-items-v1'],
  { revalidate: 86400, tags: ['env-atlas'] }
);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const moduleName = searchParams.get('module') || 'SPECIES';
    const category = searchParams.get('category') || 'ALL';
    const search = (searchParams.get('search') || '').trim().toLowerCase();

    const baseData = await getCachedEnvModuleItems(moduleName);
    let list = baseData.items || [];

    if (category && category !== 'ALL') {
      list = list.filter((i) => (i.category || '').toLowerCase() === category.toLowerCase());
    }

    if (search) {
      list = list.filter(
        (i) =>
          (i.title || '').toLowerCase().includes(search) ||
          (i.subtitle || '').toLowerCase().includes(search) ||
          (i.oneline || '').toLowerCase().includes(search) ||
          (i.aliases || []).some((a) => a.toLowerCase().includes(search)) ||
          (i.places || []).some(
            (p) =>
              (p.name || p.n || '').toLowerCase().includes(search) ||
              (p.state || p.st || '').toLowerCase().includes(search)
          )
      );
    }

    return NextResponse.json(
      {
        ...baseData,
        total: list.length,
        items: list,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (err) {
    console.error('[GET /api/environment/items] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch Environment Atlas items' },
      { status: 500 }
    );
  }
}
