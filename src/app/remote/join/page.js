import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import JoinClient from './JoinClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Connect to Smart Board | UPSCGPT',
};

export default async function RemoteJoinPage({ searchParams }) {
  const sp = await searchParams;
  const code = sp?.code || '';

  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/remote/join?code=${code}`)}`);
  }

  // If code is valid, redirect directly to presenter studio with ?board=code
  if (/^\d{6}$/.test(code)) {
    redirect(`/admin/pyq/present?board=${code}`);
  }

  return <JoinClient code={code} />;
}
