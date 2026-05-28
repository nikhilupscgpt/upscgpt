"use client";

import { useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  BrainCircuit, 
  History, 
  Sparkles,
  Info,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Target,
  ArrowRight,
  Flame,
  Award,
  Lock,
  FileText,
  X,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import NewsBriefsSidebar from '@/components/NewsBriefsSidebar';
import FloatingChatWrapper from '@/components/content-portal/FloatingChatWrapper';

export default function PrelimsNodeWorkspace({ issue, articles = [], sessionExists }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('summary');
  const [chatOpen, setChatOpen] = useState(false);

  // Merge direct questions and test pack questions, filtering out Mains questions
  const initialQuestions = (issue.questions || [])
    .filter(q => !q.tags?.includes('mains') && q.correctLabel?.toLowerCase() !== 'mains');
  issue.testPacks?.forEach(tp => {
    tp.questions?.forEach(q => {
      if (!q.tags?.includes('mains') && q.correctLabel?.toLowerCase() !== 'mains' && !initialQuestions.some(existing => existing.id === q.id)) {
        initialQuestions.push(q);
      }
    });
  });

  const [questions, setQuestions] = useState(initialQuestions);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [qId]: label }
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });

  // Normalization helper for options (handles array of objects or key-value object)
  const normalizeOptions = (options) => {
    if (!options) return [];
    if (Array.isArray(options)) {
      return options.map(o => {
        if (typeof o === 'string') return { label: o.substring(0, 1).toLowerCase(), text: o };
        return { label: (o.label || '').toLowerCase(), text: o.text || '' };
      });
    }
    if (typeof options === 'object') {
      return Object.entries(options).map(([label, text]) => ({
        label: label.toLowerCase(),
        text: String(text)
      }));
    }
    return [];
  };

  const handleSelectOption = (qId, optionLabel, correctLabel) => {
    // Prevent re-selection if already answered
    if (selectedAnswers[qId]) return;

    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: optionLabel
    }));

    const isCorrect = optionLabel.toLowerCase() === correctLabel.toLowerCase();
    setScore(prev => ({
      ...prev,
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1)
    }));

    if (isCorrect) {
      toast.success('Correct answer!', { id: 'quiz-toast' });
    } else {
      toast.error('Incorrect. Review the strategic explanation.', { id: 'quiz-toast' });
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setCurrentQIdx(0);
    setScore({ correct: 0, incorrect: 0 });
    toast.success('Practice test reset.');
  };

  const handleGenerateAIQuiz = async () => {
    setIsGeneratingAI(true);
    const toastId = toast.loading('Gemini is generating 5 custom UPSC-style MCQs...');
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope: issue.id,
          scopeType: 'ISSUE'
        })
      });

      const data = await res.json();
      if (res.ok && data.questions) {
        setQuestions(data.questions);
        setSelectedAnswers({});
        setCurrentQIdx(0);
        setScore({ correct: 0, incorrect: 0 });
        toast.success('Successfully generated 5 high-yield MCQs!', { id: toastId });
      } else {
        throw new Error(data.error || 'Failed to generate questions');
      }
    } catch (err) {
      toast.error(err.message || 'Error generating quiz', { id: toastId });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const currentQuestion = questions[currentQIdx];
  const normalizedOptions = currentQuestion ? normalizeOptions(currentQuestion.options) : [];
  const selectedLabel = currentQuestion ? selectedAnswers[currentQuestion.id] : null;

  const gsPaper = issue.gsPapers?.[0] || 'GS Paper';
  const category = issue.category?.replace('_', ' ') || 'General';

  // Tabs structure
  const tabs = [
    { id: 'summary', label: 'Summary', icon: BookOpen },
    { id: 'details', label: 'Details/Explained', icon: FileText },
    { id: 'pyq', label: 'PYQs', icon: History },
    { id: 'practice', label: 'Practice Question', icon: BrainCircuit }
  ];

  return (
    <div className="study-container">
      <div style={{ maxWidth: '1300px', margin: '0 auto' }} className="workspace-layout-wrapper">
      {/* Breadcrumb */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <Link href="/prelims" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>Prelims Gateway</span>
        </Link>
        <ChevronRight size={14} style={{ color: 'var(--border-color)' }} />
        <Link href="/prelims/prepare" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
          <span>Study Vault</span>
        </Link>
        <ChevronRight size={14} style={{ color: 'var(--border-color)' }} />
        <span style={{ color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }}>{issue.title}</span>
      </div>

      {/* Hero Header */}
      <div style={{ marginBottom: '56px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#fbbf24', background: 'rgba(251, 191, 36, 0.1)', padding: '4px 12px', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '1px', border: '1px solid rgba(251, 191, 36, 0.15)' }}>{gsPaper}</span>
          <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-secondary)', background: 'var(--bg-input)', padding: '4px 12px', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>{category}</span>
        </div>
        <h1 className="detail-title" style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-1px' }}>{issue.title}</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '800px', lineHeight: 1.6 }}>{issue.topic}</p>
      </div>

      <WorkspaceLayout
        themeColor="amber"
        sidebarContent={
          <>
            <NewsBriefsSidebar 
              articles={articles} 
              slug={issue.slug} 
              categoryLabel={category}
              flow="prelims"
              themeColor="amber"
            />
            {chatOpen && sessionExists && (
              <div 
                className="workspace-assistant-container fade-in"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '24px',
                  padding: '24px',
                  backdropFilter: 'blur(12px)',
                  fontFamily: "'Outfit', sans-serif",
                  display: 'flex',
                  flexDirection: 'column',
                  height: '550px',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontWeight: 800, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <Sparkles size={16} />
                    <span>Neural Assistant</span>
                  </div>
                  <button 
                    onClick={() => setChatOpen(false)} 
                    style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                  <FloatingChatWrapper
                    subjectId={issue.id}
                    displayName={issue.title}
                    examType="PRELIMS"
                    variant="inline"
                  />
                </div>
              </div>
            )}
          </>
        }
      >
        <div className="workspace-container">
          {/* Tab Controls */}
          <div className="workspace-tabs">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`workspace-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                  {tab.id === 'practice' && questions.length > 0 && (
                    <span className="q-count-pill">{questions.length}</span>
                  )}
                </button>
              );
            })}

            {sessionExists ? (
              <button 
                onClick={() => setChatOpen(!chatOpen)} 
                className={`ask-ai-toggle-btn ${chatOpen ? 'chat-open' : ''}`}
                style={{
                  marginLeft: 'auto',
                  background: 'rgba(251, 191, 36, 0.1)',
                  color: '#fbbf24',
                  border: '1px solid rgba(251, 191, 36, 0.2)',
                  borderRadius: '12px',
                  padding: '10px 20px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.25s ease'
                }}
              >
                <MessageSquare size={14} />
                <span>{chatOpen ? 'Close Assistant' : 'Ask AI'}</span>
              </button>
            ) : (
              <button 
                onClick={() => {
                  router.push(`/login?callbackUrl=${window.location.pathname}`);
                }} 
                className="ask-ai-toggle-btn locked-btn"
                style={{
                  marginLeft: 'auto',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                <Lock size={14} />
                <span>Ask AI</span>
              </button>
            )}
          </div>

          {/* Workspace Panel */}
          <div className="workspace-panel">
            {/* Tab 1: Summary (Overview) */}
            {activeTab === 'summary' && (
              <div className="tab-pane fade-in">
                <div className="panel-header-badge">
                  <span className="badge-bullet"></span> BRIEF SUMMARY
                </div>
                <div className="markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {issue.cumulativeSummary || issue.backgroundNote || 'No detailed summary available for this node yet.'}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Tab 2: Details/Explained (prelimsNote deep dive) */}
            {activeTab === 'details' && (
              <div className="tab-pane fade-in">
                <div className="panel-header-badge" style={{ borderColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
                  <span className="badge-bullet" style={{ background: '#10b981' }}></span> PRELIMS NOTES & HIGH-YIELD FACTS
                </div>
                {issue.nodeContent?.prelimsNote ? (
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {issue.nodeContent.prelimsNote}
                    </ReactMarkdown>
                  </div>
                ) : issue.prelimsNote ? (
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {typeof issue.prelimsNote === 'string' ? issue.prelimsNote : JSON.stringify(issue.prelimsNote)}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="empty-notes-container">
                    <Flame size={40} className="glow-icon" />
                    <h3>Study Note Pending</h3>
                    <p>High-yield factual pointers are currently being synthesized for this topic.</p>
                  </div>
                )}

                {/* Facts list if exists in nodeContent */}
                {issue.nodeContent?.facts && Array.isArray(issue.nodeContent.facts) && issue.nodeContent.facts.length > 0 && (
                  <div className="facts-section">
                    <h4 className="facts-section-title">Core Memorization Anchors</h4>
                    <div className="facts-grid">
                      {issue.nodeContent.facts.map((fact, idx) => (
                        <div key={idx} className="fact-card">
                          <div className="fact-num"># {idx + 1}</div>
                          <p>{typeof fact === 'string' ? fact : fact.fact || JSON.stringify(fact)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: PYQ */}
            {activeTab === 'pyq' && (
              <div className="tab-pane fade-in">
                <div className="panel-header-badge" style={{ borderColor: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>
                  <span className="badge-bullet" style={{ background: '#f59e0b' }}></span> PREVIOUS YEARS CONTEXT
                </div>

                {issue.pyqLinks && issue.pyqLinks.length > 0 ? (
                  <div className="pyq-timeline">
                    {issue.pyqLinks.map(pyq => (
                      <div key={pyq.id} className="pyq-item">
                        <div className="pyq-meta-row">
                          <span className="pyq-year-badge">UPSC {pyq.year}</span>
                          <span className="pyq-paper">{pyq.paperType}</span>
                        </div>
                        <div className="pyq-text">{pyq.questionText}</div>
                        {pyq.howToUse && (
                          <div className="pyq-note-box">
                            <div className="note-title">STRATEGIC TUTOR NOTE</div>
                            <p>{pyq.howToUse}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-notes-container">
                    <HelpCircle size={40} style={{ color: '#64748b' }} />
                    <h3>No Linked PYQs</h3>
                    <p>No past UPSC questions have been directly mapped to this specific node yet.</p>
                  </div>
                )}
              </div>
            )}

        {/* Tab 4: Practice Question */}
        {activeTab === 'practice' && (
          <div className="tab-pane fade-in">
            {questions.length > 0 ? (
              <>
                <div className="quiz-workspace">
                
                {/* Quiz Header Progress */}
                <div className="quiz-progress-section">
                  <div className="quiz-progress-stats">
                    <div className="stat">
                      <span className="label">QUESTION</span>
                      <span className="value">{currentQIdx + 1} of {questions.length}</span>
                    </div>
                    <div className="stat">
                      <span className="label">SCORE</span>
                      <span className="value score-value">
                        <span className="text-emerald">{score.correct} Correct</span>
                        <span className="divider">/</span>
                        <span className="text-rose">{score.incorrect} Incorrect</span>
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="quiz-progress-track">
                    <div 
                      className="quiz-progress-bar" 
                      style={{ width: `${((currentQIdx + 1) / questions.length) * 100}%` }}
                    />
                  </div>

                  {/* Bullet progress indicators */}
                  <div className="quiz-bullets">
                    {questions.map((q, idx) => {
                      const ans = selectedAnswers[q.id];
                      let bulletClass = '';
                      if (ans) {
                        bulletClass = ans.toLowerCase() === q.correctLabel.toLowerCase() ? 'correct' : 'incorrect';
                      }
                      return (
                        <button
                          key={q.id}
                          className={`bullet-dot ${bulletClass} ${currentQIdx === idx ? 'active' : ''}`}
                          onClick={() => setCurrentQIdx(idx)}
                          aria-label={`Go to question ${idx + 1}`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Question Display Card */}
                <div className="question-card">
                  <div className="q-card-header">
                    <span className="q-number-label">MCQ FOCUS</span>
                    <span className={`difficulty-badge ${currentQuestion.difficulty?.toLowerCase() || 'medium'}`}>
                      {currentQuestion.difficulty || 'MEDIUM'}
                    </span>
                  </div>

                  <h3 className="question-text-content">
                    {currentQuestion.text}
                  </h3>

                  {/* Options Grid */}
                  <div className="options-grid">
                    {normalizedOptions.map(opt => {
                      const isSelected = selectedLabel === opt.label;
                      const isCorrect = opt.label === currentQuestion.correctLabel.toLowerCase();
                      const hasAnswered = !!selectedLabel;

                      let optStateClass = '';
                      if (hasAnswered) {
                        if (isCorrect) {
                          optStateClass = 'correct-option';
                        } else if (isSelected) {
                          optStateClass = 'incorrect-option';
                        } else {
                          optStateClass = 'dimmed';
                        }
                      } else {
                        optStateClass = 'selectable';
                      }

                      return (
                        <button
                          key={opt.label}
                          disabled={hasAnswered}
                          className={`option-btn ${optStateClass}`}
                          onClick={() => handleSelectOption(currentQuestion.id, opt.label, currentQuestion.correctLabel)}
                        >
                          <div className="option-label-circle">{opt.label.toUpperCase()}</div>
                          <div className="option-text-label">{opt.text}</div>
                          {hasAnswered && isCorrect && (
                            <CheckCircle2 size={18} className="status-icon correct-icon" />
                          )}
                          {hasAnswered && isSelected && !isCorrect && (
                            <XCircle size={18} className="status-icon incorrect-icon" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Strategic Explanation */}
                  {selectedLabel && (
                    <div className="explanation-wrapper slide-up">
                      <div className="explanation-header">
                        <Award size={18} />
                        <h4>Strategic UPSC Explanation</h4>
                      </div>
                      <div className="explanation-body">
                        <p>{currentQuestion.explanation}</p>
                      </div>
                    </div>
                  )}

                  {/* Quiz Navigation Footer */}
                  <div className="quiz-navigation-footer">
                    <button 
                      className="nav-btn secondary"
                      disabled={currentQIdx === 0}
                      onClick={() => setCurrentQIdx(p => p - 1)}
                    >
                      <ChevronLeft size={16} /> Previous
                    </button>

                    <button
                      className="reset-btn"
                      onClick={handleResetQuiz}
                      title="Reset practice test status"
                    >
                      <RotateCcw size={14} /> Reset
                    </button>

                    <button 
                      className="nav-btn primary"
                      disabled={currentQIdx === questions.length - 1}
                      onClick={() => setCurrentQIdx(p => p + 1)}
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>

                </div>

              </div>
              {!sessionExists && (
                <div style={{ marginTop: '24px', padding: '20px', background: 'rgba(251, 191, 36, 0.03)', border: '1px solid rgba(251, 191, 36, 0.12)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Award size={18} />
                    </div>
                    <div>
                      <h4 style={{ color: 'var(--text-primary)', margin: '0 0 4px', fontSize: '0.9rem', fontWeight: 700 }}>Save Your Progress</h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>Sign in to track your score accuracy, save attempts, and unlock personalized current affairs tracking.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => router.push(`/login?callbackUrl=${window.location.pathname}`)}
                    style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#020617', border: 'none', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(251, 191, 36, 0.2)', transition: '0.2s' }}
                    className="hover-glow-btn"
                  >
                    Create Free Account
                  </button>
                </div>
              )}
              </>
            ) : (
            <div className="ai-quiz-generation-fallback">
              <div className="fallback-glow-circle">
                <BrainCircuit size={48} className="glow-icon" />
              </div>
              <h3>UPSC Practice Test Lab</h3>
              <p>
                No static questions are pre-seeded for this syllabus topic. Let Gemini AI dynamically create 5 high-yield, exam-focused MCQs mapping specifically to this node's scope.
              </p>
              <button 
                className={`ai-generation-btn ${!sessionExists ? 'locked-btn' : ''}`}
                disabled={isGeneratingAI}
                onClick={sessionExists ? handleGenerateAIQuiz : () => {
                  toast.error("Sign in required to generate custom AI quizzes.");
                  router.push(`/login?callbackUrl=${window.location.pathname}`);
                }}
                style={{
                  background: !sessionExists ? 'rgba(255, 255, 255, 0.05)' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  borderColor: !sessionExists ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  cursor: 'pointer'
                }}
              >
                {isGeneratingAI ? (
                  <>
                    <span className="spinner"></span> Synthesizing UPSC Dimensions...
                  </>
                ) : (
                  <>
                    {sessionExists ? <Sparkles size={16} /> : <Lock size={16} />}
                    {sessionExists ? 'Generate Precision Quiz with AI' : 'Sign in to generate AI Quiz'}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
          </div>
        </div>
      </WorkspaceLayout>

      {/* Styled block */}
      <style jsx global>{`
        .study-container {
          min-height: 100vh;
          background: var(--bg-primary);
          color: var(--text-primary);
          padding: 80px 24px 80px;
          font-family: 'Outfit', sans-serif;
          position: relative;
        }

        .workspace-container {
          display: flex;
          flex-direction: column;
          gap: 28px;
          font-family: 'Outfit', sans-serif;
        }

        /* Tabs Styles */
        .workspace-tabs {
          display: flex;
          gap: 8px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 4px;
          flex-wrap: wrap;
        }

        .workspace-tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          border-radius: 12px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .workspace-tab-btn:hover {
          color: var(--text-primary);
          background: var(--bg-hover);
        }

        .workspace-tab-btn.active {
          color: var(--color-amber);
          background: rgba(245, 158, 11, 0.08);
        }

        .workspace-tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--color-amber);
          border-radius: 99px;
        }

        .q-count-pill {
          background: rgba(251, 191, 36, 0.2);
          color: #fde68a;
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: 6px;
          font-weight: 800;
        }

        /* Workspace Panel */
        .workspace-panel {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 28px;
          padding: 36px;
          min-height: 400px;
          backdrop-filter: blur(16px);
        }

        .panel-header-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 1px;
          color: var(--color-amber);
          border: 1px solid rgba(245, 158, 11, 0.2);
          padding: 6px 14px;
          border-radius: 99px;
          background: rgba(245, 158, 11, 0.03);
          margin-bottom: 28px;
        }

        .badge-bullet {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-amber);
        }

        .markdown-content {
          color: var(--text-secondary);
          line-height: 1.8;
          font-size: 1.05rem;
        }

        .markdown-content p {
          margin-bottom: 20px;
        }

        .markdown-content ul, .markdown-content ol {
          margin: 16px 0;
          padding-left: 20px;
        }

        .markdown-content li {
          margin-bottom: 8px;
        }

        .markdown-content strong {
          color: var(--text-primary);
        }

        /* Animations */
        .fade-in {
          animation: tabFadeIn 0.35s ease;
        }

        @keyframes tabFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Facts List */
        .facts-section {
          margin-top: 40px;
          border-top: 1px solid var(--border-color);
          padding-top: 32px;
        }

        .facts-section-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 20px;
        }

        .facts-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        .fact-card {
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .fact-num {
          font-size: 0.8rem;
          font-weight: 900;
          color: #10b981;
          background: rgba(16, 185, 129, 0.1);
          padding: 4px 8px;
          border-radius: 6px;
        }

        .fact-card p {
          color: var(--text-secondary);
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        /* Timeline PYQ */
        .pyq-timeline {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .pyq-item {
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 24px;
          transition: border-color 0.2s;
        }

        .pyq-item:hover {
          border-color: rgba(245, 158, 11, 0.3);
        }

        .pyq-meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .pyq-year-badge {
          font-size: 0.8rem;
          font-weight: 800;
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
          padding: 4px 10px;
          border-radius: 6px;
        }

        .pyq-paper {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 700;
        }

        .pyq-text {
          font-size: 1rem;
          line-height: 1.6;
          color: var(--text-primary);
          margin-bottom: 16px;
        }

        .pyq-note-box {
          background: rgba(245, 158, 11, 0.04);
          border-left: 3px solid #f59e0b;
          border-radius: 8px;
          padding: 14px 18px;
        }

        .pyq-note-box .note-title {
          font-size: 0.75rem;
          font-weight: 800;
          color: #f59e0b;
          margin-bottom: 4px;
          letter-spacing: 0.5px;
        }

        .pyq-note-box p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.5;
        }

        /* Empty / Fallback Notes */
        .empty-notes-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          text-align: center;
        }

        .glow-icon {
          color: var(--text-muted);
          filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.05));
          margin-bottom: 16px;
        }

        .empty-notes-container h3 {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .empty-notes-container p {
          font-size: 0.9rem;
          color: var(--text-muted);
          max-width: 400px;
        }

        /* Quiz Workspace */
        .quiz-workspace {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .quiz-progress-section {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 20px 24px;
        }

        .quiz-progress-stats {
          display: flex;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .quiz-progress-stats .stat {
          display: flex;
          flex-direction: column;
        }

        .quiz-progress-stats .label {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-muted);
          letter-spacing: 1px;
          margin-bottom: 2px;
        }

        .quiz-progress-stats .value {
          font-size: 1rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .score-value {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .score-value .divider {
          color: var(--text-muted);
        }

        .text-emerald {
          color: #10b981;
        }

        .text-rose {
          color: #f43f5e;
        }

        .quiz-progress-track {
          height: 6px;
          background: var(--bg-input);
          border-radius: 99px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .quiz-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #fbbf24, #f59e0b);
          border-radius: 99px;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .quiz-bullets {
          display: flex;
          gap: 8px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .bullet-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--border-color);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: all 0.2s;
        }

        .bullet-dot:hover {
          background: var(--text-muted);
        }

        .bullet-dot.active {
          transform: scale(1.3);
          background: #fbbf24;
          box-shadow: 0 0 8px rgba(251, 191, 36, 0.5);
        }

        .bullet-dot.correct {
          background: #10b981;
        }

        .bullet-dot.incorrect {
          background: #f43f5e;
        }

        /* Question Display Card */
        .question-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 24px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .q-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .q-number-label {
          font-size: 0.7rem;
          font-weight: 900;
          color: #6366f1;
          letter-spacing: 1px;
          background: rgba(99, 102, 241, 0.1);
          padding: 4px 10px;
          border-radius: 6px;
        }

        .difficulty-badge {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .difficulty-badge.easy { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .difficulty-badge.medium { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .difficulty-badge.hard { background: rgba(239, 68, 68, 0.1); color: #f43f5e; }

        .question-text-content {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.5;
        }

        .options-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .option-btn {
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
          padding: 16px 20px;
          border-radius: 16px;
          text-align: left;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          color: var(--text-secondary);
          position: relative;
        }

        .option-btn.selectable:hover {
          background: var(--bg-hover);
          border-color: var(--border-hover);
          transform: translateY(-1px);
        }

        .option-btn.selectable:active {
          transform: scale(0.99);
        }

        .option-label-circle {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: var(--bg-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 900;
          color: var(--text-muted);
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .option-btn.correct-option {
          background: rgba(16, 185, 129, 0.06);
          border-color: var(--color-emerald);
          color: var(--text-primary);
        }

        .option-btn.correct-option .option-label-circle {
          background: var(--color-emerald);
          color: var(--bg-primary);
        }

        .option-btn.incorrect-option {
          background: rgba(244, 63, 94, 0.06);
          border-color: var(--color-rose);
          color: var(--text-primary);
        }

        .option-btn.incorrect-option .option-label-circle {
          background: var(--color-rose);
          color: var(--bg-primary);
        }

        .option-btn.dimmed {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .option-text-label {
          font-size: 1rem;
          font-weight: 500;
          line-height: 1.4;
          flex: 1;
        }

        .status-icon {
          flex-shrink: 0;
        }

        .correct-icon {
          color: var(--color-emerald);
        }

        .incorrect-icon {
          color: var(--color-rose);
        }

        /* Explanation Wrapper */
        .explanation-wrapper {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(99, 102, 241, 0.01));
          border: 1px solid rgba(99, 102, 241, 0.15);
          border-radius: 16px;
          padding: 24px;
        }

        .slide-up {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .explanation-header {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--color-purple);
          margin-bottom: 12px;
        }

        .explanation-header h4 {
          font-size: 0.95rem;
          font-weight: 800;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .explanation-body {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        /* Quiz Footer Navigation */
        .quiz-navigation-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
          border-top: 1px solid var(--border-color);
          padding-top: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-btn.primary {
          background: var(--neural-blue);
          color: white;
          border: none;
        }

        .nav-btn.primary:hover:not(:disabled) {
          background: var(--neural-blue);
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .nav-btn.secondary {
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
        }

        .nav-btn.secondary:hover:not(:disabled) {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .reset-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .reset-btn:hover {
          color: var(--color-rose);
          background: rgba(244, 63, 94, 0.05);
        }

        /* AI Fallback Screen */
        .ai-quiz-generation-fallback {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 64px 24px;
        }

        .fallback-glow-circle {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: rgba(139, 92, 246, 0.05);
          border: 1px solid rgba(139, 92, 246, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          box-shadow: 0 0 40px rgba(139, 92, 246, 0.1);
        }

        .fallback-glow-circle .glow-icon {
          color: var(--color-purple);
          filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.4));
          margin: 0;
        }

        .ai-quiz-generation-fallback h3 {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 12px;
        }

        .ai-quiz-generation-fallback p {
          font-size: 0.95rem;
          color: var(--text-muted);
          max-width: 500px;
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .ai-generation-btn {
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 16px;
          font-weight: 800;
          font-size: 0.95rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .ai-generation-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(99, 102, 241, 0.5);
        }

        .ai-generation-btn:active {
          transform: scale(0.98);
        }

        .ai-generation-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Spinner for loading state */
        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .workspace-panel {
            padding: 24px 16px;
          }
          .question-text-content {
            font-size: 1.1rem;
          }
          .option-btn {
            padding: 14px;
            gap: 12px;
          }
          .question-card {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  </div>
  );
}
