import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { parseFixedCostCsv, parseMarketingSpendCsv } from '@/lib/analytics/marketing';
import { writeAuditLog } from '@/lib/security/guards';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, csv } = body || {};

    if (!csv || typeof csv !== 'string') {
      return NextResponse.json({ error: 'CSV content is required' }, { status: 400 });
    }

    if (type === 'marketing_spend') {
      const rows = parseMarketingSpendCsv(csv);
      if (rows.length === 0) {
        return NextResponse.json({ error: 'No data rows found in CSV' }, { status: 400 });
      }
      const created = await prisma.marketingSpend.createMany({ data: rows });
      await writeAuditLog({
        actorId: session.user.id,
        action: 'MARKETING_SPEND_CSV_IMPORT',
        entity: 'MarketingSpend',
        entityId: 'bulk',
        after: { count: created.count },
      });
      return NextResponse.json({ success: true, imported: created.count });
    }

    if (type === 'fixed_cost') {
      const rows = parseFixedCostCsv(csv);
      if (rows.length === 0) {
        return NextResponse.json({ error: 'No data rows found in CSV' }, { status: 400 });
      }
      const created = await prisma.fixedCost.createMany({ data: rows });
      await writeAuditLog({
        actorId: session.user.id,
        action: 'FIXED_COST_CSV_IMPORT',
        entity: 'FixedCost',
        entityId: 'bulk',
        after: { count: created.count },
      });
      return NextResponse.json({ success: true, imported: created.count });
    }

    return NextResponse.json({ error: 'Invalid type (expected marketing_spend or fixed_cost)' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'CSV import failed' }, { status: 400 });
  }
}
