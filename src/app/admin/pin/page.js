import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PinAdminClient from './PinAdminClient';

export const metadata = {
  title: 'PIN & Mapping Ingestion Console | Admin Control Center',
  description:
    'Idempotent JSONL UPSERT pipeline for Places in News (PIN) and UPSC CSE + CDS Mapping PYQs.',
};

export default async function AdminPinPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/login');
  }

  return <PinAdminClient session={session} />;
}
