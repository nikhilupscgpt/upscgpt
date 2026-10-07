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
    subjectParam: "Indian Polity",
    badge: "305 Qs Live",
    badgeColor: "#10b981",
    badgeBg: "rgba(16, 185, 129, 0.12)",
    icon: ShieldCheck,
    description: "Constitutional framework, Fundamental Rights, Parliament, Judiciary & Constitutional Bodies.",
    topics: [
      { name: "Preamble", param: "Preamble" },
      { name: "Fundamental Rights", param: "Fundamental Rights" },
      { name: "Directive Principles", param: "Directive Principles" },
      { name: "Judiciary", param: "Judiciary" },
      { name: "Parliament", param: "Parliament" },
      { name: "Local Bodies", param: "Local Bodies" }
    ],
    primaryCta: "Drill 305 Polity MCQs →"
  },
  {
    title: "Economy & Development",
    subjectParam: "Economy",
    badge: "304 Qs Live",
    badgeColor: "#3b82f6",
    badgeBg: "rgba(59, 130, 246, 0.12)",
    icon: Flame,
    description: "Monetary policy, fiscal budgets, banking & RBI, balance of payments, inflation & social development.",
    topics: [
      { name: "Banking & RBI", param: "Banking & RBI" },
      { name: "Basic Concepts", param: "Basic Economic Concepts" },
      { name: "Fiscal & Budget", param: "Fiscal Policy & Budget" },
      { name: "Inflation", param: "Inflation" },
      { name: "International Trade", param: "International Economic Organisations & Trade" },
      { name: "Capital Markets", param: "Capital Markets & Financial Instruments" }
    ],
    primaryCta: "Drill 304 Economy MCQs →"
  },
  {
    title: "Agriculture (CSE & IFS)",
    subjectParam: "Agriculture",
    badge: "62 Qs Live",
    badgeColor: "#10b981",
    badgeBg: "rgba(16, 185, 129, 0.12)",
    icon: Globe2,
    description: "High-yield CSE & IFS focus: Major crops, cropping patterns, micro-irrigation, MSP, and agricultural trade.",
    topics: [
      { name: "Major Crops", param: "Major Crops" },
      { name: "Agri Marketing", param: "Agricultural Marketing & Trade" },
      { name: "Cropping Systems", param: "Cropping Patterns & Systems" },
      { name: "Irrigation", param: "Irrigation & Water Management" },
      { name: "MSP & Pricing", param: "Agricultural Pricing & Procurement (MSP)" },
      { name: "Soil & Fertilizers", param: "Soil, Fertilizers & Farming Practices" }
    ],
    primaryCta: "Drill 62 Agriculture MCQs →"
  },
  {
    title: "Geography & Mapping",
    subjectParam: "Geography",
    badge: "329 Qs Live",
    badgeColor: "#0284c7",
    badgeBg: "rgba(2, 132, 199, 0.12)",
    icon: Globe2,
    description: "Indian physiography, river systems, climatology, geomorphology, oceanography and world map locations.",
    topics: [
      { name: "Rivers & Drainage", param: "Indian Physiography & Drainage" },
      { name: "Climatology", param: "Climatology" },
      { name: "Geomorphology", param: "Geomorphology" },
      { name: "World Places", param: "World Geography & Places" },
      { name: "Oceanography", param: "Oceanography" },
      { name: "Universe & Solar", param: "Universe & Solar System" }
    ],
    primaryCta: "Drill 329 Geography MCQs →"
  },
  {
    title: "Environment & Ecology",
    subjectParam: "Environment",
    badge: "202 Qs Live",
    badgeColor: "#10b981",
    badgeBg: "rgba(16, 185, 129, 0.12)",
    icon: Globe2,
    description: "Biodiversity conservation, climate change accords, ecosystems, pollution norms & environmental statutes.",
    topics: [
      { name: "Biodiversity", param: "Biodiversity & Conservation" },
      { name: "Climate Change", param: "Climate Change" },
      { name: "Ecosystems", param: "Ecology & Ecosystems" },
      { name: "Pollution", param: "Environmental Pollution" },
      { name: "Environmental Laws", param: "Environmental Laws, Policies & Institutions" }
    ],
    primaryCta: "Drill 202 Environment MCQs →"
  },
  {
    title: "Science & Technology",
    subjectParam: "Science & Technology",
    badge: "452 Qs Live",
    badgeColor: "#8b5cf6",
    badgeBg: "rgba(139, 92, 246, 0.12)",
    icon: Sparkles,
    description: "Biotechnology, genetics, space missions, health & diseases, nuclear energy, IT and basic sciences.",
    topics: [
      { name: "Biotech & Genetics", param: "Biotechnology & Genetics" },
      { name: "Health & Diseases", param: "Health, Diseases & Medicine" },
      { name: "Space Tech", param: "Space Technology" },
      { name: "Physics & Chemistry", param: "Physics" },
      { name: "IT & Computing", param: "IT, Communication & Computing" }
    ],
    primaryCta: "Drill 452 Sci-Tech MCQs →"
  },
  {
    title: "History & Art & Culture",
    subjectParam: "History",
    badge: "High-Yield Themes",
    badgeColor: "#8b5cf6",
    badgeBg: "rgba(139, 92, 246, 0.12)",
    icon: BookOpen,
    description: "Ancient Indus Valley, Buddhism & Jainism, temple architecture, and Modern Indian freedom struggle.",
    topics: [
      { name: "Indus Valley", param: "Indus Valley" },
      { name: "Buddhism & Jainism", param: "Buddhism" },
      { name: "Temple Architecture", param: "Architecture" },
      { name: "1857 Revolt", param: "1857" },
      { name: "National Movement", param: "National Movement" }
    ],
    primaryCta: "Drill History MCQs →"
  },
  {
    title: "CSAT (Paper II)",
    subjectParam: "CSAT",
    badge: "Qualifying Engine",
    badgeColor: "#ec4899",
    badgeBg: "rgba(236, 72, 153, 0.12)",
    icon: GraduationCap,
    description: "Precision practice for Reading Comprehension passages, analytical syllogisms, and basic numeracy.",
    topics: [
      { name: "Reading Comprehension", param: "Comprehension" },
      { name: "Syllogisms & Logic", param: "Reasoning" },
      { name: "Number Systems", param: "Numeracy" },
      { name: "Data Interpretation", param: "Data" }
    ],
    primaryCta: "Drill CSAT MCQs →"
  }
];

const YEAR_PAPERS = [
  { label: "UPSC CSE 2023", sub: "GS Paper 1 (Polity & GS)", exam: "UPSC CSE", year: 2023 },
  { label: "UPSC CSE 2022", sub: "GS Paper 1", exam: "UPSC CSE", year: 2022 },
  { label: "UPSC CSE 2021", sub: "GS Paper 1", exam: "UPSC CSE", year: 2021 },
  { label: "UPSC CSE 2020", sub: "GS Paper 1", exam: "UPSC CSE", year: 2020 },
  { label: "UPSC CDS 2023", sub: "Polity & GK Paper", exam: "CDS", year: 2023 },
  { label: "UPSC CDS 2022", sub: "Polity & GK Paper", exam: "CDS", year: 2022 }
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
        {/* SECTION 1: TOPIC-WISE QUESTION BANK (THE CORE SUBJECT MATRIX)             */}
        {/* ========================================================================= */}
        <div style={{ marginBottom: '64px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-blue, #3b82f6)', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                <Layers size={14} />
                <span>PRACTICE MODE 1</span>
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>
                Topic-Wise Question Bank
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '4px', margin: '4px 0 0 0' }}>
                Drill questions chapter-by-chapter. Select a subject or jump straight into a micro-theme.
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
              <span>Open Full PYQ Explorer</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', 
            gap: '24px' 
          }}>
            {SUBJECTS.map((sub, idx) => {
              const IconComponent = sub.icon;
              return (
                <div 
                  key={idx} 
                  style={{
                    background: 'var(--bg-card, rgba(15, 23, 42, 0.6))',
                    border: '1.5px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                    borderRadius: '20px',
                    padding: '26px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'border-color 0.2s ease, transform 0.2s ease',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-hover, rgba(255, 255, 255, 0.2))';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color, rgba(255, 255, 255, 0.08))';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ 
                          width: '38px', 
                          height: '38px', 
                          borderRadius: '10px', 
                          background: sub.badgeBg, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: sub.badgeColor
                        }}>
                          <IconComponent size={20} />
                        </div>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                          {sub.title}
                        </h4>
                      </div>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '4px 9px',
                        borderRadius: '12px',
                        background: sub.badgeBg,
                        color: sub.badgeColor
                      }}>
                        {sub.badge}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
                      {sub.description}
                    </p>

                    {/* Clickable Topic Chips */}
                    <div style={{ marginBottom: '22px' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                        High-Yield Chapters (Click to drill):
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {sub.topics.map((t, tidx) => (
                          <Link
                            key={tidx}
                            href={`/prelims/pyq?subject=${encodeURIComponent(sub.subjectParam)}&topic=${encodeURIComponent(t.param)}`}
                            style={{
                              textDecoration: 'none',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              padding: '4px 10px',
                              borderRadius: '8px',
                              background: 'var(--bg-input, rgba(255, 255, 255, 0.05))',
                              color: 'var(--text-secondary, #94a3b8)',
                              border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
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
                            {t.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Primary CTA */}
                  <Link 
                    href={`/prelims/pyq?subject=${encodeURIComponent(sub.subjectParam)}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'var(--bg-input, rgba(255, 255, 255, 0.04))',
                      border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                      color: 'var(--color-blue, #3b82f6)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'var(--btn-primary-bg, #3b82f6)';
                      e.currentTarget.style.color = 'var(--btn-primary-text, #ffffff)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'var(--bg-input, rgba(255, 255, 255, 0.04))';
                      e.currentTarget.style.color = 'var(--color-blue, #3b82f6)';
                    }}
                  >
                    <span>{sub.primaryCta}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: YEAR-WISE OFFICIAL PAPERS (ACTUAL EXAM SEQUENCE)               */}
        {/* ========================================================================= */}
        <div style={{ marginBottom: '64px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-emerald, #10b981)', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
            <Calendar size={14} />
            <span>PRACTICE MODE 2</span>
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Solve by Actual Exam Year
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: '0 0 24px 0' }}>
            Experience the real exam question sequence for full paper revision.
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
                      Spatial Engine
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
                    Interactive Spatial Atlas
                  </h3>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '20px' }}>
                    Master the 5–10 map-based Prelims questions every year. Interactive 2D/3D maps covering global choke-points, conflict corridors (Red Sea, Sahel, West Asia), and Indian national parks.
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
                  <span>Launch Spatial Atlas</span>
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

        {/* ========================================================================= */}
        {/* SECTION 4: WHY PRELIMSGPT? (3 KEY STUDY PRINCIPLES)                       */}
        {/* ========================================================================= */}
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
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Zero Distractions</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Stripped of daily news streaks, off-season Mains evaluators, and complex graphs. Strictly focused on Prelims question solving.
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <CheckCircle2 size={18} style={{ color: 'var(--color-emerald, #10b981)' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Active Recall UI</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Questions are collapsed by default. Answers and explanations remain hidden until you attempt the MCQ or choose to reveal it.
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <CheckCircle2 size={18} style={{ color: 'var(--color-amber, #f59e0b)' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Study-Grade Themes</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
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
            upsc<span style={{ color: 'var(--color-blue, #3b82f6)' }}>gpt</span>
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            · PrelimsGPT Engine Active (MainsGPT Coming Post-Prelims)
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
