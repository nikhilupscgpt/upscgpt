import { NextResponse } from 'next/server';
import { getMappingWorkspaceData } from '@/lib/mapping/workspace-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const payload = await getMappingWorkspaceData();

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
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
