/* chat-test.js — runs data/chat-tests.js through the chat engine and shows the score. Open test.html. */
(function () {
  'use strict';
  function check(exp, got) {
    const bad = [];
    for (const [k, want] of Object.entries(exp)) {
      const have = got[k];
      if (k === 'kw') { if (want === null ? have != null : (!have || !have.includes(want))) bad.push(`kw: wanted ${JSON.stringify(want)}, got ${JSON.stringify(have)}`); continue; }
      const ok = Array.isArray(want) ? want.includes(have) : want === have;
      if (!ok) bad.push(`${k}: wanted ${JSON.stringify(want)}, got ${JSON.stringify(have)}`);
    }
    return bad;
  }
  function evaluate() {
    const tests = (window.PQ_TESTS || {}).tests || [];
    const results = tests.map((t) => {
      PQChat.answer('reset');
      if (window.PQTutor) PQTutor.reset();
      // the box sends each question to the stats engine or the PYQ Tutor (PQChat.route); tests go the same way
      const via = (q) => (PQChat.route ? PQChat.route(q) : 'stats');
      for (const s of t.seq || []) { if (via(s) === 'tutor') PQTutor.answer(s); else PQChat.answer(s); }
      let r, err = null, engine = 'stats';
      try {
        engine = via(t.q);
        if (engine === 'tutor') { const x = PQTutor.answer(t.q); r = {debug: {intent: x.intent}}; } else r = PQChat.answer(t.q);
      } catch (e) { err = e.message; }
      const got = Object.assign({}, (r && r.debug) || {}, {engine});
      // tests written for the stats engine must stay there
      let bad = err ? ['error: ' + err] : check(Object.assign({engine: 'stats'}, t.expect), got);
      // asking back counts as correct when the right theme is among the offered options
      let asked = false;
      if (bad.length && got.intent === 'clarify' && t.expect.theme && got.guess) {
        const want = [].concat(t.expect.theme);
        if (got.guess.options.some((o) => want.includes(o.key))) { bad = []; asked = true; }
      }
      return {group: t.group, q: t.q, seq: t.seq, pass: !bad.length, asked, bad, got};
    });
    PQChat.answer('reset');
    if (window.PQTutor) PQTutor.reset();
    const by = {};
    for (const r of results) { by[r.group] = by[r.group] || [0, 0]; by[r.group][1]++; if (r.pass) by[r.group][0]++; }
    const pass = results.filter((r) => r.pass).length;
    return {pass, asked: results.filter((r) => r.asked).length, total: results.length, byGroup: by, failures: results.filter((r) => !r.pass), results};
  }
  window.PQEvaluate = evaluate;
  function run() {
    const R = window.PQ_TEST_RESULT = evaluate();
    const {pass, byGroup: by} = R, results = R.results;
    const box = document.createElement('section');
    box.style.cssText = 'max-width:1120px;margin:16px auto;padding:16px;border:2px solid var(--color-fg);border-radius:12px;font:14px/1.5 var(--font-anthropic-sans);background:var(--color-panel);color:var(--color-fg)';
    box.innerHTML = `<h2 style="margin:0 0 8px">Chat test: ${pass} / ${results.length} passed <small>(${R.asked} by asking back)</small></h2>` +
      `<p style="margin:0 0 8px">${Object.entries(by).map(([g, [a, n]]) => `<b>${g}</b> ${a}/${n}`).join(' · ')}</p>` +
      '<ol style="margin:0;padding-left:20px">' + results.filter((r) => !r.pass).map((r) =>
        `<li><b>${(r.seq || []).map((s) => s + ' → ').join('')}${r.q}</b> <small>(${r.group})</small><br><span style="color:var(--color-bad)">${r.bad.join('; ')}</span></li>`).join('') + '</ol>';
    document.body.prepend(box);
    console.log('[chat-test]', pass + '/' + results.length, JSON.stringify(by));
  }
  if (document.readyState === 'complete') setTimeout(run, 300); else window.addEventListener('load', () => setTimeout(run, 300));
})();
