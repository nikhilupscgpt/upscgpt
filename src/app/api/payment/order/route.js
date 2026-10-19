import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getRazorpay } from '@/lib/razorpay';
import prisma from '@/lib/prisma';
import { resolveServerOrderQuote } from '@/lib/monetisation';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });
    }

    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const requestedPlanCode = body?.planCode || 'PRELIMS_PASS_2027';
    const requestedCouponCode = body?.couponCode || null;

    // 1. Resolve authoritative server-side price & coupon
    const quote = await resolveServerOrderQuote(requestedPlanCode, requestedCouponCode);
    const { plan, amountPaise, finalPriceInr, discountInr, scheduledPriceInr, appliedCoupon } = quote;

    const options = {
      amount: amountPaise,
      currency: 'INR',
      receipt: `rcpt_${session.user.id.slice(-8)}_${Date.now()}`,
      notes: {
        userId: session.user.id,
        planCode: plan.code,
        couponCode: appliedCoupon?.code || '',
      },
    };

    let order;
    let isMock = false;

    try {
      const razorpay = getRazorpay();
      order = await razorpay.orders.create(options);
    } catch (rzpError) {
      const canSimulate =
        process.env.NODE_ENV === 'development' &&
        process.env.ALLOW_PAYMENT_SIMULATOR === 'true' &&
        session.user.role === 'ADMIN';

      if (!canSimulate) {
        console.error('[Payment API] Razorpay order creation failed:', rzpError.message);
        return NextResponse.json(
          { error: 'Payment gateway is temporarily unavailable. Please try again shortly.' },
          { status: 502 }
        );
      }

      isMock = true;
      order = {
        id: `mock_order_${Date.now()}`,
        currency: 'INR',
        amount: amountPaise,
      };
    }

    // 2. Record server-side order quote in ActionLog so verify & webhook use exact server metadata
    await prisma.actionLog.create({
      data: {
        userId: session.user.id,
        action: 'PAYMENT_ORDER_CREATED',
        entityType: 'RAZORPAY_ORDER',
        entityId: order.id,
        status: 'PENDING',
        message: JSON.stringify({
          orderId: order.id,
          userId: session.user.id,
          planCode: plan.code,
          planName: plan.name,
          scheduledPriceInr,
          discountInr,
          finalPriceInr,
          amountPaise,
          couponCode: appliedCoupon?.code || null,
          isMock,
        }),
      },
    });

    return NextResponse.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      planCode: plan.code,
      planName: plan.name,
      scheduledPriceInr,
      discountInr,
      finalPriceInr,
      appliedCoupon,
      isMock,
    });
  } catch (error) {
    console.error('[Payment Order Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Error creating payment order' },
      { status: 400 }
    );
  }
}
