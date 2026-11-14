'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback, useSyncExternalStore } from 'react';

// False during server render and hydration, true after: lets saved settings (theme, size) apply before the first paint.
const subscribeNever = () => () => {};
import Link from 'next/link';
import { Toolbar } from '@/components/pyq-studio';
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
  Cast,
} from 'lucide-react';
import { buildQuestionSteps, buildTopicSteps, buildMappingSteps } from '@/lib/pyqSlideDeck';
import SlideBody, { SlideHead, Prose, useAutoFit } from './SlideBody';
import { parseStem } from '@/app/prelims/pyq/StemView';
import PyqAnnotationCanvas from './PyqAnnotationCanvas';
import StudioPresenterMap from './StudioPresenterMap';
import { Link as RemoteLink } from '@/lib/remote/link';
import BoardConnectDialog from '@/components/remote/BoardConnectDialog';
import '@/app/remote/remote.css';
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

function PyqPresenterClientInner({
  questions = [],
  isDisplayMode = false,
  externalLink = null,
  onExitDisplay = null,
  initialRecordingSession = null,
}) {
  const [qIndex, setQIndex] = useState(() => {
    const start = Number(initialRecordingSession?.lastIndex) || 0;
    return Math.max(0, Math.min(start, Math.max(0, questions.length - 1)));
  });
  const [stepIndex, setStepIndex] = useState(0);

  // Recording session tracking (Phase 6)
  const [recStatus, setRecStatus] = useState(
    initialRecordingSession ? (initialRecordingSession.status === 'paused' ? 'paused' : 'recording') : null,
  );
  const [recElapsedSec, setRecElapsedSec] = useState(initialRecordingSession?.durationSec || 0);
  const [stopAfterThis, setStopAfterThis] = useState(false);
  const [recTimestamps, setRecTimestamps] = useState(() =>
    Array.isArray(initialRecordingSession?.timestamps) ? initialRecordingSession.timestamps : [],
  );

  useEffect(() => {
    if (!initialRecordingSession || recStatus !== 'recording') return undefined;
    const timer = setInterval(() => setRecElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [initialRecordingSession, recStatus]);

  // Auto-save timestamp + lastIndex whenever moving between questions
  const prevQIndexRef = useRef(qIndex);
  useEffect(() => {
    if (!initialRecordingSession) return;
    const currentItem = questions[qIndex];
    if (!currentItem) return;
    if (prevQIndexRef.current !== qIndex) {
      if (stopAfterThis) {
        setRecStatus('paused');
        setStopAfterThis(false);
      }
      prevQIndexRef.current = qIndex;
      setRecTimestamps((prev) => {
        const idx = prev.findIndex((t) => t.questionId === currentItem.id);
        const next =
          idx >= 0
            ? prev.map((t, i) => (i === idx ? { ...t, startSec: recElapsedSec } : t))
            : [...prev, { questionId: currentItem.id, startSec: recElapsedSec }];
        fetch(`/api/admin/recordings/${encodeURIComponent(initialRecordingSession.id)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lastIndex: qIndex,
            durationSec: recElapsedSec,
            timestamps: next,
          }),
        }).catch(() => {});
        return next;
      });
    }
  }, [qIndex, questions, initialRecordingSession, recElapsedSec, stopAfterThis]);

  // Crash-safe pause on tab close
  useEffect(() => {
    if (!initialRecordingSession) return undefined;
    const onUnload = () => {
      if (recStatus === 'done' || recStatus === 'discarded') return;
      fetch(`/api/admin/recordings/${encodeURIComponent(initialRecordingSession.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          status: 'paused',
          lastIndex: qIndex,
          durationSec: recElapsedSec,
          timestamps: recTimestamps,
        }),
      }).catch(() => {});
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [initialRecordingSession, recStatus, qIndex, recElapsedSec, recTimestamps]);

  const handleFinishRecordingPart = async () => {
    if (!initialRecordingSession) return;
    setRecStatus('done');
    const videoRef = `rec_${initialRecordingSession.id}_part${initialRecordingSession.part}.webm`;
    await fetch(`/api/admin/recordings/${encodeURIComponent(initialRecordingSession.id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'done',
        lastIndex: qIndex,
        durationSec: recElapsedSec,
        timestamps: recTimestamps,
        videoRef,
      }),
    });
    window.location.href = `/admin/studio/pyq/record?sessionId=${encodeURIComponent(initialRecordingSession.id)}`;
  };

  const handleDiscardRecordingPart = async () => {
    if (!initialRecordingSession) return;
    setRecStatus('discarded');
    await fetch(`/api/admin/recordings/${encodeURIComponent(initialRecordingSession.id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'discarded' }),
    });
    window.location.href = '/admin/studio/pyq';
  };
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWebcamBox, setShowWebcamBox] = useState(false); // OBS camera guide: off by default, W shows it
  const [isBlackboard, setIsBlackboard] = useState(false);
  const [isZoomedImage, setIsZoomedImage] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  // Remote Presenting State (Section 4 & 5)
  const linkRef = useRef(externalLink || null);
  const [linkStatus, setLinkStatus] = useState(externalLink ? externalLink.status : 'waiting');
  const [statusInfo, setStatusInfo] = useState('');
  const [pairedCode, setPairedCode] = useState(externalLink ? externalLink.code : null);
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const [remoteLiveStroke, setRemoteLiveStroke] = useState(null);
  const [remoteLaserPoint, setRemoteLaserPoint] = useState(null);
  const applyingRef = useRef(false);

  // Zoom & Pan State (Section 6, Rules 7-8)
  const [zoom, setZoom] = useState({ z: 1, x: 0, y: 0 });

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

  // Prefetch next question detail via /api/admin/pyq/:id
  useEffect(() => {
    const nextQ = questions[qIndex + 1];
    if (!nextQ || !nextQ.id || nextQ.type === 'topic' || nextQ.type === 'mapping') return;
    fetch(`/api/admin/pyq/${encodeURIComponent(nextQ.id)}`).catch(() => {});
  }, [qIndex, questions]);

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
    if (isDisplayMode) return '16:9';
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

  // Mapping Layout Width Mode: 'split' (58% Map / 42% Slide), 'wide' (70% Map / 30% Slide), 'full' (100% Map)
  const [mapWidthMode, setMapWidthMode] = useState('split');
  // Interactive Card-to-Map Spotlight index (1-based displayIndex)
  const [spotlightIndex, setSpotlightIndex] = useState(null);
  // OBS Content Font Zoom Scale (1 = 100%, 1.12 = 112%, 1.24 = 124%) — leaves slide title untouched
  const [contentFontScale, setContentFontScale] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = Number(localStorage.getItem('pq_present_font_scale'));
        if (saved === 1 || saved === 1.12 || saved === 1.24) return saved;
      } catch {
        // ignore
      }
    }
    return 1;
  });

  const handleCycleFontScale = useCallback(() => {
    setContentFontScale(prev => {
      const SCALES = [1, 1.12, 1.24];
      const idx = SCALES.indexOf(prev);
      const next = SCALES[(idx + 1) % SCALES.length];
      try { localStorage.setItem('pq_present_font_scale', String(next)); } catch {}
      return next;
    });
  }, []);

  const fs = useCallback(
    (basePx) => Math.round(basePx * contentFontScale * 10) / 10,
    [contentFontScale]
  );

  const handleCycleMapWidth = useCallback(() => {
    setMapWidthMode(prev => (prev === 'split' ? 'wide' : prev === 'wide' ? 'full' : 'split'));
  }, []);

  // Reset card-to-map spotlight when step or item changes
  useEffect(() => {
    setSpotlightIndex(null);
  }, [qIndex, stepIndex]);

  // Keep long questions and slides on screen: shrink text slightly instead of scrolling.
  useAutoFit(".pq-present-q-scrollable", [currentQ, stepIndex, contentFontScale, theme, presentationMode]);
  useAutoFit(".pq-present-slide-body", [currentQ, stepIndex, contentFontScale, theme, presentationMode]);

  const isMappingMode = currentQ?.type === 'mapping';
  const isFullStageScratchpad = currentStep?.type === 'scratchpad' && currentStep?.isFullStage;
  const canvasWidth = presentationMode === 'screen' ? screenStageSize.width : 1920;
  const canvasHeight = presentationMode === 'screen' ? screenStageSize.height : 1080;
  const mapSplitRatio = mapWidthMode === 'full' ? 1.0 : mapWidthMode === 'wide' ? 0.70 : 0.58;
  const mapSplitPx169 = mapWidthMode === 'full' ? 1920 : mapWidthMode === 'wide' ? 1344 : 1114;
  const leftBoundaryX = presentationMode === 'screen'
    ? Math.round(screenStageSize.width * (isMappingMode ? mapSplitRatio : 0.48))
    : (isMappingMode ? mapSplitPx169 : 922);

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
      const last = stepStrokes[stepStrokes.length - 1];
      handleUpdateStepStrokes(stepStrokes.slice(0, -1));
      if (!applyingRef.current && linkRef.current?.status === 'connected') {
        linkRef.current.send({ t: 'del', k: `step_${currentStepKey}`, ids: [last.id] });
      }
      return;
    }
    const qStrokes = questionInkMap[currentQId] || [];
    if (qStrokes.length > 0) {
      const last = qStrokes[qStrokes.length - 1];
      handleUpdateQStrokes(qStrokes.slice(0, -1));
      if (!applyingRef.current && linkRef.current?.status === 'connected') {
        linkRef.current.send({ t: 'del', k: `q_${currentQId}`, ids: [last.id] });
      }
    }
  }, [stepInkMap, currentStepKey, questionInkMap, currentQId, handleUpdateStepStrokes, handleUpdateQStrokes]);

  const handleClearStepInk = useCallback(() => {
    handleUpdateStepStrokes([]);
    if (!applyingRef.current && linkRef.current?.status === 'connected') {
      linkRef.current.send({ t: 'clear', k: `step_${currentStepKey}` });
    }
  }, [handleUpdateStepStrokes, currentStepKey]);

  // -------------------------------------------------------------
  // Remote Presenting Data Channel Sync (Section 5 & 6)
  // -------------------------------------------------------------
  const getPagesSnapshot = useCallback(() => {
    return {
      questions: questionInkMap,
      steps: stepInkMap,
    };
  }, [questionInkMap, stepInkMap]);

  const mergePages = useCallback((incoming) => {
    if (!incoming) return;
    if (incoming.questions) {
      setQuestionInkMap((prev) => {
        const next = { ...prev };
        for (const [k, ss] of Object.entries(incoming.questions)) {
          const existing = next[k] || [];
          const existingIds = new Set(existing.map((s) => s.id));
          const toAdd = (ss || []).filter((s) => !existingIds.has(s.id));
          next[k] = [...existing, ...toAdd];
        }
        return next;
      });
    }
    if (incoming.steps) {
      setStepInkMap((prev) => {
        const next = { ...prev };
        for (const [k, ss] of Object.entries(incoming.steps)) {
          const existing = next[k] || [];
          const existingIds = new Set(existing.map((s) => s.id));
          const toAdd = (ss || []).filter((s) => !existingIds.has(s.id));
          next[k] = [...existing, ...toAdd];
        }
        return next;
      });
    }
  }, []);

  // One serialisable snapshot of the view state (section 6). Fixed key order so two
  // snapshots can be compared as strings. The think-timer is sent as on/off only:
  // each device counts down locally, otherwise the 1 s ticks would echo back and forth.
  const makeStateSnap = (s) => ({
    qIndex: s.qIndex,
    stepIndex: s.stepIndex,
    theme: s.theme,
    isBlackboard: s.isBlackboard,
    timer: s.timerSeconds === null || s.timerSeconds === undefined ? null : 'on',
    zoom: s.zoom,
    activeTool: s.activeTool,
    activeColor: s.activeColor,
    penSize: s.penSize,
    presentationMode: s.presentationMode,
    scratchpadsMap: s.scratchpadsMap,
  });

  const currentSnap = makeStateSnap({
    qIndex, stepIndex, theme, isBlackboard, timerSeconds, zoom,
    activeTool, activeColor, penSize, presentationMode, scratchpadsMap,
  });
  const currentSnapRef = useRef(currentSnap);
  currentSnapRef.current = currentSnap;
  // Signature of the last state we applied from the other device; we never re-send it.
  const lastRemoteSigRef = useRef(null);

  const handleIncomingMessage = useCallback((msg) => {
    if (!msg || !msg.t) return;
    applyingRef.current = true;

    try {
      switch (msg.t) {
        case 'hello': {
          linkRef.current?.send({ t: 'ready' });
          break;
        }

        case 'ready': {
          // Controller wins on connect: send our full state and all drawings.
          if (!isDisplayMode) {
            linkRef.current?.send({ t: 'state', ...currentSnapRef.current });
            linkRef.current?.send({
              t: 'pages',
              pages: getPagesSnapshot(),
            });
          }
          break;
        }

        case 'state': {
          const cur = currentSnapRef.current;
          const next = makeStateSnap({
            qIndex: typeof msg.qIndex === 'number' ? msg.qIndex : cur.qIndex,
            stepIndex: typeof msg.stepIndex === 'number' ? msg.stepIndex : cur.stepIndex,
            theme: msg.theme === 'light' || msg.theme === 'dark' ? msg.theme : cur.theme,
            isBlackboard: typeof msg.isBlackboard === 'boolean' ? msg.isBlackboard : cur.isBlackboard,
            timerSeconds: 'timer' in msg ? (msg.timer ? 1 : null) : (cur.timer ? 1 : null),
            zoom: msg.zoom || cur.zoom,
            activeTool: msg.activeTool || cur.activeTool,
            activeColor: msg.activeColor || cur.activeColor,
            penSize: msg.penSize || cur.penSize,
            presentationMode: msg.presentationMode || cur.presentationMode,
            scratchpadsMap: msg.scratchpadsMap || cur.scratchpadsMap,
          });
          lastRemoteSigRef.current = JSON.stringify(next);

          setQIndex(next.qIndex);
          setStepIndex(next.stepIndex);
          setTheme(next.theme);
          setIsBlackboard(next.isBlackboard);
          setTimerSeconds(prev => (next.timer ? (prev === null ? 30 : prev) : null));
          setZoom(next.zoom);
          setActiveTool(next.activeTool);
          setActiveColor(next.activeColor);
          setPenSize(next.penSize);
          setPresentationMode(next.presentationMode);
          setScratchpadsMap(next.scratchpadsMap);
          break;
        }

        case 'adds': {
          const { k, ss } = msg;
          if (Array.isArray(ss) && ss.length > 0) {
            if (k.startsWith('q_')) {
              const qId = k.slice(2);
              setQuestionInkMap((prev) => {
                const existing = prev[qId] || [];
                const existingIds = new Set(existing.map((s) => s.id));
                const newStrokes = ss.filter((s) => !existingIds.has(s.id));
                return { ...prev, [qId]: [...existing, ...newStrokes] };
              });
            } else if (k.startsWith('step_')) {
              const stepKey = k.slice(5);
              setStepInkMap((prev) => {
                const existing = prev[stepKey] || [];
                const existingIds = new Set(existing.map((s) => s.id));
                const newStrokes = ss.filter((s) => !existingIds.has(s.id));
                return { ...prev, [stepKey]: [...existing, ...newStrokes] };
              });
            }
          }
          // The finished stroke replaces the in-progress preview.
          setRemoteLiveStroke(null);
          break;
        }

        case 'del': {
          const { k, ids } = msg;
          if (Array.isArray(ids) && ids.length > 0) {
            const idSet = new Set(ids);
            if (k.startsWith('q_')) {
              const qId = k.slice(2);
              setQuestionInkMap((prev) => ({
                ...prev,
                [qId]: (prev[qId] || []).filter((s) => !idSet.has(s.id)),
              }));
            } else if (k.startsWith('step_')) {
              const stepKey = k.slice(5);
              setStepInkMap((prev) => ({
                ...prev,
                [stepKey]: (prev[stepKey] || []).filter((s) => !idSet.has(s.id)),
              }));
            }
          }
          break;
        }

        case 'clear': {
          const { k } = msg;
          if (k.startsWith('q_')) {
            const qId = k.slice(2);
            setQuestionInkMap((prev) => ({ ...prev, [qId]: [] }));
          } else if (k.startsWith('step_')) {
            const stepKey = k.slice(5);
            setStepInkMap((prev) => ({ ...prev, [stepKey]: [] }));
          }
          break;
        }

        case 'live': {
          const { k, s } = msg;
          setRemoteLiveStroke(s ? { k, stroke: s } : null);
          break;
        }

        case 'laser': {
          const { p } = msg;
          if (Array.isArray(p)) {
            setRemoteLaserPoint(p);
          }
          break;
        }

        case 'pages': {
          mergePages(msg.pages);
          break;
        }
      }
    } finally {
      setTimeout(() => {
        applyingRef.current = false;
      }, 0);
    }
  }, [isDisplayMode, getPagesSnapshot, mergePages]);

  // Always call the latest handler, but subscribe to the link only once.
  const incomingRef = useRef(handleIncomingMessage);
  incomingRef.current = handleIncomingMessage;
  const questionsRef = useRef(questions);
  questionsRef.current = questions;

  // Connect to Board (iPad side)
  const handleConnectToBoard = useCallback((code) => {
    // Already paired/pairing with this code: nothing to do.
    if (
      linkRef.current &&
      linkRef.current.code === code &&
      !linkRef.current.stopped &&
      linkRef.current.status !== 'failed'
    ) {
      return;
    }
    if (linkRef.current) {
      linkRef.current.stop();
    }
    const link = new RemoteLink('control');
    linkRef.current = link;
    setPairedCode(code);
    setLinkStatus('connecting');
    setStatusInfo('');
    setPresentationMode('16:9');

    link.watch((status, info) => {
      if (linkRef.current !== link) return;
      setLinkStatus(status);
      setStatusInfo(status === 'connected' ? '' : (info || ''));
      if (status === 'connected') {
        const qs = questionsRef.current;
        const setId = qs.map(q => q.id).filter(Boolean).join(',');
        link.send({ t: 'hello', setId, questions: qs, presenter: true });
      }
    });

    link.on((msg) => incomingRef.current(msg));

    const setId = questionsRef.current.map(q => q.id).filter(Boolean).join(',');
    link.code = code;
    link.startControl(code, setId).catch(() => {});
  }, []);

  const handleDisconnectBoard = useCallback(() => {
    if (linkRef.current) {
      linkRef.current.stop();
      linkRef.current = null;
    }
    setLinkStatus('waiting');
    setPairedCode(null);
  }, []);

  // Wire external link if on smart board display
  useEffect(() => {
    if (!externalLink) return;
    linkRef.current = externalLink;
    setLinkStatus(externalLink.status);
    setPairedCode(externalLink.code);

    const unsubWatch = externalLink.watch((st, info) => {
      setLinkStatus(st);
      setStatusInfo(st === 'connected' ? '' : (info || ''));
    });
    const unsubMsg = externalLink.on((msg) => incomingRef.current(msg));
    // Now that we are listening, ask the iPad for its state and drawings.
    // (Sending "ready" earlier could lose the reply before this view had mounted.)
    externalLink.send({ t: 'ready' });

    return () => {
      unsubWatch();
      unsubMsg();
    };
  }, [externalLink]);

  // Check URL ?board=123456 auto-connect (once)
  const autoConnectedRef = useRef(false);
  useEffect(() => {
    if (autoConnectedRef.current) return;
    if (typeof window === 'undefined' || isDisplayMode || externalLink) return;
    const sp = new URLSearchParams(window.location.search);
    const boardParam = sp.get('board');
    if (boardParam && /^\d{6}$/.test(boardParam)) {
      autoConnectedRef.current = true;
      handleConnectToBoard(boardParam);
    }
  }, [isDisplayMode, externalLink, handleConnectToBoard]);

  // Broadcast state changes when local properties update
  const currentSig = JSON.stringify(currentSnap);
  useEffect(() => {
    if (linkRef.current?.status !== 'connected') return;
    // Skip the state we just received from the other device (no echo).
    if (currentSig === lastRemoteSigRef.current) return;
    lastRemoteSigRef.current = null;
    linkRef.current.send({ t: 'state', ...JSON.parse(currentSig) });
  }, [currentSig]);

  // Remote ink action broadcasts
  const handleRemoteAddStroke = useCallback(({ targetLayer, stroke }) => {
    if (applyingRef.current) return;
    const pageKey = targetLayer === 'question' ? `q_${currentQId}` : `step_${currentStepKey}`;
    linkRef.current?.send({
      t: 'adds',
      k: pageKey,
      ss: [stroke],
    });
  }, [currentQId, currentStepKey]);

  const handleRemoteDeleteStroke = useCallback(({ targetLayer, ids }) => {
    if (applyingRef.current) return;
    const pageKey = targetLayer === 'question' ? `q_${currentQId}` : `step_${currentStepKey}`;
    linkRef.current?.send({
      t: 'del',
      k: pageKey,
      ids,
    });
  }, [currentQId, currentStepKey]);

  const handleRemoteLiveStroke = useCallback((stroke) => {
    if (applyingRef.current) return;
    const pageKey = stroke?.targetLayer === 'question' ? `q_${currentQId}` : `step_${currentStepKey}`;
    linkRef.current?.send({
      t: 'live',
      k: pageKey,
      s: stroke,
    });
  }, [currentQId, currentStepKey]);

  const handleRemoteLaserMove = useCallback((p) => {
    if (applyingRef.current) return;
    linkRef.current?.send({
      t: 'laser',
      p,
    });
  }, []);

  // Reset zoom on question change (Section 6, Rule 7)
  useEffect(() => {
    setZoom({ z: 1, x: 0, y: 0 });
  }, [qIndex]);

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
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName) ||
        e.target?.isContentEditable ||
        e.target?.closest?.('dialog, [role="dialog"], .pq-connect-dialog, input, textarea, select')
      ) {
        return;
      }

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
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8': {
          const num = Number(e.key);
          setSpotlightIndex(prev => (prev === num ? null : num));
          break;
        }
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
    <div className="pq-present-root" data-present-theme={theme} style={{ "--content-scale": contentFontScale }}>
      {/* 16:9 Scaled Viewport Container (Centered in safe zone ABOVE the floating dock) */}
      <div
        className="pq-present-stage-viewport"
        style={{
          bottom: isDockCollapsed ? '34px' : (isSmallScreen ? '62px' : '76px'),
        }}
      >
        <div
          ref={stageRef}
          className={`pq-present-stage ${presentationMode === 'screen' ? 'is-mode-screen' : 'is-mode-16-9'} ${isMappingMode ? 'is-mapping-layout' : ''} ${isMappingMode && mapWidthMode === 'wide' ? 'is-map-wide' : ''} ${isMappingMode && mapWidthMode === 'full' ? 'is-map-full' : ''} ${isFullStageScratchpad ? 'is-full-stage-scratchpad' : ''}`}
          style={presentationMode === '16:9' ? {
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          } : undefined}
        >
          {/* Zoomable View Container (Section 6, Rule 7) */}
          <div
            id="pq-present-view"
            style={
              zoom.z !== 1 || zoom.x !== 0 || zoom.y !== 0
                ? {
                    width: '100%',
                    height: '100%',
                    display: 'grid',
                    gridTemplateColumns: 'inherit',
                    gridTemplateRows: 'minmax(0, 100%)',
                    gridColumn: '1 / -1',
                    minHeight: 0,
                    transform: `scale(${zoom.z}) translate(${-zoom.x}px, ${-zoom.y}px)`,
                    transformOrigin: '0 0',
                    transition: 'transform 0.05s ease-out',
                  }
                : { width: '100%', height: '100%', display: 'grid', gridTemplateColumns: 'inherit', gridTemplateRows: 'minmax(0, 100%)', gridColumn: '1 / -1', minHeight: 0 }
            }
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
                <StudioPresenterMap
                  currentQ={currentQ}
                  currentStep={currentStep}
                  theme={theme}
                  activeTool={activeTool}
                  onSetActiveTool={setActiveTool}
                  mapWidthMode={mapWidthMode}
                  onCycleMapWidth={handleCycleMapWidth}
                  spotlightIndex={spotlightIndex}
                />
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
                        <Prose className="pq-topic-anchor-summary" title={currentQ.title} text={currentQ.cumulativeSummary || currentQ.overview || currentQ.backgroundNote || ''} />
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
          <main
            className={`pq-present-right-panel ${isMappingMode ? "is-map-right-panel" : ""} ${showWebcamBox ? "has-webcam" : ""}`}
            style={{ "--cam-h": "180px" }}
          >
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
            <SlideHead step={currentStep} />

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
              <SlideBody
                step={currentStep}
                q={currentQ}
                steps={steps}
                spotlightIndex={spotlightIndex}
                onSpotlight={(n) => setSpotlightIndex((prev) => (prev === n ? null : n))}
                isZoomedImage={isZoomedImage}
                onToggleZoom={() => setIsZoomedImage((z) => !z)}
              />
            </div>

            {/* OBS Webcam Safe Zone Visual Boundary Guide (Bottom Right) */}
            {showWebcamBox && (
              <div className="pq-present-webcam-safe-zone">
                <div className="pq-webcam-label">
                  <Camera size={18} />
                  <span>Camera area</span>
                  <small>320 × 180 · press W to hide</small>
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
          </div> {/* End #pq-present-view */}

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
            zoom={zoom}
            onZoomChange={setZoom}
            onLiveStroke={handleRemoteLiveStroke}
            remoteLiveStroke={remoteLiveStroke?.stroke}
            onLaserMove={handleRemoteLaserMove}
            remoteLaserPoint={remoteLaserPoint}
            onAddStroke={handleRemoteAddStroke}
            onDeleteStroke={handleRemoteDeleteStroke}
          />
        </div>
      </div>

      {/* ============================================================= */}
      {/* RECORDING SESSION BAR (Phase 6)                               */}
      {/* ============================================================= */}
      {initialRecordingSession && (
        <div
          role="region"
          aria-label="Recording controls"
          style={{
            position: 'fixed',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 70,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '6px 12px',
            borderRadius: 999,
            border: '1px solid rgba(239, 68, 68, 0.45)',
            background: 'rgba(15, 23, 42, 0.92)',
            color: '#f8fafc',
            fontSize: 12.5,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: recStatus === 'recording' ? '#ef4444' : '#f59e0b',
            }}
            aria-hidden="true"
          />
          <span style={{ fontWeight: 600 }}>
            {recStatus === 'recording' ? 'REC' : 'PAUSED'} · Part {initialRecordingSession.part} of {initialRecordingSession.totalParts} · Q {qIndex + 1} of {questions.length} · {String(Math.floor(recElapsedSec / 60)).padStart(2, '0')}:{String(recElapsedSec % 60).padStart(2, '0')}
          </span>
          <button
            type="button"
            className="pyq-ui-secondary-btn"
            style={{ padding: '3px 9px', fontSize: 12 }}
            onClick={() => setRecStatus((s) => (s === 'recording' ? 'paused' : 'recording'))}
          >
            {recStatus === 'recording' ? 'Pause' : 'Resume'}
          </button>
          <button
            type="button"
            className="pyq-ui-secondary-btn"
            style={{ padding: '3px 9px', fontSize: 12, borderColor: stopAfterThis ? '#f59e0b' : undefined }}
            onClick={() => setStopAfterThis((v) => !v)}
          >
            {stopAfterThis ? 'Will pause next Q' : 'Stop after Q'}
          </button>
          <button
            type="button"
            className="pyq-ui-primary-btn"
            style={{ padding: '3px 10px', fontSize: 12 }}
            onClick={handleFinishRecordingPart}
          >
            Finish part
          </button>
          <button
            type="button"
            className="pyq-ui-secondary-btn"
            style={{ padding: '3px 9px', fontSize: 12, color: '#f87171' }}
            onClick={handleDiscardRecordingPart}
          >
            Discard
          </button>
        </div>
      )}

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
        <footer className="pq-present-dock" aria-label="Presenter controls">
          <span className="pq-step-count" title={steps[stepIndex]?.title || ''}>
            {stepIndex + 1} / {steps.length}
          </span>

          <div className="pq-dock-colors" role="group" aria-label="Ink colours">
            {palette.slice(0, 3).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setActiveColor(c);
                  if (activeTool === 'none' || activeTool === 'eraser') setActiveTool('pen');
                }}
                className={`pq-color-dot ${activeColor === c ? 'is-selected' : ''}`}
                style={{ background: c, color: c }}
                aria-label={`Ink colour ${c}`}
                title={`Colour: ${c}`}
              />
            ))}
          </div>

          <Toolbar
            label="Presenter toolbar"
            primaryTools={[
              {
                id: 'prev',
                label: 'Previous step',
                shortcut: 'Left',
                icon: <ChevronLeft size={16} />,
                onClick: handlePrev,
              },
              {
                id: 'next',
                label: 'Next step',
                shortcut: 'Space / Right',
                icon: <ChevronRight size={16} />,
                onClick: handleNext,
              },
              {
                id: 'pen',
                label: 'Pen',
                shortcut: 'P',
                icon: <PenTool size={16} />,
                active: activeTool === 'pen',
                onClick: () => setActiveTool((t) => (t === 'pen' ? 'none' : 'pen')),
              },
              {
                id: 'highlighter',
                label: 'Highlighter',
                shortcut: 'H',
                icon: <Highlighter size={16} />,
                active: activeTool === 'highlighter',
                onClick: () => setActiveTool((t) => (t === 'highlighter' ? 'none' : 'highlighter')),
              },
              {
                id: 'undo',
                label: 'Undo stroke',
                shortcut: 'Cmd+Z',
                icon: <Undo2 size={16} />,
                onClick: handleUndo,
              },
            ]}
            overflowTools={[
              {
                id: 'pan',
                label: 'Pan / Cursor',
                shortcut: 'V',
                onClick: () => setActiveTool('none'),
              },
              {
                id: 'laser',
                label: activeTool === 'laser' ? 'Disable Laser' : 'Laser Pointer',
                shortcut: 'L',
                onClick: () => setActiveTool((t) => (t === 'laser' ? 'none' : 'laser')),
              },
              {
                id: 'eraser',
                label: activeTool === 'eraser' ? 'Disable Eraser' : 'Eraser',
                shortcut: 'E',
                onClick: () => setActiveTool((t) => (t === 'eraser' ? 'none' : 'eraser')),
              },
              {
                id: 'scratchpad',
                label: 'Insert Blank Scratchpad',
                shortcut: 'S',
                onClick: () => handleAddScratchpad(false),
              },
              {
                id: 'clear-ink',
                label: 'Clear Step Ink',
                shortcut: 'C',
                onClick: handleClearStepInk,
              },
              ...(currentStep?.type === 'image'
                ? [
                    {
                      id: 'zoom-image',
                      label: isZoomedImage ? 'Reset Image Zoom' : 'Zoom Image',
                      shortcut: 'Z',
                      onClick: () => setIsZoomedImage((z) => !z),
                    },
                  ]
                : []),
              {
                id: 'queue',
                label: isQueueOpen ? 'Hide Deck Queue' : 'Show Deck Queue',
                shortcut: 'Q',
                onClick: () => setIsQueueOpen((o) => !o),
              },
              {
                id: 'theme',
                label: theme === 'dark' ? 'Switch to Light / Whiteboard' : 'Switch to Dark Mode',
                shortcut: 'M',
                onClick: toggleTheme,
              },
              {
                id: 'font-scale',
                label: `Text Size (${Math.round(contentFontScale * 100)}%)`,
                onClick: handleCycleFontScale,
              },
              {
                id: 'webcam',
                label: showWebcamBox ? 'Hide Webcam Box' : 'Show Webcam Box',
                shortcut: 'W',
                onClick: () => setShowWebcamBox((w) => !w),
              },
              {
                id: 'timer',
                label: timerSeconds !== null ? 'Stop 30s Timer' : 'Start 30s Timer',
                shortcut: 'T',
                onClick: () => setTimerSeconds((s) => (s ? null : 30)),
              },
              {
                id: 'blackboard',
                label: isBlackboard ? 'Exit Blackboard' : 'Blackboard Mode',
                shortcut: 'B',
                onClick: () => setIsBlackboard((b) => !b),
              },
              {
                id: 'fullscreen',
                label: isFullscreen ? 'Exit Fullscreen' : 'Fullscreen',
                shortcut: 'F',
                onClick: toggleFullscreen,
              },
              ...(!isDisplayMode
                ? [
                    {
                      id: 'connect-board',
                      label:
                        linkStatus === 'connected'
                          ? `Smart Board (${pairedCode})`
                          : 'Connect Smart Board',
                      onClick: () => setIsConnectDialogOpen(true),
                    },
                  ]
                : [
                    {
                      id: 'exit-display',
                      label: 'Exit Display Mode',
                      onClick: () => onExitDisplay?.(),
                    },
                  ]),
              {
                id: 'mode-toggle',
                label:
                  presentationMode === 'screen'
                    ? 'Switch to 16:9 Broadcast'
                    : 'Switch to Screen Fit',
                shortcut: 'R',
                onClick: handleToggleMode,
              },
              {
                id: 'collapse-dock',
                label: 'Collapse Dock',
                shortcut: 'D',
                onClick: () => setIsDockCollapsed(true),
              },
            ]}
            shortcuts={[
              { key: 'Space / Right', description: 'Next slide step' },
              { key: 'Left', description: 'Previous slide step' },
              { key: 'P', description: 'Pen tool' },
              { key: 'H', description: 'Highlighter tool' },
              { key: 'L', description: 'Laser pointer' },
              { key: 'E', description: 'Eraser' },
              { key: 'Cmd+Z', description: 'Undo stroke' },
              { key: 'C', description: 'Clear step ink' },
              { key: 'S', description: 'Insert blank scratchpad' },
              { key: 'Q', description: 'Toggle deck queue' },
              { key: 'M', description: 'Toggle dark / light mode' },
              { key: 'F', description: 'Toggle fullscreen' },
              { key: '?', description: 'Toggle shortcuts sheet' },
            ]}
          />
        </footer>
      )}

      {/* Board Connect Dialog (Section 8) */}
      <BoardConnectDialog
        isOpen={isConnectDialogOpen}
        onClose={() => setIsConnectDialogOpen(false)}
        linkStatus={linkStatus}
        statusInfo={statusInfo}
        pairedCode={pairedCode}
        onConnect={handleConnectToBoard}
        onDisconnect={handleDisconnectBoard}
      />

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

/** Mounts the presenter only in the browser, so saved settings (theme, size) apply before the first paint. */
export default function PyqPresenterClient(props) {
  const hydrated = useSyncExternalStore(subscribeNever, () => true, () => false);
  return hydrated ? <PyqPresenterClientInner {...props} /> : null;
}
