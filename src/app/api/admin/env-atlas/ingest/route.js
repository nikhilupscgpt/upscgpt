import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getEnvAtlasItems, ingestEnvAtlasJsonl, deleteEnvAtlasItem } from '@/lib/env-atlas-engine';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const moduleFilter = searchParams.get('module') || 'ALL';

    const data = await getEnvAtlasItems({
      module: moduleFilter === 'ALL' ? undefined : moduleFilter,
      category: 'ALL',
    });

    // Compute module KPIs
    const kpiByModule = {
      SPECIES: 0,
      PROTECTED_AREA: 0,
      CONVENTION: 0,
      ACT_ORG: 0,
      SCHEME: 0,
      HOTSPOT: 0,
    };

    (data.items || []).forEach((item) => {
      const mod = (item.module || 'SPECIES').toUpperCase();
      if (kpiByModule[mod] !== undefined) {
        kpiByModule[mod]++;
      } else {
        kpiByModule[mod] = 1;
      }
    });

    return NextResponse.json({
      success: true,
      totalCount: data.items.length,
      kpiByModule,
      items: data.items,
    });
  } catch (err) {
    console.error('[GET /api/admin/env-atlas/ingest] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch Environment Atlas items' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const rawText = body.content || body.jsonl || (typeof body === 'string' ? body : JSON.stringify(body));

    const result = ingestEnvAtlasJsonl(rawText);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[POST /api/admin/env-atlas/ingest] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to ingest Environment Atlas items' },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 });
    }

    const result = deleteEnvAtlasItem(slug);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[DELETE /api/admin/env-atlas/ingest] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to delete Environment Atlas item' },
      { status: 500 }
    );
  }
}
