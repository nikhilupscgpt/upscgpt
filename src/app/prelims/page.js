"use client";

import React from 'react';
import Link from 'next/link';
import './prelims.css';
import { 
  Trophy, 
  BookOpen, 
  Target,
  Rocket,
  ChevronRight,
  BrainCircuit,
  Layout
} from 'lucide-react';

export default function PrelimsGatewayPage() {
  return (
    <div className="mt-page">
      <div className="mt-container gateway-container" style={{ maxWidth: '1000px', padding: '40px 24px' }}>
        {/* Header */}
        <div className="mt-header gateway-header" style={{ marginBottom: '60px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '20px', color: '#f59e0b', fontSize: '0.75rem', fontWeight: '800', marginBottom: '20px', letterSpacing: '1px' }}>
            <Target size={14} /> PRELIMS COMMAND CENTER
          </div>
          <h1 className="mt-title gateway-title" style={{ fontSize: '3rem', marginBottom: '16px', color: 'white', fontWeight: 900 }}>Master the Rubric.</h1>
          <p className="mt-subtitle" style={{ fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto', color: '#94a3b8' }}>
            A precision-engineered MCQ practice stack powered by current affairs, 
            static mapping, and PYQ pattern analysis.
          </p>
        </div>

        <div className="gateway-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '32px',
          marginTop: '40px'
        }}>
          {/* Option 1: Mock Test */}
          <Link href="/prelims/mocks" className="gateway-card" style={{ textDecoration: 'none' }}>
            <div className="gateway-card-inner" style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '32px',
              padding: '40px',
              height: '100%',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div className="card-glow" style={{ position: 'absolute', top: '-20%', left: '-20%', width: '140%', height: '140%', background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.1), transparent 70%)', pointerEvents: 'none' }} />
              
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '20px', 
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white',
                marginBottom: '32px',
                boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.4)'
              }}>
                <Trophy size={32} />
              </div>

              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '16px' }}>Mock Test</h2>
              <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6, marginBottom: '32px', flex: 1 }}>
                High-fidelity simulation environment with sectional and full-length tests. 
                Experience real-time pressure and get granular performance analytics.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
                {['Sectional', 'Full Length', 'GS Paper I', 'Simulation'].map(tag => (
                  <span key={tag} style={{ fontSize: '0.7rem', fontWeight: 700, color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '4px 10px', borderRadius: '8px' }}>{tag}</span>
                ))}
              </div>

              <div className="gateway-cta" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', fontWeight: 800, fontSize: '0.95rem' }}>
                Launch Simulator <ChevronRight size={18} />
              </div>
            </div>
          </Link>

          {/* Option 2: Prepare */}
          <Link href="/prelims/prepare" className="gateway-card" style={{ textDecoration: 'none' }}>
            <div className="gateway-card-inner" style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '32px',
              padding: '40px',
              height: '100%',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div className="card-glow" style={{ position: 'absolute', top: '-20%', left: '-20%', width: '140%', height: '140%', background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.1), transparent 70%)', pointerEvents: 'none' }} />

              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '20px', 
                background: 'linear-gradient(135deg, #10b981, #059669)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white',
                marginBottom: '32px',
                boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.4)'
              }}>
                <Rocket size={32} />
              </div>

              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '16px' }}>Prepare</h2>
              <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6, marginBottom: '32px', flex: 1 }}>
                Deep-dive into syllabus nodes. Study integrated content, linked PYQs, 
                current affairs, and solve dedicated practice sets for every topic.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
                {['Node-wise', 'PYQ Linked', 'Current Affairs', 'Practice Sets'].map(tag => (
                  <span key={tag} style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '8px' }}>{tag}</span>
                ))}
              </div>

              <div className="gateway-cta" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 800, fontSize: '0.95rem' }}>
                Open Study Vault <ChevronRight size={18} />
              </div>
            </div>
          </Link>

          {/* Option 3: PYQ Topic Explorer */}
          <Link href="/prelims/pyq" className="gateway-card" style={{ textDecoration: 'none' }}>
            <div className="gateway-card-inner" style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '32px',
              padding: '40px',
              height: '100%',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div className="card-glow" style={{ position: 'absolute', top: '-20%', left: '-20%', width: '140%', height: '140%', background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.1), transparent 70%)', pointerEvents: 'none' }} />

              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '20px', 
                background: 'linear-gradient(135deg, #a855f7, #6366f1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white',
                marginBottom: '32px',
                boxShadow: '0 10px 20px -5px rgba(168, 85, 247, 0.4)'
              }}>
                <BookOpen size={32} />
              </div>

              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '16px' }}>PYQ Explorer</h2>
              <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6, marginBottom: '32px', flex: 1 }}>
                Master previous year questions categorized topic-by-topic. Instant filter by exam, 
                year (2011–2025), and specific sub-themes with answer verification.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
                {['Topic-Wise', 'UPSC CSE (2011-25)', 'CDS (2014-23)', 'Interactive Quiz'].map(tag => (
                  <span key={tag} style={{ fontSize: '0.7rem', fontWeight: 700, color: '#c084fc', background: 'rgba(168, 85, 247, 0.1)', padding: '4px 10px', borderRadius: '8px' }}>{tag}</span>
                ))}
              </div>

              <div className="gateway-cta" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc', fontWeight: 800, fontSize: '0.95rem' }}>
                Explore PYQ Bank <ChevronRight size={18} />
              </div>
            </div>
          </Link>
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 768px) {
          .gateway-title {
            font-size: 2rem !important;
          }
          .gateway-container {
            padding: 32px 16px !important;
          }
          .gateway-card-inner {
            padding: 24px !important;
            border-radius: 24px !important;
          }
          .gateway-header {
            margin-bottom: 32px !important;
          }
        }
      `}</style>
    </div>
  );
}
