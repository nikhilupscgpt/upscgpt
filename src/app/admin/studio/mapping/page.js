import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import MappingStudioClient from "./MappingStudioClient";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Mapping Lecture Studio Workstation | Admin',
  description: 'Full-featured UPSC Mapping & Spatial Geography studio workstation for recording 1080p video masterclasses with XP-Pen boundary tracing.',
};

export default async function MappingStudioPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'FACULTY')) {
    redirect("/admin-login");
  }

  return <MappingStudioClient />;
}
