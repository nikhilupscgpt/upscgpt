import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminClient from "./AdminClient"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  
  if (session?.user?.role === 'FACULTY') {
    redirect("/admin/studio")
  }

  if (!session || session.user?.role !== 'ADMIN') {
    redirect("/admin-login")
  }

  return <AdminClient session={session} />
}
