import { NextResponse } from 'next/server';
import { getMappingWorkspaceData } from '@/lib/mapping/workspace-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const payload = await getMappingWorkspaceData();

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    console.error('[GET /api/mapping/workspace] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to load Mapping Workspace' },
      { status: 500 }
    );
  }
}
