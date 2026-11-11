import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import EnvironmentAdminClient from './EnvironmentAdminClient';

export const metadata = {
  title: 'Environment Atlas Ingestion Console | Admin Control Center',
  description:
    'Unified idempotent JSONL ingestion console for Species, Protected Areas, Conventions, Acts, and Schemes.',
};

export default async function AdminEnvironmentPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/admin-login?callbackUrl=/admin/environment');
  }

  return <EnvironmentAdminClient session={session} />;
}
