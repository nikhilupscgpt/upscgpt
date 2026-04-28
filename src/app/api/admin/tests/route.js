import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const testPack = await prisma.testPack.findUnique({
        where: { id },
        include: { 
          questions: true,
          _count: { select: { attempts: true } }
        }
      });
      return NextResponse.json({ success: true, testPack });
    }

    const testPacks = await prisma.testPack.findMany({
      include: {
        _count: {
          select: { questions: true, attempts: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, testPacks });
  } catch (error) {
    console.error(`[Admin Test Packs API] GET Error:`, error);
    return NextResponse.json({ error: 'Failed to fetch test packs', details: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, questionIds } = body;

    if (!id || !Array.isArray(questionIds)) {
      return NextResponse.json({ error: 'Test ID and question IDs array required' }, { status: 400 });
    }

    const testPack = await prisma.testPack.update({
      where: { id },
      data: {
        questions: {
          set: questionIds.map(qid => ({ id: qid }))
        }
      }
    });

    return NextResponse.json({ success: true, testPack });
  } catch (error) {
    console.error(`[Admin Test Packs API] PATCH Error:`, error);
    return NextResponse.json({ error: 'Failed to update test pack' }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, type, durationMins, passingScore, issueId, questions } = body;

    const testPack = await prisma.testPack.create({
      data: {
        title,
        description,
        type,
        durationMins: parseInt(durationMins) || 0,
        passingScore: parseInt(passingScore) || 70,
        issueId,
        questions: {
          create: questions.map(q => ({
            text: q.text,
            options: q.options,
            correctLabel: q.correctLabel,
            explanation: q.explanation,
            difficulty: q.difficulty || 'MEDIUM',
            domain: q.domain || 'GENERAL',
            gsPaper: q.gsPaper,
            tags: q.tags || []
          }))
        }
      }
    });

    return NextResponse.json({ success: true, id: testPack.id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
