import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PresenterViewClient from './PresenterViewClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Presenter View | UPSCgpt Studio',
};

export default async function PresenterViewPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'FACULTY')) {
    redirect('/admin-login');
  }

  const sp = await searchParams;
  const code = sp?.code ? String(sp.code).trim() : '';

  return <PresenterViewClient initialCode={code} />;
}
