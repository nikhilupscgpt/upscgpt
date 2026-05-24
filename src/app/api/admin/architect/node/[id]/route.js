import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        articles: { orderBy: { publishedAt: 'desc' }, take: 10 },
        editorials: { orderBy: { publishedAt: 'desc' }, take: 5 },
        nodeContent: true,
        questions: { orderBy: { createdAt: 'desc' } },
      }
    });

    if (!issue) {
      return NextResponse.json({ error: 'Node Not Found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, issue });
  } catch (error) {
    console.error('[Node Detail API] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
