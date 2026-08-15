import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import OptionalIngestionClient from "./OptionalIngestionClient";

export const metadata = {
  title: "Optional Syllabus Ingestion Desk | UPSCGPT",
  description: "Multimodal Document Ingestion & Explicit Syllabus Node Binder",
};

export default async function OptionalContentPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/admin-login?callbackUrl=/admin/optional-content");
  }

  return <OptionalIngestionClient session={session} />;
}
