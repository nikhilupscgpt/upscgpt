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
  Filter,
  Palette,
  Sliders,
  Video,
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

const DARK_PEN_SWATCHES = ['#ffffff', '#f59e0b', '#38bdf8', '#34d399', '#fb7185'];
const LIGHT_PEN_SWATCHES = ['#0f172a', '#2563eb', '#dc2626', '#059669', '#d97706'];

function getPreferredMimeType(format = 'mp4') {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    return 'video/mp4';
  }
  const mp4Candidates = [
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4;codecs=avc1.4d002a,mp4a.40.2',
    'video/mp4;codecs=avc1',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  const webmCandidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4',
  ];
  const list = format === 'mp4' ? mp4Candidates : webmCandidates;
  for (const mime of list) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return 'video/webm';
}

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

  // ---------------- 2. Viewport & Canvas Style State ----------------
  const [stageMode, setStageMode] = useState('edge-to-edge'); // 'edge-to-edge' | 'framed-canvas'
  const [aspectRatio, setAspectRatio] = useState('16-9'); // '16-9' | '9-16' | '1-1' | '4-5'
  const [wallpaper, setWallpaper] = useState('obsidian');
  const [canvasPadding, setCanvasPadding] = useState(48);
  const [windowRadius, setWindowRadius] = useState(20);
  const [shadowDepth, setShadowDepth] = useState('pro'); // 'pro' | 'glow' | 'soft' | 'flat'
  const [showStylePopover, setShowStylePopover] = useState(false);

  // ---------------- 3. Deck State & Ingestion ----------------
  const [deckType, setDeckType] = useState('pyq'); // 'pyq' | 'thematic'
  const [pyqItems, setPyqItems] = useState(initialQuestions || []);
  const [thematicItems, setThematicItems] = useState(initialThematicTopics || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(
    (!initialQuestions || initialQuestions.length === 0) &&
    (!initialThematicTopics || initialThematicTopics.length === 0)
  );

  // Deck Filter Modal State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [filterTopic, setFilterTopic] = useState('ALL');
  const [filterYear, setFilterYear] = useState('ALL');
  const [filterPattern, setFilterPattern] = useState('ALL');
  const [filterSearch, setFilterSearch] = useState('');
  const [availableSubjects, setAvailableSubjects] = useState(filterOptions?.subjects || []);
  const [availableYears, setAvailableYears] = useState(filterOptions?.years || []);
  const [isFetchingFiltered, setIsFetchingFiltered] = useState(false);

  // Initial client deck fetch
  useEffect(() => {
    async function loadDecks() {
      try {
        setIsLoading(true);
        const [pyqRes, issuesRes] = await Promise.all([
          fetch('/api/admin/pyq?limit=60').then((r) => (r.ok ? r.json() : { items: [] })),
          fetch('/api/issues?showAll=true').then((r) => (r.ok ? r.json() : [])),
        ]);

        if (pyqRes && Array.isArray(pyqRes.items) && pyqRes.items.length > 0) {
          setPyqItems(pyqRes.items);
        }
        if (Array.isArray(issuesRes) && issuesRes.length > 0) {
          setThematicItems(issuesRes);
        }
      } catch (err) {
        console.error('[ScreenStudio] Deck load error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (pyqItems.length === 0 || thematicItems.length === 0) {
      loadDecks();
    }
  }, []);

  // Filter apply handler
  const handleApplyPyqFilters = async () => {
    setIsFetchingFiltered(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', '60');
      if (filterSubject !== 'ALL') params.set('subject', filterSubject);
      if (filterTopic !== 'ALL') params.set('topic', filterTopic);
      if (filterYear !== 'ALL') params.set('year', filterYear);
      if (filterPattern !== 'ALL') params.set('pattern', filterPattern);
      if (filterSearch.trim()) params.set('q', filterSearch.trim());

      const res = await fetch(`/api/admin/pyq?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items)) {
          setPyqItems(data.items);
          setCurrentIndex(0);
          setIsFilterModalOpen(false);
        }
      }
    } catch (e) {
      console.error('[ScreenStudio] Filter fetch failed:', e);
    } finally {
      setIsFetchingFiltered(false);
    }
  };

  const activeDeck = deckType === 'pyq' ? pyqItems : thematicItems;
  const currentItem = activeDeck[currentIndex] || null;

  // ---------------- 4. 4-Phase Step Progression ----------------
  const [stepIndex, setStepIndex] = useState(0); // 0: Hook, 1: Statements/Notes, 2: Options/Facts, 3: Deep Dive/Traps
  const [userSelection, setUserSelection] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [crossedStmts, setCrossedStmts] = useState({});

  useEffect(() => {
    setStepIndex(0);
    setUserSelection(null);
    setShowAnswer(false);
    setCrossedStmts({});
    setZoomLevel(1);
    setZoomTarget('full');
    setZoomTransform({ scale: 1, x: 0, y: 0 });
  }, [currentIndex, deckType]);

  // ---------------- 5. Slide Queue Drawer ----------------
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [queueSearch, setQueueSearch] = useState('');

  // ---------------- 6. Annotation, Stylus & Blackboard Mode ----------------
  const [activeTool, setActiveTool] = useState('none'); // 'pen' | 'highlighter' | 'laser' | 'eraser' | 'none'
  const [penColor, setPenColor] = useState(theme === 'dark' ? '#ffffff' : '#0f172a');
  const [penSize, setPenSize] = useState(4);
  const [highlighterSize, setHighlighterSize] = useState(24);
  const [showPenPalette, setShowPenPalette] = useState(false);
  const [isBlackboard, setIsBlackboard] = useState(false);
  const [itemStrokes, setItemStrokes] = useState([]);
  const [stepStrokes, setStepStrokes] = useState([]);

  useEffect(() => {
    if (activeTool !== 'none') {
      setPenColor(theme === 'dark' ? '#ffffff' : '#0f172a');
    }
  }, [theme]);

  // Undo last stroke
  const undoLastStroke = () => {
    if (stepStrokes.length > 0) {
      setStepStrokes((prev) => prev.slice(0, -1));
    } else if (itemStrokes.length > 0) {
      setItemStrokes((prev) => prev.slice(0, -1));
    }
  };

  // Clear all annotations
  const clearAllStrokes = () => {
    setItemStrokes([]);
    setStepStrokes([]);
  };

  // ---------------- 7. Spring Zoom Physics Engine ----------------
  const [zoomLevel, setZoomLevel] = useState(1);
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
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select')) return;

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

  // ---------------- 8. Draggable Webcam PiP & Settings ----------------
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraShape, setCameraShape] = useState('circle'); // 'circle' | 'squircle' | 'pill' | 'rect'
  const [pipPosition, setPipPosition] = useState('br'); // 'br' | 'bl' | 'tr' | 'tl'
  const [cameraSize, setCameraSize] = useState(150); // px
  const [cameraGlow, setCameraGlow] = useState('violet'); // 'violet' | 'cyan' | 'mint' | 'gold' | 'white' | 'none'
  const [isMirrored, setIsMirrored] = useState(true);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [showCameraPopover, setShowCameraPopover] = useState(false);
  const videoPipRef = useRef(null);
  const cameraStreamRef = useRef(null);

  // Enumerate video devices
  useEffect(() => {
    async function listCameras() {
      try {
        if (navigator.mediaDevices?.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevs = devices.filter((d) => d.kind === 'videoinput');
          setAvailableCameras(videoDevs);
          if (videoDevs.length > 0 && !selectedCameraId) {
            setSelectedCameraId(videoDevs[0].deviceId);
          }
        }
      } catch (e) {
        // ignore
      }
    }
    listCameras();
  }, []);

  const toggleCamera = async () => {
    if (isCameraActive) {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
        cameraStreamRef.current = null;
      }
      setIsCameraActive(false);
    } else {
      try {
        const constraints = {
          video: selectedCameraId
            ? { deviceId: { exact: selectedCameraId }, width: { ideal: 640 }, height: { ideal: 640 } }
            : { width: { ideal: 640 }, height: { ideal: 640 } },
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
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
  }, [isCameraActive, cameraShape, pipPosition, cameraSize]);

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
      if (micStreamRef.current) micStreamRef.current.getTracks().forEach((t) => t.stop());
      setAudioLevel(0);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (audioCtx) audioCtx.close();
    };
  }, [isMicActive]);

  // ---------------- 10. Screen Recording (MP4 & 1-Click Tab Capture) ----------------
  const [recState, setRecState] = useState('idle'); // 'idle' | 'recording' | 'paused'
  const [recDuration, setRecDuration] = useState(0);
  const [preferredFormat, setPreferredFormat] = useState('mp4'); // 'mp4' | 'webm'
  const [actualMimeType, setActualMimeType] = useState('video/mp4');
  const [chapters, setChapters] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [copiedChapters, setCopiedChapters] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  // Auto-log chapter on question/topic change
  useEffect(() => {
    if (recState === 'recording' && currentItem) {
      const label =
        deckType === 'pyq'
          ? `Q${currentIndex + 1} (${currentItem.examYear || ''}) - ${currentItem.srcTopic || 'Prelims PYQ'}`
          : `Topic ${currentIndex + 1}: ${currentItem.title || 'Syllabus Note'}`;
      setChapters((prev) => [...prev, { startSec: recDuration, label }]);
    }
  }, [currentIndex, deckType, recState]);

  // Retake current slide timestamp
  const retakeCurrentSlide = () => {
    if (recState !== 'recording') return;
    setChapters((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        startSec: recDuration,
      };
      return updated;
    });
    setStepIndex(0);
    clearAllStrokes();
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      alert('Screen recording is not supported in this browser. Please use Chrome, Edge, or Brave on macOS.');
      return;
    }
    try {
      // 1. Request current tab directly with Chrome preferCurrentTab hints
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
        },
        audio: false,
        preferCurrentTab: true,
        selfBrowserSurface: 'include',
        surfaceSwitching: 'include',
        systemAudio: 'exclude',
      });

      const videoTrack = displayStream.getVideoTracks()[0];
      if ('contentHint' in videoTrack) {
        try {
          videoTrack.contentHint = 'detail';
        } catch (_) {}
      }

      // 2. Mix with presenter mic
      let combinedStream = displayStream;
      if (isMicActive && micStreamRef.current) {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const dest = audioCtx.createMediaStreamDestination();
        const micSource = audioCtx.createMediaStreamSource(micStreamRef.current);
        micSource.connect(dest);

        combinedStream = new MediaStream([
          videoTrack,
          ...dest.stream.getAudioTracks(),
        ]);
      }

      const selectedMime = getPreferredMimeType(preferredFormat);
      setActualMimeType(selectedMime);

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

        const isMp4 = selectedMime.includes('mp4');
        const ext = isMp4 ? 'mp4' : 'webm';
        await saveRecordingToVault({
          id: `ss_rec_${Date.now()}`,
          name: `ScreenStudio_${currentItem?.srcTopic || currentItem?.title || 'Lecture'}_${new Date().toISOString().slice(0, 10)}.${ext}`,
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

  // ---------------- 11. Wireless Presentation Clicker & Keyboard Shortcuts ----------------
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

      // Clicker: PageDown / RightArrow / Space
      if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        if (stepIndex < 3) {
          setStepIndex((s) => s + 1);
        } else if (currentIndex < activeDeck.length - 1) {
          setCurrentIndex((i) => i + 1);
        }
      }
      // Clicker: PageUp / LeftArrow
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        if (stepIndex > 0) {
          setStepIndex((s) => s - 1);
        } else if (currentIndex > 0) {
          setCurrentIndex((i) => i - 1);
        }
      }
      // Single Key Tool Shortcuts
      else if (e.key.toLowerCase() === 'p') {
        setActiveTool((prev) => (prev === 'pen' ? 'none' : 'pen'));
      } else if (e.key.toLowerCase() === 'h') {
        setActiveTool((prev) => (prev === 'highlighter' ? 'none' : 'highlighter'));
      } else if (e.key.toLowerCase() === 'l') {
        setActiveTool((prev) => (prev === 'laser' ? 'none' : 'laser'));
      } else if (e.key.toLowerCase() === 'e') {
        setActiveTool((prev) => (prev === 'eraser' ? 'none' : 'eraser'));
      } else if (e.key.toLowerCase() === 'b') {
        setIsBlackboard((prev) => !prev);
      } else if (e.key.toLowerCase() === 'c') {
        clearAllStrokes();
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
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

  const isMp4Output = actualMimeType.includes('mp4');
  const exportExtension = isMp4Output ? 'mp4' : 'webm';
  const penSwatches = theme === 'dark' ? DARK_PEN_SWATCHES : LIGHT_PEN_SWATCHES;

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

          {/* Deck Switcher */}
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

          {/* Load Deck / Filter Content Button */}
          <button
            type="button"
            className="ss-dock-btn is-active"
            onClick={() => setIsFilterModalOpen(true)}
            title="Load Content / Filter Syllabus Decks"
          >
            <Filter size={13} />
            <span>Filter Deck</span>
          </button>
        </div>

        {/* Center: Live Recording Indicator */}
        <div className="ss-nav-group">
          <div className={`ss-status-badge is-${recState}`}>
            {recState === 'recording' ? (
              <>
                <span className="ss-rec-pulsing-dot" />
                <span>REC {formatDurationTimestamp(recDuration)}</span>
                <span style={{ fontSize: 10, opacity: 0.8 }}>({exportExtension.toUpperCase()})</span>
              </>
            ) : recState === 'paused' ? (
              <span>PAUSED {formatDurationTimestamp(recDuration)}</span>
            ) : (
              <span>IDLE</span>
            )}
          </div>
        </div>

        {/* Right: Layout Controls, Queue Drawer & Theme */}
        <div className="ss-nav-group">
          <button
            type="button"
            className={`ss-dock-btn ${stageMode === 'framed-canvas' ? 'is-active' : ''}`}
            onClick={() =>
              setStageMode(stageMode === 'edge-to-edge' ? 'framed-canvas' : 'edge-to-edge')
            }
            title="Toggle Edge-to-Edge Desktop vs Framed Studio Canvas"
          >
            {stageMode === 'edge-to-edge' ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
            <span>{stageMode === 'edge-to-edge' ? 'Edge-to-Edge' : 'Framed Canvas'}</span>
          </button>

          <button
            type="button"
            className="ss-dock-btn"
            onClick={toggleFullscreen}
            title="Toggle Native Fullscreen Presentation (F)"
          >
            <Monitor size={13} />
            <span>Fullscreen</span>
          </button>

          <button
            type="button"
            className="ss-dock-btn"
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            title="Toggle Slide Deck Drawer"
          >
            <ListOrdered size={14} />
            <span>
              {currentIndex + 1} / {activeDeck.length}
            </span>
          </button>

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
        <div className={`ss-stage-viewport is-${stageMode}`} onClick={handleWindowClick}>
          <div
            className={
              stageMode === 'framed-canvas'
                ? `ss-canvas-frame bg-${wallpaper} ss-aspect-${aspectRatio}`
                : 'w-full h-full'
            }
            style={stageMode === 'framed-canvas' ? { padding: `${canvasPadding}px` } : {}}
          >
            <div
              ref={windowRef}
              className={`ss-mac-window ss-shadow-${shadowDepth}`}
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

                    <div ref={stemRef} className="ss-stem-text">
                      {parsedBlocks.map((b, idx) => {
                        if (b.type === 'stmts') {
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
                                    title="Click or tap to strike out or restore statement"
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
                  highlighterSize={highlighterSize}
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
                style={{
                  width: `${cameraSize}px`,
                  height: cameraShape === 'pill' ? `${Math.round(cameraSize * 0.68)}px` : `${cameraSize}px`,
                  boxShadow:
                    cameraGlow === 'violet'
                      ? '0 0 24px rgba(139, 92, 246, 0.4), 0 14px 36px rgba(0, 0, 0, 0.7)'
                      : cameraGlow === 'cyan'
                      ? '0 0 24px rgba(56, 189, 248, 0.4), 0 14px 36px rgba(0, 0, 0, 0.7)'
                      : cameraGlow === 'mint'
                      ? '0 0 24px rgba(52, 211, 153, 0.4), 0 14px 36px rgba(0, 0, 0, 0.7)'
                      : cameraGlow === 'gold'
                      ? '0 0 24px rgba(245, 158, 11, 0.4), 0 14px 36px rgba(0, 0, 0, 0.7)'
                      : '0 14px 36px rgba(0, 0, 0, 0.7)',
                }}
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
              title="Start 1080p Screen Recording (MP4 Default)"
            >
              <span className="ss-rec-pulsing-dot" />
              <span>Record ({preferredFormat.toUpperCase()})</span>
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
              {/* Retake Slide Button */}
              <button
                type="button"
                className="ss-dock-btn"
                onClick={retakeCurrentSlide}
                title="Retake current slide from 00:00 without stopping lecture"
              >
                <RotateCcw size={13} />
                <span>Retake</span>
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

          {/* 2. Stylus & Tablet Drawing Tools */}
          <div className="ss-seg-dock" title="Stylus Drawing Tools (iPad / Tablets Supported)">
            <button
              type="button"
              className={`ss-seg-btn ${activeTool === 'none' ? 'is-selected' : ''}`}
              onClick={() => setActiveTool('none')}
              title="Cursor / Selection mode"
            >
              Cursor
            </button>
            <button
              type="button"
              className={`ss-seg-btn ${activeTool === 'pen' ? 'is-selected' : ''}`}
              onClick={() => setActiveTool('pen')}
              title="Pen Tool (P)"
            >
              <PenTool size={13} />
            </button>
            <button
              type="button"
              className={`ss-seg-btn ${activeTool === 'highlighter' ? 'is-selected' : ''}`}
              onClick={() => setActiveTool('highlighter')}
              title="Highlighter (H)"
            >
              <Highlighter size={13} />
            </button>
            <button
              type="button"
              className={`ss-seg-btn ${activeTool === 'laser' ? 'is-selected' : ''}`}
              onClick={() => setActiveTool('laser')}
              title="Laser Pointer (L)"
            >
              <Zap size={13} />
            </button>
            <button
              type="button"
              className={`ss-seg-btn ${activeTool === 'eraser' ? 'is-selected' : ''}`}
              onClick={() => setActiveTool('eraser')}
              title="Eraser (E)"
            >
              <Eraser size={13} />
            </button>
          </div>

          {/* Pen Color & Size Popover Trigger */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className={`ss-dock-btn ${showPenPalette ? 'is-active' : ''}`}
              onClick={() => setShowPenPalette(!showPenPalette)}
              title="Pen Colors & Stroke Sizes"
            >
              <Palette size={13} />
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: penColor,
                  border: '1.5px solid var(--ss-border)',
                }}
              />
            </button>

            {showPenPalette && (
              <div className="ss-dock-popover">
                <div className="ss-popover-head">
                  <span>Pen &amp; Inking Colors</span>
                  <button
                    type="button"
                    className="ss-popover-close"
                    onClick={() => setShowPenPalette(false)}
                  >
                    ✕
                  </button>
                </div>

                {/* Swatches */}
                <div className="ss-popover-row">
                  <span className="ss-popover-label">Palette Color</span>
                  <div className="ss-swatches-grid">
                    {penSwatches.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`ss-swatch-circle ${penColor === color ? 'is-active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setPenColor(color)}
                      />
                    ))}
                    <input
                      type="color"
                      value={penColor}
                      onChange={(e) => setPenColor(e.target.value)}
                      style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer' }}
                      title="Custom Color"
                    />
                  </div>
                </div>

                {/* Stroke Width */}
                <div className="ss-popover-row">
                  <div className="ss-popover-label">
                    <span>Pen Stroke Size</span>
                    <span>{penSize}px</span>
                  </div>
                  <div className="ss-seg-dock" style={{ width: '100%', justifyContent: 'space-around' }}>
                    {[
                      { label: 'Fine (3px)', val: 3 },
                      { label: 'Medium (5px)', val: 5 },
                      { label: 'Bold (8px)', val: 8 },
                    ].map((s) => (
                      <button
                        key={s.val}
                        type="button"
                        className={`ss-seg-btn ${penSize === s.val ? 'is-selected' : ''}`}
                        onClick={() => setPenSize(s.val)}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions: Undo & Clear */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <button
                    type="button"
                    className="ss-dock-btn"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={undoLastStroke}
                  >
                    <Undo2 size={13} />
                    <span>Undo</span>
                  </button>
                  <button
                    type="button"
                    className="ss-dock-btn"
                    style={{ flex: 1, justifyContent: 'center', color: '#ef4444' }}
                    onClick={clearAllStrokes}
                  >
                    <Trash2 size={13} />
                    <span>Clear Ink (C)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Blackboard Toggle */}
          <button
            type="button"
            className={`ss-dock-btn ${isBlackboard ? 'is-active' : ''}`}
            onClick={() => setIsBlackboard(!isBlackboard)}
            title="Toggle Blackboard Scratchpad Mode (B)"
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
            title="Click inside stage to smoothly zoom in/out"
          >
            <ZoomIn size={14} />
            <span>Click Zoom</span>
          </button>

          <div className="ss-dock-divider" />

          {/* 4. Camera Popover & Toggle */}
          <div style={{ position: 'relative' }}>
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
                onClick={() => setShowCameraPopover(!showCameraPopover)}
                title="Camera Overlay Settings"
              >
                <Sliders size={13} />
              </button>
            )}

            {showCameraPopover && (
              <div className="ss-dock-popover">
                <div className="ss-popover-head">
                  <span>Webcam Settings</span>
                  <button
                    type="button"
                    className="ss-popover-close"
                    onClick={() => setShowCameraPopover(false)}
                  >
                    ✕
                  </button>
                </div>

                {/* Device Selector */}
                {availableCameras.length > 0 && (
                  <div className="ss-popover-row">
                    <span className="ss-popover-label">Camera Device</span>
                    <select
                      className="ss-form-select"
                      value={selectedCameraId}
                      onChange={(e) => setSelectedCameraId(e.target.value)}
                    >
                      {availableCameras.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                          {d.label || `Camera ${d.deviceId.slice(0, 5)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Camera Shape */}
                <div className="ss-popover-row">
                  <span className="ss-popover-label">Frame Shape</span>
                  <div className="ss-seg-dock" style={{ width: '100%', justifyContent: 'space-around' }}>
                    {['circle', 'squircle', 'pill'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`ss-seg-btn ${cameraShape === s ? 'is-selected' : ''}`}
                        onClick={() => setCameraShape(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Camera Size Slider */}
                <div className="ss-popover-row">
                  <div className="ss-popover-label">
                    <span>Camera Size</span>
                    <span>{cameraSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="110"
                    max="220"
                    step="10"
                    value={cameraSize}
                    onChange={(e) => setCameraSize(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--ss-accent)' }}
                  />
                </div>

                {/* Border Glow */}
                <div className="ss-popover-row">
                  <span className="ss-popover-label">Border Glow</span>
                  <div className="ss-seg-dock" style={{ width: '100%', justifyContent: 'space-around' }}>
                    {['violet', 'cyan', 'mint', 'gold', 'none'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        className={`ss-seg-btn ${cameraGlow === g ? 'is-selected' : ''}`}
                        onClick={() => setCameraGlow(g)}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mirror Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Mirror Video</span>
                  <button
                    type="button"
                    className={`ss-dock-btn ${isMirrored ? 'is-active' : ''}`}
                    onClick={() => setIsMirrored(!isMirrored)}
                  >
                    {isMirrored ? 'Mirrored ✓' : 'Natural'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="ss-dock-divider" />

          {/* 5. Studio Style Popover Trigger */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className={`ss-dock-btn ${showStylePopover ? 'is-active' : ''}`}
              onClick={() => setShowStylePopover(!showStylePopover)}
              title="Studio Wallpaper, Padding & Glow"
            >
              <Settings size={14} />
              <span>Style</span>
            </button>

            {showStylePopover && (
              <div className="ss-dock-popover popover-wide">
                <div className="ss-popover-head">
                  <span>Studio Canvas &amp; Framing</span>
                  <button
                    type="button"
                    className="ss-popover-close"
                    onClick={() => setShowStylePopover(false)}
                  >
                    ✕
                  </button>
                </div>

                {/* Layout Mode */}
                <div className="ss-popover-row">
                  <span className="ss-popover-label">Stage View Mode</span>
                  <div className="ss-seg-dock" style={{ width: '100%', justifyContent: 'space-around' }}>
                    <button
                      type="button"
                      className={`ss-seg-btn ${stageMode === 'edge-to-edge' ? 'is-selected' : ''}`}
                      onClick={() => setStageMode('edge-to-edge')}
                    >
                      Edge-to-Edge
                    </button>
                    <button
                      type="button"
                      className={`ss-seg-btn ${stageMode === 'framed-canvas' ? 'is-selected' : ''}`}
                      onClick={() => setStageMode('framed-canvas')}
                    >
                      Framed Canvas
                    </button>
                  </div>
                </div>

                {/* Wallpaper Swatches */}
                <div className="ss-popover-row">
                  <span className="ss-popover-label">Canvas Wallpaper</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                    {WALLPAPERS.map((wp) => (
                      <button
                        key={wp.id}
                        type="button"
                        className={`ss-swatch-circle ${wallpaper === wp.id ? 'is-active' : ''}`}
                        style={{ backgroundColor: wp.preview, width: '100%', aspectRatio: '1', borderRadius: 8 }}
                        onClick={() => setWallpaper(wp.id)}
                        title={wp.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio */}
                <div className="ss-popover-row">
                  <span className="ss-popover-label">Aspect Ratio (Social / Video)</span>
                  <div className="ss-seg-dock" style={{ width: '100%', justifyContent: 'space-around' }}>
                    {['16-9', '9-16', '1-1', '4-5'].map((ar) => (
                      <button
                        key={ar}
                        type="button"
                        className={`ss-seg-btn ${aspectRatio === ar ? 'is-selected' : ''}`}
                        onClick={() => setAspectRatio(ar)}
                      >
                        {ar.replace('-', ':')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Padding Slider */}
                <div className="ss-popover-row">
                  <div className="ss-popover-label">
                    <span>Backdrop Padding</span>
                    <span>{canvasPadding}px</span>
                  </div>
                  <input
                    type="range"
                    min="16"
                    max="96"
                    step="4"
                    value={canvasPadding}
                    onChange={(e) => setCanvasPadding(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--ss-accent)' }}
                  />
                </div>

                {/* Window Radius */}
                <div className="ss-popover-row">
                  <div className="ss-popover-label">
                    <span>Window Corner Radius</span>
                    <span>{windowRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="32"
                    step="2"
                    value={windowRadius}
                    onChange={(e) => setWindowRadius(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--ss-accent)' }}
                  />
                </div>

                {/* Shadow Depth */}
                <div className="ss-popover-row">
                  <span className="ss-popover-label">Shadow Depth</span>
                  <div className="ss-seg-dock" style={{ width: '100%', justifyContent: 'space-around' }}>
                    {['pro', 'glow', 'soft', 'flat'].map((sd) => (
                      <button
                        key={sd}
                        type="button"
                        className={`ss-seg-btn ${shadowDepth === sd ? 'is-selected' : ''}`}
                        onClick={() => setShadowDepth(sd)}
                      >
                        {sd}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="ss-dock-divider" />

          {/* 6. Step & Item Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              type="button"
              className="ss-dock-btn"
              disabled={currentIndex <= 0 && stepIndex <= 0}
              onClick={() => {
                if (stepIndex > 0) setStepIndex((s) => s - 1);
                else if (currentIndex > 0) setCurrentIndex((i) => i - 1);
              }}
              title="Previous Step / Question (Left Arrow / PageUp)"
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
              title="Next Step / Question (Space / Right Arrow / PageDown)"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </footer>

      {/* ---------------- Load Deck & Content Ingestion Modal ---------------- */}
      {isFilterModalOpen && (
        <div className="ss-modal-bg" onClick={() => setIsFilterModalOpen(false)}>
          <div className="ss-modal-box is-wide" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 19, fontWeight: 900 }}>
                  Load Studio Deck &amp; Content
                </h3>
                <p style={{ margin: 0, fontSize: 12.5, color: 'var(--ss-text-muted)' }}>
                  Filter Prelims PYQs by syllabus topics or load thematic masterclasses
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="ss-seg-dock" style={{ marginBottom: 18 }}>
              <button
                type="button"
                className={`ss-seg-btn ${deckType === 'pyq' ? 'is-selected' : ''}`}
                onClick={() => setDeckType('pyq')}
              >
                Prelims PYQ Filter
              </button>
              <button
                type="button"
                className={`ss-seg-btn ${deckType === 'thematic' ? 'is-selected' : ''}`}
                onClick={() => setDeckType('thematic')}
              >
                Thematic Topics ({thematicItems.length})
              </button>
            </div>

            {deckType === 'pyq' ? (
              <>
                <div className="ss-filter-grid">
                  {/* Subject */}
                  <div className="ss-form-group">
                    <label className="ss-form-label">Subject</label>
                    <select
                      className="ss-form-select"
                      value={filterSubject}
                      onChange={(e) => setFilterSubject(e.target.value)}
                    >
                      <option value="ALL">All Subjects</option>
                      {availableSubjects.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year */}
                  <div className="ss-form-group">
                    <label className="ss-form-label">Exam Year</label>
                    <select
                      className="ss-form-select"
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                    >
                      <option value="ALL">All Years (2011–2024)</option>
                      {availableYears.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pattern */}
                  <div className="ss-form-group">
                    <label className="ss-form-label">Question Pattern</label>
                    <select
                      className="ss-form-select"
                      value={filterPattern}
                      onChange={(e) => setFilterPattern(e.target.value)}
                    >
                      <option value="ALL">All Question Types</option>
                      <option value="PAIR">Pair-Based Questions</option>
                      <option value="STATEMENT">Statement I &amp; II Questions</option>
                    </select>
                  </div>

                  {/* Keyword Search */}
                  <div className="ss-form-group">
                    <label className="ss-form-label">Keyword Search</label>
                    <input
                      type="text"
                      className="ss-form-input"
                      placeholder="e.g. Fundamental Rights, Monsoon, GDP..."
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
                  <button
                    type="button"
                    className="ss-dock-btn"
                    onClick={() => {
                      setFilterSubject('ALL');
                      setFilterYear('ALL');
                      setFilterPattern('ALL');
                      setFilterSearch('');
                    }}
                  >
                    Reset Filters
                  </button>
                  <button
                    type="button"
                    className="ss-dock-record-btn"
                    style={{ background: 'var(--ss-accent)' }}
                    onClick={handleApplyPyqFilters}
                    disabled={isFetchingFiltered}
                  >
                    <span>{isFetchingFiltered ? 'Loading...' : 'Load Filtered PYQs'}</span>
                  </button>
                </div>
              </>
            ) : (
              <div style={{ maxHeight: '45vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {thematicItems.map((topic, idx) => (
                  <div
                    key={topic.id || idx}
                    className="ss-queue-item"
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsFilterModalOpen(false);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: 'var(--ss-accent)' }}>
                      <span>{topic.domain || 'General Studies'}</span>
                      <span>&middot;</span>
                      <span>{topic.topic}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{topic.title}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
                    Format: {exportExtension.toUpperCase()} &middot; Duration: {formatDurationTimestamp(recDuration)}
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
                download={`ScreenStudio_${currentItem?.srcTopic || currentItem?.title || 'Lecture'}_${new Date().toISOString().slice(0, 10)}.${exportExtension}`}
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
                <span>Download Studio Video (.{exportExtension})</span>
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
