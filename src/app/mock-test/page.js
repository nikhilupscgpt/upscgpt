import React from 'react';
import Link from 'next/link';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import './mock-test.css';
import { 
  Trophy, 
  Clock, 
  BookOpen, 
  ChevronRight, 
  Play, 
  BarChart3,
  AlertCircle
} from 'lucide-react';
import NeuralAnalyticsCard from '@/components/NeuralAnalyticsCard';

export default async function MockTestListPage() {
  const session = await getServerSession(authOptions);
  
  const testPacks = await prisma.testPack.findMany({
    where: { type: 'MOCK' },
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
        {/* Header */}
        <div className="mt-header">
          <h1 className="mt-title">Prelims Command Center</h1>
          <p className="mt-subtitle">
            High-fidelity simulation environment calibrated to the latest UPSC rubrics. 
            Practice with real-time pressure and detailed performance analytics.
          </p>
        </div>

        <div className="mt-grid">
          {/* Left Column: Test List */}
          <div className="mt-main-col">
            <h2 className="mt-section-title">
              <Play size={20} color="#3b82f6" /> Available Mock Tests
            </h2>
            
            <div className="mt-list">
              {testPacks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', border: '2px dashed #1e293b', borderRadius: '32px' }}>
                  <AlertCircle size={48} color="#475569" style={{ marginBottom: '16px' }} />
                  <p style={{ color: '#64748b', fontWeight: '700' }}>No mock tests available yet. Check back soon!</p>
                </div>
              ) : (
                testPacks.map((test) => (
                  <div key={test.id} className="mt-card">
                    <div className="mt-card-content">
                      <div className="mt-badge-group">
                        <span className="mt-badge mt-badge-primary">Full Length Mock</span>
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

                    <Link href={`/mock-test/${test.id}`} className="mt-btn-start">
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
                    <p style={{ color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic' }}>No recent attempts found.</p>
                  ) : (
                    <div className="mt-attempt-list">
                      {recentAttempts.map((attempt) => (
                        <Link key={attempt.id} href={`/mock-test/result/${attempt.id}`} className="mt-attempt-item">
                          <div>
                            <p className="mt-attempt-title">{attempt.testPack.title}</p>
                            <p className="mt-attempt-date">{new Date(attempt.createdAt).toLocaleDateString()}</p>
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
