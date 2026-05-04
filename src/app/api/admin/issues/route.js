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
 * List issues with search and filtering
 */
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain');
  const search = searchParams.get('search');

  try {
    const issues = await prisma.issue.findMany({
      where: {
        AND: [
          domain ? { domain: domain } : {},
          search ? { title: { contains: search, mode: 'insensitive' } } : {},
        ],
      },
      orderBy: { title: 'asc' },
    });

    return NextResponse.json({
      success: true,
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
    const { title, domain, topic, gsPapers, status, nodeType, parentIssueId } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // 🔍 Global Guard: Strict Canonical Deduplication
    const toCanonical = (str) => str.toLowerCase().replace(/\s+/g, '').replace(/[\u00A0\u1680​\u180e\u2000-\u200b\u202f\u205f\u3000\ufeff]/g, '').trim();
    const canonicalTitle = toCanonical(title);

    const allIssues = await prisma.issue.findMany({ select: { title: true } });
    const exists = allIssues.some(i => toCanonical(i.title) === canonicalTitle);

    if (exists) {
      return NextResponse.json({ error: 'Node already exists in syllabus (duplicate title detected)' }, { status: 400 });
    }

    // Auto-Category Mapping
    const validCategories = ['POLITY', 'GOVERNANCE', 'INTERNATIONAL_RELATIONS', 'ECONOMY', 'AGRICULTURE', 'SCIENCE_TECHNOLOGY', 'ENVIRONMENT', 'INTERNAL_SECURITY', 'SOCIETY', 'HISTORY', 'GEOGRAPHY', 'CULTURE', 'ETHICS', 'DISASTER_MANAGEMENT'];
    const assignedCategory = validCategories.includes(domain?.toUpperCase()) ? domain.toUpperCase() : 'CURRENT_AFFAIRS';

    let slug = toSlug(title);
    
    // Ensure slug uniqueness
    let finalSlug = slug;
    let counter = 1;
    while (await prisma.issue.findUnique({ where: { slug: finalSlug } })) {
      counter++;
      finalSlug = `${slug}-${counter}`;
    }

    const issue = await prisma.issue.create({
      data: {
        title,
        slug: finalSlug,
        domain: domain || 'GENERAL',
        topic: topic || 'General',
        category: assignedCategory,
        gsPapers: gsPapers || ['GS1'],
        status: status || 'ACTIVE',
        nodeType: nodeType || 'CONCEPTUAL',
        parentIssueId
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
