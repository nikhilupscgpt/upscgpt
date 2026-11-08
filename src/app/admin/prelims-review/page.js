import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import ReviewUI from './ReviewUI';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Prelims Ingestion Review | UPSCGPT Admin',
  description: 'Review and verify pending AI-parsed question drafts before publishing to live question bank.',
};

export async function getPendingDrafts() {
  return await prisma.questionDraft.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
  });
}

export default async function PrelimsReviewPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/admin-login?callbackUrl=/admin/prelims-review');
  }

  const drafts = await getPendingDrafts();

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#f8fafc', padding: '32px 40px', fontFamily: 'var(--font-outfit), system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '20px' }}>
          <div>
            <Link
              href="/admin"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#94a3b8',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '10px',
              }}
            >
              <ArrowLeft size={16} /> Return to Admin Control Center
            </Link>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#f8fafc', margin: 0 }}>
              Prelims Ingestion Review
            </h1>
            <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '13.5px' }}>
              {drafts.length} questions waiting for human verification &amp; publication approval.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(59, 130, 246, 0.1)', padding: '8px 16px', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.25)', color: '#60a5fa', fontSize: '13px', fontWeight: 700 }}>
            <CheckCircle2 size={16} /> Pending Queue: {drafts.length}
          </div>
        </div>

        <ReviewUI initialDrafts={drafts} />
      </div>
    </div>
  );
}
