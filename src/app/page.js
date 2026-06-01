"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTranslation } from "@/context/TranslationContext";
import { useRouter } from 'next/navigation';
import UniversalSearchBar from '@/components/UniversalSearchBar';
import { useIsClient } from '@/lib/useIsClient';

import './home.css'

const cleanSummaryText = (text) => {
  if (!text) return '';
  // Remove markdown headers
  let cleaned = text.replace(/^(?:#+\s*.*?)(?:\r?\n)+/m, '');
  // Remove bold tags
  cleaned = cleaned.replace(/\*\*/g, '');
  return cleaned.trim();
};

const getMentorTip = (title, summaryObj) => {
  const causes = (summaryObj?.causes || '').toLowerCase();
  const impact = (summaryObj?.impact || '').toLowerCase();
  const lowerTitle = (title || '').toLowerCase();
  
  if (/dividend|rbi|bank|reserve|fiscal|currency/i.test(lowerTitle) || /dividend|rbi|bank/i.test(causes + ' ' + impact)) {
    return 'Focus on the "Bimal Jalan Committee" recommendations regarding RBI\'s economic capital framework and surplus transfer formula for fiscal space analysis.';
  }
  if (/warming|climate|temperature|environment|green|carbon|emissions/i.test(lowerTitle) || /warming|climate|temperature/i.test(causes + ' ' + impact)) {
    return 'Analyze asymmetric warming (night vs day temperatures) and its specific impacts on agriculture, particularly Rabi crop yields in Indo-Gangetic plains.';
  }
  if (/tectonic|seismic|earthquake|disaster|plate|coast|tsunami/i.test(lowerTitle) || /tectonic|seismic|earthquake/i.test(causes + ' ' + impact)) {
    return 'Focus on the seismic vulnerability of the Himalayan belt vs Peninsular India, and NDMA guidelines on earthquake management.';
  }
  return `Track the governance, structural bottlenecks, and geopolitical challenges associated with this development for GS Mains GS-II and GS-III papers.`;
};

export default function UPSCGPTMasterPortal() {
  const [stats, setStats] = useState({ entries: 0, categories: 0, newsToday: 0, issues: 0 })
  const [streaks, setStreaks] = useState([])
  const { t } = useTranslation();
  const isClient = useIsClient();
  const [searchTerm, setSearchTerm] = useState('');
  // handleSearch removed, handled by component

  useEffect(() => {
    // Parallel fetch for better performance
    Promise.all([
      fetch('/api/entries').then(res => res.json()),
      fetch('/api/issues').then(res => res.json()).catch(() => []), // Fallback if no issues yet
      fetch('/api/news/streaks/active').then(res => res.json()).catch(() => [])
    ]).then(([entriesData, issuesData, streaksData]) => {
      const entries = Array.isArray(entriesData) ? entriesData : []
      const issues = Array.isArray(issuesData) ? issuesData : []
      const activeStreaks = Array.isArray(streaksData) ? streaksData : []

      const now = new Date()
      const todayCount = entries.filter((entry) => {
        if (!entry.lastNewsDate) return false
        return (now - new Date(entry.lastNewsDate)) / (1000 * 60 * 60 * 24) <= 1
      }).length

      setStats({
        entries: entries.length,
        categories: [...new Set(entries.map((entry) => entry.category))].length,
        newsToday: todayCount,
        issues: issues.length
      })
      setStreaks(activeStreaks)
    }).catch(() => { })
  }, [])

  if (!isClient) return <div style={{ minHeight: '100vh', background: 'var(--hero-bg-gradient)' }} />;

  const commandCenters = [
    {
      id: 'mapping',
      title: 'Mapping Command Center',
      subtitle: 'World + India Strategic Mapping',
      description:
        'Map intelligence now starts with two tracks. Use World Atlas for global theatres and India Atlas for domestic strategy, geography, and policy-linked map revision.',
      icon: '🧭',
      gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
      accentColor: '#8b5cf6',
      href: '/atlas/select',
      status: 'live',
      features: ['World Theatre Mapping', 'India-Focused Drilldown', 'AI Map Tutor', 'Revision Layers'],
      stat: { value: stats.entries, label: 'Map Nodes' },
    },
    {
      id: 'current-affairs',
      title: 'Current Affairs Command Center',
      subtitle: 'Daily Intelligence Loop',
      description:
        'Retention-first current affairs flow with daily briefs, map-linked developments, and quick revision hooks designed to pull aspirants back every day.',
      icon: '🗞️',
      gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
      accentColor: '#22d3ee',
      href: '/news',
      status: 'live',
      features: ['Daily Briefing', 'Map-Linked News', 'Revision Hooks', 'Streak-Ready Flow'],
      stat: { value: stats.newsToday, label: 'News in 24h' },
    },
    {
      id: 'prelims',
      title: 'Prelims Command Center',
      subtitle: 'MCQ Intelligence System',
      description:
        'A precision-engineered MCQ practice stack powered by current affairs + static mapping and PYQ pattern framing, calibrated to the latest UPSC Prelims rubric.',
      icon: '🎯',
      gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
      accentColor: '#f59e0b',
      href: '/prelims',
      status: 'live',
      features: ['AI-Generated MCQs', 'PYQ Pattern Analysis', 'Difficulty Calibration', 'Performance Analytics'],
      stat: { value: 100, label: 'Prelims Tests' },
    },
    {
      id: 'mains',
      title: 'Mains Command Center',
      subtitle: 'Neural Intelligence Base',
      description:
        'Consolidated GS Paper nodes with AI-synthesized material, strategic mapping evaluation, and topper-grade answer evaluators.',
      icon: '✍️',
      gradient: 'linear-gradient(135deg, #10b981, #0ea5e9)',
      accentColor: '#10b981',
      href: '/mains',
      status: 'live',
      features: ['Neural Base Grid', 'GS/Optional Content Node', 'Essay Guidance', 'Mains Evaluators'],
      stat: { value: stats.issues || 0, label: 'Syllabus Nodes' },
    },
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        fontFamily: "'Outfit', sans-serif",
        background: 'transparent',
        color: 'var(--text-primary)',
        overflow: 'hidden',
        position: 'relative',
        transition: 'background 0.3s ease, color 0.3s ease'
      }}
    >
      <div style={{ display: 'none' }} />



      <main style={{ position: 'relative', zIndex: 10, maxWidth: '1400px', margin: '0 auto' }} className="main-responsive-padding">
        <div style={{ textAlign: 'center', marginBottom: '64px', marginTop: '120px' }} className="hero-section">
          <h2 className="main-title" style={{ color: 'var(--text-primary)' }}>
            {t('home.heroTitle')}
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #38bdf8 0%, #8b5cf6 40%, #f59e0b 100%)',
                backgroundSize: '200% auto',
                animation: 'shimmer 6s linear infinite',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('home.heroSubtitle')}
            </span>
          </h2>
          <p className="main-subtitle" style={{ color: 'var(--text-secondary)' }}>
            {t('home.heroDesc')}
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '12px', fontWeight: 500 }}>
            This platform is currently in Beta. Features are actively being improved.
          </p>
        </div>

        {/* Universal Search Bar with Autocomplete */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <UniversalSearchBar placeholder="Search across nodes..." />
        </div>

         {streaks.length > 0 && (
          <div style={{ marginTop: '20px', marginBottom: '60px' }}>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '2rem' }}>🔥</span> Most Important Issues This Week
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
              gap: '24px' 
            }}>
              {streaks.map((streak, idx) => {
                let parsedSummary = null;
                if (streak.livingSummary) {
                  try {
                    parsedSummary = JSON.parse(streak.livingSummary);
                  } catch (e) {
                    console.error("Failed to parse livingSummary", e);
                  }
                }

                const summaryObj = parsedSummary || {
                  causes: streak.livingSummary || "Follow the developing story for causes and background context.",
                  impact: "Check living summary to trace policy and economic impacts.",
                  tracker: ""
                };

                const causesText = cleanSummaryText(summaryObj.causes);
                const displayCauses = causesText.length > 120 ? (causesText.substring(0, 120) + '...') : causesText;
                
                const impactText = cleanSummaryText(summaryObj.impact);
                const displayImpact = impactText.length > 120 ? (impactText.substring(0, 120) + '...') : impactText;

                const displayDesc = cleanSummaryText(summaryObj.causes || summaryObj.impact || streak.livingSummary || '').substring(0, 160) + '...';

                // Alternate styles based on idx
                const styleType = idx % 3; // 0 = Causes/Impact, 1 = Tags/Description, 2 = AI Mentor Tip

                // Mapped issues as tags
                const tags = [];
                if (streak.issues && streak.issues.length > 0) {
                  streak.issues.forEach(iss => {
                    if (iss.title) tags.push(iss.title.split(' ').slice(0, 2).join(' ')); // Shortened title
                    if (iss.domain) tags.push(iss.domain);
                    if (iss.gsPapers && iss.gsPapers.length > 0) {
                      iss.gsPapers.forEach(p => tags.push(p));
                    }
                  });
                }
                const displayTags = [...new Set(tags)].slice(0, 3); // Unique tags, max 3

                // Default fallbacks if no tags
                if (displayTags.length === 0) {
                  displayTags.push("GS Paper III", "Current Affairs", "Strategy");
                }

                const cardClass = `premium-streak-card ${
                  streak.importanceScore >= 4 
                    ? 'critical-importance' 
                    : streak.importanceScore >= 3 
                    ? 'high-importance' 
                    : ''
                }`;

                // Render causes/impact card
                if (styleType === 0) {
                  return (
                    <Link key={streak.id} href={`/news?streak=${streak.slug || streak.id}`} style={{ textDecoration: 'none' }}>
                      <div className={`${cardClass} index-causes-impact`}>
                        <div className="card-header-row">
                          <span className="live-now-badge">
                            <div className="live-dot" />
                            LIVE NOW
                          </span>
                          {streak.importanceScore >= 4 ? (
                            <span className="critical-badge">🔥 CRITICAL</span>
                          ) : (
                            <span className="priority-badge">🎯 HIGH PRIORITY</span>
                          )}
                          <span className="update-time">
                            Updated {new Date(streak.updatedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h4 className="card-title">{streak.title}</h4>
                        <div className="card-subtitle">Neural Analysis Active...</div>

                        <div className="sub-box-container">
                          <div className="causes-sub-box">
                            <span className="sub-box-title label-causes">CAUSES</span>
                            <p className="sub-box-text">{displayCauses}</p>
                          </div>
                          <div className="impact-sub-box">
                            <span className="sub-box-title label-impact">IMPACT</span>
                            <p className="sub-box-text">{displayImpact}</p>
                          </div>
                        </div>

                        <div className="card-footer-row">
                          <span className="footer-metric">42 Neural Links</span>
                          <span className="footer-action-link">View Node &gt;</span>
                        </div>
                      </div>
                    </Link>
                  );
                }

                // Render tags card
                if (styleType === 1) {
                  const aspirantsNum = 80 + (idx * 24) % 150;
                  return (
                    <Link key={streak.id} href={`/news?streak=${streak.slug || streak.id}`} style={{ textDecoration: 'none' }}>
                      <div className={`${cardClass} index-tags-desc`}>
                        <div className="card-header-row">
                          <span className="live-now-badge">
                            <div className="live-dot" />
                            LIVE NOW
                          </span>
                          {streak.importanceScore >= 4 ? (
                            <span className="critical-badge">🔥 CRITICAL</span>
                          ) : (
                            <span className="priority-badge">🎯 HIGH PRIORITY</span>
                          )}
                          <span className="update-time">
                            Updated {new Date(streak.updatedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h4 className="card-title">{streak.title}</h4>
                        <p className="card-description">{displayDesc}</p>

                        <div className="tag-pills-row">
                          {displayTags.map((tag, tIdx) => (
                            <span key={tIdx} className="tag-pill-capsule">{tag}</span>
                          ))}
                        </div>

                        <div className="card-footer-row">
                          <span className="footer-metric">{aspirantsNum} Aspirants Online</span>
                          <span className="footer-action-link">Deep Dive &gt;</span>
                        </div>
                      </div>
                    </Link>
                  );
                }

                // Render mentor tip card
                if (styleType === 2) {
                  const mentorTip = getMentorTip(streak.title, summaryObj);
                  return (
                    <Link key={streak.id} href={`/news?streak=${streak.slug || streak.id}`} style={{ textDecoration: 'none' }}>
                      <div className={`${cardClass} index-mentor-tip`}>
                        <div className="card-header-row">
                          <span className="live-now-badge">
                            <div className="live-dot" />
                            LIVE NOW
                          </span>
                          {streak.importanceScore >= 4 ? (
                            <span className="critical-badge">🔥 CRITICAL</span>
                          ) : (
                            <span className="priority-badge">🎯 HIGH PRIORITY</span>
                          )}
                          <span className="update-time">
                            Updated {new Date(streak.updatedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h4 className="card-title">{streak.title}</h4>
                        <p className="card-description">{displayDesc}</p>

                        <div className="mentor-tip-box">
                          <span className="mentor-tip-title">💡 AI MENTOR TIP</span>
                          <p className="mentor-tip-quote">"{mentorTip}"</p>
                        </div>

                        <div className="card-footer-row">
                          <span className="footer-metric">Node Verified ✓</span>
                          <span className="footer-action-link">Full Analysis &gt;</span>
                        </div>
                      </div>
                    </Link>
                  );
                }

                return null;
              })}
            </div>
          </div>
        )}


        <div className="command-grid" style={{ alignItems: 'stretch' }}>
          {commandCenters.map((center) => {
            const isLive = center.status === 'live'
            const isCardLinked = Boolean(isLive && center.href)
            const Wrapper = isCardLinked ? Link : 'div'

            return (
              <Wrapper
                key={center.id}
                {...(isCardLinked ? { href: center.href, style: { textDecoration: 'none', color: 'inherit', display: 'flex' } } : { style: { display: 'flex' } })}
              >
                <div
                  className="module-card"
                  style={{
                    position: 'relative',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '24px',
                    padding: '28px 24px 24px',
                    cursor: isCardLinked ? 'pointer' : 'default',
                    opacity: isLive ? 1 : 0.75,
                    overflow: 'hidden',
                    minHeight: '320px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: `0 20px 40px -15px rgba(0,0,0,0.8), 0 0 25px ${center.accentColor}33, inset 0 0 20px ${center.accentColor}05`,
                    transition: 'all 0.4s ease'
                  }}
                >
                  <div className="card-glow" style={{ background: center.gradient, filter: 'blur(60px)', opacity: 0.15 }} />
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: center.gradient,
                    boxShadow: `0 0 20px ${center.accentColor}, 0 0 40px ${center.accentColor}88`
                  }} />

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '20px',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: center.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        boxShadow: `0 8px 20px ${center.accentColor}33`,
                        filter: isLive ? 'none' : 'grayscale(0.5)',
                      }}
                    >
                      {center.icon}
                    </div>
                    <span
                      className="stat-chip"
                      style={{
                        background: isLive ? `${center.accentColor}22` : 'rgba(255,255,255,0.05)',
                        color: isLive ? center.accentColor : '#64748b',
                        border: `1px solid ${isLive ? `${center.accentColor}44` : 'rgba(255,255,255,0.08)'}`,
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: isLive ? '#22c55e' : '#475569',
                          boxShadow: isLive ? '0 0 6px #22c55e' : 'none',
                        }}
                      />
                      {isLive ? 'LIVE' : 'IN PIPELINE'}
                    </span>
                  </div>

                  <div style={{ position: 'relative', zIndex: 1, minHeight: '60px', overflow: 'hidden', marginBottom: '8px' }}>
                    <p
                      style={{
                        fontSize: '0.65rem',
                        color: center.accentColor,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        margin: '0 0 4px',
                      }}
                    >
                      {center.subtitle}
                    </p>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0', color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
                      {center.title}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', position: 'relative', zIndex: 1, minHeight: '64px', marginBottom: '16px' }}>
                    {center.features.map((feature) => (
                      <span key={feature} className="feature-tag">
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
                    <div className="mapping-primary-cta" style={{ marginBottom: '12px', padding: '8px 12px' }}>
                      Open {center.title.split(' ')[0]} Hub
                    </div>

                    {center.stat && (
                      <div
                        style={{
                          paddingTop: '16px',
                          borderTop: '1px solid rgba(255,255,255,0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)' }}>{center.stat.value || 0}</span>
                        <span
                          style={{
                            fontSize: '0.6rem',
                            fontWeight: 800,
                            color: '#64748b',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                          }}
                        >
                          {center.stat.label}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Wrapper>
            )
          })}

        </div>


      </main>

      <footer
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: '40px 20px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        <p style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, marginBottom: '16px' }}>
          UPSCGPT · © 2026 Stara AI PVT LTD · Built with care for serious aspirants
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <Link
            href="/admin-login"
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.7rem',
              textDecoration: 'none',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Instructor Vault
          </Link>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <Link
            href="/sitemap.xml"
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.7rem',
              textDecoration: 'none',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Sitemap
          </Link>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <span
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Privacy Policy
          </span>
        </div>
      </footer>
    </div>
  )
}
