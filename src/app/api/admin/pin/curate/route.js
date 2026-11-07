import { NextResponse } from 'next/server';
import {
  getCurationStatus,
  findCandidateClusters,
  mergePins,
  getWeeklyBatch,
  updatePinTiers,
} from '@/lib/atlas-curation-engine';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode') || 'status';

    if (mode === 'clusters') {
      const clusters = await findCandidateClusters({
        maxDistanceKm: Number(searchParams.get('maxDistanceKm')) || 75,
      });
      return NextResponse.json({ count: clusters.length, clusters });
    }

    if (mode === 'weekly') {
      const days = Number(searchParams.get('days')) || 7;
      const batch = await getWeeklyBatch(days);
      return NextResponse.json(batch);
    }

    // Default: status
    const status = await getCurationStatus();
    return NextResponse.json(status);
  } catch (err) {
    console.error('[GET /api/admin/pin/curate] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch curation data' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'merge') {
      const { parentId, childIds, newPlaceTitle, newPlaceLine, mergeNotes } = body;
      const result = await mergePins({
        parentId,
        childIds,
        newPlaceTitle,
        newPlaceLine,
        mergeNotes,
      });
      return NextResponse.json(result);
    }

    if (action === 'set_tier') {
      const { pinIds, tier } = body;
      const result = await updatePinTiers(pinIds, tier, true);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err) {
    console.error('[POST /api/admin/pin/curate] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to execute curation action' },
      { status: 500 }
    );
  }
}
