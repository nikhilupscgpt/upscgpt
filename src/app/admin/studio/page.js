import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Video,
  GraduationCap,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Layers,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import "./studio.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "UPSC Lecture Studio Hub | Admin",
  description: "Select your lecture recording format: Prelims PYQ Studio or Thematic Topic Studio.",
};

export default async function StudioHubPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="pq-studio-root">
      {/* Top Header */}
      <header className="pq-studio-header">
        <div className="pq-studio-brand">
          <div className="pq-studio-icon-badge">
            <Video size={28} />
          </div>
          <div>
            <h1 className="pq-studio-title">UPSC Lecture Studio</h1>
            <p className="pq-studio-sub">
              Broadcast-Ready 1080p Recording Decks with XP-Pen Dual-Layer Vector Pen Canvas &amp; OBS Overlay
            </p>
          </div>
        </div>

        <Link
          href="/admin"
          style={{
            padding: "10px 18px",
            borderRadius: 12,
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#cbd5e1",
            textDecoration: "none",
            fontSize: 13.5,
            fontWeight: 700,
          }}
        >
          ← Return to Admin Control Center
        </Link>
      </header>

      {/* Main Studio Gateway Options */}
      <div style={{ maxWidth: 1100, margin: "40px auto 0" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: "#ffffff", margin: "0 0 8px" }}>
            Select Lecture Format
          </h2>
          <p style={{ fontSize: 14.5, color: "#94a3b8", margin: 0 }}>
            Choose a dedicated broadcast studio workstation to configure your playlist and record.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
          {/* Card 1: PYQ Lecture Studio (Active & Primary) */}
          <Link
            href="/admin/studio/pyq"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              className="pq-mode-card is-active"
              style={{
                height: "100%",
                padding: 36,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 24,
                border: "2px solid #38bdf8",
                boxShadow: "0 16px 48px rgba(56, 189, 248, 0.2)",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      background: "#38bdf8",
                      color: "#032b43",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <GraduationCap size={30} />
                  </div>
                  <span className="pq-mode-badge pq-mode-badge-blue">
                    Active &amp; Ready
                  </span>
                </div>

                <h3 style={{ fontSize: 24, fontWeight: 900, color: "#ffffff", margin: "0 0 10px" }}>
                  PYQ Lecture Studio
                </h3>
                <p style={{ fontSize: 14.5, color: "#cbd5e1", lineHeight: 1.6, margin: "0 0 20px" }}>
                  Comprehensive Prelims question library with full syllabus taxonomy filters, statement-by-statement elimination breakdown, verified answer keys, high-yield concept keywords, map/diagram attachments, and 1080p recording stage.
                </p>

                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "#94a3b8" }}>
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={16} color="#34d399" />
                    <span>Full backend &amp; frontend filters (Subject, Theme, Year, Pattern, Quality)</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={16} color="#34d399" />
                    <span>Cherry-pick or Select All questions into recording queue</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={16} color="#34d399" />
                    <span>Attach high-res maps / diagrams directly to questions</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={16} color="#34d399" />
                    <span>In-Studio playlist tray (Q), XP-Pen stylus pressure &amp; Whiteboard</span>
                  </li>
                </ul>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 20,
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <span style={{ fontSize: 13.5, fontWeight: 800, color: "#38bdf8" }}>
                  Open PYQ Studio Workstation
                </span>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    background: "#38bdf8",
                    color: "#032b43",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ArrowRight size={18} />
                </div>
              </div>
            </div>
          </Link>

          {/* Card 2: Thematic Topic Studio (Next Phase) */}
          <div
            style={{
              padding: 36,
              borderRadius: 20,
              background: "rgba(15, 23, 42, 0.5)",
              border: "1.5px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 24,
              opacity: 0.85,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: "rgba(168, 85, 247, 0.2)",
                    color: "#c084fc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <BookOpen size={28} />
                </div>
                <span className="pq-mode-badge pq-mode-badge-purple">
                  Phase 2 · Next
                </span>
              </div>

              <h3 style={{ fontSize: 24, fontWeight: 900, color: "#ffffff", margin: "0 0 10px" }}>
                Thematic Topic Studio
              </h3>
              <p style={{ fontSize: 14.5, color: "#94a3b8", lineHeight: 1.6, margin: "0 0 20px" }}>
                Deliver comprehensive GS 1–4 thematic masterclasses from existing Neural syllabus nodes or custom scratchpad outlines. Features constitutional doctrines, landmark judicial cases, flowcharts, and Mains answer fodder.
              </p>

              <div style={{ padding: "14px 18px", borderRadius: 12, background: "rgba(30, 41, 59, 0.4)", border: "1px dashed rgba(255, 255, 255, 0.12)", fontSize: 13, color: "#94a3b8" }}>
                💡 <em>Scheduled for Phase 2 implementation right after PYQ Studio perfection.</em>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: 20,
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                color: "#64748b",
              }}
            >
              <span style={{ fontSize: 13.5, fontWeight: 700 }}>
                Thematic Topic Studio
              </span>
              <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#a855f7" }}>
                Coming Next
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
