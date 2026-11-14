import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { writeAuditLog } from '@/lib/security/guards';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const partners = await prisma.partnerCode.findMany({ orderBy: { createdAt: 'desc' } });

    const enriched = await Promise.all(
      partners.map(async (p) => {
        const [signups, proUsers, revenueAgg] = await Promise.all([
          prisma.user.count({ where: { firstTouchPartner: p.code } }),
          prisma.user.count({ where: { firstTouchPartner: p.code, tier: 'PRO' } }),
          prisma.$queryRaw`
            SELECT COALESCE(SUM(o."amountPaise"), 0)::bigint AS total_paise
            FROM "Order" o
            JOIN "User" u ON u.id = o."userId"
            WHERE u."firstTouchPartner" = ${p.code}
              AND o.status = 'paid'
          `.catch(() => [{ total_paise: 0 }]),
        ]);

        return {
          ...p,
          signups,
          proUsers,
          revenuePaise: Number(revenueAgg?.[0]?.total_paise || 0),
        };
      })
    );

    return NextResponse.json({ partners: enriched });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to load partners' }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const code = String(body?.code || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    const partnerName = String(body?.partnerName || '').trim();
    const commissionPct = Number(body?.commissionPct || 0);
    const discountPct = Number(body?.discountPct || 0);
    const notes = body?.notes ? String(body.notes).slice(0, 300) : null;

    if (!code || !partnerName) {
      return NextResponse.json({ error: 'code and partnerName are required' }, { status: 400 });
    }

    const partner = await prisma.partnerCode.upsert({
      where: { code },
      update: { partnerName, commissionPct, discountPct, notes, isActive: body?.isActive ?? true },
      create: { code, partnerName, commissionPct, discountPct, notes, isActive: true },
    });

    await writeAuditLog({
      actorId: session.user.id,
      action: 'PARTNER_CODE_SAVED',
      entity: 'PartnerCode',
      entityId: partner.id,
      after: partner,
    });

    return NextResponse.json({ partner });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to save partner' }, { status: 500 });
  }
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, isActive } = await req.json();
    if (!id || typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'id and boolean isActive required' }, { status: 400 });
    }
    const partner = await prisma.partnerCode.update({
      where: { id },
      data: { isActive },
    });
    return NextResponse.json({ partner });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to update partner' }, { status: 500 });
  }
}
