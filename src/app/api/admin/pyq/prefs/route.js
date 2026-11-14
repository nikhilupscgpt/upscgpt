import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireApiRole } from '@/lib/security/requireRole';
import { getFacultyPrefs, normalizeExamFilter } from '@/lib/pyq/tree-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await requireApiRole(['ADMIN', 'FACULTY']);
    if (auth.response) return auth.response;
    const prefs = await getFacultyPrefs(auth.session?.user?.id);
    return NextResponse.json({ prefs });
  } catch (err) {
    console.error('[GET /api/admin/pyq/prefs] Error:', err);
    return NextResponse.json({ error: 'Failed to load preferences' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const auth = await requireApiRole(['ADMIN', 'FACULTY']);
    if (auth.response) return auth.response;

    const facultyId = auth.session?.user?.id;
    if (!facultyId) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const data = {};
    if (body.defaultExam !== undefined) {
      data.defaultExam = normalizeExamFilter(body.defaultExam);
    }
    if (typeof body.includeCds === 'boolean') {
      data.includeCds = body.includeCds;
    }
    if (typeof body.sortOrder === 'string' && ['syllabus', 'exam'].includes(body.sortOrder)) {
      data.sortOrder = body.sortOrder;
    }
    if (typeof body.lastSectionPath === 'string' || body.lastSectionPath === null) {
      data.lastSectionPath = body.lastSectionPath;
    }

    const prefs = await prisma.facultyPrefs.upsert({
      where: { facultyId },
      create: { facultyId, ...data },
      update: data,
    });

    return NextResponse.json({ prefs });
  } catch (err) {
    console.error('[PATCH /api/admin/pyq/prefs] Error:', err);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}
