'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Radio,
  Download,
  Copy,
  Check,
  Maximize,
  Minimize,
  Sliders,
  HelpCircle,
  Eye,
  EyeOff,
  ShieldAlert,
  ArrowLeft,
  Video,
} from 'lucide-react';
import { buildPyqReelStoryboard, buildMappingReelStoryboard } from '@/lib/reelStoryboard';
import { formatDurationTimestamp } from '@/lib/recordingVaultDb';
import './reels-present.css';

const STEPS_CONFIG = [
  { id: 'hook', screen: 'hook', label: '1. Hook Headline' },
  { id: 'statements', screen: 'statements', label: '2. Stem Statements' },
  { id: 'options', screen: 'options', label: '3. Options Preview' },
  { id: 'pause', screen: 'options', label: '4. Pause & Attempt (5s)' },
  { id: 'v1', screen: 'analysis', label: '5. Statement 1 Verdict' },
  { id: 'v2', screen: 'analysis', label: '6. Statement 2 Verdict' },
  { id: 'v3', screen: 'analysis', label: '7. Statement 3 Verdict' },
  { id: 'answer', screen: 'analysis', label: '8. Official Answer' },
  { id: 'takeaway', screen: 'takeaway', label: '9. Takeaway Card' },
];

export default function ReelsPresenterClient({ questions: initialQuestions = [] }) {
  // Custom deck items from local storage if launched with custom content
  const [customDeckItems] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const sp = new URLSearchParams(window.location.search);
        if (sp.get('mode') === 'custom' || initialQuestions.length === 0) {
          const raw = localStorage.getItem('pq_custom_recording_deck');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          }
        }
      } catch {
        // ignore
      }
    }
    return [];
  });

  const questions = useMemo(
    () => (initialQuestions.length > 0 ? initialQuestions : customDeckItems),
    [initialQuestions, customDeckItems]
  );

  const [qIndex, setQIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  // Clean Recording Mode (Hide controls so OBS or Screen capture sees only the 9:16 phone)
  const [cleanMode, setCleanMode] = useState(false);
  const [safeGuides, setSafeGuides] = useState(false);
  const [camVisible, setCamVisible] = useState(true);
  const [camLive, setCamLive] = useState(false);

  // Live Overrides for Storyboard (Hook, Verdicts, Takeaway)
  const [storyboardOverrides, setStoryboardOverrides] = useState({});
  const [isAiPolishing, setIsAiPolishing] = useState(false);
  const [aiPolishStatus, setAiPolishStatus] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);

  // Timer state for Pause & Attempt
  const [timerSeconds, setTimerSeconds] = useState(5);
  const timerIntervalRef = useRef(null);

  // Refs for Scalable 1080x1920 Stage
  const wrapRef = useRef(null);
  const stageRef = useRef(null);
  const reelRef = useRef(null);
  const webcamVideoRef = useRef(null);
  const webcamStreamRef = useRef(null);
  const ringBarRef = useRef(null);

  const currentQ = questions[qIndex] || null;
  const currentQId = currentQ?.id || `reel_${qIndex}`;

  // Build the 9-Step Storyboard for the current question
  const baseStoryboard = useMemo(() => {
    if (!currentQ) return null;
    return currentQ.type === 'mapping'
      ? buildMappingReelStoryboard(currentQ)
      : buildPyqReelStoryboard(currentQ);
  }, [currentQ]);

  // Merge with any live inline edits or AI polishes
  const storyboard = useMemo(() => {
    if (!baseStoryboard) return null;
    const overrides = storyboardOverrides[currentQId] || {};
    return {
      ...baseStoryboard,
      hook: {
        ...baseStoryboard.hook,
        ...(overrides.hook || {}),
      },
      analysis: {
        ...baseStoryboard.analysis,
        verdicts: overrides.verdicts || baseStoryboard.analysis.verdicts,
      },
      takeaway: {
        ...baseStoryboard.takeaway,
        ...(overrides.takeaway || {}),
      },
    };
  }, [baseStoryboard, storyboardOverrides, currentQId]);

  // Fit the 1080 × 1920 canvas to viewport
  const handleFit = useCallback(() => {
    if (!wrapRef.current || !stageRef.current || !reelRef.current) return;
    const w = wrapRef.current.clientWidth - (cleanMode ? 0 : 32);
    const h = wrapRef.current.clientHeight - (cleanMode ? 0 : 32);
    const s = Math.min(w / 1080, h / 1920);
    stageRef.current.style.width = `${1080 * s}px`;
    stageRef.current.style.height = `${1920 * s}px`;
    reelRef.current.style.transform = `scale(${s})`;
  }, [cleanMode]);

  useEffect(() => {
    handleFit();
    window.addEventListener('resize', handleFit);
    document.addEventListener('fullscreenchange', handleFit);
    return () => {
      window.removeEventListener('resize', handleFit);
      document.removeEventListener('fullscreenchange', handleFit);
    };
  }, [handleFit]);

  // -------------------------------------------------------------
  // 5-Second Pause Timer Engine
  // -------------------------------------------------------------
  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    setTimerSeconds(5);
    if (ringBarRef.current) {
      ringBarRef.current.style.transition = 'none';
      ringBarRef.current.style.strokeDashoffset = '0';
      void ringBarRef.current.getBoundingClientRect();
      ringBarRef.current.style.transition = 'stroke-dashoffset 5s linear';
      ringBarRef.current.style.strokeDashoffset = '345';
    }

    let n = 5;
    timerIntervalRef.current = setInterval(() => {
      n--;
      setTimerSeconds(Math.max(n, 0));
      if (n <= 0) {
        stopTimer();
      }
    }, 1000);
  }, [stopTimer]);

  useEffect(() => {
    const currentStepConfig = STEPS_CONFIG[stepIndex];
    if (currentStepConfig?.id === 'pause') {
      startTimer();
    } else {
      stopTimer();
    }
    return () => stopTimer();
  }, [stepIndex, startTimer, stopTimer]);

  // -------------------------------------------------------------
  // Step Navigation
  // -------------------------------------------------------------
  const goToStep = useCallback((n) => {
    const next = Math.max(0, Math.min(STEPS_CONFIG.length - 1, n));
    setStepIndex(next);
  }, []);

  const nextStep = useCallback(() => {
    goToStep(stepIndex + 1);
  }, [goToStep, stepIndex]);

  const prevStep = useCallback(() => {
    goToStep(stepIndex - 1);
  }, [goToStep, stepIndex]);

  // -------------------------------------------------------------
  // Camera Handler
  // -------------------------------------------------------------
  const startCamera = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 640, frameRate: 30 },
        audio: false,
      });
      webcamStreamRef.current = stream;
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
      }
      setCamLive(true);
      setCamVisible(true);
    } catch (e) {
      console.warn('Webcam access was denied or unavailable', e);
    }
  };

  const toggleCamera = () => {
    if (!camLive) {
      startCamera();
    } else {
      setCamVisible((prev) => !prev);
    }
  };

  // -------------------------------------------------------------
  // Keyboard Shortcuts (Space / Right, Left, G, W, H, F, R)
  // -------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const k = e.key.toLowerCase();
      if (k === 'arrowright' || k === ' ' || k === 'pagedown') {
        e.preventDefault();
        nextStep();
      } else if (k === 'arrowleft' || k === 'pageup') {
        e.preventDefault();
        prevStep();
      } else if (k === 'g') {
        e.preventDefault();
        setSafeGuides((prev) => !prev);
      } else if (k === 'w') {
        e.preventDefault();
        toggleCamera();
      } else if (k === 'h') {
        e.preventDefault();
        setCleanMode((prev) => !prev);
      } else if (k === 'f') {
        e.preventDefault();
        try {
          if (!document.fullscreenElement) document.documentElement.requestFullscreen();
          else document.exitFullscreen();
        } catch {
          // ignore
        }
      } else if (k === 'r') {
        e.preventDefault();
        goToStep(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextStep, prevStep, goToStep, toggleCamera]);

  // -------------------------------------------------------------
  // AI Polish Integration
  // -------------------------------------------------------------
  const handleAiPolish = async () => {
    if (!currentQ) return;
    setIsAiPolishing(true);
    setAiPolishStatus('Generating scroll-stopping Hook & Takeaways with Gemini...');

    try {
      const res = await fetch('/api/admin/studio/reels/ai-polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQ }),
      });
      const data = await res.json();
      if (data?.success && data.polished) {
        setStoryboardOverrides((prev) => ({
          ...prev,
          [currentQId]: {
            hook: data.polished.hook || {},
            verdicts: data.polished.verdicts || undefined,
            takeaway: data.polished.takeaway || {},
          },
        }));
        setAiPolishStatus('✅ Reel script polished with AI!');
      } else {
        setAiPolishStatus(`⚠️ AI Polish notice: ${data.error || 'Check GEMINI_API_KEY'}`);
      }
    } catch (err) {
      setAiPolishStatus('❌ Network error polishing with AI.');
    } finally {
      setIsAiPolishing(false);
      setTimeout(() => setAiPolishStatus(''), 4000);
    }
  };

  // -------------------------------------------------------------
  // IN-BROWSER RECORDING ENGINE (Native MP4)
  // -------------------------------------------------------------
  const [recState, setRecState] = useState('idle'); // 'idle' | 'recording' | 'finished'
  const [recSeconds, setRecSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recTimerRef = useRef(null);

  const startRecording = async () => {
    try {
      if (typeof window === 'undefined') return;
      recordedChunksRef.current = [];

      // Capture the scaled stage surface
      const stream = stageRef.current?.captureStream
        ? stageRef.current.captureStream(30)
        : null;

      if (!stream) {
        alert('Canvas screen capture is not supported in this browser. Use OBS to capture the clean stage directly.');
        return;
      }

      // Add microphone if available
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStream.getAudioTracks().forEach((track) => stream.addTrack(track));
      } catch {
        console.warn('Microphone permission not granted for in-browser recording');
      }

      const mimeType = 'video/mp4;codecs=avc1,mp4a.40.2';
      const selectedMime = MediaRecorder.isTypeSupported(mimeType)
        ? mimeType
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : 'video/webm';

      const mr = new MediaRecorder(stream, {
        mimeType: selectedMime,
        videoBitsPerSecond: 1200000, // 1.2 Mbps
      });

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: selectedMime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ext = selectedMime.includes('mp4') ? 'mp4' : 'webm';
        a.download = `UPSCGPT_Reel_${(currentQ?.srcTopic || 'Prelims').replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${ext}`;
        a.click();
        setRecState('finished');
        clearInterval(recTimerRef.current);
      };

      mediaRecorderRef.current = mr;
      mr.start(500);
      setRecState('recording');
      setRecSeconds(0);
      recTimerRef.current = setInterval(() => setRecSeconds((s) => s + 1), 1000);
    } catch (err) {
      console.error('Recording start failed:', err);
      alert('Could not start in-browser recorder: ' + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    clearInterval(recTimerRef.current);
  };

  if (!storyboard) {
    return (
      <div style={{ padding: 40, color: '#94a3b8', textAlign: 'center' }}>
        No questions loaded for Reels Studio.{' '}
        <Link href="/admin/recording-studio/reels" style={{ color: '#38bdf8' }}>
          ← Return to Reels Selection
        </Link>
      </div>
    );
  }

  const currentStepConfig = STEPS_CONFIG[stepIndex];
  const order = ['v1', 'v2', 'v3', 'answer', 'takeaway'];
  const verdictAt = order.indexOf(currentStepConfig.id);

  return (
    <div className="pq-reel-root">
      {/* SVG Gradient Defs */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <linearGradient id="reel-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>

      {/* Floating Toggle Controls Button when in Clean Mode */}
      {cleanMode && (
        <button
          type="button"
          onClick={() => setCleanMode(false)}
          style={{
            position: 'fixed',
            left: 16,
            top: 16,
            zIndex: 10000,
            padding: '8px 14px',
            borderRadius: 10,
            background: 'rgba(19, 19, 30, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#c084fc',
            fontWeight: 800,
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
          }}
        >
          Show Controls (H)
        </button>
      )}

      <div className="pq-reel-app">
        {/* ========================================================= */}
        {/* CENTER VIEWPORT: SCALED 1080 × 1920 PHONE STAGE          */}
        {/* ========================================================= */}
        <div className="pq-reel-stagewrap" ref={wrapRef}>
          <div className="pq-reel-stage" ref={stageRef}>
            <div className="pq-reel-canvas" ref={reelRef}>
              {/* Top Header */}
              <div className="pq-reel-header">
                <div className="pq-reel-brand">UPSCGPT Reels</div>
                <div className="pq-reel-exam">{storyboard.examHeader}</div>
              </div>

              {/* 9-Segment Story Progress Bar */}
              <div className="pq-reel-progress">
                {STEPS_CONFIG.map((s, idx) => (
                  <span key={s.id} className={idx <= stepIndex ? 'on' : ''} />
                ))}
              </div>

              {/* Content Area (Safe-Zone Enforced) */}
              <div className="pq-reel-content">
                {/* SCREEN 1: HOOK */}
                <section className={`pq-reel-screen pq-reel-hook ${currentStepConfig.screen === 'hook' ? 'active' : ''}`}>
                  <div className="tag">{storyboard.hook.tag || 'Previous year question'}</div>
                  <h1>{storyboard.hook.headline}</h1>
                  <p>{storyboard.hook.teaser}</p>
                </section>

                {/* SCREEN 2: STATEMENTS */}
                <section className={`pq-reel-screen ${currentStepConfig.screen === 'statements' ? 'active' : ''}`}>
                  <h2 className="pq-reel-topic">{storyboard.topic}</h2>
                  <p className="pq-reel-lead">{storyboard.statements.lead}</p>
                  <ol className="pq-reel-stmts">
                    {storyboard.statements.items.map((stmt) => (
                      <li key={stmt.num}>
                        <span className="pq-reel-num">{stmt.num}</span>
                        <p>{stmt.text}</p>
                      </li>
                    ))}
                  </ol>
                </section>

                {/* SCREEN 3: OPTIONS (+ 5s TIMER) */}
                <section
                  className={`pq-reel-screen ${currentStepConfig.screen === 'options' ? 'active' : ''} ${
                    currentStepConfig.id === 'pause' ? 'pausing' : ''
                  }`}
                >
                  <p className="pq-reel-lead">{storyboard.options.lead}</p>
                  <ul className="pq-reel-opts">
                    {storyboard.options.items.map((opt) => (
                      <li key={opt.label}>
                        <span className="lt">{opt.label}</span>
                        <span>{opt.text}</span>
                      </li>
                    ))}
                  </ul>

                  {/* 5-Second Pause Ring Timer */}
                  <div className="pq-reel-timer">
                    <div className="pq-reel-ring">
                      <svg viewBox="0 0 130 130">
                        <circle className="track" cx="65" cy="65" r="55" />
                        <circle className="bar" ref={ringBarRef} cx="65" cy="65" r="55" />
                      </svg>
                      <div className="count">{timerSeconds}</div>
                    </div>
                    <div>
                      <div className="tt">
                        {timerSeconds > 0 ? storyboard.pause.title : 'Now the analysis'}
                      </div>
                      <div className="ts">{storyboard.pause.sub}</div>
                    </div>
                  </div>
                </section>

                {/* SCREEN 4: STATEMENT ANALYSIS & VERDICTS */}
                <section className={`pq-reel-screen ${currentStepConfig.screen === 'analysis' ? 'active' : ''}`}>
                  <h2 className="pq-reel-an-title">{storyboard.analysis.title}</h2>
                  <ol className="pq-reel-verdicts">
                    {storyboard.analysis.verdicts.map((v) => {
                      const isShown = verdictAt >= 0 && v.num <= verdictAt + 1;
                      const isCurrent = verdictAt >= 0 && verdictAt < 3 && v.num === verdictAt + 1;

                      return (
                        <li
                          key={v.num}
                          className={`${isShown ? 'shown' : ''} ${isCurrent ? 'current' : ''} ${
                            v.isCorrect ? 'is-correct-card' : ''
                          }`}
                        >
                          <div className="claim">
                            <span className="num">{v.num}</span>
                            <div>
                              <p>{v.claim}</p>
                              <div className="pq-reel-mini">{v.mini}</div>
                            </div>
                          </div>

                          <span className={`pq-reel-stamp ${v.isCorrect ? 'is-correct' : ''}`}>
                            {v.stamp}
                          </span>

                          <div className="pq-reel-source">
                            <b>
                              {typeof v.mini === 'string'
                                ? v.mini.split('·')[0].trim()
                                : (v.mini || '')}
                            </b>
                            <span>{v.source}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ol>

                  {/* Final Answer Banner */}
                  <div className={`pq-reel-answer ${verdictAt >= 3 ? 'shown' : ''}`}>
                    <span className="lt">{storyboard.analysis.answer.label}</span>
                    <p>{storyboard.analysis.answer.text}</p>
                  </div>
                </section>

                {/* SCREEN 5: TAKEAWAY CARD */}
                <section className={`pq-reel-screen pq-reel-take ${currentStepConfig.screen === 'takeaway' ? 'active' : ''}`}>
                  <h2>{storyboard.takeaway.title}</h2>
                  <ul className="pq-reel-trio">
                    {storyboard.takeaway.trio.map((item, idx) => (
                      <li key={idx}>
                        <span className="art">{item.art}</span>
                        <div>
                          <div className="what">{item.what}</div>
                          <div className="how">{item.how}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <p className="note">{storyboard.takeaway.note}</p>
                </section>
              </div>

              {/* Circular Top-Right Camera Bubble */}
              <div
                className={`pq-reel-cam ${!camVisible ? 'hidden' : ''} ${camLive ? 'live' : ''}`}
                onClick={toggleCamera}
                title="Click to toggle or start live camera"
              >
                <video ref={webcamVideoRef} autoPlay muted playsInline />
                <div className="ph">Your<br />camera</div>
              </div>

              {/* Safe-Zone Guides Overlay (Toggled via G) */}
              <div className={`pq-reel-guides ${safeGuides ? 'on' : ''}`} aria-hidden="true">
                <div className="g-top">Instagram / Shorts Header Safe Zone</div>
                <div className="g-bot">Caption, Username &amp; Audio Track Zone</div>
                <div className="g-right">Like, Comment, Share &amp; Save Buttons</div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT CONTROL SIDEBAR (TELEPROMPTER & SCRIPT CONTROLS)    */}
        {/* ========================================================= */}
        {!cleanMode && (
          <aside className="pq-reel-side">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <h2>Reel Mode Engine</h2>
                <Link
                  href="/admin/recording-studio/reels"
                  style={{ color: '#9a97b4', textDecoration: 'none', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <ArrowLeft size={12} /> Hub
                </Link>
              </div>
              <p>
                1080 × 1920 true canvas. Step through with keyboard while recording in-browser or with OBS.
              </p>
            </div>

            {/* Stepper Navigation Buttons */}
            <div className="pq-reel-btn-row">
              <button type="button" onClick={prevStep} disabled={stepIndex === 0} className="pq-reel-btn">
                ← Back
              </button>
              <button type="button" onClick={nextStep} disabled={stepIndex === STEPS_CONFIG.length - 1} className="pq-reel-btn primary">
                Next Step →
              </button>
              <button type="button" onClick={() => goToStep(0)} className="pq-reel-btn">
                <RotateCcw size={14} />
              </button>
            </div>

            {/* 9 Steps List Teleprompter */}
            <ol className="pq-reel-steps-list">
              {STEPS_CONFIG.map((s, idx) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => goToStep(idx)}
                    className={idx === stepIndex ? 'is-current' : ''}
                  >
                    <span>{s.label}</span>
                    {idx === stepIndex && <span style={{ fontSize: 11, color: '#c084fc' }}>ACTIVE</span>}
                  </button>
                </li>
              ))}
            </ol>

            {/* In-Browser Native MP4 Recording Controls */}
            <div style={{ padding: 14, borderRadius: 12, background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.35)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: '#f472b6', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Radio size={14} /> Native In-Browser Recorder
                </span>
                {recState === 'recording' && (
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#ef4444', animation: 'pulse 1s infinite' }}>
                    🔴 {formatDurationTimestamp(recSeconds)}
                  </span>
                )}
              </div>

              {recState !== 'recording' ? (
                <button
                  type="button"
                  onClick={startRecording}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #f43f5e, #ec4899)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <Radio size={15} /> Start Recording Reel (MP4)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  ⏹ Finish &amp; Download MP4
                </button>
              )}
            </div>

            {/* AI Polish Button & Status */}
            <div>
              <button
                type="button"
                onClick={handleAiPolish}
                disabled={isAiPolishing}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(236, 72, 153, 0.25))',
                  border: '1.5px solid rgba(236, 72, 153, 0.5)',
                  color: '#f472b6',
                  fontWeight: 800,
                  fontSize: 13.5,
                  cursor: isAiPolishing ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Sparkles size={16} />
                <span>{isAiPolishing ? 'Polishing Reel...' : '✨ AI Polish Hook & Takeaways'}</span>
              </button>
              {aiPolishStatus && (
                <p style={{ fontSize: 12, color: '#cbd5e1', marginTop: 6, fontWeight: 600 }}>{aiPolishStatus}</p>
              )}
            </div>

            {/* Quick Live Inline Script Editor */}
            <div className="pq-reel-editor-card">
              <div
                className="pq-reel-editor-title"
                onClick={() => setEditorOpen((prev) => !prev)}
                style={{ cursor: 'pointer' }}
              >
                <span>Edit Reel Script (Live Sync)</span>
                <span>{editorOpen ? '▲' : '▼'}</span>
              </div>

              {editorOpen && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#9a97b4', marginBottom: 4 }}>
                      HOOK HEADLINE
                    </label>
                    <input
                      className="pq-reel-input"
                      value={storyboard.hook.headline}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStoryboardOverrides((prev) => ({
                          ...prev,
                          [currentQId]: {
                            ...(prev[currentQId] || {}),
                            hook: { ...(prev[currentQId]?.hook || storyboard.hook), headline: val },
                          },
                        }));
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#9a97b4', marginBottom: 4 }}>
                      HOOK TEASER
                    </label>
                    <textarea
                      className="pq-reel-textarea"
                      value={storyboard.hook.teaser}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStoryboardOverrides((prev) => ({
                          ...prev,
                          [currentQId]: {
                            ...(prev[currentQId] || {}),
                            hook: { ...(prev[currentQId]?.hook || storyboard.hook), teaser: val },
                          },
                        }));
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#9a97b4', marginBottom: 4 }}>
                      TAKEAWAY TITLE
                    </label>
                    <input
                      className="pq-reel-input"
                      value={storyboard.takeaway.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStoryboardOverrides((prev) => ({
                          ...prev,
                          [currentQId]: {
                            ...(prev[currentQId] || {}),
                            takeaway: { ...(prev[currentQId]?.takeaway || storyboard.takeaway), title: val },
                          },
                        }));
                      }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Controls Toggles */}
            <div className="pq-reel-btn-row">
              <button
                type="button"
                className={`pq-reel-btn ${safeGuides ? 'is-active' : ''}`}
                onClick={() => setSafeGuides((prev) => !prev)}
              >
                Safe Zones (G)
              </button>
              <button
                type="button"
                className={`pq-reel-btn ${camVisible ? 'is-active' : ''}`}
                onClick={toggleCamera}
              >
                Camera Bubble (W)
              </button>
              <button type="button" className="pq-reel-btn" onClick={() => setCleanMode(true)}>
                Clean Mode (H)
              </button>
            </div>

            {/* Keyboard Shortcuts Reference */}
            <div className="pq-reel-keys-grid">
              <kbd>→</kbd>
              <span>Next step (or Space)</span>
              <kbd>←</kbd>
              <span>Previous step</span>
              <kbd>G</kbd>
              <span>Safe-zone guides</span>
              <kbd>W</kbd>
              <span>Toggle camera bubble</span>
              <kbd>H</kbd>
              <span>Hide controls (clean view)</span>
              <kbd>F</kbd>
              <span>Fullscreen</span>
              <kbd>R</kbd>
              <span>Restart from Step 1</span>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
