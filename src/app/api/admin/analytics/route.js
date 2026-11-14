import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  getIstDayBounds,
  toIstDateStr,
} from '@/lib/analytics/rollups';

const CACHE_TTL_MS = 60 * 1000;

function getCacheStore() {
  if (!globalThis.__analyticsAdminCache) {
    globalThis.__analyticsAdminCache = new Map();
  }
  return globalThis.__analyticsAdminCache;
}

function serializeBigInt(obj) {
  return JSON.parse(
    JSON.stringify(obj, (_, val) => (typeof val === 'bigint' ? Number(val) : val))
  );
}

async function safeQueryRaw(fn, fallback = []) {
  try {
    const res = await fn();
    return serializeBigInt(res);
  } catch (err) {
    console.warn('[Admin Analytics Query Warning]:', err?.message);
    return fallback;
  }
}

async function getLiveTodaySummary(now) {
  const cache = getCacheStore();
  const cached = cache.get('today');
  if (cached && now.getTime() - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }

  const todayIst = toIstDateStr(now);
  const { startUtc, endUtc } = getIstDayBounds(todayIst);

  const [
    signupsToday,
    answersToday,
    correctToday,
    paidOrdersToday,
    abandonedOrdersToday,
    usageToday,
    msgCostToday,
    securityEventsToday,
    openReports,
  ] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: startUtc, lt: endUtc } } }),
    prisma.attemptAnswer.count({ where: { createdAt: { gte: startUtc, lt: endUtc } } }),
    prisma.attemptAnswer.count({ where: { createdAt: { gte: startUtc, lt: endUtc }, isCorrect: true } }),
    prisma.order.aggregate({
      where: { status: 'paid', paidAt: { gte: startUtc, lt: endUtc } },
      _count: { _all: true },
      _sum: { amountPaise: true },
    }),
    prisma.order.count({
      where: { status: 'abandoned', createdAt: { gte: startUtc, lt: endUtc } },
    }),
    prisma.usageLedger.aggregate({
      where: { occurredAt: { gte: startUtc, lt: endUtc } },
      _sum: { costInrPaise: true },
    }),
    prisma.messageLog.aggregate({
      where: { createdAt: { gte: startUtc, lt: endUtc } },
      _sum: { costPaise: true },
    }),
    prisma.securityEvent.count({ where: { createdAt: { gte: startUtc, lt: endUtc } } }),
    prisma.questionReport.count({ where: { status: 'open' } }),
  ]);

  const activeUsersRows = await safeQueryRaw(
    () => prisma.$queryRaw`
      SELECT COUNT(DISTINCT "userId")::int AS cnt
      FROM "Attempt"
      WHERE "startedAt" >= ${startUtc} AND "startedAt" < ${endUtc}
        AND "userId" IS NOT NULL
    `,
    [{ cnt: 0 }]
  );

  const data = {
    dateIst: todayIst,
    activeUsers: Number(activeUsersRows?.[0]?.cnt || 0),
    signups: signupsToday,
    answers: answersToday,
    accuracyPct: answersToday > 0 ? Math.round((correctToday / answersToday) * 1000) / 10 : 0,
    paidOrders: paidOrdersToday._count._all,
    revenuePaise: Number(paidOrdersToday._sum.amountPaise || 0),
    abandonedOrders: abandonedOrdersToday,
    costPaise:
      Number(usageToday._sum.costInrPaise || 0) +
      Number(msgCostToday._sum.costPaise || 0),
    securityEvents: securityEventsToday,
    openQuestionReports: openReports,
    cachedAt: now.toISOString(),
  };

  cache.set('today', { ts: now.getTime(), data });
  return data;
}

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const periodParam = searchParams.get('period') || 'day';
    const period = ['day', 'week', 'month'].includes(periodParam) ? periodParam : 'day';

    const now = new Date();
    const todayIst = toIstDateStr(now);
    const lookbackDays = period === 'day' ? 14 : period === 'week' ? 84 : 180;
    const sinceDate = new Date(now.getTime() - lookbackDays * 24 * 60 * 60 * 1000);

    const [
      todayLive,
      kpiRows,
      learningRows,
      questionStats,
      featureRows,
      searchZeroRows,
      costRows,
      messageRows,
      budgetLimits,
      fixedCosts,
      marketingRows,
      campaigns,
      marketingSpend,
      securityEvents,
      auditLogs,
      otpStats,
      questionReports,
    ] = await Promise.all([
      getLiveTodaySummary(now),
      safeQueryRaw(() =>
        prisma.$queryRaw`
          SELECT * FROM kpi_period
          WHERE period_type = ${period}
          ORDER BY period_start DESC
          LIMIT 12
        `
      ),
      safeQueryRaw(() =>
        prisma.$queryRaw`
          SELECT module, subject,
                 SUM(answered)::int AS answered,
                 SUM(correct)::int AS correct,
                 SUM(users)::int AS users
          FROM learning_daily
          WHERE date >= ${sinceDate}::date
          GROUP BY module, subject
          ORDER BY answered DESC
          LIMIT 25
        `
      ),
      prisma.questionStats.findMany({
        orderBy: [{ flagCount: 'desc' }, { accuracyPct: 'asc' }],
        take: 20,
      }),
      safeQueryRaw(() =>
        prisma.$queryRaw`
          SELECT module, feature,
                 SUM(users)::int AS users,
                 SUM(events)::int AS events
          FROM feature_daily
          WHERE date >= ${sinceDate}::date
          GROUP BY module, feature
          ORDER BY events DESC
          LIMIT 25
        `
      ),
      safeQueryRaw(() =>
        prisma.$queryRaw`
          SELECT scope, query, SUM(count)::int AS count
          FROM search_zero
          WHERE date >= ${sinceDate}::date
          GROUP BY scope, query
          ORDER BY count DESC
          LIMIT 20
        `
      ),
      safeQueryRaw(() =>
        prisma.$queryRaw`
          SELECT category, feature, provider,
                 SUM(quantity)::float AS quantity,
                 SUM(cost_paise)::bigint AS cost_paise
          FROM cost_daily
          WHERE date >= ${sinceDate}::date
          GROUP BY category, feature, provider
          ORDER BY cost_paise DESC
          LIMIT 30
        `
      ),
      safeQueryRaw(() =>
        prisma.$queryRaw`
          SELECT channel, purpose,
                 SUM(sent)::int AS sent,
                 SUM(delivered)::int AS delivered,
                 SUM(bounced)::int AS bounced,
                 SUM(failed)::int AS failed,
                 SUM(clicked)::int AS clicked,
                 SUM(cost_paise)::bigint AS cost_paise
          FROM message_daily
          WHERE date >= ${sinceDate}::date
          GROUP BY channel, purpose
          ORDER BY sent DESC
          LIMIT 20
        `
      ),
      prisma.budgetLimit.findMany({ orderBy: { scope: 'asc' } }),
      prisma.fixedCost.findMany({ orderBy: { month: 'desc' }, take: 12 }),
      safeQueryRaw(() =>
        prisma.$queryRaw`
          SELECT source, campaign,
                 SUM(visitors)::int AS visitors,
                 SUM(signups)::int AS signups,
                 SUM(carts)::int AS carts,
                 SUM(subs)::int AS subs,
                 SUM(revenue_paise)::bigint AS revenue_paise,
                 SUM(spend_paise)::bigint AS spend_paise
          FROM marketing_daily
          WHERE date >= ${sinceDate}::date
          GROUP BY source, campaign
          ORDER BY revenue_paise DESC, signups DESC
          LIMIT 25
        `
      ),
      prisma.campaign.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
      prisma.marketingSpend.findMany({ orderBy: { date: 'desc' }, take: 20 }),
      prisma.securityEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 30 }),
      prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 30 }),
      prisma.otpRequest.groupBy({
        by: ['verified'],
        where: { createdAt: { gte: sinceDate } },
        _count: { _all: true },
      }),
      prisma.questionReport.findMany({
        where: { status: 'open' },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    const currentPeriod = kpiRows[0] || null;
    const previousPeriod = kpiRows[1] || null;

    return NextResponse.json({
      period,
      todayIst,
      todayLive,
      overview: {
        current: currentPeriod,
        previous: previousPeriod,
        series: [...kpiRows].reverse(),
      },
      learning: {
        subjects: learningRows,
        questionStats,
        openReports: questionReports,
      },
      product: {
        features: featureRows,
        searchZero: searchZeroRows,
      },
      costs: {
        breakdown: costRows,
        messages: messageRows,
        budgetLimits,
        fixedCosts,
      },
      marketing: {
        attribution: marketingRows,
        campaigns,
        spend: marketingSpend,
      },
      security: {
        events: securityEvents,
        auditLogs,
        otpSummary: otpStats.reduce(
          (acc, row) => {
            if (row.verified) acc.verified += row._count._all;
            else acc.unverified += row._count._all;
            return acc;
          },
          { verified: 0, unverified: 0 }
        ),
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/analytics Error]:', error);
    return NextResponse.json({ error: error.message || 'Analytics query failed' }, { status: 500 });
  }
}
