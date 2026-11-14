import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireApiRole } from '@/lib/security/requireRole';
import { buildBacklogMatrix } from '@/lib/pyq/editor-validation';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await requireApiRole(['ADMIN']);
    if (auth.response) return auth.response;

    const rows = await prisma.questionDraft.findMany({
      select: {
        id: true,
        examCode: true,
        examName: true,
        examYear: true,
        srcSubject: true,
        srcTopic: true,
        srcTheme: true,
        contentStatus: true,
      },
      orderBy: [{ syllabusOrder: 'asc' }, { examYear: 'desc' }, { questionNo: 'asc' }],
    });

    const matrix = buildBacklogMatrix(rows);
    return NextResponse.json(matrix);
  } catch (err) {
    console.error('[GET /api/admin/pyq/backlog] Error:', err);
    return NextResponse.json({ error: 'Failed to load backlog matrix' }, { status: 500 });
  }
}
