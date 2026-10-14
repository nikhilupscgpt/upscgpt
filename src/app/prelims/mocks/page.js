import React from 'react';
import Link from 'next/link';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import '../prelims.css';
import { 
  Trophy, 
  Clock, 
  BookOpen, 
  ChevronRight, 
  Play, 
  BarChart3,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import NeuralAnalyticsCard from '@/components/NeuralAnalyticsCard';

export const dynamic = 'force-dynamic';

export default async function MockTestListPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const activeTab = resolvedParams?.tab || 'FULL_LENGTH';
  const session = await getServerSession(authOptions);

  let testPacks = [];
  let recentAttempts = [];

  try {
    if (prisma?.testPaper) {
      testPacks = await prisma.testPaper.findMany({
        where: { 
          isPublished: true,
        },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { questions: true }
          }
        }
      });
    }

    if (session?.user?.id && prisma?.attempt) {
      recentAttempts = await prisma.attempt.findMany({
        where: { userId: session.user.id },
        orderBy: { startedAt: 'desc' },
        take: 5,
        include: {
          testPaper: true
        }
      });
    }
  } catch (err) {
    console.error('Failed to query mock test papers or attempts:', err);
  }

  return (
    <div className="mt-page">
      <div className="mt-container">
        {/* Breadcrumb */}
        <div style={{ marginBottom: '24px' }}>
          <Link href="/prelims/pyq" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back to PYQ Explorer
          </Link>
        </div>

        {/* Header */}
        <div className="mt-header">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(2, 132, 199, 0.1)', color: 'var(--color-link)', fontSize: '0.75rem', fontWeight: 800, marginBottom: '12px' }}>
            <ShieldCheck size={14} /> UPSC PRELIMS SIMULATOR
          </div>
          <h1 className="mt-title">Mock Test Simulator</h1>
          <p className="mt-subtitle">
            Timed practice environment calibrated to the official UPSC marking scheme (+2.0 / -0.66). Practice with real-time pressure and granular analytics.
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-tabs" style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '32px', 
          padding: '4px', 
          background: 'var(--bg-input)', 
          border: '1px solid var(--border-color)',
          borderRadius: '14px', 
          width: 'fit-content' 
        }}>
          <Link 
            href="/prelims/mocks?tab=FULL_LENGTH" 
            style={{ 
              padding: '8px 20px', 
              borderRadius: '10px', 
              textDecoration: 'none', 
              fontSize: '0.85rem', 
              fontWeight: 700,
              background: activeTab === 'FULL_LENGTH' ? 'var(--btn-primary-bg)' : 'transparent',
              color: activeTab === 'FULL_LENGTH' ? 'var(--btn-primary-text)' : 'var(--text-muted)',
              transition: 'all 0.15s'
            }}
          >
            Full Length Tests
          </Link>
          <Link 
            href="/prelims/mocks?tab=SECTIONAL" 
            style={{ 
              padding: '8px 20px', 
              borderRadius: '10px', 
              textDecoration: 'none', 
              fontSize: '0.85rem', 
              fontWeight: 700,
              background: activeTab === 'SECTIONAL' ? 'var(--btn-primary-bg)' : 'transparent',
              color: activeTab === 'SECTIONAL' ? 'var(--btn-primary-text)' : 'var(--text-muted)',
              transition: 'all 0.15s'
            }}
          >
            Sectional Tests
          </Link>
        </div>

        <div className="mt-grid">
          {/* Left Column: Test List */}
          <div className="mt-main-col">
            <h2 className="mt-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Play size={18} color="var(--color-link)" /> 
                {activeTab === 'FULL_LENGTH' ? 'Full Length Simulations (100 Qs)' : 'Sectional Focus Tests'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{testPacks.length} Available</span>
            </h2>
            
            <div className="mt-list">
              {testPacks.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px 32px', 
                  background: 'var(--bg-card)', 
                  border: '1.5px dashed var(--border-color)', 
                  borderRadius: '24px' 
                }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(2, 132, 199, 0.1)', color: 'var(--color-link)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <Clock size={24} />
                  </div>
                  <h3 style={{ color: 'var(--text-primary)', fontWeight: '800', fontSize: '1.2rem', margin: '0 0 8px' }}>
                    Scheduled Mock Tests are Being Assembled
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                    Full-length 100-question GS simulations with official negative marking (-0.66) are currently in preparation. In the meantime, you can practice 300+ topic-wise UPSC questions in the interactive PYQ Explorer.
                  </p>

                  <Link 
                    href="/prelims/pyq" 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'var(--btn-primary-bg)',
                      color: 'var(--btn-primary-text)',
                      padding: '10px 22px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      textDecoration: 'none'
                    }}
                  >
                    Explore 300+ PYQs Now <ArrowRight size={16} />
                  </Link>
                </div>
              ) : (
                testPacks.map((test) => (
                  <div key={test.id} className="mt-card">
                    <div className="mt-card-content">
                      <div className="mt-badge-group">
                        <span className="mt-badge mt-badge-primary">
                          {test.durationMins > 60 ? 'Full Length Mock' : 'Sectional Mock'}
                        </span>
                        <span className="mt-badge mt-badge-sec">GS Paper I</span>
                      </div>
                      <h3 className="mt-test-title">{test.title}</h3>
                      <p className="mt-test-desc">{test.description}</p>
                      
                      <div className="mt-test-meta">
                        <div className="mt-meta-item">
                          <BookOpen size={16} />
                          <span>{test._count?.questions || 0} Questions</span>
                        </div>
                        <div className="mt-meta-item">
                          <Clock size={16} />
                          <span>{test.durationMins || 120} Minutes</span>
                        </div>
                        <div className="mt-meta-item">
                          <Trophy size={16} />
                          <span>{(test.marksPerQuestion || 2.0) * (test._count?.questions || 0)} Marks</span>
                        </div>
                      </div>
                    </div>

                    <Link href={`/prelims/${test.id}`} className="mt-btn-start">
                      Start Test <Play size={16} />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Performance & History */}
          <div className="mt-perf-panel">
            <div>
              <h2 className="mt-section-title">
                <BarChart3 size={18} color="#f59e0b" /> Your Attempt History
              </h2>
              <div className="mt-perf-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '18px', padding: '16px' }}>
                <div className="mt-perf-body">
                  {!session ? (
                    <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 12px' }}>Sign in to save test scores and track progress over time.</p>
                      <Link 
                        href="/login?callbackUrl=/prelims/mocks"
                        style={{
                          display: 'inline-block',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          background: 'var(--bg-hover)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          textDecoration: 'none'
                        }}
                      >
                        Sign In
                      </Link>
                    </div>
                  ) : recentAttempts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>No past mock test attempts recorded yet.</p>
                    </div>
                  ) : (
                    <div className="mt-attempt-list">
                      {recentAttempts.map((attempt) => (
                        <Link key={attempt.id} href={`/prelims/result/${attempt.id}`} className="mt-attempt-item">
                          <div>
                            <p className="mt-attempt-title">{attempt.testPaper?.title || 'Prelims Mock'}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                              <p className="mt-attempt-date">{new Date(attempt.startedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="mt-attempt-score">
                            <p className="mt-score-val">{attempt.score ?? 0}</p>
                            <p className="mt-score-label">Marks</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '18px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Trophy size={18} color="#f59e0b" />
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>PYQ Practice Mode</h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 14px' }}>
                  Need immediate practice? Switch between 10, 20, or 30 questions instantly in the PYQ Explorer without full-length exam timer constraints.
                </p>
                <Link 
                  href="/prelims/pyq?mode=drill" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-hover)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    textDecoration: 'none'
                  }}
                >
                  Start Practice Drill <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
