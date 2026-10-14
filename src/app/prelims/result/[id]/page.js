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

export const dynamic = 'force-dynamic';

export default async function MockTestResultPage({ params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect(`/login?callbackUrl=/prelims/result/${id}`);
  }

  let attempt = null;
  try {
    if (prisma?.attempt) {
      attempt = await prisma.attempt.findUnique({
        where: { id: id },
        include: {
          testPaper: true,
          answers: {
            include: {
              question: true
            }
          }
        }
      });
    }
  } catch (err) {
    console.error('Error querying attempt:', err);
  }

  if (!attempt || attempt.userId !== session.user.id) {
    return (
      <div className="mt-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h1 className="mt-title" style={{ fontSize: '2rem' }}>Result Not Found</h1>
          <p className="mt-subtitle" style={{ margin: '0 auto 24px' }}>We could not find this test attempt, or you do not have permission to view it.</p>
          <Link href="/prelims/mocks" className="res-btn res-btn-primary" style={{ display: 'inline-block' }}>
            Back to Mocks Catalog
          </Link>
        </div>
      </div>
    );
  }

  const testPaper = attempt.testPaper || {
    title: 'Prelims Test Attempt',
    durationMins: 120,
    marksPerQuestion: 2.0,
    negativeMarking: 0.66
  };

  const answers = attempt.answers || [];
  const questionsCount = answers.length;
  const correctAnswers = answers.filter(a => a.isCorrect).length;
  const incorrectAnswers = answers.filter(a => a.selectedLabel && !a.isCorrect).length;
  const skippedAnswers = questionsCount - (correctAnswers + incorrectAnswers);
  
  const score = attempt.score ?? ((correctAnswers * testPaper.marksPerQuestion) - (incorrectAnswers * testPaper.negativeMarking));
  const maxMarks = Math.max(1, questionsCount * testPaper.marksPerQuestion);
  const percentage = Math.round((Math.max(0, score) / maxMarks) * 100);
  const passed = percentage >= 50;

  return (
    <div className="mt-page">
      <div className="mt-container res-page">
        {/* Header */}
        <div className="res-header">
          <div>
            <Link href="/prelims/mocks" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '16px', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>
              <ArrowLeft size={16} /> Back to Mocks
            </Link>
            <h1 className="mt-title">{testPaper.title}</h1>
            <p className="mt-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={16} /> Completed on {new Date(attempt.submittedAt || attempt.startedAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
            </p>
          </div>

          <div className={`res-status-badge ${passed ? 'passed' : 'failed'}`}>
            {passed ? <Trophy size={32} /> : <XCircle size={32} />}
            <div>
              <p style={{ fontSize: '0.6rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Result Status</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0 }}>{passed ? 'QUALIFIED' : 'NEEDS PRACTICE'}</p>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="res-grid">
          <div className="res-card">
            <Target size={80} style={{ position: 'absolute', top: '16px', right: '16px', opacity: 0.05 }} />
            <p className="res-card-label">Final Score</p>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span className="res-card-val">{typeof score === 'number' ? score.toFixed(2) : score}</span>
              <span className="res-card-sub">/ {maxMarks}</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '16px' }}>Calculated with UPSC negative marking (-{testPaper.negativeMarking}).</p>
          </div>

          <div className="res-card">
            <BarChart3 size={80} style={{ position: 'absolute', top: '16px', right: '16px', opacity: 0.05 }} />
            <p className="res-card-label">Accuracy</p>
            <span className="res-card-val" style={{ color: 'var(--color-link)' }}>{percentage}%</span>
            <div className="res-progress">
              <div className="res-progress-bar" style={{ width: `${percentage}%` }} />
            </div>
          </div>

          <div className="res-card">
            <Clock size={80} style={{ position: 'absolute', top: '16px', right: '16px', opacity: 0.05 }} />
            <p className="res-card-label">Time Spent</p>
            <span className="res-card-val" style={{ color: '#f59e0b', fontSize: '2.5rem' }}>
              {Math.round((answers.reduce((acc, a) => acc + (a.timeSpentSec || 0), 0)) / 60)} mins
            </span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '16px' }}>Duration limit: {testPaper.durationMins} minutes.</p>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="res-breakdown">
          <div className="res-br-header">
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Performance Breakdown</h2>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{correctAnswers} Correct</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{incorrectAnswers} Incorrect</span>
              </div>
            </div>
          </div>

          <div style={{ padding: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {answers.map((item, idx) => (
                <div key={idx} className="res-br-item" style={{ border: '1px solid var(--border-color)', borderRadius: '16px', backgroundColor: 'var(--bg-card)', padding: '16px' }}>
                  <div className={`res-br-num ${item.isCorrect ? 'correct' : (item.selectedLabel ? 'incorrect' : 'skipped')}`}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '8px' }}>
                      {item.isCorrect ? (
                        <span className="res-q-badge" style={{ backgroundColor: '#16a34a', color: 'white' }}>Correct</span>
                      ) : (
                        item.selectedLabel ? (
                          <span className="res-q-badge" style={{ backgroundColor: '#dc2626', color: 'white' }}>Incorrect</span>
                        ) : (
                          <span className="res-q-badge" style={{ backgroundColor: 'var(--text-muted)', color: 'white' }}>Skipped</span>
                        )
                      )}
                    </div>
                    <p className="res-q-text" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.question?.stem || `Question ${idx + 1}`}</p>
                    
                    <div className="res-ans-row">
                      <div className="res-ans-box" style={{ backgroundColor: 'var(--bg-input)' }}>
                        <p className="res-ans-label">Your Choice</p>
                        <p className="res-ans-val" style={{ color: item.isCorrect ? '#15803d' : '#b91c1c' }}>
                          {item.selectedLabel ? item.selectedLabel.toUpperCase() : 'None'}
                        </p>
                      </div>
                      <div className="res-ans-box" style={{ backgroundColor: 'rgba(34, 197, 94, 0.08)', borderColor: 'rgba(34, 197, 94, 0.3)' }}>
                        <p className="res-ans-label" style={{ color: '#15803d' }}>Official Key</p>
                        <p className="res-ans-val" style={{ color: '#15803d' }}>{(item.question?.correctLabel || '').toUpperCase()}</p>
                      </div>
                    </div>

                    {item.question?.explanation && (
                      <div className="res-expl" style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '10px', marginTop: '12px' }}>
                        <p className="res-ans-label" style={{ color: 'var(--color-link)' }}>Verified Explanation</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>{item.question.explanation}</p>
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
          <Link href="/prelims/mocks" className="res-btn res-btn-sec">Back to Mocks</Link>
          <Link href="/prelims/pyq" className="res-btn res-btn-primary">Go to PYQ Explorer</Link>
        </div>
      </div>
    </div>
  );
}
