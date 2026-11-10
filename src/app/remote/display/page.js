import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import BoardDisplayClient from './BoardDisplayClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Smart Board Remote Display | UPSCGPT',
  description: 'Classroom Smart Board display view for iPad remote presenting',
};

export default async function RemoteDisplayPage() {
  const session = await getServerSession(authOptions).catch(() => null);

  // Only classroom display, faculty or admin accounts can host a board session.
  // Read the role from the DB so a stale JWT can't grant it.
  let role = null;
  if (session?.user?.id) {
    const dbUser = await prisma.user
      .findUnique({ where: { id: session.user.id }, select: { role: true } })
      .catch(() => null);
    role = dbUser?.role || null;
  }
  const canHost = ['DISPLAY', 'FACULTY', 'ADMIN'].includes(role);

  return <BoardDisplayClient user={session?.user || null} canHost={canHost} />;
}
