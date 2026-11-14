import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  getIstDayBounds,
  getIstMonthBounds,
  sendOpsAlert,
  toIstDateStr,
} from '@/lib/analytics/rollups';

export async function GET(req) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized: Invalid or missing CRON_SECRET' }, { status: 401 });
  }

  const now = new Date();
  const alerts = [];

  try {
    // 1. Mark stale created/attempted Orders (>24h) as abandoned
    const cutoff24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const abandonedRes = await prisma.order.updateMany({
      where: {
        status: { in: ['created', 'attempted'] },
        createdAt: { lt: cutoff24h },
      },
      data: { status: 'abandoned' },
    });

    // 2. BudgetLimit checks (50%, 80%, 100% of monthlyUsd) + 3x 7-day spike check
    const todayIst = toIstDateStr(now);
    const { startUtc: monthStart, endUtc: monthEnd } = getIstMonthBounds(todayIst);
    const { startUtc: dayStart, endUtc: dayEnd } = getIstDayBounds(todayIst);
    const sevenDaysAgo = new Date(dayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [budgetLimits, monthSpendAgg, todaySpendAgg, weekSpendAgg] = await Promise.all([
      prisma.budgetLimit.findMany({ where: { enabled: true } }),
      prisma.usageLedger.aggregate({
        where: { occurredAt: { gte: monthStart, lt: monthEnd } },
        _sum: { costUsd: true },
      }),
      prisma.usageLedger.aggregate({
        where: { occurredAt: { gte: dayStart, lt: dayEnd } },
        _sum: { costUsd: true },
      }),
      prisma.usageLedger.aggregate({
        where: { occurredAt: { gte: sevenDaysAgo, lt: dayStart } },
        _sum: { costUsd: true },
      }),
    ]);

    const monthSpendUsd = Number(monthSpendAgg._sum.costUsd || 0);
    const todaySpendUsd = Number(todaySpendAgg._sum.costUsd || 0);
    const avg7dDailyUsd = Number(weekSpendAgg._sum.costUsd || 0) / 7;

    for (const limit of budgetLimits) {
      const cap = Number(limit.monthlyUsd || 0);
      if (cap <= 0) continue;

      let scopedSpend = monthSpendUsd;
      if (limit.scope !== 'total') {
        const scopedAgg = await prisma.usageLedger.aggregate({
          where: {
            occurredAt: { gte: monthStart, lt: monthEnd },
            provider: limit.scope,
          },
          _sum: { costUsd: true },
        });
        scopedSpend = Number(scopedAgg._sum.costUsd || 0);
      }

      const ratio = scopedSpend / cap;
      if (ratio >= 1.0) {
        const msg = `Budget "${limit.scope}" reached 100% ($${scopedSpend.toFixed(2)} / $${cap.toFixed(2)})`;
        alerts.push(msg);
        await sendOpsAlert({ subject: `100% Budget Exceeded (${limit.scope})`, message: msg });
      } else if (ratio >= 0.8) {
        const msg = `Budget "${limit.scope}" reached 80% ($${scopedSpend.toFixed(2)} / $${cap.toFixed(2)})`;
        alerts.push(msg);
        await sendOpsAlert({ subject: `80% Budget Warning (${limit.scope})`, message: msg });
      } else if (ratio >= 0.5) {
        const msg = `Budget "${limit.scope}" reached 50% ($${scopedSpend.toFixed(2)} / $${cap.toFixed(2)})`;
        alerts.push(msg);
        await sendOpsAlert({ subject: `50% Budget Notice (${limit.scope})`, message: msg });
      }
    }

    if (avg7dDailyUsd > 0 && todaySpendUsd >= avg7dDailyUsd * 3) {
      const msg = `Today's cost ($${todaySpendUsd.toFixed(2)}) is >= 3x 7-day daily avg ($${avg7dDailyUsd.toFixed(2)})`;
      alerts.push(msg);
      await sendOpsAlert({ subject: '3x Daily Cost Spike Detected', message: msg });
    }

    // 3. Hourly OTP verify rate (< 40% with >= 10 requests)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const [otpTotal, otpVerified] = await Promise.all([
      prisma.otpRequest.count({ where: { createdAt: { gte: oneHourAgo } } }),
      prisma.otpRequest.count({ where: { createdAt: { gte: oneHourAgo }, verified: true } }),
    ]);

    const otpVerifyRate = otpTotal > 0 ? otpVerified / otpTotal : 1;
    if (otpTotal >= 10 && otpVerifyRate < 0.4) {
      const msg = `Hourly OTP verify rate dropped to ${(otpVerifyRate * 100).toFixed(1)}% (${otpVerified}/${otpTotal})`;
      alerts.push(msg);
      await sendOpsAlert({ subject: 'Low OTP Verify Rate Alert', message: msg });
    }

    return NextResponse.json({
      success: true,
      abandonedOrders: abandonedRes.count,
      monthSpendUsd,
      todaySpendUsd,
      avg7dDailyUsd,
      otpTotal,
      otpVerifyRate,
      alerts,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('[Cron analytics-15m Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
