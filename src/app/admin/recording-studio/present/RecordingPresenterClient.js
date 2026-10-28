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
  Laptop,
  Tv,
  Compass,
  Move,
  FilePlus2,
  Columns,
  Grid,
  AlignJustify,
  FlipHorizontal,
  Film,
} from 'lucide-react';
import { buildQuestionSteps, buildTopicSteps, buildMappingSteps } from '@/lib/pyqSlideDeck';
import { parseStem } from '@/app/prelims/pyq/StemView';
import {
  saveRecordingToVault,
  formatDurationTimestamp,
  formatYouTubeChapters,
} from '@/lib/recordingVaultDb';
import PyqAnnotationCanvas from '../../pyq/present/PyqAnnotationCanvas';
import StudioPresenterMap from '../../pyq/present/StudioPresenterMap';
import '../../pyq/present/present.css';

const DARK_PALETTE = [
  '#ffffff',
  '#f59e0b',
  '#38bdf8',
  '#34d399',
  '#fb7185',
];

const LIGHT_PALETTE = [
  '#0f172a',
  '#2563eb',
  '#dc2626',
  '#059669',
  '#d97706',
];

const RECORDING_PRESETS = {
  compact_1080p: {
    label: '1080p Smart Lecture (24 fps · ~7.5 MB/min — Recommended)',
    width: 1920,
    height: 1080,
    fps: 24,
    videoBitsPerSecond: 1000000, // 1.0 Mbps
    audioBitsPerSecond: 64000,   // 64 kbps voice
  },
  ultra_compact_720p: {
    label: '720p Ultra-Compact (24 fps · ~4.8 MB/min)',
    width: 1280,
    height: 720,
    fps: 24,
    videoBitsPerSecond: 650000,  // 650 kbps
    audioBitsPerSecond: 64000,
  },
  high_1080p: {
    label: '1080p High Bitrate (30 fps · ~16 MB/min)',
    width: 1920,
    height: 1080,
    fps: 30,
    videoBitsPerSecond: 2200000, // 2.2 Mbps
    audioBitsPerSecond: 96000,
  },
};

function getSupportedMimeType(preferredFormat = 'mp4') {
  if (typeof window === 'undefined' || typeof window.MediaRecorder === 'undefined') {
    return 'video/mp4';
  }
  const mp4First = [
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4;codecs=avc1.4d002a,mp4a.40.2',
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/mp4;codecs=avc1',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  const vp9First = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/mp4',
    'video/webm',
  ];
  const candidates = preferredFormat === 'vp9' ? vp9First : mp4First;
  for (const mime of candidates) {
    if (window.MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }
  return 'video/webm';
}

function buildChapterLabel(item, index) {
  if (!item) return `Item ${index + 1}`;
  if (item.type === 'mapping') {
    return `Topic ${index + 1}: ${item.place || item.title || 'Mapping Feature'}`;
  }
  if (item.type === 'topic') {
    return `Topic ${index + 1}: ${item.title || 'Thematic Concept'}`;
  }
  const examTag = `${item.examName || 'UPSC CSE'} ${item.examYear || ''}`.trim();
  const topicTag = item.srcTopic || item.srcSubject || 'Prelims PYQ';
  const snippet = (item.stem || '').replace(/\s+/g, ' ').slice(0, 58);
  return `Q${index + 1} [${examTag} · ${topicTag}]: ${snippet}...`;
}

export default function RecordingPresenterClient({ questions = [] }) {
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
  const [activeTool, setActiveTool] = useState('pen');
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

  const [timerSeconds, setTimerSeconds] = useState(null);
  const [questionInkMap, setQuestionInkMap] = useState({});
  const [stepInkMap, setStepInkMap] = useState({});

  const stageRef = useRef(null);
  const currentQ = questions[qIndex] || null;

  // =============================================================
  // LIVE WEBCAM & MICROPHONE STUDIO STATE
  // =============================================================
  const [webcamLive, setWebcamLive] = useState(false);
  const [webcamMirrored, setWebcamMirrored] = useState(true);
  const [webcamSize, setWebcamSize] = useState('standard'); // 'compact' | 'standard' | 'large'
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
  // IN-BROWSER STAGE RECORDER STATE
  // =============================================================
  const [recState, setRecState] = useState('idle'); // 'idle' | 'countdown' | 'recording' | 'paused'
  const [recordingPreset, setRecordingPreset] = useState('compact_1080p'); // 'compact_1080p' | 'ultra_compact_720p' | 'high_1080p'
  const [preferredFormat, setPreferredFormat] = useState('mp4'); // 'mp4' (H.264 default) | 'vp9' (WebM)
  const [countdownNum, setCountdownNum] = useState(3);
  const [recSeconds, setRecSeconds] = useState(0);
  const [recError, setRecError] = useState('');
  const [chapters, setChapters] = useState([]);
  const [completedRecording, setCompletedRecording] = useState(null); // { id, title, blob, url, mimeType, durationSec, chapters }
  const [copiedChapters, setCopiedChapters] = useState(false);

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const chaptersRef = useRef([]);
  const recSecondsRef = useRef(0);
  const recordingIdRef = useRef(null);
  const displayStreamRef = useRef(null);
  const micStreamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const levelRafRef = useRef(null);
  const previewVideoRef = useRef(null);

  // Enumerate available cameras & microphones
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
    } catch (e) {
      console.warn('[Recording Studio] Device enumeration failed:', e);
    }
  }, [selectedVideoId, selectedAudioId]);

  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  // Start / Stop Live Webcam Stream inside `.pq-present-webcam-safe-zone`
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
      setShowWebcamBox(true);
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
      }
      refreshDevices();
    } catch (err) {
      console.warn('[Recording Studio] Webcam start error:', err);
      setRecError('Could not access camera. Please allow camera permission in your browser.');
    }
  }, [selectedVideoId, refreshDevices]);

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

  const toggleWebcamLive = useCallback(() => {
    if (webcamLive) {
      stopWebcam();
    } else {
      startWebcam();
    }
  }, [webcamLive, startWebcam, stopWebcam]);

  // Attach webcam stream whenever video element mounts or showWebcamBox toggles
  useEffect(() => {
    if (webcamLive && showWebcamBox && webcamVideoRef.current && webcamStreamRef.current) {
      webcamVideoRef.current.srcObject = webcamStreamRef.current;
    }
  }, [webcamLive, showWebcamBox]);

  // Cleanup streams on unmount
  useEffect(() => {
    return () => {
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (displayStreamRef.current) {
        displayStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (levelRafRef.current) {
        cancelAnimationFrame(levelRafRef.current);
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Update live mic gain / mute dynamically during recording
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = micMuted ? 0 : micGain;
    }
  }, [micGain, micMuted]);

  // Recording elapsed timer
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

  // Auto-log chapter timestamp whenever presenter changes `qIndex` while recording
  useEffect(() => {
    if (recState !== 'recording' && recState !== 'paused') return;
    if (!currentQ) return;

    setChapters((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.qIndex === qIndex) return prev;
      const newEntry = {
        qIndex,
        id: currentQ.id,
        label: buildChapterLabel(currentQ, qIndex),
        startSec: recSecondsRef.current,
        chunkStartIndex: recordedChunksRef.current.length,
      };
      const updated = [...prev, newEntry];
      chaptersRef.current = updated;
      return updated;
    });
  }, [qIndex, currentQ, recState]);

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

    const mimeType = recorder?.mimeType || getSupportedMimeType();
    const chunks = recordedChunksRef.current;
    if (chunks.length > 0) {
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const firstQ = questions[0];
      const subjectLabel =
        firstQ?.type === 'mapping'
          ? `Mapping-${firstQ.place || 'Atlas'}`
          : `PYQ-${firstQ?.srcSubject || 'General-Studies'}`;
      const recObj = {
        id: recordingIdRef.current || `rec_${Date.now()}`,
        title: `UPSC-${subjectLabel}-Session`,
        blob,
        url,
        mimeType,
        sizeBytes: blob.size,
        durationSec: recSecondsRef.current,
        chapters: chaptersRef.current,
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
  }, [questions]);

  const handleStartRecording = useCallback(async () => {
    setRecError('');
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
      setRecError('Screen capture is not supported in this browser. Please use Chrome, Brave, or Edge.');
      return;
    }

    try {
      const preset = RECORDING_PRESETS[recordingPreset] || RECORDING_PRESETS.compact_1080p;

      // 1. Request current browser tab video stream clamped to preset resolution & frame rate
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

      // Hint encoder that this is a slide/text presentation (prioritizes text sharpness over motion)
      if ('contentHint' in videoTrack) {
        try {
          videoTrack.contentHint = 'detail';
        } catch {
          // ignore
        }
      }

      // Enforce max resolution & frame rate on macOS Retina displays
      if (typeof videoTrack.applyConstraints === 'function') {
        try {
          await videoTrack.applyConstraints({
            width: { ideal: preset.width, max: preset.width },
            height: { ideal: preset.height, max: preset.height },
            frameRate: { ideal: preset.fps, max: preset.fps },
          });
        } catch {
          // ignore
        }
      }

      // 2. Crop strictly to the 16:9 Stage element if Region Capture API is available
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
          console.warn('[Recording Studio] Region Capture crop fallback to full tab:', cropErr);
        }
      }

      displayStreamRef.current = displayStream;

      // 3. Request Microphone Audio & pass through Web Audio Compressor + Gain
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
        compressor.threshold.setValueAtTime(-24, audioCtx.currentTime);
        compressor.knee.setValueAtTime(30, audioCtx.currentTime);
        compressor.ratio.setValueAtTime(6, audioCtx.currentTime);
        compressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
        compressor.release.setValueAtTime(0.25, audioCtx.currentTime);

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
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setMicLevel(Math.min(100, Math.round((avg / 128) * 100)));
          levelRafRef.current = requestAnimationFrame(updateMeter);
        };
        levelRafRef.current = requestAnimationFrame(updateMeter);

        processedAudioTracks = destination.stream.getAudioTracks();
      } catch (micErr) {
        console.warn('[Recording Studio] Continuing without microphone track:', micErr);
      }

      // Stop recording cleanly if user clicks Chrome's native "Stop sharing" button
      videoTrack.onended = () => {
        stopRecordingInternal();
      };

      // 4. Run 3... 2... 1... Countdown before starting MediaRecorder
      setRecState('countdown');
      for (let c = 3; c >= 1; c--) {
        setCountdownNum(c);
        await new Promise((r) => setTimeout(r, 850));
      }

      // 5. Combine stage video + processed mic audio into one MediaStream
      const combinedStream = new MediaStream([
        videoTrack,
        ...processedAudioTracks,
      ]);

      const mimeType = getSupportedMimeType(preferredFormat);
      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: preset.videoBitsPerSecond,
        audioBitsPerSecond: preset.audioBitsPerSecond,
      });

      const recId = `rec_${Date.now()}`;
      recordingIdRef.current = recId;
      recordedChunksRef.current = [];
      recSecondsRef.current = 0;
      setRecSeconds(0);

      const initialChapter = [
        {
          qIndex,
          id: currentQ?.id || 'item_0',
          label: buildChapterLabel(currentQ, qIndex),
          startSec: 0,
          chunkStartIndex: 0,
        },
      ];
      chaptersRef.current = initialChapter;
      setChapters(initialChapter);

      const firstQ = questions[0];
      const sessionTitle =
        firstQ?.type === 'mapping'
          ? `UPSC-Mapping-${firstQ.place || 'Atlas'}`
          : `UPSC-PYQ-${firstQ?.srcSubject || 'Session'}`;

      recorder.ondataavailable = async (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
          // Crash-safe periodic snapshot to IndexedDB
          const partialBlob = new Blob(recordedChunksRef.current, { type: mimeType });
          await saveRecordingToVault({
            id: recId,
            title: sessionTitle,
            blob: partialBlob,
            mimeType,
            sizeBytes: partialBlob.size,
            durationSec: recSecondsRef.current,
            chapters: chaptersRef.current,
            status: 'in_progress',
          });
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(3000); // Emit chunk every 3 seconds for IndexedDB crash safety & retake granularity
      setRecState('recording');
    } catch (err) {
      console.warn('[Recording Studio] Recording start cancelled or failed:', err);
      setRecState('idle');
    }
  }, [recordingPreset, preferredFormat, selectedAudioId, micGain, micMuted, qIndex, currentQ, questions, stopRecordingInternal]);

  const handleTogglePauseRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    if (recorder.state === 'recording') {
      recorder.pause();
      setRecState('paused');
    } else if (recorder.state === 'paused') {
      recorder.resume();
      setRecState('recording');
    }
  }, []);

  // Retake Current Question: rewinds video chunks, timer, and ink to the start of current question
  const handleRetakeCurrentQuestion = useCallback(() => {
    if (recState !== 'recording' && recState !== 'paused') return;
    const currentChapters = chaptersRef.current;
    const currentChapter = currentChapters[currentChapters.length - 1];
    if (!currentChapter) return;

    // 1. Truncate recorded video chunks back to where this question began (keepchunk 0 if header chunk is needed)
    const targetChunkIdx = Math.max(1, currentChapter.chunkStartIndex || 1);
    if (recordedChunksRef.current.length > targetChunkIdx) {
      recordedChunksRef.current = recordedChunksRef.current.slice(0, targetChunkIdx);
    }

    // 2. Rewind elapsed timer to the start of this question
    const rewindSec = currentChapter.startSec || 0;
    recSecondsRef.current = rewindSec;
    setRecSeconds(rewindSec);

    // 3. Clear pen strokes for current question and reset stepIndex to 0
    const qId = currentQ?.id || `item_${qIndex}`;
    setQuestionInkMap((prev) => ({ ...prev, [qId]: [] }));
    setStepInkMap((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (k.startsWith(`${qId}_`)) delete next[k];
      });
      return next;
    });
    setStepIndex(0);
  }, [recState, currentQ, qIndex]);

  const handleDownloadCompleted = useCallback(() => {
    if (!completedRecording?.blob) return;
    const ext = (completedRecording.mimeType || '').includes('mp4') ? 'mp4' : 'webm';
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `${completedRecording.title}-${dateStr}.${ext}`;
    const a = document.createElement('a');
    a.href = completedRecording.url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [completedRecording]);

  const handleCopyCompletedChapters = useCallback(async () => {
    if (!completedRecording) return;
    const text = formatYouTubeChapters(completedRecording.chapters, completedRecording.title);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedChapters(true);
      setTimeout(() => setCopiedChapters(false), 2000);
    } catch {
      // ignore
    }
  }, [completedRecording]);

  // =============================================================
  // EXISTING LECTURE STUDIO LOGIC (100% PRESERVED)
  // =============================================================
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
  const currentQId = currentQ?.id || `item_${qIndex}`;
  const currentStepKey = `${currentQId}_${currentStep?.id || stepIndex}`;

  const currentQStrokes = useMemo(() => {
    return questionInkMap[currentQId] || [];
  }, [questionInkMap, currentQId]);

  const currentStepStrokes = useMemo(() => {
    return stepInkMap[currentStepKey] || [];
  }, [stepInkMap, currentStepKey]);

  const [presentationMode, setPresentationMode] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pq_present_mode');
        if (saved === 'screen' || saved === '16:9') return saved;
      } catch {
        // ignore
      }
    }
    return 'screen';
  });

  const [screenStageSize, setScreenStageSize] = useState({ width: 1280, height: 720 });
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [mapWidthMode, setMapWidthMode] = useState('split');
  const [spotlightIndex, setSpotlightIndex] = useState(null);
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

  useEffect(() => {
    setSpotlightIndex(null);
  }, [qIndex, stepIndex]);

  const isMappingMode = currentQ?.type === 'mapping';
  const isFullStageScratchpad = currentStep?.type === 'scratchpad' && currentStep?.isFullStage;
  const canvasWidth = presentationMode === 'screen' ? screenStageSize.width : 1920;
  const canvasHeight = presentationMode === 'screen' ? screenStageSize.height : 1080;
  const mapSplitRatio = mapWidthMode === 'full' ? 1.0 : mapWidthMode === 'wide' ? 0.70 : 0.58;
  const mapSplitPx169 = mapWidthMode === 'full' ? 1920 : mapWidthMode === 'wide' ? 1344 : 1114;
  const leftBoundaryX = presentationMode === 'screen'
    ? Math.round(screenStageSize.width * (isMappingMode ? mapSplitRatio : 0.44))
    : (isMappingMode ? mapSplitPx169 : 830);

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

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isSmall = h <= 850 || w <= 1440;
      setIsSmallScreen(isSmall);

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

  useEffect(() => {
    if (timerSeconds === null || timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds(s => (s > 1 ? s - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerSeconds]);

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
          <h2 style={{ fontSize: 28, margin: '0 0 12px' }}>No Recording Items Queued</h2>
          <p style={{ color: '#94a3b8', margin: '0 0 24px' }}>Please select questions or mapping nodes in the Recording Studio Hub.</p>
          <Link href="/admin/recording-studio" style={{ padding: '10px 20px', borderRadius: 8, background: '#f43f5e', color: '#fff', textDecoration: 'none', fontWeight: 800 }}>
            ← Return to Recording Studio Hub
          </Link>
        </div>
      </div>
    );
  }

  const isTopicMode = currentQ.type === 'topic';
  const stemBlocks = (isTopicMode || (isMappingMode && !currentQ.stem)) ? [] : parseStem(currentQ.stem);
  const options = Array.isArray(currentQ.options) ? currentQ.options : [];
  const palette = theme === 'light' ? LIGHT_PALETTE : DARK_PALETTE;

  const webcamDimensions =
    webcamSize === 'large'
      ? { width: 380, height: 214 }
      : webcamSize === 'compact'
      ? { width: 260, height: 146 }
      : { width: 320, height: 180 };

  return (
    <div className="pq-present-root" data-present-theme={theme}>
      {/* 3-2-1 Recording Countdown Overlay */}
      {recState === 'countdown' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.72)',
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
              width: 140,
              height: 140,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
              boxShadow: '0 0 60px rgba(244, 63, 94, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 68,
              fontWeight: 900,
              marginBottom: 18,
            }}
          >
            {countdownNum}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fb7185' }}>
            Starting Stage Recording...
          </div>
        </div>
      )}

      {/* Error Toast Banner */}
      {recError && (
        <div
          style={{
            position: 'fixed',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100002,
            padding: '10px 18px',
            borderRadius: 12,
            background: '#991b1b',
            border: '1px solid #f87171',
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          }}
        >
          <span>{recError}</span>
          <button
            type="button"
            onClick={() => setRecError('')}
            style={{ background: 'transparent', border: 'none', color: '#fca5a5', cursor: 'pointer', fontWeight: 900 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 16:9 Scaled Viewport Container */}
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

          {/* LEFT PANEL: MAP CONTAINER OR PINNED QUESTION */}
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

                  <div className="pq-present-q-scrollable">
                    {isTopicMode ? (
                      <div className="pq-present-anchor-topic">
                        <h2 className="pq-topic-anchor-title">{currentQ.title}</h2>
                        <div className="pq-topic-anchor-summary">
                          {currentQ.cumulativeSummary || currentQ.overview || currentQ.backgroundNote || 'Foundational syllabus topic anchor.'}
                        </div>
                      </div>
                    ) : (
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

                <div className="pq-present-left-footer">
                  <span>ITEM {qIndex + 1} OF {questions.length}</span>
                  <span style={{ color: theme === 'light' ? '#0284c7' : '#38bdf8' }}>
                    {isTopicMode ? (currentQ.domain || 'Thematic Lecture') : (currentQ.srcSubject || 'General Studies')}
                  </span>
                </div>
              </>
            )}
          </aside>

          {/* RIGHT PANEL: DYNAMIC EXPLANATION / TOPIC SLIDES */}
          <main className={`pq-present-right-panel ${isMappingMode ? 'is-map-right-panel' : ''}`}>
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

            <div className={`pq-present-slide-body ${currentStep?.type === 'scratchpad' ? 'is-scratchpad-body' : ''}`}>
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
                      <div className="pq-pattern-selector">
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

                      <button
                        type="button"
                        onClick={handleToggleScratchpadFullStage}
                        className="pq-scratchpad-action-btn"
                      >
                        <Columns size={13} />
                        <span>{currentStep.isFullStage ? 'Split View' : 'Full Stage'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDeleteCurrentScratchpad}
                        className="pq-scratchpad-del-btn"
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

              {currentStep?.type === 'image' && currentStep.imageUrl && (
                <div className="pq-present-image-container">
                  <div
                    className={`pq-present-image-wrap ${isZoomedImage ? 'is-zoomed' : ''}`}
                    onClick={() => setIsZoomedImage(z => !z)}
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

              {currentStep?.type === 'sketch' && (
                <div className="pq-present-sketch-slide">
                  <span className="pq-sketch-watermark">
                    FREEHAND SKETCH &amp; MINDMAP CANVAS · DRAW WITH XP-PEN
                  </span>
                </div>
              )}

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

              {(currentStep?.type === 'breakdown' || currentStep?.type === 'statement_breakdown') && currentStep.items && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {currentStep.items.map((item, i) => {
                    const isCorrect = (item.verdict || '').toLowerCase().includes('correct') && !(item.verdict || '').toLowerCase().includes('incorrect') && !(item.verdict || '').toLowerCase().includes('false');
                    const isStmt = currentStep.type === 'statement_breakdown' || item.statementNo != null;
                    const labelText = isStmt
                      ? `Statement ${item.statementNo || i + 1}`
                      : `Option (${String(item.label || i + 1).toUpperCase()})`;

                    return (
                      <div
                        key={i}
                        className={`pq-present-breakdown-card ${isCorrect ? 'is-correct-card' : 'is-incorrect-card'}`}
                      >
                        <div className="pq-present-bc-head">
                          <span className="pq-present-bc-label">{labelText}</span>
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

              {currentStep?.type === 'table' && (
                <div
                  className="pq-present-card"
                  style={{
                    padding: '24px 28px',
                    overflowX: 'auto',
                    borderColor: 'rgba(56, 189, 248, 0.4)',
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
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {currentStep.tableData.rows?.map((row, rIdx) => (
                          <tr key={rIdx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                style={{
                                  padding: '12px 16px',
                                  color: cIdx === 0 ? (theme === 'light' ? '#0f172a' : '#ffffff') : (theme === 'light' ? '#334155' : '#cbd5e1'),
                                  fontWeight: cIdx === 0 ? 800 : 500,
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
                </div>
              )}

              {currentStep?.type?.startsWith('topic_') && (
                <div className="pq-present-topic-card">
                  <p className="pq-present-topic-prose">
                    {currentStep.content || currentStep.summary || ''}
                  </p>
                </div>
              )}

              {/* RIVER STAGES 1–5 */}
              {currentStep?.type === 'river_course' && currentStep.riverDetails && (() => {
                const rd = currentStep.riverDetails;
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="pq-present-intro-grid">
                      <div className="pq-present-stat-box">
                        <div className="pq-present-stat-label">Total River Length</div>
                        <div className="pq-present-stat-value" style={{ color: '#38bdf8', fontSize: fs(21) }}>{rd.length || 'Major System'}</div>
                      </div>
                      <div className="pq-present-stat-box">
                        <div className="pq-present-stat-label">Source / Origin</div>
                        <div className="pq-present-stat-value" style={{ fontSize: fs(17.5), lineHeight: 1.35 }}>{rd.origin}</div>
                      </div>
                      <div className="pq-present-stat-box">
                        <div className="pq-present-stat-label">Outflow / Mouth</div>
                        <div className="pq-present-stat-value" style={{ fontSize: fs(17.5), lineHeight: 1.35 }}>{rd.mouth}</div>
                      </div>
                      <div className="pq-present-stat-box">
                        <div className="pq-present-stat-label">River Classification</div>
                        <div className="pq-present-stat-value" style={{ fontSize: fs(18) }}>{currentQ.placeType || 'Major River System'}</div>
                      </div>
                    </div>

                    {rd.states && (
                      <div className="pq-present-card" style={{ padding: '18px 20px' }}>
                        <div style={{ fontSize: fs(14), fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>🗺️</span>
                          <span>States It Passes Through vs Total Catchment Basin</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                          <span style={{ fontSize: fs(15.5), fontWeight: 800, color: theme === 'light' ? '#334155' : '#cbd5e1' }}>Direct River Flow:</span>
                          {rd.states.flowsThrough?.map((st, idx) => (
                            <span key={idx} style={{ fontSize: fs(16), fontWeight: 800, padding: '5px 14px', borderRadius: 8, background: '#0284c7', color: '#ffffff' }}>
                              {st}
                            </span>
                          ))}
                        </div>
                        {rd.states.basinStates && (
                          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                            <span style={{ fontSize: fs(14.5), fontWeight: 700, color: theme === 'light' ? '#475569' : '#94a3b8' }}>Basin Catchment:</span>
                            {rd.states.basinStates.map((st, idx) => (
                              <span key={idx} style={{ fontSize: fs(14), fontWeight: 700, padding: '4px 11px', borderRadius: 6, background: theme === 'light' ? '#f1f5f9' : 'rgba(255, 255, 255, 0.1)', color: theme === 'light' ? '#1e293b' : '#e2e8f0' }}>
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

              {currentStep?.type === 'river_left_tributaries' && currentStep.riverDetails && (() => {
                const rd = currentStep.riverDetails;
                const leftList = rd.tributaries?.leftBank || [];
                const useTwoCols = leftList.length > 3 && mapWidthMode === 'split';
                return (
                  <div className="pq-present-card" style={{ borderColor: 'rgba(56, 189, 248, 0.45)', background: theme === 'light' ? '#f0f9ff' : 'rgba(15, 23, 42, 0.9)', padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 14, borderBottom: '2px solid rgba(2, 132, 199, 0.3)', paddingBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: fs(16), fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
                        <span>⬅️</span>
                        <span>Left-Bank Tributaries (Click or press 1–{leftList.length})</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 800, padding: '4px 11px', borderRadius: 8, background: '#0284c7', color: '#ffffff' }}>
                        MAP LAYER: CYAN
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: useTwoCols ? 'minmax(0, 1fr) minmax(0, 1fr)' : '1fr', gap: 12 }}>
                      {leftList.map((trib, idx) => {
                        const isSpotlit = spotlightIndex === idx + 1;
                        return (
                          <div
                            key={idx}
                            onClick={() => setSpotlightIndex(prev => (prev === idx + 1 ? null : idx + 1))}
                            style={{
                              cursor: 'pointer',
                              minWidth: 0,
                              background: isSpotlit
                                ? (theme === 'light' ? '#e0f2fe' : 'rgba(14, 165, 233, 0.22)')
                                : (theme === 'light' ? '#ffffff' : 'rgba(255, 255, 255, 0.05)'),
                              padding: '13px 16px',
                              borderRadius: 12,
                              borderLeft: '6px solid #0284c7',
                              outline: isSpotlit ? '2px solid #38bdf8' : 'none',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13.5, fontWeight: 900, flexShrink: 0 }}>
                                {idx + 1}
                              </span>
                              <span style={{ fontSize: fs(18.5), fontWeight: 800, color: theme === 'light' ? '#0f172a' : '#ffffff' }}>
                                {trib.name}
                              </span>
                            </div>
                            {trib.note && (
                              <div style={{ fontSize: fs(15.5), fontWeight: 500, color: theme === 'light' ? '#1e293b' : '#e2e8f0', marginTop: 6, lineHeight: 1.48, paddingLeft: 36 }}>
                                {trib.note}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {currentStep?.type === 'river_right_tributaries' && currentStep.riverDetails && (() => {
                const rd = currentStep.riverDetails;
                const rightList = rd.tributaries?.rightBank || [];
                const useTwoCols = rightList.length > 3 && mapWidthMode === 'split';
                return (
                  <div className="pq-present-card" style={{ borderColor: 'rgba(245, 158, 11, 0.45)', background: theme === 'light' ? '#fffbeb' : 'rgba(15, 23, 42, 0.9)', padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 14, borderBottom: '2px solid rgba(217, 119, 6, 0.3)', paddingBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: fs(16), fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase' }}>
                        <span>➡️</span>
                        <span>Right-Bank Tributaries (Click or press 1–{rightList.length})</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 800, padding: '4px 11px', borderRadius: 8, background: '#d97706', color: '#ffffff' }}>
                        MAP LAYER: AMBER
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: useTwoCols ? 'minmax(0, 1fr) minmax(0, 1fr)' : '1fr', gap: 12 }}>
                      {rightList.map((trib, idx) => {
                        const isSpotlit = spotlightIndex === idx + 1;
                        return (
                          <div
                            key={idx}
                            onClick={() => setSpotlightIndex(prev => (prev === idx + 1 ? null : idx + 1))}
                            style={{
                              cursor: 'pointer',
                              minWidth: 0,
                              background: isSpotlit
                                ? (theme === 'light' ? '#fef3c7' : 'rgba(245, 158, 11, 0.22)')
                                : (theme === 'light' ? '#ffffff' : 'rgba(255, 255, 255, 0.05)'),
                              padding: '13px 16px',
                              borderRadius: 12,
                              borderLeft: '6px solid #d97706',
                              outline: isSpotlit ? '2px solid #fbbf24' : 'none',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#d97706', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13.5, fontWeight: 900, flexShrink: 0 }}>
                                {idx + 1}
                              </span>
                              <span style={{ fontSize: fs(18.5), fontWeight: 800, color: theme === 'light' ? '#0f172a' : '#ffffff' }}>
                                {trib.name}
                              </span>
                            </div>
                            {trib.note && (
                              <div style={{ fontSize: fs(15.5), fontWeight: 500, color: theme === 'light' ? '#1e293b' : '#e2e8f0', marginTop: 6, lineHeight: 1.48, paddingLeft: 36 }}>
                                {trib.note}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {currentStep?.type === 'river_dams_confluences' && currentStep.riverDetails && (() => {
                const rd = currentStep.riverDetails;
                const sangams = rd.confluences || [];
                const dams = rd.dams || [];
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="pq-present-card" style={{ borderColor: 'rgba(139, 92, 246, 0.45)', padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: fs(15.5), fontWeight: 800, color: '#a78bfa', textTransform: 'uppercase', marginBottom: 12, borderBottom: '2px solid rgba(139, 92, 246, 0.3)', paddingBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>🤝</span>
                          <span>Important Sangams / Confluences</span>
                        </div>
                        <span style={{ fontSize: 11.5, fontWeight: 800, padding: '3px 10px', borderRadius: 6, background: '#8b5cf6', color: '#ffffff' }}>
                          PURPLE PINS
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: mapWidthMode === 'wide' ? '1fr' : 'minmax(0, 1fr) minmax(0, 1fr)', gap: 10 }}>
                        {sangams.map((c, idx) => {
                          const pinNum = idx + 1;
                          const isSpotlit = spotlightIndex === pinNum;
                          return (
                            <div
                              key={idx}
                              onClick={() => setSpotlightIndex(prev => (prev === pinNum ? null : pinNum))}
                              style={{
                                cursor: 'pointer',
                                background: isSpotlit ? (theme === 'light' ? '#ede9fe' : 'rgba(139, 92, 246, 0.22)') : (theme === 'light' ? '#f8fafc' : 'rgba(255, 255, 255, 0.05)'),
                                padding: '11px 14px',
                                borderRadius: 10,
                                borderLeft: '4px solid #8b5cf6',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#8b5cf6', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900 }}>
                                  {pinNum}
                                </span>
                                <strong style={{ fontSize: fs(16.5), color: theme === 'light' ? '#0f172a' : '#ffffff' }}>{c.sangam}</strong>
                              </div>
                              {c.note && (
                                <div style={{ fontSize: fs(14.5), color: theme === 'light' ? '#334155' : '#cbd5e1', marginTop: 4, paddingLeft: 30 }}>
                                  {c.note}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pq-present-card" style={{ borderColor: 'rgba(56, 189, 248, 0.45)', padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: fs(15.5), fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', marginBottom: 12, borderBottom: '2px solid rgba(2, 132, 199, 0.3)', paddingBottom: 8 }}>
                        <span>🏗️ Major Dams &amp; Multipurpose Projects</span>
                        <span style={{ fontSize: 11.5, fontWeight: 800, padding: '3px 10px', borderRadius: 6, background: '#0284c7', color: '#ffffff' }}>
                          BLUE PINS
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: mapWidthMode === 'wide' ? '1fr' : 'minmax(0, 1fr) minmax(0, 1fr)', gap: 10 }}>
                        {dams.map((dam, idx) => {
                          const pinNum = 6 + idx + 1;
                          const isSpotlit = spotlightIndex === pinNum;
                          return (
                            <div
                              key={idx}
                              onClick={() => setSpotlightIndex(prev => (prev === pinNum ? null : pinNum))}
                              style={{
                                cursor: 'pointer',
                                background: isSpotlit ? (theme === 'light' ? '#e0f2fe' : 'rgba(14, 165, 233, 0.22)') : (theme === 'light' ? '#f8fafc' : 'rgba(255, 255, 255, 0.05)'),
                                padding: '11px 14px',
                                borderRadius: 10,
                                borderLeft: '4px solid #0284c7',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                                <strong style={{ fontSize: fs(16.5), color: theme === 'light' ? '#0f172a' : '#ffffff' }}>{dam.name}</strong>
                                {dam.state && (
                                  <span style={{ fontSize: fs(12.5), fontWeight: 800, padding: '2px 9px', borderRadius: 6, background: '#fee2e2', color: '#991b1b' }}>
                                    {dam.state}
                                  </span>
                                )}
                              </div>
                              {dam.type && (
                                <div style={{ fontSize: fs(14.5), color: theme === 'light' ? '#334155' : '#cbd5e1', marginTop: 4 }}>
                                  {dam.type}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {currentStep?.type === 'river_ecology_towns' && currentStep.riverDetails && (() => {
                const rd = currentStep.riverDetails;
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="pq-present-card" style={{ borderColor: 'rgba(16, 185, 129, 0.45)', padding: '15px 18px' }}>
                      <div style={{ fontSize: fs(15), fontWeight: 800, color: '#10b981', textTransform: 'uppercase', marginBottom: 10 }}>
                        🌲 National Parks &amp; Sanctuaries in Basin
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: mapWidthMode === 'wide' ? '1fr' : 'minmax(0, 1fr) minmax(0, 1fr)', gap: 10 }}>
                        {rd.protectedAreas?.map((pa, idx) => (
                          <div
                            key={idx}
                            onClick={() => setSpotlightIndex(prev => (prev === idx + 1 ? null : idx + 1))}
                            style={{ cursor: 'pointer', fontSize: fs(15.5), padding: '9px 12px', borderRadius: 8, background: theme === 'light' ? '#f0fdf4' : 'rgba(255, 255, 255, 0.04)', borderLeft: '4px solid #10b981' }}
                          >
                            <strong style={{ color: '#34d399', fontSize: fs(16.5) }}>{idx + 1}. {pa.name}</strong> ({pa.state})
                            <div style={{ color: theme === 'light' ? '#1e293b' : '#e2e8f0', marginTop: 3 }}>{pa.relation}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pq-present-card" style={{ borderColor: 'rgba(234, 179, 8, 0.45)', padding: '15px 18px' }}>
                      <div style={{ fontSize: fs(15), fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', marginBottom: 10 }}>
                        🏛️ Important Cities &amp; Historical Capitals
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: mapWidthMode === 'wide' ? '1fr' : 'minmax(0, 1fr) minmax(0, 1fr)', gap: 10 }}>
                        {rd.towns?.map((tw, idx) => {
                          const pinNum = (rd.protectedAreas?.length || 6) + idx + 1;
                          return (
                            <div
                              key={idx}
                              onClick={() => setSpotlightIndex(prev => (prev === pinNum ? null : pinNum))}
                              style={{ cursor: 'pointer', fontSize: fs(15.5), padding: '9px 12px', borderRadius: 8, background: theme === 'light' ? '#fefce8' : 'rgba(255, 255, 255, 0.04)', borderLeft: '4px solid #eab308' }}
                            >
                              <strong style={{ color: theme === 'light' ? '#0f172a' : '#ffffff', fontSize: fs(16.5) }}>{pinNum}. {tw.name}</strong> ({tw.state})
                              <div style={{ color: theme === 'light' ? '#1e293b' : '#e2e8f0', marginTop: 3 }}>{tw.significance}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}

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

              {currentStep?.type === 'mapping_facts' && currentStep.facts && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {currentStep.facts.map((fact, idx) => (
                    <div key={idx} className="pq-present-concept-card">
                      <div className="pq-present-concept-title">
                        <Compass size={19} color="#34d399" />
                        <span>Key Fact #{idx + 1}</span>
                      </div>
                      <p className="pq-present-concept-note" style={{ fontSize: 18.5, lineHeight: 1.6 }}>
                        {fact}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {currentStep?.type === 'mapping_angle' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {currentStep.upscAngle && (
                    <div className="pq-present-card" style={{ borderColor: 'rgba(245, 158, 11, 0.45)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', marginBottom: 10 }}>
                        <Sparkles size={17} />
                        <span>⚠️ Common UPSC Mistake / Examiner Trap</span>
                      </div>
                      <p style={{ fontSize: 19.5, lineHeight: 1.6, margin: 0 }}>
                        {currentStep.upscAngle}
                      </p>
                    </div>
                  )}

                  {currentStep.newsHook && (
                    <div className="pq-present-news-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14.5, fontWeight: 800, color: '#f87171', textTransform: 'uppercase' }}>
                        <Flame size={15} />
                        <span>📰 Why in the News Recently</span>
                      </div>
                      <h3 className="pq-present-news-headline">{currentStep.newsHook}</h3>
                    </div>
                  )}
                </div>
              )}

              {currentStep?.type === 'mapping_pyq' && currentStep.pyq && (
                <div className="pq-present-card" style={{ borderColor: 'rgba(56, 189, 248, 0.4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14.5, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', marginBottom: 10 }}>
                    <Layers size={15} />
                    <span>Past Year UPSC Question: {currentStep.pyq.exam || 'UPSC CSE Pre'} {currentStep.pyq.examYear || ''}</span>
                  </div>
                  <p style={{ fontSize: 19, lineHeight: 1.55, margin: '0 0 14px' }}>
                    {currentStep.pyq.stem}
                  </p>
                  {currentStep.pyq.correctLabel && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 8, background: '#22c55e', color: '#052e16', fontSize: 15, fontWeight: 800, marginBottom: 8 }}>
                      <span>Correct Answer: Option ({currentStep.pyq.correctLabel})</span>
                    </div>
                  )}
                  {currentStep.pyq.answerText && (
                    <div style={{ fontSize: 16.5, marginTop: 10, lineHeight: 1.55 }}>
                      {currentStep.pyq.answerText}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ========================================================= */}
            {/* LIVE WEBCAM FEED OR SAFE ZONE BOUNDARY (Bottom Right)      */}
            {/* ========================================================= */}
            {showWebcamBox && (
              <div
                className="pq-present-webcam-safe-zone"
                style={{
                  width: webcamDimensions.width,
                  height: webcamDimensions.height,
                  overflow: 'hidden',
                  borderStyle: webcamLive ? 'solid' : 'dashed',
                  borderColor: webcamLive ? 'rgba(56, 189, 248, 0.65)' : undefined,
                  background: webcamLive ? '#000000' : undefined,
                  boxShadow: webcamLive ? '0 12px 32px rgba(0, 0, 0, 0.55)' : undefined,
                  pointerEvents: 'auto',
                }}
              >
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
                      display: 'block',
                    }}
                  />
                ) : (
                  <div
                    className="pq-webcam-label"
                    onClick={startWebcam}
                    style={{ cursor: 'pointer' }}
                    title="Click to turn on Live Webcam inside this box"
                  >
                    <Camera size={18} />
                    <span>CLICK FOR LIVE WEBCAM</span>
                    <small>{webcamDimensions.width} × {webcamDimensions.height} (Press W to hide)</small>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Blackboard / Whiteboard Overlay */}
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

          {/* In-Studio Playlist Tray */}
          {isQueueOpen && (
            <div className="pq-present-queue-drawer">
              <div className="pq-queue-header">
                <div className="pq-queue-title">
                  <ListOrdered size={20} color="#38bdf8" />
                  <span>Recording Deck Queue ({questions.length})</span>
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
                        <div className="pq-queue-item-title">{itemTitle}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ANNOTATION CANVAS */}
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
      {/* FLOATING CAMERA & MIC SETTINGS POPOVER                        */}
      {/* ============================================================= */}
      {showAvPopover && (
        <div
          style={{
            position: 'fixed',
            bottom: 78,
            right: 28,
            width: 340,
            padding: 18,
            borderRadius: 16,
            background: '#0f172a',
            border: '1.5px solid rgba(56, 189, 248, 0.35)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65)',
            color: '#f8fafc',
            zIndex: 100003,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13.5, fontWeight: 900, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Camera &amp; Mic Studio Setup
            </span>
            <button
              type="button"
              onClick={() => setShowAvPopover(false)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Camera Select */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 11.5, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
              Webcam Device
            </label>
            <select
              value={selectedVideoId}
              onChange={(e) => {
                setSelectedVideoId(e.target.value);
                if (webcamLive) startWebcam(e.target.value);
              }}
              style={{
                padding: '7px 10px',
                borderRadius: 8,
                background: '#020617',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#f8fafc',
                fontSize: 12.5,
              }}
            >
              {videoDevices.length === 0 && <option value="">Default Camera</option>}
              {videoDevices.map((d, idx) => (
                <option key={d.deviceId || idx} value={d.deviceId}>
                  {d.label || `Camera ${idx + 1}`}
                </option>
              ))}
            </select>
          </div>

          {/* Webcam Mirror & Size Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <button
              type="button"
              onClick={() => setWebcamMirrored((m) => !m)}
              style={{
                flex: 1,
                padding: '7px 10px',
                borderRadius: 8,
                background: webcamMirrored ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                color: '#f8fafc',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <FlipHorizontal size={14} />
              <span>{webcamMirrored ? 'Mirrored: ON' : 'Mirrored: OFF'}</span>
            </button>

            <select
              value={webcamSize}
              onChange={(e) => setWebcamSize(e.target.value)}
              style={{
                padding: '7px 10px',
                borderRadius: 8,
                background: '#020617',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#f8fafc',
                fontSize: 12,
              }}
            >
              <option value="compact">Compact (260×146)</option>
              <option value="standard">Standard (320×180)</option>
              <option value="large">Large (380×214)</option>
            </select>
          </div>

          {/* Microphone Select */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 11.5, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
              Microphone Input
            </label>
            <select
              value={selectedAudioId}
              onChange={(e) => setSelectedAudioId(e.target.value)}
              style={{
                padding: '7px 10px',
                borderRadius: 8,
                background: '#020617',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#f8fafc',
                fontSize: 12.5,
              }}
            >
              {audioDevices.length === 0 && <option value="">Default Microphone</option>}
              {audioDevices.map((d, idx) => (
                <option key={d.deviceId || idx} value={d.deviceId}>
                  {d.label || `Microphone ${idx + 1}`}
                </option>
              ))}
            </select>
          </div>

          {/* Mic Volume Gain Boost */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#cbd5e1', fontWeight: 700 }}>
              <span>Voice Gain Boost</span>
              <span>{Math.round(micGain * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.2"
              step="0.05"
              value={micGain}
              onChange={(e) => setMicGain(Number(e.target.value))}
              style={{ accentColor: '#38bdf8' }}
            />
          </div>

          {/* Recording Quality & Size Preset */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 11.5, fontWeight: 800, color: '#34d399', textTransform: 'uppercase' }}>
              Recording Quality &amp; File Size
            </label>
            <select
              value={recordingPreset}
              onChange={(e) => setRecordingPreset(e.target.value)}
              style={{
                padding: '7px 10px',
                borderRadius: 8,
                background: '#020617',
                border: '1px solid rgba(52, 211, 153, 0.35)',
                color: '#f8fafc',
                fontSize: 12,
              }}
            >
              {Object.entries(RECORDING_PRESETS).map(([key, p]) => (
                <option key={key} value={key}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Video Codec / Format Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 11.5, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
              Video Encoder Format
            </label>
            <select
              value={preferredFormat}
              onChange={(e) => setPreferredFormat(e.target.value)}
              style={{
                padding: '7px 10px',
                borderRadius: 8,
                background: '#020617',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#f8fafc',
                fontSize: 12,
              }}
            >
              <option value="mp4">MP4 (H.264 Universal · QuickTime / Instagram / YouTube — Recommended)</option>
              <option value="vp9">WebM (VP9 Screen Codec · Ultra-Small Backup)</option>
            </select>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* FLOATING PRESENTER & RECORDER DOCK                            */}
      {/* ============================================================= */}
      {isDockCollapsed ? (
        <button
          type="button"
          onClick={() => setIsDockCollapsed(false)}
          className="pq-present-dock-pill"
          title="Expand Presenter & Recording Tools [D]"
          style={
            recState === 'recording'
              ? { border: '1.5px solid #f43f5e', boxShadow: '0 0 16px rgba(244, 63, 94, 0.5)' }
              : undefined
          }
        >
          {recState === 'recording' && (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#f43f5e',
                display: 'inline-block',
              }}
            />
          )}
          <ChevronUp size={14} />
          <span>{recState === 'recording' ? `REC ${formatDurationTimestamp(recSeconds)}` : 'Tools'}</span>
        </button>
      ) : (
        <footer className="pq-present-dock">
          {/* ========================================================= */}
          {/* IN-BROWSER RECORDING CONTROLS CLUSTER                     */}
          {/* ========================================================= */}
          {recState === 'idle' ? (
            <button
              type="button"
              onClick={handleStartRecording}
              style={{
                height: 36,
                padding: '0 14px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                fontSize: 12.5,
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                boxShadow: '0 4px 14px rgba(244, 63, 94, 0.4)',
              }}
              title="Start Stage-Only Video + Mic Recording"
            >
              <Radio size={15} />
              <span>REC</span>
            </button>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 8px',
                borderRadius: 12,
                background: 'rgba(244, 63, 94, 0.16)',
                border: '1px solid rgba(244, 63, 94, 0.45)',
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: recState === 'paused' ? '#fbbf24' : '#f43f5e',
                  boxShadow: recState === 'paused' ? 'none' : '0 0 10px #f43f5e',
                }}
              />
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: 13,
                  fontWeight: 900,
                  color: '#ffffff',
                  minWidth: 44,
                }}
              >
                {formatDurationTimestamp(recSeconds)}
              </span>

              {/* Live Mic Level Mini Bar */}
              <div
                style={{
                  width: 28,
                  height: 6,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.15)',
                  overflow: 'hidden',
                }}
                title={`Mic Level: ${micLevel}%`}
              >
                <div
                  style={{
                    width: `${micMuted ? 0 : micLevel}%`,
                    height: '100%',
                    background: micLevel > 80 ? '#f59e0b' : '#34d399',
                    transition: 'width 0.08s linear',
                  }}
                />
              </div>

              {/* Pause / Resume */}
              <button
                type="button"
                onClick={handleTogglePauseRecording}
                className="pq-dock-btn"
                style={{ width: 28, height: 28 }}
                title={recState === 'paused' ? 'Resume Recording' : 'Pause Recording'}
              >
                {recState === 'paused' ? <Play size={14} /> : <Pause size={14} />}
              </button>

              {/* Retake Current Question */}
              <button
                type="button"
                onClick={handleRetakeCurrentQuestion}
                className="pq-dock-btn"
                style={{ width: 'auto', height: 28, padding: '0 8px', fontSize: 11, fontWeight: 800, gap: 4, color: '#fbbf24' }}
                title="Retake Current Question (Rewinds video & clears ink back to start of this question)"
              >
                <RotateCcw size={12} />
                <span>Retake Q</span>
              </button>

              {/* Stop & Finish Recording */}
              <button
                type="button"
                onClick={stopRecordingInternal}
                style={{
                  height: 28,
                  padding: '0 10px',
                  borderRadius: 8,
                  background: '#ef4444',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: 11.5,
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
                title="Stop Recording & Open Download / Chapters Modal"
              >
                <Square size={12} fill="currentColor" />
                <span>Finish</span>
              </button>
            </div>
          )}

          {/* Live Webcam Toggle Button */}
          <button
            type="button"
            onClick={toggleWebcamLive}
            className={`pq-dock-btn ${webcamLive ? 'is-active' : ''}`}
            style={
              webcamLive
                ? { background: 'rgba(16, 185, 129, 0.22)', borderColor: '#10b981', color: '#34d399' }
                : undefined
            }
            title={webcamLive ? 'Turn Off Live Webcam Feed' : 'Turn On Live Webcam inside Stage Slot'}
          >
            {webcamLive ? <Camera size={16} /> : <CameraOff size={16} />}
          </button>

          {/* Mic Mute Toggle */}
          <button
            type="button"
            onClick={() => setMicMuted((m) => !m)}
            className={`pq-dock-btn ${!micMuted ? 'is-active' : ''}`}
            title={micMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {micMuted ? <MicOff size={16} color="#f87171" /> : <Mic size={16} />}
          </button>

          {/* A/V Device Setup Popover Toggle */}
          <button
            type="button"
            onClick={() => setShowAvPopover((o) => !o)}
            className={`pq-dock-btn ${showAvPopover ? 'is-active' : ''}`}
            title="Camera & Microphone Settings"
          >
            <Settings size={15} />
          </button>

          <div className="pq-dock-sep" />

          {/* Deck Navigator */}
          <button
            type="button"
            onClick={handlePrev}
            className="pq-dock-btn"
            title="Previous Step [Left Arrow]"
          >
            <ChevronLeft size={18} />
          </button>

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

          {/* Pan / Interact Map */}
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
            title="Pen Tool [P]"
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

          {/* Pen Thickness */}
          <div className="pq-dock-sizes">
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

          <button
            type="button"
            onClick={() => setIsQueueOpen(o => !o)}
            className={`pq-dock-btn ${isQueueOpen ? 'is-active' : ''}`}
            title="Toggle Recording Queue [Q]"
          >
            <ListOrdered size={16} />
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="pq-dock-btn"
            title="Toggle Dark / Light Mode [M]"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            type="button"
            onClick={handleCycleFontScale}
            className={`pq-dock-btn ${contentFontScale > 1 ? 'is-active' : ''}`}
            style={{ width: 'auto', padding: '0 9px', fontSize: 11.5, fontWeight: 800, gap: 4 }}
            title="Cycle Content Text Size (100% → 112% → 124%)"
          >
            <span>A+</span>
            <span style={{ fontSize: 10, opacity: 0.85 }}>{Math.round(contentFontScale * 100)}%</span>
          </button>

          <button
            type="button"
            onClick={() => setShowWebcamBox(w => !w)}
            className={`pq-dock-btn ${showWebcamBox ? 'is-active' : ''}`}
            title="Show / Hide Webcam Slot on Stage [W]"
          >
            <Film size={16} />
          </button>

          <button
            type="button"
            onClick={() => setTimerSeconds(s => (s ? null : 30))}
            className={`pq-dock-btn ${timerSeconds !== null ? 'is-active' : ''}`}
            title="30s Think Timer [T]"
          >
            <Timer size={16} />
          </button>

          <button
            type="button"
            onClick={() => setIsBlackboard(b => !b)}
            className={`pq-dock-btn ${isBlackboard ? 'is-active' : ''}`}
            title="Blackboard / Whiteboard Mode [B]"
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
            onClick={handleToggleMode}
            className={`pq-dock-btn pq-dock-btn-mode ${presentationMode === 'screen' ? 'is-active' : ''}`}
            title="Switch Stage Mode: Fluid Screen Fit vs 16:9 [R]"
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

          <button
            type="button"
            onClick={() => setIsDockCollapsed(true)}
            className="pq-dock-btn"
            title="Collapse Dock [D]"
          >
            <ChevronDown size={16} />
          </button>
        </footer>
      )}

      {/* ============================================================= */}
      {/* POST-RECORDING REVIEW, CHAPTERS & MAC DOWNLOAD MODAL          */}
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
              maxWidth: 960,
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#0f172a',
              border: '1.5px solid rgba(56, 189, 248, 0.35)',
              borderRadius: 22,
              padding: '26px 30px',
              boxShadow: '0 24px 90px rgba(0, 0, 0, 0.75)',
              color: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: 999,
                      background: 'rgba(16, 185, 129, 0.2)',
                      border: '1px solid rgba(16, 185, 129, 0.45)',
                      color: '#34d399',
                      fontSize: 11,
                      fontWeight: 900,
                    }}
                  >
                    RECORDING COMPLETE · SAVED TO LOCAL VAULT
                  </span>
                  <span style={{ fontSize: 12.5, color: '#94a3b8', fontWeight: 700 }}>
                    {formatDurationTimestamp(completedRecording.durationSec)} • {(completedRecording.sizeBytes / (1024 * 1024)).toFixed(1)} MB
                  </span>
                </div>
                <input
                  type="text"
                  value={completedRecording.title}
                  onChange={(e) =>
                    setCompletedRecording((prev) => (prev ? { ...prev, title: e.target.value } : null))
                  }
                  style={{
                    marginTop: 8,
                    fontSize: 20,
                    fontWeight: 900,
                    color: '#ffffff',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 8,
                    padding: '6px 12px',
                    width: 420,
                    maxWidth: '100%',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleCopyCompletedChapters}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 12,
                    background: 'rgba(56, 189, 248, 0.14)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    color: copiedChapters ? '#34d399' : '#38bdf8',
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                  }}
                >
                  {copiedChapters ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedChapters ? 'YouTube Chapters Copied!' : 'Copy YouTube Chapters'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadCompleted}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: 13.5,
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
                  }}
                >
                  <Download size={16} />
                  <span>
                    Download {(completedRecording.mimeType || '').includes('mp4') ? '.MP4' : '.WEBM'} to Mac
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCompletedRecording(null)}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.08)',
                    border: 'none',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Close Review Modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Instant Video Preview */}
            <video
              ref={previewVideoRef}
              src={completedRecording.url}
              controls
              style={{
                width: '100%',
                maxHeight: '46vh',
                borderRadius: 14,
                background: '#000',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            />

            {/* Clickable Question Chapter Jump Pills + YouTube Description Box */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', marginBottom: 8 }}>
                  Click Chapter to Seek Video ({completedRecording.chapters?.length || 0})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
                  {(completedRecording.chapters || []).map((ch, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (previewVideoRef.current) {
                          previewVideoRef.current.currentTime = ch.startSec || 0;
                          previewVideoRef.current.play().catch(() => {});
                        }
                      }}
                      style={{
                        textAlign: 'left',
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: 'rgba(30, 41, 59, 0.7)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#e2e8f0',
                        fontSize: 12,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <span style={{ fontFamily: 'monospace', fontWeight: 900, color: '#38bdf8' }}>
                        {formatDurationTimestamp(ch.startSec)}
                      </span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ch.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#34d399', textTransform: 'uppercase', marginBottom: 8 }}>
                  Ready-to-Paste YouTube Description Timestamps
                </div>
                <pre
                  style={{
                    margin: 0,
                    padding: 12,
                    borderRadius: 10,
                    background: '#020617',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#cbd5e1',
                    fontSize: 12,
                    height: 150,
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {formatYouTubeChapters(completedRecording.chapters, completedRecording.title)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help Modal */}
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
              border: '1.5px solid rgba(255, 255, 255, 0.15)',
              color: theme === 'light' ? '#0f172a' : '#f8fafc',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 20, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <HelpCircle size={20} color="#38bdf8" />
              <span>Recording Studio Shortcuts</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px 16px', fontSize: 13.5, lineHeight: 1.6 }}>
              <strong>Space / →</strong> <span>Next Step / Next Question (Auto-logs Chapter)</span>
              <strong>←</strong> <span>Previous Step / Previous Question</span>
              <strong>P / H / L / E</strong> <span>Pen / Highlighter / Laser / Eraser</span>
              <strong>[ / ]</strong> <span>Decrease / Increase Pen Thickness</span>
              <strong>S</strong> <span>Insert Blank Scratchpad Slide</span>
              <strong>W</strong> <span>Show / Hide Live Webcam Slot</span>
              <strong>Q</strong> <span>Toggle Recording Queue Drawer</span>
              <strong>M</strong> <span>Toggle Dark / Light Whiteboard Mode</span>
              <strong>D</strong> <span>Collapse / Expand Dock</span>
              <strong>Cmd + Z / C</strong> <span>Undo Last Stroke / Clear Step Ink</span>
            </div>

            <button
              type="button"
              onClick={() => setShowHelp(false)}
              style={{
                marginTop: 20,
                width: '100%',
                padding: '10px',
                borderRadius: 8,
                background: '#f43f5e',
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
