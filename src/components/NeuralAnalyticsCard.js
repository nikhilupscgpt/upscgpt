'use client';

import React, { useState } from 'react';
import { Trophy, ArrowRight, Sparkles, AlertCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function NeuralAnalyticsCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/user/neural-analytics');
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        setError(json.message || 'Failed to load insights');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-promo-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div style={{ textAlign: 'center' }}>
          <Sparkles className="animate-spin" size={40} color="white" style={{ marginBottom: '16px' }} />
          <p style={{ fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Neural Engine Processing...</p>
        </div>
      </div>
    );
  }

  if (data) {
    return (
      <div className="mt-promo-card">
        <Trophy size={80} className="mt-promo-icon" />
        <div style={{ position: 'relative', zIndex: 10 }}>
          <h3 className="mt-promo-title">Neural Insights</h3>
          
          {data.analysis ? (
            <div style={{ marginBottom: '24px' }}>
              <p className="mt-promo-desc" style={{ fontSize: '0.9rem' }}>
                Your performance in <span style={{ color: '#fbbf24', fontWeight: '900' }}>{data.analysis.primaryWeakness}</span> indicates a critical revision requirement.
              </p>
              
              <div style={{ marginTop: '20px' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8, marginBottom: '12px' }}>
                  Suggested Revision Zones
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {data.recommendations.map(issue => (
                    <Link 
                      key={issue.id} 
                      href={issue.url}
                      className="neural-rec-item"
                    >
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: '800', margin: 0 }}>{issue.title}</p>
                        <p style={{ fontSize: '0.6rem', opacity: 0.7, margin: 0 }}>{issue.topic}</p>
                      </div>
                      <ExternalLink size={14} />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-promo-desc">{data.message}</p>
          )}

          <button 
            onClick={fetchInsights}
            className="mt-btn-promo"
            style={{ marginTop: '12px' }}
          >
            Refresh Analysis
          </button>
        </div>

        <style jsx>{`
          .neural-rec-item {
            background-color: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            text-decoration: none;
            color: white;
            transition: all 0.2s;
          }
          .neural-rec-item:hover {
            background-color: rgba(255, 255, 255, 0.2);
            transform: translateX(4px);
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin {
            animation: spin 2s linear infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="mt-promo-card">
      <Trophy size={80} className="mt-promo-icon" />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <h3 className="mt-promo-title">Neural Analytics</h3>
        <p className="mt-promo-desc">
          Our AI models analyze your pattern of mistakes across subjects to suggest targeted revision zones in the Atlas.
        </p>
        {error && (
          <p style={{ fontSize: '0.75rem', color: '#fca5a5', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={14} /> {error}
          </p>
        )}
        <button 
          onClick={fetchInsights}
          className="mt-btn-promo"
        >
          Unlock Insights
        </button>
      </div>
    </div>
  );
}
