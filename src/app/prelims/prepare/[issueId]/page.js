import React from 'react';
import Link from 'next/link';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ReactMarkdown from 'react-markdown';
import '../../prelims.css';
import { 
  ChevronRight, 
  BookOpen, 
  BrainCircuit, 
  History, 
  Newspaper,
  Target,
  Clock,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';

export default async function NodePreparePage(props) {
  const params = await props.params;
  const issueId = params?.issueId;
  
  if (typeof issueId !== 'string' || !issueId || issueId === 'undefined' || issueId === 'null') {
    return (
      <div className="mt-page">
        <div className="mt-container">
          <h2 style={{ color: 'white' }}>Invalid Topic ID</h2>
          <p style={{ color: '#64748b' }}>The requested syllabus node could not be identified.</p>
          <Link href="/prelims/prepare" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 700 }}>Return to Study Vault</Link>
        </div>
      </div>
    );
  }

  const issue = await prisma.issue.findFirst({
    where: {
      AND: [
        { id: { equals: issueId } }
      ]
    },
    include: {
      pyqLinks: {
        orderBy: { year: 'desc' }
      },
      articles: {
        where: { status: 'DONE' },
        orderBy: { publishedAt: 'desc' },
        take: 5
      },
      testPacks: {
        where: { type: 'PRACTICE' },
        include: {
          _count: { select: { questions: true } }
        }
      }
    }
  });

  if (!issue) {
    return <div className="mt-page"><div className="mt-container">Node not found.</div></div>;
  }

  const gsPaper = issue.gsPapers[0] || 'GS Paper';
  const category = issue.category.replace('_', ' ');

  return (
    <div className="mt-page" style={{ minHeight: '100vh', background: '#020617' }}>
      <div className="mt-container detail-header" style={{ maxWidth: '1100px', padding: '48px 24px' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: '32px' }}>
          <Link href="/prelims/prepare" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back to Study Vault
          </Link>
        </div>

        {/* Hero Header */}
        <div style={{ marginBottom: '56px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '4px 12px', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>{gsPaper}</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', background: 'rgba(255, 255, 255, 0.05)', padding: '4px 12px', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>{category}</span>
          </div>
          <h1 className="detail-title" style={{ fontSize: '3rem', fontWeight: 900, color: 'white', marginBottom: '16px', letterSpacing: '-1px' }}>{issue.title}</h1>
          <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '800px', lineHeight: 1.6 }}>{issue.topic}</p>
        </div>

        <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '48px' }}>
          {/* Main Content Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
            
            {/* 1. Topic Details */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '8px', borderRadius: '12px' }}><Info size={20} /></div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', margin: 0 }}>Strategic Intelligence</h2>
              </div>
              <div className="markdown-content" style={{ color: '#cbd5e1', lineHeight: 1.8, fontSize: '1.05rem' }}>
                <ReactMarkdown>{issue.cumulativeSummary || issue.backgroundNote || 'No detailed intelligence available for this node yet.'}</ReactMarkdown>
              </div>
            </section>

            {/* 2. PYQs */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '8px', borderRadius: '12px' }}><History size={20} /></div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', margin: 0 }}>Past Year Context</h2>
              </div>
              
              {issue.pyqLinks.length === 0 ? (
                <p style={{ color: '#64748b', fontStyle: 'italic' }}>No direct PYQ links identified for this node yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {issue.pyqLinks.map(pyq => (
                    <div key={pyq.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '0.8rem' }}>UPSC {pyq.year} · {pyq.paperType}</span>
                      </div>
                      <p style={{ color: 'white', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 16px' }}>{pyq.questionText}</p>
                      {pyq.howToUse && (
                        <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '12px 16px', borderRadius: '12px', borderLeft: '3px solid #f59e0b' }}>
                          <p style={{ fontSize: '0.8rem', color: '#d97706', margin: 0, fontWeight: 700 }}>STRATEGIC NOTE</p>
                          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0' }}>{pyq.howToUse}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 3. Possible Questions */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '8px', borderRadius: '12px' }}><Sparkles size={20} /></div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', margin: 0 }}>Predicted Dimensions</h2>
              </div>
              <div className="markdown-content" style={{ color: '#cbd5e1', lineHeight: 1.8, fontSize: '1.05rem', background: 'rgba(139, 92, 246, 0.03)', padding: '28px', borderRadius: '24px', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
                <ReactMarkdown>{issue.possibleQuestions || 'Predictive analysis pending for this node.'}</ReactMarkdown>
              </div>
            </section>
          </div>

          {/* Sidebar Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Practice Set */}
            <div style={{ 
              background: 'linear-gradient(135deg, #020617, #0f172a)', 
              border: '1px solid #1e293b', 
              borderRadius: '28px', 
              padding: '28px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '6px', borderRadius: '8px' }}><BrainCircuit size={18} /></div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', margin: 0 }}>Practice Set</h3>
              </div>
              
              {issue.testPacks.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  No dedicated practice MCQ set found for this node. Check the general mock tests for relevant questions.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {issue.testPacks.map(tp => (
                    <div key={tp.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'white', marginBottom: '12px' }}>{tp.title}</h4>
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 700 }}>
                          <Target size={12} /> {tp._count.questions} Qs
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 700 }}>
                          <Clock size={12} /> Untimed
                        </div>
                      </div>
                      <Link href={`/prelims/${tp.id}`} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px', 
                        background: '#10b981', 
                        color: 'white', 
                        padding: '12px', 
                        borderRadius: '12px', 
                        textDecoration: 'none', 
                        fontSize: '0.85rem', 
                        fontWeight: 800 
                      }}>
                        Start Practice <ArrowRight size={16} />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Current Affairs */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '28px', padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '6px', borderRadius: '8px' }}><Newspaper size={18} /></div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', margin: 0 }}>Recent Briefs</h3>
              </div>

              {issue.articles.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No recent current affairs briefs linked to this node.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {issue.articles.map(article => (
                    <div key={article.id}>
                      <p style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 700, margin: '0 0 4px', lineHeight: 1.4 }}>{article.title}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>{article.source || 'News'}</span>
                        <span style={{ width: '2px', height: '2px', borderRadius: '50%', background: '#475569' }}></span>
                        <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Recent'}</span>
                      </div>
                    </div>
                  ))}
                  <Link href={`/issues/${issue.slug}`} style={{ color: '#3b82f6', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                    View Full Intelligence Graph <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 1024px) {
          .detail-grid {
            grid-template-columns: 1fr !important;
          }
          .detail-title {
            font-size: 2.2rem !important;
          }
          .detail-header {
            padding: 32px 16px !important;
          }
        }
      `}} />
    </div>
  );
}
