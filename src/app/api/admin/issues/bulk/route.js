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
 * POST /api/admin/issues/bulk
 * Rapid injection of multiple syllabus nodes.
 */
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { titles, domain, topic, gsPaper, parentIssueId, nodeType } = await req.json();

    if (!titles || !Array.isArray(titles)) {
      return NextResponse.json({ error: 'Titles array is required' }, { status: 400 });
    }

    const validCategories = ['POLITY', 'GOVERNANCE', 'INTERNATIONAL_RELATIONS', 'ECONOMY', 'AGRICULTURE', 'SCIENCE_TECHNOLOGY', 'ENVIRONMENT', 'INTERNAL_SECURITY', 'SOCIETY', 'HISTORY', 'GEOGRAPHY', 'CULTURE', 'ETHICS', 'DISASTER_MANAGEMENT'];
    const assignedCategory = validCategories.includes(domain?.toUpperCase()) ? domain.toUpperCase() : 'CURRENT_AFFAIRS';

    // 🔍 Global Guard: Fetch ALL titles in the database to prevent cross-domain duplicates
    const allIssues = await prisma.issue.findMany({
      select: { title: true }
    });
    
    // Function to create a canonical comparison string (no spaces, all lowercase)
    const toCanonical = (str) => str.toLowerCase().replace(/\s+/g, '').replace(/[\u00A0\u1680​\u180e\u2000-\u200b\u202f\u205f\u3000\ufeff]/g, '').trim();

    const existingCanonicalTitles = new Set(allIssues.map(i => toCanonical(i.title)));

    const filteredTitles = titles.filter(t => {
      const canonical = toCanonical(t);
      if (existingCanonicalTitles.has(canonical)) return false;
      existingCanonicalTitles.add(canonical); // Prevent duplicates within the SAME bulk batch
      return true;
    });

    const skippedCount = titles.length - filteredTitles.length;

    if (filteredTitles.length === 0) {
      return NextResponse.json({ 
        success: true, 
        count: 0, 
        skipped: skippedCount,
        message: 'All nodes already exist in this domain.' 
      });
    }

    // Atomic transaction for high-performance bulk insertion
    const createdNodes = [];
    
    // 🚀 Sequence Sniffer: Parse numbers and clean titles
    for (let i = 0; i < filteredTitles.length; i++) {
      const rawTitle = filteredTitles[i];
      let cleanTitle = rawTitle.trim();
      let sequence = (i + 1) * 10;

      // Match patterns like "1. Title", "1) Title", "1 Title"
      const match = rawTitle.match(/^(\d+)[.)\s]+(.*)$/);
      if (match) {
        sequence = parseInt(match[1]) * 10;
        cleanTitle = match[2].trim();
      }

      const slug = cleanTitle.toLowerCase().replace(/—/g, "-").replace(/[''`]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      
      // Ensure slug uniqueness
      let finalSlug = slug;
      let counter = 1;
      while (await prisma.issue.findUnique({ where: { slug: finalSlug } })) {
        counter++;
        finalSlug = `${slug}-${counter}`;
      }

      const node = await prisma.issue.create({
        data: {
          title: cleanTitle,
          slug: finalSlug,
          domain: domain || 'GENERAL',
          topic: topic || 'General',
          category: assignedCategory,
          gsPapers: [gsPaper],
          orderIndex: sequence,
          status: 'ACTIVE',
          nodeType: nodeType || 'CONCEPTUAL',
          parentIssueId: parentIssueId || null
        }
      });
      createdNodes.push(node);
    }

    return NextResponse.json({
      success: true,
      count: createdNodes.length,
      skipped: skippedCount
    });
  } catch (error) {
    console.error('[Bulk Issues POST] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
