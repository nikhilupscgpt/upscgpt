'use client';

import Link from 'next/link';
import { BookOpen, PenTool, ChevronRight, Lock } from 'lucide-react';

export default function MainsGateway() {
  const options = [
    {
      id: 'prepare',
      title: 'Mains Neural Base',
      subtitle: 'Knowledge & Synthesis',
      description: 'Access the complete GS1-GS4, Essay, and Optional neural knowledge base. Ground your answers in strategic facts and deep academic context.',
      icon: BookOpen,
      href: '/content-portal',
      status: 'live',
      gradient: 'linear-gradient(135deg, #10b981, #3b82f6)',
      accent: '#10b981'
    },
    {
      id: 'evaluate',
      title: 'Answer Evaluation',
      subtitle: 'Studio & Feedback',
      description: 'Upload your answers for structured AI evaluation. Get keyword checks, depth analysis, and model answer comparisons.',
      icon: PenTool,
      href: '#',
      status: 'offline',
      gradient: 'linear-gradient(135deg, #64748b, #475569)',
      accent: '#94a3b8'
    }
  ];

  return (
    <div className="mains-gateway-container">
      <div className="mains-gateway-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="mains-gateway-content">
        <header className="mains-gateway-header">
          <div className="platform-tag">UPSC Mains Intelligence</div>
          <h1 className="mains-gateway-title">Choose Your <span>Path.</span></h1>
          <p className="mains-gateway-subtitle">
            Strategic preparation meets analytical evaluation. Select a mode to begin your session.
          </p>
        </header>

        <div className="mains-gateway-grid">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isLive = opt.status === 'live';
            const Wrapper = isLive ? Link : 'div';

            return (
              <Wrapper 
                key={opt.id} 
                href={opt.href}
                className={`gateway-card ${!isLive ? 'offline' : ''}`}
              >
                <div className="card-border" style={{ background: opt.gradient }}></div>
                
                <div className="card-top">
                  <div className="card-icon-box" style={{ background: `${opt.accent}22`, color: opt.accent }}>
                    <Icon size={32} />
                  </div>
                  <div className={`card-status ${isLive ? 'live' : 'offline'}`}>
                    {isLive ? (
                      <><span className="dot"></span> LIVE</>
                    ) : (
                      <><Lock size={12} /> COMING SOON</>
                    )}
                  </div>
                </div>

                <div className="card-body">
                  <div className="card-subtitle" style={{ color: opt.accent }}>{opt.subtitle}</div>
                  <h2 className="card-title">{opt.title}</h2>
                  <p className="card-desc">{opt.description}</p>
                </div>

                {isLive && (
                  <div className="card-footer">
                    <span>Enter Command Center</span>
                    <ChevronRight size={16} />
                  </div>
                )}
              </Wrapper>
            );
          })}
        </div>

        <Link href="/" className="back-link">
          Back to Control Center
        </Link>
      </div>

      <style jsx>{`
        .mains-gateway-container {
          min-height: 100vh;
          background: #020617;
          color: white;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Outfit', sans-serif;
        }

        .mains-gateway-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .blob {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
          filter: blur(80px);
        }

        .blob-1 { top: -100px; left: -100px; }
        .blob-2 { bottom: -100px; right: -100px; }

        .mains-gateway-content {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1000px;
          padding: 40px 20px;
          text-align: center;
        }

        .mains-gateway-header {
          margin-bottom: 60px;
        }

        .platform-tag {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #10b981;
          background: rgba(16, 185, 129, 0.1);
          padding: 6px 16px;
          border-radius: 20px;
          margin-bottom: 24px;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .mains-gateway-title {
          font-size: 3.5rem;
          font-weight: 900;
          margin: 0 0 16px;
          letter-spacing: -0.02em;
        }

        .mains-gateway-title span {
          background: linear-gradient(135deg, #10b981, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .mains-gateway-subtitle {
          font-size: 1.1rem;
          color: #94a3b8;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .mains-gateway-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
          margin-bottom: 48px;
        }

        .gateway-card {
          position: relative;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 32px;
          padding: 40px;
          text-align: left;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .gateway-card.live:hover {
          transform: translateY(-10px);
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }

        .gateway-card.offline {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .card-border {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
        }

        .card-icon-box {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-status {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 6px 12px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          letter-spacing: 0.05em;
        }

        .card-status.live {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }

        .card-status.live .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 8px #22c55e;
        }

        .card-status.offline {
          background: rgba(148, 163, 184, 0.1);
          color: #94a3b8;
        }

        .card-subtitle {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 8px;
        }

        .card-title {
          font-size: 1.75rem;
          font-weight: 800;
          margin: 0 0 16px;
          color: white;
        }

        .card-desc {
          font-size: 0.95rem;
          color: #94a3b8;
          line-height: 1.6;
          margin: 0;
        }

        .card-footer {
          margin-top: 40px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          font-weight: 700;
          color: white;
          opacity: 0.6;
          transition: opacity 0.3s;
        }

        .gateway-card:hover .card-footer {
          opacity: 1;
        }

        .back-link {
          font-size: 0.85rem;
          font-weight: 700;
          color: #64748b;
          text-decoration: none;
          transition: color 0.3s;
        }

        .back-link:hover {
          color: white;
        }

        @media (max-width: 768px) {
          .mains-gateway-title { font-size: 2.5rem; }
          .mains-gateway-grid { grid-template-columns: 1fr; }
          .gateway-card { padding: 30px; }
        }
      `}</style>
    </div>
  );
}
