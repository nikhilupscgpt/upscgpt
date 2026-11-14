import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { writeAuditLog } from '@/lib/security/guards';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [flaggedKeys, openReports] = await Promise.all([
      prisma.questionStats.findMany({
        where: {
          OR: [{ discrimination: { lt: 0 } }, { pCorrect: { lt: 0.2 } }],
        },
        orderBy: [{ discrimination: 'asc' }, { pCorrect: 'asc' }],
        take: 30,
      }),
      prisma.questionReport.findMany({
        where: { status: 'open' },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    return NextResponse.json({ flaggedKeys, openReports });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to load question review queue' }, { status: 500 });
  }
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { reportId, status } = await req.json();
    if (!reportId || !['fixed', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'reportId and status (fixed|rejected) required' }, { status: 400 });
    }

    const before = await prisma.questionReport.findUnique({ where: { id: reportId } });
    const updated = await prisma.questionReport.update({
      where: { id: reportId },
      data: { status },
    });

    await writeAuditLog({
      actorId: session.user.id,
      action: `QUESTION_REPORT_${status.toUpperCase()}`,
      entity: 'QuestionReport',
      entityId: reportId,
      before,
      after: updated,
    });

    return NextResponse.json({ report: updated });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to update report' }, { status: 500 });
  }
}
