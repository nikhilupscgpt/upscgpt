/* stress-test.js — generated test: every theme and a fixed sample of solution keywords, asked in common phrasings,
   with and without a typo, sent through the chat box exactly as a student's question would be (PQChat.route).
   Open test.html: the score shows under the hand-written tests. window.PQ_STRESS holds every result. */
(function () {
  'use strict';
  const clean = (t) => t.replace(/&/g, 'and').replace(/[–—]/g, ' ').replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
  // one dropped letter in the longest word (6+ letters), the most common slip
  const typo = (s) => { const w = s.split(' '); const i = w.reduce((b, x, j) => (x.length > w[b].length ? j : b), 0); if (w[i].length < 6) return null; w[i] = w[i].slice(0, 3) + w[i].slice(4); return w.join(' '); };

  const THEME_T = [['{t}', null], ['most repeated in {t}', 'repeated'], ['top sub-topics in {t}', 'top'], ['is {t} rising', 'trend'],
    ['when was {t} asked', 'when'], ['how many questions on {t}', 'count'], ['how to prepare {t}', 'strategy'], ['{t} trend', 'trend']];
  const TERM_T = ['{k}', 'what is {k}', 'explain {k}', '{k} pyqs', 'questions on {k}'];

  function cases() {
    const out = [];
    const qs = (window.PQ_DATA || {}).questions || [];
    const themes = new Map(); qs.forEach((q) => themes.set(q.themeKey, q.theme));
    const names = new Map(); themes.forEach((n, k) => { const c = clean(n); names.set(c, (names.get(c) || []).concat(k)); });
    for (const [key, name] of themes) {
      if (/general|other|misc/i.test(name)) continue;
      const nm = clean(name);
      if (names.get(nm).length > 1) continue;   // same name in two subjects: the bot should ask back, tested by hand
      for (const [tpl, intent] of THEME_T) for (const v of [nm, typo(nm)]) if (v) out.push({kind: 'theme', tpl, typo: v !== nm, q: tpl.replace('{t}', v), key, intent});
    }
    // solution keywords: a fixed, spread-out sample (every n-th), short ones only
    const kws = new Map();
    ((window.PQ_TUTOR || {}).questions || []).forEach((q) => ((q.sol || {}).kw || []).forEach((k) => {
      const t = String(k[0]).replace(/\s*\([^)]*\)/g, '').trim();
      if (t.length > 3 && t.split(' ').length <= 4 && !/[^\x20-\x7e]/.test(t)) kws.set(t.toLowerCase(), t);
    }));
    // a keyword that is also a theme / sub-topic name belongs to the theme tests (its overview is the right answer)
    const topicNames = new Set([...themes.values(), ...qs.map((q) => q.sub)].map(clean));
    const all = [...kws.keys()].filter((k) => !topicNames.has(clean(k))).sort();
    const step = Math.max(1, Math.floor(all.length / 200));
    for (let i = 0; i < all.length; i += step) {
      const k = all[i];
      for (const tpl of TERM_T) for (const v of [clean(k), typo(clean(k))]) if (v) out.push({kind: 'term', tpl, typo: v !== clean(k), q: tpl.replace('{k}', v), term: clean(k)});
    }
    return out;
  }

  function run() {
    const C = window.PQChat, T = window.PQTutor;
    const res = cases().map((c) => {
      C.answer('reset'); if (T) T.reset();
      const engine = C.route(c.q);
      let got = {}, err = null;
      try {
        if (engine === 'tutor') { const r = T.answer(c.q); got = {intent: r.intent, term: (r.meta && r.meta.term) || '', count: r.meta && r.meta.count}; }
        else { const r = C.answer(c.q); got = Object.assign({}, r.debug || {}); }
      } catch (e) { err = e.message; }
      let ok;
      if (err) ok = false;
      else if (c.kind === 'theme') ok = engine === 'stats' && got.theme === c.key && (!c.intent || got.intent === c.intent);
      else {
        // a term: the tutor's term page (definition when stored + every PYQ), about the right words
        const first = c.term.split(' ').find((w) => w.length > 3) || c.term;
        ok = engine === 'tutor' && ['define', 'search', 'list'].includes(got.intent) && clean(got.term).includes(first.slice(0, 4));
      }
      return Object.assign({}, c, {engine, got, err, ok});
    });
    C.answer('reset'); if (T) T.reset();
    const by = {};
    res.forEach((r) => { const k = r.kind + ': ' + r.tpl + (r.typo ? ' [typo]' : ''); by[k] = by[k] || [0, 0]; by[k][1]++; if (r.ok) by[k][0]++; });
    const pass = res.filter((r) => r.ok).length;
    window.PQ_STRESS = {pass, total: res.length, by, fails: res.filter((r) => !r.ok), results: res};
    const box = document.createElement('section');
    box.style.cssText = 'max-width:1120px;margin:16px auto;padding:16px;border:1px solid var(--color-border-line);border-radius:12px;font:14px/1.5 var(--font-anthropic-sans);background:var(--color-panel);color:var(--color-fg)';
    const pct = (a, n) => Math.round(100 * a / n) + '%';
    box.innerHTML = `<h2 style="margin:0 0 8px">Generated test: ${pass} / ${res.length} (${pct(pass, res.length)})</h2>` +
      '<table style="border-collapse:collapse;font-size:13px">' + Object.entries(by).map(([k, [a, n]]) => `<tr><td style="padding:2px 12px 2px 0">${k}</td><td>${a}/${n}</td><td style="padding-left:8px">${pct(a, n)}</td></tr>`).join('') + '</table>' +
      `<details style="margin-top:8px"><summary>First 60 failures</summary><ol>${res.filter((r) => !r.ok).slice(0, 60).map((r) =>
        `<li>${r.q.replace(/</g, '&lt;')} → ${r.engine} / ${r.got.intent || r.err} / ${r.got.theme || r.got.term || ''}${r.key ? ' (wanted ' + r.key + ')' : ''}</li>`).join('')}</ol></details>`;
    const first = document.body.firstElementChild;
    if (first && first.nextSibling) document.body.insertBefore(box, first.nextSibling); else document.body.prepend(box);
    console.log('[stress-test]', pass + '/' + res.length);
  }
  window.PQStress = run;
  // after the hand-written tests (chat-test.js runs 300 ms after load)
  if (document.readyState === 'complete') setTimeout(run, 900); else window.addEventListener('load', () => setTimeout(run, 900));
})();
