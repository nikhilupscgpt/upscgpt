/*
 * dash-shim.js — a small stand-in for the Claude dashboard runtime, so the page runs as a plain website.
 *
 * Implements the parts of the `dash` API the page uses:
 *   dash.data(id)            -> {status, data}  for a data source or a calculation
 *   dash.calc(id, {inputs, fn})  declare a value computed from sources
 *   dash.draw(name, fn)      register a drawing for every [data-draw="name"] element; dash.draw(name) re-runs it
 *   dash.params() / dash.setParams({...}) / dash.resetParams()   view state (selected subject / theme)
 *   dash.setLink(name)       keeps the current page in the URL hash
 *   dash.colors              series colours (CSS variables defined in tokens.css)
 *
 * Data comes from window.PQ_DATA, which data/data.js sets: {questions: [...rows], insights: {...}}.
 */
(function () {
  'use strict';
  const sources = {};
  const calcs = {};
  const draws = new Map();
  const onDataFns = [];
  const STORE_KEY = 'pq-dashboard-params';
  let params = {};
  try { params = JSON.parse(localStorage.getItem(STORE_KEY) || '{}') || {}; } catch (e) { params = {}; }
  const saveParams = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(params)); } catch (e) { /* storage is optional */ } };

  function loadSources() {
    const raw = window.PQ_DATA || {};
    for (const [id, value] of Object.entries(raw)) {
      sources[id] = {status: 'ok', data: value, columns: Array.isArray(value) && value[0] ? Object.keys(value[0]) : []};
    }
  }

  function data(id) {
    if (sources[id]) return sources[id];
    const c = calcs[id];
    if (!c) return {status: Object.keys(sources).length ? 'missing' : 'loading', data: []};
    if (!c.cache) {
      const inputs = c.inputs.map((i) => data(i));
      const bad = inputs.find((x) => x.status !== 'ok');
      if (bad) return {status: bad.status, data: null};
      try {
        c.cache = {status: 'ok', data: c.fn(...inputs.map((x) => x.data))};
      } catch (e) {
        console.error('calculation failed:', id, e);
        c.cache = {status: 'error', data: null, message: String(e)};
      }
    }
    return c.cache;
  }

  const isVisible = (el) => !el.closest('[hidden]');
  const mounted = new WeakMap();

  function runDraw(name) {
    const d = draws.get(name);
    if (!d) return;
    document.querySelectorAll('[data-draw="' + CSS.escape(name) + '"]').forEach((el) => {
      if (!isVisible(el)) return;
      try {
        if (typeof d === 'function') {
          d(el);
        } else {
          let s = mounted.get(el);
          if (!s) { el.replaceChildren(); s = {made: d.mount ? d.mount(el) : undefined}; mounted.set(el, s); }
          if (d.update) d.update(el, s.made);
        }
      } catch (e) {
        console.error('drawing failed:', name, e);
      }
    });
  }

  let queued = false;
  function renderAll() {
    queued = false;
    for (const fn of onDataFns) { try { fn(); } catch (e) { console.error(e); } }
    for (const name of draws.keys()) runDraw(name);
  }
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(renderAll);
  }

  window.dash = {
    data,
    calc(id, opts) { calcs[id] = {inputs: opts.inputs || [], fn: opts.fn, title: opts.title, description: opts.description}; },
    loader() { /* not needed: data is bundled */ },
    draw(name, fn) {
      if (fn === undefined) { runDraw(name); return; }
      draws.set(name, fn);
    },
    onData(fn) { onDataFns.push(fn); },
    params() { return {...params}; },
    setParams(p) {
      for (const [k, v] of Object.entries(p || {})) { if (v == null) delete params[k]; else params[k] = v; }
      saveParams();
      schedule();
    },
    resetParams() { params = {}; saveParams(); schedule(); },
    setLink(name) { try { history.replaceState(null, '', name ? '#' + name : location.pathname + location.search); } catch (e) { /* file:// may refuse */ } },
    refresh() { /* bundled data never changes at runtime */ },
    colors: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => 'var(--series-' + i + ')')
  };

  document.addEventListener('DOMContentLoaded', () => {
    // Sync theme with the parent UPSCGPT portal (if framed) or localStorage
    const syncTheme = () => {
      try {
        let t = null;
        if (window.parent && window.parent !== window && window.parent.document) {
          t = window.parent.document.documentElement.getAttribute('data-theme');
        }
        if (!t) t = localStorage.getItem('theme');
        if (t === 'dark' || t === 'light' || t === 'sepia') {
          document.documentElement.setAttribute('data-theme', t);
        }
      } catch (e) { /* cross-origin or storage blocked */ }
    };
    syncTheme();
    try {
      if (window.parent && window.parent !== window && window.parent.document) {
        new MutationObserver(syncTheme).observe(window.parent.document.documentElement, {
          attributes: true,
          attributeFilter: ['data-theme', 'class']
        });
      }
      window.addEventListener('storage', syncTheme);
    } catch (e) { /* ignore */ }

    loadSources();
    renderAll();
    const root = document.getElementById('dash-root') || document.body;
    // A page or tab panel coming into view draws its contents (tooltips toggling `hidden` are ignored).
    new MutationObserver((muts) => {
      if (muts.some((m) => m.target.matches && m.target.matches('.pq-page, [role="tabpanel"]') && !m.target.hidden)) schedule();
    }).observe(root, {subtree: true, attributes: true, attributeFilter: ['hidden']});
    // Charts size themselves from their width, so redraw when the width changes.
    let lastW = root.clientWidth;
    new ResizeObserver(() => {
      if (Math.abs(root.clientWidth - lastW) > 4) { lastW = root.clientWidth; schedule(); }
    }).observe(root);
  });
})();
