import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const STATUS_MAP = {
  'email.delivered': 'delivered',
  'email.bounced': 'bounced',
  'email.failed': 'failed',
  'email.complained': 'complained',
  'email.clicked': 'clicked',
  'email.unsubscribed': 'unsubscribed',
  delivered: 'delivered',
  bounced: 'bounced',
  failed: 'failed',
  complained: 'complained',
  clicked: 'clicked',
  unsubscribed: 'unsubscribed',
};

/**
 * Provider delivery webhook (Resend / MSG91) to update MessageLog status.
 */
export async function POST(req) {
  try {
    const secret = process.env.COMMS_WEBHOOK_SECRET;
    if (secret) {
      const provided = req.headers.get('x-webhook-secret') || '';
      if (provided !== secret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await req.json().catch(() => ({}));
    const rawType = String(body?.type || body?.event || body?.status || '').toLowerCase();
    const mappedStatus = STATUS_MAP[rawType];
    const providerMsgId =
      body?.data?.email_id ||
      body?.providerMsgId ||
      body?.request_id ||
      body?.messageId ||
      null;

    if (!mappedStatus || !providerMsgId) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    await prisma.messageLog.updateMany({
      where: { providerMsgId: String(providerMsgId) },
      data: { status: mappedStatus },
    });

    return NextResponse.json({ ok: true, status: mappedStatus });
  } catch (err) {
    console.error('[POST /api/webhooks/comms] Error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
