import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'FACULTY')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain') || 'ALL';
    const gsPaper = searchParams.get('gsPaper') || 'ALL';
    const search = (searchParams.get('search') || '').trim();
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '30', 10)));

    const andConditions = [];

    if (domain !== 'ALL') {
      andConditions.push({ domain: { equals: domain, mode: 'insensitive' } });
    }

    if (gsPaper !== 'ALL') {
      andConditions.push({ gsPapers: { has: gsPaper } });
    }

    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { topic: { contains: search, mode: 'insensitive' } },
          { cumulativeSummary: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};

    const topics = await prisma.issue.findMany({
      where,
      take: limit,
      orderBy: { title: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
        domain: true,
        topic: true,
        gsPapers: true,
        cumulativeSummary: true,
        backgroundNote: true,
        valueAddition: true,
        mainsFacts: true,
        possibleQuestions: true,
        imageUrl: true,
      },
    });

    return NextResponse.json({ success: true, topics });
  } catch (error) {
    console.error('[Studio Topics API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
