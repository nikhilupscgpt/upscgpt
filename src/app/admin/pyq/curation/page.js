import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PyqCurationClient from "./PyqCurationClient";

export const metadata = {
  title: 'Similar PYQ Cluster & Family Curation Desk | UPSCGPT Admin',
  description: 'Deterministic cross-year concept mining across UPSC Prelims (2011–2026). Review candidate families, select questions to club, and merge or reject.',
};

export default async function AdminPyqCurationPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'FACULTY')) {
    redirect('/admin-login?callbackUrl=/admin/pyq/curation');
  }

  return <PyqCurationClient session={session} />;
}
