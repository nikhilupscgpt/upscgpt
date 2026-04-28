import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
        },
        testPacks: {
          where: { type: 'PRACTICE' },
          select: { id: true },
          take: 1
        }
      }
    });

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    const testPackId = issue.testPacks?.[0]?.id || null;

    const session = await getServerSession(authOptions);
    let userContext = { followed: false, status: 'UNSTARTED' };

    if (session?.user?.id) {
      const [follow, progress] = await Promise.all([
        prisma.issueFollow.findUnique({
          where: { userId_issueId: { userId: session.user.id, issueId: issue.id } }
        }),
        prisma.issueProgress.findUnique({
          where: { userId_issueId: { userId: session.user.id, issueId: issue.id } }
        })
      ]);

      userContext = {
        followed: !!follow,
        progress: progress || {
          status: 'UNSTARTED',
          readSummary: false,
          viewedNews: false,
          solvedPYQs: false,
          solvedMCQs: false
        }
      };
    }

    // Omit the raw embedding for the frontend payload
    const { embedding, ...issueData } = issue;

    return NextResponse.json({
      success: true,
      issue: { ...issueData, testPackId },
      userContext
    });
  } catch (error) {
    console.error(`[Issue Slug API] Error fetching slug:`, error);
    return NextResponse.json({ error: 'Failed to fetch issue details' }, { status: 500 });
  }
}
