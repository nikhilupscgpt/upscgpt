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
      prisma.budgetLimit.findMany(),
      prisma.usageLedger.aggregate({
        where: { at: { gte: monthStart, lt: monthEnd } },
        _sum: { costPaise: true },
      }),
      prisma.usageLedger.aggregate({
        where: { at: { gte: dayStart, lt: dayEnd } },
        _sum: { costPaise: true },
      }),
      prisma.usageLedger.aggregate({
        where: { at: { gte: sevenDaysAgo, lt: dayStart } },
        _sum: { costPaise: true },
      }),
    ]);

    const monthSpendPaise = Number(monthSpendAgg._sum.costPaise || 0);
    const todaySpendPaise = Number(todaySpendAgg._sum.costPaise || 0);
    const avg7dDailyPaise = Number(weekSpendAgg._sum.costPaise || 0) / 7;

    for (const limit of budgetLimits) {
      const cap = Number(limit.monthlyPaise || 0);
      if (cap <= 0) continue;

      let scopedSpend = monthSpendPaise;
      if (limit.category !== 'total') {
        const scopedAgg = await prisma.usageLedger.aggregate({
          where: {
            at: { gte: monthStart, lt: monthEnd },
            category: limit.category,
          },
          _sum: { costPaise: true },
        });
        scopedSpend = Number(scopedAgg._sum.costPaise || 0);
      }

      const pct = Math.round((scopedSpend / cap) * 100);
      const thresholds = Array.isArray(limit.alertAt) ? limit.alertAt : [50, 80, 100];
      const hitThreshold = [...thresholds].sort((a, b) => b - a).find((t) => pct >= t);
      if (hitThreshold) {
        const msg = `Budget "${limit.category}" reached ${pct}% (Rs ${(scopedSpend / 100).toFixed(2)} / Rs ${(cap / 100).toFixed(2)})`;
        alerts.push(msg);
        await sendOpsAlert({ subject: `${hitThreshold}% Budget Alert (${limit.category})`, message: msg });
      }
    }

    if (avg7dDailyPaise > 0 && todaySpendPaise >= avg7dDailyPaise * 3) {
      const msg = `Today's cost (Rs ${(todaySpendPaise / 100).toFixed(2)}) is >= 3x 7-day daily avg (Rs ${(avg7dDailyPaise / 100).toFixed(2)})`;
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
      monthSpendPaise,
      todaySpendPaise,
      avg7dDailyPaise,
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
