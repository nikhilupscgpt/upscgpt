"use client";

import React from 'react';
import Link from 'next/link';
import { Newspaper, ArrowRight } from 'lucide-react';

export default function NewsBriefsSidebar({ articles = [], slug, categoryLabel, flow = 'prelims', themeColor = 'blue' }) {
  const accentColor = 
    themeColor === 'amber' ? '#fbbf24' : 
    themeColor === 'emerald' ? '#10b981' : 
    '#3b82f6';

  const accentBg = 
    themeColor === 'amber' ? 'rgba(251, 191, 36, 0.1)' : 
    themeColor === 'emerald' ? 'rgba(16, 185, 129, 0.1)' : 
    'rgba(59, 130, 246, 0.1)';

  return (
    <div 
      className="news-briefs-sidebar-container"
      style={{
        background: 'rgba(15, 23, 42, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        padding: '24px',
        backdropFilter: 'blur(12px)',
        fontFamily: "'Outfit', sans-serif"
      }}
    >
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px', 
          marginBottom: '20px' 
        }}
      >
        <div 
          style={{ 
            background: accentBg, 
            color: accentColor, 
            padding: '6px', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Newspaper size={18} />
        </div>
        <h3 
          style={{ 
            fontSize: '1rem', 
            fontWeight: 800, 
            color: 'white', 
            margin: 0,
            letterSpacing: '-0.2px'
          }}
        >
          Recent Briefs
        </h3>
      </div>

      {articles.length === 0 ? (
        <div 
          style={{ 
            background: 'rgba(255, 255, 255, 0.01)', 
            border: '1px dashed rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '24px 16px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          className="news-empty-placeholder"
        >
          <div style={{ fontSize: '1.2rem', opacity: 0.5 }}>🧭</div>
          <h4 style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>No Recent Briefs</h4>
          <p style={{ color: '#64748b', fontSize: '0.75rem', margin: 0, lineHeight: 1.4, maxWidth: '220px' }}>
            No current affairs briefs are currently linked to this specific topic.
          </p>
          {slug && (
            <Link 
              href={`/issues/${slug}?flow=${flow}`} 
              style={{ 
                color: accentColor, 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                textDecoration: 'none', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '4px', 
                marginTop: '8px',
                width: 'fit-content'
              }}
              className="news-graph-link"
            >
              <span>View Intel Graph</span>
              <ArrowRight size={12} />
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {articles.map((article) => {
              const isFallback = article.isFallback;
              return (
                <div 
                  key={article.id}
                  style={{
                    paddingBottom: '16px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)'
                  }}
                  className="news-brief-card"
                >
                  <p 
                    style={{ 
                      fontSize: '0.85rem', 
                      color: '#cbd5e1', 
                      fontWeight: 700, 
                      margin: '0 0 8px', 
                      lineHeight: 1.4,
                      transition: 'color 0.2s'
                    }}
                    className="news-brief-title"
                  >
                    {article.title}
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span 
                      style={{ 
                        fontSize: '0.65rem', 
                        color: '#94a3b8', 
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 800
                      }}
                    >
                      {article.source || 'News'}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                      {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                    </span>
                    
                    {isFallback && (
                      <span 
                        style={{ 
                          fontSize: '0.6rem', 
                          color: accentColor, 
                          background: accentBg,
                          border: `1px solid ${accentBg}`,
                          padding: '1px 5px',
                          borderRadius: '4px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {categoryLabel || 'General'} Intel
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {slug && (
            <Link 
              href={`/issues/${slug}?flow=${flow}`} 
              style={{ 
                color: accentColor, 
                fontSize: '0.8rem', 
                fontWeight: 700, 
                textDecoration: 'none', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '4px', 
                marginTop: '4px',
                width: 'fit-content'
              }}
              className="news-graph-link"
            >
              <span>View Full Intel Graph</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{ __html: `
        .news-brief-card:last-child {
          border-bottom: none !important;
          padding-bottom: 0 !important;
        }
        .news-graph-link:hover {
          text-decoration: underline !important;
          opacity: 0.9;
        }
        .news-brief-title:hover {
          color: white !important;
        }
      `}} />
    </div>
  );
}
