import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { upsertEnvAtlasItem } from '@/lib/env-atlas-engine';

export const dynamic = 'force-dynamic';

async function handleUpsert(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const result = await upsertEnvAtlasItem(body);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error('[env-atlas/item] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to save species item' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  return handleUpsert(req);
}

export async function PATCH(req) {
  return handleUpsert(req);
}
