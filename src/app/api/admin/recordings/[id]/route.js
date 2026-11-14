import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireApiRole } from '@/lib/security/requireRole';
import { invalidatePyqTreeCache } from '@/lib/pyq/tree-service';
import { buildUploadPack } from '@/lib/pyq/recording-helpers';

export const dynamic = 'force-dynamic';

export async function GET(_req, { params }) {
  try {
    const auth = await requireApiRole(['ADMIN', 'FACULTY']);
    if (auth.response) return auth.response;

    const { id } = await params;
    const rec = await prisma.recordingSession.findUnique({ where: { id } });
    if (!rec) return NextResponse.json({ error: 'Recording session not found' }, { status: 404 });

    const userId = auth.session?.user?.id;
    if (rec.facultyId !== userId && auth.session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const drafts = await prisma.questionDraft.findMany({
      where: { id: { in: rec.questionIds } },
      select: {
        id: true,
        examName: true,
        examYear: true,
        questionNo: true,
        srcSubject: true,
        srcTopic: true,
        stem: true,
        contentStatus: true,
      },
    });
    const byId = new Map(drafts.map((d) => [d.id, d]));
    const orderedQuestions = rec.questionIds.map((qId) => byId.get(qId)).filter(Boolean);

    const [subj, top] = (rec.sectionPath || '').split('›').map((s) => s.trim());
    const uploadPack = buildUploadPack({
      title: rec.title || `UPSC Prelims PYQs | ${rec.sectionPath}`,
      subject: subj || orderedQuestions[0]?.srcSubject || null,
      topic: top || orderedQuestions[0]?.srcTopic || null,
      questions: orderedQuestions,
      timestamps: Array.isArray(rec.timestamps) ? rec.timestamps : [],
    });

    return NextResponse.json({
      session: rec,
      questions: orderedQuestions,
      uploadPack,
    });
  } catch (err) {
    console.error('[GET /api/admin/recordings/[id]] Error:', err);
    return NextResponse.json({ error: 'Failed to load recording session' }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const auth = await requireApiRole(['ADMIN', 'FACULTY']);
    if (auth.response) return auth.response;

    const { id } = await params;
    const existing = await prisma.recordingSession.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Recording session not found' }, { status: 404 });

    const userId = auth.session?.user?.id;
    if (existing.facultyId !== userId && auth.session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const data = {};

    if (typeof body.status === 'string' && ['draft', 'recording', 'paused', 'done', 'discarded'].includes(body.status)) {
      data.status = body.status;
      if (body.status === 'recording' && !existing.startedAt) {
        data.startedAt = new Date();
      }
      if (body.status === 'done') {
        data.endedAt = new Date();
      }
    }
    if (Array.isArray(body.questionIds)) {
      data.questionIds = body.questionIds.filter((q) => typeof q === 'string' && q.trim());
    }
    if (typeof body.lastIndex === 'number' && Number.isFinite(body.lastIndex)) {
      data.lastIndex = Math.max(0, Math.floor(body.lastIndex));
    }
    if (Array.isArray(body.timestamps)) {
      data.timestamps = body.timestamps;
    }
    if (typeof body.durationSec === 'number' && Number.isFinite(body.durationSec)) {
      data.durationSec = Math.max(0, Math.floor(body.durationSec));
    }
    if (typeof body.videoRef === 'string' || body.videoRef === null) {
      data.videoRef = body.videoRef;
    }
    if (typeof body.title === 'string' && body.title.trim()) {
      data.title = body.title.trim();
    }
    if (typeof body.description === 'string' || body.description === null) {
      data.description = body.description;
    }

    const updated = await prisma.recordingSession.update({
      where: { id },
      data,
    });

    if (data.status === 'done' && updated.questionIds.length > 0 && userId) {
      await prisma.lectureUsage.createMany({
        data: updated.questionIds.map((questionId) => ({
          questionId,
          facultyId: userId,
          sessionId: updated.id,
        })),
      });
      invalidatePyqTreeCache();
    }

    return NextResponse.json({ session: updated });
  } catch (err) {
    console.error('[PATCH /api/admin/recordings/[id]] Error:', err);
    return NextResponse.json({ error: 'Failed to update recording session' }, { status: 500 });
  }
}
