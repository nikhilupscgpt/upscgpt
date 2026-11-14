'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback, useSyncExternalStore } from 'react';

// False during server render and hydration, true after: lets saved settings (theme, size) apply before the first paint.
const subscribeNever = () => () => {};
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  PenTool,
  Paintbrush,
  Highlighter,
  Zap,
  ArrowUpRight,
  Square,
  Type,
  Crosshair,
  Eraser,
  Undo2,
  Redo2,
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
  Monitor,
  Video,
  SlidersHorizontal,
  Wrench,
  Pause,
  Play,
  Mic,
  MicOff,
  Download,
} from 'lucide-react';
import { buildQuestionSteps, buildTopicSteps, buildMappingSteps } from '@/lib/pyqSlideDeck';
import { saveRecordingToVault } from '@/lib/recordingVaultDb';
import SlideBody, { SlideHead, Prose, useAutoFit } from './SlideBody';
import { parseStem } from '@/app/prelims/pyq/StemView';
import PyqAnnotationCanvas from './PyqAnnotationCanvas';
import StudioPresenterMap from './StudioPresenterMap';
import { Link as RemoteLink } from '@/lib/remote/link';
import BoardConnectDialog from '@/components/remote/BoardConnectDialog';
import CornerLogo from '@/components/present/CornerLogo';
import { computeQuestionScale, buildQuestionMetaLine, buildStageCounter } from '@/lib/present/transition-math';
import { matchShortcut, PRESENT_SHORTCUTS } from '@/lib/present/shortcuts';
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
}) {
  const [qIndex, setQIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWebcamBox, setShowWebcamBox] = useState(false); // OBS camera guide: off by default
  const [boardMode, setBoardMode] = useState(null); // null | 'white' | 'black'
  const isBlackboard = boardMode !== null;
  const setIsBlackboard = useCallback((valOrFn) => {
    setBoardMode((prev) => {
      const nextBool = typeof valOrFn === 'function' ? valOrFn(prev !== null) : Boolean(valOrFn);
      return nextBool ? (prev || 'black') : null;
    });
  }, []);
  const [boardInkMap, setBoardInkMap] = useState({});
  const [keptBoardsMap, setKeptBoardsMap] = useState({});
  const [questionTransform, setQuestionTransform] = useState({ offsetX: 0, offsetY: 0, scale: 1 });
  const [snapshotToast, setSnapshotToast] = useState(null);
  const [gridJumpQuery, setGridJumpQuery] = useState('');
  const inkSaveTimersRef = useRef({});
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

  // Annotation state — Select/Pointer ('none') is ALWAYS the default on open & next question (§3.1)
  const [activeTool, setActiveToolState] = useState('none');
  const [shapeTool, setShapeTool] = useState('line'); // 'line' | 'rect' | 'ellipse'
  const [clearConfirm, setClearConfirm] = useState(null); // null | 'step' | 'question'
  const toolMemoryRef = useRef({});
  const tempPrevToolRef = useRef(null);
  const redoStackRef = useRef({}); // { [qId]: { q: stroke[], step: { [key]: stroke[] } } }
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

  // Per-tool colour & size memory (§3.3)
  const setActiveTool = useCallback((updater) => {
    setActiveToolState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (prev && prev !== 'none' && prev !== 'eraser' && prev !== 'laser' && prev !== 'spotlight') {
        toolMemoryRef.current[prev] = { color: activeColor, size: penSize };
      }
      const saved = toolMemoryRef.current[next];
      if (saved) {
        if (saved.color) setActiveColor(saved.color);
        if (saved.size) setPenSize(saved.size);
      }
      return next;
    });
  }, [activeColor, penSize]);

  // Always return to Select/Pointer on next/previous question (§3.1)
  useEffect(() => {
    setActiveToolState('none');
    setClearConfirm(null);
  }, [qIndex]);

  // Think timer (30s)
  const [timerSeconds, setTimerSeconds] = useState(null);

  // Phase 4: PresenterPrefs, BrandingSettings, Timers, Recording, Toolbar Auto-Hide & Webcam Bubble
  const [prefs, setPrefs] = useState({
    defaultTool: 'select',
    rememberLastTool: false,
    recordTheme: 'light',
    countdown: true,
    pauseCue: true,
    toolbarPosition: 'bottom',
    webcamCorner: 'bottom-right',
    webcamSize: 'm',
    webcamShape: 'circle',
    fontScale: 1,
  });
  const [branding, setBranding] = useState(null);
  const [facultyName, setFacultyName] = useState('Faculty');
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  const [isCursorHidden, setIsCursorHidden] = useState(false);
  const [recStatus, setRecStatus] = useState('idle'); // 'idle' | 'countdown' | 'opening' | 'recording' | 'paused' | 'closing' | 'rehearsal'
  const [recCountdownLeft, setRecCountdownLeft] = useState(null);
  const [recElapsedSec, setRecElapsedSec] = useState(0);
  const [qElapsedSec, setQElapsedSec] = useState(0);
  const [totalElapsedSec, setTotalElapsedSec] = useState(0);
  const [stopAfterQuestion, setStopAfterQuestion] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [webcamVisible, setWebcamVisible] = useState(true);
  const [micMuted, setMicMuted] = useState(false);
  const [micAvailable, setMicAvailable] = useState('unknown'); // 'unknown' | 'active' | 'unavailable'
  const [completedDownload, setCompletedDownload] = useState(null); // { url, filename }
  const [showFacultyBanner, setShowFacultyBanner] = useState(false);
  const webcamVideoRef = useRef(null);
  const webcamStreamRef = useRef(null);
  const micStreamRef = useRef(null);
  const displayStreamRef = useRef(null);
  const preparedStreamRef = useRef(null);
  const recordingIdRef = useRef(null);
  const recElapsedRef = useRef(0);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const originalTitleRef = useRef(typeof document !== 'undefined' ? document.title : 'Lecture Studio');
  const autoHideTimerRef = useRef(null);
  const isDockHoveredRef = useRef(false);

  // Ink stroke maps:
  // 1. Question / Topic Panel persistent anchor ink: { [qId]: strokes[] }
  // 2. Step Explanation Panel ink: { [`${qId}_${stepIndex}`]: strokes[] }
  const [questionInkMap, setQuestionInkMap] = useState({});
  const [stepInkMap, setStepInkMap] = useState({});

  const stageRef = useRef(null);
  const questionBlockRef = useRef(null);
  const [questionScaleState, setQuestionScaleState] = useState({ scale: 1, shouldReflow: false, fullWidth: 0 });
  const [pauseCueEnabled, setPauseCueEnabled] = useState(true);
  const [pauseCountdownOn, setPauseCountdownOn] = useState(false);
  const [pauseCountdownLeft, setPauseCountdownLeft] = useState(null);

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
    const currentKeptBoards = keptBoardsMap[currentQ.id] || [];
    if (currentScratchpads.length === 0 && currentKeptBoards.length === 0) return baseSteps;

    const merged = [...baseSteps];
    const sorted = [...currentScratchpads].sort((a, b) => a.insertIndex - b.insertIndex);
    for (const sp of sorted) {
      const idx = Math.min(Math.max(0, sp.insertIndex), merged.length);
      merged.splice(idx, 0, sp);
    }
    for (const kb of currentKeptBoards) {
      merged.push(kb);
    }
    return merged;
  }, [currentQ, customAttachmentsMap, scratchpadsMap, keptBoardsMap]);

  const currentStep = steps[stepIndex] || steps[0] || null;

  // Active strokes for the canvas (isolated per step ID so dynamic scratchpads persist ink independently)
  const currentQId = currentQ?.id || `item_${qIndex}`;
  const currentStepKey = `${currentQId}_${currentStep?.id || stepIndex}`;
  const currentBoardKey = boardMode ? `${currentQId}_${boardMode}` : null;

  const currentQStrokes = useMemo(() => {
    return questionInkMap[currentQId] || [];
  }, [questionInkMap, currentQId]);

  const currentStepStrokes = useMemo(() => {
    return stepInkMap[currentStepKey] || [];
  }, [stepInkMap, currentStepKey]);

  const currentBoardStrokes = useMemo(() => {
    return currentBoardKey ? (boardInkMap[currentBoardKey] || []) : [];
  }, [boardInkMap, currentBoardKey]);

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
  const isFullStageScratchpad = (currentStep?.type === 'scratchpad' && currentStep?.isFullStage) || currentStep?.type === 'board';
  const isFullStageBoardOrCanvas = Boolean(isFullStageScratchpad || boardMode !== null || currentStep?.type === 'takeaway');
  const canvasWidth = presentationMode === 'screen' ? screenStageSize.width : 1920;
  const canvasHeight = presentationMode === 'screen' ? screenStageSize.height : 1080;
  const mapSplitRatio = mapWidthMode === 'full' ? 1.0 : mapWidthMode === 'wide' ? 0.70 : 0.58;
  const mapSplitPx169 = mapWidthMode === 'full' ? 1920 : mapWidthMode === 'wide' ? 1344 : 1114;
  const leftBoundaryX = (!isMappingMode && currentQ?.type !== 'topic' && currentStep?.type === 'intro')
    ? canvasWidth
    : (!isMappingMode && currentQ?.type !== 'topic' && currentStep?.type === 'takeaway')
    ? 0
    : presentationMode === 'screen'
    ? Math.round(screenStageSize.width * (isMappingMode ? mapSplitRatio : 0.45))
    : (isMappingMode ? mapSplitPx169 : 864);

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
  // 30-Second Think Timer & Optional 3s Step-1 Pause Countdown
  // -------------------------------------------------------------
  useEffect(() => {
    if (timerSeconds === null || timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds(s => (s > 1 ? s - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerSeconds]);

  useEffect(() => {
    const isStep1 = currentQ && currentQ.type !== 'topic' && currentQ.type !== 'mapping' && currentStep?.type === 'intro';
    if (!isStep1 || !pauseCountdownOn) {
      setPauseCountdownLeft(null);
      return;
    }
    setPauseCountdownLeft(3);
    const iv = setInterval(() => {
      setPauseCountdownLeft(prev => (prev !== null && prev > 1 ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(iv);
  }, [currentQ?.id, currentStep?.type, pauseCountdownOn]);

  // Measure full-width question block on Step 1 to compute CSS scale for Step 2+ (45% left)
  useEffect(() => {
    if (!currentQ || currentQ.type === 'topic' || currentQ.type === 'mapping') return;
    if (currentStep?.type !== 'intro') return;
    const el = questionBlockRef.current;
    const stageEl = stageRef.current;
    if (!el || !stageEl) return;

    const measure = () => {
      const fullWidth = el.offsetWidth || el.getBoundingClientRect().width;
      const stageWidth = stageEl.clientWidth || 1920;
      const targetLeftWidth = stageWidth * 0.45 - 88;
      const computedStyle = window.getComputedStyle(el);
      const baseFontPx = parseFloat(computedStyle.fontSize) || 34;
      const res = computeQuestionScale({ fullWidth, targetLeftWidth, baseFontPx, minFontPx: 28 });
      setQuestionScaleState({ scale: res.scale, shouldReflow: res.shouldReflow, fullWidth });
    };

    const raf = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf);
  }, [currentQ?.id, currentStep?.type, presentationMode, screenStageSize.width]);

  // Measure questionBlockRef origin + scale relative to stageRef so question-block ink stays aligned (§3.7)
  useEffect(() => {
    if (!currentQ || currentQ.type === 'topic' || currentQ.type === 'mapping') return;
    if (currentStep?.type === 'takeaway' || currentStep?.type === 'board' || boardMode) return;
    const el = questionBlockRef.current;
    const stageEl = stageRef.current;
    if (!el || !stageEl) return;

    const updateTransform = () => {
      const sr = stageEl.getBoundingClientRect();
      const qr = el.getBoundingClientRect();
      const stageScale = presentationMode === '16:9' ? (scale || 1) : 1;
      const offsetX = (qr.left - sr.left) / stageScale;
      const offsetY = (qr.top - sr.top) / stageScale;
      const isStep1 = currentStep?.type === 'intro';
      const qScale = (isStep1 || questionScaleState.shouldReflow) ? 1 : (questionScaleState.scale || 1);
      setQuestionTransform({ offsetX, offsetY, scale: qScale });
    };

    const raf = requestAnimationFrame(updateTransform);
    return () => cancelAnimationFrame(raf);
  }, [
    currentQ?.id,
    stepIndex,
    currentStep?.type,
    boardMode,
    questionScaleState,
    presentationMode,
    screenStageSize,
    scale,
  ]);

  // -------------------------------------------------------------
  // Navigation: Steps & Items
  // -------------------------------------------------------------
  const stopRecordingRef = useRef(null);
  const handleNext = useCallback(() => {
    setIsZoomedImage(false);
    if (stepIndex < steps.length - 1) {
      setStepIndex(s => s + 1);
    } else if (stopAfterQuestion && (recStatus === 'recording' || recStatus === 'paused')) {
      stopRecordingRef.current?.();
    } else if (qIndex < questions.length - 1) {
      setQIndex(q => q + 1);
      setStepIndex(0);
      setTimerSeconds(null);
    }
  }, [stepIndex, steps.length, stopAfterQuestion, recStatus, qIndex, questions.length]);

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
  // Ink management & debounced InkLayer persistence (§3.7, §6)
  // -------------------------------------------------------------
  const scheduleInkSave = useCallback((questionId, step, board, strokes) => {
    if (isDisplayMode || !questionId) return;
    const timerKey = `${questionId}_${step}_${board}`;
    if (inkSaveTimersRef.current[timerKey]) {
      clearTimeout(inkSaveTimersRef.current[timerKey]);
    }
    inkSaveTimersRef.current[timerKey] = setTimeout(() => {
      fetch('/api/admin/studio/ink', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, step, board, strokes }),
      }).catch(() => {});
    }, 600);
  }, [isDisplayMode]);

  // Restore persisted InkLayer strokes on load
  useEffect(() => {
    if (isDisplayMode || !questions.length) return;
    const ids = questions.map(q => q?.id).filter(Boolean);
    if (ids.length === 0) return;
    let cancelled = false;
    fetch(`/api/admin/studio/ink?questionIds=${encodeURIComponent(ids.join(','))}`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (cancelled || !data?.layers) return;
        const qNext = {};
        const stepNext = {};
        const boardNext = {};
        for (const layer of data.layers) {
          const strokes = Array.isArray(layer.strokes) ? layer.strokes : [];
          if (layer.board === 'white' || layer.board === 'black') {
            boardNext[`${layer.questionId}_${layer.board}`] = strokes;
          } else if (layer.step === 0) {
            qNext[layer.questionId] = strokes;
          } else if (layer.step > 0) {
            const qObj = questions.find(q => q.id === layer.questionId);
            const qSteps = qObj
              ? (qObj.type === 'topic' ? buildTopicSteps(qObj) : qObj.type === 'mapping' ? buildMappingSteps(qObj) : buildQuestionSteps(qObj))
              : [];
            const st = qSteps[layer.step - 1];
            const stepKey = `${layer.questionId}_${st?.id || (layer.step - 1)}`;
            stepNext[stepKey] = strokes;
          }
        }
        if (Object.keys(qNext).length) setQuestionInkMap(prev => ({ ...qNext, ...prev }));
        if (Object.keys(stepNext).length) setStepInkMap(prev => ({ ...stepNext, ...prev }));
        if (Object.keys(boardNext).length) setBoardInkMap(prev => ({ ...boardNext, ...prev }));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isDisplayMode, questions]);

  const handleUpdateQStrokes = useCallback((strokes) => {
    setQuestionInkMap(prev => ({
      ...prev,
      [currentQId]: strokes,
    }));
    scheduleInkSave(currentQId, 0, 'none', strokes);
  }, [currentQId, scheduleInkSave]);

  const handleUpdateStepStrokes = useCallback((strokes) => {
    setStepInkMap(prev => ({
      ...prev,
      [currentStepKey]: strokes,
    }));
    scheduleInkSave(currentQId, stepIndex + 1, 'none', strokes);
  }, [currentStepKey, currentQId, stepIndex, scheduleInkSave]);

  const handleUpdateBoardStrokes = useCallback((strokes) => {
    if (!currentBoardKey || !boardMode) return;
    setBoardInkMap(prev => ({
      ...prev,
      [currentBoardKey]: strokes,
    }));
    scheduleInkSave(currentQId, -1, boardMode, strokes);
  }, [currentBoardKey, boardMode, currentQId, scheduleInkSave]);

  const handleKeepBoard = useCallback(() => {
    if (!currentQ || !boardMode) return;
    const strokes = currentBoardStrokes;
    const newId = `board_${boardMode}_${Date.now()}`;
    const keptStep = {
      id: newId,
      type: 'board',
      board: boardMode,
      badge: boardMode === 'white' ? 'WHITE BOARD' : 'BLACK BOARD',
      title: boardMode === 'white' ? 'Kept White Board' : 'Kept Black Board',
    };
    const nextStepIdx = steps.length;
    const newStepKey = `${currentQId}_${newId}`;
    setKeptBoardsMap(prev => ({
      ...prev,
      [currentQ.id]: [...(prev[currentQ.id] || []), keptStep],
    }));
    setStepInkMap(prev => ({
      ...prev,
      [newStepKey]: strokes,
    }));
    scheduleInkSave(currentQId, nextStepIdx + 1, 'none', strokes);
    if (currentBoardKey) {
      setBoardInkMap(prev => ({ ...prev, [currentBoardKey]: [] }));
      scheduleInkSave(currentQId, -1, boardMode, []);
    }
    setBoardMode(null);
    setStepIndex(nextStepIdx);
  }, [currentQ, boardMode, currentBoardStrokes, steps.length, currentQId, currentBoardKey, scheduleInkSave]);

  const handleCaptureSnapshot = useCallback(async () => {
    if (!currentQ || typeof document === 'undefined') return;
    try {
      const off = document.createElement('canvas');
      off.width = canvasWidth;
      off.height = canvasHeight;
      const ctx = off.getContext('2d');
      if (!ctx) return;

      // Background matching active board or theme
      const bg = boardMode === 'white'
        ? '#ffffff'
        : boardMode === 'black'
        ? '#040711'
        : theme === 'light'
        ? '#ffffff'
        : '#0f172a';
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Subtle header + question text context so snapshot stands alone with ink
      ctx.fillStyle = (boardMode === 'white' || (!boardMode && theme === 'light')) ? '#0f172a' : '#f8fafc';
      ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
      const titleText = currentStep?.title || currentQ?.title || `Question ${qIndex + 1}`;
      ctx.fillText(titleText.slice(0, 90), 48, 64);

      // Composite live ink canvas on top
      const inkCanvas = stageRef.current?.querySelector('canvas[data-pq-ink-canvas="true"]');
      if (inkCanvas) {
        ctx.drawImage(inkCanvas, 0, 0, canvasWidth, canvasHeight);
      }

      const imageDataUrl = off.toDataURL('image/png');
      const res = await fetch('/api/admin/studio/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: currentQId, imageDataUrl }),
      });
      if (res.ok) {
        setSnapshotToast('Snapshot saved');
        setTimeout(() => setSnapshotToast(null), 2200);
      }
    } catch {
      // non-blocking
    }
  }, [currentQ, currentQId, currentStep?.title, qIndex, canvasWidth, canvasHeight, boardMode, theme]);

  const handleUndo = useCallback(() => {
    const pushRedo = (entry) => {
      if (!redoStackRef.current[currentQId]) redoStackRef.current[currentQId] = [];
      redoStackRef.current[currentQId].push(entry);
    };
    const stepStrokes = stepInkMap[currentStepKey] || [];
    if (stepStrokes.length > 0) {
      const last = stepStrokes[stepStrokes.length - 1];
      pushRedo({ layer: 'step', key: currentStepKey, stroke: last });
      handleUpdateStepStrokes(stepStrokes.slice(0, -1));
      if (!applyingRef.current && linkRef.current?.status === 'connected') {
        linkRef.current.send({ t: 'del', k: `step_${currentStepKey}`, ids: [last.id] });
      }
      return;
    }
    const qStrokes = questionInkMap[currentQId] || [];
    if (qStrokes.length > 0) {
      const last = qStrokes[qStrokes.length - 1];
      pushRedo({ layer: 'question', key: currentQId, stroke: last });
      handleUpdateQStrokes(qStrokes.slice(0, -1));
      if (!applyingRef.current && linkRef.current?.status === 'connected') {
        linkRef.current.send({ t: 'del', k: `q_${currentQId}`, ids: [last.id] });
      }
    }
  }, [stepInkMap, currentStepKey, questionInkMap, currentQId, handleUpdateStepStrokes, handleUpdateQStrokes]);

  const handleRedo = useCallback(() => {
    const stack = redoStackRef.current[currentQId];
    if (!stack || stack.length === 0) return;
    const entry = stack.pop();
    if (!entry) return;
    if (entry.layer === 'step') {
      setStepInkMap(prev => ({
        ...prev,
        [entry.key]: [...(prev[entry.key] || []), entry.stroke],
      }));
      if (!applyingRef.current && linkRef.current?.status === 'connected') {
        linkRef.current.send({ t: 'adds', k: `step_${entry.key}`, ss: [entry.stroke] });
      }
    } else {
      setQuestionInkMap(prev => ({
        ...prev,
        [entry.key]: [...(prev[entry.key] || []), entry.stroke],
      }));
      if (!applyingRef.current && linkRef.current?.status === 'connected') {
        linkRef.current.send({ t: 'adds', k: `q_${entry.key}`, ss: [entry.stroke] });
      }
    }
  }, [currentQId]);

  const handleClearStepInk = useCallback(() => {
    handleUpdateStepStrokes([]);
    if (!applyingRef.current && linkRef.current?.status === 'connected') {
      linkRef.current.send({ t: 'clear', k: `step_${currentStepKey}` });
    }
  }, [handleUpdateStepStrokes, currentStepKey]);

  const handleConfirmClear = useCallback(() => {
    if (clearConfirm === 'step') {
      handleClearStepInk();
    } else if (clearConfirm === 'question') {
      handleUpdateQStrokes([]);
      setStepInkMap(prev => {
        const next = { ...prev };
        for (const k of Object.keys(next)) {
          if (k.startsWith(`${currentQId}_`)) {
            delete next[k];
            if (!applyingRef.current && linkRef.current?.status === 'connected') {
              linkRef.current.send({ t: 'clear', k: `step_${k}` });
            }
          }
        }
        return next;
      });
      if (!applyingRef.current && linkRef.current?.status === 'connected') {
        linkRef.current.send({ t: 'clear', k: `q_${currentQId}` });
      }
    }
    setClearConfirm(null);
  }, [clearConfirm, handleClearStepInk, handleUpdateQStrokes, currentQId]);

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

        case 'cmd': {
          cmdHandlerRef.current?.(msg);
          break;
        }
      }
    } finally {
      setTimeout(() => {
        applyingRef.current = false;
      }, 0);
    }
  }, [isDisplayMode, getPagesSnapshot, mergePages]);

  const cmdHandlerRef = useRef(null);

  // Always call the latest handler, but subscribe to the link only once.
  const incomingRef = useRef(handleIncomingMessage);
  incomingRef.current = handleIncomingMessage;
  const questionsRef = useRef(questions);
  questionsRef.current = questions;

  // Phase 4: Load PresenterPrefs & BrandingSettings on mount
  useEffect(() => {
    if (isDisplayMode) return;
    fetch('/api/admin/studio/prefs')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.prefs) return;
        setPrefs((prev) => ({ ...prev, ...data.prefs }));
        if (typeof data.prefs.pauseCue === 'boolean') setPauseCueEnabled(data.prefs.pauseCue);
        if (data.prefs.fontScale) setContentFontScale(data.prefs.fontScale);
        if (data.facultyName) setFacultyName(data.facultyName);
      })
      .catch(() => {});

    fetch('/api/admin/studio/branding')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.branding) setBranding(data.branding);
      })
      .catch(() => {});
  }, [isDisplayMode]);

  // Phase 4: Timers (per-question + total + recording elapsed) & Tab title indicator
  useEffect(() => {
    setQElapsedSec(0);
  }, [qIndex]);

  useEffect(() => {
    if (isDisplayMode) return;
    const iv = setInterval(() => {
      setQElapsedSec((s) => s + 1);
      setTotalElapsedSec((s) => s + 1);
      if (recStatus === 'recording') {
        setRecElapsedSec((s) => s + 1);
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [isDisplayMode, recStatus]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (recStatus === 'recording') {
      const m = String(Math.floor(recElapsedSec / 60)).padStart(2, '0');
      const s = String(recElapsedSec % 60).padStart(2, '0');
      document.title = `🔴 REC ${m}:${s} | UPSCgpt Studio`;
    } else if (recStatus === 'paused') {
      const m = String(Math.floor(recElapsedSec / 60)).padStart(2, '0');
      const s = String(recElapsedSec % 60).padStart(2, '0');
      document.title = `⏸ PAUSED ${m}:${s} | UPSCgpt Studio`;
    } else {
      document.title = originalTitleRef.current || 'Lecture Studio Broadcast Mode | Admin';
    }
  }, [recStatus, recElapsedSec]);

  // Record chapter timestamp on step/question change during active recording (after opening card)
  useEffect(() => {
    if (recStatus !== 'recording' || !currentQ) return;
    const label = `Q${qIndex + 1} · ${currentStep?.title || currentQ?.title || 'Step'}`;
    setChapters((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.title === label && Math.abs(last.sec - recElapsedSec) < 2) return prev;
      return [...prev, { sec: recElapsedSec, title: label }];
    });
  }, [recStatus, qIndex, stepIndex, currentQ, currentStep?.title]);

  // Phase 4: 2s Toolbar & Cursor auto-hide (always hidden while recording unless bottom hover or '/')
  useEffect(() => {
    const isRec = recStatus === 'recording' || recStatus === 'paused' || recStatus === 'opening' || recStatus === 'closing';
    const hasOpenPanel = isToolsOpen || isPrefsOpen || showHelp || isQueueOpen;

    const scheduleHide = () => {
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
      if (hasOpenPanel || isDockHoveredRef.current) return;
      autoHideTimerRef.current = setTimeout(() => {
        if (isDockHoveredRef.current || isToolsOpen || isPrefsOpen || showHelp || isQueueOpen) return;
        setIsToolbarVisible(false);
        if (activeTool !== 'laser') {
          setIsCursorHidden(true);
        }
      }, 2000);
    };

    const resetTimers = (e) => {
      setIsCursorHidden(false);
      const nearBottom = e && typeof e.clientY === 'number' && typeof window !== 'undefined' && e.clientY >= window.innerHeight - 56;
      if (!isRec || nearBottom || isDockHoveredRef.current || hasOpenPanel) {
        setIsToolbarVisible(true);
      } else {
        setIsToolbarVisible(false);
      }
      scheduleHide();
    };

    if (hasOpenPanel || isDockHoveredRef.current) {
      setIsToolbarVisible(true);
    } else if (isRec) {
      setIsToolbarVisible(false);
    } else {
      setIsToolbarVisible(true);
      scheduleHide();
    }

    window.addEventListener('pointermove', resetTimers, { passive: true });
    window.addEventListener('pointerdown', resetTimers, { passive: true });
    return () => {
      window.removeEventListener('pointermove', resetTimers);
      window.removeEventListener('pointerdown', resetTimers);
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
    };
  }, [recStatus, activeTool, isToolsOpen, isPrefsOpen, showHelp, isQueueOpen]);

  // Phase 4: Webcam + microphone live stream when showWebcamBox is enabled
  useEffect(() => {
    if (!showWebcamBox || isDisplayMode) {
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach((t) => t.stop());
        webcamStreamRef.current = null;
      }
      setMicAvailable('unknown');
      return;
    }
    let cancelled = false;
    const attachStream = (stream) => {
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      webcamStreamRef.current = stream;
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach((t) => { t.enabled = !micMuted; });
      setMicAvailable(audioTracks.length > 0 ? 'active' : 'unavailable');
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
      }
    };
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      const videoConstraint = { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' };
      navigator.mediaDevices
        .getUserMedia({
          video: videoConstraint,
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        })
        .then(attachStream)
        .catch(() =>
          navigator.mediaDevices
            .getUserMedia({ video: videoConstraint, audio: false })
            .then(attachStream)
            .catch(() => {})
        );
    }
    return () => {
      cancelled = true;
    };
  }, [showWebcamBox, isDisplayMode]);

  const handleToggleMic = useCallback((e) => {
    e?.stopPropagation?.();
    setMicMuted((prev) => {
      const next = !prev;
      webcamStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !next; });
      micStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !next; });
      return next;
    });
  }, []);

  const handleSavePrefs = useCallback(async (nextPrefs) => {
    setPrefs(nextPrefs);
    setPauseCueEnabled(nextPrefs.pauseCue);
    setContentFontScale(nextPrefs.fontScale || 1);
    try {
      await fetch('/api/admin/studio/prefs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextPrefs),
      });
    } catch {}
  }, []);

  const handleStopRecording = useCallback(() => {
    const finishStop = () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.requestData?.();
          mediaRecorderRef.current.stop();
        } catch {}
      }
      if (displayStreamRef.current) {
        displayStreamRef.current.getTracks().forEach((t) => t.stop());
        displayStreamRef.current = null;
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }
      preparedStreamRef.current = null;
      setRecStatus('idle');
      setStopAfterQuestion(false);
      setActiveToolState('none'); // §3.1: finishing recording always returns to Select
    };

    if ((recStatus === 'recording' || recStatus === 'paused') && (branding?.closingCard !== false)) {
      const closingSec = Math.min(20, Math.max(3, branding?.closingSec || 10));
      setRecStatus('closing');
      setTimeout(finishStop, closingSec * 1000);
    } else {
      finishStop();
    }
  }, [recStatus, branding]);
  stopRecordingRef.current = handleStopRecording;

  const handleTogglePauseRecording = useCallback(() => {
    setRecStatus((prev) => {
      if (prev === 'recording') {
        try { mediaRecorderRef.current?.pause(); } catch {}
        return 'paused';
      }
      if (prev === 'paused') {
        try { mediaRecorderRef.current?.resume(); } catch {}
        return 'recording';
      }
      return prev;
    });
  }, []);

  const beginLiveRecording = useCallback(() => {
    setRecElapsedSec(0);
    recElapsedRef.current = 0;
    setChapters([]);
    setShowWebcamBox(true);
    setWebcamVisible(true);
    if (prefs.recordTheme === 'light' || prefs.recordTheme === 'dark') {
      setTheme(prefs.recordTheme);
    }

    const startActual = () => {
      setRecStatus('recording');
      if (branding?.facultyLabel !== false) {
        setShowFacultyBanner(true);
        const labelMs = Math.max(1, branding?.facultyLabelSec || 5) * 1000;
        setTimeout(() => setShowFacultyBanner(false), labelMs);
      }

      const combinedStream = preparedStreamRef.current;
      if (!combinedStream || typeof MediaRecorder === 'undefined') return;

      try {
        const mimeCandidates = [
          'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
          'video/mp4;codecs=avc1,mp4a.40.2',
          'video/mp4',
          'video/webm;codecs=vp9,opus',
          'video/webm;codecs=vp8,opus',
          'video/webm',
        ];
        const mimeType = mimeCandidates.find((m) => MediaRecorder.isTypeSupported?.(m)) || 'video/webm';
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
        const recId = `rec_${Date.now()}`;
        recordingIdRef.current = recId;
        const firstQ = questions?.[0];
        const sessionTitle =
          firstQ?.type === 'mapping'
            ? `UPSC-Mapping-${firstQ.place || 'Atlas'}`
            : `UPSC-PYQ-${firstQ?.srcSubject || 'Lecture'}`;

        recordedChunksRef.current = [];
        const mr = new MediaRecorder(combinedStream, {
          mimeType,
          videoBitsPerSecond: 1400000,
          audioBitsPerSecond: 96000,
        });
        mr.ondataavailable = async (ev) => {
          if (ev.data && ev.data.size > 0) {
            recordedChunksRef.current.push(ev.data);
            try {
              const partialBlob = new Blob(recordedChunksRef.current, { type: mimeType });
              await saveRecordingToVault({
                id: recId,
                title: sessionTitle,
                blob: partialBlob,
                mimeType,
                sizeBytes: partialBlob.size,
                durationSec: recElapsedRef.current,
                chapters: [],
                status: 'in_progress',
              });
            } catch {}
          }
        };
        mr.onstop = async () => {
          if (recordedChunksRef.current.length === 0) return;
          const blob = new Blob(recordedChunksRef.current, { type: mimeType });
          const dateStr = new Date().toISOString().slice(0, 10);
          const filename = `${sessionTitle}-${dateStr}-${Date.now()}.${ext}`;
          try {
            await saveRecordingToVault({
              id: recId,
              title: sessionTitle,
              blob,
              mimeType,
              sizeBytes: blob.size,
              durationSec: recElapsedRef.current,
              chapters: [],
              status: 'completed',
            });
          } catch {}
          const url = URL.createObjectURL(blob);
          setCompletedDownload({ url, filename });
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setSnapshotToast(`Saved ${filename}`);
          setTimeout(() => setSnapshotToast(null), 4000);
        };
        mr.start(3000);
        mediaRecorderRef.current = mr;
      } catch (err) {
        console.warn('[Studio] MediaRecorder start failed:', err);
      }
    };

    if (branding?.openingCard !== false) {
      const openSec = Math.max(1, branding?.openingSec || 3);
      setRecStatus('opening');
      setTimeout(startActual, openSec * 1000);
    } else {
      startActual();
    }
  }, [prefs.recordTheme, branding, setTheme, questions]);

  const handleStartRecording = useCallback(async () => {
    if (recStatus !== 'idle' && recStatus !== 'rehearsal') return;
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
      setSnapshotToast('Screen recording requires Chrome, Edge, or Brave');
      setTimeout(() => setSnapshotToast(null), 3500);
      return;
    }

    try {
      // Must be invoked directly inside user gesture before any countdown timer
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 24, max: 30 },
        },
        audio: false,
        preferCurrentTab: true,
        selfBrowserSurface: 'include',
      });

      const videoTrack = displayStream.getVideoTracks()[0];
      if (videoTrack && 'contentHint' in videoTrack) {
        try { videoTrack.contentHint = 'detail'; } catch {}
      }
      if (
        stageRef.current &&
        typeof window !== 'undefined' &&
        window.CropTarget &&
        typeof window.CropTarget.fromElement === 'function' &&
        typeof videoTrack?.cropTo === 'function'
      ) {
        try {
          const cropTarget = await window.CropTarget.fromElement(stageRef.current);
          await videoTrack.cropTo(cropTarget);
        } catch {}
      }
      displayStreamRef.current = displayStream;

      // Stop cleanly if user clicks browser's "Stop sharing" bar
      videoTrack?.addEventListener?.('ended', () => {
        stopRecordingRef.current?.();
      });

      let audioTracks = webcamStreamRef.current?.getAudioTracks?.() || [];
      if (audioTracks.length === 0 && navigator.mediaDevices?.getUserMedia) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
            video: false,
          });
          micStreamRef.current = micStream;
          audioTracks = micStream.getAudioTracks();
          setMicAvailable(audioTracks.length > 0 ? 'active' : 'unavailable');
        } catch {
          setMicAvailable('unavailable');
        }
      }
      audioTracks.forEach((t) => { t.enabled = !micMuted; });

      preparedStreamRef.current = new MediaStream([
        ...(videoTrack ? [videoTrack] : []),
        ...audioTracks,
      ]);
      setCompletedDownload(null);
    } catch {
      setSnapshotToast('Recording cancelled — select this tab to record');
      setTimeout(() => setSnapshotToast(null), 3000);
      return;
    }

    if (prefs.countdown) {
      setRecStatus('countdown');
      setRecCountdownLeft(3);
      let left = 3;
      const iv = setInterval(() => {
        left -= 1;
        if (left > 0) {
          setRecCountdownLeft(left);
        } else {
          clearInterval(iv);
          setRecCountdownLeft(null);
          beginLiveRecording();
        }
      }, 1000);
    } else {
      beginLiveRecording();
    }
  }, [recStatus, prefs.countdown, beginLiveRecording, micMuted]);

  const handleStartRehearsal = useCallback(() => {
    setQElapsedSec(0);
    setTotalElapsedSec(0);
    setRecStatus((prev) => (prev === 'rehearsal' ? 'idle' : 'rehearsal'));
  }, []);

  // Open Presenter View second window synced via RemoteLink (no BroadcastChannel)
  const handleOpenPresenterView = useCallback(async () => {
    if (isDisplayMode) return;
    let link = linkRef.current;
    if (!link || link.stopped || link.status === 'failed') {
      link = new RemoteLink('display');
      linkRef.current = link;
      link.watch((s, info) => {
        setLinkStatus(s);
        setStatusInfo(info || '');
      });
      link.on((msg) => incomingRef.current?.(msg));
    }
    try {
      const code = link.code || (await link.host());
      setPairedCode(code);
      if (typeof window !== 'undefined') {
        window.open(
          `/admin/studio/present/presenter-view?code=${encodeURIComponent(code)}`,
          'pq_presenter_view',
          'width=1260,height=800'
        );
      }
    } catch {}
  }, [isDisplayMode]);

  // Broadcast Presenter View metadata whenever slide/timer/recording changes
  useEffect(() => {
    if (isDisplayMode || linkStatus !== 'connected' || !linkRef.current) return;
    const nextStepObj = steps[stepIndex + 1] || null;
    linkRef.current.send({
      t: 'presenter_meta',
      payload: {
        qIndex,
        stepIndex,
        totalSteps: steps.length,
        currentStepTitle: currentStep?.title || '',
        currentStepSummary: currentStep?.summary || currentStep?.explanation || '',
        nextStepTitle: nextStepObj?.title || null,
        nextStepSummary: nextStepObj?.summary || '',
        currentQ: currentQ
          ? {
              id: currentQ.id,
              correctOption: currentQ.correctOption || currentQ.answer || '',
              explanation: currentQ.explanation || currentQ.cumulativeSummary || '',
            }
          : null,
        questions: questions.map((q, idx) => ({
          id: q.id || idx,
          label: q.title || q.place || (q.stem ? q.stem.slice(0, 56) : `Question ${idx + 1}`),
        })),
        qElapsedSec,
        totalElapsedSec,
        targetSecPerQuestion: 120,
        recStatus,
        recElapsedSec,
        stopAfterQuestion,
        chapters,
      },
    });
  }, [
    isDisplayMode,
    linkStatus,
    qIndex,
    stepIndex,
    steps,
    currentStep,
    currentQ,
    questions,
    qElapsedSec,
    totalElapsedSec,
    recStatus,
    recElapsedSec,
    stopAfterQuestion,
    chapters,
  ]);

  cmdHandlerRef.current = (msg) => {
    if (msg.action === 'next') handleNext();
    else if (msg.action === 'prev') handlePrev();
    else if (msg.action === 'jump' && typeof msg.qIndex === 'number') jumpToItem(msg.qIndex);
    else if (msg.action === 'toggle_pause') handleTogglePauseRecording();
    else if (msg.action === 'stop_after_q') setStopAfterQuestion((v) => !v);
    else if (msg.action === 'stop_rec') handleStopRecording();
  };

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
    redoStackRef.current[currentQId] = [];
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
  // Keyboard Shortcuts (Single source of truth: PRESENT_SHORTCUTS)
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

      if (isQueueOpen) {
        if (/^[0-9]$/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) {
          e.preventDefault();
          setGridJumpQuery(prev => (prev + e.key).slice(0, 3));
          return;
        }
        if (e.key === 'Backspace') {
          e.preventDefault();
          setGridJumpQuery(prev => prev.slice(0, -1));
          return;
        }
        if (e.key === 'Enter' && gridJumpQuery) {
          e.preventDefault();
          const targetIdx = Number(gridJumpQuery) - 1;
          setGridJumpQuery('');
          if (targetIdx >= 0 && targetIdx < questions.length) {
            jumpToItem(targetIdx);
          }
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setGridJumpQuery('');
          setIsQueueOpen(false);
          return;
        }
      }

      if (clearConfirm) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleConfirmClear();
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setClearConfirm(null);
          return;
        }
      }

      // Space hold = temporary Select (pan/interact); released on keyup
      if (e.key === ' ' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        if (!e.repeat && tempPrevToolRef.current === null && activeTool !== 'none') {
          tempPrevToolRef.current = activeTool;
          setActiveTool('none');
        }
        return;
      }

      // Shift hold while in Select = temporary Pen; released on keyup
      if (e.key === 'Shift' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (!e.repeat && tempPrevToolRef.current === null && activeTool === 'none') {
          tempPrevToolRef.current = 'none';
          setActiveTool('pen');
        }
        return;
      }

      const matched = matchShortcut(e);
      if (!matched) return;

      const SIZES = [3, 5, 9];
      const activePalette = theme === 'light' ? LIGHT_PALETTE : DARK_PALETTE;

      switch (matched.id) {
        case 'tool.select':
          setActiveTool('none');
          break;
        case 'tool.pen':
          setActiveTool(t => (t === 'pen' ? 'none' : 'pen'));
          break;
        case 'tool.brush':
          setActiveTool(t => (t === 'brush' ? 'none' : 'brush'));
          break;
        case 'tool.highlighter':
          setActiveTool(t => (t === 'highlighter' ? 'none' : 'highlighter'));
          break;
        case 'tool.laser':
          setActiveTool(t => (t === 'laser' ? 'none' : 'laser'));
          break;
        case 'tool.arrow':
          setActiveTool(t => (t === 'arrow' ? 'none' : 'arrow'));
          break;
        case 'tool.shape':
          setActiveTool(curr => {
            if (curr === 'line' || curr === 'rect' || curr === 'ellipse') {
              const order = ['line', 'rect', 'ellipse'];
              const nextShape = order[(order.indexOf(curr) + 1) % order.length];
              setShapeTool(nextShape);
              return nextShape;
            }
            return shapeTool;
          });
          break;
        case 'tool.text':
          setActiveTool(t => (t === 'text' ? 'none' : 'text'));
          break;
        case 'tool.eraser':
          setActiveTool(t => (t === 'eraser' ? 'none' : 'eraser'));
          break;
        case 'tool.spotlight':
          setActiveTool(t => (t === 'spotlight' ? 'none' : 'spotlight'));
          break;
        case 'tool.zoomHold':
          if (!e.repeat) {
            setZoom(prev => (prev.z === 2 ? prev : { z: 2, x: 480, y: 270 }));
          }
          break;
        case 'color.1':
        case 'color.2':
        case 'color.3':
        case 'color.4':
        case 'color.5': {
          const idx = Number(matched.id.split('.')[1]) - 1;
          const color = activePalette[idx];
          if (color) {
            setActiveColor(color);
            if (activeTool === 'none' || activeTool === 'eraser') {
              setActiveTool('pen');
            }
          }
          break;
        }
        case 'size.down':
          setPenSize(curr => {
            const idx = SIZES.indexOf(curr);
            const prev = idx > 0 ? SIZES[idx - 1] : SIZES[0];
            try { localStorage.setItem('pq_present_pen_size', String(prev)); } catch {}
            return prev;
          });
          break;
        case 'size.up':
          setPenSize(curr => {
            const idx = SIZES.indexOf(curr);
            const next = idx !== -1 && idx < SIZES.length - 1 ? SIZES[idx + 1] : SIZES[SIZES.length - 1];
            try { localStorage.setItem('pq_present_pen_size', String(next)); } catch {}
            return next;
          });
          break;
        case 'edit.undo':
          e.preventDefault();
          handleUndo();
          break;
        case 'edit.redo':
          e.preventDefault();
          handleRedo();
          break;
        case 'edit.snapshot':
          e.preventDefault();
          handleCaptureSnapshot();
          break;
        case 'edit.clearStep':
          setClearConfirm('step');
          break;
        case 'edit.clearQuestion':
          setClearConfirm('question');
          break;
        case 'nav.nextStep':
        case 'nav.nextStepEnter':
        case 'nav.nextStepPgDn':
          e.preventDefault();
          handleNext();
          break;
        case 'nav.prevStep':
        case 'nav.prevStepPgUp':
          e.preventDefault();
          handlePrev();
          break;
        case 'nav.nextQuestion':
          e.preventDefault();
          jumpToItem(Math.min(questions.length - 1, qIndex + 1));
          break;
        case 'nav.prevQuestion':
          e.preventDefault();
          jumpToItem(Math.max(0, qIndex - 1));
          break;
        case 'nav.firstStep':
          e.preventDefault();
          setStepIndex(0);
          break;
        case 'nav.lastStep':
          e.preventDefault();
          setStepIndex(Math.max(0, steps.length - 1));
          break;
        case 'nav.grid':
          setGridJumpQuery('');
          setIsQueueOpen(o => !o);
          break;
        case 'board.white':
          setBoardMode(m => (m === 'white' ? null : 'white'));
          break;
        case 'board.black':
          setBoardMode(m => (m === 'black' ? null : 'black'));
          break;
        case 'view.theme':
          if (recStatus === 'recording' || recStatus === 'paused') {
            setWebcamVisible((v) => !v);
          } else {
            toggleTheme();
          }
          break;
        case 'view.fullscreen':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'view.presenterView':
          e.preventDefault();
          handleOpenPresenterView();
          break;
        case 'view.toolbarReveal':
          e.preventDefault();
          setIsToolbarVisible(true);
          break;
        case 'rec.togglePause':
          e.preventDefault();
          handleTogglePauseRecording();
          break;
        case 'view.help':
          setShowHelp(h => !h);
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === ' ' && tempPrevToolRef.current !== null) {
        setActiveTool(tempPrevToolRef.current);
        tempPrevToolRef.current = null;
      } else if (e.key === 'Shift' && tempPrevToolRef.current === 'none') {
        setActiveTool('none');
        tempPrevToolRef.current = null;
      } else if (e.key.toLowerCase() === 'z' && !e.metaKey && !e.ctrlKey) {
        setZoom(prev => (prev.z === 1 ? prev : { z: 1, x: 0, y: 0 }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    activeTool,
    shapeTool,
    theme,
    clearConfirm,
    isQueueOpen,
    gridJumpQuery,
    qIndex,
    questions.length,
    steps.length,
    handleNext,
    handlePrev,
    jumpToItem,
    handleUndo,
    handleRedo,
    handleCaptureSnapshot,
    handleConfirmClear,
    handleOpenPresenterView,
    handleTogglePauseRecording,
    recStatus,
    toggleTheme,
    setActiveTool,
  ]);

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
  const isPyqMode = !isMappingMode && !isTopicMode;
  const isStep1FullWidth = isPyqMode && currentStep?.type === 'intro';
  const isTakeawayFullWidth = isPyqMode && currentStep?.type === 'takeaway';
  const isPyqSplit = isPyqMode && !isStep1FullWidth && !isTakeawayFullWidth && !isFullStageScratchpad;
  const stemBlocks = (isTopicMode || (isMappingMode && !currentQ.stem)) ? [] : parseStem(currentQ.stem);
  const options = Array.isArray(currentQ.options) ? currentQ.options : [];
  const palette = theme === 'light' ? LIGHT_PALETTE : DARK_PALETTE;
  const metaLineText = buildQuestionMetaLine(currentQ, isTopicMode);
  const stageCounterText = buildStageCounter(qIndex, questions.length, stepIndex, steps.length);

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
          className={`pq-present-stage ${presentationMode === 'screen' ? 'is-mode-screen' : 'is-mode-16-9'} ${isMappingMode ? 'is-mapping-layout' : ''} ${isMappingMode && mapWidthMode === 'wide' ? 'is-map-wide' : ''} ${isMappingMode && mapWidthMode === 'full' ? 'is-map-full' : ''} ${isFullStageScratchpad ? 'is-full-stage-scratchpad' : ''} ${isStep1FullWidth ? 'is-step1-full' : ''} ${isTakeawayFullWidth ? 'is-takeaway-full' : ''} ${isPyqSplit ? 'is-pyq-split' : ''}`}
          style={{
            ...(presentationMode === '16:9' ? {
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
            } : {}),
            ...(isCursorHidden && activeTool !== 'laser' ? { cursor: 'none' } : {}),
          }}
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
          {/* Corner Logo (§2.7, top-right, every step, reserved corner; never removable by Faculty) */}
          <CornerLogo theme={theme} branding={branding} />

          {/* Subtle stage watermark (above opaque slide panels at zIndex 45, below ink canvas at 50) */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 45,
              pointerEvents: 'none',
              userSelect: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                transform: 'rotate(-18deg)',
                fontSize: 'clamp(42px, 6vw, 84px)',
                fontWeight: 900,
                letterSpacing: '0.08em',
                color: theme === 'dark' ? 'rgba(248, 250, 252, 0.07)' : 'rgba(15, 23, 42, 0.06)',
                whiteSpace: 'nowrap',
              }}
            >
              upscgpt+ · upscgpt.in
            </div>
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
          {!isTakeawayFullWidth && (
          <aside className={`pq-present-left-panel ${isMappingMode ? 'is-map-panel' : ''} ${isStep1FullWidth ? 'is-full-width-question' : ''}`}>
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
                  {/* Single quiet metadata line (§2.4) */}
                  {metaLineText && (
                    <div className="pq-present-q-meta-line">{metaLineText}</div>
                  )}

                  {/* Scrollable / Scaled Anchor Content */}
                  <div className={`pq-present-q-scrollable ${isPyqSplit && !questionScaleState.shouldReflow ? 'is-scaled-block' : ''} ${isPyqSplit && questionScaleState.shouldReflow ? 'is-reflowed-min' : ''}`}>
                    {isTopicMode ? (
                      /* TOPIC MODE ANCHOR */
                      <div className="pq-present-anchor-topic">
                        <h2 className="pq-topic-anchor-title">{currentQ.title}</h2>
                        <Prose className="pq-topic-anchor-summary" title={currentQ.title} text={currentQ.cumulativeSummary || currentQ.overview || currentQ.backgroundNote || ''} />
                      </div>
                    ) : (
                      /* PYQ MODE ANCHOR (Measured on Step 1, CSS-scaled on Step 2+ for identical line breaks) */
                      <div
                        ref={questionBlockRef}
                        className="pq-question-scale-inner"
                        style={
                          isPyqSplit && !questionScaleState.shouldReflow && questionScaleState.fullWidth > 0
                            ? {
                                width: `${questionScaleState.fullWidth}px`,
                                transform: `scale(${questionScaleState.scale})`,
                                transformOrigin: 'top left',
                              }
                            : undefined
                        }
                      >
                        {stemBlocks.map((b, idx) => {
                          if (b.type === 'stmts') {
                            return (
                              <div className="pq-present-statements" key={idx}>
                                {b.items.map((s, k) => {
                                  const keyUpper = String(s.key).trim().toUpperCase();
                                  const isDiscussing = Array.isArray(currentStep?.activeStatements) && currentStep.activeStatements.includes(keyUpper);
                                  const verdict = currentStep?.verdicts?.[keyUpper];
                                  const isCorrect = verdict && verdict.toLowerCase().includes('correct') && !verdict.toLowerCase().includes('incorrect');
                                  const isIncorrect = verdict && verdict.toLowerCase().includes('incorrect');

                                  return (
                                    <div className={`pq-present-statement-item ${verdict ? 'has-verdict' : ''} ${isDiscussing ? 'is-discussing' : ''}`} key={k}>
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
                            const isDiscussing = Array.isArray(currentStep?.activeOptions) && currentStep.activeOptions.includes(optLabel);

                            return (
                              <div
                                key={opt.label}
                                className={`pq-present-option-row ${isTarget ? 'is-highlighted is-answer-revealed' : ''} ${isDiscussing ? 'is-discussing' : ''}`}
                              >
                                <span className="pq-present-opt-label">{optLabel}</span>
                                <span className="pq-present-opt-text">{opt.text}</span>
                                {isTarget && (
                                  <span className="pq-present-opt-tick" aria-label="Correct option">
                                    <CheckCircle2 size={20} />
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 1 Quiet "Pause and try" cue + optional 3s countdown */}
                  {isStep1FullWidth && pauseCueEnabled && (
                    <div className="pq-pause-try-cue">
                      <span>Pause and try</span>
                      <button
                        type="button"
                        onClick={() => setPauseCountdownOn(v => !v)}
                        className={`pq-pause-countdown-btn ${pauseCountdownOn ? 'is-active' : ''}`}
                        title="Toggle 3-second countdown"
                      >
                        {pauseCountdownLeft !== null ? `${pauseCountdownLeft}s` : (pauseCountdownOn ? '3s on' : '3s timer')}
                      </button>
                    </div>
                  )}
                </div>

                {/* Single Stage Counter (§2.4) */}
                <div className="pq-present-left-footer">
                  <span>{stageCounterText}</span>
                </div>
              </>
            )}
          </aside>
          )}

          {/* ========================================================= */}
          {/* RIGHT PANEL: DYNAMIC EXPLANATION / TOPIC SLIDES (55%)     */}
          {/* Hidden on Step 1 full-width; Full width on Takeaway step  */}
          {/* ========================================================= */}
          {!isStep1FullWidth && (
          <main
            className={`pq-present-right-panel ${isMappingMode ? "is-map-right-panel" : ""} ${isTakeawayFullWidth ? "is-takeaway-panel" : ""} ${showWebcamBox ? "has-webcam" : ""}`}
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
          )}

          {/* White / Black Board Mode Overlay (W / K) or Kept Board Step */}
          {(boardMode || currentStep?.type === 'board') && (
            <div
              className="pq-present-board-overlay"
              style={{
                position: 'absolute',
                inset: 0,
                background: (boardMode || currentStep?.board) === 'white' ? '#ffffff' : '#040711',
                zIndex: 45,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ fontSize: 13, color: (boardMode || currentStep?.board) === 'white' ? 'rgba(0, 0, 0, 0.32)' : 'rgba(255, 255, 255, 0.25)', fontWeight: 800, letterSpacing: '0.1em' }}>
                {(boardMode || currentStep?.board) === 'white'
                  ? 'WHITE BOARD · DRAW FREELY · PRESS W TO RETURN'
                  : 'BLACK BOARD · DRAW FREELY · PRESS K TO RETURN'}
              </div>
              {boardMode && currentBoardStrokes.length > 0 && (
                <button
                  type="button"
                  onClick={handleKeepBoard}
                  style={{
                    position: 'absolute',
                    top: 24,
                    left: 24,
                    zIndex: 55,
                    padding: '8px 14px',
                    borderRadius: 10,
                    border: '1px solid rgba(56, 189, 248, 0.5)',
                    background: boardMode === 'white' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(30, 41, 59, 0.92)',
                    color: '#f8fafc',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Keep board
                </button>
              )}
            </div>
          )}

          {/* Question Grid Overlay (Q) — click or type number + Enter to jump */}
          {isQueueOpen && (
            <div className="pq-present-queue-drawer" style={{ width: 'min(920px, 92%)', left: '50%', right: 'auto', transform: 'translateX(-50%)' }}>
              <div className="pq-queue-header">
                <div className="pq-queue-title">
                  <ListOrdered size={20} color="#38bdf8" />
                  <span>Question Grid ({questions.length})</span>
                  {gridJumpQuery && (
                    <span style={{ marginLeft: 10, padding: '2px 10px', borderRadius: 999, background: 'rgba(56,189,248,0.18)', color: '#38bdf8', fontSize: 12, fontWeight: 800 }}>
                      Jump to #{gridJumpQuery} [Enter]
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => { setGridJumpQuery(''); setIsQueueOpen(false); }}
                  className="pq-queue-close-btn"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="pq-queue-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                {questions.map((item, idx) => {
                  const isActive = idx === qIndex;
                  const hasInk = (questionInkMap[item.id]?.length || 0) > 0;
                  const isMatchedJump = gridJumpQuery && String(idx + 1).startsWith(gridJumpQuery);
                  const itemTitle = item.type === 'topic'
                    ? item.title
                    : item.type === 'mapping'
                    ? (item.place || item.title)
                    : (item.stem ? item.stem.substring(0, 90) + '...' : `Question ${idx + 1}`);

                  return (
                    <div
                      key={item.id || idx}
                      className={`pq-queue-item ${isActive ? 'is-active-item' : ''}`}
                      style={isMatchedJump ? { outline: '2px solid #38bdf8' } : undefined}
                      onClick={() => jumpToItem(idx)}
                    >
                      <span className="pq-queue-item-num">{idx + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', color: item.type === 'mapping' ? '#34d399' : '#38bdf8' }}>
                            {item.type === 'topic' ? (item.domain || 'Topic') : item.type === 'mapping' ? (item.regionScope || 'Mapping') : `${item.examName || 'CSE'} ${item.examYear || ''}`}
                          </span>
                          {hasInk && (
                            <span style={{ fontSize: 10, color: '#a78bfa', fontWeight: 800 }}>• Ink</span>
                          )}
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
            isFullStage={isFullStageBoardOrCanvas}
            questionTransform={questionTransform}
            showQuestionInk={Boolean(!boardMode && currentQ?.type !== 'topic' && currentQ?.type !== 'mapping' && currentStep?.type !== 'takeaway' && currentStep?.type !== 'board' && !isFullStageScratchpad)}
            questionStrokes={currentQStrokes}
            stepStrokes={boardMode ? currentBoardStrokes : currentStepStrokes}
            onUpdateQuestionStrokes={handleUpdateQStrokes}
            onUpdateStepStrokes={boardMode ? handleUpdateBoardStrokes : handleUpdateStepStrokes}
            zoom={zoom}
            onZoomChange={setZoom}
            onLiveStroke={handleRemoteLiveStroke}
            remoteLiveStroke={remoteLiveStroke?.stroke}
            onLaserMove={handleRemoteLaserMove}
            remoteLaserPoint={remoteLaserPoint}
            onAddStroke={handleRemoteAddStroke}
            onDeleteStroke={handleRemoteDeleteStroke}
          />

          {/* On-stage clear ink confirmation (never browser confirm()) */}
          {clearConfirm && (
            <div
              role="alertdialog"
              aria-label="Confirm clear ink"
              style={{
                position: 'absolute',
                top: 24,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 60,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 16px',
                borderRadius: 12,
                background: theme === 'light' ? 'rgba(255,255,255,0.96)' : 'rgba(15,23,42,0.96)',
                border: '1px solid rgba(239,68,68,0.45)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
                color: theme === 'light' ? '#0f172a' : '#f8fafc',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <span>
                {clearConfirm === 'question'
                  ? 'Clear all ink on this question?'
                  : 'Clear ink on this step?'}
              </span>
              <button
                type="button"
                onClick={handleConfirmClear}
                style={{
                  padding: '5px 12px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Clear [Enter]
              </button>
              <button
                type="button"
                onClick={() => setClearConfirm(null)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(148,163,184,0.35)',
                  background: 'transparent',
                  color: 'inherit',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel [Esc]
              </button>
            </div>
          )}

          {snapshotToast && (
            <div
              role="status"
              style={{
                position: 'absolute',
                top: 24,
                right: 24,
                zIndex: 60,
                padding: '8px 14px',
                borderRadius: 10,
                background: 'rgba(16, 185, 129, 0.92)',
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 700,
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              }}
            >
              {snapshotToast}
            </div>
          )}

          {completedDownload && (
            <div
              style={{
                position: 'absolute',
                top: 24,
                left: 28,
                zIndex: 62,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 14px',
                borderRadius: 12,
                background: 'rgba(15, 23, 42, 0.92)',
                color: '#f8fafc',
                border: '1px solid rgba(56, 189, 248, 0.45)',
                boxShadow: '0 10px 28px rgba(0,0,0,0.35)',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <a
                href={completedDownload.url}
                download={completedDownload.filename}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  color: '#38bdf8',
                  textDecoration: 'none',
                  fontWeight: 700,
                }}
              >
                <Download size={15} />
                <span>Download {completedDownload.filename}</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(completedDownload.url);
                  setCompletedDownload(null);
                }}
                aria-label="Dismiss recording download"
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex' }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Webcam Bubble rendered inside the stage (circle or rectangle, clickable corner cycle, 3 sizes, M to hide, mic & shape toggles) */}
          {showWebcamBox && webcamVisible && (() => {
            const bubblePx = prefs.webcamSize === 's' ? 168 : prefs.webcamSize === 'l' ? 300 : 230;
            const isRect = prefs.webcamShape === 'rect';
            const boxWidth = isRect ? Math.round(bubblePx * 1.38) : bubblePx;
            const boxHeight = bubblePx;
            return (
              <div
                onClick={() => {
                  const order = ['bottom-right', 'bottom-left', 'top-left', 'top-right'];
                  const nextCorner = order[(order.indexOf(prefs.webcamCorner) + 1) % order.length];
                  handleSavePrefs({ ...prefs, webcamCorner: nextCorner });
                }}
                title="Click to move corner · Press M while recording to hide"
                style={{
                  position: 'absolute',
                  zIndex: 55,
                  width: boxWidth,
                  height: boxHeight,
                  ...(prefs.webcamCorner === 'top-left' ? { top: 28, left: 28 } :
                     prefs.webcamCorner === 'top-right' ? { top: 88, right: 28 } :
                     prefs.webcamCorner === 'bottom-left' ? { bottom: 36, left: 28 } :
                     { bottom: 36, right: 28 }),
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: isRect ? 16 : '50%',
                    overflow: 'hidden',
                    border: '3px solid rgba(56, 189, 248, 0.8)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
                    background: '#0f172a',
                  }}
                >
                  <video
                    ref={webcamVideoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSavePrefs({ ...prefs, webcamShape: isRect ? 'circle' : 'rect' });
                  }}
                  title={isRect ? 'Switch to round camera' : 'Switch to rectangular camera'}
                  style={{
                    position: 'absolute',
                    bottom: 6,
                    right: 46,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.85)',
                    background: 'rgba(15, 23, 42, 0.88)',
                    color: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
                  }}
                >
                  <Square size={13} />
                </button>
                <button
                  type="button"
                  onClick={handleToggleMic}
                  title={
                    micAvailable === 'unavailable'
                      ? 'Microphone unavailable or blocked'
                      : micMuted
                        ? 'Microphone muted (click to unmute)'
                        : 'Microphone live (click to mute)'
                  }
                  style={{
                    position: 'absolute',
                    bottom: 6,
                    right: 6,
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.85)',
                    background:
                      micAvailable === 'unavailable'
                        ? '#64748b'
                        : micMuted
                          ? '#dc2626'
                          : '#059669',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
                  }}
                >
                  {micMuted || micAvailable === 'unavailable' ? <MicOff size={15} /> : <Mic size={15} />}
                </button>
              </div>
            );
          })()}

          {/* Faculty name label for first 5s of recording */}
          {showFacultyBanner && (
            <div
              style={{
                position: 'absolute',
                bottom: 42,
                left: 36,
                zIndex: 54,
                padding: '6px 14px',
                borderRadius: 999,
                background: 'rgba(15, 23, 42, 0.78)',
                color: '#f8fafc',
                fontSize: 13,
                fontWeight: 700,
                transition: 'opacity 0.5s ease',
              }}
            >
              Prof. {facultyName} · upscgpt+
            </div>
          )}

          {/* 3-2-1 Countdown Overlay */}
          {recStatus === 'countdown' && recCountdownLeft !== null && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 75,
                background: 'rgba(2, 6, 23, 0.72)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 120,
                fontWeight: 900,
                color: '#f8fafc',
              }}
            >
              {recCountdownLeft}
            </div>
          )}

          {/* Opening & Closing Cards (rendered into recording; excluded from chapters) */}
          {(recStatus === 'opening' || recStatus === 'closing') && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 72,
                background: theme === 'light' ? '#ffffff' : '#090d16',
                color: theme === 'light' ? '#0f172a' : '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                textAlign: 'center',
                padding: 48,
              }}
            >
              <div style={{ fontSize: 38, fontWeight: 900, letterSpacing: '-0.02em' }}>
                upscgpt<span style={{ color: '#38bdf8' }}>+</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, maxWidth: 820 }}>
                {recStatus === 'opening'
                  ? (currentQ?.topic || currentQ?.examName || 'UPSC Prelims PYQ Discussion')
                  : (branding?.closingText || 'Practise all PYQs free at upscgpt.in')}
              </div>
            </div>
          )}
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
        <footer
          className="pq-present-dock"
          data-dock-pos={prefs.toolbarPosition}
          onPointerEnter={() => {
            isDockHoveredRef.current = true;
            setIsToolbarVisible(true);
            if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
          }}
          onPointerLeave={() => {
            isDockHoveredRef.current = false;
          }}
          style={{
            opacity: isToolbarVisible ? 1 : 0,
            pointerEvents: isToolbarVisible ? 'auto' : 'none',
            transition: 'opacity 0.2s ease',
            overflow: 'visible',
            ...(prefs.toolbarPosition === 'left'
              ? { left: 18, right: 'auto', bottom: '50%', transform: 'translateY(50%)', flexDirection: 'column' }
              : prefs.toolbarPosition === 'right'
              ? { right: 18, left: 'auto', bottom: '50%', transform: 'translateY(50%)', flexDirection: 'column' }
              : {}),
          }}
        >
          {/* Deck Navigator */}
          <button
            type="button"
            onClick={handlePrev}
            className="pq-dock-btn"
            title="Previous Step [Left Arrow]"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Step Indicator Dots (no duplicate X / Y counter) */}
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
            title="Next Step [Right Arrow / Enter]"
          >
            <ChevronRight size={18} />
          </button>

          <div className="pq-dock-sep" />

          {/* Max 6 visible controls (§5.2): Select, Pen, Brush, Highlighter, Laser, Colours + Tools */}
          <button
            type="button"
            onClick={() => setActiveTool('none')}
            className={`pq-dock-btn ${activeTool === 'none' ? 'is-active' : ''}`}
            title="Select / Pointer [V]"
          >
            <Move size={16} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTool(t => (t === 'pen' ? 'none' : 'pen'))}
            className={`pq-dock-btn ${activeTool === 'pen' ? 'is-active' : ''}`}
            title="Pen Tool [P] (smooth fine line)"
          >
            <PenTool size={16} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTool(t => (t === 'brush' ? 'none' : 'brush'))}
            className={`pq-dock-btn ${activeTool === 'brush' ? 'is-active' : ''}`}
            title="Brush Pen [B] (variable width)"
          >
            <Paintbrush size={16} />
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

          {/* Tools Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsToolsOpen(o => !o)}
            className={`pq-dock-btn ${isToolsOpen ? 'is-active' : ''}`}
            style={{ width: 'auto', padding: '0 10px', gap: 5, fontSize: 12, fontWeight: 700 }}
            title="More Tools, Presenter View & Recording"
          >
            <Wrench size={14} />
            <span>Tools</span>
          </button>

          {/* Secondary Tools Popover */}
          {isToolsOpen && (
            <div
              style={{
                position: 'absolute',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 6,
                padding: '10px 12px',
                borderRadius: 14,
                background: theme === 'light' ? 'rgba(255,255,255,0.98)' : 'rgba(15,23,42,0.98)',
                border: '1px solid rgba(148,163,184,0.3)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
                zIndex: 10000,
                ...(prefs.toolbarPosition === 'left'
                  ? { left: 'calc(100% + 12px)', top: '50%', transform: 'translateY(-50%)', width: 'min(420px, 72vw)' }
                  : prefs.toolbarPosition === 'right'
                  ? { right: 'calc(100% + 12px)', top: '50%', transform: 'translateY(-50%)', width: 'min(420px, 72vw)' }
                  : { bottom: 'calc(100% + 12px)', left: '50%', transform: 'translateX(-50%)', width: 'min(760px, 92vw)' }),
              }}
            >

          <button
            type="button"
            onClick={() => setActiveTool(t => (t === 'arrow' ? 'none' : 'arrow'))}
            className={`pq-dock-btn ${activeTool === 'arrow' ? 'is-active' : ''}`}
            title="Arrow [A] (Shift = 15° snap)"
          >
            <ArrowUpRight size={16} />
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTool(curr => {
                if (curr === 'line' || curr === 'rect' || curr === 'ellipse') {
                  const order = ['line', 'rect', 'ellipse'];
                  const nextShape = order[(order.indexOf(curr) + 1) % order.length];
                  setShapeTool(nextShape);
                  return nextShape;
                }
                return shapeTool;
              });
            }}
            className={`pq-dock-btn ${['line', 'rect', 'ellipse'].includes(activeTool) ? 'is-active' : ''}`}
            title={`Shape (${shapeTool}) [G to cycle]`}
          >
            <Square size={16} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTool(t => (t === 'text' ? 'none' : 'text'))}
            className={`pq-dock-btn ${activeTool === 'text' ? 'is-active' : ''}`}
            title="Text Label [T]"
          >
            <Type size={16} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTool(t => (t === 'eraser' ? 'none' : 'eraser'))}
            className={`pq-dock-btn ${activeTool === 'eraser' ? 'is-active' : ''}`}
            title="Eraser [E] (Alt = area erase)"
          >
            <Eraser size={16} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTool(t => (t === 'spotlight' ? 'none' : 'spotlight'))}
            className={`pq-dock-btn ${activeTool === 'spotlight' ? 'is-active' : ''}`}
            title="Spotlight [S]"
          >
            <Crosshair size={16} />
          </button>

          <button
            type="button"
            onClick={() => handleAddScratchpad(false)}
            className="pq-dock-btn pq-dock-scratchpad-btn"
            title="Insert Blank Scratchpad Slide"
          >
            <FilePlus2 size={16} />
          </button>

          <div className="pq-dock-sep" />

          {/* Pen Thickness Selector (3 sizes) */}
          <div className="pq-dock-sizes" title="Pen Thickness: 3px, 5px, 9px ([ and ] keys)">
            {[
              { size: 3, label: 'Fine (3px)', dot: 4 },
              { size: 5, label: 'Regular (5px)', dot: 7 },
              { size: 9, label: 'Bold (9px)', dot: 11 },
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

          {/* Undo, Redo & Clear */}
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
            onClick={handleRedo}
            className="pq-dock-btn"
            title="Redo Stroke [Cmd+Shift+Z]"
          >
            <Redo2 size={16} />
          </button>

          <button
            type="button"
            onClick={() => setClearConfirm('step')}
            className="pq-dock-btn"
            title="Clear Step Ink [C] / Question [Shift+C]"
          >
            <Trash2 size={16} />
          </button>

          <button
            type="button"
            onClick={handleCaptureSnapshot}
            className="pq-dock-btn"
            title={snapshotToast || 'Save Stage Snapshot [Cmd+S]'}
          >
            <ImageIcon size={16} />
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

          {/* Content Font Zoom (100% / 112% / 124%) for OBS Readability */}
          <button
            type="button"
            onClick={handleCycleFontScale}
            className={`pq-dock-btn ${contentFontScale > 1 ? 'is-active' : ''}`}
            style={{ width: 'auto', padding: '0 9px', fontSize: 11.5, fontWeight: 800, gap: 4 }}
            title="Cycle Content Text Size for OBS (100% → 112% → 124% — keeps slide title fixed)"
          >
            <span>A+</span>
            <span style={{ fontSize: 10, opacity: 0.85 }}>{Math.round(contentFontScale * 100)}%</span>
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
            onClick={() => setBoardMode(m => (m === 'black' ? null : 'black'))}
            className={`pq-dock-btn ${isBlackboard ? 'is-active' : ''}`}
            title="White Board [W] / Black Board [K]"
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

          {/* Smart Board Connect (iPad / Controller) */}
          {!isDisplayMode && (
            <button
              type="button"
              onClick={() => setIsConnectDialogOpen(true)}
              className={`pq-dock-btn ${linkStatus === 'connected' ? 'is-active' : ''}`}
              title={
                linkStatus === 'connected'
                  ? `Connected to Smart Board (${pairedCode})`
                  : linkStatus === 'connecting'
                  ? 'Connecting to Smart Board...'
                  : 'Connect to Smart Board'
              }
              style={{ position: 'relative' }}
            >
              <Cast size={16} />
              <span
                style={{
                  position: 'absolute',
                  top: 5,
                  right: 5,
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor:
                    linkStatus === 'connected'
                      ? '#22c55e'
                      : linkStatus === 'connecting'
                      ? '#f59e0b'
                      : '#64748b',
                  boxShadow:
                    linkStatus === 'connected'
                      ? '0 0 6px #22c55e'
                      : linkStatus === 'connecting'
                      ? '0 0 6px #f59e0b'
                      : 'none',
                }}
              />
            </button>
          )}

          {isDisplayMode && onExitDisplay && (
            <button
              type="button"
              onClick={onExitDisplay}
              className="pq-dock-btn"
              title="Exit Display Mode / Re-pair"
            >
              <X size={16} />
            </button>
          )}

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

          <div className="pq-dock-sep" />

          {/* Presenter View (Shift+P), Record, Rehearse, Dock Position & Preferences */}
          {!isDisplayMode && (
            <>
              <button
                type="button"
                onClick={handleOpenPresenterView}
                className="pq-dock-btn"
                style={{ width: 'auto', padding: '0 9px', gap: 5, fontSize: 11.5, fontWeight: 700 }}
                title="Open Presenter View Window [Shift+P]"
              >
                <Monitor size={14} />
                <span>Presenter View</span>
              </button>

              <button
                type="button"
                onClick={() => (recStatus === 'recording' || recStatus === 'paused' ? handleStopRecording() : handleStartRecording())}
                className={`pq-dock-btn ${recStatus === 'recording' || recStatus === 'paused' ? 'is-active' : ''}`}
                style={{ width: 'auto', padding: '0 9px', gap: 5, fontSize: 11.5, fontWeight: 700, color: recStatus === 'recording' ? '#f87171' : undefined }}
                title={recStatus === 'recording' || recStatus === 'paused' ? 'Stop Recording' : 'Start Recording (3-2-1 Countdown)'}
              >
                <Video size={14} />
                <span>{recStatus === 'recording' || recStatus === 'paused' ? 'Stop Rec' : 'Record'}</span>
              </button>

              {(recStatus === 'recording' || recStatus === 'paused') && (
                <button
                  type="button"
                  onClick={handleTogglePauseRecording}
                  className="pq-dock-btn"
                  title="Pause / Resume Recording [Cmd+Shift+R]"
                >
                  {recStatus === 'paused' ? <Play size={14} /> : <Pause size={14} />}
                </button>
              )}

              <button
                type="button"
                onClick={handleStartRehearsal}
                className={`pq-dock-btn ${recStatus === 'rehearsal' ? 'is-active' : ''}`}
                style={{ width: 'auto', padding: '0 9px', fontSize: 11.5, fontWeight: 700 }}
                title="Rehearse (Timers + Presenter View, no recording)"
              >
                {recStatus === 'rehearsal' ? 'End Rehearse' : 'Rehearse'}
              </button>

              <button
                type="button"
                onClick={() => {
                  const order = ['bottom', 'left', 'right'];
                  const nextPos = order[(order.indexOf(prefs.toolbarPosition) + 1) % order.length];
                  handleSavePrefs({ ...prefs, toolbarPosition: nextPos });
                }}
                className="pq-dock-btn"
                style={{ width: 'auto', padding: '0 8px', fontSize: 11, fontWeight: 700 }}
                title="Move Toolbar Position (bottom / left / right)"
              >
                Dock: {prefs.toolbarPosition}
              </button>

              <button
                type="button"
                onClick={() => setIsPrefsOpen(true)}
                className="pq-dock-btn"
                title="Presenter Preferences"
              >
                <SlidersHorizontal size={15} />
              </button>
            </>
          )}
            </div>
          )}
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
              width: 'min(680px, 92vw)',
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 18px', fontSize: 12.5, lineHeight: 1.5, maxHeight: '60vh', overflowY: 'auto' }}>
              {PRESENT_SHORTCUTS.map((s) => (
                <div key={s.id} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                  <strong style={{ minWidth: 96, color: '#38bdf8' }}>
                    {[s.metaOrCtrl ? 'Cmd/Ctrl' : '', s.shift ? 'Shift' : '', s.alt ? 'Alt' : '', s.key === ' ' ? 'Space' : s.key.toUpperCase()].filter(Boolean).join('+')}
                  </strong>
                  <span>{s.label}</span>
                </div>
              ))}
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

      {/* Presenter Preferences Modal (PresenterPrefs) */}
      {isPrefsOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.72)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100001,
          }}
          onClick={() => setIsPrefsOpen(false)}
        >
          <div
            style={{
              width: 'min(480px, 92vw)',
              padding: '22px 24px',
              borderRadius: 16,
              background: theme === 'light' ? '#ffffff' : '#0f172a',
              border: '1px solid rgba(148,163,184,0.28)',
              color: theme === 'light' ? '#0f172a' : '#f8fafc',
              display: 'grid',
              gap: 14,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Presenter Preferences</h3>

            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
              <span>Recording theme</span>
              <select
                value={prefs.recordTheme}
                onChange={(e) => handleSavePrefs({ ...prefs, recordTheme: e.target.value })}
                style={{ padding: '5px 8px', borderRadius: 6, background: '#1e293b', color: '#f8fafc', border: '1px solid rgba(148,163,184,0.3)' }}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>

            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
              <span>Webcam bubble size</span>
              <select
                value={prefs.webcamSize}
                onChange={(e) => handleSavePrefs({ ...prefs, webcamSize: e.target.value })}
                style={{ padding: '5px 8px', borderRadius: 6, background: '#1e293b', color: '#f8fafc', border: '1px solid rgba(148,163,184,0.3)' }}
              >
                <option value="s">Small</option>
                <option value="m">Medium</option>
                <option value="l">Large</option>
              </select>
            </label>

            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
              <span>Webcam shape</span>
              <select
                value={prefs.webcamShape || 'circle'}
                onChange={(e) => handleSavePrefs({ ...prefs, webcamShape: e.target.value })}
                style={{ padding: '5px 8px', borderRadius: 6, background: '#1e293b', color: '#f8fafc', border: '1px solid rgba(148,163,184,0.3)' }}
              >
                <option value="circle">Round (Circle)</option>
                <option value="rect">Rectangular (16:11)</option>
              </select>
            </label>

            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
              <span>Toolbar position</span>
              <select
                value={prefs.toolbarPosition}
                onChange={(e) => handleSavePrefs({ ...prefs, toolbarPosition: e.target.value })}
                style={{ padding: '5px 8px', borderRadius: 6, background: '#1e293b', color: '#f8fafc', border: '1px solid rgba(148,163,184,0.3)' }}
              >
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={prefs.countdown}
                onChange={(e) => handleSavePrefs({ ...prefs, countdown: e.target.checked })}
              />
              <span>3-2-1 countdown before recording</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={prefs.pauseCue}
                onChange={(e) => handleSavePrefs({ ...prefs, pauseCue: e.target.checked })}
              />
              <span>Show &ldquo;Pause and try&rdquo; cue on Step 1</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={prefs.rememberLastTool}
                onChange={(e) => handleSavePrefs({ ...prefs, rememberLastTool: e.target.checked })}
              />
              <span>Remember last tool</span>
            </label>

            <button
              type="button"
              onClick={() => setIsPrefsOpen(false)}
              style={{ padding: '9px 14px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
            >
              Done
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
