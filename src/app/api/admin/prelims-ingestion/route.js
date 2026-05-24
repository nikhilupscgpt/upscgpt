import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from "@/lib/auth";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return null;
  }
  return session;
}

export async function GET(req) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const list = searchParams.get('list');
  const issueId = searchParams.get('issueId');

  try {
    if (list) {
      const issues = await prisma.issue.findMany({
        select: {
          id: true,
          title: true,
          domain: true,
          category: true,
          slug: true,
          orderIndex: true,
          nodeContent: {
            select: {
              status: true,
              prelimsNote: true
            }
          },
          _count: {
            select: {
              questions: true,
              testPacks: true
            }
          }
        },
        orderBy: [
          { orderIndex: 'asc' },
          { title: 'asc' }
        ]
      });
      return NextResponse.json({ success: true, issues });
    }

    if (issueId) {
      const issue = await prisma.issue.findUnique({
        where: { id: issueId },
        include: {
          nodeContent: true,
          questions: {
            orderBy: { createdAt: 'desc' }
          },
          testPacks: {
            include: {
              _count: {
                select: { questions: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!issue) {
        return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, issue });
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error) {
    console.error('[Prelims Ingestion API] GET Error:', error);
    return NextResponse.json({ error: 'Failed to process request', details: error.message }, { status: 500 });
  }
}
