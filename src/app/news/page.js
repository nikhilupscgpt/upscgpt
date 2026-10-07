"use client";

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from "@/context/TranslationContext";
import NotesTrigger from '@/components/NotesTrigger';
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
  const { lang } = useTranslation();
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
  
  // News Streak states
  const [activeFeedTab, setActiveFeedTab] = useState('feed'); // 'feed' or 'streak'
  const [selectedTimeframe, setSelectedTimeframe] = useState('day');
  const [streaks, setStreaks] = useState([]);
  const [loadingStreaks, setLoadingStreaks] = useState(false);
  const [activeStreakId, setActiveStreakId] = useState(null);
  const [activeStreakDetails, setActiveStreakDetails] = useState(null);
  const [activeStreakNodeId, setActiveStreakNodeId] = useState(null);
  const [streakFilterMonth, setStreakFilterMonth] = useState('ALL');
  const [streakFilterWeek, setStreakFilterWeek] = useState('ALL');
  const [timelineGranularity, setTimelineGranularity] = useState('MONTHLY');
  const [activeStreakWeek, setActiveStreakWeek] = useState('W2');
  const [activeSynthesisTab, setActiveSynthesisTab] = useState('causes');
  const [streakPracticeTab, setStreakPracticeTab] = useState('article');
  const [showLivingSummary, setShowLivingSummary] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [articleModalItem, setArticleModalItem] = useState(null); // { item, structuredData }
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const streakId = params.get('streak') || params.get('streakId');
      if (streakId) {
        setActiveFeedTab('streak');
        setActiveStreakId(streakId);
      }
    }
  }, []);

  // Interactive MCQs & subjective questions states
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionId: selectedOptionTextOrLabel }
  const [expandedMainsAnswers, setExpandedMainsAnswers] = useState({}); // { questionId: boolean }
  
  const dateInputRef = useRef(null);

  async function fetchStreaks() {
    setLoadingStreaks(true);
    try {
      const res = await fetch('/api/news-streaks');
      const data = await res.json();
      const loadedStreaks = data.streaks || [];
      setStreaks(loadedStreaks);
      if (loadedStreaks.length > 0 && !activeStreakId) {
        setActiveStreakId(loadedStreaks[0].slug || loadedStreaks[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch news streaks:", err);
    } finally {
      setLoadingStreaks(false);
    }
  }

  async function fetchStreakDetails(streakId) {
    if (!streakId) return;
    try {
      const res = await fetch(`/api/news-streaks?id=${streakId}&slug=${streakId}`);
      const data = await res.json();
      if (data.success && data.streak) {
        setActiveStreakDetails(data.streak);
        
        // Combine articles and editorials chronologically
        const articles = (data.streak.articles || []).map(a => ({ ...a, isEditorial: false }));
        const editorials = (data.streak.editorials || []).map(e => ({ ...e, isEditorial: true }));
        const timelineItems = [...articles, ...editorials].sort(
          (a, b) => new Date(a.publishedAt || a.createdAt) - new Date(b.publishedAt || b.createdAt)
        );
        
        if (timelineItems.length > 0) {
          const latestItem = timelineItems[timelineItems.length - 1];
          setActiveStreakNodeId(latestItem.id);
        } else {
          setActiveStreakNodeId(null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch streak details:", err);
    }
  }

  useEffect(() => {
    if (activeFeedTab === 'streak') {
      fetchStreaks();
    }
  }, [activeFeedTab]);

  useEffect(() => {
    if (activeFeedTab === 'streak' && activeStreakId) {
      fetchStreakDetails(activeStreakId);
    }
  }, [activeStreakId, activeFeedTab]);

  const getStreakTimelineItems = () => {
    if (!activeStreakDetails) return [];
    const articles = (activeStreakDetails.articles || []).map(a => ({ ...a, isEditorial: false }));
    const editorials = (activeStreakDetails.editorials || []).map(e => ({ ...e, isEditorial: true }));
    return [...articles, ...editorials].sort(
      (a, b) => new Date(a.publishedAt || a.createdAt) - new Date(b.publishedAt || b.createdAt)
    );
  };

  const activeTimelineItems = getStreakTimelineItems();
  
  const getStreakDuration = () => {
    if (activeTimelineItems.length <= 1) return { weeks: 1, months: 1 };
    const firstDate = new Date(activeTimelineItems[0].publishedAt || activeTimelineItems[0].createdAt);
    const lastDate = new Date(activeTimelineItems[activeTimelineItems.length - 1].publishedAt || activeTimelineItems[activeTimelineItems.length - 1].createdAt);
    const diffTime = Math.abs(lastDate - firstDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7) + 1;
    const months = Math.floor(diffDays / 30) + 1;
    return { weeks, months };
  };
  const streakDuration = getStreakDuration();
  const activeStreakNode = activeTimelineItems.find(item => item.id === activeStreakNodeId) || activeTimelineItems[activeTimelineItems.length - 1];
  const activeStreakNodeStructured = activeStreakNode ? getStructuredData(activeStreakNode) : null;
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
      const res = await fetch(`/api/news/hub?date=${selectedDate}&range=${selectedTimeframe}`);
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
  }, [selectedDate, selectedTimeframe]);

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

  const triggerType = activeFeedTab === 'streak' ? 'streak' : (activeItem?.contentType === 'EDITORIAL' ? 'editorial' : 'article');
  const triggerId = activeFeedTab === 'streak' ? activeStreakDetails?.id : activeItem?.id;
  const triggerTitle = activeFeedTab === 'streak' ? activeStreakDetails?.title : activeItem?.title;
  const triggerSubject = activeFeedTab === 'streak' 
    ? (activeStreakDetails?.issues?.[0]?.domain || 'General Studies') 
    : (activeItem?.issue?.domain || 'General Studies');
  const triggerTopic = activeFeedTab === 'streak' 
    ? (activeStreakDetails?.issues?.[0]?.topic || 'Current Affairs') 
    : (activeItem?.issue?.topic || 'Current Affairs');

  // Parse structured data safely (hoisted via standard function declaration)
  function getStructuredData(item) {
    if (!item?.structuredData) return null;
    try {
      return typeof item.structuredData === 'string' 
        ? JSON.parse(item.structuredData) 
        : item.structuredData;
    } catch (e) {
      console.error("Error parsing structuredData:", e);
      return null;
    }
  }

  const structured = getStructuredData(activeItem);

  const triggerQuestions = [];
  if (activeFeedTab === 'streak') {
    if (activeStreakNodeStructured?.mcq) {
      triggerQuestions.push({
        id: `ai-streak-${activeStreakNode.id}`,
        text: activeStreakNodeStructured.mcq.question,
        options: activeStreakNodeStructured.mcq.options,
        correctLabel: activeStreakNodeStructured.mcq.answer,
        explanation: activeStreakNodeStructured.mcq.explanation || 'See details in the text.',
        tags: ['prelims']
      });
    }
    if (activeStreakNode?.questions) {
      triggerQuestions.push(...activeStreakNode.questions);
    }
  } else {
    if (structured?.mcq) {
      triggerQuestions.push({
        id: `ai-${activeItem?.id}`,
        text: structured.mcq.question,
        options: structured.mcq.options,
        correctLabel: structured.mcq.answer,
        explanation: structured.mcq.explanation || 'See details in the text.',
        tags: ['prelims']
      });
    }
    if (activeItem?.questions) {
      triggerQuestions.push(...activeItem.questions);
    }
  }


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
              <h4 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '0.85rem', fontWeight: 700 }}>Save Your Progress</h4>
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>Sign in to track your score accuracy, save attempts, and unlock personalized streaks.</p>
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

  const renderStreakPracticeBoard = () => {
    const nodePrelimsQuestions = activeStreakNode?.questions?.filter(q => {
      const options = getOptionsArray(q.options);
      return options.length > 0 || q.tags.includes('prelims');
    }) || [];

    const nodeMainsQuestions = activeStreakNode?.questions?.filter(q => {
      const options = getOptionsArray(q.options);
      return options.length === 0 && q.tags.includes('mains');
    }) || [];

    const activeNodeStructured = activeStreakNodeStructured;
    const hasNodeMcqs = Boolean(activeNodeStructured?.mcq || nodePrelimsQuestions.length > 0);
    const hasNodeMains = Boolean(nodeMainsQuestions.length > 0);
    const hasNodePractice = hasNodeMcqs || hasNodeMains;

    const mockStreakMainsQuestions = [
      {
        id: 'streak-mains-1',
        text: `Evaluate the socio-economic impacts of the ${activeStreakDetails?.title || 'this issue'} over the past year. What policy measures are required to mitigate long-term structural vulnerabilities?`,
        difficulty: 'HARD',
        gsPaper: 'GS-III',
        explanation: `**Model Framework:**\n\n1. **Introduction**: Define the context of the issue (e.g. depreciation of the Rupee) and outline its significance for macroeconomic stability.\n2. **Key Challenges / Causes**: External factors (spiking US yields, global crude prices) and internal factors (current account deficit).\n3. **Socio-Economic Impacts**: Import bills rise inflation, affects purchasing power, impacts export competitiveness.\n4. **Policy Interventions**: Exchange rate stabilization by RBI, structural reforms, diversifying forex holdings.\n5. **Conclusion**: Emphasize a balanced approach between supporting export competitiveness and defending the currency corridor.`
      }
    ];

    // Collect all mains questions across all nodes (articles/editorials) in this streak
    const streakMainsQuestions = activeTimelineItems.reduce((acc, node) => {
      const nodeMains = node.questions?.filter(q => {
        const options = getOptionsArray(q.options);
        return options.length === 0 && q.tags.includes('mains');
      }) || [];
      // Deduplicate by question ID
      nodeMains.forEach(q => {
        if (!acc.some(existing => existing.id === q.id)) {
          acc.push(q);
        }
      });
      return acc;
    }, []);

    return (
      <div className="practice-board-content">
        <div className="practice-tabs">
          <button 
            onClick={() => setStreakPracticeTab('article')}
            className={`practice-tab-btn ${streakPracticeTab === 'article' ? 'active' : ''}`}
          >
            <span>This Article</span>
          </button>
          <button 
            onClick={() => setStreakPracticeTab('streak')}
            className={`practice-tab-btn ${streakPracticeTab === 'streak' ? 'active' : ''}`}
          >
            <span>The Whole Issue</span>
          </button>
        </div>

        <div className="practice-body">
          {streakPracticeTab === 'article' ? (
            <div className="prelims-questions-list">
              <div className="active-recall-card" style={{ marginBottom: '20px', padding: '16px', background: 'rgba(6, 182, 212, 0.03)', border: '1px dashed rgba(6, 182, 212, 0.2)', borderRadius: '16px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 12px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>Encourage interactive learning to build memory retention for this update.</p>
                <button 
                  onClick={() => alert("Active Recall initiated for: " + (activeStreakNode?.title || activeStreakDetails?.title))}
                  className="active-recall-cta-btn"
                  style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #06b6d4, #0891b2)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  Initiate Active Recall
                </button>
              </div>

              {!hasNodePractice ? (
                <p className="empty-text" style={{ padding: '48px 0', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
                  No updates-specific questions mapped to this node. Use 'The Whole Issue' tab to test comprehensive mock questions.
                </p>
              ) : (
                <>
                  {activeNodeStructured?.mcq && (
                    <div className="mcq-board-card">
                      <div className="mcq-card-badge">AI CHALLENGE MCQ</div>
                      <h4 className="mcq-card-question">{activeNodeStructured.mcq.question}</h4>
                      <div className="mcq-card-options">
                        {activeNodeStructured.mcq.options?.map((option, idx) => {
                          const selected = selectedAnswers[`ai-streak-${activeStreakNode.id}`] === option;
                          const isCorrectOpt = isMcqCorrect(option, activeNodeStructured.mcq.answer);
                          const answered = selectedAnswers[`ai-streak-${activeStreakNode.id}`] !== undefined;
                          
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
                              onClick={() => setSelectedAnswers(prev => ({ ...prev, [`ai-streak-${activeStreakNode.id}`]: option }))}
                              className={`mcq-card-option-btn ${optClass}`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>

                      {selectedAnswers[`ai-streak-${activeStreakNode.id}`] !== undefined && (
                        <div className="mcq-card-explanation animate-slide-down">
                          <div className="exp-result-header" style={{ color: isMcqCorrect(selectedAnswers[`ai-streak-${activeStreakNode.id}`], activeNodeStructured.mcq.answer) ? '#10b981' : '#ef4444' }}>
                            {isMcqCorrect(selectedAnswers[`ai-streak-${activeStreakNode.id}`], activeNodeStructured.mcq.answer) ? "✓ Correct Option Selected" : "✗ Incorrect Option"}
                          </div>
                          <p className="exp-sub-text">
                            <strong>Correct Answer:</strong> {activeNodeStructured.mcq.answer}
                          </p>
                          <p className="exp-body-text">
                            <strong>Explanation:</strong> {activeNodeStructured.mcq.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {nodeMainsQuestions.map((q) => {
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
                          <span>{isExpanded ? "Hide Model Answer" : "Reveal Model Answer"}</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        {isExpanded && (
                          <div className="mains-model-answer animate-slide-down">
                            <div className="model-answer-title">Answer Framework:</div>
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
                </>
              )}
            </div>
          ) : (
            <div className="mains-questions-list">
              {(streakMainsQuestions.length > 0 ? streakMainsQuestions : mockStreakMainsQuestions).map((q) => {
                const isExpanded = expandedMainsAnswers[q.id] === true;
                return (
                  <div key={q.id} className="mains-board-card">
                    <div className="mains-card-meta">
                      <span className="difficulty">{q.difficulty || 'HARD'}</span>
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
                        <div className="model-answer-title">Syllabus Evaluation Grid:</div>
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
      </div>
    );
  };

  const renderModalPracticeBoard = (modalItem) => {
    const item = modalItem.item;
    const structured = modalItem.structuredData;
    
    // Parse options for DB questions
    const dbPrelimsQuestions = item?.questions?.filter(q => {
      const options = getOptionsArray(q.options);
      return options.length > 0 || q.tags.includes('prelims');
    }) || [];

    const dbMainsQuestions = item?.questions?.filter(q => {
      const options = getOptionsArray(q.options);
      return options.length === 0 && q.tags.includes('mains');
    }) || [];

    const hasMcqs = Boolean(structured?.mcq || dbPrelimsQuestions.length > 0);
    const hasMainsQuestions = Boolean(dbMainsQuestions.length > 0);
    const hasPracticeItems = hasMcqs || hasMainsQuestions;
    
    if (!hasPracticeItems) {
      return (
        <div className="study-assistant-card" style={{ padding: '16px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <div className="assistant-header" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: '#a78bfa', marginBottom: '8px' }}>
            <Bookmark size={15} />
            <span>Topic Study Helper</span>
          </div>
          <p style={{ margin: '0 0 10px', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            No mock questions are currently linked to this briefing. While reading:
          </p>
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
        <div className="practice-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
          <button 
            onClick={() => setPracticeTab('prelims')}
            className={`practice-tab-btn ${practiceTab === 'prelims' ? 'active' : ''}`}
            disabled={!hasMcqs}
            style={{ flex: 1, padding: '10px 0', border: 'none', background: 'transparent', color: practiceTab === 'prelims' ? '#10b981' : 'var(--text-muted)', borderBottom: practiceTab === 'prelims' ? '2px solid #10b981' : 'none', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}
          >
            <span>Prelims MCQs ({dbPrelimsQuestions.length + (structured?.mcq ? 1 : 0)})</span>
          </button>
          <button 
            onClick={() => setPracticeTab('mains')}
            className={`practice-tab-btn ${practiceTab === 'mains' ? 'active' : ''}`}
            disabled={!hasMainsQuestions}
            style={{ flex: 1, padding: '10px 0', border: 'none', background: 'transparent', color: practiceTab === 'mains' ? '#10b981' : 'var(--text-muted)', borderBottom: practiceTab === 'mains' ? '2px solid #10b981' : 'none', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}
          >
            <span>Mains Qs ({dbMainsQuestions.length})</span>
          </button>
        </div>

        {/* Content */}
        <div className="practice-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {practiceTab === 'prelims' && hasMcqs && (
            <div className="prelims-questions-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Inline MCQ */}
              {structured?.mcq && (
                <div className="mcq-board-card" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
                  <div className="mcq-card-badge" style={{ fontSize: '0.55rem', fontWeight: 900, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginBottom: '8px' }}>AI CHALLENGE MCQ</div>
                  <h4 className="mcq-card-question" style={{ margin: '0 0 12px', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 800, lineHeight: 1.4 }}>{structured.mcq.question}</h4>
                  
                  <div className="mcq-card-options" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {structured.mcq.options?.map((option, idx) => {
                      const selected = selectedAnswers[`ai-${item.id}`] === option;
                      const isCorrectOpt = isMcqCorrect(option, structured.mcq.answer);
                      const answered = selectedAnswers[`ai-${item.id}`] !== undefined;
                      
                      let optStyle = {
                        width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px',
                        background: 'transparent', color: 'var(--text-secondary)', textAlign: 'left', fontSize: '0.75rem',
                        fontWeight: 700, cursor: 'pointer', transition: '0.2s'
                      };
                      if (answered) {
                        if (isCorrectOpt) {
                          optStyle.background = 'rgba(16, 185, 129, 0.1)';
                          optStyle.borderColor = 'rgba(16, 185, 129, 0.3)';
                          optStyle.color = '#10b981';
                        } else if (selected) {
                          optStyle.background = 'rgba(239, 68, 68, 0.1)';
                          optStyle.borderColor = 'rgba(239, 68, 68, 0.3)';
                          optStyle.color = '#ef4444';
                        } else {
                          optStyle.opacity = 0.5;
                        }
                      }

                      return (
                        <button 
                          key={idx}
                          disabled={answered}
                          onClick={() => setSelectedAnswers(prev => ({ ...prev, [`ai-${item.id}`]: option }))}
                          style={optStyle}
                          className="hover-glow-btn"
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>

                  {selectedAnswers[`ai-${item.id}`] !== undefined && (
                    <div style={{ marginTop: '16px', borderTop: '1px dashed var(--border-color)', paddingTop: '12px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: isMcqCorrect(selectedAnswers[`ai-${item.id}`], structured.mcq.answer) ? '#10b981' : '#ef4444', marginBottom: '4px' }}>
                        {isMcqCorrect(selectedAnswers[`ai-${item.id}`], structured.mcq.answer) ? "✓ Correct Option Selected" : "✗ Incorrect Option"}
                      </div>
                      <p style={{ margin: '0 0 6px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        <strong>Correct Answer:</strong> {structured.mcq.answer}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
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
                  <div key={q.id} className="mcq-board-card" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
                    <div className="mcq-card-badge db" style={{ fontSize: '0.55rem', fontWeight: 900, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginBottom: '8px' }}>CENTRAL MCQ</div>
                    <h4 className="mcq-card-question" style={{ margin: '0 0 12px', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 800, lineHeight: 1.4 }}>{q.text}</h4>
                    
                    <div className="mcq-card-options" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {options.map((option, idx) => {
                        const selected = selectedOpt?.label === option.label;
                        const isCorrectOpt = isDbQuestionCorrect(option, q);
                        
                        let optStyle = {
                          width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px',
                          background: 'transparent', color: 'var(--text-secondary)', textAlign: 'left', fontSize: '0.75rem',
                          fontWeight: 700, cursor: 'pointer', transition: '0.2s'
                        };
                        if (answered) {
                          if (isCorrectOpt) {
                            optStyle.background = 'rgba(16, 185, 129, 0.1)';
                            optStyle.borderColor = 'rgba(16, 185, 129, 0.3)';
                            optStyle.color = '#10b981';
                          } else if (selected) {
                            optStyle.background = 'rgba(239, 68, 68, 0.1)';
                            optStyle.borderColor = 'rgba(239, 68, 68, 0.3)';
                            optStyle.color = '#ef4444';
                          } else {
                            optStyle.opacity = 0.5;
                          }
                        }

                        return (
                          <button 
                            key={idx}
                            disabled={answered}
                            onClick={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: option }))}
                            style={optStyle}
                            className="hover-glow-btn"
                          >
                            <strong>{option.label}.</strong> {option.text}
                          </button>
                        );
                      })}
                    </div>

                    {answered && (
                      <div style={{ marginTop: '16px', borderTop: '1px dashed var(--border-color)', paddingTop: '12px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: isDbQuestionCorrect(selectedOpt, q) ? '#10b981' : '#ef4444', marginBottom: '4px' }}>
                          {isDbQuestionCorrect(selectedOpt, q) ? "✓ Correct Option Selected" : "✗ Incorrect Option"}
                        </div>
                        <p style={{ margin: '0 0 6px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          <strong>Correct Option:</strong> {q.correctLabel}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
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
            <div className="mains-questions-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {dbMainsQuestions.map((q) => {
                const isExpanded = expandedMainsAnswers[q.id] === true;
                return (
                  <div key={q.id} className="mains-board-card" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.55rem', fontWeight: 800, background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>{q.difficulty || 'MEDIUM'}</span>
                      {q.gsPaper && <span style={{ fontSize: '0.55rem', fontWeight: 800, background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '2px 6px', borderRadius: '4px' }}>{q.gsPaper}</span>}
                    </div>
                    <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 800, lineHeight: 1.4 }}>{q.text}</h4>
                    
                    <button 
                      onClick={() => setExpandedMainsAnswers(prev => ({ ...prev, [q.id]: !isExpanded }))}
                      style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <span>{isExpanded ? "Hide Model Framework" : "Reveal Model Framework"}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {isExpanded && (
                      <div style={{ marginTop: '12px', borderTop: '1px dashed var(--border-color)', paddingTop: '12px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fbbf24', marginBottom: '6px' }}>Answer Key & Synthesis Points:</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
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
      </div>
    );
  };

  return (
    <div className="news-hub-wrapper">
      {!mounted ? (
        <div className="loading-state main-loader">
          <div className="loader-ring" />
          <div style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Synchronizing Timeline Data...</div>
        </div>
      ) : (
        <>
      
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
                background: !isDateInCurrentWeek ? '#f59e0b' : 'var(--bg-input)',
                color: !isDateInCurrentWeek ? '#0f172a' : 'var(--text-muted)'
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
          <div style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Synchronizing Timeline Data...</div>
        </div>
      ) : (
        <div className="dashboard-content">
          
          {/* LEFT COLUMN: TIMELINE FEED */}
          <aside className={`news-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
            <div className="segmented-timeline-toggle">
              <button 
                className={`timeline-toggle-btn ${activeFeedTab === 'feed' ? 'active' : ''}`}
                onClick={() => setActiveFeedTab('feed')}
              >
                Daily Feed
              </button>
              <button 
                className={`timeline-toggle-btn ${activeFeedTab === 'streak' ? 'active' : ''}`}
                onClick={() => setActiveFeedTab('streak')}
              >
                News Streaks
              </button>
            </div>

            {activeFeedTab === 'feed' && (
              <div className="timeframe-toggle-container">
                {['day', 'week', 'month', 'year'].map(t => (
                  <button
                    key={t}
                    onClick={() => {
                      setSelectedTimeframe(t);
                    }}
                    className={`timeframe-toggle-btn ${selectedTimeframe === t ? 'active' : ''}`}
                  >
                    {t === 'day' ? 'Daily' : t === 'week' ? 'Weekly' : t === 'month' ? 'Monthly' : 'Yearly'}
                  </button>
                ))}
              </div>
            )}

            {activeFeedTab === 'streak' && (
              <div className="streak-filter-container">
                <select
                  value={streakFilterMonth}
                  onChange={(e) => {
                    setStreakFilterMonth(e.target.value);
                    setStreakFilterWeek('ALL');
                  }}
                  className="streak-filter-select"
                >
                  <option value="ALL">All Months</option>
                  <option value="0">January</option>
                  <option value="1">February</option>
                  <option value="2">March</option>
                  <option value="3">April</option>
                  <option value="4">May</option>
                  <option value="5">June</option>
                  <option value="6">July</option>
                  <option value="7">August</option>
                  <option value="8">September</option>
                  <option value="9">October</option>
                  <option value="10">November</option>
                  <option value="11">December</option>
                </select>

                <select
                  value={streakFilterWeek}
                  onChange={(e) => setStreakFilterWeek(e.target.value)}
                  className="streak-filter-select"
                  disabled={streakFilterMonth === 'ALL'}
                >
                  <option value="ALL">All Weeks</option>
                  <option value="1">Week 1 (1-7)</option>
                  <option value="2">Week 2 (8-14)</option>
                  <option value="3">Week 3 (15-21)</option>
                  <option value="4">Week 4 (22-28)</option>
                  <option value="5">Week 5 (29-31)</option>
                </select>
              </div>
            )}

            {activeFeedTab === 'streak' && session?.user?.role === 'ADMIN' && (
              <div style={{ padding: '0 0.75rem 0.5rem' }}>
                <a 
                  href="/admin/news-streaks" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="admin-manage-streaks-link"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px dashed rgba(245, 158, 11, 0.25)',
                    color: '#fbbf24',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    textAlign: 'center',
                    transition: '0.2s'
                  }}
                >
                  ⚙️ Manage News Streaks
                </a>
              </div>
            )}

            <div className="sidebar-scroll hide-scrollbar">
              {activeFeedTab === 'feed' ? (
                filteredFeed.length > 0 ? filteredFeed.map(item => {
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
                      className={`sidebar-item ${isActive ? 'active' : ''} ${item.importanceScore >= 4 ? 'high-importance' : ''}`}
                      style={{
                        borderLeft: isActive 
                          ? (item.importanceScore >= 4 ? '3px solid #fbbf24' : `3px solid ${badge.color}`) 
                          : (item.importanceScore >= 4 ? '3px solid #fbbf24' : '3px solid transparent')
                      }}
                    >
                      <div className="sidebar-item-meta">
                        <span className="sidebar-badge" style={{ background: badge.bg, color: badge.color, border: badge.border }}>
                          {badge.label}
                        </span>
                        {item.importanceScore >= 4 && (
                          <span className="importance-star-badge" style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '1px 5px', borderRadius: '4px', fontSize: '0.55rem', fontWeight: 900 }}>
                            ★ KEY TOPIC
                          </span>
                        )}
                        {item.source && <span className="sidebar-source">{item.source}</span>}
                        <span className="sidebar-time">{displayTime}</span>
                      </div>
                      <div className={`sidebar-item-title ${isActive ? 'active' : ''}`}>
                        {lang === 'hi' ? (item.title_hi || item.title) : lang === 'mr' ? (item.title_mr || item.title) : item.title}
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
                )
              ) : (
                loadingStreaks ? (
                  <div className="sidebar-empty">Loading streaks...</div>
                ) : (() => {
                  const filteredStreaksList = streaks.filter(streak => {
                    const d = new Date(streak.updatedAt || streak.createdAt);
                    if (streakFilterMonth !== 'ALL') {
                      const monthInt = parseInt(streakFilterMonth);
                      if (d.getUTCMonth() !== monthInt) return false;
                      
                      if (streakFilterWeek !== 'ALL') {
                        const weekInt = parseInt(streakFilterWeek);
                        const day = d.getUTCDate();
                        let matchWeek = false;
                        if (weekInt === 1 && day >= 1 && day <= 7) matchWeek = true;
                        else if (weekInt === 2 && day >= 8 && day <= 14) matchWeek = true;
                        else if (weekInt === 3 && day >= 15 && day <= 21) matchWeek = true;
                        else if (weekInt === 4 && day >= 22 && day <= 28) matchWeek = true;
                        else if (weekInt === 5 && day >= 29) matchWeek = true;
                        if (!matchWeek) return false;
                      }
                    }
                    return true;
                  });

                  return filteredStreaksList.length > 0 ? filteredStreaksList.map(streak => {
                    const isActive = activeStreakId === streak.id || activeStreakId === streak.slug;
                    
                    const paper = streak.issues?.[0]?.gsPapers?.[0] || 'GS-III';
                    const domain = streak.issues?.[0]?.domain || 'ECONOMY';
                    const updatesCount = (streak._count?.articles || 0) + (streak._count?.editorials || 0);

                    return (
                      <div 
                        key={streak.id}
                        onClick={() => {
                          setActiveStreakId(streak.slug || streak.id);
                          setMobileMenuOpen(false);
                          setSelectedAnswers({});
                          if (typeof window !== 'undefined') {
                            const newUrl = `${window.location.pathname}?streak=${streak.slug || streak.id}`;
                            window.history.pushState(null, '', newUrl);
                          }
                        }}
                        className={`sidebar-item streak-sidebar-card ${isActive ? 'active' : ''}`}
                        style={{
                          borderLeft: isActive ? `3px solid #fbbf24` : '3px solid transparent'
                        }}
                      >
                        <div className="streak-card-meta">
                          <span className="streak-meta-paper">{paper} • {domain}</span>
                          <span className="streak-meta-status" style={{ color: streak.status === 'URGENT' ? '#fbbf24' : '#10b981' }}>{streak.status}</span>
                        </div>
                        <div className="streak-card-title">
                          {lang === 'hi' ? (streak.title_hi || streak.title) : lang === 'mr' ? (streak.title_mr || streak.title) : streak.title}
                        </div>
                        
                        <div className="streak-card-graph-row">
                          <svg className="trendline-svg" viewBox="0 0 100 30" width="70" height="20">
                            <path 
                              d={streak.status === 'URGENT' ? "M0 15 Q 25 25, 50 10 T 100 28" : "M0 25 Q 25 5, 50 18 T 100 5"}
                              fill="none" 
                              stroke={streak.status === 'URGENT' ? '#fbbf24' : '#06b6d4'} 
                              strokeWidth="2" 
                            />
                          </svg>
                          <div className="streak-updates-stat">
                            <span className="count-number" style={{ color: streak.status === 'URGENT' ? '#fbbf24' : '#06b6d4' }}>{updatesCount} Updates</span>
                            <span className="stat-time">PAST 24 HOURS</span>
                          </div>
                        </div>

                        <div className="streak-card-tags">
                          {streak.issues?.slice(0, 3).map(iss => (
                            <span key={iss.id} className="streak-tag-pill">{iss.title.split(' ').slice(0,2).join(' ')}</span>
                          ))}
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="sidebar-empty">No active streaks found for selected time range.</div>
                  );
                })()
              )}
            </div>
          </aside>

          {activeFeedTab === 'feed' ? (
            activeItem ? (
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
                        {activeItem.importanceScore !== undefined && (
                          <span 
                            className="article-importance-stars" 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '2px', 
                              background: activeItem.importanceScore >= 4 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                              color: activeItem.importanceScore >= 4 ? '#fbbf24' : '#64748b', 
                              border: activeItem.importanceScore >= 4 ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)', 
                              padding: '2px 8px', 
                              borderRadius: '6px', 
                              fontSize: '0.65rem', 
                              fontWeight: 800 
                            }}
                          >
                            <span>UPSC Importance:</span>
                            <span style={{ fontSize: '0.8rem', marginLeft: '4px', letterSpacing: '1px' }}>
                              {'★'.repeat(activeItem.importanceScore)}{'☆'.repeat(5 - activeItem.importanceScore)}
                            </span>
                          </span>
                        )}
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
                      {structured?.prelimsFact && (
                        <div className="takeaway-card prelims-card">
                          <div className="takeaway-label prelims">
                            <CheckSquare size={13} style={{ marginRight: '5px' }} />
                            <span>Prelims Factor (PF)</span>
                          </div>
                          <p className="takeaway-text">{structured.prelimsFact}</p>
                        </div>
                      )}

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
                        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No detailed markdown analysis content generated for this item. Refer to the fact cards or practice questions.</p>
                      )}
                    </div>

                  </div>
                </main>

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
            )
          ) : (
            activeStreakDetails ? (
              <div className="workspace-main-wrapper" style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>
                
                {/* MIDDLE COLUMN: NEWS STREAK EVOLVING CANVAS */}
                <main className="news-center-canvas hide-scrollbar" style={{ flex: '1.8', height: '100%', overflowY: 'auto', padding: '24px 32px' }}>
                  <div className="streak-page-container animate-fade-in" style={{ width: '100%' }}>
                    
                    {/* Header & Synthesis Badge */}
                    <header className="article-header streak-header" style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                      <div className="article-meta-row" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                        <span className="streak-badge-synthesis" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.25)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          • LIVE SYNTHESIS
                        </span>
                        <span className="streak-duration-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Week {streakDuration.weeks} • Month {streakDuration.months}
                        </span>
                        <span className="meta-text" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, marginLeft: '4px' }}>
                          {activeTimelineItems.length} UPDATES CHRONICLE
                        </span>
                      </div>
                      <h2 className="article-title" style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 16px', lineHeight: 1.25, letterSpacing: '-0.5px' }}>
                        {lang === 'hi' ? (activeStreakDetails.title_hi || activeStreakDetails.title) : lang === 'mr' ? (activeStreakDetails.title_mr || activeStreakDetails.title) : activeStreakDetails.title}
                      </h2>

                      {/* Toggle Living Summary Button */}
                      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
                        <button
                          onClick={() => setShowLivingSummary(!showLivingSummary)}
                          style={{
                            padding: '8px 16px',
                            background: 'rgba(6, 182, 212, 0.05)',
                            border: '1px solid rgba(6, 182, 212, 0.2)',
                            borderRadius: '8px',
                            color: '#06b6d4',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: '0.2s'
                          }}
                          className="hover-glow-btn"
                        >
                          <span>{showLivingSummary ? 'Hide Living Summary' : '✨ Show Evolving Synthesis (Living Summary)'}</span>
                        </button>
                      </div>

                      {/* Top Summary Actions Row & Content Box */}
                      {showLivingSummary && (
                        <>
                          <div className="synthesis-tabs-row" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                            <button 
                              className={`synthesis-tab-btn ${activeSynthesisTab === 'causes' ? 'active' : ''}`}
                              onClick={() => setActiveSynthesisTab('causes')}
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: activeSynthesisTab === 'causes' ? 'rgba(6, 182, 212, 0.1)' : 'transparent', color: activeSynthesisTab === 'causes' ? '#06b6d4' : 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: '0.2s' }}
                            >
                              Core Causes
                            </button>
                            <button 
                              className={`synthesis-tab-btn ${activeSynthesisTab === 'impact' ? 'active' : ''}`}
                              onClick={() => setActiveSynthesisTab('impact')}
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: activeSynthesisTab === 'impact' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: activeSynthesisTab === 'impact' ? '#10b981' : 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: '0.2s' }}
                            >
                              Impact Matrix
                            </button>
                            <button 
                              className={`synthesis-tab-btn ${activeSynthesisTab === 'tracker' ? 'active' : ''}`}
                              onClick={() => setActiveSynthesisTab('tracker')}
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: activeSynthesisTab === 'tracker' ? 'rgba(245, 158, 11, 0.1)' : 'transparent', color: activeSynthesisTab === 'tracker' ? '#f59e0b' : 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: '0.2s' }}
                            >
                              Data Tracker
                            </button>
                          </div>

                          <div className="living-summary-content-box" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {(() => {
                                try {
                                  let summaryRaw = activeStreakDetails.livingSummary;
                                  if (lang === 'hi' && activeStreakDetails.livingSummary_hi) {
                                    summaryRaw = activeStreakDetails.livingSummary_hi;
                                  } else if (lang === 'mr' && activeStreakDetails.livingSummary_mr) {
                                    summaryRaw = activeStreakDetails.livingSummary_mr;
                                  }
                                  const parsed = JSON.parse(summaryRaw);
                                  if (activeSynthesisTab === 'causes') return parsed.causes || parsed.background || summaryRaw;
                                  if (activeSynthesisTab === 'impact') return parsed.impact || parsed.implications || (lang === 'hi' ? "कोई प्रभाव मैट्रिक्स अभी तक परिभाषित नहीं है।" : lang === 'mr' ? "कोणताही प्रभाव मॅट्रिक्स अद्याप परिभाषित नाही." : "No impact matrix defined yet.");
                                  if (activeSynthesisTab === 'tracker') return parsed.tracker || parsed.data || (lang === 'hi' ? "कोई डेटा ट्रैकिंग सेट अभी तक परिभाषित नहीं है।" : lang === 'mr' ? "कोणतेही डेटा ट्रॅकिंग संच अद्याप परिभाषित केलेले नाहीत." : "No data tracking sets defined yet.");
                                } catch (e) {
                                  let summaryRaw = activeStreakDetails.livingSummary;
                                  if (lang === 'hi' && activeStreakDetails.livingSummary_hi) {
                                    summaryRaw = activeStreakDetails.livingSummary_hi;
                                  } else if (lang === 'mr' && activeStreakDetails.livingSummary_mr) {
                                    summaryRaw = activeStreakDetails.livingSummary_mr;
                                  }
                                  if (activeSynthesisTab === 'causes') return summaryRaw || (lang === 'hi' ? "कोई कारण सारांश उपलब्ध नहीं है।" : lang === 'mr' ? "कोणताही कारण सारांश उपलब्ध नाही." : "No causes summary available.");
                                  if (activeSynthesisTab === 'impact') return (lang === 'hi' ? "कोई प्रभाव मैट्रिक्स अभी तक परिभाषित नहीं है।" : lang === 'mr' ? "कोणताही प्रभाव मॅट्रिक्स अद्याप परिभाषित नाही." : "No impact matrix defined yet.");
                                  if (activeSynthesisTab === 'tracker') return (lang === 'hi' ? "कोई डेटा ट्रैकिंग सेट अभी तक परिभाषित नहीं है।" : lang === 'mr' ? "कोणतेही डेटा ट्रॅकिंग संच अद्याप परिभाषित केलेले नाहीत." : "No data tracking sets defined yet.");
                                }
                                return "";
                              })()}
                            </ReactMarkdown>
                          </div>
                        </>
                      )}
                    </header>
                  </div>
                </main>

                {/* RIGHT COLUMN: THREAD CHRONICLE TIMELINE (VERTICAL CHRONICLE) */}
                <aside className="thread-chronicle-column hide-scrollbar" style={{ flex: '0.8', height: '100%', overflowY: 'auto', padding: '24px 32px' }}>
                  <h3 style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '0.5px', margin: '0 0 20px 0', textTransform: 'uppercase' }}>
                    Thread Chronicle
                  </h3>
                  
                  {activeTimelineItems.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', borderLeft: '1px dashed var(--border-color)', paddingLeft: '44px', marginLeft: '32px' }}>
                      {activeTimelineItems.map((item, idx) => {
                        const d = new Date(item.publishedAt || item.createdAt);
                        const structuredData = getStructuredData(item);
                        
                        // Source color mapping
                        const getSourceColor = (source) => {
                          const clean = (source || '').toLowerCase().trim();
                          if (clean.includes('hindu')) return '#3b82f6';
                          if (clean.includes('express')) return '#a855f7';
                          if (clean.includes('pib')) return '#10b981';
                          if (clean.includes('air')) return '#ec4444';
                          return '#f59e0b';
                        };

                        const sourceColor = getSourceColor(item.source);

                        return (
                          <div 
                            key={item.id}
                            className="timeline-chronicle-item hover-glow-btn"
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              cursor: 'pointer',
                              position: 'relative',
                              padding: '12px 16px',
                              background: 'var(--bg-card)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '12px',
                              transition: 'all 0.2s'
                            }}
                            onClick={() => {
                              setArticleModalItem({ item, structuredData });
                            }}
                          >
                            {/* Timeline node date badge */}
                            <div style={{
                              position: 'absolute',
                              left: '-76px', // Centers the 64px width badge on the -44px dashed line
                              top: '12px',
                              width: '64px',
                              height: '46px',
                              borderRadius: '8px',
                              background: 'var(--bg-secondary)',
                              border: `1px solid ${sourceColor}`,
                              boxShadow: `0 2px 8px rgba(0,0,0,0.12), 0 0 4px ${sourceColor}20`,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              lineHeight: '1.1',
                              zIndex: 10
                            }}>
                              <span style={{ fontSize: '0.55rem', color: sourceColor, textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.5px' }}>
                                {d.toLocaleDateString([], { month: 'short' })}
                              </span>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 950 }}>
                                {d.toLocaleDateString([], { day: 'numeric' })}
                              </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                              <span style={{ 
                                fontSize: '0.62rem', 
                                color: sourceColor, 
                                background: `${sourceColor}10`,
                                border: `1px solid ${sourceColor}25`,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 900,
                                textTransform: 'uppercase'
                              }}>
                                {item.source || 'News'}
                              </span>

                              <span style={{
                                fontSize: '0.58rem',
                                color: item.isEditorial ? '#c084fc' : '#22d3ee',
                                background: item.isEditorial ? 'rgba(139, 92, 246, 0.1)' : 'rgba(6, 182, 212, 0.1)',
                                border: item.isEditorial ? '1px solid rgba(139, 92, 246, 0.25)' : '1px solid rgba(6, 182, 212, 0.25)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}>
                                {item.isEditorial ? 'Editorial' : 'News'}
                              </span>
                            </div>

                            <h4 style={{ 
                              margin: 0, 
                              color: 'var(--text-primary)', 
                              fontSize: '0.9rem', 
                              fontWeight: 800, 
                              lineHeight: 1.35 
                            }}>
                              {lang === 'hi' ? (item.title_hi || item.title) : lang === 'mr' ? (item.title_mr || item.title) : item.title}
                            </h4>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center', padding: '40px 0' }}>
                      No linked briefings in this chronicle yet.
                    </div>
                  )}
                </aside>


              </div>
            ) : (
              <div className="news-empty-state">
                <h2 className="empty-hero-title">Select a News Streak</h2>
                <p className="empty-hero-subtitle">Select an evolving current affairs topic from the left timeline to explore living summaries, node-based lineages, and evaluators.</p>
              </div>
            )
          )}



        </div>
      )}
        </>
      )}

      {/* Article Modal Overlay */}
      {articleModalItem && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)', padding: '20px'
        }} onClick={() => setArticleModalItem(null)}>
          <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px',
            width: '100%', maxWidth: '1200px', maxHeight: '90vh', overflowY: 'auto',
            display: 'flex', flexDirection: 'column', position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }} onClick={(e) => e.stopPropagation()} className="hide-scrollbar">
            
            {/* Modal Header */}
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'sticky', top: 0, background: 'var(--bg-hover)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                  {new Date(articleModalItem.item.publishedAt || articleModalItem.item.createdAt).toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })} • {articleModalItem.item.source || 'News'}
                </span>
                <h2 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', fontWeight: 900, margin: 0, lineHeight: 1.3 }}>
                  {lang === 'hi' ? (articleModalItem.item.title_hi || articleModalItem.item.title) : lang === 'mr' ? (articleModalItem.item.title_mr || articleModalItem.item.title) : articleModalItem.item.title}
                </h2>
              </div>
              <button 
                onClick={() => setArticleModalItem(null)}
                style={{ background: 'var(--border-color)', border: 'none', borderRadius: '50%', color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s', alignSelf: 'flex-start' }}
                className="hover-glow-btn"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="news-modal-body-grid" style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
              {/* Left Column: Complete Article Context & Editorial Lens */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Editorial Lens Box (if available) */}
                {articleModalItem.structuredData?.crux && (
                  <div style={{ background: 'rgba(192, 132, 252, 0.05)', border: '1px solid rgba(192, 132, 252, 0.2)', padding: '20px', borderRadius: '12px' }}>
                    <h5 style={{ color: '#c084fc', fontSize: '0.8rem', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BookOpen size={16} /> Editorial Lens
                    </h5>
                    <p style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.6 }}>
                      "{articleModalItem.structuredData.crux}"
                    </p>
                  </div>
                )}

                {/* Full Content */}
                <div>
                  <h5 style={{ color: '#fbbf24', fontSize: '0.85rem', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Complete Article Context
                  </h5>
                  <div style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {lang === 'hi' 
                        ? (articleModalItem.item.rawContent_hi || articleModalItem.item.rawContent || 'Hindi translation in progress...') 
                        : lang === 'mr' 
                          ? (articleModalItem.item.rawContent_mr || articleModalItem.item.rawContent || 'Marathi translation in progress...') 
                          : (articleModalItem.item.rawContent || 'No complete text available.')}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* Right Column: Practice Board */}
              <div className="news-modal-practice-column" style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '32px' }}>
                <h5 style={{ color: '#10b981', fontSize: '0.85rem', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckSquare size={16} /> Neural Practice Board
                </h5>
                {renderModalPracticeBoard(articleModalItem)}
              </div>
            </div>
            
          </div>
        </div>
      )}

      {triggerId && (
        <NotesTrigger
          entityType={triggerType}
          entityId={triggerId}
          entityTitle={triggerTitle}
          entitySubject={triggerSubject}
          entityTopic={triggerTopic}
          questions={triggerQuestions}
        />
      )}

      <style jsx>{`
        .main-loader {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .loader-ring {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(6, 182, 212, 0.1);
          border-top-color: #06b6d4;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .streak-filter-container {
          display: flex;
          gap: 0.5rem;
          margin: 0 0.75rem 0.75rem;
        }

        .streak-filter-select {
          flex: 1;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.4rem 0.6rem;
          color: var(--text-secondary);
          font-size: 0.75rem;
          font-family: inherit;
          font-weight: 700;
          outline: none;
          cursor: pointer;
        }

        .streak-filter-select:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .timeline-chronicle-item {
          transition: all 0.2s ease;
        }

        .timeline-chronicle-item:hover {
          background: var(--bg-hover) !important;
          border-color: rgba(255,255,255,0.08) !important;
          transform: translateX(4px);
        }

        @media (max-width: 768px) {
          .news-modal-body-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .news-modal-practice-column {
            border-left: none !important;
            padding-left: 0 !important;
            border-top: 1px solid var(--border-color) !important;
            padding-top: 24px !important;
          }
        }

        .news-hub-wrapper {
          margin-top: 0;
          height: calc(100vh - 72px);
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
          color: var(--text-primary);
          font-family: 'Outfit', sans-serif;
          overflow: hidden;
        }
        
        /* NEWS SUB HEADER */
        .news-hub-header {
          height: 64px;
          display: flex;
          align-items: center;
          padding: 0 1.5rem;
          background: var(--bg-card);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-color);
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
          color: var(--text-primary);
          cursor: pointer;
        }

        .brand-title {
          font-size: 1.1rem;
          font-weight: 900;
          color: var(--text-primary);
          margin: 0;
          letter-spacing: -0.01em;
        }

        .brand-subtitle {
          color: var(--text-muted);
          font-size: 0.7rem;
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
          background: var(--border-color);
          flex-shrink: 0;
        }

        .filter-chip {
          background: transparent;
          color: var(--text-muted);
          border: 1px solid transparent;
          padding: 0.3rem 0.75rem;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 900;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          text-transform: uppercase;
        }

        .filter-chip:hover {
          color: var(--text-secondary);
          background: var(--bg-hover);
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
          background: var(--bg-input);
          color: var(--text-muted);
          border: 1px solid var(--border-color);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
        }

        .date-card:hover {
          color: var(--text-secondary);
          border-color: var(--border-hover);
        }

        .date-card.active {
          background: #f59e0b;
          color: #0f172a;
          border-color: #f59e0b;
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.15);
          font-weight: 800;
        }

        .date-card-day {
          font-size: 0.58rem;
          font-weight: 800;
          opacity: 0.7;
        }

        .date-card-num {
          font-size: 0.88rem;
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
          border: 1px solid var(--border-color);
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

        /* TIMEFRAME TOGGLE AND HIGH IMPORTANCE STYLES */
        .timeframe-toggle-container {
          display: flex;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.2rem;
          margin: 0 0.75rem 0.75rem;
          gap: 0.2rem;
        }

        .timeframe-toggle-btn {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 0.4rem 0;
          border-radius: 6px;
          font-size: 0.72rem;
          font-family: inherit;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .timeframe-toggle-btn:hover {
          color: var(--text-secondary);
          background: var(--bg-hover);
        }

        .timeframe-toggle-btn.active {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .sidebar-item.high-importance {
          border-left: 3px solid #fbbf24 !important;
          background: rgba(245, 158, 11, 0.02);
        }

        .sidebar-item.high-importance:hover {
          background: rgba(245, 158, 11, 0.05);
        }

        .sidebar-item.high-importance.active {
          background: rgba(245, 158, 11, 0.08);
          border-left: 4px solid #fbbf24 !important;
          box-shadow: inset 3px 0 0 #fbbf24, 0 0 12px rgba(245, 158, 11, 0.15);
        }

        .segmented-timeline-toggle {
          display: flex;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 0.25rem;
          margin: 0.75rem;
          gap: 0.25rem;
        }

        .timeline-toggle-btn {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 0.5rem 0;
          border-radius: 8px;
          font-size: 0.8rem;
          font-family: inherit;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: center;
        }

        .timeline-toggle-btn:hover {
          color: var(--text-secondary);
          background: var(--bg-hover);
        }

        .timeline-toggle-btn.active {
          background: rgba(6, 182, 212, 0.1);
          color: #06b6d4;
          border: 1px solid rgba(6, 182, 212, 0.2);
          box-shadow: 0 0 12px rgba(6, 182, 212, 0.05);
        }

        .streak-sidebar-card {
          position: relative;
          background: var(--bg-input) !important;
          border: 1px solid var(--border-color) !important;
          margin-bottom: 0.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .streak-sidebar-card:hover {
          background: var(--bg-hover) !important;
          border-color: rgba(6, 182, 212, 0.2) !important;
          transform: translateY(-1px);
        }

        .streak-sidebar-card.active {
          background: rgba(6, 182, 212, 0.05) !important;
          border-color: rgba(6, 182, 212, 0.3) !important;
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.05);
        }

        .streak-card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .streak-meta-paper {
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .streak-meta-status {
          font-size: 0.65rem;
          font-weight: 900;
          text-transform: uppercase;
          padding: 1px 6px;
          border-radius: 4px;
          background: var(--bg-input);
        }

        .streak-card-title {
          font-size: 0.88rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.4;
        }

        .streak-sidebar-card.active .streak-card-title {
          color: var(--text-primary);
        }

        .streak-card-graph-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-top: 0.25rem;
        }

        .trendline-svg {
          opacity: 0.8;
          filter: drop-shadow(0 0 4px rgba(6, 182, 212, 0.2));
          transition: all 0.3s ease;
        }

        .streak-sidebar-card:hover .trendline-svg {
          opacity: 1;
        }

        .streak-updates-stat {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .count-number {
          font-size: 0.78rem;
          font-weight: 900;
        }

        .stat-time {
          font-size: 0.6rem;
          color: var(--text-muted);
          font-weight: 700;
          letter-spacing: 0.2px;
        }

        .streak-card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
          margin-top: 0.25rem;
        }

        .streak-tag-pill {
          font-size: 0.62rem;
          color: var(--text-secondary);
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .synthesis-tab-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.25s ease !important;
        }

        .synthesis-tab-btn:hover {
          background: var(--bg-hover) !important;
          border-color: var(--border-hover) !important;
        }

        .synthesis-tab-btn.active {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .lineage-node-container {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .lineage-node-container:hover .lineage-node-bubble {
          transform: scale(1.1);
          border-color: #06b6d4 !important;
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.3) !important;
        }

        .lineage-node-container.active .lineage-node-bubble {
          animation: pulseGlow 2s infinite alternate;
        }

        @keyframes pulseGlow {
          0% { box-shadow: 0 0 8px rgba(6, 182, 212, 0.4); }
          100% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.7); }
        }

        .weekly-bubble-btn {
          transition: all 0.2s ease !important;
          border: 1px solid var(--border-color) !important;
        }

        .weekly-bubble-btn:hover {
          background: var(--bg-hover) !important;
          color: var(--text-primary) !important;
          transform: translateY(-1px);
        }

        .weekly-bubble-btn.active {
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
        }

        .streak-detail-card {
          transition: all 0.25s ease !important;
        }

        .streak-detail-card:hover {
          border-color: var(--border-hover) !important;
          background: var(--bg-hover) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        /* LEFT SIDEBAR */
        .news-sidebar {
          width: 22%;
          min-width: 260px;
          max-width: 320px;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          height: 100%;
        }

        .sidebar-header {
          padding: 1rem;
          font-size: 0.62rem;
          font-weight: 900;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 1px;
          border-bottom: 1px solid var(--border-color);
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
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar-item:hover {
          background: var(--bg-hover);
          border-color: var(--border-hover);
        }

        .sidebar-item.active {
          background: var(--bg-hover);
          border-color: var(--border-hover);
        }

        .sidebar-item-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          align-items: center;
          margin-bottom: 0.35rem;
        }

        .sidebar-badge {
          font-size: 0.62rem;
          font-weight: 900;
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .sidebar-source {
          font-size: 0.68rem;
          color: var(--text-muted);
          font-weight: 700;
        }

        .sidebar-time {
          font-size: 0.65rem;
          color: var(--text-muted);
          font-weight: 600;
          margin-left: auto;
        }

        .sidebar-item-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-secondary);
          line-height: 1.4;
          transition: color 0.2s;
        }

        .sidebar-item-title.active {
          color: var(--text-primary);
        }

        .sidebar-issue-link {
          font-size: 0.65rem;
          color: #818cf8;
          background: rgba(99, 102, 241, 0.05);
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          display: inline-block;
          margin-top: 0.35rem;
          font-weight: 700;
        }

        .sidebar-empty {
          padding: 2.5rem 1rem;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.82rem;
          font-style: italic;
        }

        /* CENTER INTEL CANVAS */
        .news-center-canvas {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem 2.5rem;
          height: 100%;
          background: var(--bg-primary);
          transition: margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .article-container {
          max-width: 720px;
          margin: 0 auto;
        }

        .article-header {
          margin-bottom: 1.25rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid var(--border-color);
        }

        .article-meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          align-items: center;
          margin-bottom: 0.6rem;
        }

        .article-badge {
          font-size: 0.7rem;
          font-weight: 900;
          padding: 0.15rem 0.5rem;
          border-radius: 5px;
          text-transform: uppercase;
        }

        .meta-text {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 700;
          display: inline-flex;
          align-items: center;
        }

        .article-title {
          font-size: 1.5rem;
          font-weight: 900;
          line-height: 1.3;
          letter-spacing: -0.015em;
          color: var(--text-primary);
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
          font-size: 0.73rem;
          padding: 0.2rem 0.6rem;
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
          color: var(--text-muted);
          font-size: 0.73rem;
          font-weight: 700;
          text-decoration: none;
          transition: color 0.2s;
        }

        .original-source-link:hover {
          color: var(--text-secondary);
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
          background: var(--bg-input);
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
          font-size: 0.7rem;
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
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-secondary);
          margin: 0;
        }

        .analysis-section-title {
          font-size: 0.75rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
          display: inline-flex;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.35rem;
          width: 100%;
        }

        /* CORE BRIEFING TYPOGRAPHY */
        .markdown-content {
          font-size: 1.15rem;
          line-height: 1.8;
          color: var(--text-secondary);
        }

        .markdown-content :global(p) {
          margin-bottom: 1.25rem;
          font-size: 1.15rem;
          line-height: 1.8;
        }

        .markdown-content :global(ul), .markdown-content :global(ol) {
          margin-left: 1.25rem;
          margin-bottom: 1.25rem;
        }

        .markdown-content :global(li) {
          margin-bottom: 0.5rem;
          font-size: 1.15rem;
          line-height: 1.8;
        }

        .markdown-content :global(h3), .markdown-content :global(h4) {
          color: var(--text-primary);
          font-weight: 800;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-size: 1.15rem;
        }

        .markdown-content :global(blockquote) {
          border-left: 3px solid #3b82f6;
          background: rgba(59, 130, 246, 0.03);
          padding: 0.75rem 1rem;
          margin: 1rem 0;
          font-style: italic;
          border-radius: 0 6px 6px 0;
          font-size: 1.15rem;
          line-height: 1.8;
        }

        /* RIGHT PANEL: PRACTICE BOARD (INLINE SIDEBAR — no overlap) */
        .news-right-panel {
          width: 0;
          min-width: 0;
          background: var(--bg-secondary);
          border-left: 1px solid var(--border-color);
          overflow-y: auto;
          overflow-x: hidden;
          padding: 0;
          flex-shrink: 0;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s;
          height: 100%;
        }

        .news-right-panel.open {
          width: 380px;
          padding: 1.25rem 1.5rem;
        }


        .practice-close-btn:hover {
          color: var(--text-primary) !important;
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
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.6rem;
        }

        .practice-panel-header h2 {
          font-size: 0.95rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-primary);
          margin: 0;
        }

        .practice-tabs {
          display: flex;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.2rem;
          gap: 0.2rem;
        }

        .practice-tab-btn {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 0.45rem;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
        }

        .practice-tab-btn:not(:disabled):hover {
          color: var(--text-secondary);
        }

        .practice-tab-btn.active {
          background: var(--bg-hover);
          color: var(--text-primary);
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
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .mcq-card-badge {
          font-size: 0.65rem;
          font-weight: 900;
          color: #06b6d4;
          background: rgba(6, 182, 212, 0.05);
          border: 1px solid rgba(6, 182, 212, 0.15);
          padding: 0.1rem 0.4rem;
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
          font-size: 0.9rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.5;
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
          padding: 0.6rem 0.85rem;
          border-radius: 8px;
          font-size: 0.83rem;
          font-family: inherit;
          font-weight: 600;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .mcq-card-option-btn.interactive:hover {
          background: var(--bg-hover);
          border-color: var(--border-hover);
          color: var(--text-primary);
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
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.85rem;
          margin-top: 0.75rem;
          font-size: 0.83rem;
        }

        .exp-result-header {
          font-weight: 900;
          margin-bottom: 0.35rem;
        }

        .exp-sub-text {
          color: var(--text-secondary);
          margin: 0 0 0.25rem 0;
        }

        .exp-body-text {
          color: var(--text-muted);
          margin: 0;
          line-height: 1.5;
        }

        /* SUBJECTIVE MAINS CARDS */
        .mains-board-card {
          background: var(--bg-input);
          border: 1px solid var(--border-color);
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
          font-size: 0.65rem;
          font-weight: 900;
          padding: 0.1rem 0.4rem;
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
          font-size: 0.9rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.5;
          margin: 0 0 0.75rem 0;
        }

        .mains-reveal-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          padding: 0.6rem 0.85rem;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .mains-reveal-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .mains-model-answer {
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.85rem;
          margin-top: 0.5rem;
        }

        .model-answer-title {
          font-size: 0.72rem;
          font-weight: 900;
          color: #a78bfa;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.4rem;
        }

        .model-markdown-body {
          font-size: 0.87rem;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        /* FALLBACK CARD IF NO QUESTIONS */
        .study-assistant-card {
          background: var(--bg-input);
          border: 1px dashed var(--border-color);
          border-radius: 12px;
          padding: 1rem 1.25rem;
        }

        .assistant-header {
          display: flex;
          align-items: center;
          font-size: 0.82rem;
          font-weight: 900;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .assistant-text {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin: 0 0 0.6rem 0;
        }

        .assistant-list {
          margin: 0;
          padding-left: 1rem;
          font-size: 0.83rem;
          color: var(--text-muted);
          line-height: 1.55;
        }

        .assistant-list li {
          margin-bottom: 0.4rem;
        }

        /* MOBILE PRACTICE ELEMENT: Hidden on Desktop */
        .practice-panel-inline-mobile {
          display: none;
          margin-top: 2rem;
          border-top: 1px solid var(--border-color);
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
          color: var(--text-primary);
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
          color: var(--text-muted);
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
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 1.15rem;
          transition: all 0.2s;
        }

        .insight-card:hover {
          border-color: var(--border-hover);
          background: var(--bg-hover);
        }

        .insight-tag {
          font-size: 0.65rem;
          font-weight: 900;
          color: #10b981;
          background: rgba(16, 185, 129, 0.05);
          padding: 0.12rem 0.4rem;
          border-radius: 4px;
          margin-bottom: 0.6rem;
          display: inline-block;
        }

        .insight-card-title {
          font-size: 0.92rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 0.35rem 0;
        }

        .insight-card-desc {
          color: var(--text-muted);
          font-size: 0.82rem;
          line-height: 1.5;
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
            box-shadow: 10px 0 35px rgba(0, 0, 0, 0.3);
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
