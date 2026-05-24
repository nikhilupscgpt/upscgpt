import React from 'react';
import Link from 'next/link';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import '../prelims.css';
import { 
  Trophy, 
  Clock, 
  BookOpen, 
  ChevronRight, 
  Play, 
  BarChart3,
  AlertCircle,
  Filter,
  CheckCircle2
} from 'lucide-react';
import NeuralAnalyticsCard from '@/components/NeuralAnalyticsCard';

export default async function MockTestListPage({ searchParams }) {
  const { tab } = await searchParams;
  const activeTab = tab || 'FULL_LENGTH';
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login?callbackUrl=/prelims/mocks');
  }
  
  const testPacks = await prisma.testPack.findMany({
    where: { 
      type: 'MOCK',
      subType: activeTab
    },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { questions: true }
      }
    }
  });

  const recentAttempts = session ? await prisma.quizAttempt.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      testPack: true
    }
  }) : [];

  return (
    <div className="mt-page">
      <div className="mt-container">
        {/* Breadcrumb */}
        <div style={{ marginBottom: '24px' }}>
          <Link href="/prelims" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back to Command Center
          </Link>
        </div>

        {/* Header */}
        <div className="mt-header">
          <h1 className="mt-title">Mock Test Simulator</h1>
          <p className="mt-subtitle">
            High-fidelity simulation environment calibrated to the latest UPSC rubrics. 
            Practice with real-time pressure and detailed performance analytics.
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-tabs" style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '32px', 
          padding: '4px', 
          background: 'rgba(255,255,255,0.03)', 
          borderRadius: '16px', 
          width: 'fit-content' 
        }}>
          <Link 
            href="/prelims/mocks?tab=FULL_LENGTH" 
            style={{ 
              padding: '10px 24px', 
              borderRadius: '12px', 
              textDecoration: 'none', 
              fontSize: '0.9rem', 
              fontWeight: 700,
              background: activeTab === 'FULL_LENGTH' ? '#3b82f6' : 'transparent',
              color: activeTab === 'FULL_LENGTH' ? 'white' : '#94a3b8',
              transition: 'all 0.2s'
            }}
          >
            Full Length Tests
          </Link>
          <Link 
            href="/prelims/mocks?tab=SECTIONAL" 
            style={{ 
              padding: '10px 24px', 
              borderRadius: '12px', 
              textDecoration: 'none', 
              fontSize: '0.9rem', 
              fontWeight: 700,
              background: activeTab === 'SECTIONAL' ? '#3b82f6' : 'transparent',
              color: activeTab === 'SECTIONAL' ? 'white' : '#94a3b8',
              transition: 'all 0.2s'
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
                <Play size={20} color="#3b82f6" /> 
                {activeTab === 'FULL_LENGTH' ? 'Full Length Simulations' : 'Sectional Focus Tests'}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{testPacks.length} Available</span>
            </h2>
            
            <div className="mt-list">
              {testPacks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 40px', background: 'rgba(255,255,255,0.01)', border: '2px dashed rgba(255,255,255,0.05)', borderRadius: '32px' }}>
                  <AlertCircle size={48} color="#475569" style={{ marginBottom: '16px', opacity: 0.5 }} />
                  <p style={{ color: '#64748b', fontWeight: '700', fontSize: '1.1rem' }}>No {activeTab.toLowerCase().replace('_', ' ')} tests available yet.</p>
                  <p style={{ color: '#475569', fontSize: '0.9rem', marginTop: '8px' }}>We are curating high-quality content. Check back shortly!</p>
                </div>
              ) : (
                testPacks.map((test) => (
                  <div key={test.id} className="mt-card">
                    <div className="mt-card-content">
                      <div className="mt-badge-group">
                        <span className="mt-badge mt-badge-primary">
                          {test.subType === 'SECTIONAL' ? 'Sectional Mock' : 'Full Length Mock'}
                        </span>
                        <span className="mt-badge mt-badge-sec">GS Paper I</span>
                      </div>
                      <h3 className="mt-test-title">{test.title}</h3>
                      <p className="mt-test-desc">{test.description}</p>
                      
                      <div className="mt-test-meta">
                        <div className="mt-meta-item">
                          <BookOpen size={16} />
                          <span>{test._count.questions} Questions</span>
                        </div>
                        <div className="mt-meta-item">
                          <Clock size={16} />
                          <span>{test.durationMins} Minutes</span>
                        </div>
                        <div className="mt-meta-item">
                          <Trophy size={16} />
                          <span>{test.marksPerQuestion * test._count.questions} Marks</span>
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
                <BarChart3 size={20} color="#f59e0b" /> Recent Performance
              </h2>
              <div className="mt-perf-card">
                <div className="mt-perf-body">
                  {recentAttempts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <p style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>No recent attempts found.</p>
                    </div>
                  ) : (
                    <div className="mt-attempt-list">
                      {recentAttempts.map((attempt) => (
                        <Link key={attempt.id} href={`/prelims/result/${attempt.id}`} className="mt-attempt-item">
                          <div>
                            <p className="mt-attempt-title">{attempt.testPack.title}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                              <p className="mt-attempt-date">{new Date(attempt.createdAt).toLocaleDateString()}</p>
                              <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#475569' }}></span>
                              <p style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>{attempt.testPack.subType}</p>
                            </div>
                          </div>
                          <div className="mt-attempt-score">
                            <p className="mt-score-val">{attempt.score}</p>
                            <p className="mt-score-label">Marks</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-perf-footer">
                  <Link href="/profile" className="mt-link-more">
                    View Comprehensive Analytics <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>

            <NeuralAnalyticsCard />
          </div>
        </div>
      </div>
    </div>
  );
}
