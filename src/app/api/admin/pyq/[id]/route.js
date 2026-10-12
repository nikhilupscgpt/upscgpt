import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';

const prisma = new PrismaClient();

function normalizeOptions(opts) {
  if (Array.isArray(opts)) return opts;
  if (typeof opts === 'string') {
    try {
      const parsed = JSON.parse(opts);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return [];
}

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await params;
    const question = await prisma.questionDraft.findUnique({
      where: { id }
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      question: {
        ...question,
        options: normalizeOptions(question.options)
      }
    });
  } catch (error) {
    console.error('[API Admin PYQ ID] GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.questionDraft.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const updateData = {};

    if (body.stem !== undefined) {
      updateData.stem = body.stem.trim();
      updateData.rawText = body.stem.trim();
    }

    if (body.options !== undefined) {
      updateData.options = normalizeOptions(body.options);
    }

    if (body.correctLabel !== undefined) {
      updateData.correctLabel = body.correctLabel ? body.correctLabel.trim().toLowerCase() : null;
    }

    if (body.explanation !== undefined) {
      updateData.explanation = body.explanation ? body.explanation.trim() : null;
    }

    if (body.srcSubject !== undefined) {
      updateData.srcSubject = body.srcSubject ? body.srcSubject.trim() : null;
    }

    if (body.srcTopic !== undefined) {
      updateData.srcTopic = body.srcTopic ? body.srcTopic.trim() : null;
    }

    if (body.srcTheme !== undefined) {
      updateData.srcTheme = body.srcTheme ? body.srcTheme.trim() : null;
    }

    if (body.examName !== undefined) {
      updateData.examName = body.examName ? body.examName.trim() : null;
    }

    if (body.examYear !== undefined) {
      updateData.examYear = parseInt(body.examYear, 10) || existing.examYear;
    }

    if (body.questionNo !== undefined) {
      updateData.questionNo = body.questionNo !== null && body.questionNo !== '' ? parseInt(body.questionNo, 10) : null;
    }

    if (body.difficulty !== undefined) {
      updateData.difficulty = body.difficulty;
    }

    // Recompute dedupHash if stem, year, or questionNo changed
    if (updateData.stem || updateData.examYear || updateData.questionNo !== undefined) {
      const yr = updateData.examYear || existing.examYear || 2025;
      const qNum = updateData.questionNo !== undefined ? updateData.questionNo : existing.questionNo;
      const stm = updateData.stem || existing.stem;
      updateData.dedupHash = crypto
        .createHash('md5')
        .update(`${yr}_${qNum || ''}_${stm}`.toLowerCase().replace(/\s+/g, ''))
        .digest('hex');
    }

    updateData.reviewedBy = session.user?.name || 'admin';
    updateData.reviewedAt = new Date();

    const updated = await prisma.questionDraft.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      question: {
        ...updated,
        options: normalizeOptions(updated.options)
      }
    });
  } catch (error) {
    console.error('[API Admin PYQ ID] PATCH Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.questionDraft.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('[API Admin PYQ ID] DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
