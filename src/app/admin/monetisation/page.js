import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MonetisationAdminClient from './MonetisationAdminClient';

export const metadata = {
  title: 'Monetisation & Pricing Control | UPSCGPT Admin',
};

export default async function MonetisationAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/login');
  }

  return <MonetisationAdminClient />;
}
