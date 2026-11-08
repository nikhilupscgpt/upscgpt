import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: 'Array of IDs required' }, { status: 400 });
    }

    // Perform bulk deletion
    const result = await prisma.issue.deleteMany({
      where: { id: { in: ids } }
    });

    console.log(`[BULK DELETE] Removed ${result.count} nodes`);

    return NextResponse.json({ 
      success: true, 
      count: result.count 
    });

  } catch (error) {
    console.error('[BULK DELETE ERROR]', error);
    return NextResponse.json({ error: 'Failed to perform bulk purge' }, { status: 500 });
  }
}
