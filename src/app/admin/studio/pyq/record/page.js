import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import RecordCheckClient from './RecordCheckClient';
import '../pyq-studio.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Record Section Check | PYQ Studio',
};

export default async function RecordSectionPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'FACULTY')) {
    redirect('/admin-login');
  }

  const sp = (await searchParams) || {};
  return (
    <RecordCheckClient
      userRole={session.user.role}
      initialSessionId={typeof sp.sessionId === 'string' ? sp.sessionId : ''}
      initialSubject={typeof sp.subject === 'string' ? sp.subject : ''}
      initialTopic={typeof sp.topic === 'string' ? sp.topic : ''}
      initialIncludeCds={sp.includeCds === '1' || sp.includeCds === 'true'}
      initialPart={Number(sp.part) || 1}
    />
  );
}
