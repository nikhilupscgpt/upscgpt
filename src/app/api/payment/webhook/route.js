import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import {
  getMonetisationConfig,
  computeValidUntilForPlan,
  incrementCouponUsage,
} from '@/lib/monetisation';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    let webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret && process.env.RAZORPAY_KEY_SECRET) {
      // Kept for compatibility with existing deployments; set RAZORPAY_WEBHOOK_SECRET.
      console.warn(
        '[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET is not set; falling back to RAZORPAY_KEY_SECRET. Configure a dedicated webhook secret.'
      );
      webhookSecret = process.env.RAZORPAY_KEY_SECRET;
    }

    if (!webhookSecret || !signature) {
      return NextResponse.json({ error: 'Webhook signature or secret missing' }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const sigBuf = Buffer.from(String(signature), 'utf8');
    const expBuf = Buffer.from(String(expectedSignature), 'utf8');
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      console.warn('[Razorpay Webhook] Invalid signature rejected');
      await prisma.securityEvent.create({
        data: {
          type: 'bad_signature',
          ipFull: request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || null,
          detail: { source: 'razorpay_webhook', sigLen: sigBuf.length },
        },
      }).catch(() => {});
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event?.event;
    const razorpayEventId =
      request.headers.get('x-razorpay-event-id') ||
      event?.id ||
      `${eventType}:${event?.payload?.payment?.entity?.id || event?.payload?.refund?.entity?.id || Date.now()}`;

    // Idempotency on PaymentEvent.razorpayEventId
    const seenEvent = await prisma.paymentEvent.findUnique({
      where: { razorpayEventId: String(razorpayEventId) },
      select: { id: true },
    }).catch(() => null);
    if (seenEvent) {
      return NextResponse.json({ received: true, alreadyProcessed: true });
    }

    if (eventType === 'payment.failed') {
      const failedPay = event?.payload?.payment?.entity;
      const failedOrderId = failedPay?.order_id || null;
      if (failedOrderId) {
        await prisma.order.updateMany({
          where: { razorpayOrderId: failedOrderId, status: 'created' },
          data: { status: 'failed' },
        }).catch(() => {});
      }
      await prisma.paymentEvent.create({
        data: {
          razorpayEventId: String(razorpayEventId),
          type: 'payment.failed',
          orderId: failedOrderId,
          amountPaise: Number(failedPay?.amount) || null,
          signatureValid: true,
          payload: event,
        },
      }).catch(() => {});
      return NextResponse.json({ received: true, recorded: 'payment.failed' });
    }

    if (eventType === 'refund.processed') {
      const refundEntity = event?.payload?.refund?.entity;
      const refundOrderId = refundEntity?.payment_id || null;
      const payEntity = event?.payload?.payment?.entity;
      const ordId = payEntity?.order_id || null;
      if (ordId) {
        await prisma.order.updateMany({
          where: { razorpayOrderId: ordId },
          data: { status: 'refunded' },
        }).catch(() => {});
      }
      await prisma.paymentEvent.create({
        data: {
          razorpayEventId: String(razorpayEventId),
          type: 'refund.processed',
          orderId: ordId || refundOrderId,
          amountPaise: Number(refundEntity?.amount) || null,
          signatureValid: true,
          payload: event,
        },
      }).catch(() => {});
      return NextResponse.json({ received: true, recorded: 'refund.processed' });
    }

    if (eventType !== 'payment.captured' && eventType !== 'order.paid') {
      return NextResponse.json({ received: true, ignored: eventType });
    }

    const paymentEntity = event?.payload?.payment?.entity;
    const paymentId = paymentEntity?.id;
    const orderId = paymentEntity?.order_id || event?.payload?.order?.entity?.id;

    // Invalid-but-authentic events are acknowledged with 200 (so Razorpay stops retrying)
    // but never grant access.
    const ignore = (reason, extra = {}) => {
      console.warn(`[Razorpay Webhook] Not granting access: ${reason}`, { paymentId, orderId, ...extra });
      return NextResponse.json({ received: true, granted: false, reason });
    };

    if (!paymentId) {
      return ignore('missing payment entity');
    }

    // 1. Idempotency check
    const existing = await prisma.paymentLog.findUnique({
      where: { razorpayId: paymentId },
    });

    if (existing) {
      return NextResponse.json({ received: true, alreadyProcessed: true });
    }

    // 2. The order must have been created by our server (/api/payment/order).
    //    userId / planCode / amount come ONLY from that server-side record, never from payment notes.
    if (!orderId) {
      return ignore('missing order id');
    }
    const orderLog = await prisma.actionLog.findFirst({
      where: { action: 'PAYMENT_ORDER_CREATED', entityId: orderId },
      orderBy: { createdAt: 'desc' },
    });
    let orderMeta = null;
    if (orderLog?.message) {
      try {
        orderMeta = JSON.parse(orderLog.message);
      } catch {
        orderMeta = null;
      }
    }
    if (!orderLog || !orderMeta) {
      return ignore('no matching PAYMENT_ORDER_CREATED log');
    }
    if (orderMeta.isMock) {
      return ignore('mock order');
    }

    const userId = orderLog.userId || orderMeta.userId;
    if (!userId || (orderMeta.userId && orderLog.userId && orderMeta.userId !== orderLog.userId)) {
      return ignore('order log has no consistent userId');
    }

    const expectedAmountPaise = Number(orderMeta.amountPaise);
    const paidAmountPaise = Number(paymentEntity?.amount);
    const currency = String(paymentEntity?.currency || '').toUpperCase();
    if (
      !Number.isInteger(expectedAmountPaise) ||
      expectedAmountPaise <= 0 ||
      paidAmountPaise !== expectedAmountPaise ||
      currency !== 'INR'
    ) {
      return ignore('amount/currency mismatch', { expectedAmountPaise, paidAmountPaise, currency });
    }
    if (paymentEntity?.status && paymentEntity.status !== 'captured') {
      return ignore(`payment status ${paymentEntity.status}`);
    }

    const amountPaise = paidAmountPaise;
    const planCode = orderMeta.planCode;
    const couponCode = orderMeta.couponCode || null;

    const config = await getMonetisationConfig();
    // Plan comes from the server-recorded order; it may have been deactivated since, so don't filter on `active`.
    let plan = config.plans.find((p) => p.code === planCode);
    if (!plan) {
      // Paid amount already matched the server quote; don't strand a paying user if the plan was renamed.
      console.warn(`[Razorpay Webhook] Plan ${planCode} no longer in config; using default plan.`);
      plan = config.plans[0] || {
        code: 'PRELIMS_PASS_2027',
        name: 'Prelims Pass 2027',
        validityMode: 'FIXED_DATE',
        validUntilDate: '2027-06-30T23:59:59.000Z',
        durationDays: 240,
      };
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { validUntil: true },
    });

    if (!currentUser) {
      return ignore('user not found');
    }

    const newValidUntil = computeValidUntilForPlan(plan, currentUser.validUntil);
    const priorPaidCount = await prisma.order.count({
      where: { userId, status: 'paid' },
    }).catch(() => 0);
    const isRenewal = priorPaidCount > 0;
    const feePaise = Number(paymentEntity?.fee) || null;
    const taxOnFeePaise = Number(paymentEntity?.tax) || null;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          tier: 'PRO',
          validUntil: newValidUntil,
        },
      }),
      prisma.order.updateMany({
        where: { razorpayOrderId: orderId },
        data: { status: 'paid', paidAt: new Date() },
      }),
      prisma.paymentEvent.create({
        data: {
          razorpayEventId: String(razorpayEventId),
          type: eventType,
          orderId,
          userId,
          amountPaise,
          feePaise,
          taxOnFeePaise,
          signatureValid: true,
          isRenewal,
          payload: event,
        },
      }),
      prisma.paymentLog.create({
        data: {
          userId,
          razorpayId: paymentId,
          amount: amountPaise,
          currency: 'INR',
          status: 'COMPLETED',
        },
      }),
      prisma.actionLog.create({
        data: {
          userId,
          action: 'USER_UPGRADED_WEBHOOK',
          entityType: 'PLAN',
          entityId: plan.code,
          status: 'SUCCESS',
          message: JSON.stringify({
            planCode: plan.code,
            planName: plan.name,
            orderId,
            paymentId,
            amountPaise,
            couponCode,
            validUntil: newValidUntil.toISOString(),
          }),
        },
      }),
    ]);

    if (couponCode) {
      await incrementCouponUsage(couponCode);
    }

    return NextResponse.json({
      received: true,
      granted: true,
      planCode: plan.code,
    });
  } catch (error) {
    // P2002 = unique violation on PaymentLog.razorpayId: verify/webhook raced; already granted.
    if (error?.code === 'P2002') {
      return NextResponse.json({ received: true, alreadyProcessed: true });
    }
    console.error('[Razorpay Webhook Error]:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
