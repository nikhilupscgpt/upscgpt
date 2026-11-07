import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import BoardDisplayClient from './BoardDisplayClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Smart Board Remote Display | UPSCGPT',
  description: 'Classroom Smart Board display view for iPad remote presenting',
};

export default async function RemoteDisplayPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin-login?callbackUrl=/remote/display');
  }

  return <BoardDisplayClient user={session.user} />;
}
