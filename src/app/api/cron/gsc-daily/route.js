import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { toIstDateStr } from '@/lib/analytics/rollups';

async function upsertGscRows(rows, targetDate) {
  let upserted = 0;
  for (const r of rows) {
    const page = String(r.page || r.keys?.[0] || '').slice(0, 500);
    const query = String(r.query || r.keys?.[1] || '').slice(0, 300);
    if (!page && !query) continue;

    await prisma.gscDailyMetric.upsert({
      where: {
        date_page_query: { date: targetDate, page, query },
      },
      update: {
        clicks: Math.round(Number(r.clicks || 0)),
        impressions: Math.round(Number(r.impressions || 0)),
        ctr: Number(r.ctr || 0),
        position: Number(r.position || 0),
      },
      create: {
        date: targetDate,
        page,
        query,
        clicks: Math.round(Number(r.clicks || 0)),
        impressions: Math.round(Number(r.impressions || 0)),
        ctr: Number(r.ctr || 0),
        position: Number(r.position || 0),
      },
    });
    upserted++;
  }
  return upserted;
}

export async function GET(req) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const siteUrl = process.env.GSC_SITE_URL;
  const accessToken = process.env.GSC_ACCESS_TOKEN;
  if (!siteUrl || !accessToken) {
    return NextResponse.json({
      success: true,
      skipped: true,
      reason: 'GSC_SITE_URL or GSC_ACCESS_TOKEN not configured',
    });
  }

  try {
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const dateStr = toIstDateStr(twoDaysAgo);
    const targetDate = new Date(`${dateStr}T00:00:00+05:30`);

    const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: dateStr,
        endDate: dateStr,
        dimensions: ['page', 'query'],
        rowLimit: 250,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return NextResponse.json({ error: `GSC API error ${resp.status}: ${errText}` }, { status: 502 });
    }

    const json = await resp.json();
    const upserted = await upsertGscRows(json.rows || [], targetDate);

    return NextResponse.json({ success: true, date: dateStr, upserted });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'GSC import failed' }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { date, rows } = await req.json();
    if (!date || !Array.isArray(rows)) {
      return NextResponse.json({ error: 'date and rows[] required' }, { status: 400 });
    }
    const targetDate = new Date(`${String(date).slice(0, 10)}T00:00:00+05:30`);
    const upserted = await upsertGscRows(rows, targetDate);
    return NextResponse.json({ success: true, upserted });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'GSC manual import failed' }, { status: 400 });
  }
}
