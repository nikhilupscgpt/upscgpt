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
  Zap,
  Sliders,
  Calendar,
  Compass,
  Check
} from 'lucide-react';
import { usePyqStore } from '@/app/prelims/pyq/pyqStore';
import StreakCalendar from '@/components/dashboard/StreakCalendar';
import SubjectPriorityModal from '@/components/dashboard/SubjectPriorityModal';
import { initMobileNativeUI } from '@/lib/capacitorBridge';
import '@/app/prelims/pyq/pyq-ui.css';

export default function DashboardPrelimsClient() {
  const { data: session } = useSession();
  const router = useRouter();

  const [backendData, setBackendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);
  const [isLaunchingDrill, setIsLaunchingDrill] = useState(false);

  // Read live local Prelims store
  const {
    attempts,
    bookmarks,
    mistakes,
    streak,
    activityMap,
    preferences,
    updatePreferences,
    isStreakCompletedToday
  } = usePyqStore();

  useEffect(() => {
    initMobileNativeUI();
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

  // Today string YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
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

    // Identify Weak Areas (Subjects with >= 3 solved questions and < 65% accuracy)
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

  // Dynamic Exam target calculations
  const { daysRemaining, dailyTargetQs, unattemptedCount } = useMemo(() => {
    const targetDate = new Date(preferences?.targetDate || '2027-05-01');
    const now = new Date();
    const diff = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
    const days = Math.max(1, diff);

    const total = metrics.totalQuestions || 2528;
    const unattempted = Math.max(0, total - metrics.totalSolved);
    const calculated = Math.ceil(unattempted / days);
    const quota = Math.min(Math.max(calculated || 13, 5), 35);

    return {
      daysRemaining: days,
      dailyTargetQs: quota,
      unattemptedCount: unattempted,
    };
  }, [metrics.totalQuestions, metrics.totalSolved, preferences?.targetDate]);

  const mistakeIds = Object.keys(mistakes).slice(0, 30).join(',');
  const focusSubjects = preferences?.focusSubjects || ['Indian Polity', 'Economy'];

  // Start today's adaptive drill
  const handleStartDrill = async () => {
    setIsLaunchingDrill(true);
    try {
      const res = await fetch('/api/pyq/daily-drill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptedIds: Object.keys(attempts),
          focusSubjects,
          targetCount: dailyTargetQs,
        }),
      });
      const data = await res.json();
      if (data?.questionIds?.length > 0) {
        router.push(`/prelims/pyq/practice?ids=${data.questionIds.join(',')}&drill=daily&mode=practice`);
      } else {
        router.push(`/prelims/pyq/practice?drill=daily&mode=practice&n=${dailyTargetQs}`);
      }
    } catch (e) {
      console.error('Failed to generate daily drill:', e);
      router.push(`/prelims/pyq/practice?drill=daily&mode=practice&n=${dailyTargetQs}`);
    } finally {
      setIsLaunchingDrill(false);
    }
  };

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
              Real-time Prelims tracking across all 2,528 authentic UPSC & CDS questions. Target: 1st May 2027 completion.
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

        {/* 1. Dynamic Adaptive Daily Streak Hero */}
        <div className="pq-streak-hero-card" style={{ marginBottom: '28px' }}>
          <div className="pq-shc-left">
            <div className="pq-shc-flame-box">
              <Flame size={28} className="pq-flame-animated" />
              <span className="pq-shc-days">{streak.current || 0}d</span>
            </div>
            <div className="pq-shc-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className={`pq-shc-tag ${isStreakCompletedToday ? 'is-done' : ''}`}>
                  {isStreakCompletedToday ? '✓ TODAY COMPLETED' : 'PENDING FOR TODAY'}
                </span>
                <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary, #94a3b8)', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  📅 {daysRemaining} days to 1 May 2027
                </span>
              </div>

              <h2 className="pq-shc-title" style={{ fontSize: '1.25rem', margin: '4px 0 4px', color: 'var(--text-primary, #f8fafc)' }}>
                Adaptive Prelims Streak: <span style={{ color: '#fb923c' }}>{dailyTargetQs} Questions Today</span>
              </h2>

              <p className="pq-shc-sub" style={{ margin: '0 0 8px', fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.4 }}>
                {isStreakCompletedToday
                  ? `Great discipline! Current streak: ${streak.current} day${streak.current === 1 ? '' : 's'} (Best: ${streak.best || streak.current}d). Next scheduled drill unlocks tomorrow.`
                  : `Scaled to complete all 2,528 UPSC PYQs by May 1, 2027 (allowing 22 days of mock revisions before Prelims on May 23).`}
              </p>

              {/* Priority Subjects Pills & Adjustment */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>
                  Focus:
                </span>
                {focusSubjects.map(sub => (
                  <span
                    key={sub}
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: '#60a5fa',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      padding: '2px 8px',
                      borderRadius: '999px',
                    }}
                  >
                    ★ {sub}
                  </span>
                ))}
                <button
                  type="button"
                  onClick={() => setIsPriorityModalOpen(true)}
                  style={{
                    background: 'transparent',
                    border: '1px dashed rgba(255,255,255,0.2)',
                    color: 'var(--text-secondary, #94a3b8)',
                    borderRadius: '999px',
                    padding: '2px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#3b82f6'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'var(--text-secondary, #94a3b8)'; }}
                >
                  <Sliders size={12} /> Adjust Focus
                </button>
              </div>

            </div>
          </div>

          <div className="pq-shc-action" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
            <button
              type="button"
              onClick={handleStartDrill}
              disabled={isLaunchingDrill}
              className="pq-btn pq-btn-primary pq-shc-btn"
              style={{
                textDecoration: 'none',
                padding: '12px 24px',
                fontSize: '0.92rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <Flame size={18} />
              {isLaunchingDrill
                ? 'Generating Custom Set...'
                : isStreakCompletedToday
                ? `Drill Again (${dailyTargetQs} Qs)`
                : `▶ Start Today's Drill (${dailyTargetQs} Qs)`}
            </button>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>
              60% Focus Subjects · 40% Broad Syllabus
            </span>
          </div>
        </div>

        {/* 2. Top KPI Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '28px' }}>
          
          {/* Card 1: Questions Solved */}
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
              {metrics.solvedPercentage}% of UPSC Question Bank covered ({unattemptedCount} left)
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

        {/* 3. Main Dashboard 2-Column Split: Calendar & Tools (Left) + Subject Progress (Right) */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginBottom: '32px', alignItems: 'flex-start' }}>
          
          {/* Left Column: Calendar & Launchers */}
          <div style={{ flex: '1 1 380px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Interactive Streak Calendar */}
            <StreakCalendar
              streak={streak}
              activityMap={activityMap}
              todayStr={todayStr}
            />

            {/* Quick Drill Launchpad */}
            <div className="pq-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={16} style={{ color: '#f59e0b' }} /> Quick Practice Launchpad
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #94a3b8)' }}>Instant modes</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link
                  href="/prelims/pyq/practice?mode=practice&n=20"
                  className="pq-card"
                  style={{ textDecoration: 'none', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.15s', borderColor: 'rgba(59, 130, 246, 0.25)' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#3b82f6'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.25)'; }}
                >
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Zap size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)' }}>Quick 20-Q Drill</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #94a3b8)' }}>Mixed core subjects</div>
                  </div>
                  <ChevronRight size={14} color="var(--text-muted)" />
                </Link>

                <Link
                  href="/prelims/pyq/practice?pattern=new&mode=practice&n=20"
                  className="pq-card"
                  style={{ textDecoration: 'none', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.15s', borderColor: 'rgba(249, 115, 22, 0.25)' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#fb923c'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.25)'; }}
                >
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(249, 115, 22, 0.15)', color: '#fb923c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Flame size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)' }}>New Pattern Drill</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #94a3b8)' }}>Pairs & Statement I/II</div>
                  </div>
                  <ChevronRight size={14} color="var(--text-muted)" />
                </Link>

                <Link
                  href={metrics.mistakeCount > 0 ? `/prelims/pyq/practice?ids=${mistakeIds}&mode=practice` : '/prelims/pyq'}
                  className="pq-card"
                  style={{ textDecoration: 'none', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.15s', borderColor: 'rgba(245, 158, 11, 0.25)' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#f59e0b'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.25)'; }}
                >
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <RotateCcw size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)' }}>Revise Mistakes</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #94a3b8)' }}>{metrics.mistakeCount} queued questions</div>
                  </div>
                  <ChevronRight size={14} color="var(--text-muted)" />
                </Link>

                <Link
                  href="/prelims/mocks"
                  className="pq-card"
                  style={{ textDecoration: 'none', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.15s', borderColor: 'rgba(16, 185, 129, 0.25)' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#10b981'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.25)'; }}
                >
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Award size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)' }}>Full Mock Test</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #94a3b8)' }}>100-Q timed simulation</div>
                  </div>
                  <ChevronRight size={14} color="var(--text-muted)" />
                </Link>
              </div>
            </div>

            {/* Red Zone Diagnostics (if any weak subjects) */}
            {metrics.weakSubjects.length > 0 && (
              <div className="pq-card" style={{ padding: '20px', borderColor: 'rgba(239, 68, 68, 0.35)', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, transparent 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <AlertCircle size={18} color="#ef4444" />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#f87171', margin: 0 }}>
                    Red Zone Diagnostics (&lt; 65% Acc)
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {metrics.weakSubjects.map(ws => (
                    <div key={ws.name} style={{ background: 'var(--bg-secondary, #0f172a)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{ws.icon}</span>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary, #f8fafc)' }}>{ws.name}</strong>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 700, marginTop: '2px' }}>
                          {ws.accuracy}% Accuracy ({ws.correctCount}/{ws.solvedCount} correct)
                        </div>
                      </div>
                      <Link
                        href={`/prelims/pyq/practice?subject=${encodeURIComponent(ws.name)}&mode=practice&n=15`}
                        className="pq-btn"
                        style={{ textDecoration: 'none', padding: '6px 10px', fontSize: '0.72rem', fontWeight: 800, borderColor: '#ef4444', color: '#f87171' }}
                      >
                        Drill 15 Qs →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Compact Subject Progress List */}
          <div style={{ flex: '1 1 540px', minWidth: '320px' }}>
            <div className="pq-card" style={{ padding: '24px' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                    <Compass size={14} /> Subject Syllabus Mastery
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary, #f8fafc)', margin: 0 }}>
                    Prelims Subject Progress
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    Track coverage across all 10 canonical subjects ({metrics.totalQuestions} authentic UPSC questions)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPriorityModalOpen(true)}
                  className="pq-btn"
                  style={{ padding: '7px 12px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Sliders size={14} /> Set Priorities
                </button>
              </div>

              {/* Subject Progress Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {metrics.subjectList.map(subj => {
                  const isFocus = focusSubjects.includes(subj.name);
                  
                  return (
                    <div
                      key={subj.name}
                      style={{
                        background: 'var(--bg-secondary, rgba(255,255,255,0.02))',
                        border: isFocus
                          ? '1px solid rgba(59, 130, 246, 0.35)'
                          : '1px solid var(--border-color, rgba(255,255,255,0.06))',
                        borderRadius: '14px',
                        padding: '14px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {/* Row 1: Subject Info & Counts */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{subj.icon}</span>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Link
                                href={`/prelims/pyq?subject=${encodeURIComponent(subj.name)}`}
                                style={{
                                  fontSize: '0.92rem',
                                  fontWeight: 800,
                                  color: 'var(--text-primary, #f8fafc)',
                                  textDecoration: 'none',
                                }}
                                onMouseOver={e => { e.currentTarget.style.color = '#3b82f6'; }}
                                onMouseOut={e => { e.currentTarget.style.color = 'var(--text-primary, #f8fafc)'; }}
                              >
                                {subj.name}
                              </Link>
                              {isFocus && (
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                  ★ Priority
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #94a3b8)' }}>
                              {subj.solvedCount} of {subj.totalCount} questions attempted
                            </span>
                          </div>
                        </div>

                        {/* Badges: Progress % & Accuracy % */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary, #f8fafc)', background: 'var(--bg-input, rgba(255,255,255,0.05))', padding: '3px 8px', borderRadius: '6px' }}>
                            {subj.progress}% Done
                          </span>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: subj.solvedCount === 0
                                ? 'rgba(255,255,255,0.04)'
                                : subj.accuracy >= 70
                                ? 'rgba(16, 185, 129, 0.15)'
                                : subj.accuracy >= 50
                                ? 'rgba(245, 158, 11, 0.15)'
                                : 'rgba(239, 68, 68, 0.15)',
                              color: subj.solvedCount === 0
                                ? 'var(--text-muted, #64748b)'
                                : subj.accuracy >= 70
                                ? '#10b981'
                                : subj.accuracy >= 50
                                ? '#f59e0b'
                                : '#f87171',
                            }}
                          >
                            {subj.solvedCount === 0 ? '— Acc' : `${subj.accuracy}% Acc`}
                          </span>
                        </div>
                      </div>

                      {/* Row 2: Clean Horizontal Progress Bar */}
                      <div style={{ height: '6px', background: 'var(--border-color, rgba(255,255,255,0.06))', borderRadius: '999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${subj.progress}%`,
                            background: isFocus
                              ? 'linear-gradient(90deg, #3b82f6, #6366f1)'
                              : subj.progress >= 70
                              ? '#10b981'
                              : subj.progress >= 30
                              ? '#3b82f6'
                              : 'rgba(255,255,255,0.3)',
                            borderRadius: '999px',
                            transition: 'width 0.4s ease',
                          }}
                        />
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>

            {/* Recent Mock Attempts Section */}
            {backendData?.recentAttempts && backendData.recentAttempts.length > 0 && (
              <section style={{ marginTop: '24px' }}>
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
                        padding: '14px 18px',
                        borderBottom: idx < backendData.recentAttempts.length - 1 ? '1px solid var(--border-color)' : 'none',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary, #f8fafc)', display: 'block' }}>
                          {att.title}
                        </strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #94a3b8)' }}>
                          {new Date(att.startedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} · {att.mode}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: att.score !== null ? '#10b981' : 'var(--text-primary)' }}>
                            {att.score !== null ? `${att.score}%` : `${att.totalAnswered} Qs Answered`}
                          </span>
                        </div>
                        <Link
                          href={`/prelims/result/${att.id}`}
                          className="pq-btn"
                          style={{ textDecoration: 'none', padding: '5px 10px', fontSize: '0.72rem', fontWeight: 700 }}
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

        {/* Priority Customization Modal */}
        <SubjectPriorityModal
          isOpen={isPriorityModalOpen}
          onClose={() => setIsPriorityModalOpen(false)}
          selectedFocus={focusSubjects}
          onSave={(subjects) => updatePreferences({ focusSubjects: subjects })}
        />

      </div>
    </div>
  );
}
