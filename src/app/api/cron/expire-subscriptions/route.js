import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const expiredUsers = await prisma.user.findMany({
      where: {
        tier: 'PRO',
        role: { not: 'ADMIN' },
        validUntil: { lt: now },
      },
      select: { id: true, email: true, validUntil: true },
    });

    if (expiredUsers.length === 0) {
      return NextResponse.json({
        success: true,
        expiredCount: 0,
        timestamp: now.toISOString(),
      });
    }

    const expiredIds = expiredUsers.map((u) => u.id);

    await prisma.$transaction([
      prisma.user.updateMany({
        where: { id: { in: expiredIds } },
        data: { tier: 'FREE' },
      }),
      ...expiredUsers.map((u) =>
        prisma.actionLog.create({
          data: {
            userId: u.id,
            action: 'PASS_EXPIRED',
            status: 'SUCCESS',
            message: `Pass expired on ${u.validUntil ? u.validUntil.toISOString() : now.toISOString()}`,
          },
        })
      ),
    ]);

    return NextResponse.json({
      success: true,
      expiredCount: expiredUsers.length,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('[Cron Expire Subscriptions Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
