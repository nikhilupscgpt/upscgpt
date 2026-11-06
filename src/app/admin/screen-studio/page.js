import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ScreenStudioClient from "./ScreenStudioClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Screen Studio | UPSC In-Browser Recording Workstation",
  description:
    "Mac Screen Studio inspired edge-to-edge recording environment for UPSC Prelims PYQs and Thematic Topics with smooth spring zoom, annotations, webcam PiP, and instant YouTube chapter export.",
};

export default async function ScreenStudioPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "FACULTY")) {
    redirect("/admin-login");
  }

  return <ScreenStudioClient />;
}
