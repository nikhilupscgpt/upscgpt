'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
} from 'lucide-react';
import { parseStem } from '@/app/prelims/pyq/StemView';
import {
  saveRecordingToVault,
  formatDurationTimestamp,
  formatYouTubeChapters,
} from '@/lib/recordingVaultDb';
import './screen-studio.css';

const WALLPAPERS = [
  { id: 'obsidian', label: 'Obsidian Carbon', preview: '#0a0b10' },
  { id: 'nebula', label: 'Cosmic Nebula', preview: '#2b1055' },
  { id: 'sunset', label: 'Sunset Ember', preview: '#4a154b' },
  { id: 'aurora', label: 'Aurora Teal', preview: '#06373a' },
  { id: 'slate', label: 'Apple Slate', preview: '#161922' },
  { id: 'paper', label: 'Editorial Desk', preview: '#ede8df' },
];

export default function ScreenStudioClient({ initialQuestions = [], initialFilterOptions = {} }) {
  // Questions State
  const [questions, setQuestions] = useState(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQ = questions[currentIndex] || null;

  // Question Interaction State
  const [userSelection, setUserSelection] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [crossedStmts, setCrossedStmts] = useState({});
  const [isQuestionPickerOpen, setIsQuestionPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  // Canvas Framing & Customization State
  const [aspectRatio, setAspectRatio] = useState('16-9'); // '16-9' | '9-16' | '1-1' | '4-5'
  const [wallpaper, setWallpaper] = useState('obsidian');
  const [canvasPadding, setCanvasPadding] = useState(48); // px
  const [windowRadius, setWindowRadius] = useState(20); // px
  const [shadowDepth, setShadowDepth] = useState('pro'); // 'pro' | 'glow' | 'soft' | 'flat'
  const [windowTheme, setWindowTheme] = useState('dark'); // 'dark' | 'light'
  const [showCanvasSettings, setShowCanvasSettings] = useState(false);

  // Spring Zoom Engine State
  const [zoomLevel, setZoomLevel] = useState(1); // 1, 1.4, 1.8
  const [zoomTarget, setZoomTarget] = useState('full'); // 'full' | 'stem' | 'options' | 'solution' | 'custom'
  const [zoomTransform, setZoomTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [clickToZoomEnabled, setClickToZoomEnabled] = useState(false);

  // Webcam PiP State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraShape, setCameraShape] = useState('circle'); // 'circle' | 'squircle' | 'pill'
  const [pipPosition, setPipPosition] = useState('bottom-right'); // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  const [isMirrored, setIsMirrored] = useState(true);
  const videoPipRef = useRef(null);
  const cameraStreamRef = useRef(null);

  // Audio / Mic State
  const [isMicActive, setIsMicActive] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const micStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  // Screen Recording State
  const [recState, setRecState] = useState('idle'); // 'idle' | 'recording' | 'paused'
  const [recDuration, setRecDuration] = useState(0);
  const [chapters, setChapters] = useState([]);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [copiedChapters, setCopiedChapters] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const recStartTimeRef = useRef(0);

  // Canvas & Window DOM references
  const canvasRef = useRef(null);
  const windowRef = useRef(null);
  const stemRef = useRef(null);
  const optionsRef = useRef(null);
  const solutionRef = useRef(null);

  // Reset per-question interactions on question change
  useEffect(() => {
    setUserSelection(null);
    setShowAnswer(false);
    setCrossedStmts({});
    // Reset zoom when navigating to next question
    setZoomLevel(1);
    setZoomTarget('full');
    setZoomTransform({ scale: 1, x: 0, y: 0 });
  }, [currentIndex]);

  // Log chapter on question change during recording
  useEffect(() => {
    if (recState === 'recording' && currentQ) {
      setChapters((prev) => [
        ...prev,
        {
          startSec: recDuration,
          label: `Q${currentIndex + 1} (${currentQ.examYear || ''}) - ${currentQ.srcTopic || 'UPSC PYQ'}`,
        },
      ]);
    }
  }, [currentIndex, recState]);

  // Handle Spring Zoom calculations
  useEffect(() => {
    if (zoomLevel === 1 || zoomTarget === 'full') {
      setZoomTransform({ scale: 1, x: 0, y: 0 });
      return;
    }

    if (zoomTarget === 'stem' && stemRef.current) {
      setZoomTransform({ scale: zoomLevel, x: 0, y: 15 });
    } else if (zoomTarget === 'options' && optionsRef.current) {
      setZoomTransform({ scale: zoomLevel, x: 0, y: -25 });
    } else if (zoomTarget === 'solution' && solutionRef.current) {
      setZoomTransform({ scale: zoomLevel, x: 0, y: -40 });
    }
  }, [zoomLevel, zoomTarget]);

  // Click-to-Zoom interactive handler
  const handleWindowClick = (e) => {
    if (!clickToZoomEnabled) return;
    // Don't zoom if clicking buttons or inputs
    if (e.target.closest('button') || e.target.closest('input')) return;

    if (zoomLevel > 1) {
      // Zoom out if already zoomed
      setZoomLevel(1);
      setZoomTarget('full');
      setZoomTransform({ scale: 1, x: 0, y: 0 });
    } else {
      // Zoom in towards click position
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

  // Toggle Webcam
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
        alert('Could not access webcam. Please check browser camera permissions.');
      }
    }
  };

  useEffect(() => {
    if (isCameraActive && videoPipRef.current && cameraStreamRef.current) {
      videoPipRef.current.srcObject = cameraStreamRef.current;
    }
  }, [isCameraActive, cameraShape, pipPosition]);

  // Audio VU Meter Engine
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
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
          animFrameRef.current = requestAnimationFrame(updateMeter);
        };
        updateMeter();
      } catch (e) {
        // Mic permission not granted
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

  // ---------------- Media Recording Handler ----------------
  const startRecording = async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      alert('Screen recording is not supported in this browser. Please use Google Chrome, Brave, or Edge.');
      return;
    }

    try {
      // 1. Capture screen stream
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
          frameRate: { ideal: 30, max: 60 },
        },
        audio: true,
      });

      // 2. Mix with presenter microphone if active
      let combinedStream = displayStream;
      if (isMicActive && micStreamRef.current) {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const dest = audioCtx.createMediaStreamDestination();
        const micSource = audioCtx.createMediaStreamSource(micStreamRef.current);
        micSource.connect(dest);

        // If tab audio exists, mix it in
        if (displayStream.getAudioTracks().length > 0) {
          const tabAudio = audioCtx.createMediaStreamSource(displayStream);
          tabAudio.connect(dest);
        }

        combinedStream = new MediaStream([
          ...displayStream.getVideoTracks(),
          ...dest.stream.getAudioTracks(),
        ]);
      }

      // 3. Setup MediaRecorder with best supported codecs
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
      ];
      let selectedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || 'video/webm';

      const recorder = new MediaRecorder(combinedStream, {
        mimeType: selectedMime,
        videoBitsPerSecond: 2500000, // 2.5 Mbps crisp 1080p
      });

      recordedChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: selectedMime });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);

        // Save into IndexedDB vault for safety
        await saveRecordingToVault({
          id: `ss_rec_${Date.now()}`,
          name: `ScreenStudio_${currentQ?.srcTopic || 'PYQ'}_${new Date().toISOString().slice(0, 10)}.webm`,
          blob,
          duration: recDuration,
          chapters,
        });

        setShowExportModal(true);
        setRecState('idle');
        clearInterval(timerIntervalRef.current);
      };

      displayStream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setRecState('recording');
      setRecDuration(0);
      recStartTimeRef.current = Date.now();

      // Initialize first chapter
      setChapters([
        {
          startSec: 0,
          label: `Q${currentIndex + 1} (${currentQ?.examYear || ''}) - ${currentQ?.srcTopic || 'Prelims PYQ'}`,
        },
      ]);

      timerIntervalRef.current = setInterval(() => {
        setRecDuration((d) => d + 1);
      }, 1000);
    } catch (err) {
      console.error('[ScreenStudio] Recording error:', err);
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

  // Stem parsing
  const parsedBlocks = useMemo(() => {
    if (!currentQ?.stem) return [];
    return parseStem(currentQ.stem);
  }, [currentQ]);

  // Options normalization
  const normalizedOptions = useMemo(() => {
    if (!currentQ?.options) return [];
    if (Array.isArray(currentQ.options)) return currentQ.options;
    try {
      const parsed = JSON.parse(currentQ.options);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [currentQ]);

  // Filtered picker questions
  const filteredPickerQuestions = useMemo(() => {
    if (!pickerSearch.trim()) return questions;
    const q = pickerSearch.toLowerCase();
    return questions.filter(
      (item) =>
        item.stem?.toLowerCase().includes(q) ||
        item.srcTopic?.toLowerCase().includes(q) ||
        item.srcSubject?.toLowerCase().includes(q) ||
        String(item.examYear).includes(q)
    );
  }, [questions, pickerSearch]);

  const copyTimestamps = () => {
    const formatted = formatYouTubeChapters(chapters, 'UPSC CSE Prelims Masterclass');
    navigator.clipboard.writeText(formatted);
    setCopiedChapters(true);
    setTimeout(() => setCopiedChapters(false), 2000);
  };

  return (
    <div className="ss-root">
      {/* ---------------- Top Studio Bar ---------------- */}
      <header className="ss-navbar">
        <div className="ss-nav-left">
          <Link href="/admin/recording-studio" className="ss-back-btn">
            <ArrowLeft size={14} />
            <span>Studio Hub</span>
          </Link>
          <div className="ss-badge-tag">
            <span className="ss-badge-dot" />
            <span>Screen Studio</span>
          </div>
        </div>

        <div className="ss-nav-center">
          <div className={`ss-rec-status-pill is-${recState}`}>
            {recState === 'recording' ? (
              <>
                <span className="ss-dock-rec-dot" />
                <span>REC {formatDurationTimestamp(recDuration)}</span>
              </>
            ) : recState === 'paused' ? (
              <span>PAUSED {formatDurationTimestamp(recDuration)}</span>
            ) : (
              <span>IDLE</span>
            )}
          </div>
        </div>

        <div className="ss-nav-right">
          <button
            type="button"
            className="ss-dock-btn"
            onClick={() => setIsQuestionPickerOpen(true)}
            title="Browse or Search PYQ Deck"
          >
            <Search size={14} />
            <span>
              Q {currentIndex + 1} of {questions.length}
            </span>
          </button>

          <button
            type="button"
            className="ss-dock-btn"
            onClick={() => setWindowTheme(windowTheme === 'dark' ? 'light' : 'dark')}
            title="Toggle Window Interior Theme"
          >
            {windowTheme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      {/* ---------------- Main Screen Studio Viewport ---------------- */}
      <main className="ss-stage-viewport">
        {/* Customizable Stage Canvas */}
        <div
          ref={canvasRef}
          className={`ss-canvas bg-${wallpaper} ss-aspect-${aspectRatio}`}
          style={{ padding: `${canvasPadding}px` }}
        >
          {/* Framed Mac Window */}
          <div
            ref={windowRef}
            className={`ss-window theme-${windowTheme} ss-shadow-${shadowDepth}`}
            style={{ borderRadius: `${windowRadius}px` }}
            onClick={handleWindowClick}
          >
            {/* Authentic macOS Titlebar */}
            <div className="ss-window-titlebar">
              <div className="ss-traffic-lights">
                <span className="ss-traffic-dot dot-red" />
                <span className="ss-traffic-dot dot-yellow" />
                <span className="ss-traffic-dot dot-green" />
              </div>

              <div className="ss-window-title-pill">
                <span>🔒 upscgpt.com</span>
                <span>&middot;</span>
                <span>{currentQ?.srcSubject || 'GS PAPER I'}</span>
                {currentQ?.questionNo && <span>&middot; Paper Q.{currentQ.questionNo}</span>}
              </div>

              <div style={{ width: 50 }} />
            </div>

            {/* Spring Zooming Content Area */}
            <div className="ss-zoom-viewport">
              <div
                className="ss-zoom-canvas"
                style={{
                  transform: `scale(${zoomTransform.scale}) translate(${zoomTransform.x}px, ${zoomTransform.y}px)`,
                }}
              >
                {currentQ ? (
                  <>
                    {/* Question Header & Tags */}
                    <div className="ss-q-header">
                      <div className="ss-tags">
                        <span className="ss-tag ss-tag-exam">
                          {currentQ.examName || 'UPSC CSE'} {currentQ.examYear}
                        </span>
                        {currentQ.questionNo && (
                          <span className="ss-tag ss-tag-paper-q">
                            Paper Q.{currentQ.questionNo}
                          </span>
                        )}
                        <span className="ss-tag ss-tag-topic">{currentQ.srcTopic}</span>
                        {currentQ.difficulty && (
                          <span className="ss-tag ss-tag-diff">{currentQ.difficulty}</span>
                        )}
                      </div>
                    </div>

                    {/* Question Stem (Zoom Target: stem) */}
                    <div ref={stemRef} className="ss-q-stem">
                      {parsedBlocks.map((b, idx) => {
                        if (b.type === 'stmts') {
                          return (
                            <div className="ss-stmts" key={idx}>
                              {b.items.map((s, k) => {
                                const stmtId = `${idx}-${k}`;
                                const isCrossed = Boolean(crossedStmts[stmtId]);
                                return (
                                  <div
                                    key={k}
                                    className={`ss-stmt ${isCrossed ? 'is-crossed' : ''}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCrossedStmts((prev) => ({
                                        ...prev,
                                        [stmtId]: !prev[stmtId],
                                      }));
                                    }}
                                    title="Click to cross out or restore statement"
                                  >
                                    <span className="ss-stmt-key">{s.key}</span>
                                    <span>{s.text}</span>
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

                    {/* Options Grid (Zoom Target: options) */}
                    <div
                      ref={optionsRef}
                      className={`ss-opts-grid ${normalizedOptions.length > 2 ? 'is-grid-2' : ''}`}
                    >
                      {normalizedOptions.map((opt) => {
                        const isSelected = userSelection === opt.label;
                        const isCorrect = showAnswer && opt.label === currentQ.correctLabel;
                        const isWrong = showAnswer && isSelected && !isCorrect;
                        const isFaded = showAnswer && !isCorrect && !isSelected;

                        let optCls = 'ss-opt-btn';
                        if (isCorrect) optCls += ' is-correct';
                        if (isWrong) optCls += ' is-wrong';
                        if (isFaded) optCls += ' is-faded';

                        return (
                          <button
                            key={opt.label}
                            type="button"
                            className={optCls}
                            onClick={(e) => {
                              e.stopPropagation();
                              setUserSelection(opt.label);
                              setShowAnswer(true);
                            }}
                          >
                            <span className="ss-opt-label">{opt.label}</span>
                            <span>{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Solution / Deep Dive (Zoom Target: solution) */}
                    {showAnswer && (
                      <div ref={solutionRef} className="ss-solution-box">
                        <div className="ss-sol-verdict">
                          <CheckCircle2 size={18} />
                          <span>
                            Correct Answer: ({currentQ.correctLabel?.toUpperCase()}) &middot;{' '}
                            {userSelection === currentQ.correctLabel
                              ? '✓ Correct selection!'
                              : 'Review Explanation'}
                          </span>
                        </div>
                        {currentQ.explanation && (
                          <div className="ss-sol-text">{currentQ.explanation}</div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                    <h3>No Questions Loaded</h3>
                    <p>Select questions from the picker to begin your Screen Studio presentation.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Draggable Webcam PiP inside the Canvas */}
          {isCameraActive && (
            <div
              className={`ss-webcam-pip pip-${cameraShape} ss-pip-${pipPosition}`}
              title="Click and drag camera overlay"
              onClick={() => {
                // Cycle positions on tap
                const positions = ['bottom-right', 'bottom-left', 'top-left', 'top-right'];
                const nextPos =
                  positions[(positions.indexOf(pipPosition) + 1) % positions.length];
                setPipPosition(nextPos);
              }}
            >
              <video
                ref={videoPipRef}
                autoPlay
                playsInline
                muted
                className={`ss-webcam-video ${isMirrored ? 'is-mirrored' : ''}`}
              />
            </div>
          )}
        </div>
      </main>

      {/* ---------------- Floating Glass Bottom Dock ---------------- */}
      <footer className="ss-dock-anchor">
        <div className="ss-dock">
          {/* 1. Record Engine */}
          {recState === 'idle' ? (
            <button
              type="button"
              className="ss-dock-rec-btn"
              onClick={startRecording}
              title="Start Screen Studio Recording"
            >
              <span className="ss-dock-rec-dot" />
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
                className="ss-dock-rec-btn is-active"
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
            {isMicActive ? <Mic size={14} color="#38bdf8" /> : <MicOff size={14} color="#f87171" />}
            {isMicActive && (
              <div className="ss-vu-meter">
                <div
                  className="ss-vu-bar"
                  style={{
                    height: `${Math.max(4, audioLevel * 0.14)}px`,
                    backgroundColor: audioLevel > 60 ? '#f59e0b' : '#34d399',
                  }}
                />
                <div
                  className="ss-vu-bar"
                  style={{
                    height: `${Math.max(4, audioLevel * 0.1)}px`,
                    backgroundColor: audioLevel > 80 ? '#ef4444' : '#34d399',
                  }}
                />
              </div>
            )}
          </div>

          <div className="ss-dock-divider" />

          {/* 2. Aspect Ratio Segmented Control */}
          <div className="ss-seg-group" title="Canvas Aspect Ratio">
            <button
              type="button"
              className={`ss-seg-item ${aspectRatio === '16-9' ? 'is-selected' : ''}`}
              onClick={() => setAspectRatio('16-9')}
            >
              16:9
            </button>
            <button
              type="button"
              className={`ss-seg-item ${aspectRatio === '9-16' ? 'is-selected' : ''}`}
              onClick={() => setAspectRatio('9-16')}
            >
              9:16
            </button>
            <button
              type="button"
              className={`ss-seg-item ${aspectRatio === '1-1' ? 'is-selected' : ''}`}
              onClick={() => setAspectRatio('1-1')}
            >
              1:1
            </button>
          </div>

          <div className="ss-dock-divider" />

          {/* 3. Spring Zoom Controls */}
          <div className="ss-seg-group" title="Camera Spring Zoom">
            <button
              type="button"
              className={`ss-seg-item ${zoomLevel === 1 ? 'is-selected' : ''}`}
              onClick={() => {
                setZoomLevel(1);
                setZoomTarget('full');
              }}
            >
              1x
            </button>
            <button
              type="button"
              className={`ss-seg-item ${zoomLevel === 1.4 ? 'is-selected' : ''}`}
              onClick={() => {
                setZoomLevel(1.4);
                setZoomTarget('stem');
              }}
            >
              1.4x
            </button>
            <button
              type="button"
              className={`ss-seg-item ${zoomLevel === 1.8 ? 'is-selected' : ''}`}
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
            title="Click inside window to zoom into that location"
          >
            <ZoomIn size={14} />
            <span>Click Zoom</span>
          </button>

          <div className="ss-dock-divider" />

          {/* 4. Webcam PiP Toggle & Shape */}
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
              title="Change Camera Shape"
            >
              <span>{cameraShape}</span>
            </button>
          )}

          <div className="ss-dock-divider" />

          {/* 5. Canvas Settings Popover Trigger */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className={`ss-dock-btn ${showCanvasSettings ? 'is-active' : ''}`}
              onClick={() => setShowCanvasSettings(!showCanvasSettings)}
              title="Canvas & Wallpaper Settings"
            >
              <Settings size={14} />
              <span>Canvas</span>
            </button>

            {showCanvasSettings && (
              <div className="ss-popover">
                <div className="ss-popover-title">
                  <span>Canvas Studio Settings</span>
                  <button
                    type="button"
                    onClick={() => setShowCanvasSettings(false)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>

                {/* Wallpaper Swatches */}
                <div className="ss-setting-row">
                  <span className="ss-setting-label">Wallpaper</span>
                  <div className="ss-swatches">
                    {WALLPAPERS.map((wp) => (
                      <button
                        key={wp.id}
                        type="button"
                        className={`ss-swatch-btn ${wallpaper === wp.id ? 'is-active' : ''}`}
                        style={{ backgroundColor: wp.preview }}
                        onClick={() => setWallpaper(wp.id)}
                        title={wp.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Canvas Padding Slider */}
                <div className="ss-setting-row">
                  <div className="ss-setting-label">
                    <span>Padding</span>
                    <span>{canvasPadding}px</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="90"
                    step="4"
                    value={canvasPadding}
                    onChange={(e) => setCanvasPadding(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#a855f7' }}
                  />
                </div>

                {/* Corner Radius Slider */}
                <div className="ss-setting-row">
                  <div className="ss-setting-label">
                    <span>Corner Radius</span>
                    <span>{windowRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="32"
                    step="2"
                    value={windowRadius}
                    onChange={(e) => setWindowRadius(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#a855f7' }}
                  />
                </div>

                {/* Shadow Intensity */}
                <div className="ss-setting-row">
                  <span className="ss-setting-label">Shadow Depth</span>
                  <div className="ss-seg-group" style={{ width: '100%', justifyContent: 'space-around' }}>
                    {['pro', 'glow', 'soft', 'flat'].map((sd) => (
                      <button
                        key={sd}
                        type="button"
                        className={`ss-seg-item ${shadowDepth === sd ? 'is-selected' : ''}`}
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

          {/* 6. Question Step Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              type="button"
              className="ss-dock-btn"
              disabled={currentIndex <= 0}
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              title="Previous Question"
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: 12, fontWeight: 800, padding: '0 4px', color: '#cbd5e1' }}>
              {currentIndex + 1} / {questions.length}
            </span>
            <button
              type="button"
              className="ss-dock-btn"
              disabled={currentIndex >= questions.length - 1}
              onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
              title="Next Question"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </footer>

      {/* ---------------- Question Picker Modal ---------------- */}
      {isQuestionPickerOpen && (
        <div className="ss-modal-backdrop" onClick={() => setIsQuestionPickerOpen(false)}>
          <div className="ss-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#ffffff' }}>
                Select Question for Screen Studio
              </h3>
              <button
                type="button"
                onClick={() => setIsQuestionPickerOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ position: 'relative', marginBottom: 16 }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }}
              />
              <input
                type="text"
                placeholder="Search by topic, keyword, or exam year..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ maxHeight: '50vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredPickerQuestions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  onClick={() => {
                    setCurrentIndex(questions.indexOf(q));
                    setIsQuestionPickerOpen(false);
                  }}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 12,
                    background:
                      currentIndex === questions.indexOf(q)
                        ? 'rgba(168, 85, 247, 0.2)'
                        : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${
                      currentIndex === questions.indexOf(q)
                        ? 'rgba(168, 85, 247, 0.5)'
                        : 'rgba(255, 255, 255, 0.06)'
                    }`,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, fontWeight: 700, color: '#a855f7' }}>
                    <span>{q.examName} {q.examYear}</span>
                    <span>&middot;</span>
                    <span style={{ color: '#cbd5e1' }}>{q.srcTopic}</span>
                    {q.questionNo && (
                      <>
                        <span>&middot;</span>
                        <span style={{ color: '#fbbf24' }}>Paper Q.{q.questionNo}</span>
                      </>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {q.stem}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Recording Export Modal ---------------- */}
      {showExportModal && (
        <div className="ss-modal-backdrop" onClick={() => setShowExportModal(false)}>
          <div className="ss-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Film size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#ffffff' }}>
                    Screen Studio Recording Complete
                  </h3>
                  <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
                    Saved to local Mac IndexedDB &middot; Duration: {formatDurationTimestamp(recDuration)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Video Download Button */}
            {downloadUrl && (
              <a
                href={downloadUrl}
                download={`ScreenStudio_${currentQ?.srcTopic || 'PYQ'}_${new Date().toISOString().slice(0, 10)}.webm`}
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
            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: 16, borderRadius: 14, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#cbd5e1' }}>
                  YouTube Chapter Timestamps ({chapters.length})
                </span>
                <button
                  type="button"
                  onClick={copyTimestamps}
                  className="ss-dock-btn"
                  style={{ padding: '4px 10px', fontSize: 11.5 }}
                >
                  {copiedChapters ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
                  <span>{copiedChapters ? 'Copied!' : 'Copy Chapters'}</span>
                </button>
              </div>

              <pre
                style={{
                  margin: 0,
                  fontSize: 12,
                  fontFamily: 'monospace',
                  color: '#94a3b8',
                  lineHeight: 1.6,
                  maxHeight: 140,
                  overflowY: 'auto',
                }}
              >
                {formatYouTubeChapters(chapters, 'UPSC Prelims Masterclass')}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
