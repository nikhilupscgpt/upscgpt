import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * DELETE /api/admin/architect/purge
 * Wipes out all nodes within a specific Subject Domain and GS Paper.
 * Use with caution: Cascades to all related Articles, Editorials, and PYQs.
 */
export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain');
    const gsPaper = searchParams.get('gsPaper');
    const topic = searchParams.get('topic');

    if (!domain || !gsPaper) {
      return NextResponse.json({ error: 'Domain and GS Paper are required' }, { status: 400 });
    }

    // Atomic transaction for the purge
    const result = await prisma.issue.deleteMany({
      where: {
        domain: domain,
        gsPapers: {
          has: gsPaper
        },
        ...(topic ? { topic: topic } : {})
      }
    });

    return NextResponse.json({ 
      success: true, 
      count: result.count,
      message: `Successfully purged ${result.count} nodes from ${topic || domain} (${gsPaper}).`
    });
  } catch (error) {
    console.error('[Architect Purge API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
