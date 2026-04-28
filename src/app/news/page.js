"use client";

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Calendar, Menu, X } from 'lucide-react';

export default function NewsHub() {
  const [news, setNews] = useState({ articles: [] });
  const [loading, setLoading] = useState(true);
  const [activeArticleId, setActiveArticleId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dateInputRef = useRef(null);

  const sources = ['ALL', 'The Hindu', 'Indian Express', 'PIB', 'AIR', 'Other'];
  
  // Date Logic: Current week (Monday Start)
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    const day = today.getDay(); 
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); 
    const monday = new Date(today.setDate(diff));
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };
  const weekDates = generateDates();

  const isDateInCurrentWeek = weekDates.includes(selectedDate);

  const strategicInsights = [
    { title: "Indo-Pacific Maritime Corridors", tag: "GEOPOLITICS", content: "Increased naval presence in the South China Sea is reshaping traditional trade routes. Focus on the Malacca Strait and 'String of Pearls' vs 'Necklace of Diamonds' for GS-2." },
    { title: "Himalayan Glacial Retreat", tag: "ENVIRONMENT", content: "Accelerated melting in the HKH region poses long-term threats to the Indus and Brahmaputra basins. Essential for GS-3 disaster management." },
    { title: "Critical Mineral Alliances", tag: "ECONOMY", content: "The race for Lithium/Cobalt in the 'Lithium Triangle' is impacting global supply chains. Focus on the Minerals Security Partnership (MSP)." }
  ];

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch('/api/news/hub');
        const data = await res.json();
        setNews({ articles: data.articles || [] });
        
        if (data.articles?.length > 0) {
          setActiveArticleId(data.articles[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch news hub data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  // Filter Logic
  const filteredArticles = news.articles.filter(article => {
    const matchesSource = selectedSource === 'ALL' || 
                         (selectedSource === 'Other' ? !['The Hindu', 'Indian Express', 'PIB', 'AIR'].includes(article.source) : article.source === selectedSource);
    const matchesDate = article.publishedAt.startsWith(selectedDate);
    return matchesSource && matchesDate;
  });

  // Auto-select first article when filters change
  useEffect(() => {
    if (filteredArticles.length > 0) {
      if (!activeArticleId || !filteredArticles.find(a => a.id === activeArticleId)) {
        setActiveArticleId(filteredArticles[0].id);
      }
    } else {
      setActiveArticleId(null);
    }
  }, [selectedDate, selectedSource, news.articles, activeArticleId, filteredArticles]);

  const activeArticle = news.articles.find(a => a.id === activeArticleId);

  return (
    <div className="news-hub-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#020617', color: 'white' }}>
      
      {/* HEADER */}
      <header className="news-hub-header">
        <div className="news-brand-area">
          <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="brand-text">
            <h1 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white', margin: 0 }}>Strategic News Hub</h1>
            <p style={{ color: '#475569', fontSize: '0.65rem', fontWeight: 700, margin: 0 }}>Real-time Synthesis • <strong style={{ color: '#10b981' }}>Gemma 4</strong></p>
          </div>
        </div>

        <div className="news-filter-area">
          <div className="source-filters-scroll hide-scrollbar">
            {sources.map(src => (
              <button 
                key={src}
                onClick={() => setSelectedSource(src)}
                style={filterChipStyle(selectedSource === src)}
              >
                {src}
              </button>
            ))}
          </div>

          <div className="header-divider" />

          <div className="date-strip-scroll hide-scrollbar">
            {weekDates.map(dateStr => {
              const d = new Date(dateStr);
              const isActive = selectedDate === dateStr;
              return (
                <div 
                  key={dateStr} 
                  onClick={() => setSelectedDate(dateStr)}
                  style={dateCardStyle(isActive)}
                >
                  <span style={{ fontSize: '0.5rem', fontWeight: 800, opacity: 0.5 }}>{d.toLocaleDateString([], { weekday: 'short' }).toUpperCase()}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 900 }}>{d.toLocaleDateString([], { day: '2-digit' })}</span>
                </div>
              );
            })}
            <button 
              onClick={() => dateInputRef.current?.showPicker()}
              style={{ ...dateCardStyle(false), width: '32px', background: !isDateInCurrentWeek ? '#f59e0b' : 'rgba(255,255,255,0.02)', color: !isDateInCurrentWeek ? '#0f172a' : '#64748b' }}
            >
              <Calendar size={14} />
            </button>
            <input 
              type="date" 
              ref={dateInputRef}
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
      </header>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontWeight: 700, color: '#64748b' }}>Synchronizing Intelligence...</div>
        </div>
      ) : (
        <div className="dashboard-content" style={{ display: 'flex', flex: 1, height: 'calc(100vh - 65px)', overflow: 'hidden' }}>
          
          {/* LEFT SIDEBAR: NEWS FEED */}
          <aside className={`news-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
            <div style={{ padding: '1rem', fontSize: '0.6rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              Briefings ({filteredArticles.length})
            </div>
            <div className="sidebar-scroll hide-scrollbar">
              {filteredArticles.length > 0 ? filteredArticles.map(article => (
                <div 
                  key={article.id} 
                  onClick={() => {
                    setActiveArticleId(article.id);
                    setMobileMenuOpen(false);
                  }}
                  style={sidebarItemStyle(activeArticleId === article.id)}
                >
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <span style={miniTagStyle}>{article.source}</span>
                    <span style={{ fontSize: '0.6rem', color: '#475569', fontWeight: 700 }}>{new Date(article.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: activeArticleId === article.id ? 'white' : '#94a3b8', lineHeight: 1.3 }}>
                    {article.title}
                  </div>
                </div>
              )) : (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#475569', fontSize: '0.8rem' }}>
                  No briefings found.
                </div>
              )}
            </div>
          </aside>

          {/* MAIN CANVAS */}
          <main className="news-main hide-scrollbar">
            {activeArticle && filteredArticles.some(a => a.id === activeArticleId) ? (
              <div className="article-container">
                <header style={{ marginBottom: '2rem' }}>
                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={tagStyle}>{activeArticle.source}</span>
                      <span style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 700 }}>{new Date(activeArticle.publishedAt).toLocaleTimeString()}</span>
                      <span style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 900 }}>{activeArticle.category}</span>
                   </div>
                   <h2 className="article-title">{activeArticle.title}</h2>
                </header>

                <div className="article-grid">
                  {/* PRELIMS */}
                  <section className="article-section">
                    <h3 style={sectionHeaderStyle('PRELIMS')}>PRELIMS FACTOR (PF)</h3>
                    {activeArticle.facts?.filter(f => f.type === 'PRELIMS_FACT').map(fact => (
                      <div key={fact.id} style={factCardStyle('PRELIMS')}>
                        <p style={{ fontWeight: 600, color: 'white', lineHeight: 1.6, fontSize: '0.95rem', marginBottom: '1.25rem' }}>{fact.content}</p>
                        {fact.questionData && (
                          <div style={mcqBoxStyle}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#3b82f6', marginBottom: '0.5rem' }}>CHALLENGE MCQ</div>
                            <p style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Q: {fact.questionData.question}</p>
                            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(59,130,246,0.1)', fontSize: '0.8rem' }}>
                              <strong style={{ color: '#10b981' }}>Ans: {fact.questionData.answer}</strong>
                              <p style={{ color: '#64748b', marginTop: '0.25rem', lineHeight: 1.5 }}>{fact.questionData.explanation}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </section>

                  {/* MAINS */}
                  <section className="article-section">
                    <h3 style={sectionHeaderStyle('MAINS')}>MAINS FACTOR (MF)</h3>
                    {activeArticle.editorials?.map(ed => (
                      <div key={ed.id} style={{ ...factCardStyle('MAINS'), borderLeft: '4px solid #818cf8' }}>
                         <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#818cf8', marginBottom: '0.5rem' }}>CORE ANALYTICS - {ed.gsPaper}</div>
                         <h4 style={{ fontWeight: 800, color: 'white', marginBottom: '0.75rem', fontSize: '1.1rem' }}>{ed.issue}</h4>
                         <div style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6 }}>{ed.crux}</div>
                      </div>
                    ))}
                  </section>
                </div>
              </div>
            ) : (
              <div className="news-empty-state">
                 <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginBottom: '1rem' }}>Strategic Trendline</h3>
                 <div className="insight-grid">
                    {strategicInsights.map((insight, i) => (
                      <div key={i} className="insight-card">
                        <span className="insight-tag">{insight.tag}</span>
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem' }}>{insight.title}</h4>
                        <p style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.5 }}>{insight.content}</p>
                      </div>
                    ))}
                 </div>
              </div>
            )}
          </main>
        </div>
      )}

      <style jsx>{`
        .news-hub-header {
          display: flex;
          align-items: center;
          padding: 0.75rem 1.5rem;
          background: #0a0a0f;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          gap: 2rem;
          z-index: 100;
        }
        .news-brand-area { display: flex; align-items: center; gap: 1rem; }
        .mobile-toggle { display: none; background: transparent; border: none; color: white; }
        .news-filter-area { flex: 1; display: flex; align-items: center; gap: 1.5rem; justify-content: flex-end; overflow: hidden; }
        .source-filters-scroll, .date-strip-scroll { display: flex; gap: 0.4rem; overflow-x: auto; padding: 2px; }
        .header-divider { width: 1px; height: 24px; background: rgba(255,255,255,0.05); flex-shrink: 0; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        
        .news-sidebar { width: 300px; background: #0a0a0f; border-right: 1px solid rgba(255,255,255,0.05); display: flex; flexDirection: column; }
        .sidebar-scroll { flex: 1; overflow-y: auto; padding: 0.5rem; }
        
        .news-main { flex: 1; overflow-y: auto; padding: 2rem; background: #020617; }
        .article-container { maxWidth: 1000px; margin: 0 auto; }
        .article-title { fontSize: 2rem; fontWeight: 900; lineHeight: 1.2; letterSpacing: -0.02em; color: white; }
        .article-grid { display: grid; gridTemplateColumns: 1fr 1fr; gap: 2rem; }
        .article-section { display: flex; flexDirection: column; gap: 1.5rem; }
        
        .news-empty-state { maxWidth: 900px; margin: 0 auto; }
        .insight-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; }
        .insight-card { background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.03); border-radius: 16px; padding: 1.25rem; }
        .insight-tag { fontSize: 0.55rem; fontWeight: 900; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 2px 8px; border-radius: 99px; margin-bottom: 0.75rem; display: inline-block; }

        @media (max-width: 1024px) {
          .news-hub-header { flex-direction: column; align-items: stretch; gap: 1rem; padding: 1rem; }
          .news-filter-area { justify-content: flex-start; }
          .article-grid { grid-template-columns: 1fr; }
          .news-sidebar { position: fixed; left: 0; top: 0; bottom: 0; z-index: 1000; transform: translateX(-100%); transition: transform 0.3s ease; width: 280px; box-shadow: 10px 0 30px rgba(0,0,0,0.5); }
          .news-sidebar.open { transform: translateX(0); }
          .mobile-toggle { display: block; }
          .article-title { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  );
}

const dateCardStyle = (active) => ({
  minWidth: '40px',
  padding: '0.3rem 0',
  borderRadius: '8px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  background: active ? '#f59e0b' : 'transparent',
  color: active ? '#0f172a' : '#64748b',
  border: active ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.04)',
  transition: 'all 0.2s',
  flexShrink: 0
});

const filterChipStyle = (active) => ({
  background: active ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
  color: active ? '#10b981' : '#475569',
  border: active ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
  padding: '0.3rem 0.75rem',
  borderRadius: '6px',
  fontSize: '0.6rem',
  fontWeight: 900,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'all 0.2s',
  textTransform: 'uppercase'
});

const sidebarItemStyle = (active) => ({
  padding: '0.75rem',
  cursor: 'pointer',
  marginBottom: '2px',
  borderRadius: '8px',
  background: active ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
  borderLeft: active ? '3px solid #10b981' : '3px solid transparent',
  transition: 'all 0.2s',
});

const miniTagStyle = {
  background: 'rgba(255,255,255,0.04)',
  color: '#64748b',
  padding: '0.1rem 0.4rem',
  borderRadius: '4px',
  fontSize: '0.55rem',
  fontWeight: 800,
  textTransform: 'uppercase'
};

const tagStyle = {
  background: 'rgba(255,255,255,0.05)',
  color: 'white',
  padding: '0.3rem 0.75rem',
  borderRadius: '6px',
  fontSize: '0.65rem',
  fontWeight: 900,
  border: '1px solid rgba(255,255,255,0.1)'
};

const sectionHeaderStyle = (type) => ({
  fontSize: '0.8rem',
  fontWeight: 900,
  color: type === 'PRELIMS' ? '#10b981' : '#f59e0b',
  margin: '0 0 0.25rem 0',
  display: 'flex',
  alignItems: 'center',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  borderBottom: `1px solid ${type === 'PRELIMS' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
  paddingBottom: '0.3rem'
});

const factCardStyle = (type) => ({
  background: 'rgba(255,255,255,0.01)',
  padding: '1.25rem',
  borderRadius: '16px',
  border: `1px solid rgba(255, 255, 255, 0.03)`,
  display: 'flex',
  flexDirection: 'column',
});

const mcqBoxStyle = {
  background: 'rgba(16, 185, 129, 0.01)',
  border: '1px solid rgba(16, 185, 129, 0.08)',
  borderRadius: '12px',
  padding: '1rem'
};
