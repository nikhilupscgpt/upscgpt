import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  rebuildDailyRollups,
  rebuildPeriodKpi,
  rebuildQuestionStats,
  toIstDateStr,
} from '@/lib/analytics/rollups';

function shiftIstDate(istDateStr, deltaDays) {
  const [y, m, d] = istDateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + deltaDays));
  return dt.toISOString().slice(0, 10);
}

async function ensureNextMonthEventPartition(todayIst) {
  const [y, m] = todayIst.split('-').map(Number);
  const nextMonthDate = new Date(Date.UTC(y, m, 1)); // m is 1-based so UTC(y, m, 1) is next month
  const ny = nextMonthDate.getUTCFullYear();
  const nm = nextMonthDate.getUTCMonth() + 1;
  const mm = String(nm).padStart(2, '0');
  const partName = `event_raw_${ny}_${mm}`;

  const afterMonthDate = new Date(Date.UTC(ny, nm, 1));
  const ay = afterMonthDate.getUTCFullYear();
  const am = String(afterMonthDate.getUTCMonth() + 1).padStart(2, '0');

  const fromIso = `${ny}-${mm}-01T00:00:00+05:30`;
  const toIso = `${ay}-${am}-01T00:00:00+05:30`;

  await prisma.$executeRawUnsafe(
    `CREATE TABLE IF NOT EXISTS "${partName}" PARTITION OF "event_raw" FOR VALUES FROM ('${fromIso}') TO ('${toIso}')`
  );
  return partName;
}

async function dropExpiredEventPartitions(now) {
  const cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const cutoffYear = cutoffDate.getUTCFullYear();
  const cutoffMonth = cutoffDate.getUTCMonth() + 1;
  const dropped = [];

  const rows = await prisma.$queryRaw`
    SELECT c.relname AS name
    FROM pg_inherits i
    JOIN pg_class c ON c.oid = i.inhrelid
    JOIN pg_class p ON p.oid = i.inhparent
    WHERE p.relname = 'event_raw'
  `;

  for (const row of rows || []) {
    const match = /^event_raw_(\d{4})_(\d{2})$/.exec(row.name);
    if (!match) continue;
    const py = Number(match[1]);
    const pm = Number(match[2]);
    // End of partition month is (py, pm + 1)
    if (py < cutoffYear || (py === cutoffYear && pm < cutoffMonth)) {
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${row.name}"`);
      dropped.push(row.name);
    }
  }
  return dropped;
}

export async function GET(req) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized: Invalid or missing CRON_SECRET' }, { status: 401 });
  }

  const now = new Date();

  try {
    const todayIst = toIstDateStr(now);
    const yesterdayIst = shiftIstDate(todayIst, -1);
    const dayBeforeIst = shiftIstDate(todayIst, -2);

    // 1. Daily rollups for yesterday and day-before-yesterday
    await rebuildDailyRollups(prisma, dayBeforeIst);
    await rebuildDailyRollups(prisma, yesterdayIst);

    // 2. Period KPIs (day, week, month)
    await rebuildPeriodKpi(prisma, 'day', dayBeforeIst);
    await rebuildPeriodKpi(prisma, 'day', yesterdayIst);
    await rebuildPeriodKpi(prisma, 'week', yesterdayIst);
    await rebuildPeriodKpi(prisma, 'month', yesterdayIst);

    // 3. On the 1st of the IST month, create next month's event_raw partition
    let createdPartition = null;
    if (todayIst.endsWith('-01')) {
      createdPartition = await ensureNextMonthEventPartition(todayIst);
    }

    // 4. Rebuild QuestionStats
    await rebuildQuestionStats(prisma);

    // 5. Retention cleanup (30d SecurityEvent & OtpRequest, 90d event_raw partitions)
    const cutoff30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const [secDeleted, otpDeleted, droppedPartitions] = await Promise.all([
      prisma.securityEvent.deleteMany({ where: { at: { lt: cutoff30d } } }),
      prisma.otpRequest.deleteMany({ where: { createdAt: { lt: cutoff30d } } }),
      dropExpiredEventPartitions(now),
    ]);

    return NextResponse.json({
      success: true,
      todayIst,
      rebuiltDates: [dayBeforeIst, yesterdayIst],
      createdPartition,
      droppedPartitions,
      deletedSecurityEvents: secDeleted.count,
      deletedOtpRequests: otpDeleted.count,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('[Cron analytics-daily Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
