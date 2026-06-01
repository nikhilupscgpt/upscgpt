import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const activeStreaks = await prisma.newsStreak.findMany({
      where: {
        status: 'ACTIVE',
      },
      orderBy: [
        { importanceScore: 'desc' },
        { updatedAt: 'desc' }
      ],
      take: 3,
      include: {
        issues: {
          select: {
            title: true,
            domain: true,
            gsPapers: true
          }
        }
      }
    });

    return NextResponse.json(activeStreaks);
  } catch (error) {
    console.error("[Active Streaks Error]", error);
    return NextResponse.json({ error: "Failed to fetch active streaks" }, { status: 500 });
  }
}
