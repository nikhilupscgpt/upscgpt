import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ArchitectWrapper from "@/components/admin/ArchitectWrapper";

// Forced Refresh - v2
export const metadata = {
  title: 'Neural Architect | UPSCGPT',
  description: 'Advanced Syllabus Engineering & Intelligence Mapping',
};

export default async function ArchitectPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login?callbackUrl=/admin/architect');
  }

  return (
    <div style={{ background: '#020617', minHeight: '100vh' }}>
      <ArchitectWrapper session={session} />
    </div>
  );
}
