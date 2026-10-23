'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { getStroke } from 'perfect-freehand';

function getCurrentTimestamp() {
  return typeof performance !== 'undefined' ? performance.now() : 0;
}

function renderStroke(ctx, stroke, defaultPenSize, defaultHighlighterSize) {
  if (!stroke || !stroke.points || stroke.points.length === 0) return;

  const isHighlighter = stroke.tool === 'highlighter';
  const size = isHighlighter ? stroke.size || defaultHighlighterSize : stroke.size || defaultPenSize;

  const outline = getStroke(stroke.points, {
    size,
    thinning: isHighlighter ? 0 : 0.65,
    smoothing: 0.55,
    streamline: 0.5,
    start: { cap: true, taper: 0 },
    end: { cap: true, taper: 0 },
  });

  if (outline.length < 3) return;

  ctx.save();
  if (isHighlighter) {
    ctx.fillStyle = stroke.color;
    ctx.globalAlpha = 0.35;
    ctx.globalCompositeOperation = 'source-over';
  } else {
    ctx.fillStyle = stroke.color;
    ctx.globalAlpha = 1.0;
  }

  ctx.beginPath();
  ctx.moveTo(outline[0][0], outline[0][1]);
  for (let i = 1; i < outline.length; i++) {
    ctx.lineTo(outline[i][0], outline[i][1]);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function renderLaser(ctx, trail, now) {
  for (let i = 0; i < trail.length; i++) {
    const p = trail[i];
    const age = now - p.time;
    if (age > 450) continue;
    const alpha = Math.max(0, 1 - age / 450);

    ctx.save();
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 15;
    ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(2, 7 * alpha), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * 1920x1080 Annotation Canvas with XP-Pen Pressure Support,
 * iPad Sidecar velocity simulation, Highlighter, Laser pointer,
 * and dual-layer ink (Question panel persistent ink vs Step explanation ink).
 */
export default function PyqAnnotationCanvas({
  scale = 1,
  activeTool = 'pen', // 'pen' | 'highlighter' | 'laser' | 'eraser' | 'none'
  activeColor = '#ffffff',
  penSize = 5,
  highlighterSize = 26,
  leftBoundaryX = 830, // boundary separating Left Question Panel from Right Explanation Panel
  questionStrokes = [],
  stepStrokes = [],
  onUpdateQuestionStrokes,
  onUpdateStepStrokes,
}) {
  const canvasRef = useRef(null);
  const currentStrokeRef = useRef(null);
  const laserTrailRef = useRef([]);
  const animFrameRef = useRef(null);
  const lastPointTimeRef = useRef(0);
  const lastPointPosRef = useRef({ x: 0, y: 0 });

  // -------------------------------------------------------------
  // Render all strokes onto the 1920x1080 canvas
  // -------------------------------------------------------------
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 1920, 1080);

    // 1. Draw persistent Question Panel strokes
    for (const stroke of questionStrokes) {
      renderStroke(ctx, stroke, penSize, highlighterSize);
    }

    // 2. Draw active Step Explanation Panel strokes
    for (const stroke of stepStrokes) {
      renderStroke(ctx, stroke, penSize, highlighterSize);
    }

    // 3. Draw current active stroke being drawn right now
    if (currentStrokeRef.current) {
      renderStroke(ctx, currentStrokeRef.current, penSize, highlighterSize);
    }

    // 4. Draw laser pointer trail if laser tool is active
    if (activeTool === 'laser' && laserTrailRef.current.length > 0) {
      renderLaser(ctx, laserTrailRef.current, getCurrentTimestamp());
    }
  }, [questionStrokes, stepStrokes, activeTool, penSize, highlighterSize]);

  // Laser animation loop
  useEffect(() => {
    let active = true;
    function loop() {
      if (activeTool === 'laser' && laserTrailRef.current.length > 0) {
        const now = getCurrentTimestamp();
        laserTrailRef.current = laserTrailRef.current.filter(p => now - p.time <= 450);
        redraw();
      }
      if (active) {
        animFrameRef.current = requestAnimationFrame(loop);
      }
    }
    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeTool, redraw]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  // -------------------------------------------------------------
  // Pointer Event Coordinates in 1920x1080 Space
  // -------------------------------------------------------------
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, pressure: 0.5 };
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    // Real hardware pressure from XP-Pen tablet stylus
    let pressure = e.pressure;

    // Fallback simulated velocity pressure for iPad Sidecar mouse mode
    if (!pressure || pressure === 0) {
      const now = getCurrentTimestamp();
      const dt = Math.max(1, now - lastPointTimeRef.current);
      const dx = x - lastPointPosRef.current.x;
      const dy = y - lastPointPosRef.current.y;
      const dist = Math.hypot(dx, dy);
      const velocity = dist / dt;
      pressure = Math.max(0.2, Math.min(1.0, 1.15 - velocity * 0.18));
      lastPointTimeRef.current = now;
      lastPointPosRef.current = { x, y };
    }

    return { x, y, pressure };
  };

  // -------------------------------------------------------------
  // Eraser Helper: Erases stroke if touched within 22px radius
  // -------------------------------------------------------------
  const eraseAtPoint = (ex, ey) => {
    const isQuestionPanel = ex < leftBoundaryX;
    const threshold = 22;

    const hitStroke = (stroke) => {
      for (const [px, py] of stroke.points) {
        if (Math.hypot(px - ex, py - ey) < threshold) return true;
      }
      return false;
    };

    if (isQuestionPanel) {
      const filtered = questionStrokes.filter(s => !hitStroke(s));
      if (filtered.length !== questionStrokes.length) {
        onUpdateQuestionStrokes?.(filtered);
      }
    } else {
      const filtered = stepStrokes.filter(s => !hitStroke(s));
      if (filtered.length !== stepStrokes.length) {
        onUpdateStepStrokes?.(filtered);
      }
    }
  };

  // -------------------------------------------------------------
  // Pointer Down (Stroke Start)
  // -------------------------------------------------------------
  const handlePointerDown = (e) => {
    if (activeTool === 'none') return;
    e.preventDefault();
    canvasRef.current?.setPointerCapture?.(e.pointerId);

    const { x, y, pressure } = getCanvasCoords(e);

    // Eraser Tool Action
    if (activeTool === 'eraser') {
      eraseAtPoint(x, y);
      return;
    }

    // Laser Tool Action
    if (activeTool === 'laser') {
      laserTrailRef.current = [{ x, y, time: getCurrentTimestamp() }];
      redraw();
      return;
    }

    // Pen or Highlighter Tool: Start Stroke
    const targetLayer = x < leftBoundaryX ? 'question' : 'step';
    currentStrokeRef.current = {
      tool: activeTool,
      color: activeColor,
      size: activeTool === 'highlighter' ? highlighterSize : penSize,
      targetLayer,
      points: [[x, y, pressure]],
    };

    redraw();
  };

  // -------------------------------------------------------------
  // Pointer Move (Draw)
  // -------------------------------------------------------------
  const handlePointerMove = (e) => {
    if (activeTool === 'none') return;
    const { x, y, pressure } = getCanvasCoords(e);

    if (activeTool === 'eraser') {
      if (e.buttons > 0) eraseAtPoint(x, y);
      return;
    }

    if (activeTool === 'laser') {
      laserTrailRef.current.push({ x, y, time: getCurrentTimestamp() });
      return;
    }

    if (!currentStrokeRef.current) return;
    currentStrokeRef.current.points.push([x, y, pressure]);
    redraw();
  };

  // -------------------------------------------------------------
  // Pointer Up (Stroke Finish & Save to Correct Layer)
  // -------------------------------------------------------------
  const handlePointerUp = (e) => {
    if (activeTool === 'none') return;
    try {
      canvasRef.current?.releasePointerCapture?.(e.pointerId);
    } catch (_) {}

    if (currentStrokeRef.current) {
      const stroke = currentStrokeRef.current;
      currentStrokeRef.current = null;

      if (stroke.points.length >= 2) {
        if (stroke.targetLayer === 'question') {
          onUpdateQuestionStrokes?.([...questionStrokes, stroke]);
        } else {
          onUpdateStepStrokes?.([...stepStrokes, stroke]);
        }
      }
    }

    redraw();
  };

  return (
    <canvas
      ref={canvasRef}
      width={1920}
      height={1080}
      className={`pq-annotation-canvas ${activeTool === 'eraser' ? 'is-eraser' : ''} ${activeTool === 'laser' ? 'is-laser' : ''}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    />
  );
}
