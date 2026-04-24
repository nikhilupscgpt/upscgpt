import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    if (!slug) {
      return NextResponse.json({ error: 'Issue slug is required' }, { status: 400 });
    }

    const issue = await prisma.issue.findUnique({
      where: { slug },
      include: {
        timelineEvents: {
          orderBy: { date: 'desc' },
          include: {
            article: {
              select: {
                title: true,
                source: true,
                url: true,
                contentType: true,
              }
            }
          }
        },
        pyqLinks: {
          orderBy: { year: 'desc' }
        },
        articles: {
          select: {
            id: true,
            title: true,
            source: true,
            url: true,
            contentType: true,
            publishedAt: true,
            structuredData: true,
            rawContent: true,
            status: true,
          }
        },
        editorials: {
          select: {
            id: true,
            title: true,
            source: true,
            author: true,
            url: true,
            publishedAt: true,
            structuredData: true,
            rawContent: true,
            status: true,
          }
        },
        _count: {
          select: {
            articles: true,
            editorials: true,
          }
        }
      }
    });

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    // Omit the raw embedding for the frontend payload
    const { embedding, ...issueData } = issue;

    return NextResponse.json({
      success: true,
      issue: issueData,
    });
  } catch (error) {
    console.error(`[Issue Slug API] Error fetching slug:`, error);
    return NextResponse.json({ error: 'Failed to fetch issue details' }, { status: 500 });
  }
}
