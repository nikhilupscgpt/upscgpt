import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from "@/lib/prisma";
import { ChevronRight, BookOpen, Newspaper, Zap, Quote, HelpCircle } from 'lucide-react';
import FloatingChatWrapper from '@/components/content-portal/FloatingChatWrapper';
import ReactMarkdown from 'react-markdown';
import '../../prelims/prelims.css';

export default async function MainsIssueDetailPage({ params }) {
  const { issueId } = await params;

  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: {
      articles: {
        where: { status: 'DONE' },
        orderBy: { publishedAt: 'desc' },
        take: 5
      }
    }
  });

  if (!issue) {
    notFound();
  }

  const gsPaper = issue.gsPapers[0] || 'GS Paper';
  const category = issue.category.replace('_', ' ');

  return (
    <div className="mt-page" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Container - Using 100% width with padding to satisfy "no spaces in horizontal layout" */}
      <div style={{ width: '100%', padding: '48px 40px', boxSizing: 'border-box' }}>
        
        <div style={{ marginBottom: '32px' }}>
          <Link href="/content-portal" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back to Mains Neural Base
          </Link>
        </div>

        {/* Hero Header */}
        <div style={{ marginBottom: '56px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '4px 12px', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>{gsPaper}</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-secondary)', background: 'var(--btn-sec-bg)', padding: '4px 12px', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>{category}</span>
          </div>
          <h1 className="detail-title" style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-1px' }}>{issue.title}</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '800px', lineHeight: 1.6 }}>{issue.topic}</p>
        </div>

        {/* 60 / 40 Split Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '6fr 4fr', 
          gap: '48px',
          width: '100%' 
        }} className="mains-detail-grid">
          
          {/* LEFT COLUMN: 60% (Core Content) */}
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '8px', borderRadius: '12px' }}><BookOpen size={20} /></div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Neural Core Content</h2>
              </div>
              <div className="markdown-content" style={{ color: 'var(--text-primary)', lineHeight: 1.8, fontSize: '1.05rem', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '24px', padding: '32px', overflowX: 'auto' }}>
                <ReactMarkdown>{issue.backgroundNote || 'Strategic core content is being synthesized...'}</ReactMarkdown>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: 40% (Rest of elements arranged below each other) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', minWidth: 0 }}>
            
            {/* 1. Summary */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '8px', borderRadius: '12px' }}><Zap size={18} /></div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Executive Summary</h2>
              </div>
              <div className="markdown-content" style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '20px', padding: '24px', overflowX: 'auto' }}>
                {issue.cumulativeSummary ? (
                  issue.cumulativeSummary.trim().startsWith('<') ? (
                    <div dangerouslySetInnerHTML={{ __html: issue.cumulativeSummary.replace(/<!DOCTYPE html>|<html>|<\/html>|<head>[\s\S]*?<\/head>|<body>|<\/body>/gi, '') }} />
                  ) : (
                    <ReactMarkdown>{issue.cumulativeSummary}</ReactMarkdown>
                  )
                ) : (
                  <p style={{ fontStyle: 'italic' }}>Awaiting executive briefing...</p>
                )}
              </div>
            </section>

            {/* 2. Value Addition */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '8px', borderRadius: '12px' }}><Quote size={18} /></div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Strategic Value Addition</h2>
              </div>
              <div className="markdown-content" style={{ color: 'var(--text-primary)', lineHeight: 1.6, fontSize: '0.95rem', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '20px', padding: '24px', overflowX: 'auto' }}>
                {issue.valueAddition ? (
                  <ReactMarkdown>{issue.valueAddition}</ReactMarkdown>
                ) : (
                  <p style={{ color: '#64748b', fontStyle: 'italic', margin: 0 }}>No specific value-addition found.</p>
                )}
              </div>
            </section>

            {/* 3. Current Update */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '8px', borderRadius: '12px' }}><Newspaper size={18} /></div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Intelligence Stream</h2>
              </div>
              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '20px', padding: '24px' }}>
                {issue.articles.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>No recent updates in the stream.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {issue.articles.map(article => (
                      <div key={article.id}>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 700, margin: '0 0 6px', lineHeight: 1.4 }}>{article.title}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700 }}>{article.source || 'News'}</span>
                          <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--text-secondary)' }}></span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Recent'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* 4. Possible Questions */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '8px', borderRadius: '12px' }}><HelpCircle size={18} /></div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Mains Predictions</h2>
              </div>
              <div className="markdown-content" style={{ color: 'var(--text-primary)', lineHeight: 1.6, fontSize: '0.95rem', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '20px', padding: '24px', overflowX: 'auto' }}>
                {issue.possibleQuestions ? (
                  <ReactMarkdown>
                    {(() => {
                      const text = issue.possibleQuestions;
                      const mainsIndex = text.search(/###?\s*Mains/i);
                      const prelimsIndex = text.search(/###?\s*Prelims/i);
                      if (mainsIndex !== -1) {
                        if (prelimsIndex > mainsIndex) return text.substring(mainsIndex, prelimsIndex);
                        return text.substring(mainsIndex);
                      }
                      return text;
                    })()}
                  </ReactMarkdown>
                ) : (
                  <p style={{ color: '#475569', fontStyle: 'italic', margin: 0 }}>Calculating predictive vectors...</p>
                )}
              </div>
            </section>

          </div>
        </div>
      </div>

      <FloatingChatWrapper 
        subjectId={issue.id}
        displayName={issue.title}
        examType="MAINS"
      />

      <style dangerouslySetInnerHTML={{__html: `
        /* Ensure markdown content properly handles long unbroken strings/HTML */
        .markdown-content pre, .markdown-content code {
          white-space: pre-wrap;       /* css-3 */
          white-space: -moz-pre-wrap;  /* Mozilla, since 1999 */
          white-space: -pre-wrap;      /* Opera 4-6 */
          white-space: -o-pre-wrap;    /* Opera 7 */
          word-wrap: break-word;       /* Internet Explorer 5.5+ */
        }
        .markdown-content p {
          word-break: break-word;
        }

        @media (max-width: 1200px) {
          .mains-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
    </div>
  );
}
