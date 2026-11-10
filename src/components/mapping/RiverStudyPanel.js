'use client';

import React, { useState } from 'react';
import { LAYER_META, mappableCount } from '@/lib/riverMapLayers';

/**
 * River study flow for the right-hand panel:
 *   1. Locate   – where it starts/ends, course, states (with "Trace the course" on the map)
 *   2. Connect  – tributaries and sangams (tap to highlight on the map) + reference lists
 *   3. Remember – high-yield facts, the UPSC trap, PYQ history
 *   4. Test     – real PYQs + "tap the river on the map" drill
 */

export const RIVER_STUDY_TABS = [
  { id: 'LOCATE', label: 'Locate', icon: '📍' },
  { id: 'CONNECT', label: 'Connect', icon: '🔗' },
  { id: 'REMEMBER', label: 'Remember', icon: '🧠' },
  { id: 'TEST', label: 'Test', icon: '🎯' },
];

const C = {
  ink: '#0f172a',
  body: '#334155',
  muted: '#64748b',
  line: '#e2e8f0',
  soft: '#f8fafc',
  blue: '#1d4ed8',
  blueSoft: '#eff6ff',
  teal: '#0f766e',
  tealSoft: '#f0fdfa',
  amber: '#b45309',
  amberSoft: '#fffbeb',
};

function SectionTitle({ children, hint }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted }}>
        {children}
      </div>
      {hint && <div style={{ fontSize: 11, color: C.muted }}>{hint}</div>}
    </div>
  );
}

function Card({ children, tone = 'plain', style }) {
  const tones = {
    plain: { background: '#ffffff', border: `1px solid ${C.line}` },
    soft: { background: C.soft, border: `1px solid ${C.line}` },
    blue: { background: C.blueSoft, border: '1px solid #bfdbfe' },
    amber: { background: C.amberSoft, border: '1px solid #fde68a' },
    teal: { background: C.tealSoft, border: '1px solid #99f6e4' },
  };
  return (
    <div style={{ borderRadius: 12, padding: '12px 14px', ...tones[tone], ...style }}>
      {children}
    </div>
  );
}

/** Collapsed-by-default reference list with a count. */
function Reference({ title, count, children }) {
  if (!count) return null;
  return (
    <details style={{ border: `1px solid ${C.line}`, borderRadius: 10, background: '#ffffff' }}>
      <summary
        style={{
          cursor: 'pointer',
          padding: '10px 12px',
          fontSize: 12.5,
          fontWeight: 700,
          color: C.ink,
          listStyle: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>{title}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, background: C.soft, borderRadius: 999, padding: '1px 8px' }}>
          {count} ▾
        </span>
      </summary>
      <div style={{ padding: '0 12px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
    </details>
  );
}

function RefRow({ title, sub, tag }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12, borderTop: `1px dashed ${C.line}`, paddingTop: 6 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 700, color: C.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.45 }}>{sub}</div>}
      </div>
      {tag && (
        <span style={{ fontSize: 10.5, fontWeight: 600, padding: '1px 7px', borderRadius: 5, background: C.soft, color: '#475569', flexShrink: 0, alignSelf: 'flex-start' }}>
          {tag}
        </span>
      )}
    </div>
  );
}

function shortLength(len) {
  if (!len) return '';
  return String(len).replace(/\s*\(.*?\)\s*/g, '').trim();
}

function firstClause(text, max = 70) {
  if (!text) return '';
  const first = String(text).split(/[;,(]/)[0].trim();
  return first.length > max ? `${first.slice(0, max - 1)}…` : first;
}

export default function RiverStudyPanel({
  node,
  placeLine,
  keyFacts = [],
  pyqHistory = [],
  pyqCount = 0,
  tab,
  onTabChange,
  layers,
  layersOn = {},
  onToggleLayer,
  highlight,
  onHighlight,
  onTrace,
  onOpenPractice,
  quiz,
  onStartQuiz,
  onNextQuiz,
  onStopQuiz,
  quizAvailable = 0,
}) {
  const rd = node?.riverDetails || {};
  const flows = rd.states?.flowsThrough || [];
  const basinStates = rd.states?.basinStates || [];
  const species = Array.isArray(rd.species) ? rd.species : [];

  const pyqYears = [
    ...new Set(
      pyqHistory
        .flatMap((p) => String(p.yearLabel || '').match(/\b(19|20)\d{2}\b/g) || [])
        .sort()
    ),
  ];

  const isActive = (key) => highlight && highlight.key === key;

  const chipStyle = (active, enabled, color) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    cursor: enabled ? 'pointer' : 'default',
    border: `1.5px solid ${active ? color : enabled ? '#cbd5e1' : C.line}`,
    background: active ? color : '#ffffff',
    color: active ? '#ffffff' : enabled ? C.ink : '#94a3b8',
    transition: 'all 0.15s ease',
  });

  const tribs = layers?.tributaries || [];
  const tribsOnMap = (side) => tribs.filter((t) => t.side === side && t.lines.length);
  const tribsTextOnly = (side) => tribs.filter((t) => t.side === side && !t.lines.length);

  const renderTributary = (t) => {
    const active = isActive(t.id);
    // Violet / green so a highlighted tributary never looks like the selected (blue) river.
    const color = t.side === 'left' ? '#7c3aed' : '#059669';
    return (
      <div key={t.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
        <button
          type="button"
          title="Show on map"
          onClick={() =>
            onHighlight(
              active
                ? null
                : {
                    key: t.id,
                    lines: t.lines,
                    pins: t.point ? [{ lat: t.point[0], lng: t.point[1], label: `${t.name} · ${t.side}-bank` }] : [],
                    color,
                  }
            )
          }
          style={chipStyle(active, true, color)}
        >
          {t.name}
        </button>
        {active && t.note && (
          <div style={{ fontSize: 11.5, color: C.body, lineHeight: 1.45, paddingLeft: 4 }}>{t.note}</div>
        )}
      </div>
    );
  };

  const renderTextOnly = (list) =>
    list.length > 0 && (
      <div style={{ marginTop: 6, fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
        {list.map((t, i) => (
          <span key={t.id}>
            <strong style={{ color: C.body, fontWeight: 600 }}>{t.name}</strong>
            {t.note ? ` — ${t.note}` : ''}
            {i < list.length - 1 ? ' · ' : ''}
          </span>
        ))}
      </div>
    );

  const layerCats = ['tributaries', 'sangams', 'dams', 'parks', 'towns'].filter(
    (cat) => mappableCount(layers, cat) > 0
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Step tabs */}
      <div
        role="tablist"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 4,
          background: '#f1f5f9',
          borderRadius: 10,
          padding: 4,
          position: 'sticky',
          top: 0,
          zIndex: 2,
        }}
      >
        {RIVER_STUDY_TABS.map((t, i) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => onTabChange(t.id)}
              style={{
                border: 'none',
                borderRadius: 7,
                padding: '7px 4px',
                fontSize: 12,
                fontWeight: active ? 800 : 600,
                cursor: 'pointer',
                background: active ? '#ffffff' : 'transparent',
                color: active ? C.blue : C.muted,
                boxShadow: active ? '0 1px 3px rgba(15,23,42,0.12)' : 'none',
              }}
            >
              <span style={{ fontSize: 10, color: active ? C.blue : '#94a3b8', marginRight: 3 }}>{i + 1}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* 1. LOCATE */}
      {tab === 'LOCATE' && (
        <>
          <Card tone="blue">
            <div style={{ fontSize: 13.5, fontWeight: 800, color: C.ink, lineHeight: 1.45 }}>
              {firstClause(rd.origin, 60) || 'Source'} <span style={{ color: C.blue }}>→</span>{' '}
              {firstClause(rd.mouth, 60) || 'Mouth'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {rd.length && (
                <span style={{ fontSize: 11.5, fontWeight: 700, color: C.blue, background: '#dbeafe', borderRadius: 999, padding: '2px 9px' }}>
                  📏 {shortLength(rd.length)}
                </span>
              )}
              {flows.length > 0 && (
                <span style={{ fontSize: 11.5, fontWeight: 700, color: C.blue, background: '#dbeafe', borderRadius: 999, padding: '2px 9px' }}>
                  🗺️ {flows.length} {flows.length === 1 ? 'state' : 'states'}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onTrace}
              style={{
                marginTop: 10,
                width: '100%',
                padding: '9px 12px',
                borderRadius: 9,
                border: 'none',
                background: C.blue,
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              ▶ Trace the course on the map
            </button>
          </Card>

          <Card>
            <SectionTitle hint="tap to pin on map">Start & end</SectionTitle>
            {[
              { key: 'src', label: 'Origin', text: rd.origin, coords: rd.sourceCoords, color: '#0891b2' },
              { key: 'mouth', label: 'Mouth', text: rd.mouth, coords: rd.mouthCoords, color: '#7c3aed' },
            ].map((p) => {
              const can = Array.isArray(p.coords) && p.coords.length === 2;
              const active = isActive(p.key);
              return (
                <button
                  key={p.key}
                  type="button"
                  disabled={!can}
                  onClick={() =>
                    onHighlight(
                      active
                        ? null
                        : { key: p.key, lines: [], pins: [{ lat: p.coords[0], lng: p.coords[1], label: p.label }], color: p.color }
                    )
                  }
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    background: active ? '#f1f5f9' : 'transparent',
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 6px',
                    cursor: can ? 'pointer' : 'default',
                    fontSize: 12.5,
                    color: C.body,
                    lineHeight: 1.5,
                  }}
                >
                  <strong style={{ color: p.color }}>{can ? '◉' : '•'} {p.label}:</strong> {p.text || '—'}
                </button>
              );
            })}
          </Card>

          {flows.length > 0 && (
            <Card>
              <SectionTitle>Flows through (in order)</SectionTitle>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
                {flows.map((st, i) => (
                  <React.Fragment key={st}>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: '#dbeafe', color: '#1e40af' }}>
                      {st}
                    </span>
                    {i < flows.length - 1 && <span style={{ color: '#94a3b8', fontSize: 11 }}>→</span>}
                  </React.Fragment>
                ))}
              </div>
            </Card>
          )}

          {placeLine && (
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, padding: '0 2px' }}>
              <strong style={{ color: C.body }}>Region:</strong> {placeLine}
            </div>
          )}

          <Reference title="🗺️ Basin catchment states" count={basinStates.length}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, paddingTop: 4 }}>
              {basinStates.map((st) => (
                <span key={st} style={{ fontSize: 11.5, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: '#f1f5f9', color: '#475569' }}>
                  {st}
                </span>
              ))}
            </div>
          </Reference>

          <NextStep label="Next: see what joins it" onClick={() => onTabChange('CONNECT')} />
        </>
      )}

      {/* 2. CONNECT */}
      {tab === 'CONNECT' && (
        <>
          {layerCats.length > 0 && (
            <Card tone="soft">
              <SectionTitle hint="one at a time keeps the map clear">Show on map</SectionTitle>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {layerCats.map((cat) => {
                  const meta = LAYER_META[cat];
                  const on = Boolean(layersOn[cat]);
                  return (
                    <button
                      key={cat}
                      type="button"
                      aria-pressed={on}
                      onClick={() => onToggleLayer(cat)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 10px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: `1.5px solid ${on ? meta.color : '#cbd5e1'}`,
                        background: on ? meta.color : '#ffffff',
                        color: on ? '#ffffff' : C.ink,
                      }}
                    >
                      <span aria-hidden>{on ? '☑' : '☐'}</span>
                      {meta.label}
                      <span style={{ opacity: 0.75, fontWeight: 600 }}>{mappableCount(layers, cat)}</span>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          {tribs.length > 0 && (
            <Card>
              <SectionTitle hint={tribs.some((t) => t.lines.length) ? 'tap to see it on the map' : null}>
                Tributaries
              </SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['left', 'right'].map((side) => {
                  const all = tribs.filter((t) => t.side === side);
                  if (!all.length) return null;
                  const onMap = tribsOnMap(side);
                  return (
                    <div key={side}>
                      <div style={{ fontSize: 11.5, fontWeight: 800, color: side === 'left' ? '#7c3aed' : '#059669', marginBottom: 6 }}>
                        {side === 'left' ? `⬅ Left bank (${all.length})` : `Right bank (${all.length}) ➡`}
                      </div>
                      {onMap.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{onMap.map(renderTributary)}</div>
                      )}
                      {renderTextOnly(tribsTextOnly(side))}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          <PinList
            cat="sangams"
            title="🤝 Sangams (confluences)"
            hint="upstream → downstream"
            items={layers?.sangams || []}
            on={Boolean(layersOn.sangams)}
            onToggle={() => onToggleLayer('sangams')}
            highlight={highlight}
            onHighlight={onHighlight}
            defaultOpen
          />
          <PinList cat="dams" title="🏗️ Dams & barrages" items={layers?.dams || []} on={Boolean(layersOn.dams)} onToggle={() => onToggleLayer('dams')} highlight={highlight} onHighlight={onHighlight} />
          <PinList cat="parks" title="🌲 Parks & sanctuaries" items={layers?.parks || []} on={Boolean(layersOn.parks)} onToggle={() => onToggleLayer('parks')} highlight={highlight} onHighlight={onHighlight} />
          <PinList cat="towns" title="🏛️ Cities & towns" items={layers?.towns || []} on={Boolean(layersOn.towns)} onToggle={() => onToggleLayer('towns')} highlight={highlight} onHighlight={onHighlight} />

          <Reference title="🐬 Animals & birds" count={species.length}>
            {species.map((sp) => (
              <RefRow key={sp.name} title={sp.name} sub={sp.role} tag={sp.iucn} />
            ))}
          </Reference>

          <NextStep label="Next: lock in the exam facts" onClick={() => onTabChange('REMEMBER')} />
        </>
      )}

      {/* 3. REMEMBER */}
      {tab === 'REMEMBER' && (
        <>
          {rd.commonMistake && (
            <Card tone="amber">
              <SectionTitle>⚠️ UPSC trap</SectionTitle>
              <div style={{ fontSize: 13, color: '#78350f', lineHeight: 1.55 }}>{rd.commonMistake}</div>
            </Card>
          )}

          {keyFacts.length > 0 && (
            <Card>
              <SectionTitle>High-yield facts</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {keyFacts.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: C.body, lineHeight: 1.52 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.teal, marginTop: 7, flexShrink: 0 }} />
                    <span>
                      {f.label && <strong style={{ color: C.ink }}>{f.label}: </strong>}
                      {f.text}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {pyqHistory.length > 0 && (
            <Card tone="soft">
              <SectionTitle hint={pyqYears.length ? `asked in ${pyqYears.join(', ')}` : null}>In past papers</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {pyqHistory.map((p, i) => (
                  <div key={i} style={{ fontSize: 12.5, color: C.body, lineHeight: 1.5 }}>
                    <strong style={{ color: C.amber }}>{p.yearLabel}:</strong> {p.summary}
                  </div>
                ))}
              </div>
            </Card>
          )}

          <NextStep label="Next: test yourself" onClick={() => onTabChange('TEST')} />
        </>
      )}

      {/* 4. TEST */}
      {tab === 'TEST' && (
        <>
          <Card tone="teal">
            <SectionTitle>🗺️ Map drill</SectionTitle>
            {!quiz?.active ? (
              <>
                <div style={{ fontSize: 12.5, color: C.body, lineHeight: 1.5, marginBottom: 10 }}>
                  {quizAvailable > 0
                    ? `Find ${Math.min(3, quizAvailable)} tributaries of this river by tapping them on the map.`
                    : 'The map drill is available for rivers whose tributaries are drawn on the map (e.g. Ganga, Godavari, Krishna, Cauvery).'}
                </div>
                <button
                  type="button"
                  disabled={quizAvailable === 0}
                  onClick={onStartQuiz}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 9,
                    border: 'none',
                    background: quizAvailable ? C.teal : '#cbd5e1',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: quizAvailable ? 'pointer' : 'default',
                  }}
                >
                  Start map drill
                </button>
                {quiz?.done && (
                  <div style={{ marginTop: 8, fontSize: 12.5, fontWeight: 700, color: C.teal }}>
                    Last drill: {quiz.score} / {quiz.total} correct
                  </div>
                )}
              </>
            ) : (
              <RiverQuizCard quiz={quiz} onNext={onNextQuiz} onStop={onStopQuiz} />
            )}
          </Card>

          <Card tone="amber">
            <SectionTitle>Prelims PYQs</SectionTitle>
            <div style={{ fontSize: 12.5, color: '#78350f', lineHeight: 1.5, marginBottom: 10 }}>
              {pyqCount > 0
                ? `${pyqCount} question${pyqCount === 1 ? '' : 's'} linked to this river${pyqYears.length ? ` (${pyqYears.join(', ')})` : ''}.`
                : 'No past questions linked yet.'}
            </div>
            <button
              type="button"
              disabled={pyqCount === 0}
              onClick={onOpenPractice}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 9,
                border: 'none',
                background: pyqCount ? '#0f172a' : '#cbd5e1',
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 800,
                cursor: pyqCount ? 'pointer' : 'default',
              }}
            >
              Solve PYQs →
            </button>
          </Card>
        </>
      )}
    </div>
  );
}

/**
 * A numbered list whose numbers match the pins on the map. The header switch shows the
 * whole category on the map; tapping a row focuses that one place (its name appears).
 */
function PinList({ cat, title, hint, items, on, onToggle, highlight, onHighlight, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  if (!items.length) return null;
  const meta = LAYER_META[cat];
  const mappable = items.filter((x) => x.pins.length).length;
  const expanded = open || on;
  return (
    <div style={{ border: `1px solid ${C.line}`, borderRadius: 12, background: '#ffffff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px' }}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={expanded}
          style={{ flex: 1, minWidth: 0, textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 12.5, fontWeight: 700, color: C.ink }}
        >
          {title}{' '}
          <span style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>
            ({items.length}) {expanded ? '▴' : '▾'}
          </span>
        </button>
        {mappable > 0 && (
          <button
            type="button"
            aria-pressed={on}
            onClick={onToggle}
            title={on ? 'Hide from map' : 'Show on map'}
            style={{
              flexShrink: 0,
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 6,
              cursor: 'pointer',
              border: `1.5px solid ${on ? meta.color : '#cbd5e1'}`,
              background: on ? meta.color : '#ffffff',
              color: on ? '#ffffff' : C.body,
            }}
          >
            {on ? '☑' : '☐'} Map
          </button>
        )}
      </div>
      {expanded && (
        <div style={{ padding: '0 12px 10px', display: 'flex', flexDirection: 'column' }}>
          {hint && <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{hint}</div>}
          {items.map((x) => {
            const can = x.pins.length > 0;
            const active = highlight && highlight.key === x.id;
            return (
              <button
                key={x.id}
                type="button"
                disabled={!can}
                onClick={() =>
                  onHighlight(
                    active
                      ? null
                      : {
                          key: x.id,
                          lines: x.lines || [],
                          pins: x.pins.map((p) => ({ lat: p.lat, lng: p.lng, label: p.label || x.title })),
                          color: meta.color,
                        }
                  )
                }
                style={{
                  display: 'flex',
                  gap: 9,
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  width: '100%',
                  background: active ? '#f1f5f9' : 'transparent',
                  border: 'none',
                  borderTop: `1px dashed ${C.line}`,
                  borderRadius: active ? 8 : 0,
                  padding: '7px 4px',
                  cursor: can ? 'pointer' : 'default',
                }}
              >
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    color: '#ffffff',
                    background: can ? meta.color : '#e2e8f0',
                    borderRadius: cat === 'parks' || cat === 'sangams' ? 999 : 4,
                    minWidth: 20,
                    height: 20,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                  title={can ? 'On the map' : 'Location not added yet'}
                >
                  {can ? x.n : '–'}
                </span>
                <span style={{ fontSize: 12.5, lineHeight: 1.45, color: C.body, minWidth: 0 }}>
                  <strong style={{ color: C.ink }}>{x.title}</strong>
                  {x.tag && <span style={{ color: C.muted }}> · {x.tag}</span>}
                  {x.sub && <div style={{ fontSize: 11.5, color: C.muted }}>{x.sub}</div>}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NextStep({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        alignSelf: 'flex-end',
        background: 'none',
        border: 'none',
        color: C.blue,
        fontSize: 12.5,
        fontWeight: 800,
        cursor: 'pointer',
        padding: '2px 0',
      }}
    >
      {label} →
    </button>
  );
}

export function RiverQuizCard({ quiz, onNext, onStop }) {
  const q = quiz.questions[quiz.index];
  if (!q) return null;
  const answered = Boolean(quiz.feedback);
  const last = quiz.index >= quiz.questions.length - 1;
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>
        Question {quiz.index + 1} of {quiz.questions.length} · score {quiz.score}
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, lineHeight: 1.5 }}>{q.prompt}</div>
      {!answered ? (
        <div style={{ fontSize: 12, color: C.teal, fontWeight: 700, marginTop: 8 }}>👆 Tap the river on the map</div>
      ) : (
        <div
          style={{
            marginTop: 8,
            fontSize: 12.5,
            fontWeight: 700,
            color: quiz.feedback.correct ? '#047857' : '#b45309',
          }}
        >
          {quiz.feedback.correct ? `✓ Correct — ${q.answerName}` : `✗ That was ${quiz.feedback.tappedName}. The answer is ${q.answerName} (now shown on the map).`}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        {answered && (
          <button
            type="button"
            onClick={onNext}
            style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: 'none', background: C.teal, color: '#ffffff', fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}
          >
            {last ? 'Finish' : 'Next question'}
          </button>
        )}
        <button
          type="button"
          onClick={onStop}
          style={{ padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.line}`, background: '#ffffff', color: C.muted, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
        >
          Stop
        </button>
      </div>
    </div>
  );
}
