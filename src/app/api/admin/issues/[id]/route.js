import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return null;
  }
  return session;
}

export async function PATCH(req, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    console.log(`[PATCH DEBUG] ID: ${id}`);
    
    const data = {};
    const fields = [
      'title', 'backgroundNote', 'cumulativeSummary', 'mainsNote', 'mainsFacts', 'valueAddition', 'prelimsNote', 'possibleQuestions',
      'title_hi', 'topic_hi', 'backgroundNote_hi', 'cumulativeSummary_hi', 'mainsNote_hi', 'mainsFacts_hi', 'valueAddition_hi', 'prelimsNote_hi', 'possibleQuestions_hi',
      'title_mr', 'topic_mr', 'backgroundNote_mr', 'cumulativeSummary_mr', 'mainsNote_mr', 'mainsFacts_mr', 'valueAddition_mr', 'prelimsNote_mr', 'possibleQuestions_mr'
    ];

    fields.forEach(f => {
      if (body[f] !== undefined) data[f] = body[f] === null ? null : String(body[f]);
    });

    if (body.status) data.status = body.status;
    if (body.orderIndex !== undefined) data.orderIndex = parseInt(body.orderIndex) || 0;

    await prisma.issue.update({
      where: { id: String(id) },
      data
    });

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[PATCH FATAL]', error);
    return new Response(JSON.stringify({ error: 'CRASH', msg: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function GET(req, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const issue = await prisma.issue.findUnique({ 
      where: { id: String(id) },
      include: {
        questions: { orderBy: { createdAt: 'desc' } },
        articles: { orderBy: { publishedAt: 'desc' }, take: 10 },
        editorials: { orderBy: { publishedAt: 'desc' }, take: 5 },
        newsStreaks: { where: { status: 'ACTIVE' }, select: { id: true, title: true } }
      }
    });
    return NextResponse.json({ success: true, issue });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
export async function DELETE(req, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.issue.delete({ where: { id: String(id) } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE ERROR]', err);
    return NextResponse.json({ error: 'Failed to delete node' }, { status: 500 });
  }
}
