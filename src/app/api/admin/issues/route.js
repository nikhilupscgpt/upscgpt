import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/[—–]/g, "-")
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * GET /api/admin/issues
 * Lists all Issue nodes with optional filtering.
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
    const status = searchParams.get('status');
    const examType = searchParams.get('examType');

    console.log('[Issues API] GET Request received. query:', req.url);
    const where = {};
    if (category) where.category = category;
    if (domain) where.domain = domain;
    if (status && status !== 'ALL') where.status = status;
    if (examType === 'PRELIMS') {
      where.gsPapers = { has: 'PRELIMS' };
    } else if (examType === 'MAINS') {
      where.gsPapers = { hasSome: ['GS1', 'GS2', 'GS3', 'GS4'] };
    }
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    console.log('[Issues API] Fetching with where:', JSON.stringify(where));
    const start = Date.now();
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
      },
      orderBy: { title: 'asc' },
      take: 1000,
    });

    const duration = Date.now() - start;
    console.log(`[Issues API] Fetched ${issues.length} issues in ${duration}ms`);

    return NextResponse.json({
      success: true,
      count: issues.length,
      where,
      issues,
    });
  } catch (error) {
    console.error('[Issues API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/issues
 * Create a new node or subnode.
 */
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, domain, topic, category, gsPapers, parentIssueId } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const slug = toSlug(title);

    const issue = await prisma.issue.create({
      data: {
        title,
        slug,
        domain: domain || 'GENERAL',
        topic: topic || 'General',
        category: category || 'CURRENT_AFFAIRS',
        gsPapers: gsPapers || ['GS3'],
        parentIssueId,
        nodeType: parentIssueId ? 'SUB_TOPIC' : 'CONCEPTUAL'
      }
    });

    return NextResponse.json({
      success: true,
      issue
    });
  } catch (error) {
    console.error('[Issues POST] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
