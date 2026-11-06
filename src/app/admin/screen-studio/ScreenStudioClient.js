'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ArrowLeft,
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Radio,
  Pause,
  Play,
  Square,
  RotateCcw,
  Download,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Settings,
  Sparkles,
  Search,
  ExternalLink,
  HelpCircle,
  Eye,
  CheckCircle2,
  XCircle,
  Film,
  ZoomIn,
  ZoomOut,
  Layers,
  Monitor,
  Smartphone,
  Square as SquareIcon,
  X,
  Volume2,
  PenTool,
  Highlighter,
  Zap,
  Eraser,
  Undo2,
  Trash2,
  Sun,
  Moon,
  ListOrdered,
  FileText,
  BookOpen,
} from 'lucide-react';
import { parseStem } from '@/app/prelims/pyq/StemView';
import {
  saveRecordingToVault,
  formatDurationTimestamp,
  formatYouTubeChapters,
} from '@/lib/recordingVaultDb';
const PyqAnnotationCanvas = dynamic(
  () => import('../pyq/present/PyqAnnotationCanvas'),
  { ssr: false }
);
import './screen-studio.css';

const WALLPAPERS = [
  { id: 'obsidian', label: 'Obsidian Carbon', preview: '#08090d' },
  { id: 'nebula', label: 'Cosmic Nebula', preview: '#2b1055' },
  { id: 'sunset', label: 'Sunset Ember', preview: '#4a154b' },
  { id: 'aurora', label: 'Aurora Teal', preview: '#06373a' },
  { id: 'slate', label: 'Apple Slate', preview: '#161922' },
  { id: 'paper', label: 'Editorial Desk', preview: '#ede8df' },
];

export default function ScreenStudioClient({
  initialQuestions = [],
  initialThematicTopics = [],
  filterOptions = {},
}) {
  // ---------------- 1. Theme State (Default: As per user system/persisted) ----------------
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('theme') || localStorage.getItem('pq_present_theme');
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        setTheme('light');
      }
    } catch {
      // fallback
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', next);
      localStorage.setItem('pq_present_theme', next);
    }
  };

  // ---------------- 2. Viewport Mode (Default: Edge-to-Edge) ----------------
  const [stageMode, setStageMode] = useState('edge-to-edge'); // 'edge-to-edge' | 'framed-canvas'
  const [aspectRatio, setAspectRatio] = useState('16-9'); // '16-9' | '9-16' | '1-1' | '4-5'
  const [wallpaper, setWallpaper] = useState('obsidian');
  const [canvasPadding, setCanvasPadding] = useState(48);
  const [windowRadius, setWindowRadius] = useState(20);
  const [showCanvasSettings, setShowCanvasSettings] = useState(false);

  // ---------------- 3. Deck Types (Prelims PYQ & Thematic Topics Only) ----------------
  const [deckType, setDeckType] = useState('pyq'); // 'pyq' | 'thematic'
  const [pyqItems, setPyqItems] = useState(initialQuestions || []);
  const [thematicItems, setThematicItems] = useState(initialThematicTopics || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(
    (!initialQuestions || initialQuestions.length === 0) &&
    (!initialThematicTopics || initialThematicTopics.length === 0)
  );

  useEffect(() => {
    async function loadDecks() {
      try {
        setIsLoading(true);
        const [pyqRes, issuesRes] = await Promise.all([
          fetch('/api/admin/pyq?limit=50').then((r) => (r.ok ? r.json() : { items: [] })),
          fetch('/api/issues?showAll=true').then((r) => (r.ok ? r.json() : [])),
        ]);

        if (pyqRes && Array.isArray(pyqRes.items) && pyqRes.items.length > 0) {
          setPyqItems(pyqRes.items);
        }
        if (Array.isArray(issuesRes) && issuesRes.length > 0) {
          setThematicItems(issuesRes);
        }
      } catch (err) {
        console.error('[ScreenStudio] Failed to load deck items:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (pyqItems.length === 0 || thematicItems.length === 0) {
      loadDecks();
    }
  }, []);

  const activeDeck = deckType === 'pyq' ? pyqItems : thematicItems;
  const currentItem = activeDeck[currentIndex] || null;

  // ---------------- 4. 4-Phase Step Progression ----------------
  const [stepIndex, setStepIndex] = useState(0); // 0: Hook, 1: Statements/Details, 2: Options/Facts, 3: Deep Dive/Questions
  const [userSelection, setUserSelection] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [crossedStmts, setCrossedStmts] = useState({});

  // Reset per-item interactions on index change
  useEffect(() => {
    setStepIndex(0);
    setUserSelection(null);
    setShowAnswer(false);
    setCrossedStmts({});
    // Reset zoom
    setZoomLevel(1);
    setZoomTarget('full');
    setZoomTransform({ scale: 1, x: 0, y: 0 });
  }, [currentIndex, deckType]);

  // ---------------- 5. Slide Queue Drawer ----------------
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [queueSearch, setQueueSearch] = useState('');

  // ---------------- 6. Annotation & Blackboard Mode ----------------
  const [activeTool, setActiveTool] = useState('none'); // 'pen' | 'highlighter' | 'laser' | 'eraser' | 'none'
  const [penColor, setPenColor] = useState(theme === 'dark' ? '#ffffff' : '#0f172a');
  const [penSize, setPenSize] = useState(4);
  const [isBlackboard, setIsBlackboard] = useState(false);
  const [itemStrokes, setItemStrokes] = useState([]);
  const [stepStrokes, setStepStrokes] = useState([]);

  // Sync pen default color when theme changes
  useEffect(() => {
    if (activeTool !== 'none') {
      setPenColor(theme === 'dark' ? '#ffffff' : '#0f172a');
    }
  }, [theme]);

  // ---------------- 7. Spring Zoom Physics Engine ----------------
  const [zoomLevel, setZoomLevel] = useState(1); // 1, 1.4, 1.8
  const [zoomTarget, setZoomTarget] = useState('full');
  const [zoomTransform, setZoomTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [clickToZoomEnabled, setClickToZoomEnabled] = useState(false);

  const windowRef = useRef(null);
  const stemRef = useRef(null);
  const optionsRef = useRef(null);
  const solutionRef = useRef(null);

  useEffect(() => {
    if (zoomLevel === 1 || zoomTarget === 'full') {
      setZoomTransform({ scale: 1, x: 0, y: 0 });
      return;
    }
    if (zoomTarget === 'stem') {
      setZoomTransform({ scale: zoomLevel, x: 0, y: 15 });
    } else if (zoomTarget === 'options') {
      setZoomTransform({ scale: zoomLevel, x: 0, y: -25 });
    } else if (zoomTarget === 'solution') {
      setZoomTransform({ scale: zoomLevel, x: 0, y: -45 });
    }
  }, [zoomLevel, zoomTarget]);

  const handleWindowClick = (e) => {
    if (!clickToZoomEnabled) return;
    if (e.target.closest('button') || e.target.closest('input')) return;

    if (zoomLevel > 1) {
      setZoomLevel(1);
      setZoomTarget('full');
      setZoomTransform({ scale: 1, x: 0, y: 0 });
    } else {
      const rect = windowRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left - rect.width / 2;
      const clickY = e.clientY - rect.top - rect.height / 2;
      const targetScale = 1.6;
      setZoomLevel(targetScale);
      setZoomTarget('custom');
      setZoomTransform({
        scale: targetScale,
        x: -clickX * 0.45,
        y: -clickY * 0.45,
      });
    }
  };

  // ---------------- 8. Draggable Webcam PiP ----------------
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraShape, setCameraShape] = useState('circle'); // 'circle' | 'squircle' | 'pill'
  const [pipPosition, setPipPosition] = useState('br'); // 'br' | 'bl' | 'tr' | 'tl'
  const [isMirrored, setIsMirrored] = useState(true);
  const videoPipRef = useRef(null);
  const cameraStreamRef = useRef(null);

  const toggleCamera = async () => {
    if (isCameraActive) {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
        cameraStreamRef.current = null;
      }
      setIsCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 640 } },
        });
        cameraStreamRef.current = stream;
        if (videoPipRef.current) {
          videoPipRef.current.srcObject = stream;
        }
        setIsCameraActive(true);
      } catch (err) {
        alert('Could not access webcam. Please check browser permissions.');
      }
    }
  };

  useEffect(() => {
    if (isCameraActive && videoPipRef.current && cameraStreamRef.current) {
      videoPipRef.current.srcObject = cameraStreamRef.current;
    }
  }, [isCameraActive, cameraShape, pipPosition]);

  // ---------------- 9. Audio VU Meter Engine ----------------
  const [isMicActive, setIsMicActive] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const micStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    let stream = null;
    let audioCtx = null;

    async function initAudio() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateMeter = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / dataArray.length;
          setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
          animFrameRef.current = requestAnimationFrame(updateMeter);
        };
        updateMeter();
      } catch {
        // mic permission not granted
      }
    }

    if (isMicActive) {
      initAudio();
    } else {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      setAudioLevel(0);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (audioCtx) audioCtx.close();
    };
  }, [isMicActive]);

  // ---------------- 10. Screen Recording & Export Engine ----------------
  const [recState, setRecState] = useState('idle'); // 'idle' | 'recording' | 'paused'
  const [recDuration, setRecDuration] = useState(0);
  const [chapters, setChapters] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [copiedChapters, setCopiedChapters] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  // Auto-log chapter on question/topic change during recording
  useEffect(() => {
    if (recState === 'recording' && currentItem) {
      const label =
        deckType === 'pyq'
          ? `Q${currentIndex + 1} (${currentItem.examYear || ''}) - ${currentItem.srcTopic || 'Prelims PYQ'}`
          : `Topic ${currentIndex + 1}: ${currentItem.title || 'Syllabus Note'}`;
      setChapters((prev) => [...prev, { startSec: recDuration, label }]);
    }
  }, [currentIndex, deckType, recState]);

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      alert('Screen recording is not supported in this browser. Please use Chrome, Edge, or Brave.');
      return;
    }
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser', frameRate: { ideal: 30, max: 60 } },
        audio: true,
      });

      let combinedStream = displayStream;
      if (isMicActive && micStreamRef.current) {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const dest = audioCtx.createMediaStreamDestination();
        const micSource = audioCtx.createMediaStreamSource(micStreamRef.current);
        micSource.connect(dest);

        if (displayStream.getAudioTracks().length > 0) {
          const tabAudio = audioCtx.createMediaStreamSource(displayStream);
          tabAudio.connect(dest);
        }

        combinedStream = new MediaStream([
          ...displayStream.getVideoTracks(),
          ...dest.stream.getAudioTracks(),
        ]);
      }

      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
      ];
      const selectedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || 'video/webm';

      const recorder = new MediaRecorder(combinedStream, {
        mimeType: selectedMime,
        videoBitsPerSecond: 2500000,
      });

      recordedChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: selectedMime });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);

        await saveRecordingToVault({
          id: `ss_rec_${Date.now()}`,
          name: `ScreenStudio_${currentItem?.srcTopic || currentItem?.title || 'Lecture'}_${new Date().toISOString().slice(0, 10)}.webm`,
          blob,
          duration: recDuration,
          chapters,
        });

        setShowExportModal(true);
        setRecState('idle');
        clearInterval(timerIntervalRef.current);
      };

      displayStream.getVideoTracks()[0].onended = () => stopRecording();

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setRecState('recording');
      setRecDuration(0);

      const firstLabel =
        deckType === 'pyq'
          ? `Q1 (${currentItem?.examYear || ''}) - ${currentItem?.srcTopic || 'Prelims PYQ'}`
          : `Topic 1: ${currentItem?.title || 'Syllabus Note'}`;
      setChapters([{ startSec: 0, label: firstLabel }]);

      timerIntervalRef.current = setInterval(() => {
        setRecDuration((d) => d + 1);
      }, 1000);
    } catch (err) {
      console.error('[ScreenStudio] Recording start error:', err);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recState === 'recording') {
      mediaRecorderRef.current.pause();
      setRecState('paused');
      clearInterval(timerIntervalRef.current);
    } else if (mediaRecorderRef.current && recState === 'paused') {
      mediaRecorderRef.current.resume();
      setRecState('recording');
      timerIntervalRef.current = setInterval(() => {
        setRecDuration((d) => d + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  // ---------------- 11. Keyboard Shortcuts (Space / Arrow Navigation) ----------------
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing inside input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        // Advance step, or advance item if at step 3
        if (stepIndex < 3) {
          setStepIndex((s) => s + 1);
        } else if (currentIndex < activeDeck.length - 1) {
          setCurrentIndex((i) => i + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (stepIndex > 0) {
          setStepIndex((s) => s - 1);
        } else if (currentIndex > 0) {
          setCurrentIndex((i) => i - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stepIndex, currentIndex, activeDeck.length]);

  // Stem parsing & normalized options for PYQ
  const parsedBlocks = useMemo(() => {
    if (!currentItem?.stem) return [];
    return parseStem(currentItem.stem);
  }, [currentItem]);

  const normalizedOptions = useMemo(() => {
    if (!currentItem?.options) return [];
    if (Array.isArray(currentItem.options)) return currentItem.options;
    try {
      const parsed = JSON.parse(currentItem.options);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [currentItem]);

  // Filtered queue items
  const filteredQueueItems = useMemo(() => {
    if (!queueSearch.trim()) return activeDeck;
    const q = queueSearch.toLowerCase();
    return activeDeck.filter((item) => {
      const title = item.title || item.stem || '';
      const topic = item.srcTopic || item.topic || '';
      const sub = item.srcSubject || item.domain || '';
      return (
        title.toLowerCase().includes(q) ||
        topic.toLowerCase().includes(q) ||
        sub.toLowerCase().includes(q)
      );
    });
  }, [activeDeck, queueSearch]);

  const copyTimestamps = () => {
    const formatted = formatYouTubeChapters(chapters, 'UPSC Masterclass');
    navigator.clipboard.writeText(formatted);
    setCopiedChapters(true);
    setTimeout(() => setCopiedChapters(false), 2000);
  };

  return (
    <div className={`ss-root theme-${theme}`}>
      {/* ---------------- Top Studio Navbar ---------------- */}
      <header className="ss-navbar">
        <div className="ss-nav-group">
          <Link href="/admin/recording-studio" className="ss-back-link">
            <ArrowLeft size={14} />
            <span>Studio Hub</span>
          </Link>

          <div className="ss-brand-pill">
            <Sparkles size={13} />
            <span>Screen Studio</span>
          </div>

          {/* Deck Switcher: Prelims PYQ vs Thematic Topics */}
          <div className="ss-seg-dock">
            <button
              type="button"
              className={`ss-seg-btn ${deckType === 'pyq' ? 'is-selected' : ''}`}
              onClick={() => {
                setDeckType('pyq');
                setCurrentIndex(0);
              }}
            >
              Prelims PYQ ({pyqItems.length})
            </button>
            <button
              type="button"
              className={`ss-seg-btn ${deckType === 'thematic' ? 'is-selected' : ''}`}
              onClick={() => {
                setDeckType('thematic');
                setCurrentIndex(0);
              }}
            >
              Thematic Topics ({thematicItems.length})
            </button>
          </div>
        </div>

        {/* Center: Live Recording Indicator */}
        <div className="ss-nav-group">
          <div className={`ss-status-badge is-${recState}`}>
            {recState === 'recording' ? (
              <>
                <span className="ss-rec-pulsing-dot" />
                <span>REC {formatDurationTimestamp(recDuration)}</span>
              </>
            ) : recState === 'paused' ? (
              <span>PAUSED {formatDurationTimestamp(recDuration)}</span>
            ) : (
              <span>IDLE</span>
            )}
          </div>
        </div>

        {/* Right: Layout Mode, Queue Drawer, Theme Toggle */}
        <div className="ss-nav-group">
          {/* Edge-to-Edge vs Framed Canvas Toggle */}
          <button
            type="button"
            className={`ss-dock-btn ${stageMode === 'framed-canvas' ? 'is-active' : ''}`}
            onClick={() =>
              setStageMode(stageMode === 'edge-to-edge' ? 'framed-canvas' : 'edge-to-edge')
            }
            title="Toggle between Edge-to-Edge and Framed Studio Canvas"
          >
            {stageMode === 'edge-to-edge' ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
            <span>{stageMode === 'edge-to-edge' ? 'Edge-to-Edge' : 'Framed Canvas'}</span>
          </button>

          {/* Queue Drawer Toggle */}
          <button
            type="button"
            className="ss-dock-btn"
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            title="Toggle Deck Slide Drawer"
          >
            <ListOrdered size={14} />
            <span>
              {currentIndex + 1} / {activeDeck.length}
            </span>
          </button>

          {/* Theme Switcher (Editorial Light vs Midnight Dark) */}
          <button
            type="button"
            className="ss-dock-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Editorial Study Desk (Light)' : 'Switch to Midnight Library (Dark)'}
          >
            {theme === 'dark' ? <Sun size={14} color="#f59e0b" /> : <Moon size={14} color="#2563eb" />}
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </header>

      {/* ---------------- Main Stage Viewport ---------------- */}
      <main className="ss-main-stage">
        <div
          className={`ss-stage-viewport is-${stageMode}`}
          onClick={handleWindowClick}
        >
          {/* Framed Canvas Mode Wrapper */}
          <div
            className={
              stageMode === 'framed-canvas'
                ? `ss-canvas-frame bg-${wallpaper} ss-aspect-${aspectRatio}`
                : 'w-full h-full'
            }
            style={stageMode === 'framed-canvas' ? { padding: `${canvasPadding}px` } : {}}
          >
            {/* The Mac Window Frame */}
            <div
              ref={windowRef}
              className="ss-mac-window"
              style={
                stageMode === 'framed-canvas'
                  ? { borderRadius: `${windowRadius}px` }
                  : { borderRadius: 0 }
              }
            >
              {/* macOS Titlebar */}
              <div className="ss-mac-titlebar">
                <div className="ss-traffic-lights">
                  <span className="ss-traffic-dot dot-red" />
                  <span className="ss-traffic-dot dot-yellow" />
                  <span className="ss-traffic-dot dot-green" />
                </div>

                <div className="ss-titlebar-pill">
                  <span>🔒 upscgpt.com</span>
                  <span>&middot;</span>
                  <span>
                    {deckType === 'pyq'
                      ? currentItem?.srcSubject || 'GS PAPER I'
                      : currentItem?.domain || 'THEMATIC MASTERCLASS'}
                  </span>
                  {currentItem?.questionNo && <span>&middot; Paper Q.{currentItem.questionNo}</span>}
                </div>

                <div style={{ width: 50 }} />
              </div>

              {/* 4-Phase Step Progression Breadcrumbs */}
              <div className="ss-step-progress-bar">
                {deckType === 'pyq' ? (
                  <>
                    <button
                      type="button"
                      className={`ss-step-tab ${stepIndex === 0 ? 'is-active' : stepIndex > 0 ? 'is-completed' : ''}`}
                      onClick={() => setStepIndex(0)}
                    >
                      <span>1. Hook &amp; Lead</span>
                    </button>
                    <span className="ss-step-sep">&gt;</span>
                    <button
                      type="button"
                      className={`ss-step-tab ${stepIndex === 1 ? 'is-active' : stepIndex > 1 ? 'is-completed' : ''}`}
                      onClick={() => setStepIndex(1)}
                    >
                      <span>2. Statement Breakdown</span>
                    </button>
                    <span className="ss-step-sep">&gt;</span>
                    <button
                      type="button"
                      className={`ss-step-tab ${stepIndex === 2 ? 'is-active' : stepIndex > 2 ? 'is-completed' : ''}`}
                      onClick={() => setStepIndex(2)}
                    >
                      <span>3. Options &amp; Elimination</span>
                    </button>
                    <span className="ss-step-sep">&gt;</span>
                    <button
                      type="button"
                      className={`ss-step-tab ${stepIndex === 3 ? 'is-active' : ''}`}
                      onClick={() => {
                        setStepIndex(3);
                        setShowAnswer(true);
                      }}
                    >
                      <span>4. Deep Dive &amp; Traps</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className={`ss-step-tab ${stepIndex === 0 ? 'is-active' : ''}`}
                      onClick={() => setStepIndex(0)}
                    >
                      <span>1. Concept Overview</span>
                    </button>
                    <span className="ss-step-sep">&gt;</span>
                    <button
                      type="button"
                      className={`ss-step-tab ${stepIndex === 1 ? 'is-active' : ''}`}
                      onClick={() => setStepIndex(1)}
                    >
                      <span>2. Background Notes</span>
                    </button>
                    <span className="ss-step-sep">&gt;</span>
                    <button
                      type="button"
                      className={`ss-step-tab ${stepIndex === 2 ? 'is-active' : ''}`}
                      onClick={() => setStepIndex(2)}
                    >
                      <span>3. Value Addition</span>
                    </button>
                    <span className="ss-step-sep">&gt;</span>
                    <button
                      type="button"
                      className={`ss-step-tab ${stepIndex === 3 ? 'is-active' : ''}`}
                      onClick={() => setStepIndex(3)}
                    >
                      <span>4. Probable Questions</span>
                    </button>
                  </>
                )}
              </div>

              {/* Main Content Area (With Spring Zoom Physics) */}
              <div
                className="ss-content-scroll"
                style={{
                  transform: `scale(${zoomTransform.scale}) translate(${zoomTransform.x}px, ${zoomTransform.y}px)`,
                }}
              >
                {/* 1. Prelims PYQ Rendering */}
                {deckType === 'pyq' && currentItem && (
                  <>
                    {/* Meta Bar */}
                    <div className="ss-q-meta-bar">
                      <div className="ss-tags">
                        <span className="ss-tag tag-exam">
                          {currentItem.examName || 'UPSC CSE'} {currentItem.examYear}
                        </span>
                        {currentItem.questionNo && (
                          <span className="ss-tag tag-paper-q">Paper Q.{currentItem.questionNo}</span>
                        )}
                        <span className="ss-tag tag-topic">{currentItem.srcTopic}</span>
                        {currentItem.difficulty && (
                          <span className="ss-tag tag-diff">{currentItem.difficulty}</span>
                        )}
                      </div>
                    </div>

                    {/* Question Stem */}
                    <div ref={stemRef} className="ss-stem-text">
                      {parsedBlocks.map((b, idx) => {
                        if (b.type === 'stmts') {
                          // Only reveal statements if stepIndex >= 1
                          if (stepIndex < 1) return null;
                          return (
                            <div className="ss-stmts-list" key={idx}>
                              {b.items.map((s, k) => {
                                const stmtId = `${idx}-${k}`;
                                const isCrossed = Boolean(crossedStmts[stmtId]);
                                return (
                                  <div
                                    key={k}
                                    className={`ss-stmt-card ${isCrossed ? 'is-crossed' : ''}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCrossedStmts((prev) => ({
                                        ...prev,
                                        [stmtId]: !prev[stmtId],
                                      }));
                                    }}
                                    title="Click to cross out or restore statement"
                                  >
                                    <span className="ss-stmt-badge">{s.key}</span>
                                    <span>{s.text}</span>
                                    <span className="ss-stmt-strike-action">
                                      {isCrossed ? '↺ Restore' : '✕ Strike'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        }
                        return (
                          <p key={idx} style={{ margin: '8px 0' }}>
                            {idx === 0 ? (
                              <strong className="ss-stem-qno">{currentIndex + 1}. </strong>
                            ) : null}
                            {b.text}
                          </p>
                        );
                      })}
                    </div>

                    {/* Options Grid (Revealed at Step 2+) */}
                    {stepIndex >= 2 && (
                      <div
                        ref={optionsRef}
                        className={`ss-options-grid ${normalizedOptions.length > 2 ? 'grid-2' : ''}`}
                      >
                        {normalizedOptions.map((opt) => {
                          const isSelected = userSelection === opt.label;
                          const isCorrect = (showAnswer || stepIndex >= 3) && opt.label === currentItem.correctLabel;
                          const isWrong = (showAnswer || stepIndex >= 3) && isSelected && !isCorrect;
                          const isFaded = (showAnswer || stepIndex >= 3) && !isCorrect && !isSelected;

                          let cls = 'ss-option-btn';
                          if (isCorrect) cls += ' is-correct';
                          if (isWrong) cls += ' is-wrong';
                          if (isFaded) cls += ' is-faded';

                          return (
                            <button
                              key={opt.label}
                              type="button"
                              className={cls}
                              onClick={(e) => {
                                e.stopPropagation();
                                setUserSelection(opt.label);
                                setShowAnswer(true);
                              }}
                            >
                              <span className="ss-opt-icon">{opt.label}</span>
                              <span>{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Deep Dive & Traps (Revealed at Step 3 or when Show Answer is clicked) */}
                    {(stepIndex >= 3 || showAnswer) && (
                      <div ref={solutionRef} className="ss-deepdive-card">
                        <div className="ss-verdict-title">
                          <CheckCircle2 size={20} />
                          <span>
                            Official Key: ({currentItem.correctLabel?.toUpperCase()}) &middot;{' '}
                            {userSelection === currentItem.correctLabel
                              ? '✓ Correct Selection!'
                              : 'Conceptual Solution Breakdown'}
                          </span>
                        </div>
                        {currentItem.explanation && (
                          <div className="ss-explanation-text">{currentItem.explanation}</div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* 2. Thematic Topic Masterclass Rendering */}
                {deckType === 'thematic' && currentItem && (
                  <div className="ss-thematic-slide">
                    <h2 className="ss-thematic-title">{currentItem.title}</h2>
                    <div className="ss-tags">
                      <span className="ss-tag tag-exam">{currentItem.domain}</span>
                      <span className="ss-tag tag-topic">{currentItem.topic}</span>
                      {(currentItem.gsPapers || []).map((p) => (
                        <span key={p} className="ss-tag tag-diff">
                          {p}
                        </span>
                      ))}
                    </div>

                    {stepIndex === 0 && currentItem.cumulativeSummary && (
                      <div className="ss-thematic-section">
                        <div className="ss-thematic-section-title">
                          <BookOpen size={16} />
                          <span>Executive Concept Summary</span>
                        </div>
                        <div className="ss-thematic-body">{currentItem.cumulativeSummary}</div>
                      </div>
                    )}

                    {stepIndex === 1 && currentItem.backgroundNote && (
                      <div className="ss-thematic-section">
                        <div className="ss-thematic-section-title">
                          <FileText size={16} />
                          <span>Comprehensive Background &amp; Core Pillars</span>
                        </div>
                        <div className="ss-thematic-body">{currentItem.backgroundNote}</div>
                      </div>
                    )}

                    {stepIndex === 2 && currentItem.valueAddition && (
                      <div className="ss-thematic-section">
                        <div className="ss-thematic-section-title">
                          <Sparkles size={16} />
                          <span>High-Yield Value Addition &amp; Data Facts</span>
                        </div>
                        <div className="ss-thematic-body">{currentItem.valueAddition}</div>
                      </div>
                    )}

                    {stepIndex === 3 && currentItem.possibleQuestions && (
                      <div className="ss-thematic-section">
                        <div className="ss-thematic-section-title">
                          <HelpCircle size={16} />
                          <span>Probable Prelims &amp; Mains Questions</span>
                        </div>
                        <div className="ss-thematic-body">{currentItem.possibleQuestions}</div>
                      </div>
                    )}
                  </div>
                )}

                {!currentItem && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 16 }}>
                    {isLoading ? (
                      <>
                        <div className="ss-rec-pulsing-dot" style={{ width: 22, height: 22, background: 'var(--ss-accent)' }} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ss-text-muted)' }}>
                          Loading Screen Studio Deck...
                        </span>
                      </>
                    ) : (
                      <>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>No Deck Items Loaded</h3>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--ss-text-muted)' }}>
                          Please choose Prelims PYQ or Thematic Topics from the top navbar.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Fullscreen Blackboard Mode Overlay */}
              {isBlackboard && (
                <div className="ss-blackboard-overlay">
                  <div className="ss-blackboard-header">
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
                      Blackboard Scratchpad (Apple Pencil &amp; Stylus Active)
                    </span>
                    <button
                      type="button"
                      className="ss-dock-btn"
                      onClick={() => setIsBlackboard(false)}
                    >
                      Return to Question View ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Inking Annotation Canvas Overlay */}
              <div className={`ss-annotation-layer ${activeTool !== 'none' ? 'is-drawing' : ''}`}>
                <PyqAnnotationCanvas
                  activeTool={activeTool}
                  activeColor={penColor}
                  penSize={penSize}
                  questionStrokes={itemStrokes}
                  stepStrokes={stepStrokes}
                  onUpdateQuestionStrokes={setItemStrokes}
                  onUpdateStepStrokes={setStepStrokes}
                />
              </div>
            </div>

            {/* Draggable Webcam PiP */}
            {isCameraActive && (
              <div
                className={`ss-webcam-box shape-${cameraShape} ss-pip-${pipPosition}`}
                onClick={() => {
                  const positions = ['br', 'bl', 'tl', 'tr'];
                  setPipPosition(positions[(positions.indexOf(pipPosition) + 1) % positions.length]);
                }}
                title="Click to cycle corner position"
              >
                <video
                  ref={videoPipRef}
                  autoPlay
                  playsInline
                  muted
                  className={`ss-webcam-feed ${isMirrored ? 'is-mirrored' : ''}`}
                />
              </div>
            )}
          </div>
        </div>

        {/* ---------------- Collapsible Slide Queue Drawer ---------------- */}
        {isQueueOpen && (
          <aside className="ss-queue-drawer">
            <div className="ss-queue-header">
              <span style={{ fontSize: 14, fontWeight: 800 }}>
                {deckType === 'pyq' ? 'Prelims PYQ Deck' : 'Thematic Topics Deck'} ({activeDeck.length})
              </span>
              <button
                type="button"
                onClick={() => setIsQueueOpen(false)}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--ss-border)' }}>
              <input
                type="text"
                placeholder="Search deck..."
                value={queueSearch}
                onChange={(e) => setQueueSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: 'var(--ss-surface-alt)',
                  border: '1px solid var(--ss-border)',
                  color: 'inherit',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>

            <div className="ss-queue-list">
              {filteredQueueItems.map((item, idx) => {
                const isSelected = activeDeck.indexOf(item) === currentIndex;
                return (
                  <div
                    key={item.id || idx}
                    className={`ss-queue-item ${isSelected ? 'is-current' : ''}`}
                    onClick={() => {
                      setCurrentIndex(activeDeck.indexOf(item));
                      setIsQueueOpen(false);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: 'var(--ss-accent)' }}>
                      <span>#{idx + 1}</span>
                      <span>&middot;</span>
                      <span>{item.examYear || item.domain || 'Syllabus'}</span>
                      {item.questionNo && <span>&middot; Q.{item.questionNo}</span>}
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title || item.stem}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        )}
      </main>

      {/* ---------------- Floating Frosted Glass Bottom Dock ---------------- */}
      <footer className="ss-dock-wrapper">
        <div className="ss-glass-dock">
          {/* 1. Record Engine */}
          {recState === 'idle' ? (
            <button
              type="button"
              className="ss-dock-record-btn"
              onClick={startRecording}
              title="Start Screen Studio Recording (1080p)"
            >
              <span className="ss-rec-pulsing-dot" />
              <span>Record</span>
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                className="ss-dock-btn"
                onClick={pauseRecording}
                title={recState === 'recording' ? 'Pause Recording' : 'Resume Recording'}
              >
                {recState === 'recording' ? <Pause size={14} /> : <Play size={14} />}
                <span>{recState === 'recording' ? 'Pause' : 'Resume'}</span>
              </button>
              <button
                type="button"
                className="ss-dock-record-btn is-active"
                onClick={stopRecording}
                title="Stop Recording and Export"
              >
                <Square size={13} fill="currentColor" />
                <span>Stop</span>
              </button>
            </div>
          )}

          {/* Mic VU Meter */}
          <div
            className="ss-dock-btn"
            onClick={() => setIsMicActive(!isMicActive)}
            title={isMicActive ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {isMicActive ? <Mic size={14} color="#3b82f6" /> : <MicOff size={14} color="#ef4444" />}
            {isMicActive && (
              <div className="ss-vu-graph">
                <div
                  className="ss-vu-strip"
                  style={{
                    height: `${Math.max(4, audioLevel * 0.14)}px`,
                    backgroundColor: audioLevel > 60 ? '#f59e0b' : '#10b981',
                  }}
                />
                <div
                  className="ss-vu-strip"
                  style={{
                    height: `${Math.max(4, audioLevel * 0.1)}px`,
                    backgroundColor: audioLevel > 80 ? '#ef4444' : '#10b981',
                  }}
                />
              </div>
            )}
          </div>

          <div className="ss-dock-divider" />

          {/* 2. Stylus Annotation Tools */}
          <div className="ss-seg-dock" title="Stylus Drawing Tools">
            <button
              type="button"
              className={`ss-seg-btn ${activeTool === 'none' ? 'is-selected' : ''}`}
              onClick={() => setActiveTool('none')}
            >
              Cursor
            </button>
            <button
              type="button"
              className={`ss-seg-btn ${activeTool === 'pen' ? 'is-selected' : ''}`}
              onClick={() => setActiveTool('pen')}
            >
              <PenTool size={13} />
            </button>
            <button
              type="button"
              className={`ss-seg-btn ${activeTool === 'highlighter' ? 'is-selected' : ''}`}
              onClick={() => setActiveTool('highlighter')}
            >
              <Highlighter size={13} />
            </button>
            <button
              type="button"
              className={`ss-seg-btn ${activeTool === 'laser' ? 'is-selected' : ''}`}
              onClick={() => setActiveTool('laser')}
            >
              <Zap size={13} />
            </button>
            <button
              type="button"
              className={`ss-seg-btn ${activeTool === 'eraser' ? 'is-selected' : ''}`}
              onClick={() => setActiveTool('eraser')}
            >
              <Eraser size={13} />
            </button>
          </div>

          {/* Blackboard Toggle */}
          <button
            type="button"
            className={`ss-dock-btn ${isBlackboard ? 'is-active' : ''}`}
            onClick={() => setIsBlackboard(!isBlackboard)}
            title="Toggle Blackboard Scratchpad Mode"
          >
            <span>Blackboard</span>
          </button>

          <div className="ss-dock-divider" />

          {/* 3. Spring Zoom Presets */}
          <div className="ss-seg-dock" title="Camera Spring Zoom">
            <button
              type="button"
              className={`ss-seg-btn ${zoomLevel === 1 ? 'is-selected' : ''}`}
              onClick={() => {
                setZoomLevel(1);
                setZoomTarget('full');
              }}
            >
              1x
            </button>
            <button
              type="button"
              className={`ss-seg-btn ${zoomLevel === 1.4 ? 'is-selected' : ''}`}
              onClick={() => {
                setZoomLevel(1.4);
                setZoomTarget('stem');
              }}
            >
              1.4x
            </button>
            <button
              type="button"
              className={`ss-seg-btn ${zoomLevel === 1.8 ? 'is-selected' : ''}`}
              onClick={() => {
                setZoomLevel(1.8);
                setZoomTarget('options');
              }}
            >
              1.8x
            </button>
          </div>

          <button
            type="button"
            className={`ss-dock-btn ${clickToZoomEnabled ? 'is-active' : ''}`}
            onClick={() => setClickToZoomEnabled(!clickToZoomEnabled)}
            title="Click inside the stage to smoothly zoom in/out"
          >
            <ZoomIn size={14} />
            <span>Click Zoom</span>
          </button>

          <div className="ss-dock-divider" />

          {/* 4. Webcam PiP Toggle */}
          <button
            type="button"
            className={`ss-dock-btn ${isCameraActive ? 'is-active' : ''}`}
            onClick={toggleCamera}
            title="Toggle Live Webcam Picture-in-Picture"
          >
            {isCameraActive ? <Camera size={14} /> : <CameraOff size={14} />}
            <span>Camera</span>
          </button>

          {isCameraActive && (
            <button
              type="button"
              className="ss-dock-btn"
              onClick={() => {
                const shapes = ['circle', 'squircle', 'pill'];
                setCameraShape(shapes[(shapes.indexOf(cameraShape) + 1) % shapes.length]);
              }}
              title="Cycle Camera Shape"
            >
              <span>{cameraShape}</span>
            </button>
          )}

          <div className="ss-dock-divider" />

          {/* 5. Item Step Controls (Prev / Next) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              type="button"
              className="ss-dock-btn"
              disabled={currentIndex <= 0 && stepIndex <= 0}
              onClick={() => {
                if (stepIndex > 0) setStepIndex((s) => s - 1);
                else if (currentIndex > 0) setCurrentIndex((i) => i - 1);
              }}
              title="Previous Step / Question (Left Arrow)"
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: 12, fontWeight: 800, padding: '0 4px', color: 'var(--ss-text-muted)' }}>
              Step {stepIndex + 1}/4
            </span>
            <button
              type="button"
              className="ss-dock-btn"
              disabled={currentIndex >= activeDeck.length - 1 && stepIndex >= 3}
              onClick={() => {
                if (stepIndex < 3) setStepIndex((s) => s + 1);
                else if (currentIndex < activeDeck.length - 1) setCurrentIndex((i) => i + 1);
              }}
              title="Next Step / Question (Space or Right Arrow)"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </footer>

      {/* ---------------- Export & YouTube Chapters Modal ---------------- */}
      {showExportModal && (
        <div className="ss-modal-bg" onClick={() => setShowExportModal(false)}>
          <div className="ss-modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Film size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>
                    Screen Studio Recording Complete
                  </h3>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--ss-text-muted)' }}>
                    Saved to local Mac IndexedDB &middot; Duration: {formatDurationTimestamp(recDuration)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Video Download Button */}
            {downloadUrl && (
              <a
                href={downloadUrl}
                download={`ScreenStudio_${currentItem?.srcTopic || currentItem?.title || 'Lecture'}_${new Date().toISOString().slice(0, 10)}.webm`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '14px 20px',
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: 15,
                  textDecoration: 'none',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
                  marginBottom: 16,
                }}
              >
                <Download size={18} />
                <span>Download Studio Video (.webm)</span>
              </a>
            )}

            {/* YouTube Chapters */}
            <div style={{ background: 'var(--ss-surface-alt)', padding: 16, borderRadius: 14, border: '1px solid var(--ss-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 800 }}>
                  YouTube Chapter Timestamps ({chapters.length})
                </span>
                <button
                  type="button"
                  onClick={copyTimestamps}
                  className="ss-dock-btn"
                  style={{ padding: '4px 10px', fontSize: 11.5 }}
                >
                  {copiedChapters ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                  <span>{copiedChapters ? 'Copied!' : 'Copy Chapters'}</span>
                </button>
              </div>

              <pre
                style={{
                  margin: 0,
                  fontSize: 12,
                  fontFamily: 'monospace',
                  color: 'var(--ss-text-muted)',
                  lineHeight: 1.6,
                  maxHeight: 140,
                  overflowY: 'auto',
                }}
              >
                {formatYouTubeChapters(chapters, 'UPSC Masterclass')}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
