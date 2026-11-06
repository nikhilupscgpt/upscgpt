"use client";

import React, { useState, useEffect } from 'react';
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
  Sparkles,
  X
} from 'lucide-react';
import { usePyqStore } from '@/app/prelims/pyq/pyqStore';
import PyqQuestionCard from '@/components/search/PyqQuestionCard';

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
  const [matchedPyqs, setMatchedPyqs] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { streak, isStreakCompletedToday, ready } = usePyqStore();

  const handleQueryChange = (val) => {
    setSearchQuery(val);
    if (val.trim().length < 2) {
      setMatchedPyqs([]);
      setIsSearching(false);
      setHasSearched(false);
    }
  };

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) return;

    const timer = setTimeout(() => {
      setIsSearching(true);
      fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then(res => res.json())
        .then(data => {
          setMatchedPyqs(data.pyqs || []);
          setIsSearching(false);
          setHasSearched(true);
        })
        .catch(err => {
          console.error("Home search error:", err);
          setIsSearching(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const resultsEl = document.getElementById('home-pyq-results');
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        router.push(`/prelims/pyq?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    } else {
      router.push('/prelims/pyq');
    }
  };

  const handleQuickChip = (term) => {
    setSearchQuery(term);
    const inputEl = document.getElementById('home-search-input');
    if (inputEl) inputEl.focus();
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%',
      overflowX: 'clip',
      backgroundColor: 'var(--bg-primary, #020617)', 
      color: 'var(--text-primary, #ffffff)',
      paddingBottom: '80px',
      fontFamily: 'var(--font-outfit), system-ui, -apple-system, sans-serif'
    }}>
      <main style={{ 
        position: 'relative', 
        zIndex: 1, 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: 'clamp(28px, 5vw, 50px) clamp(14px, 4vw, 24px) 40px' 
      }}>
        
        {/* HERO SECTION */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(36px, 6vw, 56px)', maxWidth: '860px', margin: '0 auto clamp(36px, 6vw, 56px)' }}>
          {/* Top Pill */}
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '6px 14px', 
            maxWidth: '100%',
            background: 'var(--bg-card, rgba(15, 23, 42, 0.6))', 
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
            borderRadius: '999px', 
            color: 'var(--color-amber, #f59e0b)', 
            fontSize: 'clamp(0.68rem, 2.2vw, 0.8rem)', 
            fontWeight: 800, 
            marginBottom: '20px', 
            letterSpacing: '0.04em',
            boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
          }}>
            <Target size={15} style={{ color: 'var(--color-amber, #f59e0b)', flexShrink: 0 }} />
            <span>UPSC CSE 2025–2026 · PRELIMS COMMAND CENTER</span>
          </div>

          {/* Headline */}
          <h1 style={{ 
            fontSize: 'clamp(2rem, 6vw, 3.8rem)', 
            fontWeight: 900, 
            letterSpacing: '-0.03em', 
            lineHeight: 1.15, 
            marginBottom: '16px',
            color: 'var(--text-primary, #ffffff)'
          }}>
            Master Prelims with <span style={{ 
              color: 'var(--color-blue, #3b82f6)',
              background: 'linear-gradient(135deg, #60a5fa, #38bdf8)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent' 
            }}>Zero Clutter</span>.
          </h1>

          {/* Subtitle */}
          <p style={{ 
            fontSize: 'clamp(0.92rem, 2.5vw, 1.18rem)', 
            color: 'var(--text-secondary, #94a3b8)', 
            lineHeight: 1.6, 
            maxWidth: '720px', 
            margin: '0 auto 28px' 
          }}>
            Strictly high-yield. Topic-wise Previous Year Questions mapped to granular micro-themes, 
            instant semantic concept retrieval, and an interactive spatial mapping atlas.
          </p>

          {/* SEARCH BAR (Prelims Concept & Question Retrieval) */}
          <form 
            onSubmit={handleSearchSubmit} 
            style={{ 
              maxWidth: '680px', 
              width: '100%',
              margin: '0 auto',
              position: 'relative'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              maxWidth: '100%',
              backgroundColor: 'var(--bg-card, rgba(15, 23, 42, 0.8))',
              border: '1.5px solid var(--border-color, rgba(255, 255, 255, 0.15))',
              borderRadius: '16px',
              padding: '6px 6px 6px 14px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
            }}>
              <Search size={18} style={{ color: 'var(--text-muted, #64748b)', flexShrink: 0 }} />
              <input 
                id="home-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Search concepts, PYQs or topics (e.g. Money Bill, Inflation)..."
                style={{
                  flex: 1,
                  minWidth: 0,
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary, #ffffff)',
                  fontSize: 'clamp(0.88rem, 2.5vw, 1rem)',
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
                  padding: '10px clamp(12px, 3vw, 20px)',
                  fontSize: 'clamp(0.82rem, 2.5vw, 0.9rem)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                <span>Search</span>
                <ArrowRight size={15} />
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
        {/* LIVE MATCHED QUESTION CARDS SECTION (OPEN ONE BELOW OTHER)                 */}
        {/* ========================================================================= */}
        {searchQuery.trim().length >= 2 && (
          <section id="home-pyq-results" style={{ marginBottom: '56px', scrollMarginTop: '100px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '20px',
              padding: '16px 22px',
              background: 'var(--bg-card, rgba(15, 23, 42, 0.7))',
              border: '1.5px solid var(--border-color, rgba(255, 255, 255, 0.12))',
              borderRadius: '18px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.4rem' }}>🎯</span>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary, #ffffff)' }}>
                    {isSearching ? 'Searching Prelims PYQ Bank...' : `${matchedPyqs.length} Solved Questions Found for "${searchQuery}"`}
                  </h2>
                  <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    Interactive Question Cards &middot; Attempt and reveal official keys directly below
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setMatchedPyqs([]);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'var(--bg-input, rgba(255, 255, 255, 0.05))',
                    border: '1px solid var(--border-color, rgba(255, 255, 255, 0.12))',
                    color: 'var(--text-secondary, #94a3b8)',
                    borderRadius: '10px',
                    padding: '7px 14px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <X size={14} />
                  <span>Clear Search</span>
                </button>
                <Link
                  href={`/prelims/pyq?q=${encodeURIComponent(searchQuery.trim())}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'var(--color-blue, #3b82f6)',
                    color: '#ffffff',
                    borderRadius: '10px',
                    padding: '8px 16px',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <span>Open in Explorer</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Questions Stack (One Below Other) */}
            {isSearching ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[1, 2].map(i => (
                  <div key={i} style={{
                    padding: '32px 24px',
                    background: 'var(--bg-card, rgba(15, 23, 42, 0.7))',
                    border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
                    borderRadius: '20px',
                    textAlign: 'center',
                    color: 'var(--text-muted, #64748b)',
                    fontSize: '0.92rem',
                    fontWeight: 600
                  }}>
                    Loading matching Question Card {i}...
                  </div>
                ))}
              </div>
            ) : matchedPyqs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {matchedPyqs.slice(0, 5).map((pyq, idx) => (
                  <PyqQuestionCard
                    key={pyq.id || idx}
                    pyq={pyq}
                    query={searchQuery}
                    isHeroMatch={idx === 0}
                  />
                ))}

                {matchedPyqs.length > 5 && (
                  <div style={{ textAlign: 'center', marginTop: '16px', marginBottom: '32px' }}>
                    <Link
                      href={`/prelims/pyq?q=${encodeURIComponent(searchQuery.trim())}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '13px 28px',
                        borderRadius: '14px',
                        background: 'var(--bg-card, rgba(15, 23, 42, 0.8))',
                        border: '1.5px solid var(--color-blue, #3b82f6)',
                        color: 'var(--color-blue, #3b82f6)',
                        fontWeight: 800,
                        fontSize: '0.94rem',
                        textDecoration: 'none',
                        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <span>View all {matchedPyqs.length} Solved Questions in PYQ Explorer</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                )}
              </div>
            ) : hasSearched ? (
              <div style={{
                textAlign: 'center',
                padding: '42px 20px',
                background: 'var(--bg-card, rgba(15, 23, 42, 0.6))',
                border: '1.5px dashed var(--border-color, rgba(255, 255, 255, 0.12))',
                borderRadius: '20px',
                color: 'var(--text-muted, #64748b)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📡</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary, #ffffff)' }}>
                  No direct question match found for &quot;{searchQuery}&quot;
                </h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.86rem', color: 'var(--text-secondary, #94a3b8)' }}>
                  Try searching for a subject like &quot;Indian Polity&quot;, &quot;Preamble&quot;, &quot;Monetary Policy&quot;, or part of a question statement.
                </p>
                <Link
                  href="/prelims/pyq"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--color-blue, #3b82f6)',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    textDecoration: 'none'
                  }}
                >
                  <span>Browse full 2,528+ question archive</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : null}
          </section>
        )}

        {/* ========================================================================= */}
        {/* DAILY PYQ STREAK HERO CARD (DAILY 10-QUESTION DISCIPLINE)                 */}
        {/* ========================================================================= */}
        <div style={{
          marginBottom: 'clamp(36px, 5vw, 52px)',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.09) 0%, rgba(239, 68, 68, 0.05) 50%, rgba(59, 130, 246, 0.06) 100%)',
          border: '1.5px solid rgba(245, 158, 11, 0.35)',
          borderRadius: '22px',
          padding: 'clamp(18px, 4vw, 24px) clamp(16px, 4vw, 28px)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.22)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Left Block: Flame Counter + Description */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flex: '1 1 260px', minWidth: 0, position: 'relative', zIndex: 1 }}>
            {/* Animated Flame Badge */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '68px',
              height: '68px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(239, 68, 68, 0.15) 100%)',
              border: '1.5px solid rgba(245, 158, 11, 0.45)',
              boxShadow: '0 6px 20px rgba(245, 158, 11, 0.18)',
              flexShrink: 0
            }}>
              <Flame size={28} style={{ color: '#f59e0b', filter: 'drop-shadow(0 2px 8px rgba(245, 158, 11, 0.6))' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#f59e0b', marginTop: '2px', letterSpacing: '-0.01em' }}>
                {ready ? streak.current || 0 : 0}d
              </span>
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.7rem',
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
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
                  Best: {ready ? streak.best || 0 : 0}d streak
                </span>
              </div>

              <h2 style={{ fontSize: 'clamp(1.12rem, 3.5vw, 1.35rem)', fontWeight: 900, margin: '0 0 6px 0', color: 'var(--text-primary, #ffffff)', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
                Daily 10-Question Prelims Streak
              </h2>

              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary, #94a3b8)', margin: 0, lineHeight: 1.55 }}>
                {isStreakCompletedToday
                  ? `Great job! You've logged today's 10-question drill. Current streak: ${streak.current} day${streak.current === 1 ? '' : 's'} (Best: ${streak.best}d). Tomorrow's drill unlocks at midnight.`
                  : '10 curated authentic UPSC questions across core subjects · 12 minutes · Build unbeatable problem-solving discipline.'}
              </p>
            </div>
          </div>

          {/* Right Action: CTA Button */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 220px', justifyContent: 'flex-end' }}>
            <Link
              href="/prelims/pyq/practice?drill=daily&mode=practice"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                maxWidth: '280px',
                gap: '8px',
                padding: '13px 20px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.9rem',
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
        <div style={{ marginBottom: 'clamp(40px, 6vw, 56px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(1.35rem, 4vw, 1.6rem)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>
                Questions by Subject
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
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

          <div className="home-compact-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '14px' 
          }}>
            {SUBJECTS.map((sub, idx) => {
              const IconComponent = sub.icon;
              return (
                <Link
                  key={idx}
                  href={`/prelims/pyq?subject=${encodeURIComponent(sub.subjectParam)}`}
                  className="home-compact-card"
                  style={{
                    textDecoration: 'none',
                    background: 'var(--bg-card, rgba(15, 23, 42, 0.6))',
                    border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                    borderRadius: '14px',
                    padding: '15px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div className="home-compact-card__icon" style={{ 
                      width: '38px', 
                      height: '38px', 
                      borderRadius: '10px', 
                      background: sub.bg, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: sub.color,
                      flexShrink: 0
                    }}>
                      <IconComponent size={19} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div className="home-compact-card__title" style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25 }}>
                        {sub.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)', fontWeight: 600, marginTop: '2px' }}>
                        {sub.count} Questions
                      </div>
                    </div>
                  </div>

                  <div className="home-compact-card__arrow" style={{ color: 'var(--text-muted, #64748b)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <ArrowRight size={15} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: YEAR-WISE OFFICIAL PAPERS                                      */}
        {/* ========================================================================= */}
        <div style={{ marginBottom: 'clamp(44px, 6vw, 64px)' }}>
          <h2 style={{ fontSize: 'clamp(1.35rem, 4vw, 1.6rem)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Previous Years Official Papers
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
            Practice complete UPSC question papers from 2011 to 2025.
          </p>

          <div className="home-compact-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '14px' 
          }}>
            {YEAR_PAPERS.map((p, pidx) => (
              <Link 
                key={pidx} 
                href={`/prelims/pyq?exam=${encodeURIComponent(p.exam)}&year=${p.year}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="home-compact-card" style={{
                  background: 'var(--bg-card, rgba(15, 23, 42, 0.6))',
                  border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                  borderRadius: '16px',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
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
                  <div style={{ minWidth: 0 }}>
                    <div className="home-compact-card__title" style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '3px', lineHeight: 1.25 }}>
                      {p.label}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {p.sub}
                    </div>
                  </div>
                  <div className="home-compact-card__arrow" style={{ 
                    width: '30px', 
                    height: '30px', 
                    borderRadius: '8px', 
                    background: 'rgba(16, 185, 129, 0.1)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#10b981',
                    flexShrink: 0
                  }}>
                    <ArrowRight size={15} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: SPECIALIZED PRELIMS POWER ENGINES (NO DUPLICATES)              */}
        {/* ========================================================================= */}
        <div style={{ marginBottom: 'clamp(44px, 6vw, 64px)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-amber, #f59e0b)', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
            <Sparkles size={14} />
            <span>SPECIALIZED ENGINES</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.45rem, 4.5vw, 1.85rem)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Advanced Prelims Simulators
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: '0 0 22px 0' }}>
            Purpose-built tools for exam-hall pressure and spatial geography.
          </p>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', 
            gap: '20px' 
          }}>
            
            {/* Tool 1: Interactive Spatial Atlas */}
            <Link href="/atlas" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                background: 'var(--bg-card, rgba(15, 23, 42, 0.7))',
                border: '1.5px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                borderRadius: '24px',
                padding: 'clamp(20px, 4vw, 32px)',
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

                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
                    Interactive Maps & Atlas
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '20px' }}>
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
                padding: 'clamp(20px, 4vw, 32px)',
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

                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
                    Prelims Mock Simulator
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '20px' }}>
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
    </div>
  );
}
