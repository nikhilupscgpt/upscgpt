import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  getMonetisationConfig,
  computeValidUntilForPlan,
  incrementCouponUsage,
} from '@/lib/monetisation';
import { sendEmail } from '@/lib/comms';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json({ error: 'Missing payment verification parameters.' }, { status: 400 });
    }

    // Strict security check: Simulator bypass is NEVER allowed in production or for non-admin users
    const isAdminDevSimulator =
      process.env.NODE_ENV === 'development' &&
      process.env.ALLOW_PAYMENT_SIMULATOR === 'true' &&
      session.user.role === 'ADMIN' &&
      razorpay_order_id.startsWith('mock_order_');

    let isSignatureValid = false;
    if (isAdminDevSimulator) {
      isSignatureValid = true;
    } else {
      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (!secret || !razorpay_signature) {
        return NextResponse.json({ error: 'Payment verification is not configured.' }, { status: 500 });
      }
      const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSign = crypto.createHmac('sha256', secret).update(payload).digest('hex');

      const sigBuf = Buffer.from(String(razorpay_signature), 'utf8');
      const expBuf = Buffer.from(String(expectedSign), 'utf8');
      isSignatureValid = sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);
    }

    if (!isSignatureValid) {
      console.warn(`[Payment Verify] Invalid signature for user ${session.user.id}`);
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // 1. Idempotency check
    const existingPayment = await prisma.paymentLog.findUnique({
      where: { razorpayId: razorpay_payment_id },
    });

    if (existingPayment) {
      const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
      return NextResponse.json({
        success: true,
        message: 'Payment already verified.',
        validUntil: currentUser?.validUntil ? currentUser.validUntil.toISOString() : null,
        user: currentUser,
      });
    }

    // 2. Lookup server-side order quote created during /api/payment/order
    const orderLog = await prisma.actionLog.findFirst({
      where: {
        action: 'PAYMENT_ORDER_CREATED',
        entityId: razorpay_order_id,
      },
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

    if (orderMeta?.userId && orderMeta.userId !== session.user.id) {
      return NextResponse.json({ error: 'Order does not belong to current user.' }, { status: 403 });
    }

    const config = await getMonetisationConfig();
    const planCode = orderMeta?.planCode || 'PRELIMS_PASS_2027';
    const plan =
      config.plans.find((p) => p.code === planCode) ||
      config.plans[0] || {
        code: 'PRELIMS_PASS_2027',
        name: 'Prelims Pass 2027',
        validityMode: 'FIXED_DATE',
        validUntilDate: '2027-06-30T23:59:59.000Z',
        durationDays: 240,
      };

    const amountPaise = Number(orderMeta?.amountPaise) || 99900;
    const couponCode = orderMeta?.couponCode || null;

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { validUntil: true },
    });

    const newValidUntil = computeValidUntilForPlan(plan, currentUser?.validUntil);

    // 3. Atomic upgrade + payment log + audit trail
    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          tier: 'PRO',
          validUntil: newValidUntil,
        },
      }),
      prisma.paymentLog.create({
        data: {
          userId: session.user.id,
          razorpayId: razorpay_payment_id,
          amount: amountPaise,
          currency: 'INR',
          status: 'COMPLETED',
        },
      }),
      prisma.actionLog.create({
        data: {
          userId: session.user.id,
          action: 'USER_UPGRADED',
          entityType: 'PLAN',
          entityId: plan.code,
          status: 'SUCCESS',
          message: JSON.stringify({
            planCode: plan.code,
            planName: plan.name,
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
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

    // Dispatch payment confirmation email
    if (updatedUser?.email) {
      const formattedDate = newValidUntil.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      sendEmail({
        to: updatedUser.email,
        subject: `🎉 Payment Confirmed: Your ${plan.name} is Active!`,
        text: `Hi ${updatedUser.name || 'Aspirant'},\n\nYour payment for ${plan.name} has been verified successfully.\nYour PRO access is now active until ${formattedDate}.\n\nThank you for choosing UPSCGPT!\nhttps://upscgpt.in`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #0b1120; color: #f1f5f9; padding: 32px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
            <h2 style="color: #38bdf8; margin: 0 0 12px;">🎉 Subscription Activated!</h2>
            <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6;">Hi ${updatedUser.name || 'Aspirant'},</p>
            <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6;">Your payment for <strong>${plan.name}</strong> was confirmed. Your account now has full PRO privileges.</p>
            <div style="background: rgba(56, 189, 248, 0.1); border-left: 3px solid #38bdf8; padding: 12px 16px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #e2e8f0;">📅 Access Valid Until: <strong>${formattedDate}</strong></p>
            </div>
            <p style="font-size: 14px; color: #94a3b8;">Happy Learning,<br>Team UPSCGPT</p>
          </div>
        `,
      }).catch((err) => console.error('[Payment] Confirmation email dispatch error:', err));
    }

    return NextResponse.json({
      success: true,
      message: `${plan.name} activated! Valid until ${newValidUntil.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}.`,
      planCode: plan.code,
      validUntil: newValidUntil.toISOString(),
      user: updatedUser,
    });
  } catch (error) {
    console.error('[Payment Verify Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Error verifying payment' },
      { status: 500 }
    );
  }
}
