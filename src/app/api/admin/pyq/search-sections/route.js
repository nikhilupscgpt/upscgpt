import { NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/security/requireRole';
import {
  getCachedPyqTree,
  normalizeExamFilter,
  searchTreeSections,
} from '@/lib/pyq/tree-service';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const auth = await requireApiRole(['ADMIN', 'FACULTY']);
    if (auth.response) return auth.response;

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const exam = normalizeExamFilter(searchParams.get('exam'));
    const limit = Math.min(25, Math.max(1, Number(searchParams.get('limit')) || 12));

    const tree = await getCachedPyqTree(exam);
    const hits = searchTreeSections(tree, q, limit);

    return NextResponse.json({ exam, query: q, hits });
  } catch (err) {
    console.error('[GET /api/admin/pyq/search-sections] Error:', err);
    return NextResponse.json({ error: 'Failed to search sections' }, { status: 500 });
  }
}
