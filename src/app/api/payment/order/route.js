import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import razorpay from '@/lib/razorpay';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Amount in paise (999.00 INR = 99900 paise)
    const amount = 99900;
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `receipt_${session.user.id}_${Date.now()}`,
    };

    console.log(`[Payment API] Creating order for user ${session.user.id}...`);
    const order = await razorpay.orders.create(options);
    console.log(`[Payment API] Order created: ${order.id}`);

    return NextResponse.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
    });
  } catch (error) {
    console.error('[Payment Order Error]:', error);
    return NextResponse.json({ error: error.message || 'Error creating order' }, { status: 500 });
  }
}
