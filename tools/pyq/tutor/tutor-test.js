/* tutor-test.js — runs data/tutor-tests.js (window.PQ_TUTOR_TESTS) against the tutor.
   Browser: open index.html?test.   Node: node run_tests.js */
(function () {
  function check(r, e) {
    const bad = [];
    const m = r.meta || {};
    const intents = [].concat(e.intent || []);
    if (intents.length && !intents.includes(r.intent)) bad.push(`intent ${r.intent} ≠ ${intents.join("|")}`);
    if (e.field && m.field !== e.field) bad.push(`field ${m.field} ≠ ${e.field}`);
    if (e.arg && String(m.arg) !== e.arg) bad.push(`arg ${m.arg} ≠ ${e.arg}`);
    if (e.missing != null && !!m.missing !== e.missing) bad.push(`missing ${!!m.missing}`);
    if (e.term && !(m.term || "").toLowerCase().includes(e.term)) bad.push(`term "${m.term}" lacks "${e.term}"`);
    if (e.subjects && !e.subjects.every(s => (m.subjects || []).includes(s))) bad.push(`subjects ${JSON.stringify(m.subjects)}`);
    if (e.subject) { const q = window.PQ_TUTOR.questions.find(q => q.id === m.id); if (!q || q.s !== e.subject) bad.push(`subject ${q && q.s}`); }
    if (e.topic && m.topic !== e.topic) bad.push(`topic ${m.topic}`);
    if (e.size && m.size !== e.size) bad.push(`size ${m.size}`);
    if (e.hasDef != null && !!m.hasDef !== e.hasDef) bad.push(`hasDef ${!!m.hasDef}`);
    if (e.minCount && !(m.count >= e.minCount)) bad.push(`count ${m.count} < ${e.minCount}`);
    if (e.yearFrom && !(m.years && m.years[0] === e.yearFrom)) bad.push(`years ${JSON.stringify(m.years)}`);
    return bad;
  }
  function run() {
    const T = window.PQTutor;
    const out = [];
    (window.PQ_TUTOR_TESTS || []).forEach((t, i) => {
      T.reset();
      const fails = [];
      const said = [];
      for (const s of t.steps) {
        if (s.open) { T.state.cur = s.open; T.state.revealed = false; said.push("[open]"); continue; }
        const r = T.answer(s.say);
        said.push(s.say);
        const bad = check(r, s.expect || {});
        if (bad.length) { fails.push(`"${s.say}" → ${bad.join("; ")}`); break; }
      }
      out.push({ i, group: t.group, said: said.join(" ▸ "), ok: !fails.length, fails });
    });
    T.reset();
    const pass = out.filter(o => o.ok).length;
    return { pass, total: out.length, results: out };
  }
  window.PQTutorEvaluate = run;
  if (typeof document !== "undefined" && document.body && document.body.append && window.PQ_TUTOR_TESTS) {
    const r = run();
    const groups = {};
    r.results.forEach(o => { const g = groups[o.group] || (groups[o.group] = [0, 0]); g[1]++; if (o.ok) g[0]++; });
    const box = document.createElement("div");
    box.className = "pt-testbox";
    box.innerHTML = `<b>Tests: ${r.pass} / ${r.total}</b><p>${Object.entries(groups).map(([g, [a, b]]) => `${g} ${a}/${b}`).join(" · ")}</p><ol>` +
      r.results.filter(o => !o.ok).map(o => `<li class="fail">${o.said}<br>${o.fails.join("<br>")}</li>`).join("") + "</ol>";
    document.body.append(box);
    window.PQ_TEST_RESULT = r;
  }
})();
