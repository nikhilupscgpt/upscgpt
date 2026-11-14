import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import fs from 'node:fs/promises';
import path from 'node:path';

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
    const questionId = searchParams.get('questionId')?.trim();
    const sessionId = searchParams.get('sessionId')?.trim();

    const where = { facultyId };
    if (questionId) where.questionId = questionId;
    if (sessionId) where.sessionId = sessionId;

    const snapshots = await prisma.snapshot.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ snapshots });
  } catch (error) {
    console.error('Error fetching Snapshot:', error);
    return NextResponse.json({ error: 'Failed to load snapshots' }, { status: 500 });
  }
}

export async function POST(req) {
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
    const sessionId = body?.sessionId ? String(body.sessionId).trim() : null;
    const imageDataUrl = String(body?.imageDataUrl || '').trim();

    if (!questionId || !imageDataUrl.startsWith('data:image/png;base64,')) {
      return NextResponse.json({ error: 'Invalid snapshot payload' }, { status: 400 });
    }

    let imageRef = imageDataUrl;
    const base64 = imageDataUrl.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');

    // Persist to public/uploads/snapshots when filesystem is writable
    try {
      const dir = path.join(process.cwd(), 'public', 'uploads', 'snapshots');
      await fs.mkdir(dir, { recursive: true });
      const filename = `snap_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.png`;
      await fs.writeFile(path.join(dir, filename), buffer);
      imageRef = `/uploads/snapshots/${filename}`;
    } catch {
      // Fallback to data URL in serverless/read-only environments
    }

    const snapshot = await prisma.snapshot.create({
      data: {
        facultyId,
        questionId,
        sessionId,
        imageRef,
      },
    });

    return NextResponse.json({ snapshot });
  } catch (error) {
    console.error('Error saving Snapshot:', error);
    return NextResponse.json({ error: 'Failed to save snapshot' }, { status: 500 });
  }
}
