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
  MapPin,
  Compass,
} from "lucide-react";
import "./studio.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "UPSC Lecture Studio Hub | Admin",
  description: "Select your lecture recording format: Prelims PYQ Studio, Mapping Lecture Studio, or Thematic Topic Studio.",
};

export default async function StudioHubPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "FACULTY")) {
    redirect("/admin-login");
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

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/admin/recording-studio"
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              background: "rgba(244, 63, 94, 0.14)",
              border: "1px solid rgba(244, 63, 94, 0.38)",
              color: "#fb7185",
              textDecoration: "none",
              fontSize: 13.5,
              fontWeight: 800,
            }}
          >
            🎬 In-Browser Recording Studio (16:9 &amp; 9:16 Reels)
          </Link>

          {session.user?.role === "ADMIN" ? (
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
          ) : (
            <span
              style={{
                padding: "10px 16px",
                borderRadius: 12,
                background: "rgba(168, 85, 247, 0.15)",
                border: "1px solid rgba(168, 85, 247, 0.35)",
                color: "#c084fc",
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              🎓 Faculty / Presenter Mode ({session.user?.name || "Faculty"})
            </span>
          )}
        </div>
      </header>

      {/* Main Studio Gateway Options */}
      <div style={{ maxWidth: 1240, margin: "40px auto 0" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: "#ffffff", margin: "0 0 8px" }}>
            Select Lecture Format
          </h2>
          <p style={{ fontSize: 14.5, color: "#94a3b8", margin: 0 }}>
            Choose a dedicated broadcast studio workstation to configure your playlist and record.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 26 }}>
          {/* Card 1: PYQ Lecture Studio (Active & Primary) */}
          <Link
            href="/admin/studio/pyq"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              className="pq-mode-card is-active"
              style={{
                height: "100%",
                padding: 32,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 22,
                border: "2px solid #38bdf8",
                boxShadow: "0 16px 48px rgba(56, 189, 248, 0.2)",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 16,
                      background: "#38bdf8",
                      color: "#032b43",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <GraduationCap size={28} />
                  </div>
                  <span className="pq-mode-badge pq-mode-badge-blue">
                    Active &amp; Ready
                  </span>
                </div>

                <h3 style={{ fontSize: 22, fontWeight: 900, color: "#ffffff", margin: "0 0 10px" }}>
                  PYQ Lecture Studio
                </h3>
                <p style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.6, margin: "0 0 18px" }}>
                  Comprehensive Prelims question library with full syllabus taxonomy filters, statement elimination breakdown, verified answer keys, high-yield keywords, and 1080p recording stage.
                </p>

                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "#94a3b8" }}>
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={16} color="#34d399" />
                    <span>Full taxonomy filters (Subject, Theme, Year, Pattern)</span>
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
                    <span>In-Studio playlist tray (Q), XP-Pen stylus &amp; Screen Fit mode</span>
                  </li>
                </ul>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 18,
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

          {/* Card 2: Mapping Lecture Studio (Active & Ready) */}
          <Link
            href="/admin/studio/mapping"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              className="pq-mode-card is-active"
              style={{
                height: "100%",
                padding: 32,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 22,
                border: "2px solid #10b981",
                boxShadow: "0 16px 48px rgba(16, 185, 129, 0.2)",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 16,
                      background: "#10b981",
                      color: "#022c22",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Compass size={28} />
                  </div>
                  <span className="pq-mode-badge" style={{ background: "rgba(16, 185, 129, 0.2)", color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.4)" }}>
                    Active &amp; Ready
                  </span>
                </div>

                <h3 style={{ fontSize: 22, fontWeight: 900, color: "#ffffff", margin: "0 0 10px" }}>
                  Mapping Lecture Studio
                </h3>
                <p style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.6, margin: "0 0 18px" }}>
                  Dedicated spatial geography workstation covering 71 curated static nodes, 67 Places in News (PIN), and 236 Mapping PYQs with directional alignment and distractor traps.
                </p>

                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "#94a3b8" }}>
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={16} color="#34d399" />
                    <span>Scope filters (India &amp; World) + 12 Mapping categories</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={16} color="#34d399" />
                    <span>Geo-coordinates, aliases, tributaries &amp; border country data</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={16} color="#34d399" />
                    <span>5-Stage Deck: Spatial Profile, Map Slide, Facts, Traps &amp; PYQs</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={16} color="#34d399" />
                    <span>XP-Pen boundary tracing &amp; OBS letterbox / fluid screen fit</span>
                  </li>
                </ul>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 18,
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <span style={{ fontSize: 13.5, fontWeight: 800, color: "#10b981" }}>
                  Open Mapping Studio Workstation
                </span>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    background: "#10b981",
                    color: "#022c22",
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

          {/* Card 3: Thematic Topic Studio (Next Phase) */}
          <div
            style={{
              padding: 32,
              borderRadius: 20,
              background: "rgba(15, 23, 42, 0.5)",
              border: "1.5px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 22,
              opacity: 0.85,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div
                  style={{
                    width: 54,
                    height: 54,
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
                  Phase 3 · Next
                </span>
              </div>

              <h3 style={{ fontSize: 22, fontWeight: 900, color: "#ffffff", margin: "0 0 10px" }}>
                Thematic Topic Studio
              </h3>
              <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, margin: "0 0 18px" }}>
                Deliver comprehensive GS 1–4 thematic masterclasses from existing Neural syllabus nodes or custom scratchpad outlines. Features constitutional doctrines, landmark judicial cases, and Mains answer fodder.
              </p>

              <div style={{ padding: "14px 18px", borderRadius: 12, background: "rgba(30, 41, 59, 0.4)", border: "1px dashed rgba(255, 255, 255, 0.12)", fontSize: 13, color: "#94a3b8" }}>
                💡 <em>Scheduled for Phase 3 implementation right after Mapping Studio.</em>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: 18,
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
