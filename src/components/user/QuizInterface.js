"use client";

import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Trophy, AlertCircle, Clock, CheckCircle2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function QuizInterface({ testPackId, onClose, onComplete }) {
  const [loading, setLoading] = useState(true);
  const [testPack, setTestPack] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]); // [{questionId, selectedLabel}]
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const res = await fetch(`/api/quizzes/${testPackId}`);
        const data = await res.json();
        if (data.success) {
          setTestPack(data.testPack);
          if (data.testPack.durationMins > 0) {
            setTimeRemaining(data.testPack.durationMins * 60);
          }
        } else {
          toast.error(data.error || "Failed to load quiz");
          onClose();
        }
      } catch (err) {
        toast.error("Network error loading quiz");
        onClose();
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [testPackId]);

  useEffect(() => {
    if (timeRemaining > 0 && !submitted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, submitted]);

  const handleSelect = (label) => {
    const questionId = testPack.questions[currentIdx].id;
    setAnswers(prev => {
      const existing = prev.filter(a => a.questionId !== questionId);
      return [...existing, { questionId, selectedLabel: label }];
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    try {
      const res = await fetch('/api/quizzes/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testPackId,
          answers,
          timeTakenSecs: timeTaken
        })
      });
      const data = await res.json();
      if (data.success) {
        setResults(data);
        setSubmitted(true);
        if (onComplete) onComplete(data);
      } else {
        toast.error(data.error || "Submission failed");
      }
    } catch (err) {
      toast.error("Network error during submission");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !submitted) {
    return (
      <div className="quiz-overlay">
        <div className="quiz-loading">INITIATING VALIDATION PROTOCOL...</div>
      </div>
    );
  }

  if (submitted && results) {
    return (
      <div className="quiz-overlay">
        <div className="results-card">
          <div className="results-header">
             <div className="trophy-circle">
               <Trophy size={48} color={results.passed ? "#10b981" : "#64748b"} />
             </div>
             <h2>{results.passed ? "MASTERY CONFIRMED" : "REVISION REQUIRED"}</h2>
             <p>{testPack.title}</p>
          </div>

          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-label">SCORE</span>
              <span className="stat-value">{results.score}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">STATUS</span>
              <span className={`stat-value ${results.passed ? 'passed' : 'failed'}`}>
                {results.passed ? 'PASSED' : 'RETRY'}
              </span>
            </div>
          </div>

          <div className="breakdown-list">
            {results.breakdown.map((item, i) => (
              <div key={i} className={`breakdown-item ${item.correct ? 'correct' : 'incorrect'}`}>
                <div className="item-q">Q{i+1}: {item.correct ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}</div>
                {!item.correct && (
                   <div className="explanation">
                      <p><strong>Correct:</strong> {item.correctLabel}</p>
                      <p>{item.explanation}</p>
                   </div>
                )}
              </div>
            ))}
          </div>

          <button className="close-btn" onClick={onClose}>RETURN TO HUB</button>
        </div>
        <style jsx>{`
          .quiz-overlay { position: fixed; inset: 0; background: rgba(2, 6, 23, 0.95); backdrop-filter: blur(10px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 2rem; }
          .results-card { background: #0a0a0f; border: 1px solid rgba(255,255,255,0.06); width: 100%; max-width: 500px; border-radius: 24px; padding: 3rem; text-align: center; }
          .trophy-circle { width: 100px; height: 100px; border-radius: 50%; background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
          .results-header h2 { font-size: 1.5rem; font-weight: 900; letter-spacing: 1px; margin-bottom: 0.5rem; }
          .results-header p { color: #64748b; font-size: 0.85rem; margin-bottom: 2rem; }
          .stats-row { display: flex; gap: 1rem; margin-bottom: 2rem; }
          .stat-item { flex: 1; background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); }
          .stat-label { display: block; font-size: 0.6rem; font-weight: 900; color: #475569; margin-bottom: 4px; }
          .stat-value { font-size: 1.25rem; font-weight: 900; }
          .stat-value.passed { color: #10b981; }
          .stat-value.failed { color: #ef4444; }
          .breakdown-list { max-height: 200px; overflow-y: auto; margin-bottom: 2rem; padding-right: 10px; }
          .breakdown-item { text-align: left; padding: 1rem; border-radius: 12px; margin-bottom: 0.5rem; border-left: 4px solid transparent; }
          .breakdown-item.correct { background: rgba(16, 185, 129, 0.05); border-left-color: #10b981; }
          .breakdown-item.incorrect { background: rgba(239, 68, 68, 0.05); border-left-color: #ef4444; }
          .item-q { font-size: 0.75rem; font-weight: 900; display: flex; align-items: center; gap: 6px; }
          .explanation { margin-top: 0.5rem; font-size: 0.75rem; color: #94a3b8; }
          .close-btn { width: 100%; padding: 1rem; border-radius: 12px; background: #10b981; color: #020617; border: none; font-weight: 900; cursor: pointer; transition: all 0.2s; }
          .close-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2); }
        `}</style>
      </div>
    );
  }

  const currentQ = testPack.questions[currentIdx];
  const selectedLabel = answers.find(a => a.questionId === currentQ.id)?.selectedLabel;

  return (
    <div className="quiz-overlay">
      <div className="quiz-modal">
        <header className="quiz-header">
           <div className="quiz-meta">
              <span className="quiz-type">{testPack.type}</span>
              <span className="quiz-progress">QUESTION {currentIdx + 1} OF {testPack.questions.length}</span>
           </div>
           <button className="quiz-close" onClick={onClose}><X size={20} /></button>
        </header>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${((currentIdx + 1) / testPack.questions.length) * 100}%` }} />
        </div>

        <main className="quiz-body">
          <div className="question-text">
            {currentQ.text}
          </div>

          <div className="options-grid">
            {currentQ.options.map((opt) => (
              <div 
                key={opt.label} 
                className={`option-card ${selectedLabel === opt.label ? 'selected' : ''}`}
                onClick={() => handleSelect(opt.label)}
              >
                <div className="option-label">{opt.label.toUpperCase()}</div>
                <div className="option-text">{opt.text}</div>
              </div>
            ))}
          </div>
        </main>

        <footer className="quiz-footer">
          <div className="timer-box">
            <Clock size={14} />
            {timeRemaining > 0 ? (
              <span>{Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}</span>
            ) : (
              <span>UNTIMED</span>
            )}
          </div>

          <div className="nav-btns">
            <button 
              className="nav-btn secondary" 
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(p => p - 1)}
            >
              <ChevronLeft size={18} />
            </button>

            {currentIdx === testPack.questions.length - 1 ? (
              <button 
                className="nav-btn primary finish" 
                disabled={answers.length < testPack.questions.length}
                onClick={handleSubmit}
              >
                SUBMIT VALIDATION
              </button>
            ) : (
              <button 
                className="nav-btn primary" 
                onClick={() => setCurrentIdx(p => p + 1)}
              >
                NEXT <ChevronRight size={18} />
              </button>
            )}
          </div>
        </footer>
      </div>

      <style jsx>{`
        .quiz-overlay { position: fixed; inset: 0; background: rgba(2, 6, 23, 0.9); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 2rem; }
        .quiz-modal { background: #0a0a0f; border: 1px solid rgba(255,255,255,0.06); width: 100%; max-width: 800px; border-radius: 24px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,0.5); }
        .quiz-header { padding: 1.5rem 2rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .quiz-meta { display: flex; gap: 1rem; align-items: center; }
        .quiz-type { font-size: 0.6rem; font-weight: 900; background: rgba(59, 130, 246, 0.1); color: #3b82f6; padding: 4px 8px; border-radius: 4px; letter-spacing: 1px; }
        .quiz-progress { font-size: 0.65rem; font-weight: 900; color: #475569; letter-spacing: 1px; }
        .quiz-close { background: transparent; border: none; color: #64748b; cursor: pointer; transition: color 0.2s; }
        .quiz-close:hover { color: white; }

        .progress-bar { height: 4px; background: rgba(255,255,255,0.02); }
        .progress-fill { height: 100%; background: #3b82f6; transition: width 0.4s ease; }

        .quiz-body { padding: 3rem; flex: 1; overflow-y: auto; }
        .question-text { font-size: 1.4rem; font-weight: 700; line-height: 1.5; color: white; margin-bottom: 2.5rem; }
        .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .option-card { padding: 1.5rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; cursor: pointer; display: flex; gap: 1.5rem; align-items: center; transition: all 0.2s ease; }
        .option-card:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.1); }
        .option-card.selected { background: rgba(59, 130, 246, 0.05); border-color: #3b82f6; }
        .option-label { width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 900; color: #64748b; }
        .option-card.selected .option-label { background: #3b82f6; color: white; }
        .option-text { font-size: 1rem; color: #cbd5e1; font-weight: 500; }

        .quiz-footer { padding: 1.5rem 2rem; background: rgba(255,255,255,0.01); border-top: 1px solid rgba(255,255,255,0.04); display: flex; justify-content: space-between; align-items: center; }
        .timer-box { display: flex; align-items: center; gap: 8px; font-size: 0.75rem; font-weight: 900; color: #64748b; font-family: monospace; }
        .nav-btns { display: flex; gap: 1rem; }
        .nav-btn { padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .nav-btn.primary { background: #3b82f6; color: white; border: none; }
        .nav-btn.secondary { background: rgba(255,255,255,0.03); color: #64748b; border: 1px solid rgba(255,255,255,0.06); }
        .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .nav-btn.finish { background: #10b981; }

        .quiz-loading { color: #64748b; font-size: 0.75rem; font-weight: 900; letter-spacing: 2px; }

        @media (max-width: 768px) {
          .quiz-overlay { padding: 0; }
          .quiz-modal { height: 100vh; border-radius: 0; border: none; }
          .quiz-body { padding: 1.5rem; }
          .question-text { font-size: 1.1rem; margin-bottom: 1.5rem; }
          .options-grid { grid-template-columns: 1fr; gap: 0.75rem; }
          .option-card { padding: 1rem; gap: 1rem; }
          .quiz-header { padding: 1rem; }
          .quiz-footer { padding: 1rem; flex-direction: column; gap: 1rem; }
          .nav-btns { width: 100%; justify-content: space-between; }
          .nav-btn { flex: 1; justify-content: center; }
          
          .results-card { height: 100vh; border-radius: 0; border: none; overflow-y: auto; padding: 2rem 1rem; }
        }
      `}</style>
    </div>
  );
}
