"use client";

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Calendar } from 'lucide-react';

export default function NewsHub() {
  const [news, setNews] = useState({ articles: [] });
  const [loading, setLoading] = useState(true);
  const [activeArticleId, setActiveArticleId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSource, setSelectedSource] = useState('ALL');
  const dateInputRef = useRef(null);

  const sources = ['ALL', 'The Hindu', 'Indian Express', 'PIB', 'AIR', 'Other'];
  
  // Date Logic: Current week (Monday Start)
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    const day = today.getDay(); // 0 is Sunday, 1 is Monday...
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* COMPACT STRATEGIC HEADER */}
      <header style={{ padding: '0.75rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0a0a0f', display: 'grid', gridTemplateColumns: 'minmax(250px, 1.2fr) 3fr', alignItems: 'center', gap: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', letterSpacing: '-0.5px', marginBottom: '0.1rem' }}>Strategic Intelligence Hub</h1>
          <p style={{ color: '#475569', fontSize: '0.7rem', fontWeight: 700 }}>Real-time Synthesis • <strong style={{ color: '#10b981' }}>Gemma 4</strong></p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', justifyContent: 'flex-end' }}>
          {/* SOURCE FILTERS (EMERALD) */}
          <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.01)', padding: '0.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)' }}>
            {sources.map(src => (
              <button 
                key={src}
                onClick={(e) => { e.stopPropagation(); setSelectedSource(src); }}
                style={filterChipStyle(selectedSource === src)}
              >
                {src}
              </button>
            ))}
          </div>

          <div style={{ height: '30px', width: '1px', background: 'rgba(255,255,255,0.05)' }} />

          {/* COMPACT DATE STRIP (AMBER) */}
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#475569', letterSpacing: '1px', marginRight: '0.5rem' }}>WEEK</span>
            {weekDates.map(dateStr => {
              const d = new Date(dateStr);
              const isActive = selectedDate === dateStr;
              return (
                <div 
                  key={dateStr} 
                  onClick={() => setSelectedDate(dateStr)}
                  style={dateCardStyle(isActive)}
                >
                  <span style={{ fontSize: '0.55rem', fontWeight: 800, opacity: 0.5 }}>{d.toLocaleDateString([], { weekday: 'short' }).toUpperCase()}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 900 }}>{d.toLocaleDateString([], { day: '2-digit' })}</span>
                </div>
              );
            })}

            {/* HISTORICAL DATE PICKER (CONCISE) */}
            <div style={{ height: '30px', width: '1px', background: 'rgba(255,255,255,0.05)', margin: '0 0.5rem' }} />
            
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {!isDateInCurrentWeek && (
                <div style={{ background: '#f59e0b', color: '#0f172a', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 900 }}>
                  {new Date(selectedDate).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' })}
                </div>
              )}
              
              <button 
                onClick={() => dateInputRef.current?.showPicker()}
                style={{ ...dateCardStyle(false), width: '32px', background: !isDateInCurrentWeek ? '#f59e0b' : 'rgba(255,255,255,0.02)', color: !isDateInCurrentWeek ? '#0f172a' : '#64748b' }}
                title="Historical Intelligence"
              >
                <Calendar size={14} />
              </button>
              
              <input 
                type="date" 
                ref={dateInputRef}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0, padding: 0 }}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="loader">Synchronizing Intelligence...</div>
        </div>
      ) : (
        <div className="dashboard-container" style={{ display: 'flex', flex: 1, height: 'calc(100vh - 65px)', overflow: 'hidden' }}>
          
          {/* LEFT SIDEBAR: NEWS FEED */}
          <aside style={sidebarStyle}>
            <div style={{ padding: '1.25rem', fontSize: '0.7rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              Briefings Grid ({filteredArticles.length})
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
              {filteredArticles.length > 0 ? filteredArticles.map(article => (
                <div 
                  key={article.id} 
                  onClick={() => setActiveArticleId(article.id)}
                  style={sidebarItemStyle(activeArticleId === article.id)}
                >
                  <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.4rem' }}>
                    <span style={miniTagStyle}>{article.source}</span>
                    <span style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 700 }}>{new Date(article.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: activeArticleId === article.id ? 'white' : '#94a3b8', lineHeight: 1.4 }}>
                    {article.title}
                  </div>
                </div>
              )) : (
                <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#475569', fontSize: '0.85rem', fontWeight: 700 }}>
                  NO BRIEFINGS FOUND.
                </div>
              )}
            </div>
          </aside>

          {/* MAIN CANVAS: INSIGHTS & ANALYSIS */}
          <main style={{ flex: 1, overflowY: 'auto', padding: '2.5rem', background: '#0f172a' }}>
            
            {/* If an article is active AND it matches filters, show Deep Dive */}
            {activeArticle && filteredArticles.some(a => a.id === activeArticleId) ? (
              <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                <header style={{ marginBottom: '3rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <span style={tagStyle}>{activeArticle.source}</span>
                      <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700 }}>SYNTHESIZED {new Date(activeArticle.publishedAt).toLocaleTimeString()}</span>
                      <span style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: 900, textTransform: 'uppercase' }}>{activeArticle.category}</span>
                   </div>
                   <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', lineHeight: 1.1, letterSpacing: '-0.02em' }}>{activeArticle.title}</h2>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                  
                  {/* PRELIMS FACTOR (PF) */}
                  <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <h3 style={sectionHeaderStyle('PRELIMS')}>PRELIMS FACTOR (PF)</h3>
                    {activeArticle.facts?.filter(f => f.type === 'PRELIMS_FACT').map(fact => (
                      <div key={fact.id} style={factCardStyle('PRELIMS')}>
                        <p style={{ fontWeight: 600, color: 'white', lineHeight: 1.6, fontSize: '1rem', marginBottom: '1.5rem' }}>{fact.content}</p>
                        {fact.questionData && (
                          <div style={mcqBoxStyle}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#3b82f6', marginBottom: '0.75rem', textTransform: 'uppercase' }}>CHALLENGE MCQ</div>
                            <p style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '1rem' }}>Q: {fact.questionData.question}</p>
                            <ol style={{ margin: 0, paddingLeft: '1.2rem', color: '#94a3b8', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                              {fact.questionData.options?.map((opt, i) => <li key={i} style={{ fontWeight: 500 }}>{opt}</li>)}
                            </ol>
                            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(59,130,246,0.1)', fontSize: '0.85rem' }}>
                              <strong style={{ color: '#10b981' }}>Correct Answer: {fact.questionData.answer}</strong>
                              <p style={{ color: '#64748b', marginTop: '0.5rem', lineHeight: 1.6 }}>{fact.questionData.explanation}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </section>

                  {/* MAINS FACTOR (MF) */}
                  <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <h3 style={sectionHeaderStyle('MAINS')}>MAINS FACTOR (MF)</h3>
                    {activeArticle.editorials?.map(ed => (
                      <div key={ed.id} style={{ ...factCardStyle('MAINS'), borderLeft: '4px solid #818cf8' }}>
                         <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#818cf8', marginBottom: '0.75rem', textTransform: 'uppercase' }}>CORE ANALYTICS - {ed.gsPaper}</div>
                         <h4 style={{ fontWeight: 900, color: 'white', marginBottom: '1rem', fontSize: '1.2rem', lineHeight: 1.3 }}>{ed.issue}</h4>
                         <div style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.7 }}>{ed.crux}</div>
                      </div>
                    ))}
                    {activeArticle.facts?.filter(f => f.type === 'MAINS_FACT').map(fact => (
                      <div key={fact.id} style={factCardStyle('MAINS')}>
                        <p style={{ fontWeight: 600, color: 'white', lineHeight: 1.6, fontSize: '0.95rem', marginBottom: '1.25rem' }}>{fact.content}</p>
                        {fact.mainsQuestion && (
                          <div style={mqBoxStyle}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#818cf8', marginBottom: '0.75rem', textTransform: 'uppercase' }}>ANALYTICAL INQUIRY</div>
                            <p style={{ fontWeight: 700, color: '#cbd5e1', margin: 0, fontStyle: 'italic', fontSize: '0.95rem', lineHeight: 1.5 }}>{fact.mainsQuestion}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </section>
                </div>
              </div>
            ) : (
              /* DEFAULT VIEW: MERGED STRATEGIC INSIGHTS */
              <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white' }}>Strategic Global Trendline</h3>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Aggregated High-Priority Shifts</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {strategicInsights.map((insight, i) => (
                    <div key={i} style={insightCardStyle}>
                      <span style={insightTagStyle}>{insight.tag}</span>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.75rem', color: 'white' }}>{insight.title}</h4>
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6 }}>{insight.content}</p>
                    </div>
                  ))}
                </div>

                <div style={promoBoxStyle}>
                  <h4 style={{ color: '#fbbf24', fontSize: '1.25rem', fontWeight: 900, marginBottom: '0.5rem' }}>Deep Analytical Synthesis</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Advanced AI synthesis for Mains Answer Writing models is being generated for PRO users.</p>
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      <style jsx>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .loader { font-weight: 700; color: #64748b; }
      `}</style>
    </div>
  );
}

const dateCardStyle = (active) => ({
  width: '42px',
  padding: '0.35rem 0',
  borderRadius: '8px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  background: active ? '#f59e0b' : 'transparent',
  color: active ? '#0f172a' : '#64748b',
  border: active ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.04)',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
});

const filterChipStyle = (active) => ({
  background: active ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
  color: active ? '#10b981' : '#475569',
  border: active ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
  padding: '0.3rem 0.8rem',
  borderRadius: '6px',
  fontSize: '0.65rem',
  fontWeight: 900,
  cursor: 'pointer',
  transition: 'all 0.2s',
  textTransform: 'uppercase'
});

const insightCardStyle = {
  background: 'rgba(255,255,255,0.01)',
  border: '1px solid rgba(255,255,255,0.03)',
  borderRadius: '20px',
  padding: '1.75rem',
};

const insightTagStyle = {
  fontSize: '0.6rem',
  fontWeight: 900,
  color: '#10b981',
  background: 'rgba(16, 185, 129, 0.1)',
  padding: '4px 12px',
  borderRadius: '100px',
  display: 'inline-block',
  marginBottom: '1rem',
  letterSpacing: '0.5px'
};

const promoBoxStyle = {
  marginTop: '4rem',
  padding: '3rem',
  background: 'rgba(251, 191, 36, 0.02)',
  border: '1px dashed rgba(251, 191, 36, 0.2)',
  borderRadius: '32px',
  textAlign: 'center'
};

const sidebarStyle = {
  width: '320px',
  borderRight: '1px solid rgba(255,255,255,0.05)',
  display: 'flex',
  flexDirection: 'column',
  background: '#0a0a0f',
};

const sidebarItemStyle = (active) => ({
  padding: '1rem',
  cursor: 'pointer',
  marginBottom: '2px',
  borderRadius: '8px',
  background: active ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
  borderLeft: active ? '3px solid #10b981' : '3px solid transparent',
  transition: 'all 0.2s',
});

const factCardStyle = (type) => ({
  background: 'rgba(255,255,255,0.01)',
  padding: '1.5rem',
  borderRadius: '16px',
  border: `1px solid rgba(255, 255, 255, 0.03)`,
  display: 'flex',
  flexDirection: 'column',
});

const mcqBoxStyle = {
  background: 'rgba(16, 185, 129, 0.01)',
  border: '1px solid rgba(16, 185, 129, 0.08)',
  borderRadius: '12px',
  padding: '1.25rem'
};

const mqBoxStyle = {
  background: 'rgba(245, 158, 11, 0.01)',
  border: '1px solid rgba(245, 158, 11, 0.08)',
  borderRadius: '12px',
  padding: '1.25rem'
};

const sectionHeaderStyle = (type) => ({
  fontSize: '0.9rem',
  fontWeight: 900,
  color: type === 'PRELIMS' ? '#10b981' : '#f59e0b',
  margin: '0 0 0.5rem 0',
  display: 'flex',
  alignItems: 'center',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  borderBottom: `1px solid ${type === 'PRELIMS' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
  paddingBottom: '0.4rem'
});

const tagStyle = {
  background: 'rgba(255,255,255,0.05)',
  color: 'white',
  padding: '0.4rem 1rem',
  borderRadius: '6px',
  fontSize: '0.7rem',
  fontWeight: 900,
  letterSpacing: '1px',
  border: '1px solid rgba(255,255,255,0.1)'
};

const miniTagStyle = {
  background: 'rgba(255,255,255,0.04)',
  color: '#64748b',
  padding: '0.15rem 0.5rem',
  borderRadius: '4px',
  fontSize: '0.6rem',
  fontWeight: 800,
  textTransform: 'uppercase'
};

const emptyStyle = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#1e293b',
  fontSize: '1.5rem',
  fontWeight: 900,
  letterSpacing: '2px',
  textTransform: 'uppercase'
};

