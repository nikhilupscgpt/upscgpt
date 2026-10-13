export const dynamic = 'force-dynamic';

import DashboardPrelimsClient from '@/components/dashboard/DashboardPrelimsClient';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Prelims Dashboard | PrelimsGPT',
  description: 'Your Prelims Mission Control: track PYQ attempts, accuracy, mistake notebook, and subject mastery.',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/dashboard');
  }

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: 'transparent' }}>
      <DashboardPrelimsClient />
    </div>
  );
}
