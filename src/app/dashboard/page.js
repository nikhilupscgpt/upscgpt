export const dynamic = 'force-dynamic';

import DashboardIntelligenceClient from '@/components/dashboard/DashboardIntelligenceClient';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Intelligence Dashboard | UPSCGPT',
  description: 'Manage your UPSC syllabus progress and neural study metrics.',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login?callbackUrl=/dashboard');
  }

  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <DashboardIntelligenceClient />
    </div>
  );
}
