import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();
    
    // Developer Simulator Bypass
    const isMock = razorpay_order_id?.startsWith('mock_order_');

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || '')
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign || isMock) {
      console.log(`[Payment Verify] Signature valid for user ${session.user.id}. Upgrading...`);

      // 1. Idempotency Check: Have we already processed this payment?
      const existingPayment = await prisma.paymentLog.findFirst({
        where: { razorpayId: razorpay_payment_id }
      });

      if (existingPayment) {
        console.warn(`[Payment Verify] Duplicate payment ID detected: ${razorpay_payment_id}`);
        return NextResponse.json({ 
          success: true, 
          message: "Payment already processed",
          user: session.user 
        });
      }

      // 2. Atomic Update: Upgrade user and log payment
      const [updatedUser] = await prisma.$transaction([
        prisma.user.update({
          where: { id: session.user.id },
          data: { tier: 'PRO' },
        }),
        prisma.paymentLog.create({
          data: {
            userId: session.user.id,
            razorpayId: razorpay_payment_id,
            amount: 99900,
            status: 'COMPLETED',
          },
        }),
        prisma.actionLog.create({
          data: {
            userId: session.user.id,
            action: 'USER_UPGRADED',
            status: 'SUCCESS',
            message: 'Elevated to PRO Tier Intelligence'
          }
        })
      ]);

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully. Welcome to PRO!",
        user: updatedUser,
      });
    } else {
      console.warn(`[Payment Verify] Signature MISMATCH for user ${session.user.id}`);
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }
  } catch (error) {
    console.error('[Payment Verify Error]:', error);
    return NextResponse.json({ error: error.message || 'Error verifying payment' }, { status: 500 });
  }
}
