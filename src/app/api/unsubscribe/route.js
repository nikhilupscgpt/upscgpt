import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyUnsubscribeToken } from '@/lib/analytics/marketing';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token') || '';
  const userId = verifyUnsubscribeToken(token);

  if (!userId) {
    return new NextResponse(
      '<html><body style="font-family:sans-serif;padding:40px;max-width:520px;margin:auto;"><h2>Invalid or expired unsubscribe link</h2><p>Please update your preferences from your account settings.</p></body></html>',
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  await prisma.user
    .update({
      where: { id: userId },
      data: { marketingOptOut: true, marketingOptOutAt: new Date() },
    })
    .catch(() => null);

  return new NextResponse(
    '<html><body style="font-family:sans-serif;padding:40px;max-width:520px;margin:auto;"><h2>Unsubscribed</h2><p>You have been unsubscribed from UPSC Atlas marketing &amp; lifecycle emails. Transactional receipts and OTPs are unaffected.</p></body></html>',
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}
