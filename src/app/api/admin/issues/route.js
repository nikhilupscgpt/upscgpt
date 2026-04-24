import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * GET /api/admin/issues
 * Lists all Issue nodes with optional filtering.
 * Query params: ?category=POLITY&domain=&search=&status=ACTIVE
 */
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const domain = searchParams.get('domain');
    const search = searchParams.get('search');
    const status = searchParams.get('status') || 'ACTIVE';

    const where = {};
    if (category) where.category = category;
    if (domain) where.domain = domain;
    if (status) where.status = status;
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const issues = await prisma.issue.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        domain: true,
        topic: true,
        category: true,
        gsPapers: true,
        nodeType: true,
        status: true,
        _count: {
          select: {
            articles: true,
            editorials: true,
          }
        }
      },
      orderBy: [
        { domain: 'asc' },
        { topic: 'asc' },
        { title: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (error) {
    console.error('[Issues API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
