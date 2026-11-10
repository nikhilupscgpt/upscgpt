'use client';

/**
 * The right-panel slide (heading + content) shared by the Lecture Studio and the
 * Recording Studio presenters, so both look and read the same.
 *
 * Text sizes come from CSS (present.css, "Slide typography"), which scales them
 * with the stage width and the A+ button.
 */
import { Fragment, useLayoutEffect } from 'react';

/**
 * Shrinks text a little (down to 82%) when a panel's content doesn't fit, so long
 * questions stay on screen instead of scrolling mid-recording. Sets `--fit` on the
 * element matching `selector`; CSS multiplies font sizes by it.
 */
export function useAutoFit(selector, deps) {
  useLayoutEffect(() => {
    const el = document.querySelector(selector);
    if (!el) return undefined;
    const fit = () => {
      let f = 1;
      el.style.setProperty('--fit', '1');
      while (el.scrollHeight > el.clientHeight + 2 && f > 0.82) {
        f = Math.round((f - 0.03) * 100) / 100;
        el.style.setProperty('--fit', String(f));
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
import { CheckCircle2, XCircle, ZoomIn, ZoomOut } from 'lucide-react';
import { parseStem } from '@/lib/pyqStemParser';

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

/** "**bold**" → <strong>; everything else stays plain text. */
function Inline({ text }) {
  const parts = String(text ?? '').split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    /^\*\*[^*]+\*\*$/.test(p) ? <strong key={i}>{p.slice(2, -2)}</strong> : <Fragment key={i}>{p}</Fragment>
  );
}

/**
 * Plain text with light markdown (## headings, - bullets, blank-line paragraphs).
 * Long single paragraphs are split into readable chunks of ~3 sentences.
 */
export function Prose({ text, className = 'sb-prose', title = '' }) {
  const raw = String(text ?? '').replace(/\r/g, '').trim();
  if (!raw) return null;
  const lines = raw.split('\n');
  // A heading that only repeats the slide's title ("## Executive Summary: <title> (UPSC Context)") is dropped.
  const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const titleKey = norm(title);
  const blocks = [];
  let para = [];
  let list = [];
  const flushPara = () => {
    if (para.length) blocks.push({ t: 'p', text: para.join(' ') });
    para = [];
  };
  const flushList = () => {
    if (list.length) blocks.push({ t: 'ul', items: list });
    list = [];
  };
  for (const l of lines) {
    const line = l.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }
    const h = line.match(/^#{1,4}\s+(.*)$/);
    const b = line.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (h) {
      flushPara();
      flushList();
      const headText = h[1].replace(/:$/, '').trim();
      if (!(titleKey && norm(headText).includes(titleKey))) blocks.push({ t: 'h', text: headText });
    } else if (b) {
      flushPara();
      list.push(b[1]);
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();

  // Split very long paragraphs so they read as paragraphs, not a wall.
  const out = [];
  for (const blk of blocks) {
    if (blk.t !== 'p' || blk.text.length < 420) {
      out.push(blk);
      continue;
    }
    const sentences = blk.text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [blk.text];
    for (let i = 0; i < sentences.length; i += 3) out.push({ t: 'p', text: sentences.slice(i, i + 3).join('').trim() });
  }

  return (
    <div className={className}>
      {out.map((blk, i) =>
        blk.t === 'h' ? (
          <h3 key={i} className="sb-prose-h">
            <Inline text={blk.text} />
          </h3>
        ) : blk.t === 'ul' ? (
          <ul key={i} className="sb-prose-ul">
            {blk.items.map((it, k) => (
              <li key={k}>
                <Inline text={it} />
              </li>
            ))}
          </ul>
        ) : (
          <p key={i}>
            <Inline text={blk.text} />
          </p>
        )
      )}
    </div>
  );
}

/**
 * "[Grounds of Disqualification] Voluntary Resignation: In Ravi S. Naik…" →
 * { group: 'Grounds of Disqualification', lead: 'Voluntary Resignation', text: 'In Ravi S. Naik…' }
 */
export function splitPoint(raw) {
  let s = String(raw ?? '').trim();
  let group = '';
  const g = s.match(/^\[([^\]]+)\]\s*(?:\(([^)]+)\)\s*)?/);
  if (g) {
    group = g[2] ? `${g[1]} · ${g[2]}` : g[1];
    s = s.slice(g[0].length);
  }
  let lead = '';
  const colon = s.indexOf(': ');
  if (colon > 0 && colon <= 80) {
    lead = s.slice(0, colon);
    s = s.slice(colon + 2);
  }
  return { group, lead, text: s };
}

/** A question laid out like the left panel: stem, numbered statements, prompt, options. */
export function QuestionBlock({ stem, options }) {
  let text = String(stem ?? '');
  let opts = Array.isArray(options) ? options : [];
  // Options written inside the stem: "(a) 1 only\n(b) 2 only…" or inline "(a) … (b) …".
  if (!opts.length) {
    const m = text.match(/\s*\(a\)\s[\s\S]*$/i);
    if (m && /\(b\)/i.test(m[0])) {
      opts = m[0]
        .split(/\s*\(([a-d])\)\s+/i)
        .slice(1)
        .reduce((acc, cur, i, arr) => (i % 2 === 0 ? [...acc, { label: cur.toUpperCase(), text: (arr[i + 1] || '').trim() }] : acc), []);
      text = text.slice(0, m.index);
    }
  }
  // Inline statements "…statements: 1. The law… 2. The law…" → one per line.
  text = text.replace(/([:.?])\s+(?=(?:[1-6]|I{1,3}|IV)\.\s+[A-Z])/g, '$1\n');
  const blocks = parseStem(text);
  return (
    <div className="sb-question">
      {blocks.map((b, i) =>
        b.type === 'stmts' ? (
          <ol key={i} className="sb-q-stmts">
            {b.items.map((it, k) => (
              <li key={k}>
                <span className="sb-q-key">{it.key}.</span>
                <span>{it.text}</span>
              </li>
            ))}
          </ol>
        ) : b.type === 'table' ? null : (
          <p key={i} className={b.isPrompt ? 'sb-q-ask' : 'sb-q-lead'}>
            {b.text}
          </p>
        )
      )}
      {opts.length > 0 && (
        <div className="sb-q-opts">
          {opts.map((o) => (
            <div key={o.label} className="sb-q-opt">
              <span className="sb-q-opt-label">({String(o.label).toUpperCase()})</span>
              <span>{o.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function isCorrectVerdict(v) {
  const s = String(v || '').toLowerCase();
  return s.includes('correct') && !s.includes('incorrect') && !s.includes('not correct') && !s.includes('false');
}

// ---------------------------------------------------------------------------
// Heading
// ---------------------------------------------------------------------------

export function SlideHead({ step }) {
  if (!step || step.type === 'scratchpad') return null;
  return (
    <div className="pq-present-step-head sb-head">
      {step.badge && <span className="pq-present-step-badge sb-badge">{step.badge}</span>}
      {step.title && <h1 className="pq-present-step-title sb-title">{step.title}</h1>}
      {step.subtitle && <p className="pq-present-step-sub sb-sub">{step.subtitle}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// River helpers (spotlight numbers must match StudioPresenterMap)
// ---------------------------------------------------------------------------

function RiverItem({ n, title, tag, note, active, onClick, tone }) {
  return (
    <button type="button" className={`sb-river-item tone-${tone} ${active ? 'is-active' : ''}`} onClick={onClick}>
      {n != null && <span className="sb-river-n">{n}</span>}
      <span className="sb-river-text">
        <span className="sb-river-title">
          {title}
          {tag && <span className="sb-river-tag">{tag}</span>}
        </span>
        {note && <span className="sb-river-note">{note}</span>}
      </span>
    </button>
  );
}

function RiverSection({ title, hint, tone, children }) {
  return (
    <section className={`sb-river-section tone-${tone}`}>
      <div className="sb-river-head">
        <span className="sb-label">{title}</span>
        {hint && <span className="sb-river-hint">{hint}</span>}
      </div>
      <div className="sb-river-list">{children}</div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Body
// ---------------------------------------------------------------------------

/**
 * @param step            current slide step (from pyqSlideDeck)
 * @param q               current deck item (question / topic / place)
 * @param steps           all steps of this item (topic overview lists them)
 * @param spotlightIndex  map spotlight number (river/place decks)
 * @param onSpotlight     (n) => void, toggles a map spotlight
 */
export default function SlideBody({ step, q, steps = [], spotlightIndex, onSpotlight, isZoomedImage, onToggleZoom }) {
  if (!step) return null;
  const spot = (n) => () => onSpotlight?.(n);

  switch (step.type) {
    case 'image':
      if (!step.imageUrl) return null;
      return (
        <div className="pq-present-image-container">
          <div className={`pq-present-image-wrap ${isZoomedImage ? 'is-zoomed' : ''}`} onClick={onToggleZoom}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={step.imageUrl} alt={step.caption || 'Diagram'} className="pq-present-img" />
          </div>
          <div className="pq-present-image-caption">
            <span>{step.caption || step.title}</span>
            <span className="pq-present-zoom-hint">
              {isZoomedImage ? <ZoomOut size={13} /> : <ZoomIn size={13} />}
              <span>Press Z to {isZoomedImage ? 'reset' : 'zoom'}</span>
            </span>
          </div>
        </div>
      );

    case 'sketch':
      return (
        <div className="pq-present-sketch-slide">
          <span className="pq-sketch-watermark">Whiteboard · draw freely</span>
        </div>
      );

    case 'intro':
      // The subtitle line under the heading says it all; keep the space clean for pen notes.
      return null;

    case 'breakdown':
    case 'statement_breakdown':
      return (
        <div className="sb-stack">
          {(step.items || []).map((item, i) => {
            const ok = isCorrectVerdict(item.verdict);
            const isStmt = step.type === 'statement_breakdown' || item.statementNo != null;
            const label = isStmt ? `Statement ${item.statementNo || i + 1}` : `Option (${String(item.label || i + 1).toUpperCase()})`;
            return (
              <article key={i} className={`sb-card sb-verdict ${ok ? 'is-correct' : 'is-wrong'}`}>
                <div className="sb-verdict-head">
                  <span className="sb-verdict-label">{label}</span>
                  <span className="sb-verdict-pill">
                    {ok ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {ok ? 'Correct' : 'Wrong'}
                  </span>
                  {item.reference && <span className="sb-ref">{item.reference}</span>}
                </div>
                {item.text && <p className="sb-verdict-quote">{item.text}</p>}
                {item.explanation && <p className="sb-text">{item.explanation}</p>}
              </article>
            );
          })}
        </div>
      );

    case 'answer':
      return (
        <article className="sb-card sb-answer">
          <div className="sb-answer-head">
            <span className="sb-answer-tick">
              <CheckCircle2 size={22} />
            </span>
            <span className="sb-label">Correct answer · as per the UPSC key</span>
          </div>
          <Prose text={step.explanationText} />
        </article>
      );

    case 'keywords':
      return (
        <div className="sb-stack">
          {(step.keywords || []).map((kw, i) => (
            <article key={i} className="sb-card sb-term">
              <h3 className="sb-card-title">{String(kw.term || '').replace(/^#+/, '')}</h3>
              {kw.shortNote && <p className="sb-text">{kw.shortNote}</p>}
            </article>
          ))}
        </div>
      );

    case 'valueAddition': {
      const pts = (step.points || []).map(splitPoint);
      return (
        <div className="sb-stack">
          {pts.map((p, i) => (
            <article key={i} className="sb-card sb-point">
              {p.group && (i === 0 || pts[i - 1].group !== p.group) && <div className="sb-label">{p.group}</div>}
              {p.lead && <h3 className="sb-card-title">{p.lead}</h3>}
              <p className="sb-text">{p.text}</p>
            </article>
          ))}
        </div>
      );
    }

    case 'inNews': {
      const n = typeof step.inNews === 'string' ? { headline: step.inNews } : step.inNews || {};
      const meta = [n.source, n.date].filter(Boolean).join(' · ');
      return (
        <article className="sb-card sb-news">
          {meta && <div className="sb-label">{meta}</div>}
          {n.headline && <h3 className="sb-card-title">{n.headline}</h3>}
          {(n.relevance || n.context) && <Prose text={n.relevance || n.context} />}
        </article>
      );
    }

    case 'similarPyq': {
      const s = typeof step.similarPyq === 'string' ? { stem: step.similarPyq } : step.similarPyq || {};
      return (
        <div className="sb-stack">
          <article className="sb-card sb-pyq">
            <div className="sb-label">{[s.examName || 'UPSC CSE Pre', s.examYear].filter(Boolean).join(' ')}</div>
            <QuestionBlock stem={s.stem} options={s.options} />
          </article>
          {s.keyTakeaway && (
            <aside className="sb-note">
              <span className="sb-label">What changed</span>
              <p className="sb-text">{s.keyTakeaway.replace(/^Notice the evolution:\s*/i, '')}</p>
            </aside>
          )}
        </div>
      );
    }

    case 'table': {
      const t = step.tableData;
      if (!t?.headers) return null;
      return (
        <div className="sb-card sb-table-wrap">
          <table className="sb-table">
            <thead>
              <tr>
                {t.headers.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(t.rows || []).map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'topic_spotlight': {
      // The summary is already on the left; here, show what this lesson covers.
      const next = steps.filter((st) => st.id !== step.id && st.label);
      if (!next.length) return null;
      return (
        <article className="sb-card sb-outline">
          <div className="sb-label">In this lesson</div>
          <ol>
            {next.map((st) => (
              <li key={st.id}>{st.title || st.label}</li>
            ))}
          </ol>
        </article>
      );
    }

    case 'topic_evolution':
    case 'topic_value_add':
    case 'topic_facts':
    case 'topic_questions':
      return (
        <article className="sb-card">
          <Prose text={step.content || step.summary} title={q?.title} />
        </article>
      );

    // ---------------- River decks ----------------
    case 'river_course': {
      const rd = step.riverDetails || {};
      const facts = [
        ['Length', rd.length],
        ['Rises at', rd.origin],
        ['Ends at', rd.mouth],
        ['Type', q?.placeType],
      ].filter(([, v]) => v);
      return (
        <div className="sb-stack">
          <dl className="sb-facts">
            {facts.map(([k, v]) => (
              <div key={k} className="sb-fact">
                <dt className="sb-label">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          {rd.states && (
            <article className="sb-card">
              {rd.states.flowsThrough?.length > 0 && (
                <div className="sb-chip-row">
                  <span className="sb-label">Flows through</span>
                  <div className="sb-chips">
                    {rd.states.flowsThrough.map((st) => (
                      <span key={st} className="sb-chip is-strong">
                        {st}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {rd.states.basinStates?.length > 0 && (
                <div className="sb-chip-row">
                  <span className="sb-label">Basin also covers</span>
                  <div className="sb-chips">
                    {rd.states.basinStates.map((st) => (
                      <span key={st} className="sb-chip">
                        {st}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>
          )}
        </div>
      );
    }

    case 'river_left_tributaries':
    case 'river_right_tributaries': {
      const left = step.type === 'river_left_tributaries';
      const list = (left ? step.riverDetails?.tributaries?.leftBank : step.riverDetails?.tributaries?.rightBank) || [];
      if (!list.length) return <p className="sb-empty">No {left ? 'left' : 'right'}-bank tributaries listed for this river.</p>;
      return (
        <RiverSection
          title={left ? 'Joins from the left' : 'Joins from the right'}
          hint={`Tap a river or press 1–${Math.min(list.length, 9)} to show it on the map`}
          tone={left ? 'left' : 'right'}
        >
          {list.map((t, i) => (
            <RiverItem
              key={i}
              n={i + 1}
              title={t.name}
              note={t.note}
              tone={left ? 'left' : 'right'}
              active={spotlightIndex === i + 1}
              onClick={spot(i + 1)}
            />
          ))}
        </RiverSection>
      );
    }

    case 'river_dams_confluences': {
      const rd = step.riverDetails || {};
      return (
        <div className="sb-stack">
          {(rd.confluences || []).length > 0 && (
            <RiverSection title="Sangams" hint="Purple pins on the map" tone="sangam">
              {rd.confluences.map((c, i) => (
                <RiverItem
                  key={i}
                  n={i + 1}
                  title={c.sangam}
                  note={c.note}
                  tone="sangam"
                  active={spotlightIndex === i + 1}
                  onClick={spot(i + 1)}
                />
              ))}
            </RiverSection>
          )}
          {(rd.dams || []).length > 0 && (
            <RiverSection title="Major dams" hint="Blue pins on the map" tone="dam">
              {rd.dams.map((d, i) => (
                <RiverItem
                  key={i}
                  n={null}
                  title={d.name}
                  tag={d.state}
                  note={d.type}
                  tone="dam"
                  active={spotlightIndex === 6 + i + 1}
                  onClick={spot(6 + i + 1)}
                />
              ))}
            </RiverSection>
          )}
        </div>
      );
    }

    case 'river_ecology_towns': {
      const rd = step.riverDetails || {};
      const parks = rd.protectedAreas || [];
      const townBase = parks.length || 6;
      return (
        <div className="sb-stack">
          {parks.length > 0 && (
            <RiverSection title="National parks & sanctuaries" tone="park">
              {parks.map((p, i) => (
                <RiverItem
                  key={i}
                  n={i + 1}
                  title={p.name}
                  tag={p.state}
                  note={p.relation}
                  tone="park"
                  active={spotlightIndex === i + 1}
                  onClick={spot(i + 1)}
                />
              ))}
            </RiverSection>
          )}
          {(rd.towns || []).length > 0 && (
            <RiverSection title="Cities on its banks" tone="town">
              {rd.towns.map((t, i) => (
                <RiverItem
                  key={i}
                  n={townBase + i + 1}
                  title={t.name}
                  tag={t.state}
                  note={t.significance}
                  tone="town"
                  active={spotlightIndex === townBase + i + 1}
                  onClick={spot(townBase + i + 1)}
                />
              ))}
            </RiverSection>
          )}
          {(rd.species || rd.wildlife || []).length > 0 && (
            <article className="sb-card">
              <div className="sb-label">Wildlife</div>
              <p className="sb-text">
                {(rd.species || rd.wildlife).map((s) => (typeof s === 'string' ? s : s.name)).filter(Boolean).join(' · ')}
              </p>
            </article>
          )}
        </div>
      );
    }

    // ---------------- Place decks ----------------
    case 'mapping_overview': {
      const facts = [
        ['Where', step.locationText],
        ['Coordinates', q?.lat && q?.lng ? `${Number(q.lat).toFixed(2)}° N, ${Number(q.lng).toFixed(2)}° E` : null],
        ['Type', step.categories || q?.placeType],
      ].filter(([, v]) => v);
      const first = Array.isArray(q?.staticFacts) ? q.staticFacts[0] : null;
      return (
        <div className="sb-stack">
          <dl className="sb-facts">
            {facts.map(([k, v]) => (
              <div key={k} className="sb-fact">
                <dt className="sb-label">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          {first && (
            <article className="sb-card">
              <p className="sb-text">{first}</p>
            </article>
          )}
        </div>
      );
    }

    case 'mapping_facts':
      return (
        <ol className="sb-numbered">
          {(step.facts || []).map((f, i) => (
            <li key={i} className="sb-card">
              <span className="sb-numbered-n">{i + 1}</span>
              <p className="sb-text">{typeof f === 'string' ? f : f?.text || f?.fact || ''}</p>
            </li>
          ))}
        </ol>
      );

    case 'mapping_angle': {
      // upscAngle is usually { framing, distractorPool[], preferredFormat }, sometimes plain text.
      const a = step.upscAngle;
      const angle = a && typeof a === 'object' ? a : a ? { framing: String(a) } : null;
      const pool = Array.isArray(angle?.distractorPool) ? angle.distractorPool : [];
      return (
        <div className="sb-stack">
          {angle?.framing && (
            <article className="sb-card">
              <div className="sb-label">How UPSC asks it</div>
              <p className="sb-text">{angle.framing}</p>
              {angle.preferredFormat && (
                <p className="sb-meta">Usual format: {String(angle.preferredFormat).replace(/\s*\|\s*/g, ', ')}</p>
              )}
            </article>
          )}
          {pool.length > 0 && (
            <article className="sb-card sb-trap">
              <div className="sb-label">Options that look right but aren&apos;t</div>
              <div className="sb-chips">
                {pool.map((d) => (
                  <span key={String(d)} className="sb-chip">
                    {String(d)}
                  </span>
                ))}
              </div>
            </article>
          )}
          {step.newsHook && (
            <article className="sb-card sb-news">
              <div className="sb-label">Why it was in the news</div>
              <p className="sb-text">{typeof step.newsHook === 'string' ? step.newsHook : step.newsHook?.headline || ''}</p>
            </article>
          )}
        </div>
      );
    }

    case 'mapping_pyq': {
      const p = step.pyq || {};
      return (
        <div className="sb-stack">
          <article className="sb-card sb-pyq">
            <div className="sb-label">{[p.exam || 'UPSC CSE Pre', p.examYear].filter(Boolean).join(' ')}</div>
            <QuestionBlock stem={p.stem} options={p.options} />
          </article>
          {(p.correctLabel || p.answerText) && (
            <article className="sb-card sb-answer">
              <div className="sb-label">Answer{p.correctLabel ? `: (${p.correctLabel})` : ''}</div>
              {p.answerText && <p className="sb-text">{p.answerText}</p>}
            </article>
          )}
        </div>
      );
    }

    default:
      return null;
  }
}
