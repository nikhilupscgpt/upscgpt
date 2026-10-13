'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Flame,
  Target,
  BookOpen,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Clock,
  Layers,
  FileQuestion,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { usePyqStore } from '@/app/prelims/pyq/pyqStore';
import '@/app/prelims/pyq/pyq-ui.css';

export default function DashboardPrelimsClient() {
  const { data: session } = useSession();
  const router = useRouter();

  const [backendData, setBackendData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Read live local Prelims store
  const {
    attempts,
    bookmarks,
    mistakes,
    streak,
    isStreakCompletedToday
  } = usePyqStore();

  useEffect(() => {
    let isMounted = true;
    fetch('/api/user/prelims-dashboard')
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        if (data.success) {
          setBackendData(data);
        }
      })
      .catch(err => {
        console.error('Failed to load Prelims dashboard metrics:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  // Compute live accuracy, counts, and subject breakdowns
  const metrics = useMemo(() => {
    const attemptEntries = Object.entries(attempts);
    const totalSolved = attemptEntries.length;
    let correctCount = 0;

    attemptEntries.forEach(([_, att]) => {
      if (att && att.ok) correctCount++;
    });

    const accuracy = totalSolved > 0 ? Math.round((correctCount / totalSolved) * 100) : 0;
    const mistakeCount = Object.keys(mistakes).length;
    const bookmarkCount = Object.keys(bookmarks).length;
    const totalQuestions = backendData?.totalQuestions || 2528;
    const solvedPercentage = Math.round((totalSolved / totalQuestions) * 100);

    // Subject Breakdown
    const qSubjectMap = backendData?.questionSubjectMap || {};
    const subjectStatsMap = {};

    (backendData?.subjects || []).forEach(sub => {
      subjectStatsMap[sub.name] = {
        name: sub.name,
        short: sub.short,
        icon: sub.icon,
        color: sub.color,
        totalCount: sub.totalCount,
        solvedCount: 0,
        correctCount: 0,
        mistakeCount: 0,
      };
    });

    // Populate user stats into subjects
    attemptEntries.forEach(([qId, att]) => {
      const subj = qSubjectMap[qId];
      if (subj && subjectStatsMap[subj]) {
        subjectStatsMap[subj].solvedCount++;
        if (att && att.ok) {
          subjectStatsMap[subj].correctCount++;
        }
      }
    });

    // Count mistakes per subject
    Object.keys(mistakes).forEach(qId => {
      const subj = qSubjectMap[qId];
      if (subj && subjectStatsMap[subj]) {
        subjectStatsMap[subj].mistakeCount++;
      }
    });

    const subjectList = Object.values(subjectStatsMap).map(s => {
      const acc = s.solvedCount > 0 ? Math.round((s.correctCount / s.solvedCount) * 100) : 0;
      const progress = s.totalCount > 0 ? Math.round((s.solvedCount / s.totalCount) * 100) : 0;
      return {
        ...s,
        accuracy: acc,
        progress,
      };
    });

    // Identify Weak Areas (Subjects with >= 5 solved questions and < 65% accuracy, or highest mistake count)
    const weakSubjects = subjectList
      .filter(s => s.solvedCount >= 3 && s.accuracy < 65)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);

    return {
      totalSolved,
      correctCount,
      accuracy,
      mistakeCount,
      bookmarkCount,
      totalQuestions,
      solvedPercentage,
      subjectList,
      weakSubjects,
    };
  }, [attempts, mistakes, bookmarks, backendData]);

  const mistakeIds = Object.keys(mistakes).slice(0, 30).join(',');

  return (
    <div className="pq-root" style={{ minHeight: '100vh', background: 'var(--bg-primary, #090d16)', padding: '32px 20px 80px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        
        {/* Aspirant Header */}
        <header style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.25)', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              <ShieldCheck size={14} /> Prelims Mission Control
            </div>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, color: 'var(--text-primary, #f8fafc)', margin: 0, letterSpacing: '-0.02em' }}>
              Welcome back, {session?.user?.name ? session.user.name.split(' ')[0] : 'Aspirant'}
            </h1>
            <p style={{ margin: '6px 0 0', color: 'var(--text-secondary, #94a3b8)', fontSize: '0.9rem' }}>
              Real-time Prelims tracking across all 2,528 authentic UPSC & CDS questions.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              href="/prelims/pyq"
              className="pq-btn"
              style={{ textDecoration: 'none', padding: '10px 18px', fontWeight: 700, fontSize: '0.85rem' }}
            >
              <FileQuestion size={16} /> PYQ Explorer
            </Link>
            <Link
              href="/prelims/mocks"
              className="pq-btn pq-btn-primary"
              style={{ textDecoration: 'none', padding: '10px 18px', fontWeight: 800, fontSize: '0.85rem' }}
            >
              <Award size={16} /> Full Mock Tests
            </Link>
          </div>
        </header>

        {/* 1. Daily 10-Question Streak Hero Card */}
        <div className="pq-streak-hero-card" style={{ marginBottom: '28px' }}>
          <div className="pq-shc-left">
            <div className="pq-shc-flame-box">
              <Flame size={28} className="pq-flame-animated" />
              <span className="pq-shc-days">{streak.current || 0}d</span>
            </div>
            <div className="pq-shc-info">
              <span className={`pq-shc-tag ${isStreakCompletedToday ? 'is-done' : ''}`}>
                {isStreakCompletedToday ? '✓ TODAY COMPLETED' : 'PENDING FOR TODAY'}
              </span>
              <h2 className="pq-shc-title" style={{ fontSize: '1.2rem', margin: '4px 0 2px' }}>
                Daily 10-Question Prelims Streak
              </h2>
              <p className="pq-shc-sub" style={{ margin: 0 }}>
                {isStreakCompletedToday
                  ? `Great discipline! Current streak: ${streak.current} day${streak.current === 1 ? '' : 's'} (Best: ${streak.best || streak.current}d). Tomorrow's drill unlocks at midnight.`
                  : 'Maintain your test-taking muscle memory. 10 curated questions across core subjects.'}
              </p>
            </div>
          </div>
          <div className="pq-shc-action">
            <Link
              href="/prelims/pyq/practice?drill=daily&mode=practice"
              className="pq-btn pq-btn-primary pq-shc-btn"
              style={{ textDecoration: 'none', padding: '12px 22px', fontSize: '0.9rem' }}
            >
              <Flame size={16} />
              {isStreakCompletedToday ? "Review Today's Drill" : "▶ Start Today's Drill (10 Qs)"}
            </Link>
          </div>
        </div>

        {/* 2. Top KPI Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '28px' }}>
          
          {/* Card 1: Questions Attempted */}
          <div className="pq-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Questions Solved</span>
              <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '6px', borderRadius: '10px' }}>
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary, #f8fafc)', lineHeight: 1 }}>
              {metrics.totalSolved}
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #94a3b8)', fontWeight: 600, marginLeft: '6px' }}>/ {metrics.totalQuestions}</span>
            </div>
            {/* Progress Bar */}
            <div style={{ height: '7px', background: 'var(--border-color, rgba(255,255,255,0.08))', borderRadius: '999px', overflow: 'hidden', marginTop: '4px' }}>
              <div style={{ height: '100%', width: `${metrics.solvedPercentage}%`, background: 'linear-gradient(90deg, #3b82f6, #6366f1)', borderRadius: '999px' }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 700 }}>
              {metrics.solvedPercentage}% of UPSC Question Bank covered
            </span>
          </div>

          {/* Card 2: Overall Accuracy */}
          <div className="pq-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Accuracy Rate</span>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '6px', borderRadius: '10px' }}>
                <Target size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: metrics.accuracy >= 70 ? '#10b981' : metrics.accuracy >= 50 ? '#f59e0b' : '#f87171', lineHeight: 1 }}>
              {metrics.accuracy}%
            </div>
            <div style={{ height: '7px', background: 'var(--border-color, rgba(255,255,255,0.08))', borderRadius: '999px', overflow: 'hidden', marginTop: '4px' }}>
              <div style={{ height: '100%', width: `${metrics.accuracy}%`, background: metrics.accuracy >= 70 ? '#10b981' : '#f59e0b', borderRadius: '999px' }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)', fontWeight: 600 }}>
              {metrics.correctCount} correct out of {metrics.totalSolved} attempts
            </span>
          </div>

          {/* Card 3: Mistake Notebook */}
          <div className="pq-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mistake Notebook</span>
              <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '6px', borderRadius: '10px' }}>
                <RotateCcw size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>
              {metrics.mistakeCount}
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #94a3b8)', fontWeight: 600, marginLeft: '6px' }}>questions</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)', fontWeight: 600 }}>
              Automatically queued for re-attempt
            </span>
            {metrics.mistakeCount > 0 ? (
              <Link
                href={`/prelims/pyq/practice?ids=${mistakeIds}&mode=practice`}
                className="pq-btn"
                style={{ textDecoration: 'none', marginTop: '6px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)', textAlign: 'center', justifyContent: 'center' }}
              >
                Revise Mistakes Now →
              </Link>
            ) : (
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, marginTop: '6px' }}>✓ Zero pending mistakes</span>
            )}
          </div>

          {/* Card 4: Bookmarked Questions */}
          <div className="pq-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Saved Questions</span>
              <div style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', padding: '6px', borderRadius: '10px' }}>
                <Bookmark size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#8b5cf6', lineHeight: 1 }}>
              {metrics.bookmarkCount}
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #94a3b8)', fontWeight: 600, marginLeft: '6px' }}>starred</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)', fontWeight: 600 }}>
              High-yield questions marked for final review
            </span>
            <Link
              href="/prelims/pyq?show=MARKED"
              className="pq-btn"
              style={{ textDecoration: 'none', marginTop: '6px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 800, color: '#8b5cf6', borderColor: 'rgba(139, 92, 246, 0.4)', textAlign: 'center', justifyContent: 'center' }}
            >
              View Bookmarks →
            </Link>
          </div>

        </div>

        {/* 3. Quick Drill Launchpad */}
        <div className="pq-card" style={{ padding: '24px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} style={{ color: '#f59e0b' }} /> Quick Practice Launchpad
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)' }}>Instant timed practice modules</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '14px' }}>
            
            <Link
              href="/prelims/pyq/practice?mode=practice&n=20"
              className="pq-card"
              style={{ textDecoration: 'none', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.2s', borderColor: 'rgba(59, 130, 246, 0.3)' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)' }}>Quick 20-Q Drill</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>Mixed core subjects</div>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </Link>

            <Link
              href="/prelims/pyq/practice?pattern=new&mode=practice&n=20"
              className="pq-card"
              style={{ textDecoration: 'none', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.2s', borderColor: 'rgba(249, 115, 22, 0.3)' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#fb923c'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(249, 115, 22, 0.15)', color: '#fb923c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Flame size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)' }}>New Pattern Drill</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>Pairs & Statement I/II</div>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </Link>

            <Link
              href={metrics.mistakeCount > 0 ? `/prelims/pyq/practice?ids=${mistakeIds}&mode=practice` : '/prelims/pyq'}
              className="pq-card"
              style={{ textDecoration: 'none', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.2s', borderColor: 'rgba(245, 158, 11, 0.3)' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <RotateCcw size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)' }}>Revise Mistakes</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>{metrics.mistakeCount} queued questions</div>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </Link>

            <Link
              href="/prelims/mocks"
              className="pq-card"
              style={{ textDecoration: 'none', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.2s', borderColor: 'rgba(16, 185, 129, 0.3)' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Award size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)' }}>Full Mock Test</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>100-Q timed simulation</div>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </Link>

          </div>
        </div>

        {/* 4. Weak Areas / Red Zone Diagnostics (Conditional) */}
        {metrics.weakSubjects.length > 0 && (
          <div className="pq-card" style={{ padding: '24px', marginBottom: '32px', borderColor: 'rgba(239, 68, 68, 0.35)', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, transparent 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={20} color="#ef4444" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#f87171', margin: 0 }}>
                  Red Zone Diagnostics (Accuracy &lt; 65%)
                </h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>High-priority subjects needing reinforcement</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {metrics.weakSubjects.map(ws => (
                <div key={ws.name} style={{ background: 'var(--bg-secondary, #0f172a)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '14px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>{ws.icon}</span>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary, #f8fafc)' }}>{ws.name}</strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 700, marginTop: '4px' }}>
                      {ws.accuracy}% Accuracy ({ws.correctCount}/{ws.solvedCount} correct)
                    </div>
                  </div>
                  <Link
                    href={`/prelims/pyq/practice?subject=${encodeURIComponent(ws.name)}&mode=practice&n=15`}
                    className="pq-btn"
                    style={{ textDecoration: 'none', padding: '8px 14px', fontSize: '0.75rem', fontWeight: 800, borderColor: '#ef4444', color: '#f87171' }}
                  >
                    Drill 15 Qs →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Subject-Wise Mastery Breakdown */}
        <section style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary, #f8fafc)', margin: 0 }}>
                Subject Mastery Grid
              </h2>
              <p style={{ margin: '4px 0 0', color: 'var(--text-secondary, #94a3b8)', fontSize: '0.85rem' }}>
                Track your syllabus coverage across all 10 canonical Prelims subjects.
              </p>
            </div>
            <Link
              href="/prelims/pyq"
              style={{ fontSize: '0.85rem', fontWeight: 700, color: '#3b82f6', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              Browse Full Question Bank <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {metrics.subjectList.map(subj => {
              const hasAttempts = subj.solvedCount > 0;
              return (
                <div
                  key={subj.name}
                  className="pq-card"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                    transition: 'all 0.2s',
                    borderColor: hasAttempts ? 'var(--border-color)' : 'rgba(255,255,255,0.05)'
                  }}
                >
                  <div>
                    {/* Header: Icon, Name, Accuracy Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.4rem' }}>{subj.icon}</span>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)' }}>
                            {subj.name}
                          </h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>
                            {subj.totalCount} authentic PYQs
                          </span>
                        </div>
                      </div>

                      {hasAttempts && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '999px',
                            background: subj.accuracy >= 70 ? 'rgba(16, 185, 129, 0.15)' : subj.accuracy >= 50 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: subj.accuracy >= 70 ? '#10b981' : subj.accuracy >= 50 ? '#f59e0b' : '#f87171',
                            border: `1px solid ${subj.accuracy >= 70 ? 'rgba(16, 185, 129, 0.3)' : subj.accuracy >= 50 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                          }}
                        >
                          {subj.accuracy}% Acc
                        </span>
                      )}
                    </div>

                    {/* Progress Bar & Solved ratio */}
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', marginBottom: '6px' }}>
                        <span>Progress</span>
                        <span>{subj.solvedCount} / {subj.totalCount} ({subj.progress}%)</span>
                      </div>
                      <div style={{ height: '6px', background: 'var(--border-color, rgba(255,255,255,0.08))', borderRadius: '999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${subj.progress}%`,
                            background: subj.accuracy >= 70 ? '#10b981' : subj.accuracy >= 50 ? '#3b82f6' : '#f59e0b',
                            borderRadius: '999px',
                            transition: 'width 0.4s ease'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color, rgba(255,255,255,0.06))' }}>
                    <Link
                      href={`/prelims/pyq/practice?subject=${encodeURIComponent(subj.name)}&mode=practice&n=20`}
                      className="pq-btn pq-btn-primary"
                      style={{
                        textDecoration: 'none',
                        flex: 1,
                        padding: '8px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Play size={12} fill="currentColor" /> Practice 20
                    </Link>

                    <Link
                      href={`/prelims/pyq?subject=${encodeURIComponent(subj.name)}`}
                      className="pq-btn"
                      style={{
                        textDecoration: 'none',
                        padding: '8px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}
                      title="Browse all questions"
                    >
                      Browse
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 6. Recent Mock Exam & Test Attempts */}
        {backendData?.recentAttempts && backendData.recentAttempts.length > 0 && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary, #f8fafc)', margin: 0 }}>
                Recent Exam & Drill History
              </h3>
              <Link href="/prelims/mocks" style={{ fontSize: '0.8rem', color: '#3b82f6', textDecoration: 'none', fontWeight: 700 }}>
                View All Mocks →
              </Link>
            </div>

            <div className="pq-card" style={{ padding: '0', overflow: 'hidden' }}>
              {backendData.recentAttempts.map((att, idx) => (
                <div
                  key={att.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderBottom: idx < backendData.recentAttempts.length - 1 ? '1px solid var(--border-color)' : 'none',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary, #f8fafc)', display: 'block' }}>
                      {att.title}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>
                      {new Date(att.startedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} · {att.mode}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: att.score !== null ? '#10b981' : 'var(--text-primary)' }}>
                        {att.score !== null ? `${att.score}%` : `${att.totalAnswered} Qs Answered`}
                      </span>
                    </div>
                    <Link
                      href={`/prelims/result/${att.id}`}
                      className="pq-btn"
                      style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700 }}
                    >
                      View Result
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
