import React from 'react';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import Link from 'next/link';
import '../../prelims.css';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  BarChart3, 
  ArrowLeft, 
  FileText,
  Target,
  Trophy
} from 'lucide-react';

export default async function MockTestResultPage({ params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect(`/login?callbackUrl=/prelims/result/${id}`);
  }

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: id },
    include: {
      testPack: true
    }
  });

  if (!attempt || attempt.userId !== session.user.id) {
    return (
      <div className="mt-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 className="mt-title">Access Denied</h1>
          <p className="mt-subtitle">Result not found or unauthorized.</p>
        </div>
      </div>
    );
  }

  const { testPack, score, timeTakenSecs, breakdown } = attempt;
  const questionsCount = testPack.questionsCount || (Array.isArray(breakdown) ? breakdown.length : 0);
  const correctAnswers = Array.isArray(breakdown) ? breakdown.filter(b => b.correct).length : 0;
  const incorrectAnswers = Array.isArray(breakdown) ? breakdown.filter(b => b.selected && !b.correct).length : 0;
  const skippedAnswers = questionsCount - (correctAnswers + incorrectAnswers);
  
  const maxMarks = questionsCount * testPack.marksPerQuestion;
  const percentage = Math.round((score / maxMarks) * 100);
  const passed = percentage >= testPack.passingScore;

  return (
    <div className="mt-page">
      <div className="mt-container res-page">
        {/* Header */}
        <div className="res-header">
          <div>
            <Link href="/atlas" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', textDecoration: 'none', marginBottom: '16px', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 className="mt-title">{testPack.title}</h1>
            <p className="mt-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={16} /> Completed on {new Date(attempt.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
            </p>
          </div>

          <div className={`res-status-badge ${passed ? 'passed' : 'failed'}`}>
            {passed ? <Trophy size={32} /> : <XCircle size={32} />}
            <div>
              <p style={{ fontSize: '0.6rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Result Status</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0 }}>{passed ? 'QUALIFIED' : 'NOT QUALIFIED'}</p>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="res-grid">
          <div className="res-card">
            <Target size={80} style={{ position: 'absolute', top: '16px', right: '16px', opacity: 0.05 }} />
            <p className="res-card-label">Final Score</p>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span className="res-card-val">{score}</span>
              <span className="res-card-sub">/ {maxMarks}</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '16px' }}>Marks obtained after negative marking.</p>
          </div>

          <div className="res-card">
            <BarChart3 size={80} style={{ position: 'absolute', top: '16px', right: '16px', opacity: 0.05 }} />
            <p className="res-card-label">Accuracy</p>
            <span className="res-card-val" style={{ color: '#60a5fa' }}>{percentage}%</span>
            <div className="res-progress">
              <div className="res-progress-bar" style={{ width: `${percentage}%` }} />
            </div>
          </div>

          <div className="res-card">
            <Clock size={80} style={{ position: 'absolute', top: '16px', right: '16px', opacity: 0.05 }} />
            <p className="res-card-label">Time Taken</p>
            <span className="res-card-val" style={{ color: '#f59e0b', fontSize: '2.5rem' }}>
              {Math.floor(timeTakenSecs / 60)}m {timeTakenSecs % 60}s
            </span>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '16px' }}>Out of {testPack.durationMins} minutes.</p>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="res-breakdown">
          <div className="res-br-header">
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'white', margin: 0 }}>Performance Breakdown</h2>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>{correctAnswers} Correct</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>{incorrectAnswers} Incorrect</span>
              </div>
            </div>
          </div>

          <div style={{ padding: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {breakdown.map((item, idx) => (
                <div key={idx} className="res-br-item" style={{ border: '1px solid rgba(30, 41, 59, 0.5)', borderRadius: '24px', backgroundColor: 'rgba(30, 41, 59, 0.2)' }}>
                  <div className={`res-br-num ${item.correct ? 'correct' : (item.selected ? 'incorrect' : 'skipped')}`}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '12px' }}>
                      {item.correct ? (
                        <span className="res-q-badge" style={{ backgroundColor: '#16a34a', color: 'white' }}>Correct</span>
                      ) : (
                        item.selected ? (
                          <span className="res-q-badge" style={{ backgroundColor: '#dc2626', color: 'white' }}>Incorrect</span>
                        ) : (
                          <span className="res-q-badge" style={{ backgroundColor: '#475569', color: 'white' }}>Skipped</span>
                        )
                      )}
                    </div>
                    <p className="res-q-text">{item.questionText || `Question ${idx + 1}`}</p>
                    
                    <div className="res-ans-row">
                      <div className="res-ans-box" style={{ backgroundColor: item.selected === item.correctLabel ? 'rgba(34, 197, 94, 0.05)' : 'transparent' }}>
                        <p className="res-ans-label">Your Answer</p>
                        <p className="res-ans-val" style={{ color: item.correct ? '#4ade80' : '#e2e8f0' }}>
                          {item.selected ? item.selected.toUpperCase() : 'None'}
                        </p>
                      </div>
                      <div className="res-ans-box" style={{ backgroundColor: 'rgba(34, 197, 94, 0.05)', borderColor: 'rgba(34, 197, 94, 0.2)' }}>
                        <p className="res-ans-label" style={{ color: '#22c55e' }}>Correct Answer</p>
                        <p className="res-ans-val" style={{ color: '#4ade80' }}>{item.correctLabel.toUpperCase()}</p>
                      </div>
                    </div>

                    {item.explanation && (
                      <div className="res-expl">
                        <p className="res-ans-label" style={{ color: '#60a5fa' }}>Explanation</p>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>{item.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="res-footer">
          <Link href="/atlas" className="res-btn res-btn-sec">Go Home</Link>
          <Link href={`/prelims/${testPack.id}`} className="res-btn res-btn-primary">Retake Test</Link>
        </div>
      </div>
    </div>
  );
}
