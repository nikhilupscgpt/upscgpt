'use client';

import React, { useEffect, useRef, useId } from 'react';

export interface OmrSparkLoaderProps {
  size?: 'full' | 'inline' | 'mini';
  tone?: 'blue' | 'amber';
  showWordmark?: boolean;
  captions?: string[];
  className?: string;
  style?: React.CSSProperties;
}

// ============================================================================
// Exact constants & easing functions ported unchanged from prototype
// ============================================================================
const T = 4200;
const R = 12;
const ROW: [number, number][] = [
  [-48, 0],
  [-16, 0],
  [16, 0],
  [48, 0],
];
const CROSS: [number, number][] = [
  [0, -26], // a top
  [26, 0],  // b right
  [0, 26],  // c bottom
  [-26, 0], // d left
];
const ORDER = [2, 0, 3, 1]; // pencil marks c, a, d, b
const BEAT0 = 250;
const BEAT = 420;
const FILL = 280;
const SPARK =
  'M0,-30 C3,-7 7,-3 30,0 C7,3 3,7 0,30 C-3,7 -7,3 -30,0 C-7,-3 -3,-7 0,-30Z';

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const prog = (t: number, a: number, d: number) => clamp((t - a) / d);
const eIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eOut = (x: number) => 1 - Math.pow(1 - x, 3);
const eIn = (x: number) => x * x * x;
const eBack = (x: number) => {
  const c = 1.7;
  return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
};
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

function labelFor(t: number): string {
  t = ((t % T) + T) % T;
  if (t >= 2000) return '';
  let n = 0;
  for (let k = 0; k < 4; k++) {
    if (t >= BEAT0 + k * BEAT + FILL * 0.6) n = k + 1;
  }
  return 'Q.' + String(97 + Math.min(n, 3)).padStart(3, '0');
}

interface SvgBubbleRefs {
  g: SVGGElement;
  o: SVGCircleElement;
  f: SVGCircleElement;
  l: SVGTextElement | null;
}

interface SvgInstance {
  b: SvgBubbleRefs[];
  s: SVGPathElement;
  glow: SVGCircleElement;
}

export default function OmrSparkLoader({
  size = 'inline',
  tone = 'blue',
  showWordmark = false,
  captions,
  className = '',
  style,
}: OmrSparkLoaderProps) {
  const rawId = useId();
  const id = 'omr_' + rawId.replace(/[^a-zA-Z0-9_-]/g, '');

  const svgRef = useRef<SVGSVGElement | null>(null);
  const qLabelRef = useRef<HTMLDivElement | null>(null);
  const captionRef = useRef<HTMLDivElement | null>(null);

  const isMini = size === 'mini';
  const isFull = size === 'full';

  // Animation Loop via refs (zero React re-renders)
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Detect prefers-reduced-motion
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Build references to animated SVG elements
    const bubbleGroups = Array.from(svg.querySelectorAll<SVGGElement>('[data-b]'));
    const b: SvgBubbleRefs[] = bubbleGroups.map((g) => ({
      g,
      o: g.querySelector<SVGCircleElement>('[data-o]')!,
      f: g.querySelector<SVGCircleElement>('[data-f]')!,
      l: g.querySelector<SVGTextElement>('[data-l]'),
    }));
    const s = svg.querySelector<SVGPathElement>('[data-s]')!;
    const glow = svg.querySelector<SVGCircleElement>('[data-glow]')!;

    const inst: SvgInstance = { b, s, glow };

    const render = (currentTime: number) => {
      const t = ((currentTime % T) + T) % T;
      const gather = eIO(prog(t, 2000, 450));
      const pinch = eIn(prog(t, 2450, 330));
      const spark = eBack(prog(t, 2450, 420));
      const fold = eIn(prog(t, 3600, 250));
      const pop = eBack(prog(t, 3750, 450));
      const reborn = t >= 3600;

      inst.b.forEach((item, i) => {
        let x: number, y: number, sc: number, fr: number;
        if (!reborn) {
          const beat = ORDER.indexOf(i);
          fr = R * eOut(prog(t, BEAT0 + beat * BEAT, FILL));
          x = lerp(ROW[i][0], CROSS[i][0], gather) * (1 - pinch * 0.35);
          y = lerp(ROW[i][1], CROSS[i][1], gather) * (1 - pinch * 0.35);
          sc = 1 - pinch;
        } else {
          fr = 0;
          x = lerp(0, ROW[i][0], pop);
          y = 0;
          sc = t < 3750 ? 0 : clamp(pop * 1.1);
        }

        item.g.setAttribute(
          'transform',
          `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${Math.max(0, sc).toFixed(3)})`
        );
        item.f.setAttribute('r', fr.toFixed(2));
        if (item.l) {
          item.l.style.fill =
            fr > R * 0.6
              ? 'var(--ink-on-blue, #050814)'
              : 'var(--muted, var(--text-muted, #8b97b8))';
        }
        item.o.setAttribute('stroke-opacity', fr > R * 0.95 ? '0' : '1');
      });

      const sScale = t < 2450 ? 0 : t < 3600 ? spark : 1 - fold;
      const breathe =
        t > 2870 && t < 3600 ? 1 + 0.05 * Math.sin(((t - 2870) / 730) * Math.PI) : 1;
      const rot =
        t < 3600
          ? lerp(-45, 0, prog(t, 2450, 420)) + 12 * eIO(prog(t, 2870, 730))
          : lerp(12, 57, fold);

      inst.s.setAttribute(
        'transform',
        `rotate(${rot.toFixed(2)}) scale(${Math.max(0, sScale * breathe).toFixed(3)})`
      );
      inst.glow.setAttribute(
        'opacity',
        (t < 3600 ? spark * 0.9 : 1 - fold).toFixed(3)
      );
      return t;
    };

    // If reduced motion is requested, render the still frame at t=3200 and stop
    if (prefersReduced) {
      render(3200);
      if (qLabelRef.current) qLabelRef.current.textContent = '';
      return;
    }

    let rAFId: number;
    let startTime = performance.now();
    let prevLoop = 0;
    let loopIdx = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      render(elapsed);

      // Question counter Q.097 -> Q.100
      if (qLabelRef.current && !isMini) {
        qLabelRef.current.textContent = labelFor(elapsed);
      }

      // Rotate caption once per loop
      if (captions && captions.length > 0 && captionRef.current) {
        const currentLoop = Math.floor(elapsed / T);
        if (currentLoop !== prevLoop) {
          prevLoop = currentLoop;
          loopIdx++;
          captionRef.current.textContent = captions[loopIdx % captions.length];
        }
      }

      rAFId = requestAnimationFrame(tick);
    };

    rAFId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rAFId);
    };
  }, [isMini, captions]);

  // Tone colors (blue vs amber)
  const isAmber = tone === 'amber';
  const colorA = isAmber ? '#fbbf24' : '#60a5fa';
  const colorB = isAmber ? '#f97316' : '#38bdf8';
  const glowColor = isAmber ? '#f59e0b' : '#38bdf8';

  const svgContent = (
    <svg
      ref={svgRef}
      viewBox="-80 -44 160 88"
      style={{
        width: isMini ? '34px' : '100%',
        height: isMini ? '14px' : 'auto',
        overflow: 'visible',
        display: 'block',
      }}
    >
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style={{ stopColor: colorA }} />
          <stop offset="100%" style={{ stopColor: colorB }} />
        </linearGradient>
        <radialGradient id={`${id}g`}>
          <stop offset="0%" style={{ stopColor: glowColor, stopOpacity: 0.55 }} />
          <stop offset="100%" style={{ stopColor: glowColor, stopOpacity: 0 }} />
        </radialGradient>
      </defs>

      {/* Radial Sparkle Glow */}
      <circle data-glow r="44" style={{ fill: `url(#${id}g)` }} opacity="0" />

      {/* 4 OMR Bubbles: a, b, c, d */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i} data-b={i}>
          <circle
            data-o
            r={R}
            style={{
              fill: 'none',
              stroke: isMini ? '#ffffff' : 'var(--muted, var(--text-muted, #8b97b8))',
              strokeWidth: isMini ? 3 : 1.6,
            }}
          />
          <circle
            data-f
            r="0"
            style={{
              fill: isMini ? '#ffffff' : `url(#${id}f)`,
            }}
          />
          {!isMini && (
            <text
              data-l
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                fontFamily: 'JetBrains Mono, ui-monospace, Menlo, monospace',
                fontWeight: 700,
                fontSize: 10,
                fill: 'var(--muted, var(--text-muted, #8b97b8))',
                userSelect: 'none',
              }}
            >
              {'abcd'[i]}
            </text>
          )}
        </g>
      ))}

      {/* ✦ 4-Point Logo Spark */}
      <path
        data-s
        d={SPARK}
        style={{
          fill: isMini ? '#ffffff' : `url(#${id}f)`,
        }}
        transform="scale(0)"
      />
    </svg>
  );

  if (isMini) {
    return (
      <span
        role="status"
        aria-label="Loading"
        className={`omr-spark-mini ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '34px',
          height: '14px',
          verticalAlign: 'middle',
          ...style,
        }}
      >
        {svgContent}
      </span>
    );
  }

  if (isFull) {
    return (
      <div
        role="status"
        aria-label="Loading"
        className={`omr-spark-full ${className}`}
        style={{
          position: 'fixed',
          inset: 0,
          background:
            'radial-gradient(120% 90% at 50% 40%, var(--bg-secondary, #0b1124), var(--bg-primary, #050814) 70%)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          color: 'var(--fg, var(--text-primary, #ffffff))',
          ...style,
        }}
      >
        <div
          style={{
            display: 'grid',
            justifyItems: 'center',
            gap: '12px',
            width: 'min(320px, 90%)',
          }}
        >
          {/* Question counter */}
          <div
            ref={qLabelRef}
            style={{
              fontFamily: 'JetBrains Mono, ui-monospace, Menlo, monospace',
              fontWeight: 700,
              fontSize: '12px',
              lineHeight: 1,
              letterSpacing: '0.12em',
              color: 'var(--muted, var(--text-muted, #8b97b8))',
              height: '12px',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            Q.097
          </div>

          {svgContent}

          {/* Wordmark */}
          {showWordmark && (
            <div
              style={{
                fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
                fontWeight: 800,
                fontSize: '26px',
                lineHeight: 1,
                letterSpacing: '-0.02em',
                color: 'var(--fg, var(--text-primary, #ffffff))',
                marginTop: '4px',
              }}
            >
              upsc
              <span style={{ color: isAmber ? '#f59e0b' : '#3b82f6' }}>gpt</span>
              <span
                style={{
                  fontSize: '20px',
                  marginLeft: '4px',
                  verticalAlign: '1px',
                  color: isAmber ? '#fbbf24' : '#60a5fa',
                }}
              >
                ✦
              </span>
            </div>
          )}

          {/* Captions */}
          {captions && captions.length > 0 && (
            <div
              ref={captionRef}
              style={{
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                fontWeight: 500,
                fontSize: '13.5px',
                lineHeight: 1.3,
                color: 'var(--muted, var(--text-muted, #8b97b8))',
                minHeight: '20px',
                textAlign: 'center',
                transition: 'opacity 0.25s ease',
                marginTop: '4px',
              }}
            >
              {captions[0]}
            </div>
          )}
        </div>
      </div>
    );
  }

  // size === "inline"
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`omr-spark-inline ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        maxWidth: '100%',
        color: 'var(--fg, var(--text-primary, #ffffff))',
        ...style,
      }}
    >
      <div
        ref={qLabelRef}
        style={{
          fontFamily: 'JetBrains Mono, ui-monospace, Menlo, monospace',
          fontWeight: 700,
          fontSize: '11px',
          lineHeight: 1,
          letterSpacing: '0.12em',
          color: 'var(--muted, var(--text-muted, #8b97b8))',
          height: '11px',
          fontVariantNumeric: 'tabular-nums',
        }}
      />
      <div style={{ width: 'min(180px, 100%)' }}>{svgContent}</div>

      {showWordmark && (
        <div
          style={{
            fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
            fontWeight: 800,
            fontSize: '18px',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          upsc<span style={{ color: isAmber ? '#f59e0b' : '#3b82f6' }}>gpt</span>
        </div>
      )}

      {captions && captions.length > 0 && (
        <div
          ref={captionRef}
          style={{
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            fontWeight: 500,
            fontSize: '12px',
            color: 'var(--muted, var(--text-muted, #8b97b8))',
            textAlign: 'center',
          }}
        >
          {captions[0]}
        </div>
      )}
    </div>
  );
}
