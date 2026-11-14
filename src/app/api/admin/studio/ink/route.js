import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

function getFacultyId(session) {
  return session?.user?.id || session?.user?.email || null;
}

function isAuthorized(session) {
  return Boolean(session && (session.user?.role === 'ADMIN' || session.user?.role === 'FACULTY'));
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAuthorized(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const facultyId = getFacultyId(session);
    if (!facultyId) {
      return NextResponse.json({ error: 'Missing faculty identity' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const rawIds = searchParams.get('questionIds') || '';
    const questionIds = rawIds
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 200);

    if (questionIds.length === 0) {
      return NextResponse.json({ layers: [] });
    }

    const layers = await prisma.inkLayer.findMany({
      where: {
        facultyId,
        questionId: { in: questionIds },
      },
      orderBy: { updatedAt: 'asc' },
    });

    return NextResponse.json({ layers });
  } catch (error) {
    console.error('Error fetching InkLayer:', error);
    return NextResponse.json({ error: 'Failed to load ink layers' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAuthorized(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const facultyId = getFacultyId(session);
    if (!facultyId) {
      return NextResponse.json({ error: 'Missing faculty identity' }, { status: 400 });
    }

    const body = await req.json();
    const questionId = String(body?.questionId || '').trim();
    const step = Number(body?.step);
    const board = typeof body?.board === 'string' && body.board ? body.board : 'none';
    const strokes = Array.isArray(body?.strokes) ? body.strokes : [];

    if (!questionId || !Number.isInteger(step)) {
      return NextResponse.json({ error: 'Invalid questionId or step' }, { status: 400 });
    }

    const layer = await prisma.inkLayer.upsert({
      where: {
        facultyId_questionId_step_board: {
          facultyId,
          questionId,
          step,
          board,
        },
      },
      update: {
        strokes,
      },
      create: {
        facultyId,
        questionId,
        step,
        board,
        strokes,
      },
    });

    return NextResponse.json({ ok: true, updatedAt: layer.updatedAt });
  } catch (error) {
    console.error('Error saving InkLayer:', error);
    return NextResponse.json({ error: 'Failed to save ink layer' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAuthorized(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const facultyId = getFacultyId(session);
    if (!facultyId) {
      return NextResponse.json({ error: 'Missing faculty identity' }, { status: 400 });
    }

    const body = await req.json();
    const questionId = String(body?.questionId || '').trim();
    if (!questionId) {
      return NextResponse.json({ error: 'Missing questionId' }, { status: 400 });
    }

    const where = { facultyId, questionId };
    if (Number.isInteger(Number(body?.step))) {
      where.step = Number(body.step);
    }
    if (typeof body?.board === 'string' && body.board) {
      where.board = body.board;
    }

    await prisma.inkLayer.deleteMany({ where });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting InkLayer:', error);
    return NextResponse.json({ error: 'Failed to delete ink layer' }, { status: 500 });
  }
}
