import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import CommsAdminClient from "./CommsAdminClient";

export const metadata = {
  title: "User Comms & Email Broadcaster | UPSCGPT Admin",
  description: "Audience segmentation, broadcast announcements, and student notifications.",
};

export default async function AdminCommsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/admin-login?callbackUrl=/admin/comms");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#070b14", color: "#f8fafc", padding: "32px 40px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Mail size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#ffffff", margin: 0 }}>
                User Comms &amp; Email Dispatcher
              </h1>
              <p style={{ fontSize: "13px", color: "#94a3b8", margin: "4px 0 0" }}>
                Targeted student notifications, studio lecture alerts, and pro subscription communications
              </p>
            </div>
          </div>

          <Link
            href="/admin"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#cbd5e1",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            <ArrowLeft size={16} /> Return to Admin Control Center
          </Link>
        </header>

        <CommsAdminClient />
      </div>
    </div>
  );
}
