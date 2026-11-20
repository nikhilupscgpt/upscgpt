'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Hand,
  PenTool,
  Highlighter,
  Zap,
  Eraser,
  Undo2,
  Trash2,
  FilePlus2,
  Eye,
  EyeOff,
  Radio,
  Square,
  Camera,
  CameraOff,
  ChevronDown,
  ChevronUp,
  Layers,
  Maximize2,
  Minimize2,
  ArrowLeft,
} from 'lucide-react';
import { getStructuredExplanation } from '@/lib/pyqExplanationHelper';
import { normalizeKeywordsList } from '@/lib/pyqKeywords';
import { parseStem } from '@/lib/pyqStemParser';
import './broadsheet.css';

const PEN_COLORS = [
  { hex: '#0f172a', label: 'Ink Black' },
  { hex: '#dc2626', label: 'Red' },
  { hex: '#2563eb', label: 'Royal Blue' },
  { hex: '#16a34a', label: 'Green' },
  { hex: '#d97706', label: 'Amber' },
];

const PEN_SIZES = [
  { size: 3, dot: 5, label: 'Fine (3px)' },
  { size: 5.5, dot: 8, label: 'Medium (5.5px)' },
  { size: 9, dot: 11, label: 'Bold (9px)' },
];

function stripHtmlTags(str) {
  return String(str || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function isCorrectVerdict(v) {
  const s = String(v || '').toLowerCase();
  return s.includes('correct') && !s.includes('incorrect') && !s.includes('not correct') && !s.includes('false');
}

function pointsToSmoothPath(pts) {
  if (!pts || pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)} L ${(pts[0].x + 0.1).toFixed(1)} ${(pts[0].y + 0.1).toFixed(1)}`;
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const midX = (pts[i].x + pts[i + 1].x) / 2;
    const midY = (pts[i].y + pts[i + 1].y) / 2;
    d += ` Q ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
  return d;
}

function normalizeValueAdditionGroups(va) {
  if (!va) return [];
  if (typeof va === 'string') {
    const bullets = va
      .split(/\r?\n/)
      .flatMap((line) => (line.includes(' • ') ? line.split(/\s*•\s*/) : [line]))
      .map((s) => stripHtmlTags(s.replace(/^[•*\-\s]+/, '')))
      .filter(Boolean);
    return bullets.length ? [{ title: 'Key Concepts & Prelims Value Addition', tag: '', bullets }] : [];
  }
  if (Array.isArray(va)) {
    const groups = [];
    for (const item of va) {
      if (typeof item === 'string') {
        const clean = stripHtmlTags(item);
        if (clean) groups.push({ title: '', tag: '', bullets: [clean] });
      } else if (item && typeof item === 'object') {
        const title = stripHtmlTags(item.title || item.heading || '');
        const tag = stripHtmlTags(item.tag || '');
        const bullets = [];
        if (Array.isArray(item.bullets || item.points || item.items)) {
          for (const b of item.bullets || item.points || item.items) {
            const txt = stripHtmlTags(typeof b === 'string' ? b : b?.text || '');
            if (txt) bullets.push(txt);
          }
        } else if (Array.isArray(item.sections)) {
          for (const sec of item.sections) {
            const secPts = sec.points || sec.bullets || [];
            for (const pt of secPts) {
              const txt = stripHtmlTags(typeof pt === 'string' ? pt : pt?.text || '');
              if (txt) bullets.push(txt);
            }
          }
        } else if (item.description) {
          bullets.push(stripHtmlTags(item.description));
        }
        if (title || bullets.length) groups.push({ title, tag, bullets: bullets.slice(0, 5) });
      }
    }
    return groups.slice(0, 3);
  }
  return [];
}

function renderBoldLead(text) {
  const s = String(text || '');
  const idx = s.indexOf(': ');
  if (idx > 1 && idx <= 55) {
    return (
      <>
        <strong>{s.slice(0, idx)}:</strong> {s.slice(idx + 2)}
      </>
    );
  }
  return s;
}

export default function BroadsheetPyqPresenter({ questions = [], onSwitchToClassic = null }) {
  // Deck of pages: PYQ broadsheets + user-inserted blank whiteboard pages
  const [pages, setPages] = useState(() =>
    (questions || []).map((q, idx) => ({
      id: q.id || `pyq_${idx}`,
      type: 'pyq',
      question: q,
    }))
  );
  const [pageIdx, setPageIdx] = useState(0);

  // Camera state: baseScale fits 1920x1080 into viewport; camZoom/pan are relative to full-sheet fit
  const viewportRef = useRef(null);
  const sheetRef = useRef(null);
  const [vpSize, setVpSize] = useState({ w: 1280, h: 720 });
  const [cam, setCam] = useState({ zoom: 1, x: 0, y: 0 });
  const [isSmoothCam, setIsSmoothCam] = useState(true);
  const [activeSection, setActiveSection] = useState(0); // 0 = overview, 1..8 = focused card

  // Spoiler-free Progressive Reveal
  const [revealMode, setRevealMode] = useState(false);
  const [revealedCards, setRevealedCards] = useState({}); // { [pageId]: Set/Object of section numbers }

  // Annotation state (world-space 1920x1080 coordinates per page)
  const [tool, setTool] = useState('pen'); // 'hand' | 'pen' | 'highlighter' | 'laser' | 'eraser'
  const [color, setColor] = useState('#dc2626');
  const [penSize, setPenSize] = useState(3);
  const [inkByPage, setInkByPage] = useState({}); // { [pageId]: Stroke[] }
  const [liveStroke, setLiveStroke] = useState(null);
  const [laserPt, setLaserPt] = useState(null);

  // Interaction refs
  const isDrawingRef = useRef(false);
  const isPanningRef = useRef(false);
  const spaceHeldRef = useRef(false);
  const panStartRef = useRef({ clientX: 0, clientY: 0, camX: 0, camY: 0 });

  // UI & Recording state
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [recActive, setRecActive] = useState(false);
  const [recSec, setRecSec] = useState(0);
  const [webcamOn, setWebcamOn] = useState(false);
  const [webcamCorner, setWebcamCorner] = useState('bottom-right');
  const webcamVideoRef = useRef(null);
  const webcamStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const displayStreamRef = useRef(null);
  const micStreamRef = useRef(null);
  const recChunksRef = useRef([]);

  const currentPage = pages[pageIdx] || null;
  const currentPageId = currentPage?.id || 'empty';
  const currentStrokes = inkByPage[currentPageId] || [];

  // Measure viewport dimensions
  useEffect(() => {
    const updateSize = () => {
      if (!viewportRef.current) return;
      const r = viewportRef.current.getBoundingClientRect();
      setVpSize({ w: Math.max(320, r.width), h: Math.max(240, r.height) });
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    if (viewportRef.current) ro.observe(viewportRef.current);
    window.addEventListener('resize', updateSize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, [dockCollapsed]);

  const baseScale = useMemo(() => {
    const pad = 20;
    return Math.min((vpSize.w - pad * 2) / 1920, (vpSize.h - pad * 2) / 1080);
  }, [vpSize]);

  const totalScale = baseScale * cam.zoom;
  const baseOffsetX = (vpSize.w - 1920 * baseScale) / 2;
  const baseOffsetY = (vpSize.h - 1080 * baseScale) / 2;
  const tx = baseOffsetX + cam.x;
  const ty = baseOffsetY + cam.y;

  // Reset camera to full-sheet overview
  const resetView = useCallback(() => {
    setIsSmoothCam(true);
    setCam({ zoom: 1, x: 0, y: 0 });
    setActiveSection(0);
  }, []);

  // Reset view when switching pages
  useEffect(() => {
    resetView();
  }, [pageIdx, resetView]);

  // Smooth zoom to a specific section (1..8) inside the 1920x1080 sheet
  const focusSection = useCallback((secNum) => {
    if (!sheetRef.current) return;
    const secEl = sheetRef.current.querySelector(`[data-bs-sec="${secNum}"]`);
    if (!secEl) return;

    // Reveal the card automatically if progressive reveal is enabled
    setRevealedCards((prev) => ({
      ...prev,
      [currentPageId]: { ...(prev[currentPageId] || {}), [secNum]: true },
    }));

    // Measure card position in 1920x1080 world space
    const sheetRect = sheetRef.current.getBoundingClientRect();
    const secRect = secEl.getBoundingClientRect();
    const sx = ((secRect.left - sheetRect.left) / sheetRect.width) * 1920;
    const sy = ((secRect.top - sheetRect.top) / sheetRect.height) * 1080;
    const sw = (secRect.width / sheetRect.width) * 1920;
    const sh = (secRect.height / sheetRect.height) * 1080;

    // Compute target zoom so the card fills ~84% of viewport comfortably
    const padFactor = 0.86;
    const zoomX = (vpSize.w * padFactor) / (sw * baseScale);
    const zoomY = (vpSize.h * padFactor) / (sh * baseScale);
    const targetZoom = Math.max(1.35, Math.min(2.35, Math.min(zoomX, zoomY)));

    const centerX = sx + sw / 2;
    const centerY = sy + sh / 2;
    const targetScale = baseScale * targetZoom;

    const targetTx = vpSize.w / 2 - centerX * targetScale;
    const targetTy = vpSize.h / 2 - centerY * targetScale;

    setIsSmoothCam(true);
    setCam({
      zoom: targetZoom,
      x: targetTx - baseOffsetX,
      y: targetTy - baseOffsetY,
    });
    setActiveSection(secNum);
  }, [baseOffsetX, baseOffsetY, baseScale, currentPageId, vpSize]);

  // Zoom step buttons (+ / -)
  const zoomBy = useCallback((factor, pivotClientX = null, pivotClientY = null) => {
    setIsSmoothCam(pivotClientX === null);
    setCam((prev) => {
      const nextZoom = Math.max(0.85, Math.min(3.5, prev.zoom * factor));
      if (nextZoom === prev.zoom) return prev;

      const vpRect = viewportRef.current?.getBoundingClientRect();
      const px = pivotClientX !== null && vpRect ? pivotClientX - vpRect.left : vpSize.w / 2;
      const py = pivotClientY !== null && vpRect ? pivotClientY - vpRect.top : vpSize.h / 2;

      const prevTx = baseOffsetX + prev.x;
      const prevTy = baseOffsetY + prev.y;
      const ratio = nextZoom / prev.zoom;

      const nextTx = px - (px - prevTx) * ratio;
      const nextTy = py - (py - prevTy) * ratio;

      return {
        zoom: nextZoom,
        x: nextTx - baseOffsetX,
        y: nextTy - baseOffsetY,
      };
    });
  }, [baseOffsetX, baseOffsetY, vpSize]);

  // Pinch-to-zoom & wheel zoom/pan on viewport
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const factor = e.deltaY < 0 ? 1.12 : 0.89;
      zoomBy(factor, e.clientX, e.clientY);
    } else {
      // Smooth 2-finger trackpad pan when zoomed in
      setIsSmoothCam(false);
      setCam((prev) => ({
        ...prev,
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  }, [zoomBy]);

  // Convert client pointer to exact 1920x1080 world coordinates
  const clientToWorld = useCallback((clientX, clientY) => {
    const rect = sheetRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return { x: 0, y: 0 };
    return {
      x: ((clientX - rect.left) / rect.width) * 1920,
      y: ((clientY - rect.top) / rect.height) * 1080,
    };
  }, []);

  // Erase any stroke near world point (wx, wy)
  const eraseAtPoint = useCallback((wx, wy) => {
    const threshold = 24 / Math.max(1, cam.zoom);
    setInkByPage((prev) => {
      const list = prev[currentPageId] || [];
      const filtered = list.filter((stroke) => {
        for (const p of stroke.points) {
          const dx = p.x - wx;
          const dy = p.y - wy;
          if (dx * dx + dy * dy <= threshold * threshold) return false;
        }
        return true;
      });
      if (filtered.length === list.length) return prev;
      return { ...prev, [currentPageId]: filtered };
    });
  }, [cam.zoom, currentPageId]);

  // Pointer handlers for viewport (panning) & SVG ink layer (drawing)
  const handleViewportPointerDown = (e) => {
    const wantsPan = tool === 'hand' || spaceHeldRef.current || e.button === 1;
    if (!wantsPan) return;
    e.preventDefault();
    isPanningRef.current = true;
    setIsSmoothCam(false);
    panStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      camX: cam.x,
      camY: cam.y,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handleViewportPointerMove = (e) => {
    if (!isPanningRef.current) return;
    const dx = e.clientX - panStartRef.current.clientX;
    const dy = e.clientY - panStartRef.current.clientY;
    setCam((prev) => ({
      ...prev,
      x: panStartRef.current.camX + dx,
      y: panStartRef.current.camY + dy,
    }));
  };

  const handleViewportPointerUp = () => {
    isPanningRef.current = false;
  };

  const handleSvgPointerDown = (e) => {
    if (tool === 'hand' || spaceHeldRef.current || e.button === 1) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const pt = clientToWorld(e.clientX, e.clientY);

    if (tool === 'laser') {
      isDrawingRef.current = true;
      setLaserPt(pt);
      return;
    }

    if (tool === 'eraser') {
      isDrawingRef.current = true;
      eraseAtPoint(pt.x, pt.y);
      return;
    }

    isDrawingRef.current = true;
    const stroke = {
      id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      tool,
      color: tool === 'highlighter' ? '#fde047' : color,
      width: tool === 'highlighter' ? 26 : penSize,
      points: [pt],
    };
    setLiveStroke(stroke);
  };

  const handleSvgPointerMove = (e) => {
    if (!isDrawingRef.current) return;
    const pt = clientToWorld(e.clientX, e.clientY);

    if (tool === 'laser') {
      setLaserPt(pt);
      return;
    }
    if (tool === 'eraser') {
      eraseAtPoint(pt.x, pt.y);
      return;
    }
    setLiveStroke((prev) => {
      if (!prev) return null;
      const last = prev.points[prev.points.length - 1];
      const dx = pt.x - last.x;
      const dy = pt.y - last.y;
      if (dx * dx + dy * dy < 3) return prev;
      return { ...prev, points: [...prev.points, pt] };
    });
  };

  const handleSvgPointerUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (tool === 'laser') {
      setLaserPt(null);
      return;
    }
    if (liveStroke && liveStroke.points.length > 0) {
      setInkByPage((prev) => ({
        ...prev,
        [currentPageId]: [...(prev[currentPageId] || []), liveStroke],
      }));
    }
    setLiveStroke(null);
  };

  const handleUndo = useCallback(() => {
    setInkByPage((prev) => {
      const list = prev[currentPageId] || [];
      if (list.length === 0) return prev;
      return { ...prev, [currentPageId]: list.slice(0, -1) };
    });
  }, [currentPageId]);

  const handleClearInk = useCallback(() => {
    setInkByPage((prev) => ({ ...prev, [currentPageId]: [] }));
  }, [currentPageId]);

  // Insert blank whiteboard page right after current page
  const handleInsertBlankPage = useCallback(() => {
    const newBlank = {
      id: `blank_${Date.now()}`,
      type: 'blank',
      pattern: 'plain', // 'plain' | 'dots' | 'ruled' | 'dark'
    };
    setPages((prev) => {
      const next = [...prev];
      next.splice(pageIdx + 1, 0, newBlank);
      return next;
    });
    setPageIdx((i) => i + 1);
    setTool('pen');
  }, [pageIdx]);

  const handleUpdateBlankPattern = (pattern) => {
    setPages((prev) =>
      prev.map((pg, idx) => (idx === pageIdx && pg.type === 'blank' ? { ...pg, pattern } : pg))
    );
  };

  const handleDeleteBlankPage = () => {
    if (!currentPage || currentPage.type !== 'blank') return;
    setPages((prev) => prev.filter((_, idx) => idx !== pageIdx));
    setPageIdx((i) => Math.max(0, i - 1));
  };

  // Webcam toggle
  const toggleWebcam = async () => {
    if (webcamOn) {
      webcamStreamRef.current?.getTracks().forEach((t) => t.stop());
      webcamStreamRef.current = null;
      setWebcamOn(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 360 }, audio: false });
      webcamStreamRef.current = stream;
      setWebcamOn(true);
      setTimeout(() => {
        if (webcamVideoRef.current) webcamVideoRef.current.srcObject = stream;
      }, 60);
    } catch {
      // ignore permission denial
    }
  };

  // Built-in Stage Recording
  useEffect(() => {
    if (!recActive) return undefined;
    const iv = setInterval(() => setRecSec((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [recActive]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    displayStreamRef.current?.getTracks().forEach((t) => t.stop());
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    displayStreamRef.current = null;
    micStreamRef.current = null;
    setRecActive(false);
  }, []);

  const toggleRecording = async () => {
    if (recActive) {
      stopRecording();
      return;
    }
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } },
        audio: false,
        preferCurrentTab: true,
        selfBrowserSurface: 'include',
      });
      const vTrack = displayStream.getVideoTracks()[0];
      if (viewportRef.current && window.CropTarget?.fromElement && vTrack?.cropTo) {
        try {
          const target = await window.CropTarget.fromElement(viewportRef.current);
          await vTrack.cropTo(target);
        } catch {}
      }
      displayStreamRef.current = displayStream;
      vTrack?.addEventListener('ended', stopRecording);

      let audioTracks = [];
      try {
        const mic = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          video: false,
        });
        micStreamRef.current = mic;
        audioTracks = mic.getAudioTracks();
      } catch {}

      const combined = new MediaStream([...(vTrack ? [vTrack] : []), ...audioTracks]);
      const mime = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/webm;codecs=vp9,opus', 'video/webm'].find((m) =>
        MediaRecorder.isTypeSupported(m)
      ) || 'video/webm';
      const ext = mime.includes('mp4') ? 'mp4' : 'webm';

      recChunksRef.current = [];
      const mr = new MediaRecorder(combined, { mimeType: mime, videoBitsPerSecond: 1800000, audioBitsPerSecond: 96000 });
      mr.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) recChunksRef.current.push(ev.data);
      };
      mr.onstop = () => {
        if (recChunksRef.current.length === 0) return;
        const blob = new Blob(recChunksRef.current, { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `UPSCGPT-Broadsheet-${new Date().toISOString().slice(0, 10)}-${Date.now()}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      };
      mr.start(2000);
      mediaRecorderRef.current = mr;
      setRecSec(0);
      setRecActive(true);
    } catch {
      // user cancelled picker
    }
  };

  // Fullscreen listener
  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName)) return;
      if (e.key === ' ') {
        e.preventDefault();
        spaceHeldRef.current = true;
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
        return;
      }
      if (e.key === 'Escape' || e.key === '0') {
        e.preventDefault();
        resetView();
        return;
      }
      if (/^[1-8]$/.test(e.key) && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        focusSection(Number(e.key));
        return;
      }
      switch (e.key.toLowerCase()) {
        case 'arrowright':
          setPageIdx((i) => Math.min(pages.length - 1, i + 1));
          break;
        case 'arrowleft':
          setPageIdx((i) => Math.max(0, i - 1));
          break;
        case 'v':
          setTool('hand');
          break;
        case 'p':
          setTool('pen');
          break;
        case 'h':
          setTool('highlighter');
          break;
        case 'l':
          setTool('laser');
          break;
        case 'e':
          setTool('eraser');
          break;
        case 'c':
          handleClearInk();
          break;
        case 'b':
          handleInsertBlankPage();
          break;
        case 'r':
          setRevealMode((m) => !m);
          break;
        case 'd':
          setDockCollapsed((d) => !d);
          break;
        case '=':
        case '+':
          zoomBy(1.22);
          break;
        case '-':
          zoomBy(0.82);
          break;
        default:
          break;
      }
    };
    const onKeyUp = (e) => {
      if (e.key === ' ') spaceHeldRef.current = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [focusSection, handleClearInk, handleInsertBlankPage, handleUndo, pages.length, resetView, zoomBy]);

  // Extract structured sections for the active PYQ page
  const pyqView = useMemo(() => {
    if (!currentPage || currentPage.type !== 'pyq') return null;
    const q = currentPage.question;
    const { explanationText, analysis } = getStructuredExplanation(q);
    const stemBlocks = parseStem(q.stem || '');
    const options = Array.isArray(q.options) ? q.options : [];
    const correctLabel = q.correctLabel ? String(q.correctLabel).toUpperCase() : null;
    const correctOpt = options.find((o) => String(o.label).toUpperCase() === correctLabel);
    const isLongOptions = options.some((o) => String(o.text || '').length > 52);

    const keywords = Array.isArray(analysis?.keywords) ? normalizeKeywordsList(analysis.keywords).slice(0, 4) : [];
    const breakdownItems = Array.isArray(analysis?.statementBreakdown) && analysis.statementBreakdown.length > 0
      ? { isStatement: true, items: analysis.statementBreakdown }
      : Array.isArray(analysis?.optionBreakdown) && analysis.optionBreakdown.length > 0
      ? { isStatement: false, items: analysis.optionBreakdown }
      : null;

    const vaGroups = normalizeValueAdditionGroups(analysis?.valueAddition);
    const inNews = analysis?.inNews && (analysis.inNews.headline || analysis.inNews.relevance || typeof analysis.inNews === 'string')
      ? (typeof analysis.inNews === 'string' ? { headline: analysis.inNews } : analysis.inNews)
      : null;
    const compTable = analysis?.visualSuggestion?.tableData?.headers ? analysis.visualSuggestion.tableData : null;
    const similarPyq = analysis?.similarPyq && (analysis.similarPyq.stem || analysis.similarPyq.keyTakeaway || typeof analysis.similarPyq === 'string')
      ? (typeof analysis.similarPyq === 'string' ? { stem: analysis.similarPyq } : analysis.similarPyq)
      : null;

    return {
      q,
      stemBlocks,
      options,
      correctLabel,
      correctOpt,
      isLongOptions,
      explanationText: stripHtmlTags(explanationText || analysis?.whyCorrect || ''),
      keywords,
      breakdownItems,
      vaGroups,
      inNews,
      compTable,
      similarPyq,
    };
  }, [currentPage]);

  const isCardBlurred = (secNum) => {
    if (!revealMode || secNum === 1) return false;
    return !revealedCards[currentPageId]?.[secNum];
  };

  const revealCard = (secNum) => {
    setRevealedCards((prev) => ({
      ...prev,
      [currentPageId]: { ...(prev[currentPageId] || {}), [secNum]: true },
    }));
  };

  if (!currentPage) {
    return (
      <div className="bs-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: 32, background: '#fff', borderRadius: 16 }}>
          <h2 style={{ margin: '0 0 12px' }}>No PYQs Selected</h2>
          <Link href="/admin/studio/pyq" style={{ color: '#2563eb', fontWeight: 700 }}>
            ← Back to PYQ Studio
          </Link>
        </div>
      </div>
    );
  }

  const fmtTimer = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="bs-root">
      {/* Main Interactive Camera Viewport */}
      <div
        ref={viewportRef}
        className={`bs-viewport ${dockCollapsed ? 'is-dock-collapsed' : ''}`}
        onWheel={handleWheel}
        onPointerDown={handleViewportPointerDown}
        onPointerMove={handleViewportPointerMove}
        onPointerUp={handleViewportPointerUp}
        style={{ cursor: tool === 'hand' ? 'grab' : 'default' }}
      >
        <div
          ref={sheetRef}
          className={`bs-camera ${isSmoothCam ? 'is-smooth' : ''}`}
          style={{
            transform: `translate(${tx}px, ${ty}px) scale(${totalScale})`,
          }}
        >
          {/* =========================================================== */}
          {/* PAGE TYPE A: BLANK INSERTED WHITEBOARD PAGE                 */}
          {/* =========================================================== */}
          {currentPage.type === 'blank' ? (
            <div className={`bs-blank-sheet pattern-${currentPage.pattern || 'plain'}`}>
              <div className="bs-blank-controls" onPointerDown={(e) => e.stopPropagation()}>
                {['plain', 'dots', 'ruled', 'dark'].map((pat) => (
                  <button
                    key={pat}
                    type="button"
                    onClick={() => handleUpdateBlankPattern(pat)}
                    className={`bs-blank-pill-btn ${currentPage.pattern === pat ? 'is-active' : ''}`}
                  >
                    {pat.charAt(0).toUpperCase() + pat.slice(1)}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleDeleteBlankPage}
                  className="bs-blank-pill-btn is-danger"
                  title="Remove this blank page"
                >
                  Delete Page
                </button>
              </div>
              <div style={{ flex: 1 }} />
              <footer className="bs-footer" style={currentPage.pattern === 'dark' ? { background: '#0b1120', borderColor: '#1e293b', color: '#94a3b8' } : undefined}>
                <div>
                  <span className="bs-footer-brand">UPSCGPT</span> · Blank Whiteboard Page
                </div>
                <div>Page {pageIdx + 1} of {pages.length}</div>
              </footer>
            </div>
          ) : pyqView ? (
            /* ========================================================= */
            /* PAGE TYPE B: 1-PAGE UPSC BROADSHEET BLUEPRINT             */
            /* ========================================================= */
            <div className="bs-sheet">
              {/* Header Bar */}
              <header className="bs-header">
                <div className="bs-header-left">
                  <span className="bs-exam-pill">
                    {pyqView.q.examName || 'UPSC CSE Prelims'} {pyqView.q.examYear || ''}
                  </span>
                  <div className="bs-breadcrumb">
                    <span>{pyqView.q.srcSubject || 'General Studies'}</span>
                    {pyqView.q.srcTopic && (
                      <>
                        <span>›</span>
                        <strong>{pyqView.q.srcTopic}</strong>
                      </>
                    )}
                  </div>
                </div>
                <span className="bs-qno-pill">
                  {pyqView.q.questionNo ? `Q #${pyqView.q.questionNo}` : `Q ${pageIdx + 1}`}
                </span>
              </header>

              {/* 2-Column Broadsheet Grid */}
              <div className="bs-body-grid">
                {/* LEFT COLUMN: ① QUESTION, ② ANSWER, ③ KEYWORDS, ④ BREAKDOWN */}
                <div className="bs-col">
                  {/* ① QUESTION (Authentic UPSC Prelims Paper Format) */}
                  <section className="bs-section bs-tone-blue" data-bs-sec="1">
                    <div className="bs-section-head">
                      <button
                        type="button"
                        className="bs-section-title-btn"
                        onClick={() => (activeSection === 1 ? resetView() : focusSection(1))}
                        title="Click or press [1] to zoom onto Question"
                      >
                        <span className="bs-section-num">1</span>
                        <span className="bs-section-label">Question</span>
                      </button>
                      <div className="bs-your-answer">
                        <span>Your answer</span>
                        <span className="bs-your-answer-box" />
                      </div>
                    </div>

                    <div className="bs-card bs-upsc-paper">
                      {pyqView.stemBlocks.map((b, i) => {
                        if (b.type === 'stmts') {
                          return (
                            <div key={i} className="bs-upsc-stmts">
                              {b.items.map((st, k) => (
                                <div key={k} className="bs-upsc-stmt-row">
                                  <span className="bs-upsc-stmt-key">{st.key}.</span>
                                  <span>{st.text}</span>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        if (b.type === 'table' && Array.isArray(b.rows)) {
                          return (
                            <table key={i} className="bs-upsc-table">
                              {Array.isArray(b.headers) && b.headers.length > 0 && (
                                <thead>
                                  <tr>
                                    {b.headers.map((h, hi) => <th key={hi}>{h}</th>)}
                                  </tr>
                                </thead>
                              )}
                              <tbody>
                                {b.rows.map((row, ri) => (
                                  <tr key={ri}>
                                    {row.map((cell, ci) => <td key={ci}>{cell}</td>)}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          );
                        }
                        return (
                          <p key={i} className={b.isPrompt ? 'bs-upsc-ask' : 'bs-upsc-lead'}>
                            {b.text}
                          </p>
                        );
                      })}

                      {pyqView.options.length > 0 && (
                        <div className={`bs-options-grid ${pyqView.isLongOptions ? 'is-single-col' : ''}`}>
                          {pyqView.options.map((opt) => {
                            const lbl = String(opt.label || '').toLowerCase();
                            const isCorrect =
                              !isCardBlurred(2) &&
                              pyqView.correctLabel &&
                              lbl.toUpperCase() === pyqView.correctLabel;
                            return (
                              <div key={lbl} className={`bs-opt-card ${isCorrect ? 'is-correct-opt' : ''}`}>
                                <span className="bs-opt-badge">{lbl}</span>
                                <span>{opt.text}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </section>

                  {/* ② ANSWER */}
                  <section className="bs-section bs-tone-green" data-bs-sec="2">
                    <div className="bs-section-head">
                      <button
                        type="button"
                        className="bs-section-title-btn"
                        onClick={() => (activeSection === 2 ? resetView() : focusSection(2))}
                        title="Click or press [2] to zoom onto Answer"
                      >
                        <span className="bs-section-num">2</span>
                        <span className="bs-section-label">Answer</span>
                      </button>
                    </div>
                    <div
                      className={`bs-card ${isCardBlurred(2) ? 'is-blurred' : ''}`}
                      onClick={() => isCardBlurred(2) && revealCard(2)}
                    >
                      <div className="bs-answer-head">
                        {pyqView.correctLabel && (
                          <span className="bs-answer-pill">({pyqView.correctLabel.toLowerCase()})</span>
                        )}
                        {pyqView.correctOpt && (
                          <span className="bs-answer-opt-text">{pyqView.correctOpt.text}</span>
                        )}
                      </div>
                      <p className="bs-card-text">
                        {pyqView.explanationText ||
                          `As per the official ${pyqView.q.examName} (${pyqView.q.examYear}) answer key, option (${(pyqView.correctLabel || '').toLowerCase()}) is correct.`}
                      </p>
                    </div>
                  </section>

                  {/* ③ KEYWORDS */}
                  {pyqView.keywords.length > 0 && (
                    <section className="bs-section bs-tone-sky" data-bs-sec="3">
                      <div className="bs-section-head">
                        <button
                          type="button"
                          className="bs-section-title-btn"
                          onClick={() => (activeSection === 3 ? resetView() : focusSection(3))}
                          title="Click or press [3] to zoom onto Keywords"
                        >
                          <span className="bs-section-num">3</span>
                          <span className="bs-section-label">Keywords</span>
                        </button>
                      </div>
                      <div
                        className={`bs-card bs-list-stack ${isCardBlurred(3) ? 'is-blurred' : ''}`}
                        onClick={() => isCardBlurred(3) && revealCard(3)}
                      >
                        {pyqView.keywords.map((kw, i) => (
                          <div key={i} className="bs-kw-item">
                            <span className="bs-kw-term">{stripHtmlTags(kw.term)}:</span>{' '}
                            <span>{stripHtmlTags(kw.shortNote || '')}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* ④ STATEMENT / OPTION BREAKDOWN */}
                  {pyqView.breakdownItems && (
                    <section className="bs-section bs-tone-orange" data-bs-sec="4">
                      <div className="bs-section-head">
                        <button
                          type="button"
                          className="bs-section-title-btn"
                          onClick={() => (activeSection === 4 ? resetView() : focusSection(4))}
                          title="Click or press [4] to zoom onto Breakdown"
                        >
                          <span className="bs-section-num">4</span>
                          <span className="bs-section-label">
                            {pyqView.breakdownItems.isStatement ? 'Statement Breakdown' : 'Option Breakdown'}
                          </span>
                        </button>
                      </div>
                      <div
                        className={`bs-card bs-list-stack ${isCardBlurred(4) ? 'is-blurred' : ''}`}
                        onClick={() => isCardBlurred(4) && revealCard(4)}
                      >
                        {pyqView.breakdownItems.items.slice(0, 4).map((it, idx) => {
                          const ok = isCorrectVerdict(it.verdict);
                          const label = pyqView.breakdownItems.isStatement
                            ? `Statement ${it.statementNo || idx + 1}`
                            : `Option (${String(it.label || idx + 1).toLowerCase()})`;
                          return (
                            <div key={idx} className="bs-stmt-item">
                              <span className={ok ? 'bs-stmt-correct' : 'bs-stmt-wrong'}>
                                {label} ({ok ? 'Correct' : 'Incorrect'}) —{' '}
                              </span>
                              <span>{stripHtmlTags(it.explanation || it.text || '')}</span>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}
                </div>

                {/* RIGHT COLUMN: ⑤ VALUE ADDITION, ⑥ IN NEWS, ⑦ COMPARISON, ⑧ SIMILAR PYQ */}
                <div className="bs-col">
                  {/* ⑤ VALUE ADDITION */}
                  {pyqView.vaGroups.length > 0 && (
                    <section className="bs-section bs-tone-amber" data-bs-sec="5">
                      <div className="bs-section-head">
                        <button
                          type="button"
                          className="bs-section-title-btn"
                          onClick={() => (activeSection === 5 ? resetView() : focusSection(5))}
                          title="Click or press [5] to zoom onto Value Addition"
                        >
                          <span className="bs-section-num">5</span>
                          <span className="bs-section-label">Value Addition</span>
                        </button>
                      </div>
                      <div
                        className={`bs-card ${isCardBlurred(5) ? 'is-blurred' : ''}`}
                        onClick={() => isCardBlurred(5) && revealCard(5)}
                      >
                        {pyqView.vaGroups.map((g, gi) => (
                          <div key={gi} className="bs-va-group">
                            {g.title && (
                              <h4 className="bs-va-heading">
                                {g.title}
                                {g.tag && <span className="bs-va-tag">· {g.tag}</span>}
                              </h4>
                            )}
                            <ul className="bs-va-ul">
                              {g.bullets.map((b, bi) => (
                                <li key={bi}>{renderBoldLead(b)}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* ⑥ IN NEWS */}
                  {pyqView.inNews && (
                    <section className="bs-section bs-tone-purple" data-bs-sec="6">
                      <div className="bs-section-head">
                        <button
                          type="button"
                          className="bs-section-title-btn"
                          onClick={() => (activeSection === 6 ? resetView() : focusSection(6))}
                          title="Click or press [6] to zoom onto In News"
                        >
                          <span className="bs-section-num">6</span>
                          <span className="bs-section-label">In News</span>
                        </button>
                      </div>
                      <div
                        className={`bs-card ${isCardBlurred(6) ? 'is-blurred' : ''}`}
                        onClick={() => isCardBlurred(6) && revealCard(6)}
                      >
                        {(pyqView.inNews.source || pyqView.inNews.date) && (
                          <div className="bs-news-meta">
                            {[pyqView.inNews.source, pyqView.inNews.date].filter(Boolean).join(' · ')}
                          </div>
                        )}
                        {pyqView.inNews.headline && (
                          <h4 className="bs-news-headline">{stripHtmlTags(pyqView.inNews.headline)}</h4>
                        )}
                        {(pyqView.inNews.relevance || pyqView.inNews.context) && (
                          <p className="bs-card-text">
                            {stripHtmlTags(pyqView.inNews.relevance || pyqView.inNews.context)}
                          </p>
                        )}
                      </div>
                    </section>
                  )}

                  {/* ⑦ COMPARISON TABLE */}
                  {pyqView.compTable && (
                    <section className="bs-section bs-tone-teal" data-bs-sec="7">
                      <div className="bs-section-head">
                        <button
                          type="button"
                          className="bs-section-title-btn"
                          onClick={() => (activeSection === 7 ? resetView() : focusSection(7))}
                          title="Click or press [7] to zoom onto Comparison Table"
                        >
                          <span className="bs-section-num">7</span>
                          <span className="bs-section-label">Comparison</span>
                        </button>
                      </div>
                      <div
                        className={`bs-card ${isCardBlurred(7) ? 'is-blurred' : ''}`}
                        onClick={() => isCardBlurred(7) && revealCard(7)}
                      >
                        <table className="bs-comp-table">
                          <thead>
                            <tr>
                              {pyqView.compTable.headers.map((h, hi) => (
                                <th key={hi}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(pyqView.compTable.rows || []).slice(0, 6).map((row, ri) => (
                              <tr key={ri}>
                                {row.map((cell, ci) => (
                                  <td key={ci}>{stripHtmlTags(cell)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}

                  {/* ⑧ SIMILAR PYQ */}
                  {pyqView.similarPyq && (
                    <section className="bs-section bs-tone-rose" data-bs-sec="8">
                      <div className="bs-section-head">
                        <button
                          type="button"
                          className="bs-section-title-btn"
                          onClick={() => (activeSection === 8 ? resetView() : focusSection(8))}
                          title="Click or press [8] to zoom onto Similar PYQ"
                        >
                          <span className="bs-section-num">8</span>
                          <span className="bs-section-label">Similar PYQ</span>
                        </button>
                      </div>
                      <div
                        className={`bs-card ${isCardBlurred(8) ? 'is-blurred' : ''}`}
                        onClick={() => isCardBlurred(8) && revealCard(8)}
                      >
                        {(pyqView.similarPyq.examName || pyqView.similarPyq.examYear) && (
                          <div style={{ fontSize: 12, fontWeight: 800, color: '#be123c', marginBottom: 4 }}>
                            {[pyqView.similarPyq.examName, pyqView.similarPyq.examYear].filter(Boolean).join(' ')}
                          </div>
                        )}
                        {pyqView.similarPyq.stem && (
                          <p className="bs-card-text" style={{ marginBottom: pyqView.similarPyq.keyTakeaway ? 5 : 0 }}>
                            {stripHtmlTags(pyqView.similarPyq.stem).slice(0, 260)}
                          </p>
                        )}
                        {pyqView.similarPyq.keyTakeaway && (
                          <p className="bs-card-text" style={{ fontWeight: 600, color: '#881337' }}>
                            {stripHtmlTags(pyqView.similarPyq.keyTakeaway)}
                          </p>
                        )}
                      </div>
                    </section>
                  )}
                </div>
              </div>

              {/* Footer */}
              <footer className="bs-footer">
                <div>
                  <span className="bs-footer-brand">UPSCGPT</span> · High-Yield Prelims Architecture
                </div>
                <div>Page {pageIdx + 1} of {pages.length}</div>
              </footer>
            </div>
          ) : null}

          {/* =========================================================== */}
          {/* WORLD-SPACE VECTOR SVG INK LAYER (1920x1080)                */}
          {/* Locked to the sheet — zero drift at any zoom level!         */}
          {/* =========================================================== */}
          <svg
            viewBox="0 0 1920 1080"
            className={`bs-ink-svg ${tool === 'hand' ? 'is-panning' : 'is-interactive'}`}
            onPointerDown={handleSvgPointerDown}
            onPointerMove={handleSvgPointerMove}
            onPointerUp={handleSvgPointerUp}
            onPointerCancel={handleSvgPointerUp}
          >
            {currentStrokes.map((st) => (
              <path
                key={st.id}
                d={pointsToSmoothPath(st.points)}
                fill="none"
                stroke={st.color}
                strokeWidth={st.width}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity={st.tool === 'highlighter' ? 0.38 : 0.95}
                style={st.tool === 'highlighter' ? { mixBlendMode: 'multiply' } : undefined}
              />
            ))}
            {liveStroke && (
              <path
                d={pointsToSmoothPath(liveStroke.points)}
                fill="none"
                stroke={liveStroke.color}
                strokeWidth={liveStroke.width}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity={liveStroke.tool === 'highlighter' ? 0.38 : 0.95}
                style={liveStroke.tool === 'highlighter' ? { mixBlendMode: 'multiply' } : undefined}
              />
            )}
            {laserPt && (
              <g>
                <circle cx={laserPt.x} cy={laserPt.y} r={16} fill="rgba(239, 68, 68, 0.25)" />
                <circle cx={laserPt.x} cy={laserPt.y} r={6} fill="#ef4444" />
              </g>
            )}
          </svg>
        </div>

        {/* Live Webcam PiP (Inside Viewport so CropTarget captures it!) */}
        {webcamOn && (
          <div
            onClick={() => {
              const corners = ['bottom-right', 'bottom-left', 'top-left', 'top-right'];
              setWebcamCorner((c) => corners[(corners.indexOf(c) + 1) % corners.length]);
            }}
            title="Click to move webcam corner"
            style={{
              position: 'absolute',
              zIndex: 50,
              width: 210,
              height: 136,
              borderRadius: 14,
              overflow: 'hidden',
              border: '2.5px solid #2563eb',
              boxShadow: '0 12px 32px rgba(15, 23, 42, 0.38)',
              background: '#0f172a',
              cursor: 'pointer',
              ...(webcamCorner === 'top-left' ? { top: 18, left: 18 } :
                 webcamCorner === 'top-right' ? { top: 18, right: 18 } :
                 webcamCorner === 'bottom-left' ? { bottom: 18, left: 18 } :
                 { bottom: 18, right: 18 }),
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
        )}
      </div>

      {/* ============================================================= */}
      {/* CLEAN MINIMAL SINGLE-ROW FLOATING DOCK                        */}
      {/* ============================================================= */}
      {dockCollapsed ? (
        <button
          type="button"
          className="bs-dock-collapsed-pill"
          onClick={() => setDockCollapsed(false)}
          title="Expand Studio Dock [D]"
        >
          <ChevronUp size={14} />
          <span>{recActive ? `REC ${fmtTimer(recSec)}` : `Page ${pageIdx + 1}/${pages.length} · Tools`}</span>
        </button>
      ) : (
        <footer className="bs-dock">
          {/* Back to PYQ Studio */}
          <Link href="/admin/studio/pyq" className="bs-dock-btn" title="Back to PYQ Studio" style={{ textDecoration: 'none' }}>
            <ArrowLeft size={15} />
          </Link>

          <div className="bs-dock-sep" />

          {/* Page Navigation + Insert Blank Page */}
          <button
            type="button"
            className="bs-dock-btn"
            disabled={pageIdx <= 0}
            onClick={() => setPageIdx((i) => Math.max(0, i - 1))}
            title="Previous Page [Left Arrow]"
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#f8fafc', padding: '0 4px', whiteSpace: 'nowrap' }}>
            {pageIdx + 1} / {pages.length}
          </span>
          <button
            type="button"
            className="bs-dock-btn"
            disabled={pageIdx >= pages.length - 1}
            onClick={() => setPageIdx((i) => Math.min(pages.length - 1, i + 1))}
            title="Next Page [Right Arrow]"
          >
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            className="bs-dock-btn"
            onClick={handleInsertBlankPage}
            title="Insert Blank Whiteboard Page After Current [B]"
          >
            <FilePlus2 size={15} />
            <span>+ Blank</span>
          </button>

          <div className="bs-dock-sep" />

          {/* Zoom Controls + Quick Section Jump (1-8) */}
          <button type="button" className="bs-dock-btn" onClick={() => zoomBy(0.82)} title="Zoom Out [-]">
            <ZoomOut size={15} />
          </button>
          <button
            type="button"
            className={`bs-dock-btn ${cam.zoom === 1 ? 'is-active' : ''}`}
            onClick={resetView}
            title="Fit Full Sheet [0 / Esc]"
          >
            <Maximize size={13} />
            <span>{Math.round(cam.zoom * 100)}%</span>
          </button>
          <button type="button" className="bs-dock-btn" onClick={() => zoomBy(1.22)} title="Zoom In [+]">
            <ZoomIn size={15} />
          </button>

          {/* Progressive Reveal Toggle */}
          <button
            type="button"
            className={`bs-dock-btn ${revealMode ? 'is-active' : ''}`}
            onClick={() => setRevealMode((m) => !m)}
            title="Toggle Progressive Reveal (Blur Answers Until Clicked) [R]"
          >
            {revealMode ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>

          <div className="bs-dock-sep" />

          {/* Annotation Tools */}
          <button
            type="button"
            className={`bs-dock-btn ${tool === 'hand' ? 'is-active' : ''}`}
            onClick={() => setTool('hand')}
            title="Pan / Click Cards [V] (or hold Space)"
          >
            <Hand size={15} />
          </button>
          <button
            type="button"
            className={`bs-dock-btn ${tool === 'pen' ? 'is-active' : ''}`}
            onClick={() => setTool('pen')}
            title="Pen [P]"
          >
            <PenTool size={15} />
          </button>
          <button
            type="button"
            className={`bs-dock-btn ${tool === 'highlighter' ? 'is-active' : ''}`}
            onClick={() => setTool('highlighter')}
            title="Highlighter [H]"
          >
            <Highlighter size={15} />
          </button>
          <button
            type="button"
            className={`bs-dock-btn ${tool === 'laser' ? 'is-active' : ''}`}
            onClick={() => setTool('laser')}
            title="Laser Pointer [L]"
          >
            <Zap size={15} />
          </button>
          <button
            type="button"
            className={`bs-dock-btn ${tool === 'eraser' ? 'is-active' : ''}`}
            onClick={() => setTool('eraser')}
            title="Stroke Eraser [E]"
          >
            <Eraser size={15} />
          </button>

          {/* Colors */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '0 4px' }}>
            {PEN_COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                className={`bs-color-dot ${color === c.hex ? 'is-selected' : ''}`}
                style={{ background: c.hex }}
                onClick={() => {
                  setColor(c.hex);
                  if (tool === 'hand' || tool === 'eraser') setTool('pen');
                }}
                title={c.label}
              />
            ))}
          </div>

          {/* Pen Sizes */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            {PEN_SIZES.map((s) => (
              <button
                key={s.size}
                type="button"
                className={`bs-dock-btn ${penSize === s.size ? 'is-active' : ''}`}
                style={{ minWidth: 26, padding: '0 5px' }}
                onClick={() => {
                  setPenSize(s.size);
                  if (tool === 'hand' || tool === 'eraser') setTool('pen');
                }}
                title={s.label}
              >
                <span style={{ width: s.dot, height: s.dot, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
              </button>
            ))}
          </div>

          <button type="button" className="bs-dock-btn" onClick={handleUndo} title="Undo [Cmd+Z]">
            <Undo2 size={15} />
          </button>
          <button type="button" className="bs-dock-btn" onClick={handleClearInk} title="Clear Page Ink [C]">
            <Trash2 size={15} />
          </button>

          <div className="bs-dock-sep" />

          {/* Record, Webcam, Fullscreen, Classic Mode Switch, Collapse */}
          <button
            type="button"
            className={`bs-dock-btn ${recActive ? 'is-rec' : ''}`}
            onClick={toggleRecording}
            title={recActive ? 'Stop Recording & Download Video' : 'Record Stage + Mic'}
          >
            {recActive ? <Square size={13} fill="currentColor" /> : <Radio size={14} />}
            <span>{recActive ? fmtTimer(recSec) : 'REC'}</span>
          </button>

          <button
            type="button"
            className={`bs-dock-btn ${webcamOn ? 'is-active' : ''}`}
            onClick={toggleWebcam}
            title="Toggle Webcam PiP"
          >
            {webcamOn ? <Camera size={15} /> : <CameraOff size={15} />}
          </button>

          <button type="button" className="bs-dock-btn" onClick={toggleFullscreen} title="Toggle Fullscreen">
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          {onSwitchToClassic && (
            <button
              type="button"
              className="bs-dock-btn"
              onClick={onSwitchToClassic}
              title="Switch to Classic Slide View"
            >
              <Layers size={14} />
              <span>Slides</span>
            </button>
          )}

          <button
            type="button"
            className="bs-dock-btn"
            onClick={() => setDockCollapsed(true)}
            title="Hide Dock [D]"
          >
            <ChevronDown size={15} />
          </button>
        </footer>
      )}
    </div>
  );
}
