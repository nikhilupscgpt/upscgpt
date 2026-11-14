'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { getStroke } from 'perfect-freehand';
import { stageToBlockPoint } from '@/lib/present/ink-coords';

function getCurrentTimestamp() {
  return typeof performance !== 'undefined' ? performance.now() : 0;
}

/**
 * Converts a polygon outline from `perfect-freehand` into a smooth
 * midpoint Quadratic Bézier SVG path string (C1 continuous curves, zero jagged corners).
 */
function getSvgPathFromStroke(points) {
  const len = points.length;
  if (len < 3) return '';

  const a = points[0];
  const b = points[1];
  const c = points[2];

  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(2)},${b[1].toFixed(2)} ${((b[0] + c[0]) / 2).toFixed(2)},${((b[1] + c[1]) / 2).toFixed(2)} T`;

  for (let i = 2, max = len - 1; i < max; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    result += `${((p0[0] + p1[0]) / 2).toFixed(2)},${((p0[1] + p1[1]) / 2).toFixed(2)} `;
  }

  result += 'Z';
  return result;
}

/**
 * Computes (or retrieves cached) Path2D for a stroke and renders it with
 * Quadratic Bézier smoothing, single-tap dot support, and smart end-taper.
 */
function snapShapeEnd(tool, x0, y0, x1, y1, shiftKey) {
  if (!shiftKey) return [x1, y1];
  const dx = x1 - x0;
  const dy = y1 - y0;
  if (tool === 'arrow' || tool === 'line') {
    const angle = Math.atan2(dy, dx);
    const snapAngle = Math.round(angle / (Math.PI / 12)) * (Math.PI / 12); // 15° snap
    const dist = Math.hypot(dx, dy);
    return [x0 + Math.cos(snapAngle) * dist, y0 + Math.sin(snapAngle) * dist];
  }
  if (tool === 'rect' || tool === 'ellipse') {
    const side = Math.max(Math.abs(dx), Math.abs(dy));
    return [x0 + Math.sign(dx || 1) * side, y0 + Math.sign(dy || 1) * side];
  }
  return [x1, y1];
}

function renderStroke(ctx, stroke, defaultPenSize, defaultHighlighterSize, isLiveStroke = false, predictedPoints = []) {
  if (!stroke || !stroke.points || stroke.points.length === 0) return;

  const isHighlighter = stroke.tool === 'highlighter';
  const isBrush = stroke.tool === 'brush';
  let size = isHighlighter ? stroke.size || defaultHighlighterSize : stroke.size || defaultPenSize;
  // Section 6 Rule 7: Strokes drawn while zoomed store zs and divide their width by it
  if (stroke.zs && stroke.zs > 0 && stroke.zs !== 1) {
    size = size / stroke.zs;
  }

  ctx.save();
  if (isHighlighter) {
    ctx.fillStyle = stroke.color;
    ctx.globalAlpha = 0.35;
    ctx.globalCompositeOperation = 'multiply';
  } else {
    ctx.fillStyle = stroke.color;
    ctx.strokeStyle = stroke.color;
    ctx.globalAlpha = 1.0;
  }

  // Text label stroke
  if (stroke.tool === 'text') {
    const [tx, ty] = stroke.points[0];
    const fontSize = Math.max(22, size * 4.5);
    ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillText(String(stroke.text || ''), tx, ty);
    ctx.restore();
    return;
  }

  // Geometric shape tools (arrow, line, rect, ellipse)
  if (stroke.tool === 'arrow' || stroke.tool === 'line' || stroke.tool === 'rect' || stroke.tool === 'ellipse') {
    const p0 = stroke.points[0];
    const p1 = stroke.points[stroke.points.length - 1];
    const [x0, y0] = p0;
    const [x1, y1] = p1;
    ctx.lineWidth = Math.max(2, size);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    if (stroke.tool === 'line' || stroke.tool === 'arrow') {
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      if (stroke.tool === 'arrow') {
        const angle = Math.atan2(y1 - y0, x1 - x0);
        const headLen = Math.max(14, size * 3.2);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 - headLen * Math.cos(angle - Math.PI / 6), y1 - headLen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 - headLen * Math.cos(angle + Math.PI / 6), y1 - headLen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      }
    } else if (stroke.tool === 'rect') {
      ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    } else if (stroke.tool === 'ellipse') {
      const cx = (x0 + x1) / 2;
      const cy = (y0 + y1) / 2;
      const rx = Math.abs(x1 - x0) / 2;
      const ry = Math.abs(y1 - y0) / 2;
      ctx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  // Single-tap dot handling (dotting 'i', periods, colons, decimal points, bullet points)
  if (stroke.isDot || stroke.points.length === 1) {
    const [dx, dy] = stroke.points[0];
    ctx.beginPath();
    ctx.arc(dx, dy, Math.max(1.8, size * 0.56), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // Use cached Path2D for completed strokes so redraws run in < 0.02ms with zero CPU lag
  // Note: check instanceof Path2D because strokes received over WebRTC JSON would otherwise have _cachedPath serialized as {}
  if (
    !isLiveStroke &&
    typeof Path2D !== 'undefined' &&
    stroke._cachedPath instanceof Path2D &&
    stroke._cachedSize === size
  ) {
    ctx.fill(stroke._cachedPath);
    ctx.restore();
    return;
  }

  const pointsToRender =
    isLiveStroke && predictedPoints.length > 0
      ? [...stroke.points, ...predictedPoints]
      : stroke.points;

  const outline = getStroke(pointsToRender, {
    size: isBrush ? size * 1.35 : size,
    thinning: isHighlighter ? 0 : (isBrush ? 0.58 : 0),
    smoothing: 0.68,
    streamline: 0.54,
    simulatePressure: !stroke.hasHardwarePressure && isBrush,
    start: {
      cap: true,
      taper: isBrush ? Math.min(size * 1.2, 10) : 0,
    },
    end: {
      cap: true,
      taper: isHighlighter ? 0 : (isBrush ? Math.min(size * 2.2, 18) : Math.min(size * 1.4, 10)),
    },
  });

  if (outline.length < 3) {
    const [dx, dy] = stroke.points[0];
    ctx.beginPath();
    ctx.arc(dx, dy, Math.max(1.8, size * 0.55), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  const pathData = getSvgPathFromStroke(outline);
  if (typeof Path2D !== 'undefined' && pathData) {
    const path2d = new Path2D(pathData);
    if (!isLiveStroke) {
      Object.defineProperty(stroke, '_cachedPath', {
        value: path2d,
        writable: true,
        configurable: true,
        enumerable: false,
      });
      Object.defineProperty(stroke, '_cachedSize', {
        value: size,
        writable: true,
        configurable: true,
        enumerable: false,
      });
    }
    ctx.fill(path2d);
  } else {
    ctx.beginPath();
    ctx.moveTo(outline[0][0], outline[0][1]);
    for (let i = 1; i < outline.length - 1; i++) {
      const p0 = outline[i];
      const p1 = outline[i + 1];
      ctx.quadraticCurveTo(p0[0], p0[1], (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2);
    }
    ctx.closePath();
    ctx.fill();
  }

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
 * Renders a live zero-lag hover nib or eraser hit-circle for XP-Pen / Wacom
 * and Apple Pencil hover so the educator always sees exact landing position & size.
 */
function renderHoverPreview(ctx, hover, activeTool, activeColor, penSize, highlighterSize) {
  if (!hover || !hover.visible) return;
  const { x, y, isBarrelEraser, isPenDown } = hover;
  const effectiveTool = isBarrelEraser ? 'eraser' : activeTool;

  if (effectiveTool === 'none' || effectiveTool === 'laser') return;

  ctx.save();

  if (effectiveTool === 'eraser') {
    const radius = 22;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = isPenDown ? 'rgba(239, 68, 68, 0.24)' : 'rgba(239, 68, 68, 0.12)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(248, 113, 113, 0.85)';
    ctx.stroke();
    ctx.restore();
    return;
  }

  // While actively drawing a pen/highlighter stroke, only show a subtle tip dot
  if (isPenDown) {
    ctx.restore();
    return;
  }

  const radius = Math.max(2.5, (effectiveTool === 'highlighter' ? highlighterSize : penSize) * 0.5);
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = activeColor;
  ctx.globalAlpha = effectiveTool === 'highlighter' ? 0.5 : 0.9;
  ctx.fill();

  // Outer contrast ring so white nib is visible on light backgrounds & dark nib on dark backgrounds
  ctx.beginPath();
  ctx.arc(x, y, radius + 1.5, 0, Math.PI * 2);
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = activeColor === '#ffffff' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.85)';
  ctx.stroke();

  ctx.restore();
}

/**
 * HiDPI 240Hz Annotation Canvas with:
 * - Native 2x Retina backing store (`devicePixelRatio`)
 * - 240Hz Apple Pencil & 200+ RPS XP-Pen `getCoalescedEvents()` extraction
 * - 1-Frame `getPredictedEvents()` latency compensation
 * - Velocity-adaptive EMA stabilization filter (eliminates iPad Sidecar sub-pixel wobble)
 * - Quadratic Bézier Path2D caching (zero lag even with 50+ strokes on screen)
 * - XP-Pen / Wacom Barrel Button Instant Eraser & Hover Nib Preview
 * - Single-tap dot synthesis (dotting 'i', decimal points, colons never vanish)
 */
export default function PyqAnnotationCanvas({
  scale = 1,
  canvasWidth = 1920,
  canvasHeight = 1080,
  activeTool = 'pen', // 'pen' | 'highlighter' | 'laser' | 'eraser' | 'none'
  activeColor = '#ffffff',
  penSize = 5,
  highlighterSize = 26,
  leftBoundaryX = 830, // boundary separating Left Question Panel from Right Explanation Panel
  isFullStage = false, // When true, the entire stage is a full blank scratchpad
  questionTransform = { offsetX: 0, offsetY: 0, scale: 1 },
  showQuestionInk = true,
  questionStrokes = [],
  stepStrokes = [],
  onUpdateQuestionStrokes,
  onUpdateStepStrokes,
  // Remote sync & zoom additions (Section 6 & Rules 7-8)
  zoom = { z: 1, x: 0, y: 0 },
  onZoomChange,
  onLiveStroke,
  remoteLiveStroke = null,
  onLaserMove,
  remoteLaserPoint = null,
  onAddStroke,
  onDeleteStroke,
}) {
  const canvasRef = useRef(null);
  const currentStrokeRef = useRef(null);
  const predictedPointsRef = useRef([]);
  const laserTrailRef = useRef([]);
  const hoverStateRef = useRef({ x: 0, y: 0, visible: false, isBarrelEraser: false, isPenDown: false });
  const cachedRectRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastLiveBroadcastRef = useRef(0);
  const lastLaserBroadcastRef = useRef(0);
  const pinchStartRef = useRef(null);
  const penActiveUntilRef = useRef(0); // Palm rejection: ignore touch while stylus is active
  const spotlightPosRef = useRef({ x: canvasWidth / 2, y: canvasHeight / 2, r: 190 });
  const [textDraft, setTextDraft] = useState(null); // { x, y, value }

  const [dpr, setDpr] = useState(1);

  useEffect(() => {
    const updateDpr = () => {
      if (typeof window !== 'undefined') {
        setDpr(Math.min(window.devicePixelRatio || 1, 2.5));
      }
    };
    updateDpr();
    window.addEventListener('resize', updateDpr);
    return () => window.removeEventListener('resize', updateDpr);
  }, []);

  // -------------------------------------------------------------
  // Render all strokes onto the HiDPI canvas
  // -------------------------------------------------------------
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const z = zoom?.z || 1;
    const zx = zoom?.x || 0;
    const zy = zoom?.y || 0;

    ctx.save();
    if (z !== 1 || zx !== 0 || zy !== 0) {
      ctx.scale(z, z);
      ctx.translate(-zx, -zy);
    }

    // 1. Draw persistent Question Panel strokes (scaled with question block during Step 1 -> Step 2)
    if (!isFullStage && showQuestionInk) {
      const qScale = questionTransform?.scale > 0 ? questionTransform.scale : 1;
      const qOffX = questionTransform?.offsetX || 0;
      const qOffY = questionTransform?.offsetY || 0;
      ctx.save();
      ctx.translate(qOffX, qOffY);
      ctx.scale(qScale, qScale);
      for (const stroke of questionStrokes) {
        renderStroke(ctx, stroke, penSize, highlighterSize, false);
      }
      ctx.restore();
    }

    // 2. Draw active Step Explanation Panel strokes
    for (const stroke of stepStrokes) {
      renderStroke(ctx, stroke, penSize, highlighterSize, false);
    }

    // 3. Draw current active stroke being drawn right now (with 1-frame predicted tip)
    if (currentStrokeRef.current) {
      renderStroke(
        ctx,
        currentStrokeRef.current,
        penSize,
        highlighterSize,
        true,
        predictedPointsRef.current
      );
    }

    // 4. Remote in-progress live stroke
    if (remoteLiveStroke) {
      renderStroke(ctx, remoteLiveStroke, penSize, highlighterSize, true);
    }

    // 5. Draw laser pointer trail if laser tool is active or remote laser is active
    if (laserTrailRef.current.length > 0) {
      renderLaser(ctx, laserTrailRef.current, getCurrentTimestamp());
    }

    // 5b. Spotlight dim overlay when spotlight tool is active
    if (activeTool === 'spotlight') {
      const sp = spotlightPosRef.current;
      ctx.save();
      ctx.fillStyle = 'rgba(2, 6, 23, 0.62)';
      ctx.beginPath();
      ctx.rect(0, 0, canvasWidth, canvasHeight);
      ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2, true);
      ctx.fill('evenodd');
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();

    // 6. Draw live hover nib or eraser hit-circle
    renderHoverPreview(ctx, hoverStateRef.current, activeTool, activeColor, penSize, highlighterSize);

    ctx.restore();
  }, [
    questionStrokes,
    stepStrokes,
    activeTool,
    activeColor,
    penSize,
    highlighterSize,
    canvasWidth,
    canvasHeight,
    isFullStage,
    questionTransform,
    showQuestionInk,
    dpr,
    zoom,
    remoteLiveStroke,
  ]);

  // Remote Laser listener (placed after redraw declaration to prevent TDZ ReferenceError)
  useEffect(() => {
    if (remoteLaserPoint && Array.isArray(remoteLaserPoint)) {
      laserTrailRef.current.push({
        x: remoteLaserPoint[0],
        y: remoteLaserPoint[1],
        time: getCurrentTimestamp(),
      });
      redraw();
    }
  }, [remoteLaserPoint, redraw]);

  // Laser animation loop
  useEffect(() => {
    let active = true;
    function loop() {
      if (laserTrailRef.current.length > 0) {
        const now = getCurrentTimestamp();
        laserTrailRef.current = laserTrailRef.current.filter(p => now - p.time <= 1000);
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
  // Pointer Event Coordinates in Canvas Space (Zero Layout Reflow + Zoom Unproject)
  // -------------------------------------------------------------
  const getCanvasCoords = (ev, refreshRect = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, pressure: 0.55, hasHardwarePressure: false };

    if (refreshRect || !cachedRectRef.current) {
      cachedRectRef.current = canvas.getBoundingClientRect();
    }
    const rect = cachedRectRef.current;
    const scaleX = rect.width / canvasWidth;
    const scaleY = rect.height / canvasHeight;

    const z = zoom?.z || 1;
    const zx = zoom?.x || 0;
    const zy = zoom?.y || 0;

    const stageX = (ev.clientX - rect.left) / (scaleX || scale || 1);
    const stageY = (ev.clientY - rect.top) / (scaleY || scale || 1);

    // Unproject zoom so all strokes and laser are stored in logical stage space
    const x = stageX / z + zx;
    const y = stageY / z + zy;

    // Clamped Smart Pressure for XP-Pen (8192 levels) & Apple Pencil:
    // Prevents faint invisible lines while keeping natural calligraphic weight
    const rawP = typeof ev.pressure === 'number' ? ev.pressure : 0.5;
    const hasHardwarePressure = ev.pointerType === 'pen' && rawP > 0 && rawP !== 0.5;
    const pressure = hasHardwarePressure
      ? 0.42 + Math.min(1, Math.max(0, rawP)) * 0.36
      : 0.55;

    return { x, y, pressure, hasHardwarePressure };
  };

  // -------------------------------------------------------------
  const SHAPE_TOOLS = new Set(['arrow', 'line', 'rect', 'ellipse']);

  // Eraser Helper: Stroke erase by default; Alt = area erase (removes points near cursor)
  const eraseAtPoint = (ex, ey, isAreaErase = false) => {
    const isQuestionPanel = !isFullStage && showQuestionInk && ex < leftBoundaryX;
    const qScale = isQuestionPanel && questionTransform?.scale > 0 ? questionTransform.scale : 1;
    const [tx, ty] = isQuestionPanel ? stageToBlockPoint(ex, ey, questionTransform) : [ex, ey];
    const threshold = (isAreaErase ? 28 : 22) / qScale;

    const hitStroke = (stroke) => {
      for (const [px, py] of stroke.points) {
        if (Math.hypot(px - tx, py - ty) < threshold) return true;
      }
      return false;
    };

    const applyErase = (list, targetLayer, updater) => {
      if (!isAreaErase) {
        const removed = list.filter(hitStroke);
        if (removed.length > 0) {
          updater?.(list.filter(s => !hitStroke(s)));
          onDeleteStroke?.({ targetLayer, ids: removed.map(s => s.id) });
        }
        return;
      }
      let changed = false;
      const next = [];
      for (const s of list) {
        if (s.tool === 'text' || SHAPE_TOOLS.has(s.tool)) {
          if (hitStroke(s)) {
            changed = true;
          } else {
            next.push(s);
          }
          continue;
        }
        const keptPts = s.points.filter(([px, py]) => Math.hypot(px - tx, py - ty) >= threshold);
        if (keptPts.length !== s.points.length) {
          changed = true;
          if (keptPts.length >= 2) {
            next.push({ ...s, points: keptPts, _cachedPath: undefined });
          }
        } else {
          next.push(s);
        }
      }
      if (changed) updater?.(next);
    };

    if (isFullStage) {
      applyErase(stepStrokes, 'step', onUpdateStepStrokes);
    } else if (isQuestionPanel) {
      applyErase(questionStrokes, 'question', onUpdateQuestionStrokes);
    } else {
      applyErase(stepStrokes, 'step', onUpdateStepStrokes);
    }
  };

  // Detect XP-Pen / Wacom side barrel button or tail eraser
  const isBarrelEraserActive = (e) => {
    return e.button === 2 || e.button === 5 || (e.buttons & 2) === 2 || (e.buttons & 32) === 32;
  };

  // Palm rejection: when stylus is active, ignore touch events on the stage
  const shouldRejectPalm = (e) => {
    if (e.pointerType === 'pen') {
      penActiveUntilRef.current = Date.now() + 900;
      return false;
    }
    if (e.pointerType === 'touch' && Date.now() < penActiveUntilRef.current) {
      return true;
    }
    return false;
  };

  // -------------------------------------------------------------
  // Pointer Down (Stroke Start)
  // -------------------------------------------------------------
  const handlePointerDown = (e) => {
    if (activeTool === 'none') return;
    if (shouldRejectPalm(e)) return;
    e.preventDefault();
    canvasRef.current?.setPointerCapture?.(e.pointerId);

    const { x, y, pressure, hasHardwarePressure } = getCanvasCoords(e, true);
    const barrelEraser = isBarrelEraserActive(e);

    hoverStateRef.current = {
      x,
      y,
      visible: true,
      isBarrelEraser: barrelEraser,
      isPenDown: true,
    };

    if (activeTool === 'spotlight') {
      spotlightPosRef.current = { ...spotlightPosRef.current, x, y };
      redraw();
      return;
    }

    if (activeTool === 'text') {
      setTextDraft({ x, y, value: '' });
      return;
    }

    // Eraser Tool Action OR Stylus Barrel Button Instant Erase
    if (activeTool === 'eraser' || barrelEraser) {
      currentStrokeRef.current = null;
      eraseAtPoint(x, y, Boolean(e.altKey));
      redraw();
      return;
    }

    // Laser Tool Action
    if (activeTool === 'laser') {
      laserTrailRef.current = [{ x, y, time: getCurrentTimestamp() }];
      redraw();
      return;
    }

    // Pen, Brush, Highlighter, or Shape Tool: Start Stroke
    const targetLayer = isFullStage ? 'step' : (x < leftBoundaryX ? 'question' : 'step');
    predictedPointsRef.current = [];
    currentStrokeRef.current = {
      tool: activeTool,
      color: activeColor,
      size: activeTool === 'highlighter' ? highlighterSize : penSize,
      targetLayer,
      hasHardwarePressure,
      maxTravel: 0,
      points: [[x, y, pressure]],
    };

    redraw();
  };

  // -------------------------------------------------------------
  // Pointer Move (240Hz Coalesced Extraction + Velocity EMA Filter)
  // -------------------------------------------------------------
  const handlePointerMove = (e) => {
    if (activeTool === 'none') return;
    if (shouldRejectPalm(e)) return;

    const nativeEv = e.nativeEvent || e;
    const coalesced =
      typeof nativeEv.getCoalescedEvents === 'function'
        ? nativeEv.getCoalescedEvents()
        : null;
    const eventsToProcess = coalesced && coalesced.length > 0 ? coalesced : [nativeEv];

    const barrelEraser = isBarrelEraserActive(e);
    const latestCoords = getCanvasCoords(eventsToProcess[eventsToProcess.length - 1], false);

    hoverStateRef.current = {
      x: latestCoords.x,
      y: latestCoords.y,
      visible: true,
      isBarrelEraser: barrelEraser,
      isPenDown: e.buttons > 0,
    };

    if (activeTool === 'spotlight') {
      if (e.buttons > 0) {
        spotlightPosRef.current = { ...spotlightPosRef.current, x: latestCoords.x, y: latestCoords.y };
        redraw();
      }
      return;
    }

    // Eraser or Stylus Barrel Button Erase while dragging
    if (activeTool === 'eraser' || barrelEraser) {
      if (e.buttons > 0) {
        for (const ev of eventsToProcess) {
          const pt = getCanvasCoords(ev, false);
          eraseAtPoint(pt.x, pt.y, Boolean(e.altKey));
        }
      }
      redraw();
      return;
    }

    if (activeTool === 'laser') {
      const now = getCurrentTimestamp();
      for (const ev of eventsToProcess) {
        const pt = getCanvasCoords(ev, false);
        laserTrailRef.current.push({ x: pt.x, y: pt.y, time: now });
        if (onLaserMove && now - lastLaserBroadcastRef.current >= 30) {
          lastLaserBroadcastRef.current = now;
          onLaserMove([pt.x, pt.y]);
        }
      }
      redraw();
      return;
    }

    // If hovering without touching tablet surface, just update the hover nib ring
    if (!currentStrokeRef.current || e.buttons === 0) {
      redraw();
      return;
    }

    const stroke = currentStrokeRef.current;
    const pts = stroke.points;

    if (SHAPE_TOOLS.has(stroke.tool)) {
      const [sx, sy] = snapShapeEnd(stroke.tool, pts[0][0], pts[0][1], latestCoords.x, latestCoords.y, Boolean(e.shiftKey));
      stroke.points = [pts[0], [sx, sy, 0.55]];
      stroke.maxTravel = Math.hypot(sx - pts[0][0], sy - pts[0][1]);
      redraw();
      return;
    }

    for (const ev of eventsToProcess) {
      const { x: rawX, y: rawY, pressure, hasHardwarePressure } = getCanvasCoords(ev, false);
      if (hasHardwarePressure) stroke.hasHardwarePressure = true;

      const lastPt = pts[pts.length - 1];
      const dx = rawX - lastPt[0];
      const dy = rawY - lastPt[1];
      const dist = Math.hypot(dx, dy);

      // Ignore sub-pixel digitizer/Sidecar noise when pen is nearly stationary
      if (dist < 0.75) continue;

      // Velocity-adaptive EMA stabilization
      const alpha = dist < 4.0 ? 0.62 + (dist / 4.0) * 0.28 : 0.92;
      const smoothX = lastPt[0] + dx * alpha;
      const smoothY = lastPt[1] + dy * alpha;
      const smoothP = lastPt[2] * 0.4 + pressure * 0.6;

      stroke.maxTravel = (stroke.maxTravel || 0) + dist;
      pts.push([smoothX, smoothY, smoothP]);
    }

    // Broadcast in-progress live stroke throttled every 40ms (Section 6: live)
    const nowTime = getCurrentTimestamp();
    if (onLiveStroke && nowTime - lastLiveBroadcastRef.current >= 40) {
      lastLiveBroadcastRef.current = nowTime;
      onLiveStroke({
        ...stroke,
        points: [...stroke.points],
      });
    }

    // Extract 1-frame hardware prediction for zero-latency live nib tracking
    const predicted =
      typeof nativeEv.getPredictedEvents === 'function'
        ? nativeEv.getPredictedEvents()
        : null;
    if (predicted && predicted.length > 0 && pts.length > 1) {
      const pEv = predicted[0];
      const pCoord = getCanvasCoords(pEv, false);
      const lastPt = pts[pts.length - 1];
      // Clamp prediction distance so fast flicks never overshoot
      const pDist = Math.hypot(pCoord.x - lastPt[0], pCoord.y - lastPt[1]);
      if (pDist > 0.5 && pDist < 18) {
        predictedPointsRef.current = [
          [
            lastPt[0] + (pCoord.x - lastPt[0]) * 0.55,
            lastPt[1] + (pCoord.y - lastPt[1]) * 0.55,
            pCoord.pressure,
          ],
        ];
      } else {
        predictedPointsRef.current = [];
      }
    } else {
      predictedPointsRef.current = [];
    }

    redraw();
  };

  // -------------------------------------------------------------
  // Pointer Up (Stroke Finish, Single-Tap Dot Preservation & Cache)
  // -------------------------------------------------------------
  const handlePointerUp = (e) => {
    if (activeTool === 'none') return;
    try {
      canvasRef.current?.releasePointerCapture?.(e.pointerId);
    } catch (_) {}

    hoverStateRef.current.isPenDown = false;
    hoverStateRef.current.isBarrelEraser = false;
    predictedPointsRef.current = [];

    if (currentStrokeRef.current) {
      const stroke = currentStrokeRef.current;
      currentStrokeRef.current = null;

      // Section 6 Rule 2: Every stroke gets a unique random id
      stroke.id =
        stroke.id ||
        (typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : 's_' + Math.random().toString(36).slice(2) + Date.now());
      // Section 6 Rule 7: Stroke stores zoom scale at time of drawing
      stroke.zs = zoom?.z || 1;

      // Preserve quick taps (dotting 'i', periods, colons, decimal points)
      if (!SHAPE_TOOLS.has(stroke.tool) && (stroke.points.length === 1 || (stroke.maxTravel || 0) < 1.8)) {
        stroke.isDot = true;
      }

      // Highlighter: snap to straight horizontal when nearly level
      if (stroke.tool === 'highlighter' && stroke.points.length >= 2) {
        const p0 = stroke.points[0];
        const pLast = stroke.points[stroke.points.length - 1];
        const dx = pLast[0] - p0[0];
        const dy = pLast[1] - p0[1];
        if (Math.abs(dx) > 30 && Math.abs(dy) <= Math.max(14, Math.abs(dx) * 0.08)) {
          stroke.points = [
            [p0[0], p0[1], p0[2]],
            [pLast[0], p0[1], pLast[2]],
          ];
        }
      }

      if (onLiveStroke) onLiveStroke(null);

      if (stroke.targetLayer === 'question' && !isFullStage) {
        const qScale = questionTransform?.scale > 0 ? questionTransform.scale : 1;
        const blockStroke = {
          ...stroke,
          size: stroke.size / qScale,
          points: stroke.points.map(([px, py, pp]) => {
            const [bx, by] = stageToBlockPoint(px, py, questionTransform);
            return [bx, by, pp];
          }),
        };
        onUpdateQuestionStrokes?.([...questionStrokes, blockStroke]);
        onAddStroke?.({ targetLayer: 'question', stroke: blockStroke });
      } else {
        onUpdateStepStrokes?.([...stepStrokes, stroke]);
        onAddStroke?.({ targetLayer: 'step', stroke });
      }
    }

    redraw();
  };

  const handlePointerLeave = () => {
    hoverStateRef.current.visible = false;
    if (currentStrokeRef.current) {
      handlePointerUp({});
    } else {
      redraw();
    }
  };

  // -------------------------------------------------------------
  // Two-Finger Gesture (Section 6, Rule 8: Pinch to Zoom & Pan)
  // -------------------------------------------------------------
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      if (currentStrokeRef.current) {
        currentStrokeRef.current = null;
        if (onLiveStroke) onLiveStroke(null);
        redraw();
      }
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      pinchStartRef.current = {
        dist,
        midX: (t1.clientX + t2.clientX) / 2,
        midY: (t1.clientY + t2.clientY) / 2,
        z: zoom?.z || 1,
        x: zoom?.x || 0,
        y: zoom?.y || 0,
      };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && pinchStartRef.current) {
      e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const start = pinchStartRef.current;
      const scaleFactor = dist / (start.dist || 1);
      const newZ = Math.min(4, Math.max(1, start.z * scaleFactor));

      const dx = (t1.clientX + t2.clientX) / 2 - start.midX;
      const dy = (t1.clientY + t2.clientY) / 2 - start.midY;

      const newX = Math.max(0, Math.min(canvasWidth * (newZ - 1), start.x - dx / newZ));
      const newY = Math.max(0, Math.min(canvasHeight * (newZ - 1), start.y - dy / newZ));

      onZoomChange?.({
        z: Number(newZ.toFixed(2)),
        x: Math.round(newX),
        y: Math.round(newY),
      });
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) {
      pinchStartRef.current = null;
    }
  };

  const commitTextDraft = () => {
    if (!textDraft) return;
    const text = textDraft.value.trim();
    if (text) {
      const targetLayer = isFullStage ? 'step' : (textDraft.x < leftBoundaryX ? 'question' : 'step');
      const stroke = {
        id:
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : 't_' + Math.random().toString(36).slice(2) + Date.now(),
        tool: 'text',
        color: activeColor,
        size: penSize,
        text,
        targetLayer,
        zs: zoom?.z || 1,
        points: [[textDraft.x, textDraft.y, 0.55]],
      };
      if (targetLayer === 'question' && !isFullStage) {
        const qScale = questionTransform?.scale > 0 ? questionTransform.scale : 1;
        const [bx, by] = stageToBlockPoint(textDraft.x, textDraft.y, questionTransform);
        const blockStroke = {
          ...stroke,
          size: stroke.size / qScale,
          points: [[bx, by, 0.55]],
        };
        onUpdateQuestionStrokes?.([...questionStrokes, blockStroke]);
        onAddStroke?.({ targetLayer: 'question', stroke: blockStroke });
      } else {
        onUpdateStepStrokes?.([...stepStrokes, stroke]);
        onAddStroke?.({ targetLayer: 'step', stroke });
      }
    }
    setTextDraft(null);
  };

  return (
    <div style={{ position: 'relative', width: `${canvasWidth}px`, height: `${canvasHeight}px`, pointerEvents: activeTool === 'none' ? 'none' : 'auto' }}>
      <canvas
        ref={canvasRef}
        data-pq-ink-canvas="true"
        width={Math.round(canvasWidth * dpr)}
        height={Math.round(canvasHeight * dpr)}
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          touchAction: 'none',
        }}
        className={`pq-annotation-canvas ${activeTool === 'none' ? 'is-tool-none' : ''} ${activeTool === 'eraser' ? 'is-eraser' : ''} ${activeTool === 'laser' ? 'is-laser' : ''}`}
        onContextMenu={(e) => e.preventDefault()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      />
      {textDraft && (
        <input
          type="text"
          autoFocus
          value={textDraft.value}
          onChange={(e) => setTextDraft({ ...textDraft, value: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commitTextDraft();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              setTextDraft(null);
            }
          }}
          onBlur={commitTextDraft}
          placeholder="Type label…"
          style={{
            position: 'absolute',
            left: `${textDraft.x}px`,
            top: `${textDraft.y}px`,
            minWidth: 160,
            padding: '4px 8px',
            borderRadius: 6,
            border: `2px solid ${activeColor}`,
            background: 'rgba(15, 23, 42, 0.88)',
            color: '#ffffff',
            fontSize: `${Math.max(22, penSize * 4.5)}px`,
            fontWeight: 600,
            fontFamily: 'Inter, system-ui, sans-serif',
            outline: 'none',
            zIndex: 80,
          }}
        />
      )}
    </div>
  );
}
