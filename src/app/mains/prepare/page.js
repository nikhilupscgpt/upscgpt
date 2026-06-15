'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Home, BookOpen, Scale, ShieldAlert, HeartHandshake, PenTool,
  Globe, Users, Leaf, Hourglass, Compass, Award, Lock 
} from 'lucide-react';

export default function MainsPrepareHub() {
  const [optionals, setOptionals] = useState([]);
  const [loadingOptionals, setLoadingOptionals] = useState(true);

  useEffect(() => {
    fetch('/api/optionals')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOptionals(data);
        }
        setLoadingOptionals(false);
      })
      .catch(() => setLoadingOptionals(false));
  }, []);

  const papers = [
    {
      id: 'gs1',
      code: 'GS Paper I',
      title: 'Heritage, History, Geography & Society',
      description: 'Explore Indian Culture, Modern World History, Post-Independence, physical geography, and complex social dynamics.',
      icon: BookOpen,
      href: '/mains/prepare/gs1',
      gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
      accent: '#6366f1',
      shadow: 'rgba(99, 102, 241, 0.15)'
    },
    {
      id: 'gs2',
      code: 'GS Paper II',
      title: 'Governance, Polity & IR',
      description: 'Master the Constitution, executive/legislative policies, social welfare systems, and India\'s diplomatic relations globally.',
      icon: Scale,
      href: '/mains/prepare/gs2',
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      accent: '#10b981',
      shadow: 'rgba(16, 185, 129, 0.15)'
    },
    {
      id: 'gs3',
      code: 'GS Paper III',
      title: 'Economy, Tech, Security & Environment',
      description: 'Analyse economic planning, agriculture, science & technology advancements, internal security threats, and disaster management.',
      icon: ShieldAlert,
      href: '/mains/prepare/gs3',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      accent: '#f59e0b',
      shadow: 'rgba(245, 158, 11, 0.15)'
    },
    {
      id: 'gs4',
      code: 'GS Paper IV',
      title: 'Ethics, Integrity & Aptitude',
      description: 'Resolve ethical dilemmas, study moral philosophers, master public administration ethics, and review high-yield case studies.',
      icon: HeartHandshake,
      href: '/mains/prepare/gs4',
      gradient: 'linear-gradient(135deg, #a855f7, #7c3aed)',
      accent: '#a855f7',
      shadow: 'rgba(168, 85, 247, 0.15)'
    },
    {
      id: 'essay',
      code: 'Essay Paper',
      title: 'Philosophical & Socio-Economic Themes',
      description: 'Structure synthesis-rich, topper-grade essays on core philosophical, socio-economic, and political dimensions.',
      icon: PenTool,
      href: '/mains/prepare/essay',
      gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)',
      accent: '#f43f5e',
      shadow: 'rgba(244, 63, 94, 0.15)'
    }
  ];

  const getOptionalConfig = (slug) => {
    switch (slug) {
      case 'geography':
        return {
          icon: Globe,
          gradient: 'linear-gradient(135deg, #10b981, #0ea5e9)',
          accent: '#10b981',
          shadow: 'rgba(16, 185, 129, 0.15)',
          description: 'Physical geography, human geography, climatology, Indian geography, and map-based syllabus nodes.',
          isLive: true,
        };
      case 'psir':
        return {
          icon: Scale,
          gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          accent: '#6366f1',
          shadow: 'rgba(99, 102, 241, 0.15)',
          description: 'Political theory, Indian government & politics, comparative politics, and international relations.',
          isLive: false,
        };
      case 'pub-ad':
        return {
          icon: Award,
          gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
          accent: '#f59e0b',
          shadow: 'rgba(245, 158, 11, 0.15)',
          description: 'Administrative theory, public policy, financial administration, and Indian governance administration.',
          isLive: false,
        };
      case 'sociology':
        return {
          icon: Users,
          gradient: 'linear-gradient(135deg, #a855f7, #7c3aed)',
          accent: '#a855f7',
          shadow: 'rgba(168, 85, 247, 0.15)',
          description: 'Sociological theories, social stratification, family structure, and developmental dynamics of Indian society.',
          isLive: false,
        };
      case 'agriculture':
        return {
          icon: Leaf,
          gradient: 'linear-gradient(135deg, #22c55e, #15803d)',
          accent: '#22c55e',
          shadow: 'rgba(34, 197, 94, 0.15)',
          description: 'Ecology, crop production, soil science, agricultural economics, cell biology, and genetics.',
          isLive: false,
        };
      case 'history':
        return {
          icon: Hourglass,
          gradient: 'linear-gradient(135deg, #f43f5e, #be123c)',
          accent: '#f43f5e',
          shadow: 'rgba(244, 63, 94, 0.15)',
          description: 'Ancient, medieval, modern Indian history, world history, and mapping nodes.',
          isLive: false,
        };
      default:
        return {
          icon: Compass,
          gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
          accent: '#06b6d4',
          shadow: 'rgba(6, 182, 212, 0.15)',
          description: 'Research methods, human evolution, socio-cultural anthropology, and physical anthropology.',
          isLive: false,
        };
    }
  };

  return (
    <div className="prepare-hub-container">
      {/* Background blobs */}
      <div className="prepare-hub-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="prepare-hub-content">
        {/* Navigation Breadcrumb */}
        <div className="breadcrumb">
          <Link href="/mains" className="breadcrumb-link">
            <Home size={14} />
            <span>Mains Intelligence</span>
          </Link>
          <ChevronRight size={14} className="separator" />
          <span className="current">Prepare</span>
        </div>

        {/* Header */}
        <header className="prepare-hub-header">
          <h1 className="prepare-hub-title">Mains <span>Neural Base</span></h1>
          <p className="prepare-hub-subtitle">
            Consolidated, syllabus-mapped knowledge base structured specifically for UPSC Mains answer writing. Select a paper to begin.
          </p>
        </header>

        {/* Paper Grid */}
        <div className="paper-grid">
          {papers.map((paper) => {
            const Icon = paper.icon;
            return (
              <Link key={paper.id} href={paper.href} className="paper-card">
                <div className="card-top-border" style={{ background: paper.gradient }}></div>
                <div className="card-glow" style={{ background: paper.gradient, opacity: 0.03, boxShadow: `0 0 40px ${paper.shadow}` }}></div>
                
                <div className="card-header">
                  <span className="paper-code" style={{ color: paper.accent, background: `${paper.accent}12`, borderColor: `${paper.accent}25` }}>
                    {paper.code}
                  </span>
                  <div className="icon-box" style={{ color: paper.accent, background: `${paper.accent}12` }}>
                    <Icon size={24} />
                  </div>
                </div>

                <div className="card-body">
                  <h2 className="card-title">{paper.title}</h2>
                  <p className="card-description">{paper.description}</p>
                </div>

                <div className="card-footer" style={{ color: paper.accent }}>
                  <span>Study Syllabus Nodes</span>
                  <ChevronRight size={16} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Optional Section */}
        {(!loadingOptionals && optionals.length > 0) && (
          <div style={{ marginTop: '72px', borderTop: '1px solid var(--border-color)', paddingTop: '64px' }}>
            <header className="prepare-hub-header" style={{ marginBottom: '36px' }}>
              <h2 className="prepare-hub-title" style={{ fontSize: '2.1rem' }}>Optional Subject <span>Neural Bases</span></h2>
              <p className="prepare-hub-subtitle">
                Syllabus-mapped study rooms featuring dynamic content, OCR notes, and active vector RAG labs for UPSC Optional subjects.
              </p>
            </header>

            <div className="paper-grid">
              {optionals.map((opt) => {
                const config = getOptionalConfig(opt.slug);
                const Icon = config.icon;
                const isLive = config.isLive;
                
                return (
                  <div key={opt.slug} className={`paper-card ${!isLive ? 'locked-card' : ''}`}>
                    {isLive ? (
                      <Link href={`/mains/prepare/optional/${opt.slug}`} className="card-link-wrapper" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div className="card-top-border" style={{ background: config.gradient }}></div>
                        <div className="card-glow" style={{ background: config.gradient, opacity: 0.03, boxShadow: `0 0 40px ${config.shadow}` }}></div>
                        
                        <div className="card-header">
                          <span className="paper-code" style={{ color: config.accent, background: `${config.accent}12`, borderColor: `${config.accent}25` }}>
                            Live Base
                          </span>
                          <div className="icon-box" style={{ color: config.accent, background: `${config.accent}12` }}>
                            <Icon size={24} />
                          </div>
                        </div>

                        <div className="card-body">
                          <h2 className="card-title">{opt.name}</h2>
                          <p className="card-description">{config.description}</p>
                        </div>

                        <div className="card-footer" style={{ color: config.accent }}>
                          <span>Enter Optional Lab</span>
                          <ChevronRight size={16} />
                        </div>
                      </Link>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
                        <div className="card-top-border" style={{ background: 'var(--border-color)', opacity: 0.4 }}></div>
                        
                        <div className="card-header">
                          <span className="paper-code" style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)', opacity: 0.6 }}>
                            Coming Soon
                          </span>
                          <div className="icon-box" style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', opacity: 0.6 }}>
                            <Lock size={18} />
                          </div>
                        </div>

                        <div className="card-body" style={{ opacity: 0.4 }}>
                          <h2 className="card-title">{opt.name}</h2>
                          <p className="card-description">{config.description}</p>
                        </div>

                        <div className="card-footer" style={{ color: 'var(--text-muted)', opacity: 0.4 }}>
                          <span>Locked Base</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .prepare-hub-container {
          min-height: 100vh;
          background: var(--bg-primary);
          color: var(--text-primary);
          position: relative;
          overflow: hidden;
          font-family: 'Outfit', sans-serif;
          padding: 80px 24px 100px;
        }

        .prepare-hub-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }

        .blob {
          position: absolute;
          width: 500px;
          height: 500px;
          background: var(--hero-bg-gradient);
          filter: blur(80px);
        }

        .blob-1 { top: -100px; left: -100px; }
        .blob-2 { bottom: -100px; right: -100px; }

        .prepare-hub-content {
          position: relative;
          zIndex: 10;
          max-width: 1200px;
          margin: 0 auto;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 40px;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        :global(.breadcrumb-link) {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s;
        }

        :global(.breadcrumb-link:hover) {
          color: var(--text-primary);
        }

        .separator {
          color: var(--border-color);
        }

        .current {
          color: var(--text-secondary);
          font-weight: 600;
        }

        .prepare-hub-header {
          margin-bottom: 50px;
          text-align: left;
        }

        .prepare-hub-title {
          font-size: 2.5rem;
          font-weight: 900;
          margin: 0 0 12px;
          letter-spacing: -0.02em;
        }

        .prepare-hub-title span {
          background: linear-gradient(135deg, #10b981, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .prepare-hub-subtitle {
          font-size: 1.1rem;
          color: var(--text-secondary);
          max-width: 650px;
          line-height: 1.6;
          margin: 0;
        }

        .paper-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
        }

        :global(.paper-card) {
          position: relative;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 24px;
          padding: 32px;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(12px);
        }

        :global(.paper-card:hover:not(.locked-card)) {
          transform: translateY(-6px);
          border-color: var(--border-hover);
          background: var(--bg-hover);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        :global(.paper-card.locked-card) {
          opacity: 0.7;
          border-color: rgba(255, 255, 255, 0.03);
          background: rgba(255, 255, 255, 0.01);
          cursor: not-allowed;
        }

        .card-top-border {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
        }

        .card-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          border-radius: 24px;
          filter: blur(40px);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .paper-code {
          font-size: 0.75rem;
          font-weight: 800;
          padding: 6px 14px;
          border-radius: 12px;
          border: 1px solid;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .icon-box {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-body {
          flex: 1;
        }

        .card-title {
          font-size: 1.35rem;
          font-weight: 800;
          margin: 0 0 12px;
          line-height: 1.4;
          color: var(--text-primary);
        }

        .card-description {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        .card-footer {
          margin-top: 32px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          font-weight: 700;
          opacity: 0.8;
          transition: transform 0.2s ease;
        }

        :global(.paper-card:hover:not(.locked-card)) .card-footer {
          opacity: 1;
          transform: translateX(4px);
        }

        @media (max-width: 768px) {
          .prepare-hub-container { padding: 60px 16px; }
          .prepare-hub-title { font-size: 2rem; }
          .paper-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
