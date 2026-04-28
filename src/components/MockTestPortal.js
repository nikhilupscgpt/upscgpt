'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  CheckCircle2, 
  ArrowRight,
  Maximize2,
  Settings,
  Menu,
  X
} from 'lucide-react';

const STATUS = {
  NOT_VISITED: 'NOT_VISITED',
  NOT_ANSWERED: 'NOT_ANSWERED',
  ANSWERED: 'ANSWERED',
  MARKED_FOR_REVIEW: 'MARKED_FOR_REVIEW',
  ANSWERED_MARKED_FOR_REVIEW: 'ANSWERED_MARKED_FOR_REVIEW',
};

export default function MockTestPortal({ testPack, userId }) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // questionId -> selectedLabel
  const [statusMap, setStatusMap] = useState({}); // questionId -> STATUS
  const [timeLeft, setTimeLeft] = useState(testPack.durationMins * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const questions = testPack.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  // Load state from localStorage on mount
  useEffect(() => {
    const storageKey = `mock_test_${testPack.id}_${userId}`;
    const savedState = localStorage.getItem(storageKey);
    
    if (savedState) {
      try {
        const { savedAnswers, savedStatusMap, savedTimeLeft, savedIndex } = JSON.parse(savedState);
        setAnswers(savedAnswers || {});
        setStatusMap(savedStatusMap || {});
        setTimeLeft(savedTimeLeft || testPack.durationMins * 60);
        setCurrentQuestionIndex(savedIndex || 0);
      } catch (e) {
        console.error("Failed to recover test state", e);
      }
    }
    setIsLoaded(true);
  }, [testPack.id, userId]);

  // Persist state to localStorage on changes
  useEffect(() => {
    if (!isLoaded) return;
    const storageKey = `mock_test_${testPack.id}_${userId}`;
    const stateToSave = {
      savedAnswers: answers,
      savedStatusMap: statusMap,
      savedTimeLeft: timeLeft,
      savedIndex: currentQuestionIndex
    };
    localStorage.setItem(storageKey, JSON.stringify(stateToSave));
  }, [answers, statusMap, timeLeft, currentQuestionIndex, isLoaded, testPack.id, userId]);

  // Initialize status for the first question
  useEffect(() => {
    if (questions.length > 0 && !statusMap[questions[0].id]) {
      updateStatus(questions[0].id, STATUS.NOT_ANSWERED);
    }
  }, [questions]);

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const updateStatus = (questionId, newStatus) => {
    setStatusMap(prev => ({ ...prev, [questionId]: newStatus }));
  };

  const handleOptionSelect = (label) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: label }));
  };

  const handleSaveNext = () => {
    if (answers[currentQuestion.id]) {
      updateStatus(currentQuestion.id, STATUS.ANSWERED);
    } else {
      updateStatus(currentQuestion.id, STATUS.NOT_ANSWERED);
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      const nextId = questions[currentQuestionIndex + 1].id;
      if (!statusMap[nextId]) updateStatus(nextId, STATUS.NOT_ANSWERED);
      setCurrentQuestionIndex(prev => prev + 1);
    }
    setShowPalette(false);
  };

  const handleMarkForReview = () => {
    const isAnswered = !!answers[currentQuestion.id];
    const newStatus = isAnswered 
      ? STATUS.ANSWERED_MARKED_FOR_REVIEW 
      : STATUS.MARKED_FOR_REVIEW;
    
    updateStatus(currentQuestion.id, newStatus);
    
    if (currentQuestionIndex < questions.length - 1) {
      const nextId = questions[currentQuestionIndex + 1].id;
      if (!statusMap[nextId]) updateStatus(nextId, STATUS.NOT_ANSWERED);
      setCurrentQuestionIndex(prev => prev + 1);
    }
    setShowPalette(false);
  };

  const handleClearResponse = () => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[currentQuestion.id];
      return newAnswers;
    });
    updateStatus(currentQuestion.id, STATUS.NOT_ANSWERED);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!confirm('Are you sure you want to submit the test?')) return;
    
    setIsSubmitting(true);

    try {
      const formattedAnswers = Object.keys(answers).map(qId => ({
        questionId: qId,
        selectedLabel: answers[qId]
      }));

      const res = await fetch('/api/quizzes/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testPackId: testPack.id,
          answers: formattedAnswers,
          timeTakenSecs: testPack.durationMins * 60 - timeLeft
        })
      });

      const data = await res.json();
      if (data.success) {
        // Clear persistence on successful submission
        const storageKey = `mock_test_${testPack.id}_${userId}`;
        localStorage.removeItem(storageKey);
        router.push(`/mock-test/result/${data.attemptId}`);
      } else {
        alert(data.error || 'Failed to submit quiz');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPaletteClass = (qId) => {
    const status = statusMap[qId] || STATUS.NOT_VISITED;
    switch (status) {
      case STATUS.ANSWERED: return 'ibps-btn-answered';
      case STATUS.NOT_ANSWERED: return 'ibps-btn-not-answered';
      case STATUS.MARKED_FOR_REVIEW: return 'ibps-btn-marked';
      case STATUS.ANSWERED_MARKED_FOR_REVIEW: return 'ibps-btn-answered-marked';
      case STATUS.NOT_VISITED: default: return 'ibps-btn-not-visited';
    }
  };

  const getSummaryCount = (status) => {
    return Object.values(statusMap).filter(s => s === status).length;
  };

  return (
    <div className="ibps-root">
      {/* Header */}
      <header className="ibps-header">
        <div className="ibps-brand">
          <div className="ibps-logo-box">
            <Maximize2 size={24} />
          </div>
          <div className="ibps-title-group">
            <h1 className="ibps-title">{testPack.title}</h1>
            <p className="ibps-subtitle">UPSC Atlas Exam Portal</p>
          </div>
        </div>

        <div className="ibps-header-right">
          <div className="ibps-timer-box">
            <Clock size={20} className="ibps-timer-icon" />
            <div className="ibps-timer-text">
              <span className="ibps-timer-label">Time Left</span>
              <span className={`ibps-timer-value ${timeLeft < 300 ? 'critical' : ''}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          <div className="ibps-user-profile hide-mobile">
            <div className="ibps-user-info">
              <p className="ibps-user-name">Candidate</p>
              <p className="ibps-user-id">ID: UPSC-2024</p>
            </div>
            <div className="ibps-user-avatar">
              <User size={28} />
            </div>
          </div>

          <button 
            className="ibps-palette-toggle"
            onClick={() => setShowPalette(!showPalette)}
          >
            {showPalette ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="ibps-container">
        {/* Left: Question Section */}
        <div className={`ibps-question-area ${showPalette ? 'hide-mobile' : ''}`}>
          <div className="ibps-tabs">
            <button className="ibps-tab active">General Studies</button>
            <div className="ibps-tab-info">Paper I</div>
          </div>

          <div className="ibps-question-content">
            <div className="ibps-q-header">
              <span className="ibps-q-number">{currentQuestionIndex + 1}</span>
              <h2 className="ibps-q-text">{currentQuestion.text}</h2>
            </div>

            <div className="ibps-options">
              {currentQuestion.options.map((opt) => (
                <label 
                  key={opt.label}
                  className={`ibps-option-card ${answers[currentQuestion.id] === opt.label ? 'selected' : ''}`}
                >
                  <input 
                    type="radio" 
                    name={`q-${currentQuestion.id}`} 
                    className="ibps-hidden-input"
                    checked={answers[currentQuestion.id] === opt.label}
                    onChange={() => handleOptionSelect(opt.label)}
                  />
                  <div className="ibps-option-label">{opt.label.toUpperCase()}</div>
                  <span className="ibps-option-text">{opt.text}</span>
                </label>
              ))}
            </div>
          </div>

          <footer className="ibps-footer">
            <div className="ibps-footer-top">
              <button onClick={handleMarkForReview} className="ibps-btn-sec">Mark for Review</button>
              <button onClick={handleClearResponse} className="ibps-btn-sec">Clear</button>
            </div>
            <div className="ibps-footer-bottom">
              <div className="ibps-nav-group">
                <button 
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="ibps-btn-nav"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="ibps-btn-nav"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <button onClick={handleSaveNext} className="ibps-btn-primary">
                Save & Next <ArrowRight size={16} />
              </button>
            </div>
          </footer>
        </div>

        {/* Right: Palette Section */}
        <aside className={`ibps-sidebar ${showPalette ? 'active' : ''}`}>
          <div className="ibps-summary">
            <p className="ibps-sidebar-title">Question Status</p>
            <div className="ibps-summary-grid">
              <div className="ibps-summary-item">
                <div className="ibps-square answered">{getSummaryCount(STATUS.ANSWERED)}</div>
                <span>Answered</span>
              </div>
              <div className="ibps-summary-item">
                <div className="ibps-square not-answered">{getSummaryCount(STATUS.NOT_ANSWERED)}</div>
                <span>Not Answered</span>
              </div>
              <div className="ibps-summary-item">
                <div className="ibps-square not-visited">{questions.length - Object.keys(statusMap).length}</div>
                <span>Not Visited</span>
              </div>
              <div className="ibps-summary-item">
                <div className="ibps-square marked">{getSummaryCount(STATUS.MARKED_FOR_REVIEW) + getSummaryCount(STATUS.ANSWERED_MARKED_FOR_REVIEW)}</div>
                <span>Marked</span>
              </div>
            </div>
          </div>

          <div className="ibps-palette">
            <div className="ibps-palette-header">
              <p className="ibps-sidebar-title">Question Palette</p>
              <Settings size={16} className="ibps-icon-muted" />
            </div>
            <div className="ibps-palette-grid">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => {
                    if (!statusMap[q.id]) updateStatus(q.id, STATUS.NOT_ANSWERED);
                    setCurrentQuestionIndex(idx);
                    setShowPalette(false);
                  }}
                  className={`ibps-palette-btn ${currentQuestionIndex === idx ? 'active' : ''} ${getPaletteClass(q.id)}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="ibps-submit-area">
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="ibps-submit-btn"
            >
              {isSubmitting ? 'Submitting...' : 'Final Submit'}
              <CheckCircle2 size={18} />
            </button>
            <p className="ibps-submit-hint">* Review all questions before submission.</p>
          </div>
        </aside>
      </div>

      <style jsx>{`
        .ibps-root {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background-color: #f8fafc;
          font-family: 'Outfit', sans-serif;
          color: #1e293b;
          overflow: hidden;
        }

        .ibps-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 24px;
          background-color: #0f172a;
          color: white;
          border-bottom: 1px solid #334155;
          flex-shrink: 0;
          z-index: 100;
        }

        .ibps-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .ibps-logo-box {
          background-color: #f59e0b;
          padding: 6px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0f172a;
          flex-shrink: 0;
        }

        .ibps-title-group {
          min-width: 0;
        }

        .ibps-title {
          font-size: 1rem;
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.01em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ibps-subtitle {
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94a3b8;
          font-weight: 700;
          margin: 0;
        }

        .ibps-header-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .ibps-timer-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: #1e293b;
          padding: 6px 12px;
          border-radius: 10px;
          border: 1px solid #334155;
        }

        .ibps-timer-icon {
          color: #f59e0b;
          width: 16px;
          height: 16px;
        }

        .ibps-timer-text {
          display: flex;
          flex-direction: column;
        }

        .ibps-timer-label {
          font-size: 0.5rem;
          text-transform: uppercase;
          color: #94a3b8;
          font-weight: 800;
        }

        .ibps-timer-value {
          font-family: monospace;
          font-size: 1rem;
          font-weight: 800;
        }

        .ibps-timer-value.critical {
          color: #f87171;
          animation: ibps-pulse 1s infinite;
        }

        .ibps-user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          border-left: 1px solid #334155;
          padding-left: 20px;
        }

        .ibps-palette-toggle {
          display: none;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
        }

        .ibps-user-info {
          text-align: right;
        }

        .ibps-user-name {
          font-size: 0.8rem;
          font-weight: 700;
          margin: 0;
        }

        .ibps-user-id {
          font-size: 0.65rem;
          color: #94a3b8;
          margin: 0;
        }

        .ibps-user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: #1e293b;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          border: 2px solid #334155;
        }

        .ibps-container {
          display: flex;
          flex: 1;
          overflow: hidden;
          position: relative;
        }

        .ibps-question-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          background-color: white;
          min-width: 0;
        }

        .ibps-tabs {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 16px;
          background-color: #f1f5f9;
          border-bottom: 1px solid #e2e8f0;
        }

        .ibps-tab {
          padding: 6px 16px;
          background-color: white;
          border: 1px solid #e2e8f0;
          border-bottom: none;
          font-size: 0.75rem;
          font-weight: 800;
          color: #0f172a;
          border-radius: 6px 6px 0 0;
          margin-bottom: -7px;
          z-index: 10;
        }

        .ibps-tab-info {
          font-size: 0.65rem;
          font-weight: 700;
          color: #64748b;
          background-color: white;
          padding: 2px 8px;
          border-radius: 999px;
          border: 1px solid #e2e8f0;
        }

        .ibps-question-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px 24px 40px;
        }

        .ibps-q-header {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        .ibps-q-number {
          width: 32px;
          height: 32px;
          background-color: #0f172a;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .ibps-q-text {
          font-size: 1.1rem;
          font-weight: 500;
          line-height: 1.5;
          margin: 0;
          color: #334155;
          white-space: pre-wrap;
        }

        .ibps-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 800px;
        }

        .ibps-option-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background-color: #f8fafc;
          border: 2px solid #f1f5f9;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .ibps-option-card:hover {
          border-color: #e2e8f0;
        }

        .ibps-option-card.selected {
          border-color: #2563eb;
          background-color: #eff6ff;
        }

        .ibps-hidden-input {
          display: none;
        }

        .ibps-option-label {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.8rem;
          color: #94a3b8;
          background-color: white;
          flex-shrink: 0;
        }

        .ibps-option-card.selected .ibps-option-label {
          background-color: #2563eb;
          border-color: #2563eb;
          color: white;
        }

        .ibps-option-text {
          font-size: 0.95rem;
          font-weight: 500;
          color: #475569;
        }

        .ibps-footer {
          padding: 12px 16px;
          background-color: #f1f5f9;
          border-top: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex-shrink: 0;
        }

        .ibps-footer-top, .ibps-footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }

        .ibps-nav-group {
          display: flex;
          gap: 8px;
        }

        .ibps-btn-sec {
          flex: 1;
          padding: 8px 12px;
          background-color: white;
          border: 1px solid #cbd5e1;
          color: #475569;
          font-weight: 700;
          border-radius: 10px;
          font-size: 0.75rem;
          cursor: pointer;
        }

        .ibps-btn-nav {
          width: 36px;
          height: 36px;
          background-color: white;
          border: 1px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          cursor: pointer;
        }

        .ibps-btn-nav:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .ibps-btn-primary {
          padding: 8px 16px;
          background-color: #2563eb;
          color: white;
          font-weight: 700;
          border: none;
          border-radius: 10px;
          font-size: 0.8rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ibps-sidebar {
          width: 280px;
          background-color: white;
          border-left: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }

        .ibps-summary {
          padding: 16px;
          background-color: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .ibps-sidebar-title {
          font-size: 0.65rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          margin-bottom: 12px;
        }

        .ibps-summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .ibps-summary-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ibps-summary-item span {
          font-size: 0.6rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
        }

        .ibps-square {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.7rem;
          color: white;
        }

        .ibps-square.answered { background-color: #16a34a; }
        .ibps-square.not-answered { background-color: #dc2626; }
        .ibps-square.not-visited { background-color: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; }
        .ibps-square.marked { background-color: #9333ea; }

        .ibps-palette {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }

        .ibps-palette-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .ibps-palette-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        .ibps-palette-btn {
          aspect-ratio: 1;
          border: 2px solid #f1f5f9;
          border-radius: 10px;
          font-weight: 800;
          font-size: 0.8rem;
          cursor: pointer;
        }

        .ibps-palette-btn.active {
          border-color: #2563eb;
          transform: scale(1.05);
        }

        .ibps-btn-not-visited { background-color: #f8fafc; color: #64748b; }
        .ibps-btn-not-answered { background-color: #dc2626; color: white; border-color: #b91c1c; }
        .ibps-btn-answered { background-color: #16a34a; color: white; border-color: #15803d; }
        .ibps-btn-marked { background-color: #9333ea; color: white; border-color: #7e22ce; }
        .ibps-btn-answered-marked { 
          background-color: #9333ea; color: white; border-color: #7e22ce;
          position: relative;
        }
        .ibps-btn-answered-marked::after {
          content: '✓';
          position: absolute;
          bottom: -4px;
          right: -4px;
          background-color: #22c55e;
          color: white;
          font-size: 6px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }

        .ibps-submit-area {
          padding: 16px;
          background-color: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }

        .ibps-submit-btn {
          width: 100%;
          padding: 12px;
          background-color: #0f172a;
          color: white;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 0.8rem;
        }

        .ibps-submit-hint {
          font-size: 0.6rem;
          color: #94a3b8;
          text-align: center;
          margin-top: 8px;
          font-style: italic;
        }

        @keyframes ibps-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        /* Responsive Breakpoints */
        @media (max-width: 768px) {
          .ibps-header { padding: 12px 16px; }
          .hide-mobile { display: none !important; }
          .ibps-palette-toggle { display: block; }
          
          .ibps-sidebar {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            z-index: 50;
            transform: translateX(100%);
            border-left: none;
          }

          .ibps-sidebar.active {
            transform: translateX(0);
          }

          .ibps-question-content { padding: 16px 16px 80px; }
          .ibps-q-header { margin-bottom: 16px; }
          .ibps-q-text { font-size: 1rem; }
          .ibps-option-text { font-size: 0.85rem; }
          
          .ibps-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 40;
            background-color: white;
            box-shadow: 0 -4px 12px rgba(0,0,0,0.05);
          }
        }

        @media (min-width: 769px) {
          .ibps-footer {
            flex-direction: row;
            padding: 16px 24px;
          }
          .ibps-footer-top { flex: none; gap: 12px; }
          .ibps-footer-bottom { flex: none; gap: 12px; }
          .ibps-btn-sec { padding: 10px 20px; font-size: 0.85rem; }
          .ibps-btn-primary { padding: 10px 28px; font-size: 0.85rem; }
        }
      `}</style>
    </div>
  );
}
