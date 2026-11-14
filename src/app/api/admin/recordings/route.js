import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireApiRole } from '@/lib/security/requireRole';
import { getFacultyPrefs } from '@/lib/pyq/tree-service';
import {
  buildSectionTitle,
  estimateRecordingMinutes,
  splitIntoParts,
} from '@/lib/pyq/recording-helpers';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const auth = await requireApiRole(['ADMIN', 'FACULTY']);
    if (auth.response) return auth.response;

    const { searchParams } = new URL(req.url);
    const sectionPath = searchParams.get('sectionPath') || undefined;
    const status = searchParams.get('status') || undefined;
    const facultyId = auth.session?.user?.id;
    const isAdmin = auth.session?.user?.role === 'ADMIN';

    const where = {};
    if (!isAdmin && facultyId) where.facultyId = facultyId;
    if (sectionPath) where.sectionPath = sectionPath;
    if (status) where.status = status;

    const sessions = await prisma.recordingSession.findMany({
      where,
      orderBy: [{ startedAt: 'desc' }, { id: 'desc' }],
      take: 50,
    });

    return NextResponse.json({ sessions });
  } catch (err) {
    console.error('[GET /api/admin/recordings] Error:', err);
    return NextResponse.json({ error: 'Failed to load recording sessions' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await requireApiRole(['ADMIN', 'FACULTY']);
    if (auth.response) return auth.response;

    const facultyId = auth.session?.user?.id;
    if (!facultyId) {
      return NextResponse.json({ error: 'Missing faculty user id' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
    const topic = typeof body.topic === 'string' ? body.topic.trim() : '';
    const includeCds = Boolean(body.includeCds);
    const deckId = typeof body.deckId === 'string' ? body.deckId.trim() || null : null;
    const prefs = await getFacultyPrefs(facultyId);
    const partSize = Math.max(1, Math.min(100, Number(body.partSize) || prefs.partSize || 20));
    const requestedPart = Math.max(1, Number(body.part) || 1);

    const where = {};
    if (Array.isArray(body.questionIds) && body.questionIds.length > 0) {
      where.id = { in: body.questionIds };
    } else {
      if (subject && subject !== 'ALL') where.srcSubject = subject;
      if (topic && topic !== 'ALL') where.srcTopic = topic;
      if (!includeCds) {
        where.OR = [
          { examCode: 'UPSC_CSE_PRE' },
          { AND: [{ examCode: null }, { examName: { not: { contains: 'CDS', mode: 'insensitive' } } }] },
        ];
      }
    }

    const allMatching = await prisma.questionDraft.findMany({
      where,
      select: {
        id: true,
        examName: true,
        examYear: true,
        questionNo: true,
        srcSubject: true,
        srcTopic: true,
        stem: true,
        contentStatus: true,
        syllabusOrder: true,
      },
      orderBy: [{ syllabusOrder: 'asc' }, { examYear: 'desc' }, { questionNo: 'asc' }],
    });

    const brokenRows = allMatching.filter((r) => r.contentStatus === 'broken');
    const usableRows = allMatching.filter((r) => r.contentStatus !== 'broken');
    const needsExplanationRows = usableRows.filter((r) => r.contentStatus !== 'ready');

    const parts = splitIntoParts(
      usableRows.map((r) => r.id),
      partSize,
    );
    const totalParts = Math.max(1, parts.length);
    const safePart = Math.min(requestedPart, totalParts);
    const partIds = parts[safePart - 1] || [];

    const rowById = new Map(usableRows.map((r) => [r.id, r]));
    const partRows = partIds.map((id) => rowById.get(id)).filter(Boolean);

    const sectionPath =
      topic && subject
        ? `${subject} › ${topic}`
        : subject || 'All PYQs';

    const title = buildSectionTitle({
      subject: subject || partRows[0]?.srcSubject || 'General Studies',
      topic: topic || null,
      years: partRows.map((r) => r.examYear),
      part: safePart,
      totalParts,
    });

    const initialTimestamps = partIds.map((questionId, idx) => ({
      questionId,
      startSec: idx === 0 ? 0 : idx * (prefs.secondsPerQuestion || 75),
    }));

    const session = await prisma.recordingSession.create({
      data: {
        facultyId,
        sectionPath,
        deckId,
        part: safePart,
        totalParts,
        questionIds: partIds,
        includeCds,
        status: 'draft',
        timestamps: initialTimestamps,
        lastIndex: 0,
        title,
      },
    });

    return NextResponse.json(
      {
        session,
        summary: {
          totalUsable: usableRows.length,
          partCount: partIds.length,
          estMinutes: estimateRecordingMinutes(partIds.length, prefs.secondsPerQuestion),
          totalEstMinutes: estimateRecordingMinutes(usableRows.length, prefs.secondsPerQuestion),
          partSize,
          totalParts,
          needsExplanationCount: needsExplanationRows.length,
          brokenCount: brokenRows.length,
        },
        brokenQuestions: brokenRows.map((r) => ({
          id: r.id,
          examName: r.examName,
          examYear: r.examYear,
          questionNo: r.questionNo,
        })),
        questionsPreview: partRows.map((r) => ({
          id: r.id,
          examName: r.examName,
          examYear: r.examYear,
          questionNo: r.questionNo,
          srcSubject: r.srcSubject,
          srcTopic: r.srcTopic,
          stem: r.stem,
          contentStatus: r.contentStatus,
        })),
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('[POST /api/admin/recordings] Error:', err);
    return NextResponse.json({ error: 'Failed to create recording draft' }, { status: 500 });
  }
}
