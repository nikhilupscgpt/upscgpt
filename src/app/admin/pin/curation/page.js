import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PinCurationClient from './PinCurationClient';

export const metadata = {
  title: 'Atlas Curation Hub | UPSC Admin Control Center',
  description: 'Smart clustering, candidate merges, and weekly clearing for UPSC Places in News.',
};

export default async function AdminPinCurationPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/login');
  }

  return <PinCurationClient session={session} />;
}
