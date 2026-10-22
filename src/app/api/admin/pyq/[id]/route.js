import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';
import { normalizeCanonicalSubject } from '@/lib/syllabusTaxonomy';

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

    if (body.explanation !== undefined || body.analysis !== undefined) {
      if (body.analysis && typeof body.analysis === 'object') {
        updateData.explanation = JSON.stringify({
          explanation: typeof body.explanation === 'string' ? body.explanation.trim() : '',
          analysis: body.analysis
        });
      } else if (body.explanation !== undefined) {
        updateData.explanation = body.explanation ? (typeof body.explanation === 'string' ? body.explanation.trim() : JSON.stringify(body.explanation)) : null;
      }
    }

    if (body.srcSubject !== undefined) {
      const rawSub = body.srcSubject ? body.srcSubject.trim() : null;
      updateData.srcSubject = normalizeCanonicalSubject(rawSub);
    }

    if (body.srcTopic !== undefined) {
      const rawTopic = body.srcTopic ? body.srcTopic.trim() : null;
      // Guardrail: if incoming topic is a long composite string (e.g. from an AI generation)
      // and the existing record already has a canonical topic, keep existing.srcTopic and save rawTopic into srcTheme.
      if (rawTopic && (rawTopic.includes('—') || rawTopic.includes('–') || rawTopic.length > 50)) {
        if (existing.srcTopic) {
          updateData.srcTopic = existing.srcTopic;
          if (!body.srcTheme) updateData.srcTheme = rawTopic;
        } else {
          updateData.srcTopic = rawTopic;
        }
      } else {
        updateData.srcTopic = rawTopic;
      }
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

    try {
      revalidatePath('/prelims/pyq');
      revalidatePath('/api/pyq');
    } catch (e) {
      console.warn('Revalidation error:', e);
    }

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

    try {
      revalidatePath('/prelims/pyq');
      revalidatePath('/api/pyq');
    } catch (e) {
      console.warn('Revalidation error:', e);
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('[API Admin PYQ ID] DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
