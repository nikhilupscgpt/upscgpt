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
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

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
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event?.event;

    if (eventType !== 'payment.captured' && eventType !== 'order.paid') {
      return NextResponse.json({ received: true, ignored: eventType });
    }

    const paymentEntity = event?.payload?.payment?.entity;
    const paymentId = paymentEntity?.id;
    const orderId = paymentEntity?.order_id || event?.payload?.order?.entity?.id;
    const amountPaise = Number(paymentEntity?.amount) || 99900;
    const notes = paymentEntity?.notes || {};

    if (!paymentId) {
      return NextResponse.json({ error: 'Missing payment ID in webhook payload' }, { status: 400 });
    }

    // 1. Idempotency check
    const existing = await prisma.paymentLog.findUnique({
      where: { razorpayId: paymentId },
    });

    if (existing) {
      return NextResponse.json({ received: true, alreadyProcessed: true });
    }

    // 2. Resolve order metadata from ActionLog or payment notes
    let orderMeta = null;
    if (orderId) {
      const orderLog = await prisma.actionLog.findFirst({
        where: { action: 'PAYMENT_ORDER_CREATED', entityId: orderId },
        orderBy: { createdAt: 'desc' },
      });
      if (orderLog?.message) {
        try {
          orderMeta = JSON.parse(orderLog.message);
        } catch {
          orderMeta = null;
        }
      }
    }

    const userId = orderMeta?.userId || notes?.userId;
    if (!userId) {
      console.error('[Razorpay Webhook] Cannot determine userId for payment:', paymentId);
      return NextResponse.json({ error: 'User ID not found for payment' }, { status: 400 });
    }

    const planCode = orderMeta?.planCode || notes?.planCode || 'PRELIMS_PASS_2027';
    const couponCode = orderMeta?.couponCode || notes?.couponCode || null;

    const config = await getMonetisationConfig();
    const plan =
      config.plans.find((p) => p.code === planCode) ||
      config.plans[0] || {
        code: 'PRELIMS_PASS_2027',
        name: 'Prelims Pass 2027',
        validityMode: 'FIXED_DATE',
        validUntilDate: '2027-06-30T23:59:59.000Z',
        durationDays: 240,
      };

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { validUntil: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User does not exist' }, { status: 404 });
    }

    const newValidUntil = computeValidUntilForPlan(plan, currentUser.validUntil);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          tier: 'PRO',
          validUntil: newValidUntil,
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
      upgradedUserId: userId,
      planCode: plan.code,
      validUntil: newValidUntil.toISOString(),
    });
  } catch (error) {
    console.error('[Razorpay Webhook Error]:', error);
    return NextResponse.json({ error: error.message || 'Webhook processing error' }, { status: 500 });
  }
}
