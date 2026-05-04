import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
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
