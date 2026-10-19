import { NextResponse } from 'next/server';
import {
  getMonetisationConfig,
  resolveActivePlanPrice,
  evaluateCoupon,
} from '@/lib/monetisation';

export async function POST(request) {
  try {
    const { planCode = 'PRELIMS_PASS_2027', couponCode = '' } = await request.json();
    const config = await getMonetisationConfig();

    const plan =
      (config.plans || []).find((p) => p.code === planCode && p.active) ||
      (config.plans || []).find((p) => p.active);

    if (!plan) {
      return NextResponse.json({ valid: false, error: 'Selected plan is unavailable.' }, { status: 404 });
    }

    const { priceInr: scheduledPriceInr, activeWindowLabel } = resolveActivePlanPrice(plan);
    const result = evaluateCoupon(config, plan.code, scheduledPriceInr, couponCode);

    return NextResponse.json({
      valid: result.valid,
      planCode: plan.code,
      scheduledPriceInr,
      activeWindowLabel,
      discountInr: result.discountInr,
      finalPriceInr: result.finalPriceInr,
      coupon: result.coupon,
      error: result.error,
    });
  } catch (error) {
    console.error('[Coupon Validate Error]:', error);
    return NextResponse.json({ valid: false, error: 'Failed to validate coupon.' }, { status: 500 });
  }
}
