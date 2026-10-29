import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Radio,
  GraduationCap,
  Compass,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Camera,
  Mic,
  HardDrive,
  Video,
} from "lucide-react";
import "../studio/studio.css";
import RecordingsVaultBanner from "./RecordingsVaultBanner";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "UPSC In-Browser Recording Studio | Admin",
  description:
    "Self-contained 1080p browser recording studio with live webcam PiP, mic audio mixer, stage-only Region Capture, per-question retake, and auto YouTube chapters.",
};

export default async function RecordingStudioHubPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "FACULTY")) {
    redirect("/admin-login");
  }

  return (
    <div className="pq-studio-root">
      {/* Top Header */}
      <header className="pq-studio-header">
        <div className="pq-studio-brand">
          <div
            className="pq-studio-icon-badge"
            style={{
              background: "linear-gradient(135deg, #f43f5e, #e11d48)",
              color: "#ffffff",
              boxShadow: "0 8px 24px rgba(244, 63, 94, 0.35)",
            }}
          >
            <Radio size={28} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 className="pq-studio-title">UPSC Recording Studio</h1>
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: "rgba(244, 63, 94, 0.2)",
                  border: "1px solid rgba(244, 63, 94, 0.45)",
                  color: "#fb7185",
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: "0.05em",
                }}
              >
                IN-BROWSER RECORDER · NO OBS REQUIRED
              </span>
            </div>
            <p className="pq-studio-sub">
              Turnkey 1080p Stage Capture with Live Webcam PiP, Mic Audio Compressor, Per-Question Retake &amp; Auto YouTube Chapters
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/admin/studio"
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              background: "rgba(56, 189, 248, 0.1)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              color: "#38bdf8",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Video size={15} />
            <span>Classic Lecture Studio (OBS)</span>
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

      {/* Main Recording Studio Options */}
      <div style={{ maxWidth: 1240, margin: "36px auto 0" }}>
        {/* Feature Pill Banner */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 14,
            marginBottom: 34,
          }}
        >
          <div
            style={{
              padding: "14px 18px",
              borderRadius: 14,
              background: "rgba(15, 23, 42, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Camera size={20} color="#fb7185" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>Live Webcam in Stage Box</div>
              <div style={{ fontSize: 11.5, color: "#94a3b8" }}>Your face renders directly inside the slide corner</div>
            </div>
          </div>

          <div
            style={{
              padding: "14px 18px",
              borderRadius: 14,
              background: "rgba(15, 23, 42, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Mic size={20} color="#38bdf8" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>Stage-Only Region Capture</div>
              <div style={{ fontSize: 11.5, color: "#94a3b8" }}>Floating toolbars &amp; tabs are excluded from video</div>
            </div>
          </div>

          <div
            style={{
              padding: "14px 18px",
              borderRadius: 14,
              background: "rgba(15, 23, 42, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <HardDrive size={20} color="#34d399" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#f8fafc" }}>100% Local Mac Storage</div>
              <div style={{ fontSize: 11.5, color: "#94a3b8" }}>IndexedDB crash protection + instant MP4/WebM download</div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 24 }}>
          {/* Card 1: PYQ Recording Studio */}
          <Link
            href="/admin/recording-studio/pyq"
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
                border: "2px solid #f43f5e",
                boxShadow: "0 16px 48px rgba(244, 63, 94, 0.18)",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 16,
                      background: "#f43f5e",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <GraduationCap size={28} />
                  </div>
                  <span
                    className="pq-mode-badge"
                    style={{
                      background: "rgba(244, 63, 94, 0.2)",
                      color: "#fb7185",
                      border: "1px solid rgba(244, 63, 94, 0.45)",
                    }}
                  >
                    In-Browser Recorder Ready
                  </span>
                </div>

                <h3 style={{ fontSize: 22, fontWeight: 900, color: "#ffffff", margin: "0 0 10px" }}>
                  PYQ Recording Studio
                </h3>
                <p style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.6, margin: "0 0 18px" }}>
                  Select UPSC Prelims PYQs by Subject, Topic, Year, or Pattern and record directly inside Chrome with live webcam PiP, stylus ink, per-question retake, and automatic YouTube chapter timestamps.
                </p>

                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "#94a3b8" }}>
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={16} color="#fb7185" />
                    <span>Live Webcam rendered directly inside the stage corner slot</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={16} color="#fb7185" />
                    <span>1-Click Record, Pause &amp; &ldquo;Retake Current Question&rdquo; button</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={16} color="#fb7185" />
                    <span>Auto-logs exact question timestamps (`00:00 Q1`, `02:35 Q2`)</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={16} color="#fb7185" />
                    <span>Instant download to Mac (`~/Downloads`) with 0 server storage</span>
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
                <span style={{ fontSize: 13.5, fontWeight: 800, color: "#fb7185" }}>
                  Open PYQ Recording Workstation
                </span>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    background: "#f43f5e",
                    color: "#ffffff",
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

          {/* Card 2: Mapping Recording Studio */}
          <Link
            href="/admin/recording-studio/mapping"
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
                boxShadow: "0 16px 48px rgba(16, 185, 129, 0.18)",
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
                  <span
                    className="pq-mode-badge"
                    style={{
                      background: "rgba(16, 185, 129, 0.2)",
                      color: "#34d399",
                      border: "1px solid rgba(16, 185, 129, 0.4)",
                    }}
                  >
                    In-Browser Recorder Ready
                  </span>
                </div>

                <h3 style={{ fontSize: 22, fontWeight: 900, color: "#ffffff", margin: "0 0 10px" }}>
                  Mapping Recording Studio
                </h3>
                <p style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.6, margin: "0 0 18px" }}>
                  Record interactive river systems, mountain ranges, Places in News (PIN), and spatial PYQs with live map panning, card-to-map spotlighting, live webcam PiP, and stylus boundary tracing.
                </p>

                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "#94a3b8" }}>
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={16} color="#34d399" />
                    <span>All 16 River Systems, Protected Areas, Mountains &amp; PIN nodes</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={16} color="#34d399" />
                    <span>Interactive Leaflet map spotlight + live camera overlay</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={16} color="#34d399" />
                    <span>Auto-logs chapter timestamps for every river/place covered</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={16} color="#34d399" />
                    <span>Stage-cropped 1080p capture (hides floating toolbar from video)</span>
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
                  Open Mapping Recording Workstation
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

          {/* Card 3: 9:16 Vertical Reels & Shorts Studio */}
          <Link
            href="/admin/recording-studio/reels"
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
                border: "2px solid #a855f7",
                boxShadow: "0 16px 48px rgba(168, 85, 247, 0.2)",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 16,
                      background: "linear-gradient(135deg, #f43f5e, #a855f7)",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Smartphone size={28} />
                  </div>
                  <span
                    className="pq-mode-badge"
                    style={{
                      background: "rgba(168, 85, 247, 0.22)",
                      color: "#c084fc",
                      border: "1px solid rgba(168, 85, 247, 0.45)",
                    }}
                  >
                    9:16 Vertical · 3 Slides
                  </span>
                </div>

                <h3 style={{ fontSize: 22, fontWeight: 900, color: "#ffffff", margin: "0 0 10px" }}>
                  Reels &amp; Shorts Studio
                </h3>
                <p style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.6, margin: "0 0 18px" }}>
                  Turn any UPSC Prelims PYQ or Mapping node into a crisp 3-slide vertical (`9:16`) Reel for Instagram Reels &amp; YouTube Shorts — stripped of bulky value-addition blocks for punchy 60-second delivery.
                </p>

                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "#94a3b8" }}>
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={16} color="#c084fc" />
                    <span>Slide 1: Question Hook · Slide 2: Statement/Option Breakdown · Slide 3: Keywords</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={16} color="#c084fc" />
                    <span>Bottom Split-Screen or Corner Bubble live webcam inside `9:16` stage</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={16} color="#c084fc" />
                    <span>Stage-cropped vertical capture (~5 MB per 60-sec Reel)</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={16} color="#c084fc" />
                    <span>Auto-generates Instagram &amp; YouTube Shorts caption + hashtags</span>
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
                <span style={{ fontSize: 13.5, fontWeight: 800, color: "#c084fc" }}>
                  Open 9:16 Reels Studio
                </span>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    background: "linear-gradient(135deg, #f43f5e, #a855f7)",
                    color: "#ffffff",
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
        </div>

        {/* Local Browser Recordings Vault */}
        <RecordingsVaultBanner />
      </div>
    </div>
  );
}
