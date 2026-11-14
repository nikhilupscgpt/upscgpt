import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/comms';
import { canSendLifecycleMessage, signUnsubscribeToken } from '@/lib/analytics/marketing';
import { toIstDateStr } from '@/lib/analytics/rollups';

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://upscgpt.in';

async function dispatchFlowEmail({ user, flow, cycleKey, subject, bodyText }) {
  if (!canSendLifecycleMessage(user)) {
    await prisma.lifecycleDispatch
      .create({
        data: { userId: user.id, flow, cycleKey, channel: 'email', status: 'skipped_optout' },
      })
      .catch(() => null);
    return 'skipped_optout';
  }

  const existing = await prisma.lifecycleDispatch.findUnique({
    where: { userId_flow_cycleKey: { userId: user.id, flow, cycleKey } },
  });
  if (existing) return 'already_sent';

  const token = signUnsubscribeToken(user.id);
  const unsubUrl = `${APP_BASE_URL}/api/unsubscribe?token=${encodeURIComponent(token)}`;
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#0f172a;">
      <p>Hi ${user.name || 'Aspirant'},</p>
      <p>${bodyText}</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
      <p style="font-size:12px;color:#64748b;">
        Don't want these updates? <a href="${unsubUrl}">Unsubscribe in one click</a>.
      </p>
    </div>
  `;

  try {
    await sendEmail({
      to: user.email,
      subject,
      html,
      text: `${bodyText}\n\nUnsubscribe: ${unsubUrl}`,
      purpose: 'marketing',
      template: `lifecycle_${flow}`,
      userId: user.id,
    });

    await prisma.lifecycleDispatch.create({
      data: { userId: user.id, flow, cycleKey, channel: 'email', status: 'sent' },
    });
    return 'sent';
  } catch (err) {
    await prisma.lifecycleDispatch
      .create({
        data: { userId: user.id, flow, cycleKey, channel: 'email', status: 'failed' },
      })
      .catch(() => null);
    return 'failed';
  }
}

export async function GET(req) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const todayIst = toIstDateStr(now);
  const summary = {
    welcome: 0,
    abandoned_cart_1h: 0,
    abandoned_cart_24h: 0,
    pro_expiry_7d: 0,
    pro_expiry_1d: 0,
    win_back_14d: 0,
    prelims_countdown: 0,
  };

  try {
    // 1. Welcome: users created in the last 24h
    const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const newUsers = await prisma.user.findMany({
      where: { createdAt: { gte: since24h }, email: { not: null } },
      select: { id: true, name: true, email: true, marketingOptOut: true },
      take: 100,
    });
    for (const u of newUsers) {
      const res = await dispatchFlowEmail({
        user: u,
        flow: 'welcome',
        cycleKey: 'signup',
        subject: 'Welcome to UPSC Atlas — Your Prelims & Mains Workspace',
        bodyText: 'Start with a quick PYQ diagnostic or explore the interactive Environment & Geography Atlases.',
      });
      if (res === 'sent') summary.welcome++;
    }

    // 2. Abandoned cart 1h & 24h
    const ago1h = new Date(now.getTime() - 60 * 60 * 1000);
    const ago2h = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const cart1hOrders = await prisma.order.findMany({
      where: { status: { in: ['created', 'attempted'] }, createdAt: { gte: ago2h, lt: ago1h } },
      take: 100,
    });
    for (const ord of cart1hOrders) {
      if (!ord.userId) continue;
      const u = await prisma.user.findUnique({
        where: { id: ord.userId },
        select: { id: true, name: true, email: true, marketingOptOut: true },
      });
      if (!u) continue;
      const res = await dispatchFlowEmail({
        user: u,
        flow: 'abandoned_cart_1h',
        cycleKey: ord.id,
        subject: 'Complete your UPSC Atlas PRO upgrade',
        bodyText: 'Your checkout was interrupted. Resume anytime to unlock unlimited PYQs, MapBot, and analytics.',
      });
      if (res === 'sent') summary.abandoned_cart_1h++;
    }

    const ago24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const ago25h = new Date(now.getTime() - 25 * 60 * 60 * 1000);
    const cart24hOrders = await prisma.order.findMany({
      where: { status: { in: ['created', 'attempted', 'abandoned'] }, createdAt: { gte: ago25h, lt: ago24h } },
      take: 100,
    });
    for (const ord of cart24hOrders) {
      if (!ord.userId) continue;
      const u = await prisma.user.findUnique({
        where: { id: ord.userId },
        select: { id: true, name: true, email: true, marketingOptOut: true },
      });
      if (!u) continue;
      const res = await dispatchFlowEmail({
        user: u,
        flow: 'abandoned_cart_24h',
        cycleKey: ord.id,
        subject: 'Still deciding on UPSC Atlas PRO?',
        bodyText: 'Pick up where you left off and unlock full access to Mains Answer Evaluation and Atlas Revision.',
      });
      if (res === 'sent') summary.abandoned_cart_24h++;
    }

    // 3. PRO expiry 7d and 1d
    const in7dStart = new Date(now.getTime() + 6.5 * 24 * 60 * 60 * 1000);
    const in7dEnd = new Date(now.getTime() + 7.5 * 24 * 60 * 60 * 1000);
    const pro7d = await prisma.user.findMany({
      where: { tier: 'PRO', validUntil: { gte: in7dStart, lt: in7dEnd }, email: { not: null } },
      select: { id: true, name: true, email: true, marketingOptOut: true },
      take: 100,
    });
    for (const u of pro7d) {
      const res = await dispatchFlowEmail({
        user: u,
        flow: 'pro_expiry_7d',
        cycleKey: todayIst,
        subject: 'Your UPSC Atlas PRO pass expires in 7 days',
        bodyText: 'Renew before expiry to keep your revision streak, saved notes, and neural analytics uninterrupted.',
      });
      if (res === 'sent') summary.pro_expiry_7d++;
    }

    const in1dStart = new Date(now.getTime() + 0.5 * 24 * 60 * 60 * 1000);
    const in1dEnd = new Date(now.getTime() + 1.5 * 24 * 60 * 60 * 1000);
    const pro1d = await prisma.user.findMany({
      where: { tier: 'PRO', validUntil: { gte: in1dStart, lt: in1dEnd }, email: { not: null } },
      select: { id: true, name: true, email: true, marketingOptOut: true },
      take: 100,
    });
    for (const u of pro1d) {
      const res = await dispatchFlowEmail({
        user: u,
        flow: 'pro_expiry_1d',
        cycleKey: todayIst,
        subject: 'Final reminder: UPSC Atlas PRO expires tomorrow',
        bodyText: 'Renew today so you do not lose access to your PRO practice tools tomorrow.',
      });
      if (res === 'sent') summary.pro_expiry_1d++;
    }

    // 4. Win-back 14d (users with no Attempt in 14 days, created > 14 days ago)
    const ago14d = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const inactiveUsers = await prisma.user.findMany({
      where: {
        createdAt: { lt: ago14d },
        email: { not: null },
        attempts: { none: { startedAt: { gte: ago14d } } },
      },
      select: { id: true, name: true, email: true, marketingOptOut: true },
      take: 50,
    });
    const monthKey = todayIst.slice(0, 7);
    for (const u of inactiveUsers) {
      const res = await dispatchFlowEmail({
        user: u,
        flow: 'win_back_14d',
        cycleKey: monthKey,
        subject: 'New UPSC PYQ sets & Current Affairs ready for you',
        bodyText: 'Jump back in for a 10-minute daily revision sprint to keep your Prelims accuracy sharp.',
      });
      if (res === 'sent') summary.win_back_14d++;
    }

    return NextResponse.json({ success: true, todayIst, summary });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Lifecycle cron failed' }, { status: 500 });
  }
}
