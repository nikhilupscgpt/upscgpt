const IST_OFFSET_MS = 330 * 60 * 1000; // UTC+05:30

/**
 * Formats a UTC Date as an IST YYYY-MM-DD date string.
 */
export function toIstDateStr(date: Date = new Date()): string {
  const ist = new Date(date.getTime() + IST_OFFSET_MS);
  return ist.toISOString().slice(0, 10);
}

/**
 * Returns [startUtc, endUtcExclusive] for a given IST YYYY-MM-DD day.
 */
export function getIstDayBounds(istDateStr: string): { startUtc: Date; endUtc: Date; periodStart: string } {
  const [y, m, d] = istDateStr.split('-').map(Number);
  const startUtcMs = Date.UTC(y, m - 1, d, 0, 0, 0, 0) - IST_OFFSET_MS;
  const endUtcMs = startUtcMs + 24 * 60 * 60 * 1000;
  return {
    startUtc: new Date(startUtcMs),
    endUtc: new Date(endUtcMs),
    periodStart: istDateStr,
  };
}

/**
 * Returns [startUtc, endUtcExclusive] for the Monday-Sunday IST week containing istDateStr.
 */
export function getIstWeekBounds(istDateStr: string): { startUtc: Date; endUtc: Date; periodStart: string } {
  const [y, m, d] = istDateStr.split('-').map(Number);
  const utcMidnight = new Date(Date.UTC(y, m - 1, d));
  const dayOfWeek = utcMidnight.getUTCDay(); // 0=Sun, 1=Mon, ...
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const mondayUtc = new Date(utcMidnight.getTime() + diffToMonday * 86400_000);
  const mondayStr = mondayUtc.toISOString().slice(0, 10);
  const { startUtc } = getIstDayBounds(mondayStr);
  return {
    startUtc,
    endUtc: new Date(startUtc.getTime() + 7 * 86400_000),
    periodStart: mondayStr,
  };
}

/**
 * Returns [startUtc, endUtcExclusive] for the calendar month in IST.
 */
export function getIstMonthBounds(istDateStr: string): { startUtc: Date; endUtc: Date; periodStart: string } {
  const [y, m] = istDateStr.split('-').map(Number);
  const firstStr = `${y}-${String(m).padStart(2, '0')}-01`;
  const nextY = m === 12 ? y + 1 : y;
  const nextM = m === 12 ? 1 : m + 1;
  const nextStr = `${nextY}-${String(nextM).padStart(2, '0')}-01`;
  const { startUtc } = getIstDayBounds(firstStr);
  const { startUtc: endUtc } = getIstDayBounds(nextStr);
  return { startUtc, endUtc, periodStart: firstStr };
}

/**
 * Pure helper to compute distinct active actors over a period (never sum daily uniques).
 * Meaningful activity = AttemptAnswer, entity_view_end(activeSec >= 10), or mapbot_query.
 */
export function countDistinctActiveActors(
  answers: Array<{ userId?: string | null; anonId?: string | null; answeredAt: Date }>,
  events: Array<{ name: string; userId?: string | null; anonId: string; props?: any; createdAt: Date }>,
  startUtc: Date,
  endUtc: Date
): number {
  const set = new Set<string>();
  for (const a of answers) {
    if (a.answeredAt >= startUtc && a.answeredAt < endUtc) {
      const actor = a.userId || a.anonId;
      if (actor) set.add(actor);
    }
  }
  for (const e of events) {
    if (e.createdAt < startUtc || e.createdAt >= endUtc) continue;
    const meaningful =
      e.name === 'mapbot_query' ||
      (e.name === 'entity_view_end' && Number(e.props?.activeSec || 0) >= 10);
    if (meaningful) {
      set.add(e.userId || e.anonId);
    }
  }
  return set.size;
}

/**
 * Sends operational alerts to Admin Email + Telegram bot if configured.
 */
export async function sendOpsAlert(params: { subject: string; message: string }) {
  const botToken = process.env.ALERT_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.ALERT_TELEGRAM_CHAT_ID;
  if (botToken && chatId) {
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `*[upscgpt+ Alert]* ${params.subject}\n${params.message}`,
        parse_mode: 'Markdown',
      }),
    }).catch(() => {});
  }

  const adminEmail = process.env.ADMIN_ALERT_EMAIL || process.env.GMAIL_USER;
  if (adminEmail) {
    try {
      const { sendEmail } = await import('../comms.js');
      await sendEmail({
        to: adminEmail,
        subject: `[upscgpt+ Alert] ${params.subject}`,
        text: params.message,
        purpose: 'alert',
        template: 'ops_alert',
      });
    } catch {}
  }
}

/**
 * Computes & upserts kpi_period for day | week | month over exact IST boundaries.
 */
export async function rebuildPeriodKpi(
  db: any,
  periodType: 'day' | 'week' | 'month',
  istDateStr: string
) {
  const bounds =
    periodType === 'day'
      ? getIstDayBounds(istDateStr)
      : periodType === 'week'
        ? getIstWeekBounds(istDateStr)
        : getIstMonthBounds(istDateStr);

  const { startUtc, endUtc, periodStart } = bounds;

  const eventStatsRows = await db.$queryRawUnsafe(
    `
    SELECT
      COUNT(DISTINCT session_id)::int AS sessions,
      COUNT(DISTINCT COALESCE(user_id, anon_id)) FILTER (WHERE name = 'page_view')::int AS unique_visitors,
      COUNT(DISTINCT COALESCE(user_id, anon_id)) FILTER (
        WHERE name = 'mapbot_query'
           OR (name = 'entity_view_end' AND COALESCE((props->>'activeSec')::int, 0) >= 10)
      )::int AS event_active_users
    FROM event_raw
    WHERE created_at >= $1 AND created_at < $2
    `,
    startUtc,
    endUtc
  ).catch(() => [{ sessions: 0, unique_visitors: 0, event_active_users: 0 }]);

  const evRow = eventStatsRows?.[0] || {};

  const [
    newVisitors,
    signups,
    carts,
    cartsAbandoned,
    paymentsFailed,
    capturedEvents,
    refundedEvents,
    activeProEod,
    proExpired,
    answerActorsRows,
  ] = await Promise.all([
    db.anonProfile.count({ where: { firstSeenAt: { gte: startUtc, lt: endUtc } } }).catch(() => 0),
    db.user.count({ where: { createdAt: { gte: startUtc, lt: endUtc } } }).catch(() => 0),
    db.order.count({ where: { createdAt: { gte: startUtc, lt: endUtc } } }).catch(() => 0),
    db.order.count({ where: { createdAt: { gte: startUtc, lt: endUtc }, status: 'abandoned' } }).catch(() => 0),
    db.paymentEvent
      .count({ where: { receivedAt: { gte: startUtc, lt: endUtc }, type: 'payment.failed' } })
      .catch(() => 0),
    db.paymentEvent
      .findMany({
        where: { receivedAt: { gte: startUtc, lt: endUtc }, type: { in: ['payment.captured', 'order.paid'] } },
        select: { amountPaise: true, feePaise: true, taxOnFeePaise: true, isRenewal: true },
      })
      .catch(() => []),
    db.paymentEvent
      .findMany({
        where: { receivedAt: { gte: startUtc, lt: endUtc }, type: 'refund.processed' },
        select: { amountPaise: true },
      })
      .catch(() => []),
    db.user
      .count({
        where: {
          role: { not: 'ADMIN' },
          tier: 'PRO',
          OR: [{ validUntil: null }, { validUntil: { gt: endUtc } }],
        },
      })
      .catch(() => 0),
    db.user
      .count({
        where: {
          role: { not: 'ADMIN' },
          validUntil: { gte: startUtc, lt: endUtc },
        },
      })
      .catch(() => 0),
    db.$queryRawUnsafe(
      `
      SELECT COUNT(DISTINCT COALESCE(a."userId", a."anonId"))::int AS cnt
      FROM "AttemptAnswer" aa
      JOIN "Attempt" a ON a.id = aa."attemptId"
      WHERE aa."answeredAt" >= $1 AND aa."answeredAt" < $2
      `,
      startUtc,
      endUtc
    ).catch(() => [{ cnt: 0 }]),
  ]);

  let subsNew = 0;
  let subsRenewal = 0;
  let revenuePaise = 0;
  let feesPaise = 0;
  for (const p of capturedEvents) {
    if (p.isRenewal) subsRenewal++;
    else subsNew++;
    revenuePaise += Number(p.amountPaise || 0);
    feesPaise += Number(p.feePaise || 0) + Number(p.taxOnFeePaise || 0);
  }

  const refundsPaise = refundedEvents.reduce((s: number, r: any) => s + Number(r.amountPaise || 0), 0);
  const netRevenuePaise = Math.max(0, revenuePaise - refundsPaise);
  const answerUsers = Number(answerActorsRows?.[0]?.cnt || 0);
  const activeUsers = Math.max(Number(evRow.event_active_users || 0), answerUsers);

  await db.$executeRawUnsafe(
    `
    INSERT INTO kpi_period (
      period_type, period_start, sessions, unique_visitors, new_visitors, active_users,
      signups, carts, carts_abandoned, payments_failed, subs_new, subs_renewal,
      revenue_paise, refunds_paise, fees_paise, active_pro_eod, pro_expired
    ) VALUES (
      $1, $2::date, $3, $4, $5, $6,
      $7, $8, $9, $10, $11, $12,
      $13, $14, $15, $16, $17
    )
    ON CONFLICT (period_type, period_start) DO UPDATE SET
      sessions = EXCLUDED.sessions,
      unique_visitors = EXCLUDED.unique_visitors,
      new_visitors = EXCLUDED.new_visitors,
      active_users = EXCLUDED.active_users,
      signups = EXCLUDED.signups,
      carts = EXCLUDED.carts,
      carts_abandoned = EXCLUDED.carts_abandoned,
      payments_failed = EXCLUDED.payments_failed,
      subs_new = EXCLUDED.subs_new,
      subs_renewal = EXCLUDED.subs_renewal,
      revenue_paise = EXCLUDED.revenue_paise,
      refunds_paise = EXCLUDED.refunds_paise,
      fees_paise = EXCLUDED.fees_paise,
      active_pro_eod = EXCLUDED.active_pro_eod,
      pro_expired = EXCLUDED.pro_expired
    `,
    periodType,
    periodStart,
    Number(evRow.sessions || 0),
    Number(evRow.unique_visitors || 0),
    newVisitors,
    activeUsers,
    signups,
    carts,
    cartsAbandoned,
    paymentsFailed,
    subsNew,
    subsRenewal,
    netRevenuePaise,
    refundsPaise,
    feesPaise,
    activeProEod,
    proExpired
  );
}

/**
 * Rebuilds daily rollup tables for a given IST YYYY-MM-DD date.
 */
export async function rebuildDailyRollups(db: any, istDateStr: string) {
  await rebuildPeriodKpi(db, 'day', istDateStr);
  const { startUtc, endUtc } = getIstDayBounds(istDateStr);

  // learning_daily
  await db.$executeRawUnsafe(
    `
    INSERT INTO learning_daily (date, module, subject, answered, correct, median_sec, users)
    SELECT
      $1::date,
      a.module,
      COALESCE(aa.subject, 'General'),
      COUNT(*)::int,
      COUNT(*) FILTER (WHERE aa."isCorrect" = true)::int,
      COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY aa."timeSpentSec"), 0)::int,
      COUNT(DISTINCT COALESCE(a."userId", a."anonId"))::int
    FROM "AttemptAnswer" aa
    JOIN "Attempt" a ON a.id = aa."attemptId"
    WHERE aa."answeredAt" >= $2 AND aa."answeredAt" < $3
    GROUP BY a.module, COALESCE(aa.subject, 'General')
    ON CONFLICT (date, module, subject) DO UPDATE SET
      answered = EXCLUDED.answered,
      correct = EXCLUDED.correct,
      median_sec = EXCLUDED.median_sec,
      users = EXCLUDED.users
    `,
    istDateStr,
    startUtc,
    endUtc
  ).catch(() => {});

  // cost_daily
  await db.$executeRawUnsafe(
    `
    INSERT INTO cost_daily (date, category, feature, provider, quantity, cost_paise)
    SELECT
      $1::date,
      category,
      feature,
      provider,
      SUM(quantity)::float8,
      SUM("costPaise")::bigint
    FROM "UsageLedger"
    WHERE at >= $2 AND at < $3
    GROUP BY category, feature, provider
    ON CONFLICT (date, category, feature, provider) DO UPDATE SET
      quantity = EXCLUDED.quantity,
      cost_paise = EXCLUDED.cost_paise
    `,
    istDateStr,
    startUtc,
    endUtc
  ).catch(() => {});

  // message_daily
  await db.$executeRawUnsafe(
    `
    INSERT INTO message_daily (date, channel, purpose, sent, delivered, bounced, failed, clicked, complained, unsubscribed, cost_paise)
    SELECT
      $1::date,
      channel,
      purpose,
      COUNT(*)::int,
      COUNT(*) FILTER (WHERE status = 'delivered')::int,
      COUNT(*) FILTER (WHERE status = 'bounced')::int,
      COUNT(*) FILTER (WHERE status = 'failed')::int,
      COUNT(*) FILTER (WHERE status = 'clicked')::int,
      COUNT(*) FILTER (WHERE status = 'complained')::int,
      COUNT(*) FILTER (WHERE status = 'unsubscribed')::int,
      COALESCE(SUM("costPaise"), 0)::bigint
    FROM "MessageLog"
    WHERE "createdAt" >= $2 AND "createdAt" < $3
    GROUP BY channel, purpose
    ON CONFLICT (date, channel, purpose) DO UPDATE SET
      sent = EXCLUDED.sent,
      delivered = EXCLUDED.delivered,
      bounced = EXCLUDED.bounced,
      failed = EXCLUDED.failed,
      clicked = EXCLUDED.clicked,
      complained = EXCLUDED.complained,
      unsubscribed = EXCLUDED.unsubscribed,
      cost_paise = EXCLUDED.cost_paise
    `,
    istDateStr,
    startUtc,
    endUtc
  ).catch(() => {});

  // feature_daily
  await db.$executeRawUnsafe(
    `
    INSERT INTO feature_daily (date, module, feature, users, events)
    SELECT
      $1::date,
      COALESCE(module, 'portal'),
      name,
      COUNT(DISTINCT COALESCE(user_id, anon_id))::int,
      COUNT(*)::int
    FROM event_raw
    WHERE created_at >= $2 AND created_at < $3
    GROUP BY COALESCE(module, 'portal'), name
    ON CONFLICT (date, module, feature) DO UPDATE SET
      users = EXCLUDED.users,
      events = EXCLUDED.events
    `,
    istDateStr,
    startUtc,
    endUtc
  ).catch(() => {});

  // search_zero
  await db.$executeRawUnsafe(
    `
    INSERT INTO search_zero (date, scope, query, count)
    SELECT
      $1::date,
      COALESCE(props->>'scope', 'all'),
      props->>'query',
      COUNT(*)::int
    FROM event_raw
    WHERE created_at >= $2 AND created_at < $3
      AND name = 'search'
      AND COALESCE((props->>'resultCount')::int, 1) = 0
      AND NULLIF(props->>'query', '') IS NOT NULL
    GROUP BY COALESCE(props->>'scope', 'all'), props->>'query'
    ON CONFLICT (date, scope, query) DO UPDATE SET
      count = EXCLUDED.count
    `,
    istDateStr,
    startUtc,
    endUtc
  ).catch(() => {});
}

/**
 * Rebuilds QuestionStats with pCorrect, medianSec, and top27%-bottom27% discrimination.
 */
export async function rebuildQuestionStats(db: any) {
  await db.$executeRawUnsafe(
    `
    WITH attempt_scores AS (
      SELECT id, CASE WHEN total > 0 THEN (correct::float / total) ELSE 0 END AS score_ratio
      FROM "Attempt"
      WHERE total > 0
    ),
    ranked AS (
      SELECT
        aa."sourceType",
        aa."sourceId",
        aa."isCorrect",
        aa."timeSpentSec",
        NTILE(100) OVER (PARTITION BY aa."sourceType", aa."sourceId" ORDER BY s.score_ratio DESC) AS pct_rank
      FROM "AttemptAnswer" aa
      JOIN attempt_scores s ON s.id = aa."attemptId"
    )
    INSERT INTO "QuestionStats" ("sourceType", "sourceId", attempts, "pCorrect", discrimination, "medianSec", "updatedAt")
    SELECT
      "sourceType",
      "sourceId",
      COUNT(*)::int AS attempts,
      AVG(CASE WHEN "isCorrect" THEN 1.0 ELSE 0.0 END)::float8 AS "pCorrect",
      CASE
        WHEN COUNT(*) >= 30 THEN
          COALESCE(AVG(CASE WHEN "isCorrect" THEN 1.0 ELSE 0.0 END) FILTER (WHERE pct_rank <= 27), 0)
          - COALESCE(AVG(CASE WHEN "isCorrect" THEN 1.0 ELSE 0.0 END) FILTER (WHERE pct_rank >= 74), 0)
        ELSE NULL
      END AS discrimination,
      COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "timeSpentSec"), 0)::int AS "medianSec",
      now()
    FROM ranked
    GROUP BY "sourceType", "sourceId"
    ON CONFLICT ("sourceType", "sourceId") DO UPDATE SET
      attempts = EXCLUDED.attempts,
      "pCorrect" = EXCLUDED."pCorrect",
      discrimination = EXCLUDED.discrimination,
      "medianSec" = EXCLUDED."medianSec",
      "updatedAt" = now()
    `
  ).catch(() => {});
}
