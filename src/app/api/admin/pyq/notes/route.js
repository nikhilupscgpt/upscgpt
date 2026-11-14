import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireApiRole } from '@/lib/security/requireRole';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const auth = await requireApiRole(['ADMIN', 'FACULTY']);
    if (auth.response) return auth.response;

    const facultyId = auth.session?.user?.id;
    if (!facultyId) {
      return NextResponse.json({ error: 'Missing faculty user id' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const questionId = typeof body.questionId === 'string' ? body.questionId.trim() : '';
    const noteBody = typeof body.body === 'string' ? body.body.trim() : '';

    if (!questionId || !noteBody) {
      return NextResponse.json({ error: 'questionId and body are required' }, { status: 400 });
    }

    const note = await prisma.teacherNote.upsert({
      where: {
        facultyId_questionId: { facultyId, questionId },
      },
      create: { facultyId, questionId, body: noteBody },
      update: { body: noteBody },
    });

    return NextResponse.json({ note });
  } catch (err) {
    console.error('[POST /api/admin/pyq/notes] Error:', err);
    return NextResponse.json({ error: 'Failed to save teacher note' }, { status: 500 });
  }
}
