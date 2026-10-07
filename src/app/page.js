"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  BookOpen, 
  Target, 
  Globe2, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Flame, 
  ShieldCheck, 
  Compass, 
  GraduationCap
} from 'lucide-react';

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
    title: "Indian Polity & Governance",
    badge: "305 Qs Live",
    badgeColor: "#10b981",
    badgeBg: "rgba(16, 185, 129, 0.12)",
    icon: ShieldCheck,
    description: "Constitutional framework, Fundamental Rights, Parliament, Judiciary & Constitutional Bodies.",
    topics: ["Preamble", "Fundamental Rights", "Directive Principles", "Judiciary", "Local Bodies"],
    link: "/prelims/pyq?topic=ALL"
  },
  {
    title: "Economy & Development",
    badge: "Ingestion Ready",
    badgeColor: "#f59e0b",
    badgeBg: "rgba(245, 158, 11, 0.12)",
    icon: Flame,
    description: "Monetary policy, fiscal budgets, banking sector, balance of payments, inflation & social development.",
    topics: ["Monetary Policy", "Fiscal Policy", "Banking & Finance", "External Sector", "Poverty & Schemes"],
    link: "/prelims/pyq?q=Economy"
  },
  {
    title: "Geography & Mapping",
    badge: "Atlas Integrated",
    badgeColor: "#3b82f6",
    badgeBg: "rgba(59, 130, 246, 0.12)",
    icon: Compass,
    description: "Interactive location engine for world straits, conflict zones, Indian drainage systems & mountain passes.",
    topics: ["World Straits", "West Asia Theatres", "Himalayan Rivers", "National Parks", "Resource Belts"],
    link: "/atlas"
  },
  {
    title: "Environment & Ecology",
    badge: "Curated PYQs",
    badgeColor: "#10b981",
    badgeBg: "rgba(16, 185, 129, 0.12)",
    icon: Globe2,
    description: "Biodiversity conservation, climate agreements, wildlife protection laws, and IUCN species status.",
    topics: ["Protected Areas", "Wildlife Protection Act", "Climate Summits", "Pollution Norms", "Ecosystems"],
    link: "/prelims/pyq?q=Environment"
  },
  {
    title: "History & Art & Culture",
    badge: "High-Yield Themes",
    badgeColor: "#8b5cf6",
    badgeBg: "rgba(139, 92, 246, 0.12)",
    icon: BookOpen,
    description: "Ancient Indus Valley, Buddhism & Jainism, temple architecture, and Modern Indian freedom struggle.",
    topics: ["Indus Valley", "Buddhism & Jainism", "Mughal Architecture", "Revolt of 1857", "National Movement"],
    link: "/prelims/pyq?q=History"
  },
  {
    title: "CSAT (Paper II)",
    badge: "Qualifying Engine",
    badgeColor: "#ec4899",
    badgeBg: "rgba(236, 72, 153, 0.12)",
    icon: GraduationCap,
    description: "Precision practice for Reading Comprehension passages, analytical syllogisms, and basic numeracy.",
    topics: ["Reading Comprehension", "Syllogisms & Logic", "Number Systems", "Percentages & Ratios", "Data Interpretation"],
    link: "/prelims/mocks"
  }
];

export default function PrelimsGPTCommandCenter() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

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
        <div style={{ textAlign: 'center', marginBottom: '48px', maxWidth: '860px', margin: '0 auto 48px' }}>
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
            <span>UPSC CSE 2025–2026 PRELIMS COMMAND CENTER</span>
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

          {/* SEARCH BAR (Prelims RAG Engine) */}
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
                placeholder="Search any PYQ topic (e.g. Fundamental Rights, Money Bill, Inflation)..."
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

        {/* 3 CORE PILLARS (Primary Launch Deck) */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '24px', 
          marginBottom: '56px' 
        }}>
          
          {/* Pillar 1: Topic-Wise PYQ Bank */}
          <Link href="/prelims/pyq" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              background: 'var(--bg-card, rgba(15, 23, 42, 0.7))',
              border: '1.5px solid var(--border-color, rgba(255, 255, 255, 0.08))',
              borderRadius: '24px',
              padding: '32px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'var(--color-blue, #3b82f6)';
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
                    background: 'rgba(59, 130, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-blue, #3b82f6)'
                  }}>
                    <BookOpen size={26} />
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: 'rgba(16, 185, 129, 0.12)',
                    color: '#10b981'
                  }}>
                    305+ Verified MCQs
                  </span>
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  Topic-Wise PYQ Explorer
                </h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '20px' }}>
                  Drill down into 44+ granular micro-themes. Collapsible cards with active recall mode (hidden answers until attempted), official UPSC rationale, and full Sepia reader support.
                </p>
              </div>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                fontWeight: 700, 
                fontSize: '0.9rem', 
                color: 'var(--color-blue, #3b82f6)' 
              }}>
                <span>Launch PYQ Bank</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </Link>

          {/* Pillar 2: Mock Tests */}
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
              transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
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
                    Exam Simulator
                  </span>
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  Prelims Mock Simulator
                </h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '20px' }}>
                  Simulate the actual UPSC Prelims battleground. Strict -0.33 negative marking, countdown timer, question palette navigation, and real-time sectional cutoff scorecards.
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

          {/* Pillar 3: Mapping Atlas */}
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
              transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
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
                    Spatial Engine
                  </span>
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  Interactive Spatial Atlas
                </h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '20px' }}>
                  Master the 5–10 map-based Prelims questions every year. Interactive 2D/3D maps covering global choke-points, conflict corridors (Red Sea, Sahel), and Indian national parks.
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
                <span>Explore Atlas Maps</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </Link>

        </div>

        {/* SUBJECT COVERAGE MATRIX */}
        <div style={{ marginBottom: '56px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                Prelims Subject Deck
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Complete syllabus coverage with source-faithful classification.
              </p>
            </div>
            <Link 
              href="/prelims/pyq" 
              style={{ 
                fontSize: '0.88rem', 
                fontWeight: 700, 
                color: 'var(--color-blue, #3b82f6)', 
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>View All 44+ Micro-Themes</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '20px' 
          }}>
            {SUBJECTS.map((sub, idx) => {
              const IconComponent = sub.icon;
              return (
                <Link key={idx} href={sub.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{
                    background: 'var(--bg-card, rgba(15, 23, 42, 0.6))',
                    border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                    borderRadius: '18px',
                    padding: '24px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-hover, rgba(255, 255, 255, 0.2))';
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(15, 23, 42, 0.85))';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color, rgba(255, 255, 255, 0.08))';
                    e.currentTarget.style.backgroundColor = 'var(--bg-card, rgba(15, 23, 42, 0.6))';
                  }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <IconComponent size={20} style={{ color: sub.badgeColor }} />
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {sub.title}
                          </h4>
                        </div>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          background: sub.badgeBg,
                          color: sub.badgeColor
                        }}>
                          {sub.badge}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                        {sub.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {sub.topics.map((t, tidx) => (
                        <span 
                          key={tidx}
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '8px',
                            background: 'var(--bg-input, rgba(255, 255, 255, 0.04))',
                            color: 'var(--text-muted, #94a3b8)',
                            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.05))'
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* WHY PRELIMSGPT? (3 Principles) */}
        <div style={{
          background: 'var(--bg-card, rgba(15, 23, 42, 0.4))',
          border: '1px solid var(--border-color, rgba(255, 255, 255, 0.06))',
          borderRadius: '24px',
          padding: '36px 32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '28px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <CheckCircle2 size={18} style={{ color: 'var(--color-blue, #3b82f6)' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Zero Distractions</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Stripped of daily news streaks, off-season Mains evaluators, and complex graphs. Strictly focused on Prelims question solving.
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <CheckCircle2 size={18} style={{ color: 'var(--color-emerald, #10b981)' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Active Recall UI</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Questions are collapsed by default. Answers and explanations remain hidden until you attempt the MCQ or choose to reveal it.
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <CheckCircle2 size={18} style={{ color: 'var(--color-amber, #f59e0b)' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Study-Grade Themes</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Full support for OLED Dark Mode and warm Sepia parchment mode for sustained reading sessions without eye strain.
            </p>
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
            prelims<span style={{ color: 'var(--color-blue, #3b82f6)' }}>gpt</span>
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            · Built for serious UPSC CSE aspirants
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
