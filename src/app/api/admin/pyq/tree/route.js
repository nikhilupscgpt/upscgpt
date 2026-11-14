import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/security/requireRole';
import {
  getCachedPyqTree,
  getFacultyPrefs,
  normalizeExamFilter,
} from '@/lib/pyq/tree-service';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const auth = await requireApiRole(['ADMIN', 'FACULTY']);
    if (auth.response) return auth.response;

    const { searchParams } = new URL(req.url);
    const prefs = await getFacultyPrefs(auth.session?.user?.id);
    const examParam = searchParams.get('exam');
    const exam = examParam ? normalizeExamFilter(examParam) : prefs.defaultExam;

    const tree = await getCachedPyqTree(exam);

    return NextResponse.json({
      ...tree,
      prefs,
    });
  } catch (err) {
    console.error('[GET /api/admin/pyq/tree] Error:', err);
    return NextResponse.json({ error: 'Failed to load syllabus tree' }, { status: 500 });
  }
}
