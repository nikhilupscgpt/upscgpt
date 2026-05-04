import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const issues = await prisma.issue.findMany({
      where: {
        parentIssueId: null
      },
      orderBy: [
        { orderIndex: 'asc' },
        { title: 'asc' }
      ],
      select: {
        id: true,
        title: true,
        slug: true,
        domain: true,
        topic: true,
        category: true,
        gsPapers: true,
        orderIndex: true,
        status: true,
        nodeType: true,
        _count: {
          select: {
            articles: true,
            editorials: true,
            testPacks: true,
            pyqLinks: true
          }
        },
        subNodes: {
          select: {
            id: true,
            title: true,
            nodeType: true,
            status: true
          }
        }
      }
    });

    const tree = {};

    issues.forEach(issue => {
      // Robust Fallbacks for Unassigned Nodes
      const gs = (issue.gsPapers && issue.gsPapers.length > 0) ? issue.gsPapers[0] : 'GENERAL';
      const domain = issue.domain || 'UNCATEGORIZED';
      const topic = issue.topic || 'Core Intelligence';
      
      if (!tree[gs]) tree[gs] = {};
      if (!tree[gs][domain]) tree[gs][domain] = {};
      if (!tree[gs][domain][topic]) tree[gs][domain][topic] = [];
      
      tree[gs][domain][topic].push(issue);
    });

    return NextResponse.json({ success: true, tree });
  } catch (error) {
    console.error('[Architect Tree API] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
