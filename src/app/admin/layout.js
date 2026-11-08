import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminThemeEnforcer from "./AdminThemeEnforcer";

export const metadata = {
  title: "Admin & Studio Portal | UPSCGPT",
  description: "Unified Management Center for UPSC Prelims, Mapping, Ingestion, and Lecture Studios",
};

export default async function AdminRootLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "FACULTY")) {
    redirect("/admin-login");
  }

  return (
    <div
      data-theme="dark"
      style={{
        minHeight: "100vh",
        background: "#050814",
        color: "#f8fafc",
        fontFamily: "var(--font-outfit), system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <AdminThemeEnforcer />
      {children}
    </div>
  );
}
