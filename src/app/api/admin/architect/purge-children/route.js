import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { parentId } = await req.json();

    if (!parentId) {
      return NextResponse.json({ error: 'Parent ID required' }, { status: 400 });
    }

    // Perform the purge: Delete all issues where parentIssueId matches
    const result = await prisma.issue.deleteMany({
      where: { parentIssueId: parentId }
    });

    console.log(`[PURGE] Removed ${result.count} subnodes for parent ${parentId}`);

    return NextResponse.json({ 
      success: true, 
      count: result.count 
    });

  } catch (error) {
    console.error('[PURGE ERROR]', error);
    return NextResponse.json({ error: 'Failed to purge subnodes' }, { status: 500 });
  }
}
