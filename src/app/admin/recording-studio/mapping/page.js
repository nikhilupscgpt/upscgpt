import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import MappingRecordingStudioClient from "./MappingRecordingStudioClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mapping In-Browser Recording Studio | Admin",
  description:
    "UPSC Mapping & Spatial Geography In-Browser Recording Workstation with Live Webcam PiP, Mic Audio Mixer, and Stage-Only Region Capture.",
};

export default async function MappingRecordingStudioPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/login");
  }

  return <MappingRecordingStudioClient />;
}
