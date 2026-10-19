import { NextResponse } from 'next/server';
import { getMonetisationConfig, resolveActivePlanPrice } from '@/lib/monetisation';
import { getTierStatus } from '@/lib/tier-gate';

export async function GET() {
  try {
    const [config, tierStatus] = await Promise.all([
      getMonetisationConfig(),
      getTierStatus(),
    ]);

    const now = new Date();
    const activePlans = (config.plans || [])
      .filter((p) => p.active)
      .map((plan) => {
        const { priceInr, activeWindowLabel, activeWindowId } = resolveActivePlanPrice(plan, now);
        return {
          code: plan.code,
          name: plan.name,
          badge: plan.badge,
          tagline: plan.tagline,
          currentPriceInr: priceInr,
          basePriceInr: plan.basePriceInr,
          mrpInr: plan.mrpInr,
          activeWindowLabel,
          activeWindowId,
          validityMode: plan.validityMode,
          validUntilDate: plan.validUntilDate,
          durationDays: plan.durationDays,
          highlight: Boolean(plan.highlight),
          features: Array.isArray(plan.features) ? plan.features : [],
          priceSchedule: Array.isArray(plan.priceSchedule) ? plan.priceSchedule : [],
        };
      });

    return NextResponse.json({
      plans: activePlans,
      freeLimits: config.freeLimits,
      userStatus: {
        authenticated: Boolean(tierStatus.user?.id),
        isPro: tierStatus.isPro,
        tier: tierStatus.tier,
        validUntil: tierStatus.validUntil,
      },
    });
  } catch (error) {
    console.error('[Monetisation Plans GET Error]:', error);
    return NextResponse.json({ error: 'Failed to load plans' }, { status: 500 });
  }
}
