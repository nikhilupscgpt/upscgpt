import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  getMonetisationConfig,
  saveMonetisationConfig,
  computeValidUntilForPlan,
  DEFAULT_MONETISATION_CONFIG,
} from '@/lib/monetisation';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return null;
  }
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const config = await getMonetisationConfig({ bypassCache: true });
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activePassHolders,
      expiredPassUsers,
      allPayments,
      recentPayments,
      upgradeLogs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          tier: 'PRO',
          role: { not: 'ADMIN' },
          OR: [{ validUntil: null }, { validUntil: { gt: now } }],
        },
      }),
      prisma.user.count({
        where: {
          role: { not: 'ADMIN' },
          validUntil: { lt: now },
        },
      }),
      prisma.paymentLog.findMany({
        where: { status: 'COMPLETED' },
        select: { amount: true, createdAt: true },
      }),
      prisma.paymentLog.findMany({
        take: 25,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, tier: true, validUntil: true },
          },
        },
      }),
      prisma.actionLog.findMany({
        where: { action: { in: ['USER_UPGRADED', 'USER_UPGRADED_WEBHOOK', 'ADMIN_PASS_GRANTED'] } },
        take: 30,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalRevenuePaise = allPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const last30dRevenuePaise = allPayments
      .filter((p) => new Date(p.createdAt) >= thirtyDaysAgo)
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    return NextResponse.json({
      config,
      stats: {
        totalUsers,
        activePassHolders,
        expiredPassUsers,
        conversionRate:
          totalUsers > 0 ? Number(((activePassHolders / totalUsers) * 100).toFixed(2)) : 0,
        totalOrders: allPayments.length,
        totalRevenueInr: Math.round(totalRevenuePaise / 100),
        last30dRevenueInr: Math.round(last30dRevenuePaise / 100),
      },
      recentPayments,
      upgradeLogs,
    });
  } catch (error) {
    console.error('[Admin Monetisation GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to load monetisation admin data' }, { status: 500 });
  }
}

export async function PUT(request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (body?.resetToDefaults) {
      const saved = await saveMonetisationConfig(DEFAULT_MONETISATION_CONFIG);
      return NextResponse.json({ success: true, config: saved });
    }

    const current = await getMonetisationConfig({ bypassCache: true });
    const nextConfig = {
      ...current,
      freeLimits: body.freeLimits ? { ...current.freeLimits, ...body.freeLimits } : current.freeLimits,
      plans: Array.isArray(body.plans) ? body.plans : current.plans,
      coupons: Array.isArray(body.coupons) ? body.coupons : current.coupons,
    };

    const saved = await saveMonetisationConfig(nextConfig);

    await prisma.actionLog.create({
      data: {
        userId: session.user.id,
        action: 'MONETISATION_CONFIG_UPDATED',
        status: 'SUCCESS',
        message: `Admin updated monetisation config (${saved.plans.length} plans, ${saved.coupons.length} coupons)`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Monetisation settings saved and live immediately.',
      config: saved,
    });
  } catch (error) {
    console.error('[Admin Monetisation PUT Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to save monetisation config' }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action, email, planCode = 'PRELIMS_PASS_2027', customValidUntil = null } = await request.json();

    if (!email || !String(email).trim()) {
      return NextResponse.json({ error: 'User email is required.' }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const targetUser = await prisma.user.findFirst({
      where: {
        email: { equals: cleanEmail, mode: 'insensitive' },
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: `No user found with email "${email}".` }, { status: 404 });
    }

    if (action === 'REVOKE_PASS') {
      const updated = await prisma.user.update({
        where: { id: targetUser.id },
        data: { tier: 'FREE', validUntil: null },
      });

      await prisma.actionLog.create({
        data: {
          userId: targetUser.id,
          action: 'ADMIN_PASS_REVOKED',
          status: 'SUCCESS',
          message: `Pass revoked by admin (${session.user.email || session.user.name})`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Revoked PRO pass for ${targetUser.email}.`,
        user: updated,
      });
    }

    // GRANT_PASS
    const config = await getMonetisationConfig();
    const plan =
      config.plans.find((p) => p.code === planCode) ||
      config.plans[0];

    const validUntil = customValidUntil
      ? new Date(customValidUntil)
      : computeValidUntilForPlan(plan, targetUser.validUntil);

    const updated = await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        tier: 'PRO',
        validUntil,
      },
    });

    await prisma.actionLog.create({
      data: {
        userId: targetUser.id,
        action: 'ADMIN_PASS_GRANTED',
        entityType: 'PLAN',
        entityId: plan?.code || 'PRELIMS_PASS_2027',
        status: 'SUCCESS',
        message: JSON.stringify({
          email: targetUser.email,
          planCode: plan?.code || 'PRELIMS_PASS_2027',
          validUntil: validUntil.toISOString(),
          grantedBy: session.user.email || session.user.name,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Granted ${plan?.name || 'PRO Pass'} to ${targetUser.email} until ${validUntil.toLocaleDateString('en-IN')}.`,
      user: updated,
    });
  } catch (error) {
    console.error('[Admin Monetisation POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Action failed' }, { status: 500 });
  }
}
