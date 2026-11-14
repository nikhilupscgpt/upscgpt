import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { findPaymentReconciliationMismatches } from '@/lib/security/guards';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization') || '';
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const mismatches = await findPaymentReconciliationMismatches({ db: prisma });
    const totalMismatches =
      mismatches.paidNotPro.length +
      mismatches.proWithoutPayment.length +
      mismatches.refundedStillPro.length;

    if (totalMismatches > 0) {
      await prisma.securityEvent
        .create({
          data: {
            type: 'reconciliation_mismatch',
            detail: mismatches,
          },
        })
        .catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      totalMismatches,
      mismatches,
    });
  } catch (err) {
    console.error('[Cron Reconcile Payments] Error:', err);
    return NextResponse.json({ error: 'Reconciliation failed' }, { status: 500 });
  }
}
