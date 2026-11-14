import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { validateEvents } from '@/lib/analytics/events';
import { detectDevice, insertEventRawBatch } from '@/lib/analytics/server';
import { toIp24 } from '@/lib/cost/recordUsage';

export const dynamic = 'force-dynamic';

function getClientIp(req) {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || null;
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawList = Array.isArray(body?.events) ? body.events.slice(0, 100) : [];

    const { accepted, dropped } = validateEvents(rawList);
    if (accepted.length === 0) {
      return NextResponse.json({ accepted: 0, dropped: dropped.length });
    }

    const session = await getServerSession(authOptions).catch(() => null);
    const userId = session?.user?.id || null;
    const tier = session?.user?.tier ? String(session.user.tier).toLowerCase() : userId ? 'free' : 'anon';
    const device = detectDevice(req.headers.get('user-agent'));
    const ip24 = toIp24(getClientIp(req));

    // Capture first-touch attribution in AnonProfile on first_visit
    const firstVisit = accepted.find((e) => e.name === 'first_visit');
    if (firstVisit) {
      const p = firstVisit.props;
      await prisma.anonProfile
        .upsert({
          where: { anonId: firstVisit.anonId },
          create: {
            anonId: firstVisit.anonId,
            utmSource: p.utm_source || null,
            utmMedium: p.utm_medium || null,
            utmCampaign: p.utm_campaign || null,
            utmContent: p.utm_content || null,
            referrer: p.referrer || null,
            landingPath: p.landing || null,
            partnerCode: p.partner || null,
            userId,
          },
          update: userId ? { userId } : {},
        })
        .catch(() => {});
    }

    const rows = accepted.map((ev) => ({
      eventId: ev.eventId,
      clientTs: ev.clientTs,
      name: ev.name,
      userId,
      anonId: ev.anonId,
      sessionId: ev.sessionId,
      tier,
      module: ev.module || null,
      entityType: ev.entityType || null,
      entityId: ev.entityId || null,
      props: ev.props,
      device,
      ip24,
    }));

    await insertEventRawBatch(prisma, rows);

    return NextResponse.json({ accepted: rows.length, dropped: dropped.length });
  } catch (err) {
    console.error('[POST /api/e] Error:', err);
    return NextResponse.json({ error: 'Failed to ingest events' }, { status: 500 });
  }
}
