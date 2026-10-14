"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  BookOpen, 
  Target, 
  Globe2, 
  ArrowRight, 
  CheckCircle2, 
  Flame, 
  ShieldCheck, 
  GraduationCap,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { usePyqStore } from '@/app/prelims/pyq/pyqStore';

const SUGGESTED_SEARCHES = [
  "Preamble",
  "Fundamental Rights",
  "Monetary Policy",
  "Bab-el-Mandeb Strait",
  "Panchayati Raj",
  "Biodiversity Hotspots",
  "Inflation Targeting",
  "Judicial Review"
];

const SUBJECTS = [
  {
    title: "Indian Polity",
    subjectParam: "Indian Polity",
    count: 342,
    icon: ShieldCheck,
    color: "#3b82f6",
    bg: "rgba(59, 130, 246, 0.12)",
  },
  {
    title: "Economy",
    subjectParam: "Economy",
    count: 334,
    icon: Flame,
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.12)",
  },
  {
    title: "Geography",
    subjectParam: "Geography",
    count: 366,
    icon: Globe2,
    color: "#0284c7",
    bg: "rgba(2, 132, 199, 0.12)",
  },
  {
    title: "Environment",
    subjectParam: "Environment",
    count: 227,
    icon: Globe2,
    color: "#22c55e",
    bg: "rgba(34, 197, 94, 0.12)",
  },
  {
    title: "Science & Technology",
    subjectParam: "Science & Technology",
    count: 481,
    icon: Sparkles,
    color: "#8b5cf6",
    bg: "rgba(139, 92, 246, 0.12)",
  },
  {
    title: "Modern History",
    subjectParam: "Modern History",
    count: 189,
    icon: BookOpen,
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.12)",
  },
  {
    title: "Ancient History",
    subjectParam: "Ancient History",
    count: 48,
    icon: BookOpen,
    color: "#d97706",
    bg: "rgba(217, 119, 6, 0.12)",
  },
  {
    title: "Medieval History",
    subjectParam: "Medieval History",
    count: 49,
    icon: BookOpen,
    color: "#b45309",
    bg: "rgba(180, 83, 9, 0.12)",
  },
  {
    title: "Art & Culture",
    subjectParam: "Art & Culture",
    count: 150,
    icon: Sparkles,
    color: "#ec4899",
    bg: "rgba(236, 72, 153, 0.12)",
  },
  {
    title: "Agriculture",
    subjectParam: "Agriculture",
    count: 74,
    icon: Globe2,
    color: "#84cc16",
    bg: "rgba(132, 204, 22, 0.12)",
  },
  {
    title: "CSAT (Paper II)",
    subjectParam: "CSAT",
    count: 80,
    icon: GraduationCap,
    color: "#a855f7",
    bg: "rgba(168, 85, 247, 0.12)",
  },
];

const YEAR_PAPERS = [
  { label: "UPSC CSE 2025", sub: "GS Paper 1 (Full 100 Qs)", exam: "UPSC CSE", year: 2025 },
  { label: "UPSC CSE 2024", sub: "GS Paper 1 (Full 100 Qs)", exam: "UPSC CSE", year: 2024 },
  { label: "UPSC CSE 2023", sub: "GS Paper 1 (Polity & GS)", exam: "UPSC CSE", year: 2023 },
  { label: "UPSC CSE 2022", sub: "GS Paper 1", exam: "UPSC CSE", year: 2022 },
  { label: "UPSC CSE 2021", sub: "GS Paper 1", exam: "UPSC CSE", year: 2021 },
  { label: "UPSC CSE 2020", sub: "GS Paper 1", exam: "UPSC CSE", year: 2020 },
  { label: "UPSC CDS 2023", sub: "Polity & GK Paper", exam: "CDS", year: 2023 }
];

export default function PrelimsGPTCommandCenter() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { streak, isStreakCompletedToday, ready } = usePyqStore();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/prelims/pyq?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/prelims/pyq');
    }
  };

  const handleQuickChip = (term) => {
    router.push(`/prelims/pyq?q=${encodeURIComponent(term)}`);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--bg-primary, #020617)', 
      color: 'var(--text-primary, #ffffff)',
      paddingBottom: '80px',
      fontFamily: 'var(--font-outfit), system-ui, -apple-system, sans-serif'
    }}>
      {/* Background Glow Accents */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '1200px',
        height: '450px',
        background: 'radial-gradient(circle at 50% 10%, rgba(59, 130, 246, 0.12), transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <main style={{ 
        position: 'relative', 
        zIndex: 1, 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '50px 24px 40px' 
      }}>
        
        {/* HERO SECTION */}
        <div style={{ textAlign: 'center', marginBottom: '56px', maxWidth: '860px', margin: '0 auto 56px' }}>
          {/* Top Pill */}
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '6px 16px', 
            background: 'var(--bg-card, rgba(15, 23, 42, 0.6))', 
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
            borderRadius: '999px', 
            color: 'var(--color-amber, #f59e0b)', 
            fontSize: '0.8rem', 
            fontWeight: 800, 
            marginBottom: '22px', 
            letterSpacing: '0.04em',
            boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
          }}>
            <Target size={15} style={{ color: 'var(--color-amber, #f59e0b)' }} />
            <span>UPSC CSE 2025–2026 · PRELIMS COMMAND CENTER</span>
          </div>

          {/* Headline */}
          <h1 style={{ 
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', 
            fontWeight: 900, 
            letterSpacing: '-0.03em', 
            lineHeight: 1.15, 
            marginBottom: '18px',
            color: 'var(--text-primary, #ffffff)'
          }}>
            Master Prelims with <span style={{ 
              background: 'linear-gradient(135deg, var(--color-blue, #3b82f6), #60a5fa)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent' 
            }}>Zero Clutter</span>.
          </h1>

          {/* Subtitle */}
          <p style={{ 
            fontSize: 'clamp(1rem, 2vw, 1.18rem)', 
            color: 'var(--text-secondary, #94a3b8)', 
            lineHeight: 1.6, 
            maxWidth: '720px', 
            margin: '0 auto 36px' 
          }}>
            Strictly high-yield. Topic-wise Previous Year Questions mapped to granular micro-themes, 
            instant semantic concept retrieval, and an interactive spatial mapping atlas.
          </p>

          {/* SEARCH BAR (Prelims Concept & Question Retrieval) */}
          <form 
            onSubmit={handleSearchSubmit} 
            style={{ 
              maxWidth: '680px', 
              margin: '0 auto',
              position: 'relative'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-card, rgba(15, 23, 42, 0.8))',
              border: '1.5px solid var(--border-color, rgba(255, 255, 255, 0.15))',
              borderRadius: '16px',
              padding: '6px 8px 6px 18px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
            }}>
              <Search size={22} style={{ color: 'var(--text-muted, #64748b)', marginRight: '12px', flexShrink: 0 }} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search concepts, questions or topics (e.g. Fundamental Rights, Money Bill, Inflation)..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary, #ffffff)',
                  fontSize: '1rem',
                  fontWeight: 500
                }}
              />
              <button 
                type="submit"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--btn-primary-bg, #3b82f6)',
                  color: 'var(--btn-primary-text, #ffffff)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 20px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s ease',
                  flexShrink: 0
                }}
              >
                <span>Search</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>

          {/* Quick Filter Chips */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '8px', 
            marginTop: '16px' 
          }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
              Quick Jumps:
            </span>
            {SUGGESTED_SEARCHES.map((term) => (
              <button
                key={term}
                onClick={() => handleQuickChip(term)}
                style={{
                  background: 'var(--bg-input, rgba(255, 255, 255, 0.04))',
                  border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                  borderRadius: '999px',
                  padding: '4px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary, #94a3b8)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-blue, #3b82f6)';
                  e.currentTarget.style.color = 'var(--text-primary, #ffffff)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color, rgba(255, 255, 255, 0.08))';
                  e.currentTarget.style.color = 'var(--text-secondary, #94a3b8)';
                }}
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DAILY PYQ STREAK HERO CARD (DAILY 10-QUESTION DISCIPLINE)                 */}
        {/* ========================================================================= */}
        <div style={{
          marginBottom: '52px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.09) 0%, rgba(239, 68, 68, 0.05) 50%, rgba(59, 130, 246, 0.06) 100%)',
          border: '1.5px solid rgba(245, 158, 11, 0.35)',
          borderRadius: '22px',
          padding: '24px 28px',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.22), 0 0 40px rgba(245, 158, 11, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          flexWrap: 'wrap',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle warm glow circle */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '180px',
            height: '180px',
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.16) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          {/* Left Block: Flame Counter + Description */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, minWidth: '280px', position: 'relative', zIndex: 1 }}>
            {/* Animated Flame Badge */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '76px',
              height: '76px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(239, 68, 68, 0.15) 100%)',
              border: '1.5px solid rgba(245, 158, 11, 0.45)',
              boxShadow: '0 6px 20px rgba(245, 158, 11, 0.18)',
              flexShrink: 0
            }}>
              <Flame size={32} style={{ color: '#f59e0b', filter: 'drop-shadow(0 2px 8px rgba(245, 158, 11, 0.6))' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#f59e0b', marginTop: '2px', letterSpacing: '-0.01em' }}>
                {ready ? streak.current || 0 : 0}d
              </span>
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  background: isStreakCompletedToday ? 'rgba(16, 185, 129, 0.16)' : 'rgba(245, 158, 11, 0.16)',
                  color: isStreakCompletedToday ? '#10b981' : '#f59e0b',
                  border: isStreakCompletedToday ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(245, 158, 11, 0.35)'
                }}>
                  {isStreakCompletedToday ? '✓ TODAY COMPLETED' : '🔥 DAILY PRELIMS HABIT'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
                  Best: {ready ? streak.best || 0 : 0}d streak
                </span>
              </div>

              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: '0 0 6px 0', color: 'var(--text-primary, #ffffff)', letterSpacing: '-0.02em' }}>
                Daily 10-Question Prelims Streak
              </h2>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary, #94a3b8)', margin: 0, lineHeight: 1.55 }}>
                {isStreakCompletedToday
                  ? `Great job! You've logged today's 10-question drill. Current streak: ${streak.current} day${streak.current === 1 ? '' : 's'} (Best: ${streak.best}d). Tomorrow's drill unlocks at midnight.`
                  : '10 curated authentic UPSC questions across core subjects · 12 minutes · Build unbeatable problem-solving discipline.'}
              </p>
            </div>
          </div>

          {/* Right Action: CTA Button */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <Link
              href="/prelims/pyq/practice?drill=daily&mode=practice"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '13px 24px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.92rem',
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.35)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Flame size={18} />
              <span>{isStreakCompletedToday ? "Review Today's Drill" : "▶ Start Today's Drill (10 Qs)"}</span>
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1: QUESTIONS BY SUBJECT                                           */}
        {/* ========================================================================= */}
        <div style={{ marginBottom: '56px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>
                Questions by Subject
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px', margin: '4px 0 0 0' }}>
                Select a subject to view and practice past UPSC Prelims questions.
              </p>
            </div>
            
            <Link 
              href="/prelims/pyq" 
              style={{ 
                fontSize: '0.85rem', 
                fontWeight: 700, 
                color: 'var(--color-blue, #3b82f6)', 
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>View all questions</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
            gap: '14px' 
          }}>
            {SUBJECTS.map((sub, idx) => {
              const IconComponent = sub.icon;
              return (
                <Link
                  key={idx}
                  href={`/prelims/pyq?subject=${encodeURIComponent(sub.subjectParam)}`}
                  style={{
                    textDecoration: 'none',
                    background: 'var(--bg-card, rgba(15, 23, 42, 0.6))',
                    border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                    borderRadius: '14px',
                    padding: '16px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    cursor: 'pointer',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = sub.color;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.background = 'var(--bg-hover, rgba(15, 23, 42, 0.85))';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color, rgba(255, 255, 255, 0.08))';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = 'var(--bg-card, rgba(15, 23, 42, 0.6))';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '10px', 
                      background: sub.bg, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: sub.color,
                      flexShrink: 0
                    }}>
                      <IconComponent size={20} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {sub.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #94a3b8)', fontWeight: 600, marginTop: '2px' }}>
                        {sub.count} Questions
                      </div>
                    </div>
                  </div>

                  <div style={{ color: 'var(--text-muted, #64748b)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <ArrowRight size={16} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: YEAR-WISE OFFICIAL PAPERS                                      */}
        {/* ========================================================================= */}
        <div style={{ marginBottom: '64px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Previous Years Official Papers
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 24px 0' }}>
            Practice complete UPSC question papers from 2011 to 2025.
          </p>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
            gap: '16px' 
          }}>
            {YEAR_PAPERS.map((p, pidx) => (
              <Link 
                key={pidx} 
                href={`/prelims/pyq?exam=${encodeURIComponent(p.exam)}&year=${p.year}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{
                  background: 'var(--bg-card, rgba(15, 23, 42, 0.6))',
                  border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-emerald, #10b981)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color, rgba(255, 255, 255, 0.08))';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                >
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {p.label}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {p.sub}
                    </div>
                  </div>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '8px', 
                    background: 'rgba(16, 185, 129, 0.1)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#10b981'
                  }}>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: SPECIALIZED PRELIMS POWER ENGINES (NO DUPLICATES)              */}
        {/* ========================================================================= */}
        <div style={{ marginBottom: '64px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-amber, #f59e0b)', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
            <Sparkles size={14} />
            <span>SPECIALIZED ENGINES</span>
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Advanced Prelims Simulators
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: '0 0 24px 0' }}>
            Purpose-built tools for exam-hall pressure and spatial geography.
          </p>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', 
            gap: '24px' 
          }}>
            
            {/* Tool 1: Interactive Spatial Atlas */}
            <Link href="/atlas" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                background: 'var(--bg-card, rgba(15, 23, 42, 0.7))',
                border: '1.5px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                borderRadius: '24px',
                padding: '32px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.25s ease',
                boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = '#10b981';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-color, rgba(255, 255, 255, 0.08))';
              }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '16px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10b981'
                    }}>
                      <Globe2 size={26} />
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '20px',
                      background: 'rgba(16, 185, 129, 0.12)',
                      color: '#10b981'
                    }}>
                      Maps
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
                    Interactive Maps & Atlas
                  </h3>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '20px' }}>
                    Practice map-based questions for Prelims. Interactive maps covering important global locations, waterways, conflict areas, and Indian national parks.
                  </p>
                </div>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  fontWeight: 700, 
                  fontSize: '0.9rem', 
                  color: '#10b981' 
                }}>
                  <span>Open Atlas</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>

            {/* Tool 2: Prelims Mock Simulator */}
            <Link href="/prelims/mocks" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                background: 'var(--bg-card, rgba(15, 23, 42, 0.7))',
                border: '1.5px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                borderRadius: '24px',
                padding: '32px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.25s ease',
                boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'var(--color-amber, #f59e0b)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-color, rgba(255, 255, 255, 0.08))';
              }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '16px',
                      background: 'rgba(245, 158, 11, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-amber, #f59e0b)'
                    }}>
                      <Target size={26} />
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '20px',
                      background: 'rgba(245, 158, 11, 0.12)',
                      color: '#f59e0b'
                    }}>
                      Exam Arena
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
                    Prelims Mock Simulator
                  </h3>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '20px' }}>
                    Simulate the actual UPSC Prelims battleground. Strict -0.33 negative marking, countdown clock, question palette navigation, and real-time sectional cutoff scorecards.
                  </p>
                </div>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  fontWeight: 700, 
                  fontSize: '0.9rem', 
                  color: 'var(--color-amber, #f59e0b)' 
                }}>
                  <span>Start Mock Test</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>

          </div>
        </div>



      </main>

      {/* FOOTER */}
      <footer style={{
        maxWidth: '1200px',
        margin: '60px auto 0',
        padding: '32px 24px 0',
        borderTop: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
            upsc<span style={{ color: 'var(--color-blue, #3b82f6)' }}>gpt</span>
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            · UPSC Prelims Preparation Platform
          </span>
        </div>

        <div style={{ display: 'flex', gap: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <Link href="/prelims/pyq" style={{ color: 'inherit', textDecoration: 'none' }}>PYQ Explorer</Link>
          <Link href="/prelims/mocks" style={{ color: 'inherit', textDecoration: 'none' }}>Mock Tests</Link>
          <Link href="/atlas" style={{ color: 'inherit', textDecoration: 'none' }}>Atlas</Link>
          <Link href="/sitemap.xml" style={{ color: 'inherit', textDecoration: 'none' }}>Sitemap</Link>
        </div>
      </footer>
    </div>
  );
}
