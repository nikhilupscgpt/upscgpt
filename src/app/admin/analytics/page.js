import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AnalyticsDashboardClient from './AnalyticsDashboardClient';

export const metadata = {
  title: 'Analytics & Telemetry | Admin',
};

export default async function AdminAnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role === 'FACULTY') {
    redirect('/admin/studio');
  }

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/admin-login');
  }

  return <AnalyticsDashboardClient adminEmail={session.user?.email || 'Admin'} />;
}
