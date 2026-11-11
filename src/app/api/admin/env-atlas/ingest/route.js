import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ingestEnvAtlasJsonl } from '@/lib/env-atlas-engine';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const rawText = body.content || body.jsonl || JSON.stringify(body);

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
