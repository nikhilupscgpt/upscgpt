'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  PenTool,
  Highlighter,
  Zap,
  Eraser,
  Undo2,
  Trash2,
  Maximize2,
  Minimize2,
  Camera,
  Timer,
  Layers,
  ArrowLeft,
  HelpCircle,
  Eye,
  CheckCircle2,
  XCircle,
  Sparkles,
  Tag,
  BookOpen,
  Newspaper,
  Flame,
} from 'lucide-react';
import { buildQuestionSteps } from '@/lib/pyqSlideDeck';
import { parseStem } from '@/app/prelims/pyq/StemView';
import PyqAnnotationCanvas from './PyqAnnotationCanvas';
import './present.css';

const PALETTE = [
  '#ffffff', // Clean Chalk White
  '#f59e0b', // Amber / Gold
  '#38bdf8', // Sky Blue
  '#34d399', // Emerald Green
  '#fb7185', // Rose
];

export default function PyqPresenterClient({ questions = [] }) {
  const [qIndex, setQIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWebcamBox, setShowWebcamBox] = useState(true);
  const [isBlackboard, setIsBlackboard] = useState(false);

  // Annotation state
  const [activeTool, setActiveTool] = useState('pen'); // 'pen' | 'highlighter' | 'laser' | 'eraser' | 'none'
  const [activeColor, setActiveColor] = useState('#ffffff');
  const [showHelp, setShowHelp] = useState(false);

  // Think timer (30s)
  const [timerSeconds, setTimerSeconds] = useState(null);

  // Ink stroke maps:
  // 1. Question Panel persistent ink: { [qId]: strokes[] }
  // 2. Step Explanation Panel ink: { [`${qId}_${stepIndex}`]: strokes[] }
  const [questionInkMap, setQuestionInkMap] = useState({});
  const [stepInkMap, setStepInkMap] = useState({});

  const stageRef = useRef(null);

  const currentQ = questions[qIndex] || null;

  // Build presentation steps for the current question
  const steps = useMemo(() => {
    if (!currentQ) return [];
    return buildQuestionSteps(currentQ);
  }, [currentQ]);

  const currentStep = steps[stepIndex] || steps[0] || null;

  // Active strokes for the canvas
  const currentQId = currentQ?.id || 'q_0';
  const currentStepKey = `${currentQId}_${stepIndex}`;

  const currentQStrokes = useMemo(() => {
    return questionInkMap[currentQId] || [];
  }, [questionInkMap, currentQId]);

  const currentStepStrokes = useMemo(() => {
    return stepInkMap[currentStepKey] || [];
  }, [stepInkMap, currentStepKey]);

  // -------------------------------------------------------------
  // Window Auto-Scaler for Fixed 1920x1080 Coordinate System
  // -------------------------------------------------------------
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const s = Math.min(w / 1920, h / 1080);
      setScale(s);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // -------------------------------------------------------------
  // Fullscreen state listener
  // -------------------------------------------------------------
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // -------------------------------------------------------------
  // 30-Second Think Timer
  // -------------------------------------------------------------
  useEffect(() => {
    if (timerSeconds === null || timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds(s => (s > 1 ? s - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerSeconds]);

  // -------------------------------------------------------------
  // Navigation: Steps & Questions
  // -------------------------------------------------------------
  const handleNext = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(s => s + 1);
    } else if (qIndex < questions.length - 1) {
      setQIndex(q => q + 1);
      setStepIndex(0);
      setTimerSeconds(null);
    }
  }, [stepIndex, steps.length, qIndex, questions.length]);

  const handlePrev = useCallback(() => {
    if (stepIndex > 0) {
      setStepIndex(s => s - 1);
    } else if (qIndex > 0) {
      const prevQ = questions[qIndex - 1];
      const prevSteps = buildQuestionSteps(prevQ);
      setQIndex(q => q - 1);
      setStepIndex(Math.max(0, prevSteps.length - 1));
      setTimerSeconds(null);
    }
  }, [stepIndex, qIndex, questions]);

  // -------------------------------------------------------------
  // Ink update handlers
  // -------------------------------------------------------------
  const handleUpdateQStrokes = useCallback((strokes) => {
    setQuestionInkMap(prev => ({ ...prev, [currentQId]: strokes }));
  }, [currentQId]);

  const handleUpdateStepStrokes = useCallback((strokes) => {
    setStepInkMap(prev => ({ ...prev, [currentStepKey]: strokes }));
  }, [currentStepKey]);

  const handleUndo = useCallback(() => {
    // Check step strokes first, then question strokes
    if (currentStepStrokes.length > 0) {
      handleUpdateStepStrokes(currentStepStrokes.slice(0, -1));
    } else if (currentQStrokes.length > 0) {
      handleUpdateQStrokes(currentQStrokes.slice(0, -1));
    }
  }, [currentStepStrokes, currentQStrokes, handleUpdateStepStrokes, handleUpdateQStrokes]);

  const handleClearStepInk = useCallback(() => {
    handleUpdateStepStrokes([]);
  }, [handleUpdateStepStrokes]);

  const handleClearAllInk = useCallback(() => {
    handleUpdateQStrokes([]);
    handleUpdateStepStrokes([]);
  }, [handleUpdateQStrokes, handleUpdateStepStrokes]);

  // -------------------------------------------------------------
  // Keyboard Shortcuts (Space, Arrows, Pen, Highlighter, etc.)
  // -------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;

      // Undo: Cmd+Z or Ctrl+Z
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrev();
          break;
        case 'p':
        case 'P':
          setActiveTool(t => (t === 'pen' ? 'none' : 'pen'));
          break;
        case 'h':
        case 'H':
          setActiveTool(t => (t === 'highlighter' ? 'none' : 'highlighter'));
          break;
        case 'l':
        case 'L':
          setActiveTool(t => (t === 'laser' ? 'none' : 'laser'));
          break;
        case 'e':
        case 'E':
          setActiveTool(t => (t === 'eraser' ? 'none' : 'eraser'));
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'b':
        case 'B':
          setIsBlackboard(b => !b);
          break;
        case 'w':
        case 'W':
          setShowWebcamBox(w => !w);
          break;
        case 't':
        case 'T':
          setTimerSeconds(s => (s ? null : 30));
          break;
        case 'c':
        case 'C':
          handleClearStepInk();
          break;
        case '?':
          setShowHelp(h => !h);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, handleUndo, handleClearStepInk]);

  if (!currentQ) {
    return (
      <div className="pq-present-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <h2 style={{ fontSize: 28, margin: '0 0 12px' }}>No Questions Selected</h2>
          <p style={{ color: '#94a3b8', margin: '0 0 24px' }}>Please select questions in the PYQ Admin table to present.</p>
          <Link href="/admin/pyq" style={{ padding: '10px 20px', borderRadius: 8, background: '#3b82f6', color: '#fff', textDecoration: 'none', fontWeight: 800 }}>
            ← Return to PYQ Admin
          </Link>
        </div>
      </div>
    );
  }

  // Parse question stem statements
  const stemBlocks = parseStem(currentQ.stem);
  const options = Array.isArray(currentQ.options) ? currentQ.options : [];

  return (
    <div className="pq-present-root">
      {/* 16:9 Scaled Viewport Container */}
      <div className="pq-present-stage-viewport">
        <div
          ref={stageRef}
          className="pq-present-stage"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Brand Watermark (Top Right) */}
          <div className="pq-present-brand-watermark">
            <span className="pq-present-brand-dot" />
            <span>UPSCGPT STUDIO</span>
          </div>

          {/* 30s Countdown Timer Overlay */}
          {timerSeconds !== null && (
            <div className="pq-present-timer-overlay">
              <Timer size={22} />
              <span>THINK TIME: 00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* LEFT PANEL: PINNED QUESTION STAGE (44%)                   */}
          {/* ========================================================= */}
          <aside className="pq-present-left-panel">
            <div>
              {/* Exam & Subject Meta Tags */}
              <div className="pq-present-q-meta">
                <span className="pq-present-tag pq-present-tag-exam">
                  {currentQ.examName || 'UPSC CSE Pre'} {currentQ.examYear || ''}
                </span>
                {currentQ.questionNo && (
                  <span className="pq-present-tag pq-present-tag-qno">
                    Q{currentQ.questionNo}
                  </span>
                )}
                {currentQ.srcTopic && (
                  <span className="pq-present-tag pq-present-tag-topic">
                    {currentQ.srcTopic}
                  </span>
                )}
              </div>

              {/* Scrollable Stem & Options */}
              <div className="pq-present-q-scrollable">
                {stemBlocks.map((b, idx) => {
                  if (b.type === 'stmts') {
                    return (
                      <div className="pq-present-statements" key={idx}>
                        {b.items.map((s, k) => {
                          const verdict = currentStep?.verdicts?.[String(s.key).toUpperCase()];
                          const isCorrect = verdict && verdict.toLowerCase().includes('correct') && !verdict.toLowerCase().includes('incorrect');
                          const isIncorrect = verdict && verdict.toLowerCase().includes('incorrect');

                          return (
                            <div className="pq-present-statement-item" key={k}>
                              <span className="pq-present-statement-key">{s.key}</span>
                              <div style={{ flex: 1 }}>{s.text}</div>

                              {verdict && (
                                <span className={`pq-present-statement-verdict ${isCorrect ? 'is-correct' : isIncorrect ? 'is-incorrect' : ''}`}>
                                  {isCorrect ? <CheckCircle2 size={13} /> : isIncorrect ? <XCircle size={13} /> : null}
                                  <span>{verdict}</span>
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  return (
                    <p key={idx} className={idx === 0 ? 'pq-present-stem-lead' : 'pq-present-stem-ask'}>
                      {b.text}
                    </p>
                  );
                })}

                {/* Options List */}
                <div className="pq-present-options-grid">
                  {options.map((opt) => {
                    const optLabel = String(opt.label).toUpperCase();
                    const isTarget = currentStep?.showAnswer && currentStep?.highlightedOption === optLabel;

                    return (
                      <div
                        key={opt.label}
                        className={`pq-present-option-row ${isTarget ? 'is-highlighted' : ''}`}
                      >
                        <span className="pq-present-opt-label">{optLabel}</span>
                        <span className="pq-present-opt-text">{opt.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Left Bottom Question Tracker */}
            <div className="pq-present-left-footer">
              <span>QUESTION {qIndex + 1} OF {questions.length}</span>
              <span style={{ color: '#38bdf8' }}>{currentQ.srcSubject || 'General Studies'}</span>
            </div>
          </aside>

          {/* ========================================================= */}
          {/* RIGHT PANEL: DYNAMIC EXPLANATION SLIDES (56%)             */}
          {/* ========================================================= */}
          <main className="pq-present-right-panel">
            {/* Step Header */}
            <div className="pq-present-step-head">
              <span className="pq-present-step-badge">
                <Sparkles size={13} />
                <span>{currentStep?.badge || 'EXPLANATION STAGE'}</span>
              </span>
              <h1 className="pq-present-step-title">{currentStep?.title}</h1>
              {currentStep?.subtitle && (
                <p className="pq-present-step-sub">{currentStep.subtitle}</p>
              )}
            </div>

            {/* Dynamic Step Content Body */}
            <div className="pq-present-slide-body">
              {/* STAGE 1: INTRO */}
              {currentStep?.type === 'intro' && (
                <div className="pq-present-intro-grid">
                  <div className="pq-present-stat-box">
                    <div className="pq-present-stat-label">Subject &amp; Theme</div>
                    <div className="pq-present-stat-value">{currentQ.srcSubject || 'GS Paper 1'}</div>
                  </div>
                  <div className="pq-present-stat-box">
                    <div className="pq-present-stat-label">Micro-Topic</div>
                    <div className="pq-present-stat-value">{currentQ.srcTopic || 'General'}</div>
                  </div>
                  <div className="pq-present-stat-box">
                    <div className="pq-present-stat-label">Exam Paper</div>
                    <div className="pq-present-stat-value">{currentQ.examName} {currentQ.examYear}</div>
                  </div>
                  <div className="pq-present-stat-box">
                    <div className="pq-present-stat-label">Question Pattern</div>
                    <div className="pq-present-stat-value">{currentQ.stem?.length > 250 ? 'Statement-Based' : 'Standard MCQ'}</div>
                  </div>
                </div>
              )}

              {/* STAGE 2: BREAKDOWN */}
              {currentStep?.type === 'breakdown' && currentStep.items && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {currentStep.items.map((item, i) => {
                    const isCorrect = (item.verdict || '').toLowerCase().includes('correct') && !(item.verdict || '').toLowerCase().includes('incorrect');
                    return (
                      <div
                        key={i}
                        className={`pq-present-breakdown-card ${isCorrect ? 'is-correct-card' : 'is-incorrect-card'}`}
                      >
                        <div className="pq-present-bc-head">
                          <span className="pq-present-bc-label">Option ({String(item.label || i + 1).toUpperCase()})</span>
                          <span className={`pq-present-bc-badge ${isCorrect ? 'is-correct' : 'is-incorrect'}`}>
                            {isCorrect ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                            {item.verdict || (isCorrect ? 'Correct' : 'Incorrect')}
                          </span>
                        </div>
                        {item.text && <p className="pq-present-bc-text">{item.text}</p>}
                        <p className="pq-present-bc-exp">{item.explanation}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* STAGE 3: ANSWER */}
              {currentStep?.type === 'answer' && (
                <div className="pq-present-card" style={{ borderColor: 'rgba(34, 197, 94, 0.45)', background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(15, 23, 42, 0.85))' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#22c55e', color: '#052e16', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900 }}>
                      ✓
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', color: '#4ade80' }}>Official Answer Key</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: '#ffffff' }}>Option ({currentStep.correctLabel || 'Verified'})</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 18.5, lineHeight: 1.6, color: '#f1f5f9' }}>
                    {currentStep.explanationText}
                  </div>
                </div>
              )}

              {/* STAGE 4: KEYWORDS */}
              {currentStep?.type === 'keywords' && currentStep.keywords && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {currentStep.keywords.map((kw, i) => (
                    <div key={i} className="pq-present-concept-card">
                      <div className="pq-present-concept-title">
                        <Tag size={18} />
                        <span>#{kw.term}</span>
                      </div>
                      <p className="pq-present-concept-note">
                        {kw.shortNote || 'High-yield conceptual keyword frequently tested in UPSC Prelims.'}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* STAGE 5: VALUE ADDITION */}
              {currentStep?.type === 'valueAddition' && currentStep.points && (
                <ul className="pq-present-va-list">
                  {currentStep.points.map((pt, i) => (
                    <li key={i} className="pq-present-va-item">
                      <span className="pq-present-va-bullet">•</span>
                      <div>{pt}</div>
                    </li>
                  ))}
                </ul>
              )}

              {/* STAGE 6: IN NEWS */}
              {currentStep?.type === 'inNews' && currentStep.inNews && (
                <div className="pq-present-news-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: '#f87171', textTransform: 'uppercase' }}>
                    <Flame size={14} />
                    <span>{currentStep.inNews.source || 'Current Context'} {currentStep.inNews.date ? `· ${currentStep.inNews.date}` : ''}</span>
                  </div>
                  <h3 className="pq-present-news-headline">{currentStep.inNews.headline || 'Contemporary Context'}</h3>
                  {(currentStep.inNews.relevance || currentStep.inNews.context) && (
                    <p className="pq-present-news-context">{currentStep.inNews.relevance || currentStep.inNews.context}</p>
                  )}
                </div>
              )}

              {/* STAGE 7: SIMILAR PYQ */}
              {currentStep?.type === 'similarPyq' && currentStep.similarPyq && (
                <div className="pq-present-card" style={{ borderColor: 'rgba(168, 85, 247, 0.4)', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(15, 23, 42, 0.85))' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: '#c084fc', textTransform: 'uppercase', marginBottom: 10 }}>
                    <Layers size={14} />
                    <span>{currentStep.similarPyq.examName || 'UPSC CSE Pre'} {currentStep.similarPyq.examYear || ''}</span>
                  </div>
                  <p style={{ fontSize: 18, lineHeight: 1.55, color: '#f8fafc', margin: '0 0 12px' }}>
                    {currentStep.similarPyq.stem}
                  </p>
                  {currentStep.similarPyq.keyTakeaway && (
                    <div style={{ fontSize: 15, color: '#fbbf24', fontStyle: 'italic' }}>
                      💡 Pattern Insight: {currentStep.similarPyq.keyTakeaway}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* OBS Webcam Safe Zone Visual Boundary Guide (Bottom Right) */}
            {showWebcamBox && (
              <div className="pq-present-webcam-safe-zone">
                <div className="pq-webcam-label">
                  <Camera size={18} />
                  <span>OBS WEBCAM SAFE ZONE</span>
                  <small>320 × 180 (Press W to hide)</small>
                </div>
              </div>
            )}
          </main>

          {/* Blackboard Freehand Mode Overlay */}
          {isBlackboard && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: '#040711',
                zIndex: 45,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.25)', fontWeight: 800, letterSpacing: '0.1em' }}>
                BLACKBOARD MODE · DRAW FREELY · PRESS B TO EXIT
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* ANNOTATION CANVAS (TOPMOST INTERACTION LAYER)             */}
          {/* ========================================================= */}
          <PyqAnnotationCanvas
            scale={scale}
            activeTool={activeTool}
            activeColor={activeColor}
            leftBoundaryX={830}
            questionStrokes={currentQStrokes}
            stepStrokes={currentStepStrokes}
            onUpdateQuestionStrokes={handleUpdateQStrokes}
            onUpdateStepStrokes={handleUpdateStepStrokes}
          />
        </div>
      </div>

      {/* ============================================================= */}
      {/* FLOATING TEACHER DOCK / CONTROL BAR                           */}
      {/* ============================================================= */}
      <footer className="pq-present-dock">
        {/* Return to Admin */}
        <Link
          href="/admin/pyq"
          className="pq-dock-btn"
          title="Exit to PYQ Admin"
        >
          <ArrowLeft size={16} />
        </Link>

        <div className="pq-dock-sep" />

        {/* Prev / Next Buttons */}
        <button
          type="button"
          onClick={handlePrev}
          className="pq-dock-btn"
          title="Previous Step [Left Arrow]"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Step Indicator Dots */}
        <div className="pq-dock-steps">
          {steps.map((st, idx) => (
            <button
              key={st.id || idx}
              type="button"
              onClick={() => setStepIndex(idx)}
              className={`pq-step-dot ${idx === stepIndex ? 'is-active' : idx < stepIndex ? 'is-past' : ''}`}
              title={`Jump to ${st.title}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="pq-dock-btn"
          title="Next Step [Space / Right Arrow]"
        >
          <ChevronRight size={18} />
        </button>

        <div className="pq-dock-sep" />

        {/* Drawing Tools */}
        <button
          type="button"
          onClick={() => setActiveTool(t => (t === 'pen' ? 'none' : 'pen'))}
          className={`pq-dock-btn ${activeTool === 'pen' ? 'is-active' : ''}`}
          title="Pen Tool [P] (XP-Pen pressure sensitive)"
        >
          <PenTool size={16} />
        </button>

        <button
          type="button"
          onClick={() => setActiveTool(t => (t === 'highlighter' ? 'none' : 'highlighter'))}
          className={`pq-dock-btn ${activeTool === 'highlighter' ? 'is-active' : ''}`}
          title="Highlighter [H]"
        >
          <Highlighter size={16} />
        </button>

        <button
          type="button"
          onClick={() => setActiveTool(t => (t === 'laser' ? 'none' : 'laser'))}
          className={`pq-dock-btn ${activeTool === 'laser' ? 'is-active' : ''}`}
          title="Laser Pointer [L]"
        >
          <Zap size={16} />
        </button>

        <button
          type="button"
          onClick={() => setActiveTool(t => (t === 'eraser' ? 'none' : 'eraser'))}
          className={`pq-dock-btn ${activeTool === 'eraser' ? 'is-active' : ''}`}
          title="Eraser [E]"
        >
          <Eraser size={16} />
        </button>

        {/* Color Palette */}
        <div className="pq-dock-colors">
          {PALETTE.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setActiveColor(c);
                if (activeTool === 'none' || activeTool === 'eraser') setActiveTool('pen');
              }}
              className={`pq-color-dot ${activeColor === c ? 'is-selected' : ''}`}
              style={{ background: c, color: c }}
              title={`Color: ${c}`}
            />
          ))}
        </div>

        <div className="pq-dock-sep" />

        {/* Undo & Clear */}
        <button
          type="button"
          onClick={handleUndo}
          className="pq-dock-btn"
          title="Undo Stroke [Cmd+Z]"
        >
          <Undo2 size={16} />
        </button>

        <button
          type="button"
          onClick={handleClearStepInk}
          className="pq-dock-btn"
          title="Clear Step Ink [C]"
        >
          <Trash2 size={16} />
        </button>

        <div className="pq-dock-sep" />

        {/* Utility Toggles */}
        <button
          type="button"
          onClick={() => setShowWebcamBox(w => !w)}
          className={`pq-dock-btn ${showWebcamBox ? 'is-active' : ''}`}
          title="Toggle OBS Webcam Box Guide [W]"
        >
          <Camera size={16} />
        </button>

        <button
          type="button"
          onClick={() => setTimerSeconds(s => (s ? null : 30))}
          className={`pq-dock-btn ${timerSeconds !== null ? 'is-active' : ''}`}
          title="30s Think Countdown Timer [T]"
        >
          <Timer size={16} />
        </button>

        <button
          type="button"
          onClick={() => setIsBlackboard(b => !b)}
          className={`pq-dock-btn ${isBlackboard ? 'is-active' : ''}`}
          title="Blackboard Mode [B]"
        >
          <Layers size={16} />
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="pq-dock-btn"
          title="Toggle Fullscreen [F]"
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>

        <button
          type="button"
          onClick={() => setShowHelp(h => !h)}
          className={`pq-dock-btn ${showHelp ? 'is-active' : ''}`}
          title="Keyboard Shortcuts [?]"
        >
          <HelpCircle size={16} />
        </button>
      </footer>

      {/* Keyboard Shortcuts Modal */}
      {showHelp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100001,
          }}
          onClick={() => setShowHelp(false)}
        >
          <div
            style={{
              width: 440,
              padding: '24px 28px',
              borderRadius: 16,
              background: '#0f172a',
              border: '1.5px solid rgba(255, 255, 255, 0.15)',
              color: '#f8fafc',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 20, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <HelpCircle size={20} color="#38bdf8" />
              <span>Studio Keyboard Shortcuts</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px 16px', fontSize: 13.5, lineHeight: 1.6 }}>
              <strong>Space / →</strong> <span>Next Step / Next Question</span>
              <strong>←</strong> <span>Previous Step / Previous Question</span>
              <strong>P</strong> <span>Pen Tool (XP-Pen pressure sensitive)</span>
              <strong>H</strong> <span>Highlighter Tool</span>
              <strong>L</strong> <span>Laser Pointer (fading dot)</span>
              <strong>E</strong> <span>Eraser Tool</span>
              <strong>Cmd + Z</strong> <span>Undo Last Stroke</span>
              <strong>C</strong> <span>Clear Current Step Ink</span>
              <strong>F</strong> <span>Fullscreen (for OBS recording)</span>
              <strong>W</strong> <span>Toggle OBS Webcam Safe Zone</span>
              <strong>T</strong> <span>30s Think Timer</span>
              <strong>B</strong> <span>Blackboard Mode</span>
              <strong>?</strong> <span>Toggle this help menu</span>
            </div>

            <button
              type="button"
              onClick={() => setShowHelp(false)}
              style={{
                marginTop: 20,
                width: '100%',
                padding: '10px',
                borderRadius: 8,
                background: '#3b82f6',
                border: 'none',
                color: '#fff',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
