import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PyqAdminClient from "./PyqAdminClient";
import AdminOnlyNotice from "@/components/AdminOnlyNotice";

export const metadata = {
  title: 'PYQ Content & Question Editor | Admin Control Center',
  description: 'Manage, edit answers, update explanations, and bulk upload Prelims Previous Year Questions.',
};

export default async function AdminPyqPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/admin-login?callbackUrl=/admin/pyq');
  }
  if (session.user.role === 'FACULTY') {
    return <AdminOnlyNotice backHref="/admin/studio/pyq" backLabel="Back to PYQ Studio" />;
  }
  if (session.user.role !== 'ADMIN') {
    redirect('/admin-login?callbackUrl=/admin/pyq');
  }

  return <PyqAdminClient session={session} />;
}
