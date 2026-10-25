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
  HelpCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Tag,
  Flame,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  ListOrdered,
  X,
  BookOpen,
  Laptop,
  Tv,
  Scaling,
  MapPin,
  Globe,
  Compass,
  Move,
  FilePlus2,
  Columns,
  Grid,
  AlignJustify,
} from 'lucide-react';
import { buildQuestionSteps, buildTopicSteps, buildMappingSteps } from '@/lib/pyqSlideDeck';
import { parseStem } from '@/app/prelims/pyq/StemView';
import PyqAnnotationCanvas from './PyqAnnotationCanvas';
import StudioPresenterMap from './StudioPresenterMap';
import './present.css';

const DARK_PALETTE = [
  '#ffffff', // Clean Chalk White
  '#f59e0b', // Amber / Gold
  '#38bdf8', // Sky Blue
  '#34d399', // Emerald Green
  '#fb7185', // Rose
];

const LIGHT_PALETTE = [
  '#0f172a', // Jet Slate / Charcoal
  '#2563eb', // Royal Blue
  '#dc2626', // Crimson Red
  '#059669', // Emerald Green
  '#d97706', // Rich Ochre
];

export default function PyqPresenterClient({ questions = [] }) {
  const [qIndex, setQIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWebcamBox, setShowWebcamBox] = useState(true);
  const [isBlackboard, setIsBlackboard] = useState(false);
  const [isZoomedImage, setIsZoomedImage] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pq_present_theme');
        if (saved === 'light' || saved === 'dark') return saved;
      } catch {
        // ignore
      }
    }
    return 'dark';
  });
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);

  // Annotation state
  const [activeTool, setActiveTool] = useState('pen'); // 'pen' | 'highlighter' | 'laser' | 'eraser' | 'none'
  const [activeColor, setActiveColor] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pq_present_theme');
        if (saved === 'light') return '#0f172a';
      } catch {
        // ignore
      }
    }
    return '#ffffff';
  });
  const [showHelp, setShowHelp] = useState(false);

  // Pen thickness (3px fine, 5px regular, 8px bold, 12px heavy)
  const [penSize, setPenSize] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pq_present_pen_size');
        if (saved) return Number(saved) || 5;
      } catch {
        // ignore
      }
    }
    return 5;
  });

  const updatePenSize = useCallback((size) => {
    setPenSize(size);
    try {
      localStorage.setItem('pq_present_pen_size', String(size));
    } catch {
      // ignore
    }
  }, []);

  // Think timer (30s)
  const [timerSeconds, setTimerSeconds] = useState(null);

  // Ink stroke maps:
  // 1. Question / Topic Panel persistent anchor ink: { [qId]: strokes[] }
  // 2. Step Explanation Panel ink: { [`${qId}_${stepIndex}`]: strokes[] }
  const [questionInkMap, setQuestionInkMap] = useState({});
  const [stepInkMap, setStepInkMap] = useState({});

  const stageRef = useRef(null);

  const currentQ = questions[qIndex] || null;

  const [customAttachmentsMap] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('pq_studio_attachments');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {};
  });

  // On-demand blank scratchpad slides added dynamically during presentation
  const [scratchpadsMap, setScratchpadsMap] = useState({});

  // Build presentation steps dynamically (PYQ vs Topic vs Mapping) + dynamic blank scratchpads
  const steps = useMemo(() => {
    if (!currentQ) return [];
    const customAsset = customAttachmentsMap[currentQ.id] || currentQ.customAssets || {};
    let baseSteps = [];
    if (currentQ.type === 'topic') {
      baseSteps = buildTopicSteps(currentQ, customAsset);
    } else if (currentQ.type === 'mapping') {
      baseSteps = buildMappingSteps(currentQ, customAsset);
    } else {
      baseSteps = buildQuestionSteps(currentQ, customAsset);
    }

    const currentScratchpads = scratchpadsMap[currentQ.id] || [];
    if (currentScratchpads.length === 0) return baseSteps;

    const merged = [...baseSteps];
    const sorted = [...currentScratchpads].sort((a, b) => a.insertIndex - b.insertIndex);
    for (const sp of sorted) {
      const idx = Math.min(Math.max(0, sp.insertIndex), merged.length);
      merged.splice(idx, 0, sp);
    }
    return merged;
  }, [currentQ, customAttachmentsMap, scratchpadsMap]);

  const currentStep = steps[stepIndex] || steps[0] || null;

  // Active strokes for the canvas (isolated per step ID so dynamic scratchpads persist ink independently)
  const currentQId = currentQ?.id || `item_${qIndex}`;
  const currentStepKey = `${currentQId}_${currentStep?.id || stepIndex}`;

  const currentQStrokes = useMemo(() => {
    return questionInkMap[currentQId] || [];
  }, [questionInkMap, currentQId]);

  const currentStepStrokes = useMemo(() => {
    return stepInkMap[currentStepKey] || [];
  }, [stepInkMap, currentStepKey]);

  // Presentation Canvas Mode: 'screen' (Fluid Responsive Native - fits Mac & all screens) vs '16:9' (1920x1080 Broadcast Standard)
  const [presentationMode, setPresentationMode] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pq_present_mode');
        if (saved === 'screen' || saved === '16:9') return saved;
      } catch {
        // ignore
      }
    }
    return 'screen'; // Default to Fluid Screen Responsive
  });

  const [screenStageSize, setScreenStageSize] = useState({ width: 1280, height: 720 });
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const isMappingMode = currentQ?.type === 'mapping';
  const isFullStageScratchpad = currentStep?.type === 'scratchpad' && currentStep?.isFullStage;
  const canvasWidth = presentationMode === 'screen' ? screenStageSize.width : 1920;
  const canvasHeight = presentationMode === 'screen' ? screenStageSize.height : 1080;
  const leftBoundaryX = presentationMode === 'screen'
    ? Math.round(screenStageSize.width * (isMappingMode ? 0.48 : 0.44))
    : (isMappingMode ? 920 : 830);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('pq_present_theme', next);
      } catch {
        // ignore
      }
      setActiveColor(next === 'light' ? '#0f172a' : '#ffffff');
      return next;
    });
  }, []);

  const handleToggleMode = useCallback(() => {
    setPresentationMode(prev => {
      const next = prev === 'screen' ? '16:9' : 'screen';
      try {
        localStorage.setItem('pq_present_mode', next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // -------------------------------------------------------------
  // Window Auto-Scaler & Resize Observer
  // In 'screen' mode: Stage is 100% fluid responsive (scale = 1)
  // In '16:9' mode: Stage is fixed 1920x1080 scaled within window
  // -------------------------------------------------------------
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isSmall = h <= 850 || w <= 1440;
      setIsSmallScreen(isSmall);

      // Dedicated clearance reserved for the floating dock:
      const dockClearance = isDockCollapsed ? 36 : (isSmall ? 64 : 80);
      const padTop = isFullscreen ? 8 : 16;
      const padX = isFullscreen ? 8 : 20;

      const availW = Math.max(320, w - padX * 2);
      const availH = Math.max(240, h - padTop - dockClearance);

      setScreenStageSize({ width: availW, height: availH });

      if (presentationMode === '16:9') {
        const fitScale = Math.min(availW / 1920, availH / 1080);
        setScale(Number(fitScale.toFixed(3)));
      } else {
        setScale(1);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFullscreen, isDockCollapsed, presentationMode]);

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
  // Navigation: Steps & Items
  // -------------------------------------------------------------
  const handleNext = useCallback(() => {
    setIsZoomedImage(false);
    if (stepIndex < steps.length - 1) {
      setStepIndex(s => s + 1);
    } else if (qIndex < questions.length - 1) {
      setQIndex(q => q + 1);
      setStepIndex(0);
      setTimerSeconds(null);
    }
  }, [stepIndex, steps.length, qIndex, questions.length]);

  const handlePrev = useCallback(() => {
    setIsZoomedImage(false);
    if (stepIndex > 0) {
      setStepIndex(s => s - 1);
    } else if (qIndex > 0) {
      setQIndex(q => q - 1);
      const prevQ = questions[qIndex - 1];
      const prevSteps = prevQ?.type === 'topic'
        ? buildTopicSteps(prevQ)
        : (prevQ?.type === 'mapping' ? buildMappingSteps(prevQ) : buildQuestionSteps(prevQ));
      setStepIndex(Math.max(0, prevSteps.length - 1));
      setTimerSeconds(null);
    }
  }, [stepIndex, qIndex, questions]);

  const jumpToItem = useCallback((targetIndex) => {
    if (targetIndex >= 0 && targetIndex < questions.length) {
      setQIndex(targetIndex);
      setStepIndex(0);
      setIsZoomedImage(false);
      setIsQueueOpen(false);
    }
  }, [questions.length]);

  // -------------------------------------------------------------
  // Ink management callbacks
  // -------------------------------------------------------------
  const handleUpdateQStrokes = useCallback((strokes) => {
    setQuestionInkMap(prev => ({
      ...prev,
      [currentQId]: strokes,
    }));
  }, [currentQId]);

  const handleUpdateStepStrokes = useCallback((strokes) => {
    setStepInkMap(prev => ({
      ...prev,
      [currentStepKey]: strokes,
    }));
  }, [currentStepKey]);

  const handleUndo = useCallback(() => {
    const stepStrokes = stepInkMap[currentStepKey] || [];
    if (stepStrokes.length > 0) {
      handleUpdateStepStrokes(stepStrokes.slice(0, -1));
      return;
    }
    const qStrokes = questionInkMap[currentQId] || [];
    if (qStrokes.length > 0) {
      handleUpdateQStrokes(qStrokes.slice(0, -1));
    }
  }, [stepInkMap, currentStepKey, questionInkMap, currentQId, handleUpdateStepStrokes, handleUpdateQStrokes]);

  const handleClearStepInk = useCallback(() => {
    handleUpdateStepStrokes([]);
  }, [handleUpdateStepStrokes]);

  // -------------------------------------------------------------
  // Dynamic Blank Slide / Scratchpad Callbacks
  // -------------------------------------------------------------
  const handleAddScratchpad = useCallback((isFull = false) => {
    if (!currentQ) return;
    const newId = `scratchpad_${Date.now()}`;
    const newScratchpad = {
      id: newId,
      type: 'scratchpad',
      badge: 'BLANK SCRATCHPAD',
      title: 'Blank Canvas & Mindmap',
      pattern: 'plain',
      isFullStage: isFull,
      insertIndex: stepIndex + 1,
    };

    setScratchpadsMap(prev => {
      const list = prev[currentQ.id] || [];
      return {
        ...prev,
        [currentQ.id]: [...list, newScratchpad],
      };
    });

    setActiveTool('pen');
    setStepIndex(s => s + 1);
  }, [currentQ, stepIndex]);

  const handleDeleteCurrentScratchpad = useCallback(() => {
    if (!currentQ || currentStep?.type !== 'scratchpad') return;
    const scratchpadId = currentStep.id;

    setScratchpadsMap(prev => {
      const list = prev[currentQ.id] || [];
      return {
        ...prev,
        [currentQ.id]: list.filter(sp => sp.id !== scratchpadId),
      };
    });

    setStepInkMap(prev => {
      const next = { ...prev };
      delete next[currentStepKey];
      return next;
    });

    setStepIndex(prev => Math.max(0, prev - 1));
  }, [currentQ, currentStep, currentStepKey]);

  const handleUpdateScratchpadPattern = useCallback((pattern) => {
    if (!currentQ || currentStep?.type !== 'scratchpad') return;
    setScratchpadsMap(prev => {
      const list = prev[currentQ.id] || [];
      return {
        ...prev,
        [currentQ.id]: list.map(sp => sp.id === currentStep.id ? { ...sp, pattern } : sp),
      };
    });
  }, [currentQ, currentStep]);

  const handleToggleScratchpadFullStage = useCallback(() => {
    if (!currentQ || currentStep?.type !== 'scratchpad') return;
    setScratchpadsMap(prev => {
      const list = prev[currentQ.id] || [];
      return {
        ...prev,
        [currentQ.id]: list.map(sp => sp.id === currentStep.id ? { ...sp, isFullStage: !sp.isFullStage } : sp),
      };
    });
  }, [currentQ, currentStep]);

  // -------------------------------------------------------------
  // Keyboard Shortcuts (Space, Arrows, Pen, Laser, Zoom, Queue, etc.)
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
        case 's':
        case 'S':
          e.preventDefault();
          handleAddScratchpad(false);
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
        case 'v':
        case 'V':
          setActiveTool('none');
          break;
        case '[':
          setPenSize(curr => {
            const SIZES = [3, 5, 8, 12];
            const idx = SIZES.indexOf(curr);
            const prev = idx > 0 ? SIZES[idx - 1] : SIZES[0];
            try { localStorage.setItem('pq_present_pen_size', String(prev)); } catch {}
            return prev;
          });
          break;
        case ']':
          setPenSize(curr => {
            const SIZES = [3, 5, 8, 12];
            const idx = SIZES.indexOf(curr);
            const next = idx !== -1 && idx < SIZES.length - 1 ? SIZES[idx + 1] : SIZES[SIZES.length - 1];
            try { localStorage.setItem('pq_present_pen_size', String(next)); } catch {}
            return next;
          });
          break;
        case 'z':
        case 'Z':
          setIsZoomedImage(z => !z);
          break;
        case 'q':
        case 'Q':
          setIsQueueOpen(o => !o);
          break;
        case 'm':
        case 'M':
          toggleTheme();
          break;
        case 'd':
        case 'D':
          setIsDockCollapsed(c => !c);
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
        case 'r':
        case 'R':
          handleToggleMode();
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
  }, [handleNext, handlePrev, handleUndo, handleClearStepInk, toggleTheme, handleToggleMode, handleAddScratchpad]);

  if (!currentQ) {
    return (
      <div className="pq-present-root" data-present-theme={theme} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <h2 style={{ fontSize: 28, margin: '0 0 12px' }}>No Lecture Items Queued</h2>
          <p style={{ color: '#94a3b8', margin: '0 0 24px' }}>Please select questions or topic nodes in the Lecture Studio to present.</p>
          <Link href="/admin/studio" style={{ padding: '10px 20px', borderRadius: 8, background: '#3b82f6', color: '#fff', textDecoration: 'none', fontWeight: 800 }}>
            ← Return to Lecture Studio Hub
          </Link>
        </div>
      </div>
    );
  }

  const isTopicMode = currentQ.type === 'topic';
  const stemBlocks = (isTopicMode || (isMappingMode && !currentQ.stem)) ? [] : parseStem(currentQ.stem);
  const options = Array.isArray(currentQ.options) ? currentQ.options : [];
  const palette = theme === 'light' ? LIGHT_PALETTE : DARK_PALETTE;

  return (
    <div className="pq-present-root" data-present-theme={theme}>
      {/* 16:9 Scaled Viewport Container (Centered in safe zone ABOVE the floating dock) */}
      <div
        className="pq-present-stage-viewport"
        style={{
          bottom: isDockCollapsed ? '34px' : (isSmallScreen ? '62px' : '76px'),
        }}
      >
        <div
          ref={stageRef}
          className={`pq-present-stage ${presentationMode === 'screen' ? 'is-mode-screen' : 'is-mode-16-9'} ${isMappingMode ? 'is-mapping-layout' : ''} ${isFullStageScratchpad ? 'is-full-stage-scratchpad' : ''}`}
          style={presentationMode === '16:9' ? {
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          } : undefined}
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
          {/* LEFT PANEL: MAP CONTAINER (IN MAPPING MODE)               */}
          {/* OR PINNED QUESTION (IN PYQ/TOPIC MODE)                    */}
          {/* ========================================================= */}
          <aside className={`pq-present-left-panel ${isMappingMode ? 'is-map-panel' : ''}`}>
            {isMappingMode ? (
              <div className="pq-present-map-stage-wrap">
                <StudioPresenterMap currentQ={currentQ} currentStep={currentStep} theme={theme} />
              </div>
            ) : (
              <>
                <div className="pq-present-left-content">
                  {/* Meta Tags */}
                  <div className="pq-present-q-meta">
                    <span className="pq-present-tag pq-present-tag-exam">
                      {isTopicMode
                        ? (Array.isArray(currentQ.gsPapers) ? currentQ.gsPapers.join(', ') : (currentQ.gsPapers || 'GS Paper'))
                        : (`${currentQ.examName || 'UPSC CSE Pre'} ${currentQ.examYear || ''}`)
                      }
                    </span>
                    {currentQ.questionNo && !isTopicMode && (
                      <span className="pq-present-tag pq-present-tag-qno">
                        Q{currentQ.questionNo}
                      </span>
                    )}
                    {(currentQ.srcTopic || currentQ.topic) && (
                      <span className="pq-present-tag pq-present-tag-topic">
                        {currentQ.srcTopic || currentQ.topic}
                      </span>
                    )}
                  </div>

                  {/* Scrollable Anchor Content */}
                  <div className="pq-present-q-scrollable">
                    {isTopicMode ? (
                      /* TOPIC MODE ANCHOR */
                      <div className="pq-present-anchor-topic">
                        <h2 className="pq-topic-anchor-title">{currentQ.title}</h2>
                        <div className="pq-topic-anchor-summary">
                          {currentQ.cumulativeSummary || currentQ.overview || currentQ.backgroundNote || 'Foundational syllabus topic anchor.'}
                        </div>
                      </div>
                    ) : (
                      /* PYQ MODE ANCHOR */
                      <>
                        {stemBlocks.map((b, idx) => {
                          if (b.type === 'stmts') {
                            return (
                              <div className="pq-present-statements" key={idx}>
                                {b.items.map((s, k) => {
                                  const verdict = currentStep?.verdicts?.[String(s.key).toUpperCase()];
                                  const isCorrect = verdict && verdict.toLowerCase().includes('correct') && !verdict.toLowerCase().includes('incorrect');
                                  const isIncorrect = verdict && verdict.toLowerCase().includes('incorrect');

                                  return (
                                    <div className={`pq-present-statement-item ${verdict ? 'has-verdict' : ''}`} key={k}>
                                      <span className="pq-present-statement-key">{s.key}</span>
                                      <div style={{ flex: 1, minWidth: 0 }}>{s.text}</div>

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
                      </>
                    )}
                  </div>
                </div>

                {/* Left Bottom Tracker */}
                <div className="pq-present-left-footer">
                  <span>ITEM {qIndex + 1} OF {questions.length}</span>
                  <span style={{ color: theme === 'light' ? '#0284c7' : '#38bdf8' }}>
                    {isTopicMode ? (currentQ.domain || 'Thematic Lecture') : (currentQ.srcSubject || 'General Studies')}
                  </span>
                </div>
              </>
            )}
          </aside>

          {/* ========================================================= */}
          {/* RIGHT PANEL: DYNAMIC EXPLANATION / TOPIC SLIDES (52%-56%) */}
          {/* ========================================================= */}
          <main className={`pq-present-right-panel ${isMappingMode ? 'is-map-right-panel' : ''}`}>
            {/* IN MAPPING MODE: Only render stem box if this mapping item is a question with a question stem */}
            {isMappingMode && stemBlocks.length > 0 && (
              <div className="pq-mapping-stem-box" style={{ marginBottom: 14 }}>
                {stemBlocks.map((b, idx) => (
                  <p key={idx} className={idx === 0 ? 'pq-present-stem-lead' : 'pq-present-stem-ask'}>
                    {b.text}
                  </p>
                ))}
                {options.length > 0 && (
                  <div className="pq-present-options-grid">
                    {options.map((opt) => (
                      <div key={opt.label} className="pq-present-option-row">
                        <span className="pq-present-opt-label">{opt.label}</span>
                        <span className="pq-present-opt-text">{opt.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step Header (Hidden for Scratchpad so canvas has maximum writing height) */}
            {currentStep?.type !== 'scratchpad' && (
              <div className="pq-present-step-head">
                <span className="pq-present-step-badge">
                  <Sparkles size={13} />
                  <span>{currentStep?.badge || 'LECTURE STAGE'}</span>
                </span>
                <h1 className="pq-present-step-title">{currentStep?.title}</h1>
                {currentStep?.subtitle && (
                  <p className="pq-present-step-sub">{currentStep.subtitle}</p>
                )}
              </div>
            )}

            {/* Dynamic Step Content Body */}
            <div className={`pq-present-slide-body ${currentStep?.type === 'scratchpad' ? 'is-scratchpad-body' : ''}`}>
              {/* DYNAMIC BLANK SLIDE / SCRATCHPAD CANVAS */}
              {currentStep?.type === 'scratchpad' && (
                <div className={`pq-scratchpad-card pq-pattern-${currentStep.pattern || 'plain'}`}>
                  <div className="pq-scratchpad-toolbar">
                    <div className="pq-scratchpad-tool-left">
                      <span className="pq-scratchpad-badge">
                        <Sparkles size={13} />
                        <span>{currentStep.isFullStage ? 'FULL STAGE CANVAS' : 'SPLIT SCRATCHPAD'}</span>
                      </span>
                      <span className="pq-scratchpad-title-text">
                        {currentStep.isFullStage ? '1080p Full Mindmap Canvas' : 'Digital Ink Scratchpad'}
                      </span>
                    </div>

                    <div className="pq-scratchpad-tool-right">
                      {/* Pattern Selector */}
                      <div className="pq-pattern-selector" title="Pattern: Plain, Dot Grid, Ruled Lines">
                        <button
                          type="button"
                          onClick={() => handleUpdateScratchpadPattern('plain')}
                          className={`pq-pattern-btn ${currentStep.pattern === 'plain' || !currentStep.pattern ? 'is-active' : ''}`}
                        >
                          Plain
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateScratchpadPattern('dots')}
                          className={`pq-pattern-btn ${currentStep.pattern === 'dots' ? 'is-active' : ''}`}
                        >
                          <Grid size={12} />
                          <span>Dots</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateScratchpadPattern('ruled')}
                          className={`pq-pattern-btn ${currentStep.pattern === 'ruled' ? 'is-active' : ''}`}
                        >
                          <AlignJustify size={12} />
                          <span>Ruled</span>
                        </button>
                      </div>

                      {/* Split / Full Stage Toggle */}
                      <button
                        type="button"
                        onClick={handleToggleScratchpadFullStage}
                        className="pq-scratchpad-action-btn"
                        title={currentStep.isFullStage ? 'Switch back to Split View (Pin Question/Map on left)' : 'Expand to Full 16:9 Canvas'}
                      >
                        <Columns size={13} />
                        <span>{currentStep.isFullStage ? 'Split View' : 'Full Stage'}</span>
                      </button>

                      {/* Delete Scratchpad Slide */}
                      <button
                        type="button"
                        onClick={handleDeleteCurrentScratchpad}
                        className="pq-scratchpad-del-btn"
                        title="Delete this scratchpad slide"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  <div className="pq-scratchpad-content-area">
                    <div className="pq-scratchpad-watermark">
                      XP-PEN / STYLUS SCRATCHPAD · DRAW FREELY
                    </div>
                  </div>
                </div>
              )}

              {/* IMAGE / INFOGRAPHIC SLIDE (Conditional) */}
              {currentStep?.type === 'image' && currentStep.imageUrl && (
                <div className="pq-present-image-container">
                  <div
                    className={`pq-present-image-wrap ${isZoomedImage ? 'is-zoomed' : ''}`}
                    onClick={() => setIsZoomedImage(z => !z)}
                    title="Click or press Z to Zoom"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentStep.imageUrl}
                      alt={currentStep.caption || 'Infographic'}
                      className="pq-present-img"
                    />
                  </div>
                  <div className="pq-present-image-caption">
                    <span>{currentStep.caption || currentStep.title}</span>
                    <span className="pq-present-zoom-hint">
                      {isZoomedImage ? <ZoomOut size={13} /> : <ZoomIn size={13} />}
                      <span>Press Z to {isZoomedImage ? 'Reset' : 'Zoom'}</span>
                    </span>
                  </div>
                </div>
              )}

              {/* FREEHAND SKETCH CANVAS SLIDE (On-Demand) */}
              {currentStep?.type === 'sketch' && (
                <div className="pq-present-sketch-slide">
                  <span className="pq-sketch-watermark">
                    FREEHAND SKETCH &amp; MINDMAP CANVAS · DRAW WITH XP-PEN
                  </span>
                </div>
              )}

              {/* PYQ STAGE 1: INTRO */}
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

              {/* PYQ STAGE 2: BREAKDOWN */}
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
                          {item.reference && (
                            <span
                              className="pq-present-bc-ref"
                              style={{
                                marginLeft: 'auto',
                                padding: '3px 9px',
                                borderRadius: '6px',
                                background: 'rgba(56, 189, 248, 0.15)',
                                border: '1px solid rgba(56, 189, 248, 0.35)',
                                color: '#38bdf8',
                                fontSize: '12px',
                                fontWeight: 800,
                                letterSpacing: '0.02em',
                              }}
                            >
                              {item.reference}
                            </span>
                          )}
                        </div>
                        {item.text && <p className="pq-present-bc-text">{item.text}</p>}
                        <p className="pq-present-bc-exp">{item.explanation}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* PYQ STAGE 3: ANSWER */}
              {currentStep?.type === 'answer' && (
                <div className="pq-present-card" style={{ borderColor: 'rgba(34, 197, 94, 0.45)', background: theme === 'light' ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.12), #ffffff)' : 'linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(15, 23, 42, 0.85))' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#22c55e', color: '#052e16', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900 }}>
                      ✓
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', color: theme === 'light' ? '#15803d' : '#4ade80' }}>Official Answer Key</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: theme === 'light' ? '#0f172a' : '#ffffff' }}>Option ({currentStep.correctLabel || 'Verified'})</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 18.5, lineHeight: 1.6, color: theme === 'light' ? '#1e293b' : '#f1f5f9' }}>
                    {currentStep.explanationText}
                  </div>
                </div>
              )}

              {/* PYQ STAGE 4: KEYWORDS */}
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

              {/* PYQ STAGE 5: VALUE ADDITION */}
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

              {/* PYQ STAGE 6: IN NEWS */}
              {currentStep?.type === 'inNews' && currentStep.inNews && (
                <div className="pq-present-news-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: theme === 'light' ? '#dc2626' : '#f87171', textTransform: 'uppercase' }}>
                    <Flame size={14} />
                    <span>{currentStep.inNews.source || 'Current Context'} {currentStep.inNews.date ? `· ${currentStep.inNews.date}` : ''}</span>
                  </div>
                  <h3 className="pq-present-news-headline">{currentStep.inNews.headline || 'Contemporary Context'}</h3>
                  {(currentStep.inNews.relevance || currentStep.inNews.context) && (
                    <p className="pq-present-news-context">{currentStep.inNews.relevance || currentStep.inNews.context}</p>
                  )}
                </div>
              )}

              {/* PYQ STAGE 7: SIMILAR PYQ */}
              {currentStep?.type === 'similarPyq' && currentStep.similarPyq && (
                <div className="pq-present-card" style={{ borderColor: 'rgba(168, 85, 247, 0.4)', background: theme === 'light' ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), #ffffff)' : 'linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(15, 23, 42, 0.85))' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: theme === 'light' ? '#7e22ce' : '#c084fc', textTransform: 'uppercase', marginBottom: 10 }}>
                    <Layers size={14} />
                    <span>{currentStep.similarPyq.examName || 'UPSC CSE Pre'} {currentStep.similarPyq.examYear || ''}</span>
                  </div>
                  <p style={{ fontSize: 18, lineHeight: 1.55, color: theme === 'light' ? '#0f172a' : '#f8fafc', margin: '0 0 12px' }}>
                    {currentStep.similarPyq.stem}
                  </p>
                  {currentStep.similarPyq.keyTakeaway && (
                    <div style={{ fontSize: 15, color: theme === 'light' ? '#b45309' : '#fbbf24', fontStyle: 'italic' }}>
                      💡 Pattern Insight: {currentStep.similarPyq.keyTakeaway}
                    </div>
                  )}
                </div>
              )}

              {/* PYQ STAGE 8: COMPARISON MATRIX TABLE */}
              {currentStep?.type === 'table' && (
                <div
                  className="pq-present-card"
                  style={{
                    padding: '24px 28px',
                    overflowX: 'auto',
                    borderColor: 'rgba(56, 189, 248, 0.4)',
                    background:
                      theme === 'light'
                        ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.08), #ffffff)'
                        : 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(15, 23, 42, 0.85))',
                  }}
                >
                  {currentStep.tableData?.headers && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '16px' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid rgba(56, 189, 248, 0.4)', background: 'rgba(56, 189, 248, 0.12)' }}>
                          {currentStep.tableData.headers.map((h, i) => (
                            <th
                              key={i}
                              style={{
                                padding: '12px 16px',
                                color: theme === 'light' ? '#0369a1' : '#38bdf8',
                                fontWeight: 800,
                                textAlign: 'left',
                                fontSize: '13.5px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {currentStep.tableData.rows?.map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            style={{
                              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                              background: rIdx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.03)'
                            }}
                          >
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                style={{
                                  padding: '12px 16px',
                                  color: cIdx === 0 ? (theme === 'light' ? '#0f172a' : '#ffffff') : (theme === 'light' ? '#334155' : '#cbd5e1'),
                                  fontWeight: cIdx === 0 ? 800 : 500,
                                  lineHeight: 1.5,
                                }}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {currentStep.caption && (
                    <p style={{ margin: '14px 0 0', fontSize: '14.5px', color: theme === 'light' ? '#64748b' : '#94a3b8', fontStyle: 'italic' }}>
                      💡 {currentStep.caption}
                    </p>
                  )}
                </div>
              )}

              {/* TOPIC STAGE: SPOTLIGHT / EVOLUTION / VALUE ADD / FACTS / QUESTIONS */}
              {currentStep?.type?.startsWith('topic_') && (
                <div className="pq-present-topic-card">
                  <p className="pq-present-topic-prose">
                    {currentStep.content || currentStep.summary || ''}
                  </p>
                </div>
              )}

              {/* RIVER STAGE 1: COURSE, ORIGIN & STATES */}
              {currentStep?.type === 'river_course' && currentStep.riverDetails && (() => {
                const rd = currentStep.riverDetails;
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="pq-present-intro-grid">
                      <div className="pq-present-stat-box">
                        <div className="pq-present-stat-label">Total River Length</div>
                        <div className="pq-present-stat-value" style={{ color: '#38bdf8' }}>{rd.length || 'Major System'}</div>
                      </div>
                      <div className="pq-present-stat-box">
                        <div className="pq-present-stat-label">Source / Origin</div>
                        <div className="pq-present-stat-value" style={{ fontSize: 16, lineHeight: 1.3 }}>{rd.origin}</div>
                      </div>
                      <div className="pq-present-stat-box">
                        <div className="pq-present-stat-label">Outflow / Mouth</div>
                        <div className="pq-present-stat-value" style={{ fontSize: 16, lineHeight: 1.3 }}>{rd.mouth}</div>
                      </div>
                      <div className="pq-present-stat-box">
                        <div className="pq-present-stat-label">River Classification</div>
                        <div className="pq-present-stat-value">{currentQ.placeType || 'Major River System'}</div>
                      </div>
                    </div>

                    {rd.states && (
                      <div className="pq-present-card" style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>🗺️</span>
                          <span>States It Passes Through vs Total Catchment Basin</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: theme === 'light' ? '#475569' : '#94a3b8' }}>Direct River Flow:</span>
                          {rd.states.flowsThrough?.map((st, idx) => (
                            <span key={idx} style={{ fontSize: 14, fontWeight: 800, padding: '4px 12px', borderRadius: 8, background: '#0284c7', color: '#ffffff' }}>
                              {st}
                            </span>
                          ))}
                        </div>
                        {rd.states.basinStates && (
                          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                            <span style={{ fontSize: 12.5, fontWeight: 600, color: theme === 'light' ? '#64748b' : '#64748b' }}>Basin Catchment:</span>
                            {rd.states.basinStates.map((st, idx) => (
                              <span key={idx} style={{ fontSize: 12, fontWeight: 700, padding: '2px 9px', borderRadius: 6, background: theme === 'light' ? '#f1f5f9' : 'rgba(255, 255, 255, 0.08)', color: theme === 'light' ? '#334155' : '#cbd5e1' }}>
                                {st}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* RIVER STAGE 2: LEFT-BANK TRIBUTARIES (CYAN LAYER) */}
              {currentStep?.type === 'river_left_tributaries' && currentStep.riverDetails && (() => {
                const rd = currentStep.riverDetails;
                const leftList = rd.tributaries?.leftBank || [];
                return (
                  <div className="pq-present-card" style={{ borderColor: 'rgba(56, 189, 248, 0.45)', background: theme === 'light' ? '#f0f9ff' : 'rgba(15, 23, 42, 0.9)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, borderBottom: '2px solid rgba(2, 132, 199, 0.3)', paddingBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
                        <span>⬅️</span>
                        <span>Left-Bank Tributaries (Joining from Left Bank)</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 800, padding: '3px 10px', borderRadius: 8, background: '#0284c7', color: '#ffffff' }}>
                        MAP LAYER: CYAN
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: leftList.length > 3 ? '1fr 1fr' : '1fr', gap: 12 }}>
                      {leftList.map((trib, idx) => (
                        <div key={idx} style={{ background: theme === 'light' ? '#ffffff' : 'rgba(255, 255, 255, 0.05)', padding: '12px 16px', borderRadius: 10, borderLeft: '5px solid #0284c7', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(2, 132, 199, 0.2)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>
                              {idx + 1}
                            </span>
                            <span style={{ fontSize: 17, fontWeight: 800, color: theme === 'light' ? '#0f172a' : '#f8fafc' }}>
                              {trib.name}
                            </span>
                          </div>
                          {trib.note && (
                            <div style={{ fontSize: 14, color: theme === 'light' ? '#334155' : '#94a3b8', marginTop: 4, lineHeight: 1.45, paddingLeft: 30 }}>
                              {trib.note}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* RIVER STAGE 3: RIGHT-BANK TRIBUTARIES (AMBER LAYER) */}
              {currentStep?.type === 'river_right_tributaries' && currentStep.riverDetails && (() => {
                const rd = currentStep.riverDetails;
                const rightList = rd.tributaries?.rightBank || [];
                return (
                  <div className="pq-present-card" style={{ borderColor: 'rgba(245, 158, 11, 0.45)', background: theme === 'light' ? '#fffbeb' : 'rgba(15, 23, 42, 0.9)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, borderBottom: '2px solid rgba(217, 119, 6, 0.3)', paddingBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 800, color: '#d97706', textTransform: 'uppercase' }}>
                        <span>➡️</span>
                        <span>Right-Bank Tributaries (Joining from Right Bank)</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 800, padding: '3px 10px', borderRadius: 8, background: '#d97706', color: '#ffffff' }}>
                        MAP LAYER: AMBER
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: rightList.length > 3 ? '1fr 1fr' : '1fr', gap: 12 }}>
                      {rightList.map((trib, idx) => (
                        <div key={idx} style={{ background: theme === 'light' ? '#ffffff' : 'rgba(255, 255, 255, 0.05)', padding: '12px 16px', borderRadius: 10, borderLeft: '5px solid #d97706', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(217, 119, 6, 0.2)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>
                              {idx + 1}
                            </span>
                            <span style={{ fontSize: 17, fontWeight: 800, color: theme === 'light' ? '#0f172a' : '#f8fafc' }}>
                              {trib.name}
                            </span>
                          </div>
                          {trib.note && (
                            <div style={{ fontSize: 14, color: theme === 'light' ? '#334155' : '#94a3b8', marginTop: 4, lineHeight: 1.45, paddingLeft: 30 }}>
                              {trib.note}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* RIVER STAGE 3: SANGAMS & MAJOR DAMS */}
              {currentStep?.type === 'river_dams_confluences' && currentStep.riverDetails && (() => {
                const rd = currentStep.riverDetails;
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    {/* Confluences (Sangams) */}
                    <div className="pq-present-card" style={{ borderColor: 'rgba(245, 158, 11, 0.45)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 800, color: '#d97706', textTransform: 'uppercase', marginBottom: 14, borderBottom: '2px solid rgba(217, 119, 6, 0.3)', paddingBottom: 8 }}>
                        <span>🤝</span>
                        <span>Important Sangams (Confluences)</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {rd.confluences?.map((c, idx) => (
                          <div key={idx} style={{ background: theme === 'light' ? '#f8fafc' : 'rgba(255, 255, 255, 0.04)', padding: '9px 13px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                            <div>
                              <div style={{ fontSize: 15.5, fontWeight: 800, color: theme === 'light' ? '#0f172a' : '#f8fafc' }}>{c.sangam}</div>
                              {c.note && <div style={{ fontSize: 12.5, color: theme === 'light' ? '#64748b' : '#94a3b8', marginTop: 2 }}>{c.note}</div>}
                            </div>
                            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                              <span style={{ fontSize: 12, fontWeight: 800, padding: '2px 8px', borderRadius: 5, background: '#dbeafe', color: '#1e40af' }}>{c.tributary}</span>
                              <span style={{ fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 5, background: '#f1f5f9', color: '#334155' }}>{c.state}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Major Dams & Projects */}
                    <div className="pq-present-card" style={{ borderColor: 'rgba(239, 68, 68, 0.45)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', marginBottom: 14, borderBottom: '2px solid rgba(220, 38, 38, 0.3)', paddingBottom: 8 }}>
                        <span>🏗️</span>
                        <span>Major Dams &amp; Multipurpose Projects</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {rd.dams?.map((dam, idx) => (
                          <div key={idx} style={{ background: theme === 'light' ? '#f8fafc' : 'rgba(255, 255, 255, 0.04)', padding: '9px 13px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                            <div>
                              <div style={{ fontSize: 15.5, fontWeight: 800, color: theme === 'light' ? '#0f172a' : '#f8fafc' }}>{dam.name}</div>
                              {dam.type && <div style={{ fontSize: 12.5, color: theme === 'light' ? '#64748b' : '#94a3b8', marginTop: 2 }}>{dam.type}</div>}
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 800, padding: '3px 9px', borderRadius: 6, background: '#fee2e2', color: '#991b1b', flexShrink: 0 }}>
                              {dam.state}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* RIVER STAGE 4: PARKS, TOWNS & WILDLIFE */}
              {currentStep?.type === 'river_ecology_towns' && currentStep.riverDetails && (() => {
                const rd = currentStep.riverDetails;
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      {/* Protected Areas */}
                      <div className="pq-present-card" style={{ borderColor: 'rgba(16, 185, 129, 0.4)' }}>
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: '#059669', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>🌲</span>
                          <span>National Parks &amp; Sanctuaries in Basin</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {rd.protectedAreas?.map((pa, idx) => (
                            <div key={idx} style={{ fontSize: 13.5, lineHeight: 1.4, paddingBottom: 6, borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                              <strong style={{ color: '#10b981' }}>{pa.name}</strong> ({pa.state}):
                              <span style={{ color: theme === 'light' ? '#475569' : '#cbd5e1', marginLeft: 4 }}>{pa.relation}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Historic & Cultural Towns */}
                      <div className="pq-present-card" style={{ borderColor: 'rgba(168, 85, 247, 0.4)' }}>
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: '#9333ea', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>🏛️</span>
                          <span>Important Cities &amp; Historical Capitals</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {rd.towns?.map((tw, idx) => (
                            <div key={idx} style={{ fontSize: 13.5, lineHeight: 1.4, paddingBottom: 6, borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                              <strong style={{ color: theme === 'light' ? '#0f172a' : '#f8fafc' }}>{tw.name}</strong> ({tw.state}) — 
                              <span style={{ color: theme === 'light' ? '#475569' : '#cbd5e1', marginLeft: 4 }}>{tw.significance}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Indicator Species Grid */}
                    {rd.species && (
                      <div className="pq-present-card" style={{ padding: '12px 16px', borderColor: 'rgba(56, 189, 248, 0.35)' }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>🐬</span>
                          <span>Important Animals &amp; Birds in the River</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                          {rd.species.map((sp, idx) => (
                            <div key={idx} style={{ background: theme === 'light' ? '#f8fafc' : 'rgba(255, 255, 255, 0.04)', padding: '7px 10px', borderRadius: 6, fontSize: 13 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong style={{ color: theme === 'light' ? '#0f172a' : '#f8fafc' }}>{sp.name}</strong>
                                <span style={{ fontSize: 11, fontWeight: 800, padding: '1px 6px', borderRadius: 4, background: '#fee2e2', color: '#991b1b' }}>{sp.iucn}</span>
                              </div>
                              {sp.role && <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>{sp.role}</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Common Mistake / UPSC Trap */}
                    {rd.commonMistake && (
                      <div className="pq-present-card" style={{ borderColor: 'rgba(245, 158, 11, 0.5)', background: theme === 'light' ? '#fffbeb' : 'rgba(245, 158, 11, 0.08)', padding: '12px 16px' }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#b45309', textTransform: 'uppercase', marginBottom: 4 }}>
                          ⚠️ Common Student Mistake / UPSC Trap:
                        </div>
                        <p style={{ fontSize: 15, lineHeight: 1.5, color: theme === 'light' ? '#78350f' : '#fef3c7', margin: 0 }}>
                          {rd.commonMistake}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* MAPPING STAGE 1: LOCATION & OVERVIEW */}
              {currentStep?.type === 'mapping_overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="pq-present-intro-grid">
                    <div className="pq-present-stat-box">
                      <div className="pq-present-stat-label">Place / Feature Name</div>
                      <div className="pq-present-stat-value">{currentQ.place || currentQ.title}</div>
                    </div>
                    <div className="pq-present-stat-box">
                      <div className="pq-present-stat-label">Latitude &amp; Longitude</div>
                      <div className="pq-present-stat-value" style={{ fontFamily: 'monospace' }}>
                        {currentQ.lat && currentQ.lng ? `${Number(currentQ.lat).toFixed(2)}° N, ${Number(currentQ.lng).toFixed(2)}° E` : 'Coordinates on Map'}
                      </div>
                    </div>
                    <div className="pq-present-stat-box">
                      <div className="pq-present-stat-label">State / Region</div>
                      <div className="pq-present-stat-value">{currentStep.locationText || 'India'}</div>
                    </div>
                    <div className="pq-present-stat-box">
                      <div className="pq-present-stat-label">Topic / Category</div>
                      <div className="pq-present-stat-value">{currentStep.categories || currentQ.placeType || 'Geography'}</div>
                    </div>
                  </div>

                  {Array.isArray(currentQ.staticFacts) && currentQ.staticFacts.length > 0 && (
                    <div className="pq-present-topic-card">
                      <p className="pq-present-topic-prose">
                        {currentQ.staticFacts[0]}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* MAPPING STAGE 2: KEY FACTS */}
              {currentStep?.type === 'mapping_facts' && currentStep.facts && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {currentStep.facts.map((fact, idx) => (
                    <div key={idx} className="pq-present-concept-card">
                      <div className="pq-present-concept-title">
                        <Compass size={18} color="#34d399" />
                        <span>Key Fact #{idx + 1}</span>
                      </div>
                      <p className="pq-present-concept-note" style={{ fontSize: 16.5, lineHeight: 1.6 }}>
                        {fact}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* MAPPING STAGE 3: EXAM TRAPS */}
              {currentStep?.type === 'mapping_angle' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {currentStep.upscAngle && (
                    <div className="pq-present-card" style={{ borderColor: 'rgba(245, 158, 11, 0.45)', background: theme === 'light' ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), #ffffff)' : 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(15, 23, 42, 0.85))' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: theme === 'light' ? '#b45309' : '#fbbf24', textTransform: 'uppercase', marginBottom: 10 }}>
                        <Sparkles size={16} />
                        <span>⚠️ Common UPSC Mistake / Examiner Trap</span>
                      </div>
                      <p style={{ fontSize: 18, lineHeight: 1.6, color: theme === 'light' ? '#0f172a' : '#f8fafc', margin: 0 }}>
                        {currentStep.upscAngle}
                      </p>
                    </div>
                  )}

                  {currentStep.newsHook && (
                    <div className="pq-present-news-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: theme === 'light' ? '#dc2626' : '#f87171', textTransform: 'uppercase' }}>
                        <Flame size={14} />
                        <span>📰 Why in the News Recently</span>
                      </div>
                      <h3 className="pq-present-news-headline">{currentStep.newsHook}</h3>
                    </div>
                  )}
                </div>
              )}

              {/* MAPPING STAGE 4/5: LINKED PYQ */}
              {currentStep?.type === 'mapping_pyq' && currentStep.pyq && (
                <div className="pq-present-card" style={{ borderColor: 'rgba(56, 189, 248, 0.4)', background: theme === 'light' ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), #ffffff)' : 'linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(15, 23, 42, 0.85))' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: theme === 'light' ? '#0284c7' : '#38bdf8', textTransform: 'uppercase', marginBottom: 10 }}>
                    <Layers size={14} />
                    <span>Past Year UPSC Question: {currentStep.pyq.exam || 'UPSC CSE Pre'} {currentStep.pyq.examYear || ''}</span>
                  </div>
                  <p style={{ fontSize: 17.5, lineHeight: 1.55, color: theme === 'light' ? '#0f172a' : '#f8fafc', margin: '0 0 14px' }}>
                    {currentStep.pyq.stem}
                  </p>
                  {Array.isArray(currentStep.pyq.options) && currentStep.pyq.options.length > 0 && (
                    <div className="pq-present-options-grid" style={{ marginBottom: 14 }}>
                      {currentStep.pyq.options.map((opt, oIdx) => {
                        const optLabel = typeof opt === 'object' && opt.label ? opt.label : String.fromCharCode(65 + oIdx);
                        const optText = typeof opt === 'object' && opt.text ? opt.text : String(opt);
                        return (
                          <div key={oIdx} className="pq-present-option-row">
                            <span className="pq-present-opt-label">{optLabel}</span>
                            <span className="pq-present-opt-text">{optText}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {currentStep.pyq.correctLabel && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 8, background: '#22c55e', color: '#052e16', fontSize: 13, fontWeight: 800, marginBottom: 8 }}>
                      <span>Correct Answer: Option ({currentStep.pyq.correctLabel})</span>
                    </div>
                  )}
                  {currentStep.pyq.answerText && (
                    <div style={{ fontSize: 14.5, color: theme === 'light' ? '#334155' : '#cbd5e1', marginTop: 10, lineHeight: 1.5 }}>
                      {currentStep.pyq.answerText}
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

          {/* Blackboard / Whiteboard Freehand Mode Overlay */}
          {isBlackboard && (
            <div
              className="pq-present-board-overlay"
              style={{
                position: 'absolute',
                inset: 0,
                background: theme === 'light' ? '#ffffff' : '#040711',
                zIndex: 45,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ fontSize: 14, color: theme === 'light' ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.25)', fontWeight: 800, letterSpacing: '0.1em' }}>
                {theme === 'light' ? 'WHITEBOARD MODE · DRAW FREELY · PRESS B TO EXIT' : 'BLACKBOARD MODE · DRAW FREELY · PRESS B TO EXIT'}
              </div>
            </div>
          )}

          {/* In-Studio Playlist Tray / Queue Drawer */}
          {isQueueOpen && (
            <div className="pq-present-queue-drawer">
              <div className="pq-queue-header">
                <div className="pq-queue-title">
                  <ListOrdered size={20} color="#38bdf8" />
                  <span>Lecture Deck Queue ({questions.length})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQueueOpen(false)}
                  className="pq-queue-close-btn"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="pq-queue-list">
                {questions.map((item, idx) => {
                  const isActive = idx === qIndex;
                  const itemTitle = item.type === 'topic'
                    ? item.title
                    : item.type === 'mapping'
                    ? (item.place || item.title)
                    : (item.stem ? item.stem.substring(0, 110) + '...' : `Question ${idx + 1}`);

                  return (
                    <div
                      key={item.id || idx}
                      className={`pq-queue-item ${isActive ? 'is-active-item' : ''}`}
                      onClick={() => jumpToItem(idx)}
                    >
                      <span className="pq-queue-item-num">{idx + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', color: item.type === 'mapping' ? '#34d399' : '#38bdf8' }}>
                            {item.type === 'topic' ? (item.domain || 'Topic') : item.type === 'mapping' ? (item.regionScope || 'Mapping') : `${item.examName || 'CSE'} ${item.examYear || ''}`}
                          </span>
                          {item.imageUrl && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 10, color: '#f59e0b', fontWeight: 800 }}>
                              <ImageIcon size={10} /> Image
                            </span>
                          )}
                        </div>
                        <div className="pq-queue-item-title">{itemTitle}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* ANNOTATION CANVAS (TOPMOST INTERACTION LAYER)             */}
          {/* ========================================================= */}
          <PyqAnnotationCanvas
            scale={scale}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            activeTool={activeTool}
            activeColor={activeColor}
            penSize={penSize}
            leftBoundaryX={leftBoundaryX}
            isFullStage={Boolean(isFullStageScratchpad)}
            questionStrokes={currentQStrokes}
            stepStrokes={currentStepStrokes}
            onUpdateQuestionStrokes={handleUpdateQStrokes}
            onUpdateStepStrokes={handleUpdateStepStrokes}
          />
        </div>
      </div>

      {/* ============================================================= */}
      {/* FLOATING PRESENTER DOCK / CONTROL BAR                         */}
      {/* ============================================================= */}
      {isDockCollapsed ? (
        <button
          type="button"
          onClick={() => setIsDockCollapsed(false)}
          className="pq-present-dock-pill"
          title="Expand Presenter Tools [D]"
        >
          <ChevronUp size={14} />
          <span>Tools</span>
        </button>
      ) : (
        <footer className="pq-present-dock">
          {/* Deck Navigator */}
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

          {/* Pan / Interact Map or Cursor */}
          <button
            type="button"
            onClick={() => setActiveTool('none')}
            className={`pq-dock-btn ${activeTool === 'none' ? 'is-active' : ''}`}
            title="Pan / Interact with Map [V]"
          >
            <Move size={16} />
          </button>

          {/* Drawing Tools */}
          <button
            type="button"
            onClick={() => setActiveTool(t => (t === 'pen' ? 'none' : 'pen'))}
            className={`pq-dock-btn ${activeTool === 'pen' ? 'is-active' : ''}`}
            title="Pen Tool [P] (XP-Pen uniform line)"
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

          {/* Dynamic Blank Scratchpad Slide */}
          <button
            type="button"
            onClick={() => handleAddScratchpad(false)}
            className="pq-dock-btn pq-dock-scratchpad-btn"
            title="Insert Blank Scratchpad Slide [S]"
          >
            <FilePlus2 size={16} />
          </button>

          <div className="pq-dock-sep" />

          {/* Color Palette */}
          <div className="pq-dock-colors">
            {palette.map(c => (
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

          {/* Pen Thickness Selector */}
          <div className="pq-dock-sizes" title="Pen Thickness: 3px, 5px, 8px, 12px ([ and ] keys)">
            {[
              { size: 3, label: 'Fine (3px)', dot: 4 },
              { size: 5, label: 'Regular (5px)', dot: 7 },
              { size: 8, label: 'Bold (8px)', dot: 10 },
              { size: 12, label: 'Heavy (12px)', dot: 14 },
            ].map((s) => (
              <button
                key={s.size}
                type="button"
                onClick={() => {
                  updatePenSize(s.size);
                  if (activeTool === 'none' || activeTool === 'eraser') setActiveTool('pen');
                }}
                className={`pq-size-btn ${penSize === s.size ? 'is-selected' : ''}`}
                title={s.label}
              >
                <span
                  style={{
                    width: s.dot,
                    height: s.dot,
                    borderRadius: '50%',
                    background: 'currentColor',
                    display: 'inline-block',
                  }}
                />
              </button>
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

          {/* Zoom Image (active when on image slide) */}
          {currentStep?.type === 'image' && (
            <button
              type="button"
              onClick={() => setIsZoomedImage(z => !z)}
              className={`pq-dock-btn ${isZoomedImage ? 'is-active' : ''}`}
              title="Zoom Image [Z]"
            >
              {isZoomedImage ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
            </button>
          )}

          {/* In-Studio Playlist Tray */}
          <button
            type="button"
            onClick={() => setIsQueueOpen(o => !o)}
            className={`pq-dock-btn ${isQueueOpen ? 'is-active' : ''}`}
            title="Toggle Lecture Deck Queue [Q]"
          >
            <ListOrdered size={16} />
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="pq-dock-btn"
            title={`Switch to ${theme === 'dark' ? 'Light / Whiteboard Mode' : 'Dark Mode'} [M]`}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

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
            title={theme === 'light' ? "Whiteboard Mode [B]" : "Blackboard Mode [B]"}
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

          {/* Presentation Mode Switcher: Fluid Screen Fit (Mac Native) vs 16:9 Broadcast */}
          <button
            type="button"
            onClick={handleToggleMode}
            className={`pq-dock-btn pq-dock-btn-mode ${presentationMode === 'screen' ? 'is-active' : ''}`}
            title={`Switch Presentation Canvas [R]: Currently in ${presentationMode === 'screen' ? 'Fluid Screen Fit (Mac / Native)' : '16:9 Broadcast Standard (1080p)'}`}
          >
            {presentationMode === 'screen' ? <Laptop size={15} /> : <Tv size={15} />}
            <span className="pq-mode-pill-label">
              {presentationMode === 'screen' ? 'Screen Fit' : '16:9'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowHelp(h => !h)}
            className={`pq-dock-btn ${showHelp ? 'is-active' : ''}`}
            title="Keyboard Shortcuts [?]"
          >
            <HelpCircle size={16} />
          </button>

          <div className="pq-dock-sep" />

          {/* Minimize / Collapse Dock */}
          <button
            type="button"
            onClick={() => setIsDockCollapsed(true)}
            className="pq-dock-btn"
            title="Collapse Dock for Recording [D]"
          >
            <ChevronDown size={16} />
          </button>
        </footer>
      )}

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
              width: 460,
              padding: '24px 28px',
              borderRadius: 16,
              background: theme === 'light' ? '#ffffff' : '#0f172a',
              border: theme === 'light' ? '1.5px solid rgba(0, 0, 0, 0.15)' : '1.5px solid rgba(255, 255, 255, 0.15)',
              color: theme === 'light' ? '#0f172a' : '#f8fafc',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 20, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <HelpCircle size={20} color={theme === 'light' ? '#0284c7' : '#38bdf8'} />
              <span>Studio Keyboard Shortcuts</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px 16px', fontSize: 13.5, lineHeight: 1.6 }}>
              <strong>Space / →</strong> <span>Next Step / Next Question</span>
              <strong>←</strong> <span>Previous Step / Previous Question</span>
              <strong>P</strong> <span>Pen Tool (XP-Pen pressure sensitive)</span>
              <strong>H</strong> <span>Highlighter Tool</span>
              <strong>L</strong> <span>Laser Pointer (fading dot)</span>
              <strong>E</strong> <span>Eraser Tool</span>
              <strong>[ / ]</strong> <span>Decrease / Increase Pen Thickness</span>
              <strong>S</strong> <span>Insert Blank Scratchpad Slide</span>
              <strong>Z</strong> <span>Zoom / Full-Bleed Image Diagram</span>
              <strong>Q</strong> <span>Toggle In-Studio Playlist Tray</span>
              <strong>M</strong> <span>Toggle Dark / Light Whiteboard Mode</span>
              <strong>D</strong> <span>Collapse / Expand Presenter Dock</span>
              <strong>Cmd + Z</strong> <span>Undo Last Stroke</span>
              <strong>C</strong> <span>Clear Current Step Ink</span>
              <strong>R</strong> <span>Toggle Mode (Screen Fit vs 16:9 Broadcast)</span>
              <strong>F</strong> <span>Fullscreen (for TV / OBS recording)</span>
              <strong>W</strong> <span>Toggle OBS Webcam Safe Zone</span>
              <strong>T</strong> <span>30s Think Timer</span>
              <strong>B</strong> <span>Blackboard / Whiteboard Mode</span>
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
