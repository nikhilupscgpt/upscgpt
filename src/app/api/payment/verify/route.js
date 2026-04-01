import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || '')
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      console.log(`[Payment Verify] Signature valid for user ${session.user.id}. Upgrading...`);

      // Update User to PRO
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: { tier: 'PRO' },
      });

      // Log Payment
      await prisma.paymentLog.create({
        data: {
          userId: session.user.id,
          razorpayId: razorpay_payment_id,
          amount: 99900,
          status: 'COMPLETED',
        },
      });

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
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
