import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const issueId = searchParams.get('issueId');
    const gsPaper = searchParams.get('gsPaper');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    
    const take = limit ? Math.min(parseInt(limit) || 50, 250) : 50;

    const questions = await prisma.question.findMany({
      where: {
        issueId: issueId || undefined,
        gsPaper: gsPaper || undefined,
        text: search ? { contains: search, mode: 'insensitive' } : undefined,
      },
      include: {
        issue: { select: { title: true } },
        _count: { select: { testPacks: true } }
      },
      orderBy: { createdAt: 'desc' },
      take
    });

    return NextResponse.json({ success: true, questions });
  } catch (error) {
    console.error(`[Admin Questions API] GET Error:`, error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      text, options, correctLabel, explanation, 
      difficulty, gsPaper, issueId, tags 
    } = body;

    if (!text || !options || !correctLabel) {
      return NextResponse.json({ error: 'Missing mandatory fields' }, { status: 400 });
    }

    const question = await prisma.question.create({
      data: {
        text,
        options,
        correctLabel,
        explanation,
        difficulty: difficulty || 'MEDIUM',
        gsPaper,
        issueId: issueId || null,
        tags: tags || [],
      }
    });

    return NextResponse.json({ success: true, question });
  } catch (error) {
    console.error(`[Admin Questions API] POST Error:`, error);
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      id, text, options, correctLabel, explanation, 
      difficulty, gsPaper, issueId, tags 
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Question ID required' }, { status: 400 });
    }

    const question = await prisma.question.update({
      where: { id },
      data: {
        text,
        options,
        correctLabel,
        explanation,
        difficulty: difficulty || 'MEDIUM',
        gsPaper,
        issueId: issueId || null,
        tags: tags || [],
      }
    });

    return NextResponse.json({ success: true, question });
  } catch (error) {
    console.error(`[Admin Questions API] PATCH Error:`, error);
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Question ID required' }, { status: 400 });
    }

    await prisma.question.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[Admin Questions API] DELETE Error:`, error);
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
  }
}
