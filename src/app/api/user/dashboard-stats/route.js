import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // 1. Fetch User Profile for Preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true }
    });

    const preferences = typeof user?.preferences === 'string' 
      ? JSON.parse(user.preferences) 
      : (user?.preferences || {});
    
    const selectedOptionalId = preferences.selectedOptional;

    // 2. Fetch Progress Stats
    const progress = await prisma.issueProgress.findMany({
      where: { userId },
      include: {
        issue: {
          select: {
            id: true,
            domain: true,
            gsPapers: true,
            optionalId: true
          }
        }
      }
    });

    const isAdmin = session.user.role === 'ADMIN';

    // 3. Fetch Recent Activity
    const activity = await prisma.actionLog.findMany({
      where: isAdmin ? {} : { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    // 4. Aggregate Stats by Domain
    const domainStats = progress.reduce((acc, p) => {
      const domain = p.issue.domain;
      if (!acc[domain]) acc[domain] = { total: 0, mastered: 0 };
      acc[domain].total++;
      if (p.status === 'MASTERED') acc[domain].mastered++;
      return acc;
    }, {});

    // 5. Aggregate Stats by GS Paper and Optional
    const gsStats = progress.reduce((acc, p) => {
      // Regular GS Papers
      p.issue.gsPapers.forEach(gs => {
        if (!acc[gs]) acc[gs] = { total: 0, mastered: 0 };
        acc[gs].total++;
        if (p.status === 'MASTERED') acc[gs].mastered++;
      });

      // Selected Optional
      if (selectedOptionalId && p.issue.optionalId === selectedOptionalId) {
        if (!acc['OPTIONAL']) acc['OPTIONAL'] = { total: 0, mastered: 0 };
        acc['OPTIONAL'].total++;
        if (p.status === 'MASTERED') acc['OPTIONAL'].mastered++;
      }
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      stats: {
        domainStats,
        gsStats,
        totalProgress: progress.length,
        masteredCount: progress.filter(p => p.status === 'MASTERED').length,
      },
      recentActivity: activity
    });

  } catch (error) {
    console.error('[Dashboard Stats API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
