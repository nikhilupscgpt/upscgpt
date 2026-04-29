import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/admin/ingest-queue
 * Fetches all pending articles and editorials that need approval.
 */
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [pendingArticles, pendingEditorials] = await Promise.all([
      prisma.article.findMany({
        where: { status: 'PENDING' },
        include: { issue: { select: { title: true, domain: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.editorial.findMany({
        where: { status: 'PENDING' },
        include: { issue: { select: { title: true, domain: true } } },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Format them uniformly
    const queue = [
      ...pendingArticles.map(a => ({ ...a, type: 'ARTICLE' })),
      ...pendingEditorials.map(e => ({ ...e, type: 'EDITORIAL' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json({ success: true, queue });
  } catch (error) {
    console.error('[Ingest Queue API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
