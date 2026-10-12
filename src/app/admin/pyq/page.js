import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PyqAdminClient from "./PyqAdminClient";

export const metadata = {
  title: 'PYQ Content & Question Editor | Admin Control Center',
  description: 'Manage, edit answers, update explanations, and bulk upload Prelims Previous Year Questions.',
};

export default async function AdminPyqPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'ADMIN') {
    redirect("/login");
  }

  return <PyqAdminClient session={session} />;
}
