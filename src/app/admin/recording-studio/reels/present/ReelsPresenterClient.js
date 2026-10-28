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
  Settings,
  CheckCircle2,
  XCircle,
  Sparkles,
  Tag,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
  ListOrdered,
  X,
  Move,
  FilePlus2,
  FlipHorizontal,
  Smartphone,
  HelpCircle,
} from 'lucide-react';
import { buildPyqReelSteps, buildMappingReelSteps } from '@/lib/reelSlideDeck';
import { parseStem } from '@/app/prelims/pyq/StemView';
import {
  saveRecordingToVault,
  formatDurationTimestamp,
} from '@/lib/recordingVaultDb';
import PyqAnnotationCanvas from '../../../pyq/present/PyqAnnotationCanvas';
import StudioPresenterMap from '../../../pyq/present/StudioPresenterMap';
import '../../../pyq/present/present.css';
import './reels-present.css';

const DARK_PALETTE = ['#ffffff', '#f59e0b', '#38bdf8', '#34d399', '#fb7185'];
const LIGHT_PALETTE = ['#0f172a', '#2563eb', '#dc2626', '#059669', '#d97706'];

const REEL_PRESETS = {
  vertical_1080p: {
    label: '9:16 Vertical 1080×1920 (24 fps · ~5 MB/min — Recommended)',
    width: 1080,
    height: 1920,
    fps: 24,
    videoBitsPerSecond: 950000, // 950 kbps
    audioBitsPerSecond: 64000,
  },
  vertical_720p: {
    label: '9:16 Vertical 720×1280 (24 fps · ~3.5 MB/min)',
    width: 720,
    height: 1280,
    fps: 24,
    videoBitsPerSecond: 600000,
    audioBitsPerSecond: 64000,
  },
  vertical_high: {
    label: '9:16 High Bitrate 1080×1920 (30 fps · ~12 MB/min)',
    width: 1080,
    height: 1920,
    fps: 30,
    videoBitsPerSecond: 1800000,
    audioBitsPerSecond: 96000,
  },
};

function getSupportedMimeType(preferredFormat = 'vp9') {
  if (typeof window === 'undefined' || typeof window.MediaRecorder === 'undefined') {
    return 'video/webm';
  }
  const vp9First = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/mp4',
    'video/webm',
  ];
  const mp4First = [
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  const list = preferredFormat === 'mp4' ? mp4First : vp9First;
  for (const m of list) {
    if (window.MediaRecorder.isTypeSupported(m)) return m;
  }
  return 'video/webm';
}

function buildSocialCaption(item) {
  if (!item) return 'UPSC Prelims Daily Challenge! Comment your answer below 👇\n\n#UPSC #IAS #UPSCPrelims #UPSCGPT';
  if (item.type === 'mapping') {
    const place = item.place || item.title || 'Mapping';
    return `🗺️ UPSC Mapping Spotlight: ${place} (${item.regionScope || 'India'})\n\nSave this Reel for your Prelims revision! 📌\n\n#UPSCMapping #Geography #${place.replace(/[^a-zA-Z0-9]/g, '')} #UPSCPrelims #IAS #UPSCGPT`;
  }
  const subjectTag = (item.srcSubject || 'GeneralStudies').replace(/[^a-zA-Z0-9]/g, '');
  const topicTag = (item.srcTopic || 'Prelims').replace(/[^a-zA-Z0-9]/g, '');
  return `🔥 ${item.examName || 'UPSC CSE'} ${item.examYear || ''} Prelims Challenge · ${item.srcSubject || 'GS'}\n\nComment your option (A/B/C/D) before watching the analysis! 👇\n\n#UPSC #UPSCPrelims #${subjectTag} #${topicTag} #IASPreparation #UPSCGPT`;
}

export default function ReelsPresenterClient({ questions = [] }) {
  const [qIndex, setQIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  // Webcam style inside 9:16 stage: 'strip' (bottom split) | 'bubble' (circle corner) | 'hidden'
  const [webcamLayout, setWebcamLayout] = useState('strip');

  const [theme, setTheme] = useState('dark');
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [activeTool, setActiveTool] = useState('pen');
  const [activeColor, setActiveColor] = useState('#ffffff');
  const [penSize, setPenSize] = useState(5);
  const [showHelp, setShowHelp] = useState(false);
  const [contentFontScale, setContentFontScale] = useState(1);

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

  const [scratchpadsMap, setScratchpadsMap] = useState({});

  const steps = useMemo(() => {
    if (!currentQ) return [];
    const customAsset = customAttachmentsMap[currentQ.id] || {};
    const baseSteps =
      currentQ.type === 'mapping'
        ? buildMappingReelSteps(currentQ, customAsset)
        : buildPyqReelSteps(currentQ, customAsset);

    const extra = scratchpadsMap[currentQ.id] || [];
    if (extra.length === 0) return baseSteps;
    const merged = [...baseSteps];
    for (const sp of extra) {
      merged.push(sp);
    }
    return merged;
  }, [currentQ, customAttachmentsMap, scratchpadsMap]);

  const currentStep = steps[stepIndex] || steps[0] || null;
  const currentQId = currentQ?.id || `reel_${qIndex}`;
  const currentStepKey = `${currentQId}_${currentStep?.id || stepIndex}`;

  const currentStepStrokes = useMemo(() => {
    return stepInkMap[currentStepKey] || [];
  }, [stepInkMap, currentStepKey]);

  // =============================================================
  // LIVE WEBCAM & MICROPHONE STATE
  // =============================================================
  const [webcamLive, setWebcamLive] = useState(false);
  const [webcamMirrored, setWebcamMirrored] = useState(true);
  const [videoDevices, setVideoDevices] = useState([]);
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const [selectedAudioId, setSelectedAudioId] = useState('');
  const [micGain, setMicGain] = useState(1.25);
  const [micMuted, setMicMuted] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [showAvPopover, setShowAvPopover] = useState(false);

  const webcamVideoRef = useRef(null);
  const webcamStreamRef = useRef(null);

  // =============================================================
  // IN-BROWSER 9:16 STAGE RECORDER STATE
  // =============================================================
  const [recState, setRecState] = useState('idle');
  const [recordingPreset, setRecordingPreset] = useState('vertical_1080p');
  const [preferredFormat, setPreferredFormat] = useState('vp9');
  const [countdownNum, setCountdownNum] = useState(3);
  const [recSeconds, setRecSeconds] = useState(0);
  const [recError, setRecError] = useState('');
  const [completedRecording, setCompletedRecording] = useState(null);
  const [copiedCaption, setCopiedCaption] = useState(false);

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recSecondsRef = useRef(0);
  const recordingIdRef = useRef(null);
  const displayStreamRef = useRef(null);
  const micStreamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const levelRafRef = useRef(null);

  const refreshDevices = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) return;
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      const vids = list.filter((d) => d.kind === 'videoinput');
      const auds = list.filter((d) => d.kind === 'audioinput');
      setVideoDevices(vids);
      setAudioDevices(auds);
      if (!selectedVideoId && vids[0]?.deviceId) setSelectedVideoId(vids[0].deviceId);
      if (!selectedAudioId && auds[0]?.deviceId) setSelectedAudioId(auds[0].deviceId);
    } catch {
      // ignore
    }
  }, [selectedVideoId, selectedAudioId]);

  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  const startWebcam = useCallback(async (customDeviceId) => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;
    try {
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      const targetId = customDeviceId !== undefined ? customDeviceId : selectedVideoId;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: targetId ? { exact: targetId } : undefined,
          width: { ideal: 640 },
          height: { ideal: 360 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      });
      webcamStreamRef.current = stream;
      setWebcamLive(true);
      if (webcamLayout === 'hidden') setWebcamLayout('strip');
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
      }
      refreshDevices();
    } catch {
      setRecError('Could not access camera. Please allow camera permission in Chrome.');
    }
  }, [selectedVideoId, webcamLayout, refreshDevices]);

  const stopWebcam = useCallback(() => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((t) => t.stop());
      webcamStreamRef.current = null;
    }
    if (webcamVideoRef.current) {
      webcamVideoRef.current.srcObject = null;
    }
    setWebcamLive(false);
  }, []);

  useEffect(() => {
    if (webcamLive && webcamLayout !== 'hidden' && webcamVideoRef.current && webcamStreamRef.current) {
      webcamVideoRef.current.srcObject = webcamStreamRef.current;
    }
  }, [webcamLive, webcamLayout]);

  useEffect(() => {
    return () => {
      if (webcamStreamRef.current) webcamStreamRef.current.getTracks().forEach((t) => t.stop());
      if (displayStreamRef.current) displayStreamRef.current.getTracks().forEach((t) => t.stop());
      if (micStreamRef.current) micStreamRef.current.getTracks().forEach((t) => t.stop());
      if (levelRafRef.current) cancelAnimationFrame(levelRafRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = micMuted ? 0 : micGain;
    }
  }, [micGain, micMuted]);

  useEffect(() => {
    if (recState !== 'recording') return;
    const interval = setInterval(() => {
      setRecSeconds((prev) => {
        const next = prev + 1;
        recSecondsRef.current = next;
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [recState]);

  // Auto-scale 540×960 vertical stage to fit window height
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dockClearance = isDockCollapsed ? 36 : 74;
      const availW = Math.max(300, w - 32);
      const availH = Math.max(400, h - 20 - dockClearance);
      const fitScale = Math.min(availW / 540, availH / 960);
      setScale(Number(fitScale.toFixed(3)));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDockCollapsed]);

  const stopRecordingInternal = useCallback(async () => {
    if (levelRafRef.current) {
      cancelAnimationFrame(levelRafRef.current);
      levelRafRef.current = null;
    }
    setMicLevel(0);

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      await new Promise((resolve) => {
        recorder.onstop = resolve;
        try {
          recorder.stop();
        } catch {
          resolve();
        }
      });
    }

    if (displayStreamRef.current) {
      displayStreamRef.current.getTracks().forEach((t) => t.stop());
      displayStreamRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }

    const mimeType = recorder?.mimeType || getSupportedMimeType(preferredFormat);
    const chunks = recordedChunksRef.current;
    if (chunks.length > 0) {
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const label =
        currentQ?.type === 'mapping'
          ? `Reel-Mapping-${currentQ.place || 'Atlas'}`
          : `Reel-PYQ-${currentQ?.srcSubject || 'GS'}-Q${currentQ?.questionNo || qIndex + 1}`;
      const recObj = {
        id: recordingIdRef.current || `reel_${Date.now()}`,
        title: `UPSC-9x16-${label}`,
        blob,
        url,
        mimeType,
        sizeBytes: blob.size,
        durationSec: recSecondsRef.current,
        caption: buildSocialCaption(currentQ),
        chapters: [{ qIndex, label, startSec: 0 }],
        status: 'completed',
      };
      setCompletedRecording(recObj);
      await saveRecordingToVault({
        id: recObj.id,
        title: recObj.title,
        blob: recObj.blob,
        mimeType: recObj.mimeType,
        sizeBytes: recObj.sizeBytes,
        durationSec: recObj.durationSec,
        chapters: recObj.chapters,
        status: 'completed',
      });
    }

    setRecState('idle');
  }, [currentQ, qIndex, preferredFormat]);

  const handleStartRecording = useCallback(async () => {
    setRecError('');
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
      setRecError('Screen capture is not supported in this browser. Please use Chrome, Brave, or Edge.');
      return;
    }

    try {
      const preset = REEL_PRESETS[recordingPreset] || REEL_PRESETS.vertical_1080p;

      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: preset.width, max: preset.width },
          height: { ideal: preset.height, max: preset.height },
          frameRate: { ideal: preset.fps, max: preset.fps },
        },
        audio: false,
        preferCurrentTab: true,
        selfBrowserSurface: 'include',
      });

      const videoTrack = displayStream.getVideoTracks()[0];
      if ('contentHint' in videoTrack) {
        try {
          videoTrack.contentHint = 'detail';
        } catch {}
      }

      // Strictly crop to the 9:16 vertical phone stage element!
      if (
        stageRef.current &&
        typeof window !== 'undefined' &&
        window.CropTarget &&
        typeof window.CropTarget.fromElement === 'function' &&
        typeof videoTrack.cropTo === 'function'
      ) {
        try {
          const cropTarget = await window.CropTarget.fromElement(stageRef.current);
          await videoTrack.cropTo(cropTarget);
        } catch (cropErr) {
          console.warn('[Reels Studio] Region Capture fallback:', cropErr);
        }
      }

      if (typeof videoTrack.applyConstraints === 'function') {
        try {
          await videoTrack.applyConstraints({
            width: { ideal: preset.width, max: preset.width },
            height: { ideal: preset.height, max: preset.height },
            frameRate: { ideal: preset.fps, max: preset.fps },
          });
        } catch {}
      }

      displayStreamRef.current = displayStream;

      let processedAudioTracks = [];
      try {
        const rawMicStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: selectedAudioId ? { exact: selectedAudioId } : undefined,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });
        micStreamRef.current = rawMicStream;

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioCtxRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(rawMicStream);
        const compressor = audioCtx.createDynamicsCompressor();
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = micMuted ? 0 : micGain;
        gainNodeRef.current = gainNode;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const destination = audioCtx.createMediaStreamDestination();

        source.connect(compressor);
        compressor.connect(gainNode);
        gainNode.connect(analyser);
        gainNode.connect(destination);

        const updateMeter = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          setMicLevel(Math.min(100, Math.round((sum / dataArray.length / 128) * 100)));
          levelRafRef.current = requestAnimationFrame(updateMeter);
        };
        levelRafRef.current = requestAnimationFrame(updateMeter);

        processedAudioTracks = destination.stream.getAudioTracks();
      } catch {}

      videoTrack.onended = () => {
        stopRecordingInternal();
      };

      setRecState('countdown');
      for (let c = 3; c >= 1; c--) {
        setCountdownNum(c);
        await new Promise((r) => setTimeout(r, 850));
      }

      const combinedStream = new MediaStream([videoTrack, ...processedAudioTracks]);
      const mimeType = getSupportedMimeType(preferredFormat);
      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: preset.videoBitsPerSecond,
        audioBitsPerSecond: preset.audioBitsPerSecond,
      });

      const recId = `reel_${Date.now()}`;
      recordingIdRef.current = recId;
      recordedChunksRef.current = [];
      recSecondsRef.current = 0;
      setRecSeconds(0);

      recorder.ondataavailable = async (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
          const partialBlob = new Blob(recordedChunksRef.current, { type: mimeType });
          await saveRecordingToVault({
            id: recId,
            title: `UPSC-9x16-Reel-${currentQ?.srcSubject || currentQ?.place || 'Clip'}`,
            blob: partialBlob,
            mimeType,
            sizeBytes: partialBlob.size,
            durationSec: recSecondsRef.current,
            chapters: [],
            status: 'in_progress',
          });
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(2500);
      setRecState('recording');
    } catch {
      setRecState('idle');
    }
  }, [recordingPreset, preferredFormat, selectedAudioId, micGain, micMuted, currentQ, stopRecordingInternal]);

  const handleTogglePause = useCallback(() => {
    const r = mediaRecorderRef.current;
    if (!r) return;
    if (r.state === 'recording') {
      r.pause();
      setRecState('paused');
    } else if (r.state === 'paused') {
      r.resume();
      setRecState('recording');
    }
  }, []);

  const handleRetakeReel = useCallback(() => {
    if (recState !== 'recording' && recState !== 'paused') return;
    if (recordedChunksRef.current.length > 1) {
      recordedChunksRef.current = recordedChunksRef.current.slice(0, 1);
    }
    recSecondsRef.current = 0;
    setRecSeconds(0);
    setStepInkMap({});
    setStepIndex(0);
  }, [recState]);

  const handleNext = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((s) => s + 1);
    } else if (qIndex < questions.length - 1) {
      setQIndex((q) => q + 1);
      setStepIndex(0);
    }
  }, [stepIndex, steps.length, qIndex, questions.length]);

  const handlePrev = useCallback(() => {
    if (stepIndex > 0) {
      setStepIndex((s) => s - 1);
    } else if (qIndex > 0) {
      setQIndex((q) => q - 1);
      setStepIndex(0);
    }
  }, [stepIndex, qIndex]);

  const handleUpdateStepStrokes = useCallback((strokes) => {
    setStepInkMap((prev) => ({
      ...prev,
      [currentStepKey]: strokes,
    }));
  }, [currentStepKey]);

  const handleUndo = useCallback(() => {
    const s = stepInkMap[currentStepKey] || [];
    if (s.length > 0) {
      handleUpdateStepStrokes(s.slice(0, -1));
    }
  }, [stepInkMap, currentStepKey, handleUpdateStepStrokes]);

  const handleClearInk = useCallback(() => {
    handleUpdateStepStrokes([]);
  }, [handleUpdateStepStrokes]);

  const handleAddScratchpad = useCallback(() => {
    if (!currentQ) return;
    const sp = {
      id: `reel_scratch_${Date.now()}`,
      type: 'reel_scratchpad',
      tabLabel: '+ Blank Board',
      badge: 'SCRATCHPAD',
      title: 'Quick Note & Diagram',
    };
    setScratchpadsMap((prev) => ({
      ...prev,
      [currentQ.id]: [...(prev[currentQ.id] || []), sp],
    }));
    setStepIndex(steps.length);
  }, [currentQ, steps.length]);

  const handleCycleFontScale = useCallback(() => {
    setContentFontScale((prev) => (prev === 1 ? 1.12 : prev === 1.12 ? 1.22 : 1));
  }, []);

  const fs = useCallback(
    (basePx) => Math.round(basePx * contentFontScale * 10) / 10,
    [contentFontScale]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName)) return;
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
        case '1':
          if (steps[0]) setStepIndex(0);
          break;
        case '2':
          if (steps[1]) setStepIndex(1);
          break;
        case '3':
          if (steps[2]) setStepIndex(2);
          break;
        case 'p':
        case 'P':
          setActiveTool((t) => (t === 'pen' ? 'none' : 'pen'));
          break;
        case 'h':
        case 'H':
          setActiveTool((t) => (t === 'highlighter' ? 'none' : 'highlighter'));
          break;
        case 'l':
        case 'L':
          setActiveTool((t) => (t === 'laser' ? 'none' : 'laser'));
          break;
        case 'e':
        case 'E':
          setActiveTool((t) => (t === 'eraser' ? 'none' : 'eraser'));
          break;
        case 'c':
        case 'C':
          handleClearInk();
          break;
        case 's':
        case 'S':
          handleAddScratchpad();
          break;
        case 'w':
        case 'W':
          setWebcamLayout((l) => (l === 'strip' ? 'bubble' : l === 'bubble' ? 'hidden' : 'strip'));
          break;
        case 'm':
        case 'M':
          setTheme((t) => {
            const next = t === 'dark' ? 'light' : 'dark';
            setActiveColor(next === 'light' ? '#0f172a' : '#ffffff');
            return next;
          });
          break;
        case 'd':
        case 'D':
          setIsDockCollapsed((c) => !c);
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, handleUndo, handleClearInk, handleAddScratchpad, steps]);

  if (!currentQ) {
    return (
      <div className="pq-reel-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <h2 style={{ fontSize: 24, margin: '0 0 10px' }}>No Reel Items Queued</h2>
          <p style={{ color: '#94a3b8', margin: '0 0 20px' }}>Select PYQs or Mapping nodes in the Reels Studio to record.</p>
          <Link
            href="/admin/recording-studio/reels"
            style={{ padding: '10px 20px', borderRadius: 10, background: '#ec4899', color: '#fff', textDecoration: 'none', fontWeight: 800 }}
          >
            ← Back to Reels Queue
          </Link>
        </div>
      </div>
    );
  }

  const stemBlocks = currentQ.stem ? parseStem(currentQ.stem) : [];
  const options = Array.isArray(currentQ.options) ? currentQ.options : [];
  const palette = theme === 'light' ? LIGHT_PALETTE : DARK_PALETTE;

  return (
    <div className="pq-reel-root" data-present-theme={theme}>
      {/* 3-2-1 Countdown Overlay */}
      {recState === 'countdown' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.76)',
            backdropFilter: 'blur(6px)',
            zIndex: 100005,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
          }}
        >
          <div
            style={{
              width: 130,
              height: 130,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #a855f7, #ec4899)',
              boxShadow: '0 0 60px rgba(236, 72, 153, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 64,
              fontWeight: 900,
              marginBottom: 16,
            }}
          >
            {countdownNum}
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f472b6' }}>
            Recording 9:16 Vertical Reel...
          </div>
        </div>
      )}

      {recError && (
        <div
          style={{
            position: 'fixed',
            top: 14,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100002,
            padding: '10px 18px',
            borderRadius: 12,
            background: '#991b1b',
            color: '#fff',
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span>{recError}</span>
          <button type="button" onClick={() => setRecError('')} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
            ✕
          </button>
        </div>
      )}

      {/* ============================================================= */}
      {/* 9:16 VERTICAL PHONE STAGE VIEWPORT                            */}
      {/* ============================================================= */}
      <div
        className="pq-reel-viewport"
        style={{ bottom: isDockCollapsed ? 34 : 74 }}
      >
        <div
          ref={stageRef}
          className="pq-reel-stage"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Top Header & 3-Slide Tabs */}
          <header className="pq-reel-header">
            <div className="pq-reel-top-row">
              <span className="pq-reel-brand-pill">
                <Sparkles size={11} />
                <span>UPSCGPT REELS</span>
              </span>

              <span className="pq-reel-exam-pill">
                {currentStep?.badge || 'UPSC PRELIMS'}
              </span>

              {questions.length > 1 && (
                <span style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8' }}>
                  {qIndex + 1}/{questions.length}
                </span>
              )}
            </div>

            {/* 3-Tab Segmented Switcher (1. Question | 2. Statement Analysis | 3. Keywords) */}
            <div className="pq-reel-tabs">
              {steps.map((st, idx) => (
                <button
                  key={st.id || idx}
                  type="button"
                  onClick={() => setStepIndex(idx)}
                  className={`pq-reel-tab-btn ${idx === stepIndex ? 'is-active' : ''}`}
                >
                  {st.tabLabel || `Slide ${idx + 1}`}
                </button>
              ))}
            </div>
          </header>

          {/* ========================================================= */}
          {/* MAIN VERTICAL SLIDE BODY                                  */}
          {/* ========================================================= */}
          <main className="pq-reel-body">
            {/* Topic Title */}
            <div className="pq-reel-topic-banner">
              <h2 className="pq-reel-topic-title" style={{ fontSize: fs(17.5) }}>
                {currentStep?.title}
              </h2>
            </div>

            {/* SLIDE 1: PYQ QUESTION & OPTIONS */}
            {currentStep?.type === 'reel_question' && (
              <>
                {stemBlocks.map((b, idx) => {
                  if (b.type === 'stmts') {
                    return (
                      <div className="pq-reel-stmt-list" key={idx}>
                        {b.items.map((s, k) => (
                          <div className="pq-reel-stmt-card" key={k} style={{ fontSize: fs(14.8) }}>
                            <span className="pq-reel-stmt-num">{s.key}</span>
                            <div style={{ flex: 1 }}>{s.text}</div>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return (
                    <p key={idx} className="pq-reel-stem-lead" style={{ fontSize: fs(16) }}>
                      {b.text}
                    </p>
                  );
                })}

                <div className="pq-reel-options-stack">
                  {options.map((opt) => {
                    const optLabel = String(opt.label).toUpperCase();
                    return (
                      <div key={opt.label} className="pq-reel-opt-row" style={{ fontSize: fs(14.8) }}>
                        <span className="pq-reel-opt-badge">{optLabel}</span>
                        <span style={{ flex: 1 }}>{opt.text}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* SLIDE 2: STATEMENT / OPTION ANALYSIS + ANSWER KEY */}
            {currentStep?.type === 'reel_analysis' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Array.isArray(currentStep.items) && currentStep.items.length > 0 ? (
                  currentStep.items.map((item, i) => {
                    const v = (item.verdict || '').toLowerCase();
                    const isCorrect =
                      v.includes('correct') && !v.includes('incorrect') && !v.includes('false');
                    const labelText = currentStep.isStatementMode
                      ? `Statement ${item.statementNo || i + 1}`
                      : `Option (${String(item.label || i + 1).toUpperCase()})`;

                    return (
                      <div
                        key={i}
                        className={`pq-reel-analysis-card ${isCorrect ? 'is-correct' : 'is-incorrect'}`}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <span style={{ fontSize: fs(13.5), fontWeight: 900, textTransform: 'uppercase' }}>
                            {labelText}
                          </span>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: isCorrect ? 'rgba(16, 185, 129, 0.22)' : 'rgba(244, 63, 94, 0.22)',
                              color: isCorrect ? '#34d399' : '#fb7185',
                              fontSize: 11.5,
                              fontWeight: 900,
                            }}
                          >
                            {isCorrect ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                            <span>{item.verdict || (isCorrect ? 'Correct' : 'Incorrect')}</span>
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: fs(14.2), lineHeight: 1.45, opacity: 0.95 }}>
                          {item.explanation}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="pq-reel-kw-card">
                    <p style={{ margin: 0, fontSize: fs(15), lineHeight: 1.5 }}>
                      {currentStep.explanationText}
                    </p>
                  </div>
                )}

                {/* Prominent Official Answer Key Box */}
                {currentStep.correctLabel && (
                  <div className="pq-reel-answer-banner">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 8,
                          background: '#10b981',
                          color: '#022c22',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: 15,
                        }}
                      >
                        ✓
                      </span>
                      <span style={{ fontSize: fs(16), fontWeight: 900, color: '#34d399' }}>
                        Correct Answer: Option ({currentStep.correctLabel})
                      </span>
                    </div>
                    {currentStep.correctOptionText && (
                      <div style={{ fontSize: fs(14.5), fontWeight: 700, paddingLeft: 34 }}>
                        {currentStep.correctOptionText}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SLIDE 3: HIGH-YIELD KEYWORDS */}
            {currentStep?.type === 'reel_keywords' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Array.isArray(currentStep.keywords) && currentStep.keywords.length > 0 ? (
                  currentStep.keywords.map((kw, idx) => (
                    <div key={idx} className="pq-reel-kw-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: fs(15), fontWeight: 900, color: '#e879f9' }}>
                        <Tag size={15} />
                        <span>#{kw.term}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: fs(14.2), lineHeight: 1.48, opacity: 0.92 }}>
                        {kw.shortNote}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="pq-reel-kw-card">
                    <div style={{ fontSize: fs(14), fontWeight: 900, color: '#e879f9', textTransform: 'uppercase' }}>
                      Core Exam Takeaway
                    </div>
                    <p style={{ margin: 0, fontSize: fs(15), lineHeight: 1.55 }}>
                      {currentStep.fallbackTakeaway}
                    </p>
                  </div>
                )}

                <div
                  style={{
                    marginTop: 4,
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: 'rgba(168, 85, 247, 0.14)',
                    border: '1px dashed rgba(168, 85, 247, 0.4)',
                    textAlign: 'center',
                    fontSize: 12.5,
                    fontWeight: 800,
                    color: '#e879f9',
                  }}
                >
                  📌 Save this Reel for Prelims Revision · @UPSCGPT
                </div>
              </div>
            )}

            {/* MAPPING REEL SLIDE 1: VERTICAL MAP & HOOK */}
            {currentStep?.type === 'reel_map_hook' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div
                  style={{
                    width: '100%',
                    height: 310,
                    borderRadius: 14,
                    overflow: 'hidden',
                    border: '1.5px solid rgba(56, 189, 248, 0.35)',
                    position: 'relative',
                  }}
                >
                  <StudioPresenterMap
                    currentQ={currentQ}
                    currentStep={{ type: currentStep.riverDetails ? 'river_course' : 'mapping_overview' }}
                    theme={theme}
                    activeTool={activeTool}
                    onSetActiveTool={setActiveTool}
                    mapWidthMode="split"
                    onCycleMapWidth={() => {}}
                    spotlightIndex={null}
                  />
                </div>

                {currentStep.riverDetails ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div className="pq-reel-stmt-card" style={{ flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>Origin</span>
                      <strong style={{ fontSize: fs(13.8) }}>{currentStep.riverDetails.origin}</strong>
                    </div>
                    <div className="pq-reel-stmt-card" style={{ flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 800, color: '#34d399', textTransform: 'uppercase' }}>Outflow / Length</span>
                      <strong style={{ fontSize: fs(13.8) }}>
                        {currentStep.riverDetails.mouth} ({currentStep.riverDetails.length})
                      </strong>
                    </div>
                  </div>
                ) : currentStep.stem ? (
                  <p className="pq-reel-stem-lead" style={{ fontSize: fs(14.5) }}>
                    {currentStep.stem}
                  </p>
                ) : (
                  <div className="pq-reel-stmt-card" style={{ fontSize: fs(14.5) }}>
                    {currentQ.staticFacts?.[0] || currentStep.locationText}
                  </div>
                )}
              </div>
            )}

            {/* MAPPING REEL SLIDE 2: TRIBUTARIES OR SPATIAL FACTS */}
            {currentStep?.type === 'reel_map_analysis' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {currentStep.riverDetails ? (
                  <>
                    <div className="pq-reel-kw-card" style={{ borderLeftColor: '#38bdf8' }}>
                      <div style={{ fontSize: 12, fontWeight: 900, color: '#38bdf8', textTransform: 'uppercase' }}>
                        ⬅️ Left-Bank Tributaries
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                        {(currentStep.riverDetails.tributaries?.leftBank || []).slice(0, 4).map((t, i) => (
                          <div key={i} style={{ fontSize: fs(13.8), lineHeight: 1.4 }}>
                            <strong style={{ color: '#38bdf8' }}>{t.name}:</strong> {t.note}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pq-reel-kw-card" style={{ borderLeftColor: '#f59e0b' }}>
                      <div style={{ fontSize: 12, fontWeight: 900, color: '#fbbf24', textTransform: 'uppercase' }}>
                        ➡️ Right-Bank Tributaries
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                        {(currentStep.riverDetails.tributaries?.rightBank || []).slice(0, 4).map((t, i) => (
                          <div key={i} style={{ fontSize: fs(13.8), lineHeight: 1.4 }}>
                            <strong style={{ color: '#fbbf24' }}>{t.name}:</strong> {t.note}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  currentStep.staticFacts.map((f, idx) => (
                    <div key={idx} className="pq-reel-stmt-card" style={{ fontSize: fs(14.5) }}>
                      <span className="pq-reel-stmt-num">{idx + 1}</span>
                      <div>{f}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* MAPPING REEL SLIDE 3: KEYWORDS & UPSC TRAP */}
            {currentStep?.type === 'reel_map_keywords' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div
                  className="pq-reel-analysis-card is-incorrect"
                  style={{ borderColor: '#f59e0b', background: 'rgba(245, 158, 11, 0.14)' }}
                >
                  <div style={{ fontSize: 12.5, fontWeight: 900, color: '#fbbf24', textTransform: 'uppercase' }}>
                    ⚠️ #1 UPSC Examiner Trap
                  </div>
                  <p style={{ margin: 0, fontSize: fs(14.5), lineHeight: 1.5, fontWeight: 600 }}>
                    {currentStep.upscTrap}
                  </p>
                </div>

                {currentStep.riverDetails?.protectedAreas?.length > 0 && (
                  <div className="pq-reel-kw-card" style={{ borderLeftColor: '#10b981' }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: '#34d399', textTransform: 'uppercase' }}>
                      🌲 Protected Areas &amp; National Parks
                    </div>
                    {currentStep.riverDetails.protectedAreas.slice(0, 3).map((pa, i) => (
                      <div key={i} style={{ fontSize: fs(13.8), lineHeight: 1.4 }}>
                        <strong style={{ color: '#34d399' }}>{pa.name} ({pa.state}):</strong> {pa.relation}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* OPTIONAL VISUAL SLIDE */}
            {currentStep?.type === 'reel_visual' && currentStep.imageUrl && (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentStep.imageUrl}
                  alt={currentStep.title}
                  style={{ maxWidth: '100%', maxHeight: 480, borderRadius: 14, objectFit: 'contain' }}
                />
              </div>
            )}

            {/* BLANK SCRATCHPAD SLIDE */}
            {currentStep?.type === 'reel_scratchpad' && (
              <div
                style={{
                  flex: 1,
                  borderRadius: 14,
                  border: '1.5px dashed rgba(255,255,255,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255,255,255,0.25)',
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                DRAW FREELY WITH XP-PEN STYLUS
              </div>
            )}
          </main>

          {/* ========================================================= */}
          {/* LIVE WEBCAM ZONE INSIDE 9:16 VERTICAL FRAME               */}
          {/* ========================================================= */}
          {webcamLayout === 'strip' && (
            <div className={`pq-reel-webcam-strip ${webcamLive ? 'is-live' : ''}`}>
              {webcamLive ? (
                <video
                  ref={webcamVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: webcamMirrored ? 'scaleX(-1)' : 'none',
                  }}
                />
              ) : (
                <div
                  onClick={() => startWebcam()}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    color: '#f472b6',
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  <Camera size={20} />
                  <span>CLICK FOR LIVE WEBCAM STRIP</span>
                  <small style={{ color: '#94a3b8', fontSize: 10.5 }}>Press W to switch to Bubble or Hide</small>
                </div>
              )}
            </div>
          )}

          {webcamLayout === 'bubble' && (
            <div className={`pq-reel-webcam-bubble ${webcamLive ? 'is-live' : ''}`}>
              {webcamLive ? (
                <video
                  ref={webcamVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: webcamMirrored ? 'scaleX(-1)' : 'none',
                  }}
                />
              ) : (
                <div
                  onClick={() => startWebcam()}
                  style={{
                    cursor: 'pointer',
                    textAlign: 'center',
                    color: '#f472b6',
                    fontSize: 10.5,
                    fontWeight: 800,
                    padding: 8,
                  }}
                >
                  <Camera size={18} />
                  <div>LIVE CAM</div>
                </div>
              )}
            </div>
          )}

          {/* Queue Drawer inside Stage */}
          {isQueueOpen && (
            <div className="pq-present-queue-drawer">
              <div className="pq-queue-header">
                <div className="pq-queue-title">
                  <ListOrdered size={18} color="#ec4899" />
                  <span>Reels Queue ({questions.length})</span>
                </div>
                <button type="button" onClick={() => setIsQueueOpen(false)} className="pq-queue-close-btn">
                  <X size={16} />
                </button>
              </div>
              <div className="pq-queue-list">
                {questions.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className={`pq-queue-item ${idx === qIndex ? 'is-active-item' : ''}`}
                    onClick={() => {
                      setQIndex(idx);
                      setStepIndex(0);
                      setIsQueueOpen(false);
                    }}
                  >
                    <span className="pq-queue-item-num">{idx + 1}</span>
                    <div className="pq-queue-item-title">
                      {item.place || item.title || (item.stem ? item.stem.slice(0, 80) + '...' : `Reel ${idx + 1}`)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* FULL 9:16 ANNOTATION CANVAS                               */}
          {/* ========================================================= */}
          <PyqAnnotationCanvas
            scale={scale}
            canvasWidth={540}
            canvasHeight={960}
            activeTool={activeTool}
            activeColor={activeColor}
            penSize={penSize}
            leftBoundaryX={0}
            isFullStage={true}
            questionStrokes={[]}
            stepStrokes={currentStepStrokes}
            onUpdateQuestionStrokes={() => {}}
            onUpdateStepStrokes={handleUpdateStepStrokes}
          />
        </div>
      </div>

      {/* ============================================================= */}
      {/* FLOATING A/V & QUALITY POPOVER                                */}
      {/* ============================================================= */}
      {showAvPopover && (
        <div
          style={{
            position: 'fixed',
            bottom: 76,
            right: 24,
            width: 330,
            padding: 18,
            borderRadius: 16,
            background: '#0f172a',
            border: '1.5px solid rgba(236, 72, 153, 0.4)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65)',
            color: '#f8fafc',
            zIndex: 100003,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 900, color: '#f472b6', textTransform: 'uppercase' }}>
              9:16 Reel Camera &amp; Quality
            </span>
            <button
              type="button"
              onClick={() => setShowAvPopover(false)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Camera</label>
            <select
              value={selectedVideoId}
              onChange={(e) => {
                setSelectedVideoId(e.target.value);
                if (webcamLive) startWebcam(e.target.value);
              }}
              style={{ padding: '7px 10px', borderRadius: 8, background: '#020617', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 12 }}
            >
              {videoDevices.map((d, i) => (
                <option key={d.deviceId || i} value={d.deviceId}>
                  {d.label || `Camera ${i + 1}`}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setWebcamMirrored((m) => !m)}
              style={{
                flex: 1,
                padding: '7px 10px',
                borderRadius: 8,
                background: webcamMirrored ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(236, 72, 153, 0.4)',
                color: '#fff',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
              }}
            >
              <FlipHorizontal size={13} />
              <span>{webcamMirrored ? 'Mirror: ON' : 'Mirror: OFF'}</span>
            </button>

            <select
              value={webcamLayout}
              onChange={(e) => setWebcamLayout(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: 8, background: '#020617', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 11.5 }}
            >
              <option value="strip">Bottom Strip</option>
              <option value="bubble">Corner Bubble</option>
              <option value="hidden">Hidden (No Cam)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Microphone</label>
            <select
              value={selectedAudioId}
              onChange={(e) => setSelectedAudioId(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: 8, background: '#020617', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 12 }}
            >
              {audioDevices.map((d, i) => (
                <option key={d.deviceId || i} value={d.deviceId}>
                  {d.label || `Mic ${i + 1}`}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 800, color: '#34d399', textTransform: 'uppercase' }}>Reel Resolution &amp; Size</label>
            <select
              value={recordingPreset}
              onChange={(e) => setRecordingPreset(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: 8, background: '#020617', border: '1px solid rgba(52,211,153,0.35)', color: '#fff', fontSize: 11.5 }}
            >
              {Object.entries(REEL_PRESETS).map(([k, p]) => (
                <option key={k} value={k}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* FLOATING BOTTOM CONTROL DOCK                                  */}
      {/* ============================================================= */}
      {isDockCollapsed ? (
        <button
          type="button"
          onClick={() => setIsDockCollapsed(false)}
          className="pq-present-dock-pill"
        >
          <ChevronUp size={14} />
          <span>{recState === 'recording' ? `REC ${formatDurationTimestamp(recSeconds)}` : 'Reel Tools'}</span>
        </button>
      ) : (
        <footer className="pq-present-dock">
          {recState === 'idle' ? (
            <button
              type="button"
              onClick={handleStartRecording}
              style={{
                height: 36,
                padding: '0 14px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#ffffff',
                fontSize: 12.5,
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 14px rgba(236, 72, 153, 0.4)',
              }}
            >
              <Radio size={15} />
              <span>REC REEL</span>
            </button>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 8px',
                borderRadius: 12,
                background: 'rgba(236, 72, 153, 0.16)',
                border: '1px solid rgba(236, 72, 153, 0.45)',
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: recState === 'paused' ? '#fbbf24' : '#ec4899',
                }}
              />
              <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 900, color: '#fff', minWidth: 42 }}>
                {formatDurationTimestamp(recSeconds)}
              </span>

              <div style={{ width: 26, height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.15)', overflow: 'hidden' }}>
                <div style={{ width: `${micMuted ? 0 : micLevel}%`, height: '100%', background: '#34d399' }} />
              </div>

              <button type="button" onClick={handleTogglePause} className="pq-dock-btn" style={{ width: 28, height: 28 }}>
                {recState === 'paused' ? <Play size={14} /> : <Pause size={14} />}
              </button>

              <button
                type="button"
                onClick={handleRetakeReel}
                className="pq-dock-btn"
                style={{ width: 'auto', height: 28, padding: '0 8px', fontSize: 11, fontWeight: 800, gap: 4, color: '#fbbf24' }}
                title="Retake Reel from Slide 1"
              >
                <RotateCcw size={12} />
                <span>Retake</span>
              </button>

              <button
                type="button"
                onClick={stopRecordingInternal}
                style={{
                  height: 28,
                  padding: '0 10px',
                  borderRadius: 8,
                  background: '#ef4444',
                  border: 'none',
                  color: '#fff',
                  fontSize: 11.5,
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Square size={11} fill="currentColor" />
                <span>Finish</span>
              </button>
            </div>
          )}

          {/* Webcam Toggle */}
          <button
            type="button"
            onClick={() => (webcamLive ? stopWebcam() : startWebcam())}
            className={`pq-dock-btn ${webcamLive ? 'is-active' : ''}`}
            title="Toggle Live Webcam"
          >
            {webcamLive ? <Camera size={16} /> : <CameraOff size={16} />}
          </button>

          {/* Webcam Layout Cycle (Strip / Bubble / Hidden) */}
          <button
            type="button"
            onClick={() =>
              setWebcamLayout((l) => (l === 'strip' ? 'bubble' : l === 'bubble' ? 'hidden' : 'strip'))
            }
            className="pq-dock-btn"
            style={{ width: 'auto', padding: '0 8px', fontSize: 11, fontWeight: 800, gap: 4 }}
            title="Cycle Webcam Layout: Bottom Strip → Corner Bubble → Hidden [W]"
          >
            <Smartphone size={13} />
            <span style={{ textTransform: 'capitalize' }}>{webcamLayout}</span>
          </button>

          <button
            type="button"
            onClick={() => setMicMuted((m) => !m)}
            className={`pq-dock-btn ${!micMuted ? 'is-active' : ''}`}
            title="Mute / Unmute Mic"
          >
            {micMuted ? <MicOff size={16} color="#f87171" /> : <Mic size={16} />}
          </button>

          <button
            type="button"
            onClick={() => setShowAvPopover((o) => !o)}
            className={`pq-dock-btn ${showAvPopover ? 'is-active' : ''}`}
            title="Camera & Quality Settings"
          >
            <Settings size={15} />
          </button>

          <div className="pq-dock-sep" />

          {/* Slide Navigation */}
          <button type="button" onClick={handlePrev} className="pq-dock-btn" title="Previous Slide [←]">
            <ChevronLeft size={18} />
          </button>

          <div className="pq-dock-steps">
            {steps.map((st, idx) => (
              <button
                key={st.id || idx}
                type="button"
                onClick={() => setStepIndex(idx)}
                className={`pq-step-dot ${idx === stepIndex ? 'is-active' : idx < stepIndex ? 'is-past' : ''}`}
              />
            ))}
          </div>

          <button type="button" onClick={handleNext} className="pq-dock-btn" title="Next Slide [Space / →]">
            <ChevronRight size={18} />
          </button>

          <div className="pq-dock-sep" />

          {/* Stylus Tools */}
          <button
            type="button"
            onClick={() => setActiveTool('none')}
            className={`pq-dock-btn ${activeTool === 'none' ? 'is-active' : ''}`}
            title="Interact / Scroll [V]"
          >
            <Move size={15} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTool((t) => (t === 'pen' ? 'none' : 'pen'))}
            className={`pq-dock-btn ${activeTool === 'pen' ? 'is-active' : ''}`}
            title="Pen [P]"
          >
            <PenTool size={15} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTool((t) => (t === 'highlighter' ? 'none' : 'highlighter'))}
            className={`pq-dock-btn ${activeTool === 'highlighter' ? 'is-active' : ''}`}
            title="Highlighter [H]"
          >
            <Highlighter size={15} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTool((t) => (t === 'laser' ? 'none' : 'laser'))}
            className={`pq-dock-btn ${activeTool === 'laser' ? 'is-active' : ''}`}
            title="Laser Pointer [L]"
          >
            <Zap size={15} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTool((t) => (t === 'eraser' ? 'none' : 'eraser'))}
            className={`pq-dock-btn ${activeTool === 'eraser' ? 'is-active' : ''}`}
            title="Eraser [E]"
          >
            <Eraser size={15} />
          </button>

          <button
            type="button"
            onClick={handleAddScratchpad}
            className="pq-dock-btn pq-dock-scratchpad-btn"
            title="Add Blank Scratchpad Slide [S]"
          >
            <FilePlus2 size={15} />
          </button>

          <div className="pq-dock-colors">
            {palette.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setActiveColor(c);
                  if (activeTool === 'none' || activeTool === 'eraser') setActiveTool('pen');
                }}
                className={`pq-color-dot ${activeColor === c ? 'is-selected' : ''}`}
                style={{ background: c, color: c }}
              />
            ))}
          </div>

          <button type="button" onClick={handleUndo} className="pq-dock-btn" title="Undo [Cmd+Z]">
            <Undo2 size={15} />
          </button>

          <button type="button" onClick={handleClearInk} className="pq-dock-btn" title="Clear Ink [C]">
            <Trash2 size={15} />
          </button>

          <div className="pq-dock-sep" />

          <button
            type="button"
            onClick={handleCycleFontScale}
            className="pq-dock-btn"
            style={{ width: 'auto', padding: '0 8px', fontSize: 11, fontWeight: 800 }}
            title="Cycle Font Size"
          >
            A+ {Math.round(contentFontScale * 100)}%
          </button>

          <button
            type="button"
            onClick={() => setIsQueueOpen((o) => !o)}
            className={`pq-dock-btn ${isQueueOpen ? 'is-active' : ''}`}
            title="Reels Queue [Q]"
          >
            <ListOrdered size={15} />
          </button>

          <button
            type="button"
            onClick={() =>
              setTheme((t) => {
                const next = t === 'dark' ? 'light' : 'dark';
                setActiveColor(next === 'light' ? '#0f172a' : '#ffffff');
                return next;
              })
            }
            className="pq-dock-btn"
            title="Dark / Light Mode [M]"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <button type="button" onClick={() => setShowHelp((h) => !h)} className="pq-dock-btn" title="Shortcuts [?]">
            <HelpCircle size={15} />
          </button>

          <button type="button" onClick={() => setIsDockCollapsed(true)} className="pq-dock-btn" title="Collapse Dock [D]">
            <ChevronDown size={15} />
          </button>
        </footer>
      )}

      {/* ============================================================= */}
      {/* POST-RECORDING 9:16 REEL PREVIEW & DOWNLOAD MODAL             */}
      {/* ============================================================= */}
      {completedRecording && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.88)',
            backdropFilter: 'blur(10px)',
            zIndex: 100004,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 780,
              background: '#0f172a',
              border: '1.5px solid rgba(236, 72, 153, 0.45)',
              borderRadius: 22,
              padding: 24,
              color: '#f8fafc',
              display: 'grid',
              gridTemplateColumns: '260px 1fr',
              gap: 22,
              boxShadow: '0 24px 90px rgba(0, 0, 0, 0.75)',
            }}
          >
            {/* Left: 9:16 Vertical Video Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <video
                src={completedRecording.url}
                controls
                autoPlay
                style={{
                  width: '100%',
                  aspectRatio: '9 / 16',
                  borderRadius: 14,
                  background: '#000',
                  border: '1px solid rgba(255,255,255,0.15)',
                  objectFit: 'contain',
                }}
              />
              <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700 }}>
                {formatDurationTimestamp(completedRecording.durationSec)} • {(completedRecording.sizeBytes / (1024 * 1024)).toFixed(1)} MB
              </span>
            </div>

            {/* Right: Export & Social Caption */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 14 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: 999,
                      background: 'rgba(236, 72, 153, 0.2)',
                      color: '#f472b6',
                      fontSize: 11,
                      fontWeight: 900,
                    }}
                  >
                    9:16 REEL READY · SAVED TO LOCAL VAULT
                  </span>
                  <button
                    type="button"
                    onClick={() => setCompletedRecording(null)}
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <input
                  type="text"
                  value={completedRecording.title}
                  onChange={(e) =>
                    setCompletedRecording((prev) => (prev ? { ...prev, title: e.target.value } : null))
                  }
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: '#020617',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 800,
                    marginBottom: 14,
                  }}
                />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: '#e879f9', textTransform: 'uppercase' }}>
                    Instagram Reels / YouTube Shorts Caption &amp; Hashtags
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(completedRecording.caption || '');
                        setCopiedCaption(true);
                        setTimeout(() => setCopiedCaption(false), 2000);
                      } catch {}
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      background: 'rgba(236, 72, 153, 0.16)',
                      border: '1px solid rgba(236, 72, 153, 0.4)',
                      color: '#f472b6',
                      fontSize: 11.5,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    {copiedCaption ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedCaption ? 'Copied!' : 'Copy Caption'}</span>
                  </button>
                </div>

                <textarea
                  rows={6}
                  value={completedRecording.caption || ''}
                  onChange={(e) =>
                    setCompletedRecording((prev) => (prev ? { ...prev, caption: e.target.value } : null))
                  }
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 10,
                    background: '#020617',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#cbd5e1',
                    fontSize: 12.5,
                    lineHeight: 1.5,
                    resize: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => {
                    const ext = (completedRecording.mimeType || '').includes('mp4') ? 'mp4' : 'webm';
                    const a = document.createElement('a');
                    a.href = completedRecording.url;
                    a.download = `${completedRecording.title}.${ext}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px 18px',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <Download size={16} />
                  <span>Download 9:16 Reel to Mac</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
