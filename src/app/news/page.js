"use client";

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Menu, 
  X, 
  BookOpen, 
  CheckSquare, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  HelpCircle,
  Clock,
  ArrowRight,
  BookOpenText,
  Bookmark,
  Lock
} from 'lucide-react';

export default function NewsHub() {
  const { data: session, status } = useSession();
  const sessionExists = status === 'authenticated';
  const router = useRouter();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeItemId, setActiveItemId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Tabs for the Right Panel (Practice)
  const [practiceTab, setPracticeTab] = useState('prelims');
  
  // Interactive MCQs & subjective questions states
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionId: selectedOptionTextOrLabel }
  const [expandedMainsAnswers, setExpandedMainsAnswers] = useState({}); // { questionId: boolean }
  
  const dateInputRef = useRef(null);
  const sources = ['ALL', 'The Hindu', 'Indian Express', 'PIB', 'AIR', 'Other'];
  
  // Generate dates for current week
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

  async function fetchNews() {
    setLoading(true);
    try {
      const res = await fetch(`/api/news/hub?date=${selectedDate}`);
      const data = await res.json();
      const newFeed = data.feed || [];
      setFeed(newFeed);
      
      if (newFeed.length > 0) {
        setActiveItemId(newFeed[0].id);
      } else {
        setActiveItemId(null);
      }
    } catch (err) {
      console.error("Failed to fetch news hub feed:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNews();
  }, [selectedDate]);

  // Filter logic
  const filteredFeed = feed.filter(item => {
    const matchesSource = selectedSource === 'ALL' || 
                         (selectedSource === 'Other' ? !['The Hindu', 'Indian Express', 'PIB', 'AIR'].includes(item.source) : item.source === selectedSource);
    return matchesSource;
  });

  // Auto-select first item on filter change
  useEffect(() => {
    if (filteredFeed.length > 0) {
      if (!activeItemId || !filteredFeed.find(item => item.id === activeItemId)) {
        setActiveItemId(filteredFeed[0].id);
      }
    } else {
      setActiveItemId(null);
    }
  }, [selectedSource, feed, activeItemId, filteredFeed]);

  const activeItem = feed.find(item => item.id === activeItemId);

  // Parse structured data safely
  const getStructuredData = (item) => {
    if (!item?.structuredData) return null;
    try {
      return typeof item.structuredData === 'string' 
        ? JSON.parse(item.structuredData) 
        : item.structuredData;
    } catch (e) {
      console.error("Error parsing structuredData:", e);
      return null;
    }
  };

  const structured = getStructuredData(activeItem);

  // Parse options for DB questions
  const getOptionsArray = (options) => {
    if (!options) return [];
    try {
      const parsed = typeof options === 'string' ? JSON.parse(options) : options;
      if (Array.isArray(parsed)) {
        return parsed.map((opt, i) => {
          if (/^[A-D]\.\s*/i.test(opt)) {
            return { label: opt.charAt(0).toUpperCase(), text: opt.replace(/^[A-D]\.\s*/i, '') };
          }
          const labels = ['A', 'B', 'C', 'D'];
          return { label: labels[i] || `${i + 1}`, text: opt };
        });
      }
      if (typeof parsed === 'object') {
        return Object.entries(parsed).map(([key, val]) => ({
          label: key.toUpperCase(),
          text: val
        }));
      }
    } catch (e) {
      console.error("Error parsing options:", e);
    }
    return [];
  };

  const isMcqCorrect = (selectedVal, correctVal) => {
    if (!selectedVal || !correctVal) return false;
    const clean = (str) => str.replace(/^[A-D]\.\s*/i, '').trim().toLowerCase();
    return clean(selectedVal) === clean(correctVal);
  };

  const isDbQuestionCorrect = (selectedOption, question) => {
    const selectedLabel = selectedOption.label.toUpperCase();
    const correctLabel = (question.correctLabel || '').trim().toUpperCase();
    if (selectedLabel === correctLabel) return true;
    return isMcqCorrect(selectedOption.text, question.correctLabel);
  };

  const getTypeBadgeStyle = (item) => {
    const type = item.contentType || 'NEWS';
    const styles = {
      NEWS: { bg: 'rgba(6, 182, 212, 0.1)', color: '#22d3ee', border: '1px solid rgba(6, 182, 212, 0.25)', label: 'News' },
      EDITORIAL: { bg: 'rgba(139, 92, 246, 0.1)', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.25)', label: 'Editorial' },
      PIB: { bg: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.25)', label: 'PIB' },
      REPORT: { bg: 'rgba(236, 72, 153, 0.1)', color: '#f472b6', border: '1px solid rgba(236, 72, 153, 0.25)', label: 'Report' },
      PRELIMS: { bg: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.25)', label: 'Prelims' },
      MAINS: { bg: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.25)', label: 'Mains' }
    };
    return styles[type] || styles.NEWS;
  };

  // Questions division
  const dbPrelimsQuestions = activeItem?.questions?.filter(q => {
    const options = getOptionsArray(q.options);
    return options.length > 0 || q.tags.includes('prelims');
  }) || [];

  const dbMainsQuestions = activeItem?.questions?.filter(q => {
    const options = getOptionsArray(q.options);
    return options.length === 0 && q.tags.includes('mains');
  }) || [];

  // Practice elements check
  const hasMcqs = Boolean(structured?.mcq || dbPrelimsQuestions.length > 0);
  const hasMainsQuestions = Boolean(dbMainsQuestions.length > 0);
  const hasPracticeItems = hasMcqs || hasMainsQuestions;

  // Render Practice Panel Contents (shared between desktop 3rd column and inline mobile view)
  const renderPracticeBoard = () => {
    if (!hasPracticeItems) {
      return (
        <div className="study-assistant-card">
          <div className="assistant-header">
            <Bookmark size={15} style={{ marginRight: '6px', color: '#a78bfa' }} />
            <span>Topic Study Helper</span>
          </div>
          <p className="assistant-text">
            No mock questions are currently linked to this briefing. While reading:
          </p>
          <ul className="assistant-list">
            <li>Identify key definitions or geographical entities in the text.</li>
            <li>Analyze the cause-effect relationships of the policy decisions.</li>
            <li>Synthesize core arguments into 3 structural bullet points.</li>
          </ul>
        </div>
      );
    }

    return (
      <div className="practice-board-content">
        {/* Toggles */}
        <div className="practice-tabs">
          <button 
            onClick={() => setPracticeTab('prelims')}
            className={`practice-tab-btn ${practiceTab === 'prelims' ? 'active' : ''}`}
            disabled={!hasMcqs}
          >
            <span>Prelims MCQs ({dbPrelimsQuestions.length + (structured?.mcq ? 1 : 0)})</span>
          </button>
          <button 
            onClick={() => setPracticeTab('mains')}
            className={`practice-tab-btn ${practiceTab === 'mains' ? 'active' : ''}`}
            disabled={!hasMainsQuestions}
          >
            <span>Mains Qs ({dbMainsQuestions.length})</span>
          </button>
        </div>

        {/* Content */}
        <div className="practice-body">
          {practiceTab === 'prelims' && hasMcqs && (
            <div className="prelims-questions-list">
              
              {/* Inline MCQ */}
              {structured?.mcq && (
                <div className="mcq-board-card">
                  <div className="mcq-card-badge">AI CHALLENGE MCQ</div>
                  <h4 className="mcq-card-question">{structured.mcq.question}</h4>
                  
                  <div className="mcq-card-options">
                    {structured.mcq.options?.map((option, idx) => {
                      const selected = selectedAnswers[`ai-${activeItem.id}`] === option;
                      const isCorrectOpt = isMcqCorrect(option, structured.mcq.answer);
                      const answered = selectedAnswers[`ai-${activeItem.id}`] !== undefined;
                      
                      let optClass = "interactive";
                      if (answered) {
                        if (isCorrectOpt) optClass = "correct";
                        else if (selected) optClass = "incorrect";
                        else optClass = "disabled";
                      }

                      return (
                        <button 
                          key={idx}
                          disabled={answered}
                          onClick={() => setSelectedAnswers(prev => ({ ...prev, [`ai-${activeItem.id}`]: option }))}
                          className={`mcq-card-option-btn ${optClass}`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>

                  {selectedAnswers[`ai-${activeItem.id}`] !== undefined && (
                    <div className="mcq-card-explanation animate-slide-down">
                      <div className="exp-result-header" style={{ color: isMcqCorrect(selectedAnswers[`ai-${activeItem.id}`], structured.mcq.answer) ? '#10b981' : '#ef4444' }}>
                        {isMcqCorrect(selectedAnswers[`ai-${activeItem.id}`], structured.mcq.answer) ? "✓ Correct Option Selected" : "✗ Incorrect Option"}
                      </div>
                      <p className="exp-sub-text">
                        <strong>Correct Answer:</strong> {structured.mcq.answer}
                      </p>
                      <p className="exp-body-text">
                        <strong>Explanation:</strong> {structured.mcq.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Database Linked MCQs */}
              {dbPrelimsQuestions.map((q) => {
                const options = getOptionsArray(q.options);
                const answered = selectedAnswers[q.id] !== undefined;
                const selectedOpt = selectedAnswers[q.id];

                return (
                  <div key={q.id} className="mcq-board-card">
                    <div className="mcq-card-badge db">CENTRAL MCQ</div>
                    <h4 className="mcq-card-question">{q.text}</h4>
                    
                    <div className="mcq-card-options">
                      {options.map((option, idx) => {
                        const selected = selectedOpt?.label === option.label;
                        const isCorrectOpt = isDbQuestionCorrect(option, q);
                        
                        let optClass = "interactive";
                        if (answered) {
                          if (isCorrectOpt) optClass = "correct";
                          else if (selected) optClass = "incorrect";
                          else optClass = "disabled";
                        }

                        return (
                          <button 
                            key={idx}
                            disabled={answered}
                            onClick={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: option }))}
                            className={`mcq-card-option-btn ${optClass}`}
                          >
                            <strong>{option.label}.</strong> {option.text}
                          </button>
                        );
                      })}
                    </div>

                    {answered && (
                      <div className="mcq-card-explanation animate-slide-down">
                        <div className="exp-result-header" style={{ color: isDbQuestionCorrect(selectedOpt, q) ? '#10b981' : '#ef4444' }}>
                          {isDbQuestionCorrect(selectedOpt, q) ? "✓ Correct Option Selected" : "✗ Incorrect Option"}
                        </div>
                        <p className="exp-sub-text">
                          <strong>Correct Option:</strong> {q.correctLabel}
                        </p>
                        <p className="exp-body-text">
                          <strong>Explanation:</strong> {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

            </div>
          )}

          {practiceTab === 'mains' && hasMainsQuestions && (
            <div className="mains-questions-list">
              {dbMainsQuestions.map((q) => {
                const isExpanded = expandedMainsAnswers[q.id] === true;
                return (
                  <div key={q.id} className="mains-board-card">
                    <div className="mains-card-meta">
                      <span className="difficulty">{q.difficulty || 'MEDIUM'}</span>
                      {q.gsPaper && <span className="paper">{q.gsPaper}</span>}
                    </div>
                    <h4 className="mains-card-question">{q.text}</h4>
                    
                    <button 
                      onClick={() => setExpandedMainsAnswers(prev => ({ ...prev, [q.id]: !isExpanded }))}
                      className="mains-reveal-btn"
                    >
                      <span>{isExpanded ? "Hide Model Framework" : "Reveal Model Framework"}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {isExpanded && (
                      <div className="mains-model-answer animate-slide-down">
                        <div className="model-answer-title">Answer Key & Synthesis Points:</div>
                        <div className="model-markdown-body">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {q.explanation}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {!sessionExists && (
          <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(59, 130, 246, 0.03)', border: '1px solid rgba(59, 130, 246, 0.12)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={16} />
              </div>
              <h4 style={{ color: 'white', margin: 0, fontSize: '0.85rem', fontWeight: 700 }}>Save Your Progress</h4>
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>Sign in to track your score accuracy, save attempts, and unlock personalized streaks.</p>
            <button 
              onClick={() => router.push(`/login?callbackUrl=${window.location.pathname}`)}
              style={{ width: '100%', padding: '8px 16px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)', transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              className="hover-glow-btn"
            >
              Sign In to Save Progress
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="news-hub-wrapper">
      
      {/* HEADER - Adjusted below the 72px Global Header */}
      <header className="news-hub-header">
        <div className="news-brand-area">
          <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="brand-text">
            <h1 className="brand-title">Strategic News Hub</h1>
            <p className="brand-subtitle">
              Daily Intelligence • <strong style={{ color: '#10b981' }}>Intel Engine V2</strong>
            </p>
          </div>
        </div>

        <div className="news-filter-area">
          <div className="source-filters-scroll hide-scrollbar">
            {sources.map(src => (
              <button 
                key={src}
                onClick={() => setSelectedSource(src)}
                className={`filter-chip ${selectedSource === src ? 'active' : ''}`}
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
                  onClick={() => {
                    setSelectedDate(dateStr);
                    setSelectedAnswers({});
                  }}
                  className={`date-card ${isActive ? 'active' : ''}`}
                >
                  <span className="date-card-day">{d.toLocaleDateString([], { weekday: 'short' }).toUpperCase()}</span>
                  <span className="date-card-num">{d.toLocaleDateString([], { day: '2-digit' })}</span>
                </div>
              );
            })}
            <button 
              onClick={() => dateInputRef.current?.showPicker()}
              className="calendar-trigger-btn"
              style={{
                background: !isDateInCurrentWeek ? '#f59e0b' : 'rgba(255,255,255,0.02)',
                color: !isDateInCurrentWeek ? '#0f172a' : '#64748b'
              }}
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
        <div className="loading-state">
          <div className="loader-ring" />
          <div style={{ fontWeight: 700, color: '#94a3b8', fontSize: '0.9rem' }}>Synchronizing Timeline Data...</div>
        </div>
      ) : (
        <div className="dashboard-content">
          
          {/* LEFT COLUMN: TIMELINE FEED */}
          <aside className={`news-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              Timeline Feed ({filteredFeed.length})
            </div>
            <div className="sidebar-scroll hide-scrollbar">
              {filteredFeed.length > 0 ? filteredFeed.map(item => {
                const badge = getTypeBadgeStyle(item);
                const isActive = activeItemId === item.id;
                const displayTime = new Date(item.publishedAt || item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div 
                    key={item.id} 
                    onClick={() => {
                      setActiveItemId(item.id);
                      setMobileMenuOpen(false);
                      setSelectedAnswers({});
                    }}
                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                    style={{
                      borderLeft: isActive ? `3px solid ${badge.color}` : '3px solid transparent'
                    }}
                  >
                    <div className="sidebar-item-meta">
                      <span className="sidebar-badge" style={{ background: badge.bg, color: badge.color, border: badge.border }}>
                        {badge.label}
                      </span>
                      {item.source && <span className="sidebar-source">{item.source}</span>}
                      <span className="sidebar-time">{displayTime}</span>
                    </div>
                    <div className={`sidebar-item-title ${isActive ? 'active' : ''}`}>
                      {item.title}
                    </div>
                    {item.issue?.title && (
                      <div className="sidebar-issue-link">
                        📍 {item.issue.title}
                      </div>
                    )}
                  </div>
                );
              }) : (
                <div className="sidebar-empty">
                  No briefings found.
                </div>
              )}
            </div>
          </aside>

          {activeItem ? (
            <div className="workspace-main-wrapper">
              
              {/* CENTER COLUMN: INTEL BRIEFING */}
              <main className="news-center-canvas hide-scrollbar">
                <div className="article-container animate-fade-in">
                  
                  {/* Article Header */}
                  <header className="article-header">
                    <div className="article-meta-row">
                      <span className="article-badge" style={{ background: getTypeBadgeStyle(activeItem).bg, color: getTypeBadgeStyle(activeItem).color, border: getTypeBadgeStyle(activeItem).border }}>
                        {getTypeBadgeStyle(activeItem).label}
                      </span>
                      {activeItem.source && <span className="meta-text"><Clock size={12} style={{ marginRight: '4px' }} /> {activeItem.source}</span>}
                      {activeItem.author && <span className="meta-text">By {activeItem.author}</span>}
                      <span className="meta-text">
                        {new Date(activeItem.publishedAt || activeItem.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <h2 className="article-title">{activeItem.title}</h2>
                    
                    <div className="header-connections">
                      {activeItem.issue?.title && (
                        <a href={`/issues/${activeItem.issue.slug}`} className="issue-topic-tag" target="_blank" rel="noopener noreferrer">
                          <span>Syllabus Link:</span>
                          <strong>{activeItem.issue.title}</strong>
                          <ExternalLink size={11} style={{ marginLeft: '5px' }} />
                        </a>
                      )}
                      {activeItem.url && (
                        <a href={activeItem.url} target="_blank" rel="noopener noreferrer" className="original-source-link">
                          Original Link <ExternalLink size={11} style={{ marginLeft: '4px' }} />
                        </a>
                      )}
                    </div>
                  </header>

                  {/* HIGH YIELD TAKEAWAY CARDS */}
                  <div className="takeaways-grid">
                    
                    {/* Prelims Factor (PF) */}
                    {structured?.prelimsFact && (
                      <div className="takeaway-card prelims-card">
                        <div className="takeaway-label prelims">
                          <CheckSquare size={13} style={{ marginRight: '5px' }} />
                          <span>Prelims Factor (PF)</span>
                        </div>
                        <p className="takeaway-text">{structured.prelimsFact}</p>
                      </div>
                    )}

                    {/* Mains Factor (MF) */}
                    {structured?.crux && (
                      <div className="takeaway-card mains-card">
                        <div className="takeaway-label mains">
                          <Award size={13} style={{ marginRight: '5px' }} />
                          <span>Mains Focus (MF)</span>
                        </div>
                        <p className="takeaway-text">{structured.crux}</p>
                      </div>
                    )}

                  </div>

                  {/* Core Analysis (Markdown) */}
                  <div className="analysis-section-title">
                    <BookOpenText size={16} style={{ marginRight: '8px', color: '#38bdf8' }} />
                    <span>Analysis & Strategic Summary</span>
                  </div>
                  <div className="markdown-content">
                    {activeItem.rawContent ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {activeItem.rawContent}
                      </ReactMarkdown>
                    ) : (
                      <p style={{ color: '#475569', fontStyle: 'italic' }}>No detailed markdown analysis content generated for this item. Refer to the fact cards or practice questions.</p>
                    )}
                  </div>

                  {/* INLINE MOBILE PRACTICE PANEL (Shown only on small screens) */}
                  <div className="practice-panel-inline-mobile">
                    <div className="mobile-practice-header">
                      <CheckSquare size={16} style={{ color: '#f59e0b' }} />
                      <h3>Practice Questions & Evaluation</h3>
                    </div>
                    {renderPracticeBoard()}
                  </div>

                </div>
              </main>

              {/* RIGHT COLUMN: DEDICATED PRACTICE & EVALUATION BOARD */}
              <aside className="news-right-panel hide-scrollbar">
                <div className="right-panel-sticky-wrapper">
                  <div className="practice-panel-header">
                    <CheckSquare size={16} style={{ color: '#10b981' }} />
                    <h2>Neural Practice Board</h2>
                  </div>
                  {renderPracticeBoard()}
                </div>
              </aside>

            </div>
          ) : (
            <div className="news-empty-state">
              <h2 className="empty-hero-title">Select a Briefing</h2>
              <p className="empty-hero-subtitle">Select an intelligence item from the left timeline to explore core analysis, prelims facts, MCQs, and mains evaluators.</p>
              
              <h3 className="trendline-title">Strategic Trendlines</h3>
              <div className="insight-grid">
                {strategicInsights.map((insight, i) => (
                  <div key={i} className="insight-card">
                    <span className="insight-tag">{insight.tag}</span>
                    <h4 className="insight-card-title">{insight.title}</h4>
                    <p className="insight-card-desc">{insight.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      <style jsx>{`
        .news-hub-wrapper {
          margin-top: 72px; /* Push layout below the 72px global nav */
          height: calc(100vh - 72px);
          display: flex;
          flex-direction: column;
          background: #020617;
          color: white;
          font-family: 'Outfit', sans-serif;
          overflow: hidden;
        }
        
        /* NEWS SUB HEADER */
        .news-hub-header {
          height: 64px;
          display: flex;
          align-items: center;
          padding: 0 1.5rem;
          background: rgba(8, 12, 28, 0.7);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          gap: 2rem;
          z-index: 99;
          flex-shrink: 0;
        }

        .news-brand-area {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .mobile-toggle {
          display: none;
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
        }

        .brand-title {
          font-size: 1.05rem;
          font-weight: 900;
          color: white;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .brand-subtitle {
          color: #475569;
          font-size: 0.62rem;
          font-weight: 700;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .news-filter-area {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          justify-content: flex-end;
          overflow: hidden;
        }

        .source-filters-scroll, .date-strip-scroll {
          display: flex;
          gap: 0.4rem;
          overflow-x: auto;
          padding: 4px;
        }

        .header-divider {
          width: 1px;
          height: 20px;
          background: rgba(255, 255, 255, 0.08);
          flex-shrink: 0;
        }

        .filter-chip {
          background: transparent;
          color: #475569;
          border: 1px solid transparent;
          padding: 0.3rem 0.75rem;
          border-radius: 6px;
          font-size: 0.62rem;
          font-weight: 900;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          text-transform: uppercase;
        }

        .filter-chip:hover {
          color: #94a3b8;
          background: rgba(255, 255, 255, 0.01);
        }

        .filter-chip.active {
          background: rgba(16, 185, 129, 0.08);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .date-card {
          min-width: 40px;
          padding: 0.25rem 0;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.01);
          color: #475569;
          border: 1px solid rgba(255, 255, 255, 0.03);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
        }

        .date-card:hover {
          color: #94a3b8;
          border-color: rgba(255, 255, 255, 0.06);
        }

        .date-card.active {
          background: #f59e0b;
          color: #0f172a;
          border-color: #f59e0b;
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.15);
          font-weight: 800;
        }

        .date-card-day {
          font-size: 0.48rem;
          font-weight: 800;
          opacity: 0.7;
        }

        .date-card-num {
          font-size: 0.8rem;
          font-weight: 900;
        }

        .calendar-trigger-btn {
          width: 32px;
          height: 34px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.04);
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        /* LAYOUT CONTENT CONTAINER */
        .dashboard-content {
          display: flex;
          flex: 1;
          height: calc(100vh - 72px - 64px);
          overflow: hidden;
        }

        .workspace-main-wrapper {
          display: flex;
          flex: 1;
          height: 100%;
          overflow: hidden;
        }

        /* LEFT SIDEBAR */
        .news-sidebar {
          width: 22%;
          min-width: 260px;
          max-width: 320px;
          background: #060913;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          height: 100%;
        }

        .sidebar-header {
          padding: 1rem;
          font-size: 0.62rem;
          font-weight: 900;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .sidebar-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 0.6rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .sidebar-item {
          padding: 0.75rem 0.85rem;
          cursor: pointer;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.005);
          border: 1px solid rgba(255, 255, 255, 0.01);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar-item:hover {
          background: rgba(255, 255, 255, 0.015);
          border-color: rgba(255, 255, 255, 0.03);
        }

        .sidebar-item.active {
          background: rgba(255, 255, 255, 0.025);
          border-color: rgba(255, 255, 255, 0.04);
        }

        .sidebar-item-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          align-items: center;
          margin-bottom: 0.35rem;
        }

        .sidebar-badge {
          font-size: 0.5rem;
          font-weight: 900;
          padding: 0.08rem 0.3rem;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .sidebar-source {
          font-size: 0.55rem;
          color: #475569;
          font-weight: 700;
        }

        .sidebar-time {
          font-size: 0.55rem;
          color: #334155;
          font-weight: 600;
          margin-left: auto;
        }

        .sidebar-item-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          line-height: 1.35;
          transition: color 0.2s;
        }

        .sidebar-item-title.active {
          color: white;
        }

        .sidebar-issue-link {
          font-size: 0.52rem;
          color: #818cf8;
          background: rgba(99, 102, 241, 0.05);
          padding: 0.12rem 0.35rem;
          border-radius: 4px;
          display: inline-block;
          margin-top: 0.35rem;
          font-weight: 700;
        }

        .sidebar-empty {
          padding: 2.5rem 1rem;
          text-align: center;
          color: #334155;
          font-size: 0.75rem;
          font-style: italic;
        }

        /* CENTER INTEL CANVAS */
        .news-center-canvas {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem 2.5rem;
          height: 100%;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          background: #02050f;
        }

        .article-container {
          max-width: 720px;
          margin: 0 auto;
        }

        .article-header {
          margin-bottom: 1.25rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .article-meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          align-items: center;
          margin-bottom: 0.6rem;
        }

        .article-badge {
          font-size: 0.6rem;
          font-weight: 900;
          padding: 0.15rem 0.5rem;
          border-radius: 5px;
          text-transform: uppercase;
        }

        .meta-text {
          font-size: 0.65rem;
          color: #475569;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
        }

        .article-title {
          font-size: 1.5rem;
          font-weight: 900;
          line-height: 1.3;
          letter-spacing: -0.015em;
          color: white;
          margin: 0 0 0.85rem 0;
        }

        .header-connections {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          align-items: center;
        }

        .issue-topic-tag {
          display: inline-flex;
          align-items: center;
          background: rgba(99, 102, 241, 0.06);
          color: #818cf8;
          border: 1px solid rgba(99, 102, 241, 0.15);
          font-size: 0.62rem;
          padding: 0.2rem 0.5rem;
          border-radius: 5px;
          text-decoration: none;
          transition: all 0.2s;
        }

        .issue-topic-tag:hover {
          background: rgba(99, 102, 241, 0.1);
        }

        .issue-topic-tag span {
          opacity: 0.6;
          margin-right: 4px;
        }

        .original-source-link {
          display: inline-flex;
          align-items: center;
          color: #475569;
          font-size: 0.62rem;
          font-weight: 700;
          text-decoration: none;
          transition: color 0.2s;
        }

        .original-source-link:hover {
          color: #64748b;
        }

        /* TAKEAWAYS GRID (Top of Briefing) */
        .takeaways-grid {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          margin-bottom: 1.5rem;
        }

        .takeaway-card {
          padding: 0.95rem 1.15rem;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.005);
        }

        .takeaway-card.prelims-card {
          border: 1px solid rgba(245, 158, 11, 0.12);
          border-left: 3px solid #f59e0b;
          background: linear-gradient(to right, rgba(245, 158, 11, 0.005), transparent);
        }

        .takeaway-card.mains-card {
          border: 1px solid rgba(139, 92, 246, 0.12);
          border-left: 3px solid #8b5cf6;
          background: linear-gradient(to right, rgba(139, 92, 246, 0.005), transparent);
        }

        .takeaway-label {
          font-size: 0.62rem;
          font-weight: 900;
          letter-spacing: 0.5px;
          margin-bottom: 0.4rem;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
        }

        .takeaway-label.prelims { color: #f59e0b; }
        .takeaway-label.mains { color: #c084fc; }

        .takeaway-text {
          font-size: 0.85rem;
          line-height: 1.5;
          color: #cbd5e1;
          margin: 0;
        }

        .analysis-section-title {
          font-size: 0.75rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #64748b;
          margin-bottom: 0.75rem;
          display: inline-flex;
          align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          padding-bottom: 0.35rem;
          width: 100%;
        }

        /* CORE BRIEFING TYPOGRAPHY */
        .markdown-content {
          font-size: 0.88rem;
          line-height: 1.65;
          color: #94a3b8;
        }

        .markdown-content :global(p) {
          margin-bottom: 1rem;
        }

        .markdown-content :global(ul), .markdown-content :global(ol) {
          margin-left: 1.25rem;
          margin-bottom: 1rem;
        }

        .markdown-content :global(li) {
          margin-bottom: 0.3rem;
        }

        .markdown-content :global(h3), .markdown-content :global(h4) {
          color: white;
          font-weight: 800;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }

        .markdown-content :global(blockquote) {
          border-left: 3px solid #3b82f6;
          background: rgba(59, 130, 246, 0.03);
          padding: 0.5rem 0.75rem;
          margin: 0.75rem 0;
          font-style: italic;
          border-radius: 0 6px 6px 0;
        }

        /* RIGHT PANEL: PRACTICE BOARD */
        .news-right-panel {
          width: 28%;
          min-width: 290px;
          max-width: 380px;
          background: #040815;
          border-left: 1px solid rgba(255, 255, 255, 0.05);
          flex-shrink: 0;
          height: 100%;
          overflow-y: auto;
          padding: 1.25rem 1.5rem;
        }

        .right-panel-sticky-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .practice-panel-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          padding-bottom: 0.6rem;
        }

        .practice-panel-header h2 {
          font-size: 0.88rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: white;
          margin: 0;
        }

        .practice-tabs {
          display: flex;
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          padding: 0.2rem;
          gap: 0.2rem;
        }

        .practice-tab-btn {
          flex: 1;
          background: transparent;
          border: none;
          color: #475569;
          padding: 0.45rem;
          border-radius: 6px;
          font-size: 0.68rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
        }

        .practice-tab-btn:not(:disabled):hover {
          color: #94a3b8;
        }

        .practice-tab-btn.active {
          background: rgba(255,255,255,0.03);
          color: white;
        }

        .practice-tab-btn:disabled {
          opacity: 0.25;
          cursor: not-allowed;
        }

        .practice-body {
          margin-top: 0.5rem;
        }

        /* MCQ CARDS ON PRACTICE BOARD */
        .mcq-board-card {
          background: rgba(255, 255, 255, 0.005);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .mcq-card-badge {
          font-size: 0.5rem;
          font-weight: 900;
          color: #06b6d4;
          background: rgba(6, 182, 212, 0.05);
          border: 1px solid rgba(6, 182, 212, 0.15);
          padding: 0.08rem 0.35rem;
          border-radius: 4px;
          display: inline-block;
          margin-bottom: 0.6rem;
          letter-spacing: 0.5px;
        }

        .mcq-card-badge.db {
          color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
          border-color: rgba(59, 130, 246, 0.15);
        }

        .mcq-card-question {
          font-size: 0.82rem;
          font-weight: 800;
          color: white;
          line-height: 1.45;
          margin: 0 0 0.75rem 0;
        }

        .mcq-card-options {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .mcq-card-option-btn {
          width: 100%;
          text-align: left;
          padding: 0.55rem 0.75rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-family: inherit;
          font-weight: 600;
          background: rgba(255,255,255,0.005);
          border: 1px solid rgba(255,255,255,0.02);
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s;
        }

        .mcq-card-option-btn.interactive:hover {
          background: rgba(255, 255, 255, 0.02);
          border-color: rgba(255, 255, 255, 0.05);
          color: white;
          transform: translateX(1px);
        }

        .mcq-card-option-btn.correct {
          background: rgba(16, 185, 129, 0.06);
          border-color: rgba(16, 185, 129, 0.25);
          color: #34d399;
          font-weight: 700;
        }

        .mcq-card-option-btn.incorrect {
          background: rgba(239, 68, 68, 0.06);
          border-color: rgba(239, 68, 68, 0.25);
          color: #f87171;
          font-weight: 700;
        }

        .mcq-card-option-btn.disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .mcq-card-explanation {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.02);
          border-radius: 8px;
          padding: 0.75rem;
          margin-top: 0.75rem;
          font-size: 0.75rem;
        }

        .exp-result-header {
          font-weight: 900;
          margin-bottom: 0.35rem;
        }

        .exp-sub-text {
          color: #cbd5e1;
          margin: 0 0 0.25rem 0;
        }

        .exp-body-text {
          color: #64748b;
          margin: 0;
          line-height: 1.4;
        }

        /* SUBJECTIVE MAINS CARDS */
        .mains-board-card {
          background: rgba(255, 255, 255, 0.005);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .mains-card-meta {
          display: flex;
          gap: 0.4rem;
          margin-bottom: 0.5rem;
        }

        .mains-card-meta span {
          font-size: 0.5rem;
          font-weight: 900;
          padding: 0.08rem 0.35rem;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }

        .mains-card-meta .difficulty {
          color: #fbbf24;
          background: rgba(245, 158, 11, 0.05);
          border: 1px solid rgba(245, 158, 11, 0.15);
        }

        .mains-card-meta .paper {
          color: #818cf8;
          background: rgba(129, 140, 248, 0.05);
          border: 1px solid rgba(129, 140, 248, 0.15);
        }

        .mains-card-question {
          font-size: 0.82rem;
          font-weight: 800;
          color: white;
          line-height: 1.45;
          margin: 0 0 0.75rem 0;
        }

        .mains-reveal-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.03);
          color: #64748b;
          padding: 0.55rem 0.75rem;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .mains-reveal-btn:hover {
          background: rgba(255, 255, 255, 0.02);
          color: white;
        }

        .mains-model-answer {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.02);
          border-radius: 8px;
          padding: 0.85rem;
          margin-top: 0.5rem;
        }

        .model-answer-title {
          font-size: 0.65rem;
          font-weight: 900;
          color: #a78bfa;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.4rem;
        }

        .model-markdown-body {
          font-size: 0.78rem;
          line-height: 1.5;
          color: #94a3b8;
        }

        /* FALLBACK CARD IF NO QUESTIONS */
        .study-assistant-card {
          background: rgba(255, 255, 255, 0.003);
          border: 1px dashed rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 1rem 1.25rem;
        }

        .assistant-header {
          display: flex;
          align-items: center;
          font-size: 0.72rem;
          font-weight: 900;
          color: white;
          margin-bottom: 0.5rem;
        }

        .assistant-text {
          font-size: 0.78rem;
          color: #64748b;
          line-height: 1.45;
          margin: 0 0 0.6rem 0;
        }

        .assistant-list {
          margin: 0;
          padding-left: 1rem;
          font-size: 0.75rem;
          color: #475569;
          line-height: 1.5;
        }

        .assistant-list li {
          margin-bottom: 0.4rem;
        }

        /* MOBILE PRACTICE ELEMENT: Hidden on Desktop */
        .practice-panel-inline-mobile {
          display: none;
          margin-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          padding-top: 2rem;
        }

        .mobile-practice-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .mobile-practice-header h3 {
          font-size: 0.9rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: white;
          margin: 0;
        }

        /* EMPTY STATE DEFAULT CANVAS */
        .news-empty-state {
          max-width: 720px;
          margin: 4rem auto;
          text-align: center;
          padding: 0 1.5rem;
          flex: 1;
        }

        .empty-hero-title {
          font-size: 2rem;
          font-weight: 900;
          background: linear-gradient(135deg, #f59e0b 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.02em;
        }

        .empty-hero-subtitle {
          font-size: 0.88rem;
          color: #475569;
          max-width: 440px;
          margin: 0 auto 3rem auto;
          line-height: 1.5;
        }

        .trendline-title {
          font-size: 0.88rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #3b82f6;
          margin-bottom: 1.25rem;
          text-align: left;
        }

        .insight-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 1rem;
          text-align: left;
        }

        .insight-card {
          background: rgba(255, 255, 255, 0.005);
          border: 1px solid rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          padding: 1.15rem;
          transition: all 0.2s;
        }

        .insight-card:hover {
          border-color: rgba(255, 255, 255, 0.04);
          background: rgba(255, 255, 255, 0.015);
        }

        .insight-tag {
          font-size: 0.5rem;
          font-weight: 900;
          color: #10b981;
          background: rgba(16, 185, 129, 0.05);
          padding: 0.12rem 0.35rem;
          border-radius: 4px;
          margin-bottom: 0.6rem;
          display: inline-block;
        }

        .insight-card-title {
          font-size: 0.85rem;
          font-weight: 800;
          color: white;
          margin: 0 0 0.35rem 0;
        }

        .insight-card-desc {
          color: #475569;
          font-size: 0.75rem;
          line-height: 1.45;
          margin: 0;
        }

        /* ANIMATIONS */
        .animate-fade-in {
          animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-slide-down {
          animation: slideDown 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(3px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* RESPONSIVENESS AND COLLAPSIBILITY */
        @media (max-width: 1200px) {
          .news-right-panel {
            display: none; /* Hide 3rd column practice panel on smaller screens */
          }
          .practice-panel-inline-mobile {
            display: block; /* Show inline practice questions instead */
          }
        }

        @media (max-width: 1024px) {
          .news-hub-header {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            height: auto;
          }

          .news-filter-area {
            justify-content: flex-start;
          }

          .dashboard-content {
            height: calc(100vh - 72px - 110px); /* Adjust content height for taller header */
            overflow: visible;
          }

          .news-sidebar {
            position: fixed;
            left: 0;
            top: 72px; /* Sits directly below global nav bar */
            bottom: 0;
            z-index: 1000;
            transform: translateX(-100%);
            box-shadow: 10px 0 35px rgba(0, 0, 0, 0.55);
            width: 280px;
            transition: transform 0.25s ease;
          }

          .news-sidebar.open {
            transform: translateX(0);
          }

          .mobile-toggle {
            display: block;
          }

          .news-center-canvas {
            padding: 1.25rem 1rem;
          }

          .article-title {
            font-size: 1.3rem;
          }
        }
      `}</style>
    </div>
  );
}
