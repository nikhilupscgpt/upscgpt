/* tutor.js — PYQ Tutor. Rule-based, no LLM, no network: it reads the question, finds the PYQ or term,
   and shows the stored solution fields. Data: window.PQ_TUTOR (data/tutor-data.js, built by build_tutor_data.py).

   What it understands (typos and some Marathi/Hindi words are fixed first):
   - Quiz:        "quiz me on polity", "10 economy questions since 2018", then a/b/c/d, "next", "stop"
   - Open:        "random polity question", "2019 q 14", "open 3" (from the last list)
   - On the open question: "answer", "explain", "statement 2", "why not b", "keywords", "value addition",
                  "in news", "similar pyq", "table", "takeaway", "next"
   - Terms:       "what is repo rate", "define judicial review", "fdi meaning"
   - Trends:      "how has UPSC asked about article 21", "pyqs on inflation"
   - Overview:    "polity topics", "which subjects have solutions"
   A button or follow-up is offered only when the question has that field, so new subjects light up as
   their solutions are added — no code change.
*/
(function () {
  "use strict";
  const DATA = window.PQ_TUTOR;
  if (!DATA) { console.error("tutor.js: window.PQ_TUTOR missing (load data/tutor-data.js first)"); return; }
  const Q = DATA.questions;
  const BY = new Map(Q.map(q => [q.id, q]));
  const short = s => (DATA.short && DATA.short[s]) || s;
  const YEARS = [...new Set(Q.map(q => q.y))].sort();
  const Y0 = YEARS[0], Y1 = YEARS[YEARS.length - 1];

  // ================= text =================
  const norm = s => (s || "").toLowerCase().replace(/[’'`]/g, "").replace(/[^a-z0-9ऀ-ॿ]+/g, " ").trim();
  const STOP = new Set(("a an the of in on at to for from by with and or is are was were be been being it its this that these those " +
    "which what who whom whose how why when where do does did i me my we you your can could should would will shall may might " +
    "give show tell about any some more most than then there their them they he she his her as into over under also just get got " +
    "let lets please want need know us our one ever has have had so very much many such s t").split(" "));
  function stem(w) {
    if (w.length <= 3 || /^\d+$/.test(w) || w.endsWith("ss")) return w;
    if (w.endsWith("ies") && w.length > 4) return w.slice(0, -3) + "y";
    for (const s of ["ing", "ed", "es", "s", "e"]) if (w.endsWith(s) && w.length - s.length >= 3) return w.slice(0, -s.length);
    return w;
  }
  const words = s => norm(s).split(" ").filter(Boolean);
  const content = s => words(s).filter(w => !STOP.has(w));

  // Marathi / Hindi (romanised) → English, and filler words to drop
  const TR = {
    uttar: "answer", utter: "answer", defin: "define", defne: "define", prashna: "question", prashn: "question", prashnа: "question", sawal: "question", savaal: "question",
    vidhan: "statement", vidhane: "statements", paryay: "option", spashtikaran: "explain", samjav: "explain", samjava: "explain",
    samjhao: "explain", samjao: "explain", batmi: "news", khabar: "news", pudhil: "next", pudhe: "next", agla: "next", agle: "next",
    sarav: "quiz", chachani: "quiz", arth: "meaning", matlab: "meaning", mhanje: "meaning", vishay: "topic", ghatak: "topics",
    kiti: "how many", kevha: "when", kadhi: "when", dakhva: "show", dakhav: "show", dikhao: "show", bata: "tell", sang: "tell",
    sanga: "tell", kaay: "what", kay: "what", kya: "what", ka: "why", kyu: "why", kyon: "why", barobar: "correct", chuk: "wrong",
    galat: "wrong", sahi: "correct", saman: "similar", sarkha: "similar", sarkhe: "similar",
  };
  const FILLER = new Set("aahe ahe ahet hai hain ho la cha chi che madhe mein me ke ki ko na re mala mujhe majha maza ani aur var ver pe sathi".split(" "));

  // ================= indexes =================
  const docText = q => [q.stem, q.o.map(o => o[1]).join(" "), q.t, (q.sol && q.sol.kw || []).map(k => k[0]).join(" ")].join(" ");
  const DOCS = Q.map(q => {
    const f = new Map();
    const add = (text, w) => { for (const t of content(text)) { const s = stem(t); f.set(s, (f.get(s) || 0) + w); } };
    add(q.stem, 1); q.o.forEach(o => add(o[1], 0.5)); add(q.t, 1.5);
    if (q.sol && q.sol.kw) q.sol.kw.forEach(k => add(k[0], 2));
    q._txt = " " + norm(docText(q)) + " ";
    return f;
  });
  const DF = new Map();
  DOCS.forEach(f => f.forEach((_, k) => DF.set(k, (DF.get(k) || 0) + 1)));
  const idf = k => Math.log(1 + Q.length / (1 + (DF.get(k) || 0)));

  // keyword dictionary: every keyword of every solved question, with acronym aliases
  const TERMS = new Map();       // key → entry
  const ENTRIES = [];
  Q.forEach(q => (q.sol && q.sol.kw || []).forEach(([term, note, d]) => {
    const keys = new Set([norm(term)]);
    const m = term.match(/\(([^)]+)\)/);
    if (m && /^[A-Z][A-Za-z0-9&.\-]{1,11}$/.test(m[1]) && (m[1].match(/[A-Z]/g) || []).length >= 2) keys.add(norm(m[1]));   // (FDI), (OMOs)
    if (m) keys.add(norm(term.replace(/\([^)]*\)/g, " ")));
    let e = TERMS.get(norm(term));
    if (!e) { e = { term, keys: [...keys].filter(k => k.length >= 2), uses: [] }; ENTRIES.push(e); e.stems = new Set(content(term.replace(/[()]/g, " ")).map(stem)); }
    e.uses.push({ id: q.id, note, d });
    e.keys.forEach(k => { if (!TERMS.has(k)) TERMS.set(k, e); });
  }));

  // acronyms → full names, read from the text ("Cash Reserve Ratio (CRR)") plus common ones
  const ACR = {
    crr: "cash reserve ratio", slr: "statutory liquidity ratio", rbi: "reserve bank", mpc: "monetary policy committee", npa: "non performing assets",
    gst: "goods and services tax", gdp: "gross domestic product", gnp: "gross national product", cpi: "consumer price index", wpi: "wholesale price index",
    imf: "international monetary fund", wto: "world trade organization", sebi: "securities and exchange board", msp: "minimum support price",
    pds: "public distribution system", dpsp: "directive principles", cag: "comptroller and auditor general", pil: "public interest litigation",
    cji: "chief justice", fdi: "foreign direct investment", fpi: "foreign portfolio investment", nabard: "national bank for agriculture",
  };
  Q.forEach(q => {
    const txt = [q.stem, ...q.o.map(o => o[1]), ...((q.sol && q.sol.kw) || []).map(k => k[0] + " " + k[1])].join(" ");
    for (const m of txt.matchAll(/((?:[A-Z][a-z]+\s+(?:(?:of|and|for|the|&)\s+)?){2,6})\(([A-Z]{2,6})s?\)/g)) {
      const full = m[1].trim(), acr = m[2].toLowerCase();
      const initials = full.split(/\s+/).filter(w => /^[A-Z]/.test(w)).map(w => w[0].toLowerCase()).join("");
      if (!ACR[acr] && initials.endsWith(acr)) ACR[acr] = norm(full.split(/\s+/).slice(-acr.length - full.split(/\s+/).filter(w => !/^[A-Z]/.test(w)).length).join(" "));
    }
  });
  const expandAcr = text => text.split(" ").map(w => ACR[w] && !DF.has(stem(w)) ? ACR[w] : w).join(" ");

  // topics
  const GENERIC = new Set("general miscellaneous misc india indian and other issue issues related basic concept concepts history age".split(" ").map(stem));
  const TOPICS = [];
  { const seen = new Map(); Q.forEach(q => { const k = q.s + "|" + q.t; if (!seen.has(k)) { const t = { s: q.s, t: q.t, n: 0, solved: 0, stems: new Set(content(q.t).map(stem).filter(w => !GENERIC.has(w))) }; seen.set(k, t); TOPICS.push(t); } const t = seen.get(k); t.n++; if (q.sol) t.solved++; }); }
  const SUBJECTS = [...new Set(Q.map(q => q.s))];
  const SUBJ_ALIAS = {
    "Indian Polity": ["polity", "rajyashastra", "raajyashastra", "rajyaghatana", "civics"],
    "Economy": ["economy", "economics", "eco", "arthashastra", "arthshastra", "arthavyavastha", "arthvyavastha"],
    "Environment": ["environment", "ecology", "env", "paryavaran"],
    "Geography": ["geography", "geo", "bhugol"],
    "Science & Technology": ["science", "sci", "technology", "tech", "vidnyan", "vigyan", "s&t"],
    "Agriculture": ["agriculture", "agri", "krushi", "krishi"],
    "Modern History": ["modern"],
    "Ancient History": ["ancient"],
    "Medieval History": ["medieval"],
    "Art & Culture": ["art", "arts", "culture"],
  };
  const ALIAS_WORDS = new Map();
  Object.entries(SUBJ_ALIAS).forEach(([s, list]) => list.forEach(w => ALIAS_WORDS.set(w, s)));

  // spelling vocabulary
  const COMMAND_WORDS = ("quiz test practice mock random question questions answer explain explanation solution statement statements option " +
    "keyword keywords value addition news current affairs similar table compare comparison takeaway remember trap next previous stop " +
    "finish score topics topic subjects coverage solved define meaning upsc asked trend pyq pyqs open show again help since before " +
    "after between last years year correct wrong incorrect why skip quit end continue retry chapter chapters units unit syllabus practise " +
    "mcq mcqs surprise previous takeaway definition means trick tips keywords comparison remember explain").split(" ");
  const VOCAB = new Map();
  Q.forEach(q => words(docText(q) + " " + q.s).forEach(w => VOCAB.set(w, (VOCAB.get(w) || 0) + 1)));
  ENTRIES.forEach(e => words(e.term).forEach(w => VOCAB.set(w, (VOCAB.get(w) || 0) + 5)));
  COMMAND_WORDS.concat([...ALIAS_WORDS.keys()]).forEach(w => VOCAB.set(w, (VOCAB.get(w) || 0) + 50));
  Object.keys(TR).forEach(w => VOCAB.set(w, 50));
  FILLER.forEach(w => VOCAB.set(w, 50));
  const VSTEMS = new Set([...VOCAB.keys()].map(stem));
  const VBUCKET = new Map();
  VOCAB.forEach((n, w) => { if (w.length < 4 || /\d/.test(w) || n < 2) return; const k = w[0]; (VBUCKET.get(k) || VBUCKET.set(k, []).get(k)).push(w); });

  function dist(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    const d = []; for (let i = 0; i <= a.length; i++) { d[i] = [i]; }
    for (let j = 0; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      let rowMin = Infinity;
      for (let j = 1; j <= b.length; j++) {
        const c = a[i - 1] === b[j - 1] ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
        rowMin = Math.min(rowMin, d[i][j]);
      }
      if (rowMin > max) return max + 1;
    }
    return d[a.length][b.length];
  }
  function fixWord(w) {
    if (w.length < 4 || /\d/.test(w) || VOCAB.has(w) || VSTEMS.has(stem(w))) return w;
    const max = w.length >= 7 ? 2 : 1;
    let best = null, bd = max + 1, bn = 0;
    const pools = [VBUCKET.get(w[0]) || []];
    if (max === 1) VBUCKET.forEach((list, k) => { if (k !== w[0]) pools.push(list); });   // a typo in the first letter, 1 edit only
    for (const list of pools) for (const v of list) {
      const dd = dist(w, v, max);
      const n = VOCAB.get(v);
      if (dd < bd || (dd === bd && n > bn)) { best = v; bd = dd; bn = n; }
    }
    if (bd <= max) return best;
    return w.length >= 6 ? (byLetters(w) || w) : w;
  }

  // letter groups (trigrams): "parlimentery" → "parliamentary" is 3 edits away but shares most of its 3-letter groups
  const grams = w => { const p = "^" + w + "$"; const g = new Set(); for (let i = 0; i < p.length - 2; i++) g.add(p.slice(i, i + 3)); return g; };
  const GRAM = new Map();
  VOCAB.forEach((n, w) => { if (w.length < 5 || /\d/.test(w) || n < 3) return; grams(w).forEach(g => (GRAM.get(g) || GRAM.set(g, []).get(g)).push(w)); });
  function byLetters(w) {
    const gw = grams(w), hits = new Map();
    gw.forEach(g => (GRAM.get(g) || []).forEach(v => hits.set(v, (hits.get(v) || 0) + 1)));
    let best = null, bs = 0;
    hits.forEach((c, v) => {
      if (Math.abs(v.length - w.length) > 3) return;
      const dice = 2 * c / (gw.size + v.length + 2 - 2);
      const sc = dice + (v[0] === w[0] ? 0.05 : -0.1) + Math.min(VOCAB.get(v), 50) / 5000;
      if (sc > bs) { best = v; bs = sc; }
    });
    return bs >= 0.62 ? best : null;
  }

  function prep(raw) {
    let t = " " + norm(raw) + " ";
    t = t.replace(/ kay aahe | kay ahe | mhanje kay | kya hai | kya hota hai /g, " meaning ")
      .replace(/ s ?& ?t | s and t /g, " science ");
    const fixes = [];
    const out = [];
    for (let w of t.trim().split(" ")) {
      if (!w) continue;
      if (TR[w]) { out.push(TR[w]); continue; }
      if (FILLER.has(w)) continue;
      const f = fixWord(w);
      if (f !== w) fixes.push([w, f]);
      out.push(TR[f] || f);
    }
    return { text: out.join(" "), fixes };
  }

  // ================= filters =================
  function readFilter(t) {
    const f = { subjects: [], topic: null, years: null, n: null };
    const ws = t.split(" ");
    ws.forEach(w => { const s = ALIAS_WORDS.get(w); if (s && !f.subjects.includes(s)) f.subjects.push(s); });
    if (/\bhistory\b/.test(t) && !f.subjects.some(s => /History/.test(s))) f.subjects.push("Modern History", "Ancient History", "Medieval History");
    let m;
    if ((m = t.match(/\b(?:between|from)?\s*(20[12]\d)\s*(?:to|and|till|until)\s*(20[12]\d)\b/))) f.years = [+m[1], +m[2]];
    else if ((m = t.match(/\b(?:since|after|from)\s+(20[12]\d)\b/))) f.years = [+m[1] + (/after/.test(m[0]) ? 1 : 0), Y1];
    else if ((m = t.match(/\b(?:before|till|until|upto|up to)\s+(20[12]\d)\b/))) f.years = [Y0, +m[1] - (/before/.test(m[0]) ? 1 : 0)];
    else if ((m = t.match(/\blast\s+(\d{1,2})\s+years?\b/))) f.years = [Y1 - +m[1] + 1, Y1];
    else { const ys = [...t.matchAll(/\b(20[12]\d)\b/g)].map(x => +x[1]); if (ys.length) f.years = [Math.min(...ys), Math.max(...ys)]; }
    if ((m = t.match(/\b(\d{1,2})\s+(?:[a-z]+\s+){0,2}(?:questions?|qs|mcqs?|ques)\b/)) || (m = t.match(/\b(\d{1,2})\s*(?:questions?|qs|mcqs?|ques)\b/)) || (m = t.match(/\bquiz\s+(?:of\s+)?(\d{1,2})\b/))) f.n = +m[1];
    // topic: the topic whose distinctive words the query covers best
    const qs = new Set(content(t).map(stem));
    let best = null, bs = 0;
    TOPICS.forEach(tp => {
      if (f.subjects.length && !f.subjects.includes(tp.s)) return;
      if (!tp.stems.size) return;
      let hit = 0; tp.stems.forEach(w => { if (qs.has(w)) hit++; });
      const sc = hit / tp.stems.size + hit * 0.01;
      if (hit && sc > bs) { best = tp; bs = sc; }
    });
    if (best && bs >= 0.5) f.topic = best;
    return f;
  }
  function stripFilter(t) {
    return t.split(" ").filter(w => !ALIAS_WORDS.has(w) && w !== "history").join(" ")
      .replace(/\b(?:between|from|since|after|before|till|until|upto|up to|last)\s+(?:\d{1,2}\s+years?|20[12]\d)\b/g, " ")
      .replace(/\b20[12]\d\b/g, " ").replace(/\b(?:to|and)\s*(?=\s|$)/g, " ").replace(/\s+/g, " ").trim();
  }
  function pool(f, opts) {
    return Q.filter(q => (!f.subjects.length || f.subjects.includes(q.s)) && (!f.topic || (q.s === f.topic.s && q.t === f.topic.t)) &&
      (!f.years || (q.y >= f.years[0] && q.y <= f.years[1])) && (!opts || !opts.keyed || q.ans));
  }
  const describe = f => [f.topic ? short(f.topic.s) + " · " + f.topic.t : f.subjects.map(short).join(", "),
    f.years ? (f.years[0] === f.years[1] ? f.years[0] : f.years[0] + "–" + f.years[1]) : ""].filter(Boolean).join(" · ");

  // ================= search =================
  function search(text, f) {
    const qt = [...new Set(content(text).map(stem))];
    if (!qt.length) return [];
    const need = qt.length <= 2 ? qt.length : Math.ceil(qt.length * 0.6);
    const phrase = qt.length >= 2 ? " " + content(text).join(" ") + " " : null;
    const res = [];
    Q.forEach((q, i) => {
      if (f && f.subjects.length && !f.subjects.includes(q.s)) return;
      if (f && f.years && (q.y < f.years[0] || q.y > f.years[1])) return;
      const d = DOCS[i];
      let hit = 0, sc = 0;
      qt.forEach(k => { if (d.has(k)) { hit++; sc += idf(k) * Math.log(1 + d.get(k)); } });
      if (hit < need) return;
      if (phrase && q._txt.includes(phrase)) sc *= 1.6;
      res.push({ q, sc });
    });
    return res.sort((a, b) => b.sc - a.sc).map(r => r.q);
  }

  function lookup(text) {
    const n = norm(text).replace(/^(the|a|an) /, "");
    if (!n) return { exact: null, close: [] };
    if (TERMS.has(n)) return { exact: TERMS.get(n), close: [], fuzzy: false };
    const qs = new Set(content(n).map(stem));
    if (!qs.size) return { exact: null, close: [] };
    const scored = [];
    ENTRIES.forEach(e => {
      let inter = 0; qs.forEach(w => { if (e.stems.has(w)) inter++; });
      if (!inter) return;
      const j = inter / (qs.size + e.stems.size - inter);
      const cover = inter / qs.size;
      if (cover === 1 || j >= 0.5) scored.push({ e, sc: j + cover * 0.5 + Math.min(e.uses.length, 5) * 0.01 });
    });
    scored.sort((a, b) => b.sc - a.sc);
    const strong = scored.filter(s => s.sc >= 1.15);
    if (strong.length === 1 || (strong.length > 1 && strong[0].sc - strong[1].sc > 0.2)) return { exact: strong[0].e, close: scored.slice(1, 6).map(s => s.e), fuzzy: true };
    return { exact: null, close: scored.slice(0, 6).map(s => s.e) };
  }

  // related words: for the words asked, which other words keep turning up in the same questions (PMI over question text)
  const SURFACE = new Map();
  Q.forEach(q => content(q.stem).forEach(w => { const s = stem(w); const m = SURFACE.get(s) || SURFACE.set(s, new Map()).get(s); m.set(w, (m.get(w) || 0) + 1); }));
  const surface = s => { const m = SURFACE.get(s); return m ? [...m].sort((a, b) => b[1] - a[1])[0][0] : s; };
  function related(text, n) {
    const qs = [...new Set(content(text).map(stem))].filter(k => DF.has(k));
    if (!qs.length) return [];
    const docs = DOCS.filter(d => qs.every(k => d.has(k)));
    if (docs.length < 2) return [];
    const co = new Map();
    docs.forEach(d => d.forEach((_, k) => { if (!qs.includes(k) && k.length > 3 && !/^\d+$/.test(k)) co.set(k, (co.get(k) || 0) + 1); }));
    const N = Q.length;
    return [...co].filter(([k, c]) => c >= 2 && DF.get(k) < N * 0.04)
      .map(([k, c]) => [k, c * Math.log(N * c / (docs.length * DF.get(k)))]).sort((a, b) => b[1] - a[1])
      .slice(0, n || 4).map(([k]) => surface(k));
  }

  // ================= state =================
  const state = { cur: null, revealed: false, list: [], listLabel: "", quiz: null, filter: null, pending: null };
  const resetState = () => Object.assign(state, { cur: null, revealed: false, list: [], listLabel: "", quiz: null, filter: null, pending: null });

  // ================= tiny DOM helpers =================
  function el(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "class") n.className = v; else if (k.startsWith("on")) n.addEventListener(k.slice(2), v); else n.setAttribute(k, v === true ? "" : v);
    }
    kids.flat(Infinity).forEach(c => { if (c == null || c === false) return; n.append(c.nodeType ? c : document.createTextNode(String(c))); });
    return n;
  }
  const rich = s => String(s).split(/\*\*(.+?)\*\*/g).map((p, i) => i % 2 ? el("b", null, p) : p);
  const P = (s, cls) => el("p", { class: cls || "pt-text" }, rich(s));
  const qLabel = q => `${q.y} · ${short(q.s)} · ${q.t}`;
  const optText = (q, l) => (q.o.find(o => o[0] === l) || [])[1] || "";
  const firstLine = (s, n) => { const t = s.replace(/\s+/g, " ").trim(); return t.length > n ? t.slice(0, n - 1) + "…" : t; };

  // a reply = {intent, meta, nodes, chips}; chips = [{label, say}] or [{label, act}]
  // clicks inside an answer go back through whichever box shows it (this page, or the dashboard chat via PQTutor.host)
  const hostAsk = (t, o) => (window.PQTutor.host || window.PQTutor.ask)(t, o);
  const reply = (intent, nodes, chips, meta) => ({ intent, meta: meta || {}, nodes: [].concat(nodes || []), chips: chips || [] });

  // what this question can offer
  function fieldsOf(q) {
    const s = q.sol || {};
    const out = [];
    if (q.ans) out.push(["answer", "Answer"]);
    if (s.ob || s.sb || s.pb) out.push(["explain", "Explain"]);
    (s.sb || []).forEach(x => out.push(["statement " + x[0], "Statement " + x[0]]));
    (s.pb || []).forEach(x => out.push(["pair " + x[0], "Pair " + x[0]]));
    if (s.kw) out.push(["keywords", "Keywords"]);
    if (s.va) out.push(["value addition", "Value addition"]);
    if (s.news) out.push(["in news", "In news"]);
    if (s.sim) out.push(["similar pyq", "Similar PYQ"]);
    if (s.tab) out.push(["table", "Table"]);
    if (s.take || s.hook) out.push(["takeaway", "Takeaway"]);
    return out;
  }
  function followChips(q, skip) {
    const c = fieldsOf(q).filter(([k]) => k !== skip && !(state.revealed === false && k === "answer" && false)).map(([say, label]) => ({ label, say }));
    c.push({ label: "Next question", say: "next" });
    return c;
  }

  function card(q, opts) {
    opts = opts || {};
    const reveal = opts.reveal;
    const picked = opts.picked;
    const lis = q.o.map(([l, t]) => {
      const cls = reveal && l === q.ans ? "pt-opt is-ans" : picked === l ? "pt-opt is-wrong" : "pt-opt";
      if (!reveal && !opts.noButtons && q.ans) return el("li", null, el("button", { class: cls, type: "button", onclick: () => hostAsk(l, { echo: "(" + l + ")" }) }, el("b", null, "(" + l + ") "), t));
      return el("li", { class: cls }, el("b", null, "(" + l + ") "), t);
    });
    return el("article", { class: "pt-card" },
      el("div", { class: "pt-meta" }, opts.tag ? el("span", { class: "pt-tag" }, opts.tag) : null, el("span", null, qLabel(q)),
        q.sol ? el("span", { class: "pt-badge" }, "solution") : el("span", { class: "pt-badge is-off" }, "no solution yet")),
      el("p", { class: "pt-stem" }, q.stem),
      el("ul", { class: "pt-opts" }, lis));
  }

  function openQ(q, why) {
    state.cur = q.id; state.revealed = false; state.pending = null;
    const nodes = [];
    if (why) nodes.push(P(why, "pt-note"));
    nodes.push(card(q));
    nodes.push(P(q.ans ? "Pick an option to try it, or ask for the answer or a part of the solution." : "This question has no answer key in the data.", "pt-note"));
    const chips = followChips(q).filter(c => c.say !== "explain" || true);
    return reply("open", nodes, chips, { id: q.id });
  }

  // ---------- solution parts ----------
  const tick = v => v === "r" ? "✓" : v === "w" ? "✗" : "•";
  function partAnswer(q) {
    if (!q.ans) return [P("This question has no answer key in the data yet.")];
    const ob = (q.sol && q.sol.ob || []).find(o => o[0] === q.ans);
    return [P(`Answer: **(${q.ans}) ${optText(q, q.ans)}**`), ob && ob[2] ? P(ob[2]) : null, ob && ob[1] ? P(ob[1], "pt-ref") : null];
  }
  function partStatements(q) {
    const s = q.sol || {};
    if (s.sb) return el("ol", { class: "pt-list pt-checks" }, s.sb.map(x => el("li", null, el("span", { class: "pt-tick is-" + (x[1] || "u") }, tick(x[1])),
      el("div", null, el("b", null, `Statement ${x[0]} — ${x[2] || "?"}`), el("p", null, x[4]), x[3] ? el("small", null, x[3]) : null))));
    if (s.pb) return el("ol", { class: "pt-list pt-checks" }, s.pb.map(x => el("li", null, el("span", { class: "pt-tick is-" + (x[1] || "u") }, tick(x[1])),
      el("div", null, el("b", null, `Pair ${x[0]} — ${x[2] || "?"}`), x[3] ? el("p", { class: "pt-sub" }, x[3]) : null, el("p", null, x[5]), x[4] ? el("small", null, x[4]) : null))));
    return null;
  }
  function partExplain(q) {
    const s = q.sol || {};
    const nodes = [card(q, { reveal: true, noButtons: true })];
    nodes.push(...partAnswer(q));
    const st = partStatements(q);
    if (st) { nodes.push(el("p", { class: "pt-cap" }, s.sb ? "Statement by statement" : "Pair by pair")); nodes.push(st); }
    const others = (s.ob || []).filter(o => o[0] !== q.ans && o[2]);
    if (others.length && !st) {
      nodes.push(el("p", { class: "pt-cap" }, "Why the others are wrong"));
      nodes.push(el("ul", { class: "pt-list" }, others.map(o => el("li", null, el("b", null, `(${o[0]}) `), o[2]))));
    }
    return nodes;
  }
  function partOption(q, l) {
    const ob = (q.sol && q.sol.ob || []).find(o => o[0] === l);
    const isAns = l === q.ans;
    const head = `Option **(${l}) ${optText(q, l)}** — ${isAns ? "this is the answer." : q.ans ? `not the answer (the answer is (${q.ans})).` : "no answer key in the data."}`;
    if (!ob || !ob[2]) return [P(head), P("The solution has no note for this option yet.", "pt-note")];
    return [P(head), P(ob[2]), ob[1] ? P(ob[1], "pt-ref") : null];
  }
  function partStatement(q, n) {
    const s = q.sol || {};
    const x = (s.sb || []).find(r => String(r[0]) === String(n));
    if (!x) return null;
    return [P(`Statement ${x[0]} — **${x[2] || "?"}** ${tick(x[1])}`), P(x[4]), x[3] ? P(x[3], "pt-ref") : null];
  }
  function partPair(q, n) {
    const roman = { 1: "I", 2: "II", 3: "III", 4: "IV", 5: "V" };
    const key = String(n).toUpperCase();
    const x = (q.sol && q.sol.pb || []).find(r => String(r[0]).toUpperCase() === key || String(r[0]).toUpperCase() === roman[n]);
    if (!x) return null;
    return [P(`Pair ${x[0]} — **${x[2]}** ${tick(x[1])}`), x[3] ? P(x[3], "pt-sub") : null, P(x[5]), x[4] ? P(x[4], "pt-ref") : null];
  }
  function partKeywords(q) {
    return [el("ul", { class: "pt-list" }, q.sol.kw.map(([t, note, d]) => {
      const e = TERMS.get(norm(t));
      const more = e ? e.uses.filter(u => u.id !== q.id).length : 0;
      return el("li", null, el("b", null, t), d ? el("span", { class: "pt-tag is-warn" }, "trap") : null, " — ", note,
        more ? el("button", { class: "pt-link", type: "button", onclick: () => hostAsk("how has upsc asked about " + t) }, ` in ${more} other PYQ${more > 1 ? "s" : ""}`) : null);
    }))];
  }
  function partVA(q) {
    return q.sol.va.map(([title, tag, bullets]) => el("section", { class: "pt-va" },
      el("p", { class: "pt-va-h" }, el("b", null, title), tag ? el("span", { class: "pt-tag" }, tag) : null),
      el("ul", { class: "pt-list" }, bullets.map(b => el("li", null, rich(b))))));
  }
  function partNews(q) {
    const [h, src, date, rel] = q.sol.news;
    return [P(`**${h || "In news"}**`), (src || date) ? P([src, date].filter(Boolean).join(" · "), "pt-ref") : null, rel ? P(rel) : null];
  }
  function partSimilar(q) {
    const [y, stemTxt, take, link] = q.sol.sim;
    const nodes = [P(`**Similar PYQ — ${y}**`), el("p", { class: "pt-stem pt-quote" }, firstLine(stemTxt, 420)), take ? P(take) : null];
    return nodes;
  }
  function partTable(q) {
    const [title, head, rows] = q.sol.tab;
    return [title ? P(`**${title}**`) : null, el("div", { class: "pt-tablewrap" }, el("table", { class: "pt-table" },
      el("thead", null, el("tr", null, head.map(h => el("th", null, h)))),
      el("tbody", null, rows.map(r => el("tr", null, r.map(c => el("td", null, c)))))))];
  }
  function partTake(q) {
    const s = q.sol;
    return [s.take ? P(s.take) : null, s.hook ? P(`**${s.hook[0]}**`) : null, s.hook && s.hook[1] ? P(s.hook[1]) : null];
  }

  // ---------- follow-up reading ----------
  const ORD = { first: 1, "1st": 1, second: 2, "2nd": 2, third: 3, "3rd": 3, fourth: 4, "4th": 4, fifth: 5, "5th": 5, one: 1, two: 2, three: 3, four: 4, five: 5 };
  const FIELDS = [
    ["statement", /\b(?:statement|statements|stmt|st|point)\s*(?:no\s*|number\s*)?(\d|one|two|three|four|five)\b|\b(\d|first|second|third|fourth|fifth|1st|2nd|3rd|4th|5th)\s+statement\b/],
    ["pair", /\bpair\s*(?:no\s*)?(\d|iv|v|i{1,3})\b/],
    ["option", /\b(?:option|opt|choice)\s*([a-d])\b|\bwhy\s+(?:not|is|isnt|isn t|was|wasnt)\s+(?:option\s*)?([a-d])\b|\bwhat about\s+(?:option\s*)?([a-d])\b|\bwhy\s+([a-d])\b|\b([a-d])\s+(?:is\s+)?(?:wrong|incorrect|correct)\b/],
    ["keywords", /\b(keywords?|key words?|key terms?|terms|concepts?)\b/],
    ["va", /\b(value addition|value add|value added|add on|extra notes?|notes|more facts|extra facts|extra)\b/],
    ["news", /\b(in news|news|current affairs?|current)\b/],
    ["similar", /\b(similar|related pyq|related question|like this|same type)\b/],
    ["table", /\b(table|comparison|compare|tabular|chart)\b/],
    ["take", /\b(takeaway|take away|remember|trap|tip|trick|hook|key point|summary)\b/],
    ["answer", /\b(answer|correct option|right option|key)\b/],
    ["explain", /\b(explain|explanation|solution|solve|why|how|reason)\b/],
  ];
  const FIELD_WORDS = new Set(("statement statements stmt st point option opt choice pair keyword keywords key word words term terms concept concepts value addition add added " +
    "on extra note notes more facts fact news current affairs affair similar related pyq question like same type table comparison compare tabular chart " +
    "takeaway take away remember trap tip trick hook summary answer correct right wrong incorrect explain explanation solution solve why how reason " +
    "this it its q que ques no number not about whats show tell me isnt was wasnt first second third fourth fifth 1st 2nd 3rd 4th 5th one two three four five full give").split(" "));

  function followUp(t) {
    const q = BY.get(state.cur);
    if (!q) return null;
    // a new topic in the text? then it isn't about this question
    const left = content(t).filter(w => !FIELD_WORDS.has(w) && !/^[a-d]$/.test(w) && !/^\d$/.test(w) && !/^(i{1,3}|iv|v)$/.test(w));
    if (left.length && !left.some(w => q._txt.includes(" " + w) || q._txt.includes(stem(w)))) return null;
    let field = null, arg = null;
    for (const [k, re] of FIELDS) { const m = t.match(re); if (m) { field = k; arg = m.slice(1).find(Boolean) || null; break; } }
    if (!field) return null;
    const s = q.sol || {};
    const nope = what => reply("followup", [P(`This question has no ${what} yet.`), P(qLabel(q), "pt-note")], followChips(q), { field, missing: true, id: q.id });
    const done = (nodes, skip) => { state.revealed = true; return reply("followup", [P("About: " + qLabel(q), "pt-ctx")].concat(nodes), followChips(q, skip), { field, arg, id: q.id }); };
    switch (field) {
      case "statement": {
        const n = ORD[arg] || +arg;
        if (!s.sb) return s.pb ? done(partStatements(q)) : nope("statement breakdown");
        const p = partStatement(q, n);
        return p ? done(p, "statement " + n) : reply("followup", [P(`This question has ${s.sb.length} statements.`)], followChips(q), { field, missing: true });
      }
      case "pair": { if (!s.pb) return nope("pair breakdown"); const p = partPair(q, ORD[arg] || (/^\d$/.test(arg) ? +arg : arg)); return p ? done(p) : nope("pair " + arg); }
      case "option": return done(partOption(q, arg));
      case "keywords": return s.kw ? done(partKeywords(q), "keywords") : nope("keywords");
      case "va": return s.va ? done(partVA(q), "value addition") : nope("value addition");
      case "news": return s.news ? done(partNews(q), "in news") : nope("in-news note");
      case "similar": {
        if (!s.sim) return nope("similar PYQ");
        const r = done(partSimilar(q), "similar pyq");
        if (s.sim[3] && BY.get(s.sim[3])) r.chips.unshift({ label: "Open the " + s.sim[0] + " question", act: () => openQ(BY.get(s.sim[3]), "Similar PYQ, opened from " + qLabel(q) + ".") });
        return r;
      }
      case "table": return s.tab ? done(partTable(q), "table") : nope("comparison table");
      case "take": return (s.take || s.hook) ? done(partTake(q), "takeaway") : nope("takeaway");
      case "answer": return done(partAnswer(q), "answer");
      case "explain": return (s.ob || s.sb || s.pb) ? done(partExplain(q), "explain") : done(partAnswer(q).concat(P("The full solution isn't added for this question yet.", "pt-note")), "explain");
    }
    return null;
  }

  // ---------- attempts and quiz ----------
  function grade(q, l) {
    const ok = l === q.ans;
    const ob = (q.sol && q.sol.ob || []);
    const mine = ob.find(o => o[0] === l), right = ob.find(o => o[0] === q.ans);
    return [card(q, { reveal: true, picked: l, noButtons: true }),
      P(ok ? `✓ **Correct** — (${q.ans}) ${optText(q, q.ans)}` : `✗ You picked (${l}). The answer is **(${q.ans}) ${optText(q, q.ans)}**.`, ok ? "pt-text pt-ok" : "pt-text pt-bad"),
      !ok && mine && mine[2] ? P(`Why not (${l}): ${mine[2]}`) : null,
      right && right[2] ? P(right[2]) : null];
  }
  function attempt(l) {
    const q = BY.get(state.cur);
    state.revealed = true;
    return reply("attempt", grade(q, l), followChips(q, "answer"), { letter: l, correct: l === q.ans, id: q.id });
  }
  function startQuiz(t) {
    const f = readFilter(t);
    let label = describe(f);
    let base = pool(f, { keyed: true });
    const rest = stripFilter(t).replace(/\b(quiz|test|me|practice|mock|mcqs?|questions?|qs|ques|start|on|give|take|a|of|\d{1,2})\b/g, " ").trim();
    if (!f.topic && content(rest).length) {
      const hits = search(rest, f).filter(q => q.ans);
      if (hits.length >= 3) { base = hits.slice(0, 40); label = (label ? label + " · " : "") + "“" + rest + "”"; }
    }
    if (!f.subjects.length && !f.topic && !f.years && !label && state.filter) { base = pool(state.filter, { keyed: true }); label = describe(state.filter) + " (from earlier)"; }
    if (!base.length) return reply("quiz", [P("I found no questions with an answer key for that. Try a subject, a topic or a year range.")], helpChips(), { size: 0 });
    const solved = base.filter(q => q.sol);
    const useSolved = solved.length >= Math.min(5, base.length);
    const src = useSolved ? solved : base;
    const n = Math.min(f.n || 10, src.length);
    const pick = src.slice().sort(() => Math.random() - 0.5).slice(0, n);
    state.quiz = { ids: pick.map(q => q.id), i: 0, score: 0, wrong: [], label: label || "all subjects", answered: false };
    state.filter = f.subjects.length || f.topic || f.years ? f : state.filter;
    const intro = P(`Quiz: **${n} question${n > 1 ? "s" : ""}** — ${state.quiz.label}${useSolved ? ", with solutions" : ""}. Tap an option or type a, b, c or d.`);
    const first = quizShow();
    return Object.assign(first, { intent: "quiz", meta: { size: n, label: state.quiz.label, subjects: f.subjects, topic: f.topic && f.topic.t, years: f.years }, nodes: [intro].concat(first.nodes) });
  }
  function quizShow() {
    const z = state.quiz;
    const q = BY.get(z.ids[z.i]);
    state.cur = q.id; state.revealed = false; z.answered = false;
    return reply("quiz-q", [card(q, { tag: `Q ${z.i + 1} / ${z.ids.length}` })], [{ label: "Skip", say: "skip" }, { label: "Stop quiz", say: "stop quiz" }], { id: q.id });
  }
  function quizAnswer(l) {
    const z = state.quiz;
    const q = BY.get(state.cur);
    z.answered = true; state.revealed = true;
    if (l === q.ans) z.score++; else z.wrong.push(q.id);
    const last = z.i === z.ids.length - 1;
    const chips = [{ label: last ? "See score" : "Next", say: last ? "finish quiz" : "next" }].concat(fieldsOf(q).filter(([k]) => k !== "answer").slice(0, 4).map(([say, label]) => ({ label, say })));
    return reply("quiz-a", [P(`Score ${z.score} / ${z.i + 1}`, "pt-note")].concat(grade(q, l)), chips, { letter: l, correct: l === q.ans });
  }
  function quizNext(skip) {
    const z = state.quiz;
    if (skip && !z.answered) z.wrong.push(state.cur);
    if (z.i >= z.ids.length - 1) return quizEnd();
    z.i++;
    return quizShow();
  }
  function quizEnd() {
    const z = state.quiz;
    state.quiz = null;
    const done = z.i + (z.answered ? 1 : 0);
    const byTopic = new Map();
    z.wrong.forEach(id => { const q = BY.get(id); const k = short(q.s) + " · " + q.t; byTopic.set(k, (byTopic.get(k) || 0) + 1); });
    const nodes = [P(`Quiz over — **${z.score} / ${done || z.ids.length}** correct.`)];
    if (byTopic.size) {
      nodes.push(el("p", { class: "pt-cap" }, "Missed or skipped, by topic"));
      nodes.push(el("ul", { class: "pt-list" }, [...byTopic].sort((a, b) => b[1] - a[1]).map(([k, n]) => el("li", null, `${k} — ${n}`))));
    }
    const chips = [];
    if (z.wrong.length) chips.push({ label: "Retry the missed ones", act: () => { state.quiz = { ids: z.wrong.slice(), i: 0, score: 0, wrong: [], label: "missed questions", answered: false }; return Object.assign(quizShow(), { intent: "quiz" }); } });
    chips.push({ label: "New quiz, same set", say: "quiz " + (z.label === "all subjects" ? "" : z.label.replace(/[“”]|\(from earlier\)/g, "")) });
    return reply("quiz-end", nodes, chips, { score: z.score, total: done });
  }

  // ---------- lists, lookups, overviews ----------
  function listReply(intent, items, title, meta, extraNodes) {
    if (!items.length) return reply("none", (meta && meta.lead ? meta.lead : []).concat([P(`No PYQ found ${title}.`)]), helpChips(), Object.assign({ count: 0 }, meta || {}, { lead: undefined }));
    state.list = items.map(q => q.id);
    state.listLabel = title;
    const byYear = new Map();
    items.forEach(q => byYear.set(q.y, (byYear.get(q.y) || 0) + 1));
    const years = [...byYear].sort((a, b) => a[0] - b[0]);
    const peak = years.slice().sort((a, b) => b[1] - a[1])[0];
    const solved = items.filter(q => q.sol).length;
    const nodes = (meta && meta.lead ? meta.lead : []).concat([P(`**${items.length} PYQ${items.length > 1 ? "s" : ""}** ${title}` + (years.length > 1 ? ` — ${years[0][0]}–${years[years.length - 1][0]}${peak[1] > 1 ? `, most in ${peak[0]} (${peak[1]})` : ", one a year at most"}` : ` — ${years[0][0]}`) + (solved ? ` · ${solved} with solutions` : "") + ".")]);
    if (meta) delete meta.lead;
    if (extraNodes) nodes.push(...extraNodes);
    if (years.length > 1) nodes.push(yearStrip(byYear));
    nodes.push(listNodes(items, 0));
    const chips = [{ label: "Quiz me on these", act: () => quizFromList() }];
    if (meta && meta.term) related(meta.term, 3).forEach(w => chips.push({ label: "Related: " + w, say: "pyqs on " + w }));
    return reply(intent, nodes, chips, Object.assign({ count: items.length }, meta || {}));
  }
  function yearStrip(byYear) {
    const max = Math.max(...byYear.values());
    return el("div", { class: "pt-years", role: "img", "aria-label": "Questions per year" }, YEARS.map(y => {
      const n = byYear.get(y) || 0;
      return el("div", { class: "pt-ycol", title: `${y}: ${n}` }, el("span", { class: "pt-ybar", style: `height:${n ? 4 + 26 * n / max : 0}px` }), el("small", null, String(y).slice(2)));
    }));
  }
  function listNodes(items, from) {
    const page = items.slice(from, from + 8);
    const box = el("ol", { class: "pt-results", start: from + 1 }, page.map((q, i) => el("li", null,
      el("button", { class: "pt-result", type: "button", onclick: () => hostAsk("open " + (from + i + 1), { echo: "Open " + (from + i + 1) }) },
        el("span", { class: "pt-meta" }, qLabel(q), q.sol ? el("span", { class: "pt-dot", title: "has solution" }) : null),
        el("span", null, firstLine(q.stem, 140))))));
    const wrap = el("div", null, box);
    if (items.length > from + 8) {
      const more = el("button", { class: "pt-more", type: "button", onclick: () => { more.replaceWith(listNodes(items, from + 8)); } }, `Show ${Math.min(8, items.length - from - 8)} more`);
      wrap.append(more);
    }
    return wrap;
  }
  function quizFromList() {
    const ids = state.list.filter(id => BY.get(id).ans).sort(() => Math.random() - 0.5).slice(0, 10);
    if (!ids.length) return reply("quiz", [P("None of these have an answer key.")]);
    state.quiz = { ids, i: 0, score: 0, wrong: [], label: state.listLabel, answered: false };
    return Object.assign(quizShow(), { intent: "quiz" });
  }
  function defReply(e, also) {
    const notes = [];
    e.uses.forEach(u => { if (u.note && !notes.some(n => n === u.note)) notes.push(u.note); });
    const qs = e.uses.map(u => BY.get(u.id)).sort((a, b) => b.y - a.y);
    const hits = search(e.term.replace(/\([^)]*\)/g, " ")).filter(q => !qs.includes(q));
    const r = listReply("define", qs.concat(hits).sort((a, b) => b.y - a.y), "on " + e.term, { term: e.term, lead: defNodes(e), hasDef: true });
    r.meta.solvedUses = qs.length;
    (also || []).filter(x => x !== e).slice(0, 4).forEach(x => r.chips.push({ label: "What is " + x.term + "?", say: "what is " + x.term }));
    return r;
  }
  // the stored definition of a keyword: its note from the first solution, other notes folded away
  function defNodes(e) {
    const notes = [];
    e.uses.forEach(u => { if (u.note && !notes.some(n => n === u.note)) notes.push(u.note); });
    const nodes = [P(`**${e.term}**`), notes[0] ? P(notes[0]) : null];
    if (notes.length > 1) nodes.push(el("details", { class: "pt-details" }, el("summary", null, `${notes.length - 1} more note${notes.length > 2 ? "s" : ""} from other questions`), el("ul", { class: "pt-list" }, notes.slice(1).map(n => el("li", null, n)))));
    return nodes;
  }
  function coverage() {
    const rows = SUBJECTS.map(s => { const all = Q.filter(q => q.s === s); return [s, all.filter(q => q.sol).length, all.length]; }).sort((a, b) => b[1] - a[1] || b[2] - a[2]);
    return reply("coverage", [P(`Solutions are in for **${Q.filter(q => q.sol).length} of ${Q.length}** questions. The tutor uses them as they arrive.`),
      el("table", { class: "pt-table" }, el("thead", null, el("tr", null, el("th", null, "Subject"), el("th", null, "Solved"), el("th", null, "Total"))),
        el("tbody", null, rows.map(([s, d, t]) => el("tr", null, el("td", null, s), el("td", null, String(d)), el("td", null, String(t))))))],
    [{ label: "Quiz me on Polity", say: "quiz polity" }, { label: "Economy topics", say: "economy topics" }], {});
  }
  function topicsReply(f) {
    const subs = f.subjects.length ? f.subjects : null;
    if (!subs) {
      return reply("topics", [P("Pick a subject:"), el("ul", { class: "pt-list" }, SUBJECTS.map(s => el("li", null, `${s} — ${TOPICS.filter(t => t.s === s).length} topics`)))],
        SUBJECTS.map(s => ({ label: short(s), say: short(s) + " topics" })), {});
    }
    const list = TOPICS.filter(t => subs.includes(t.s)).sort((a, b) => b.n - a.n);
    state.filter = { subjects: subs, topic: null, years: null };
    return reply("topics", [P(`**${subs.map(short).join(", ")}** — ${list.length} topics, by number of PYQs:`),
      el("div", { class: "pt-bars" }, list.map(t => el("button", { class: "pt-bar", type: "button", onclick: () => hostAsk(`${short(t.s)} questions on ${t.t}`, { echo: t.t }) },
        el("span", { class: "pt-bar-l" }, t.t), el("span", { class: "pt-bar-v" }, t.solved ? `${t.n} · ${t.solved} solved` : String(t.n)),
        el("span", { class: "pt-track" }, el("span", { class: "pt-fill", style: `width:${100 * t.n / list[0].n}%` }), el("span", { class: "pt-fill is-solved", style: `width:${100 * t.solved / list[0].n}%` })))))],
    [{ label: `Quiz me on ${short(subs[0])}`, say: "quiz " + short(subs[0]) }], { subjects: subs, count: list.length });
  }
  function helpChips() {
    return [{ label: "Quiz me on Polity", say: "quiz me on polity" }, { label: "What is fiscal deficit?", say: "what is fiscal deficit" },
      { label: "How has UPSC asked about Article 21?", say: "how has upsc asked about article 21" }, { label: "Random Economy question", say: "random economy question" },
      { label: "Polity topics", say: "polity topics" }, { label: "Which subjects have solutions?", say: "which subjects have solutions" }];
  }
  const help = msg => reply("help", [P(msg || "Ask me about any UPSC Prelims PYQ. I can quiz you, open a question and explain it part by part, look up a keyword, or show how UPSC has asked about a topic over the years.")], helpChips(), {});

  // ================= router =================
  function answer(raw) {
    const { text: t, fixes } = prep(raw);
    const r = route(t, raw);
    r.meta.fixes = fixes;
    r.meta.raw = raw;
    r.meta.text = t;
    if (fixes.length) r.nodes.unshift(P("Read as: " + fixes.map(([a, b]) => `${a} → ${b}`).join(", "), "pt-ctx"));
    return r;
  }

  function route(t, raw) {
    if (!t) return help();
    // a pending choice: "1", "2" or the label itself
    if (state.pending) {
      const p = state.pending;
      const m = t.match(/^(?:option\s*)?(\d)$/);
      const pick = m ? p[+m[1] - 1] : p.find(x => norm(x.label) === t);
      if (pick) { state.pending = null; return pick.act ? pick.act() : answer(pick.say); }
      if (t.split(" ").length > 2) state.pending = null;
    }
    const letter = (t.match(/^(?:option\s*|ans\s*|answer\s*(?:is\s*)?|i think\s*|its\s*|it is\s*)?([a-d])$/) || [])[1];
    if (letter && state.quiz && !state.quiz.answered) return quizAnswer(letter);
    if (letter && state.cur && !state.revealed && BY.get(state.cur).ans) return attempt(letter);
    if (letter && state.cur) { const r = followUp("option " + letter); if (r) return r; }

    if (state.quiz) {
      if (/^(next|skip|next one|next question|continue|go on|ok|okay)$/.test(t)) return quizNext(t === "skip");
      if (/\b(stop|end|finish|quit|score|result|results)\b/.test(t)) return quizEnd();
    }
    if (/\b(quiz|test me|test|practice|practise|mock|mcqs?)\b/.test(t) && !/\b(what is|define|meaning)\b/.test(t)) return startQuiz(t);

    // open from the last list
    let m = t.match(/^(?:open|show|no|number|question|q)?\s*(\d{1,2})$/);
    if (m && state.list.length && +m[1] >= 1 && +m[1] <= state.list.length) return openQ(BY.get(state.list[+m[1] - 1]), `#${m[1]} ${state.listLabel}`.trim());

    // open by year + number
    m = t.match(/\b(20[12]\d)\b.*?\b(?:q|que|ques|question|no|number)\s*(\d{1,3})\b/) || t.match(/\b(?:q|que|ques|question|no)\s*(\d{1,3})\b.*?\b(20[12]\d)\b/);
    if (m) {
      const y = +(m[1].length === 4 ? m[1] : m[2]), n = +(m[1].length === 4 ? m[2] : m[1]);
      const f = readFilter(t);
      const hits = Q.filter(q => q.y === y && q.n === n && (!f.subjects.length || f.subjects.includes(q.s)));
      if (hits.length === 1) return openQ(hits[0]);
      if (hits.length > 1) {
        state.pending = hits.map(q => ({ label: short(q.s) + " · " + q.t, act: () => openQ(q) }));
        return reply("clarify", [P(`${hits.length} questions are numbered ${n} in ${y} (numbers repeat across subjects). Which one?`),
          el("ol", { class: "pt-list" }, hits.map(q => el("li", null, `${short(q.s)} · ${q.t} — ${firstLine(q.stem, 80)}`)))],
        state.pending.map((p, i) => ({ label: `${i + 1}. ${p.label}`, act: p.act })), { count: hits.length });
      }
      return reply("open", [P(`I found no question ${n} in ${y}.`)], helpChips(), { missing: true });
    }

    // random question
    if ((/\b(random|any|some|something|surprise|ask me|one more)\b/.test(t) && /\b(question|questions|que|pyq|mcq|one|me|something)\b/.test(t)) ||
        /\b(?:give|ask|show)\s+(?:me\s+)?(?:one|a|an|any)\s+(?:question|que|pyq|mcq)\b/.test(t)) {
      const f = readFilter(t);
      let base = pool(f, { keyed: true });
      const rest = stripFilter(t).replace(/\b(random|any|some|something|surprise|ask|give|show|me|one|more|question|questions|que|pyq|mcq|on|from|a|an|about)\b/g, " ").trim();
      if (!f.topic && content(rest).length) { const hits = search(rest, f).filter(q => q.ans); if (hits.length) base = hits.slice(0, 30); }
      if (!base.length) return help("I found no questions for that.");
      const solved = base.filter(q => q.sol);
      const src = solved.length ? solved : base;
      const q = src[Math.floor(Math.random() * src.length)];
      if (f.subjects.length || f.topic) state.filter = f;
      return openQ(q, describe(f) ? "From " + describe(f) + "." : "");
    }

    // follow-ups on the open question
    if (state.cur) {
      if (/^(next|next one|next question|another|another one)$/.test(t)) return nextQ(1);
      if (/^(previous|prev|back|last one|previous question)$/.test(t)) return nextQ(-1);
      if (/^(show|show it|show question|question again|again|repeat question|show again)$/.test(t)) return openQ(BY.get(state.cur));
      const r = followUp(t);
      if (r) return r;
    }

    // the whole question is one stored keyword ("Article 131 Federal Units", "what is NBFC", "repo rate pyqs") → its page, before
    // words like "units", "status" or "topics" inside the name can be read as something else
    {
      const bare = expandAcr(t.replace(/^(?:what is|what are|whats|define|definition of|meaning of|explain|tell (?:me )?about)\s+(?:the |a |an )?/, "")
        .replace(/^(?:show (?:me )?)?(?:pyqs?|questions?) (?:on|about)\s+/, "").replace(/\s+(?:pyqs?|questions?|meaning|definition)$/, "").trim());
      const tk = (z) => content(String(z).replace(/\([^)]*\)/g, " ")).map(stem).join(" ");
      const f0 = TERMS.has(bare) && /\b(pyqs?|questions?)\b/.test(t) ? readFilter(t) : null;
      const topicNamed = f0 && f0.topic && tk(f0.topic.t) === tk(TERMS.get(bare).term);   // "questions on <topic name>" → the topic's list
      if (TERMS.has(bare) && !topicNamed) return defReply(TERMS.get(bare), lookup(bare).close);
    }
    if (/\b(coverage|status|which subjects|solutions? (?:added|available|ready|done)|how many solutions|solved)\b/.test(t) && !/\b(what is|define)\b/.test(t)) return coverage();
    if (/\b(topics?|chapters?|units?|syllabus|vishay)\b/.test(t) && !/\b(question|questions|pyqs?) (?:on|about|from)\b/.test(t)) return topicsReply(readFilter(t));
    if (/^(hi|hello|hey|help|namaste|namaskar|start|menu|what can you do)$/.test(t)) return help();

    // terms and trends
    const f = readFilter(t);
    // "questions on X" / "pyqs on X" is a request for X's page (meaning + every PYQ); a trend is asked with trend / how many / when
    const isTrend = /\b(what (?:did|does|has) upsc ask|how (?:has|did|does|do|is|was) upsc (?:ask|asked|asks|tested|test)|upsc ask(?:ed)?|asked about|trend|how many|when|repeated)\b/.test(t);
    const isDef = /^(?:what is|what are|what was|what were|whats|define|definition of|meaning of|meaning|explain|who is|who was|tell (?:me )?about|about)(?:\s+(?:the|a|an))?(?:\s+(?:meaning|definition)\s+of)?\b/.test(t) || /\b(?:meaning|means|definition|define)$/.test(t);
    let q = t.replace(/^(?:what is|what are|what was|what were|whats|define|definition of|meaning of|meaning|explain|who is|who was|tell (?:me )?about|about)(?:\s+(?:the|a|an))?(?:\s+(?:meaning|definition)\s+of)?\s+/, "")
      .replace(/\s+(?:meaning|means|definition|define)$/, "")
      .replace(/\b(?:what (?:did|does|has) upsc (?:ask|asked|asks)(?: about| on| in)?|how (?:has|did|does|do|is|was) upsc (?:ask|asked|asks|tested|test)(?: about| on)?|upsc ask(?:ed)?(?: about| on)?|asked about|pyqs? (?:on|about|from|related to)|questions? (?:on|about|from|related to)|trend of|trend|how many (?:questions|times|pyqs)?|when (?:was|were|did)|repeated|show me|show|list|all|upsc|pyqs?|questions?|asked|ask)\b/g, " ");
    // an exact keyword, read before topic words and years are taken out ("Coal Mines Act, 2015", "Article 131 – Federal Units")
    const listAsk = /\b(pyqs?|questions?)\b/.test(t);   // "questions on X": X's PYQs; for a topic name, the topic's list
    if (!isTrend) {
      const whole = lookup(expandAcr(q.replace(/\s+/g, " ").trim()));
      const same = (x, y) => { const k = (z) => content(String(z).replace(/\([^)]*\)/g, " ")).map(stem).join(" "); return k(x) === k(y); };
      if (whole.exact && !whole.fuzzy && !(listAsk && f.topic && same(f.topic.t, whole.exact.term))) return defReply(whole.exact, whole.close);
    }
    // a topic named and nothing else ("questions on parliamentary committees") → that topic's PYQs
    const topicOnly = f.topic && (() => { const tw = new Set(content(f.topic.t).map(stem)); return !content(expandAcr(stripFilter(q))).map(stem).some(w => !tw.has(w)); })();
    if (f.topic && (isTrend || (topicOnly && listAsk))) {
      const items = pool(f).sort((a, b) => b.y - a.y);
      state.filter = f;
      return listReply("trend", items, "in " + f.topic.t + (f.years ? ` · ${f.years[0]}–${f.years[1]}` : ""), { topic: f.topic.t, subjects: f.subjects, years: f.years });
    }
    const qText = expandAcr(stripFilter(q).replace(/\s+/g, " ").trim());
    if (!content(qText).length) {
      if (f.subjects.length || f.years) { const items = pool(f).sort((a, b) => b.y - a.y); if (items.length) { state.filter = f; return listReply("list", items, "in " + describe(f), { subjects: f.subjects, years: f.years }); } }
      return help("I didn't catch a topic or term in that.");
    }

    const lk = lookup(qText);
    if (lk.exact && !isTrend && (!lk.fuzzy || isDef)) return defReply(lk.exact, lk.close);
    const hits = search(qText, f);
    if (isDef && !lk.exact && lk.close.length && !hits.length) {
      state.pending = lk.close.map(e => ({ label: e.term, say: "what is " + e.term }));
      return reply("clarify", [P(`I don't have “${qText}” as a keyword. Did you mean one of these?`)], state.pending.map(p => ({ label: p.label, say: p.say })), { term: qText, options: lk.close.map(e => e.term) });
    }
    if (hits.length) {
      const termLike = !isTrend && content(qText).length <= 4;
      const lead = lk.exact ? defNodes(lk.exact) : termLike ? [P("No stored definition yet — this isn't a keyword in any written solution.", "pt-note")] : null;
      if (f.subjects.length || f.topic) state.filter = f;
      const r = listReply(isTrend ? "trend" : "search", hits, `on “${qText}”` + (describe(f) ? " · " + describe(f) : ""), { term: qText, subjects: f.subjects, years: f.years, lead, hasDef: !!lk.exact });
      [lk.exact].concat(lk.close).filter(Boolean).slice(0, 4).forEach(e => r.chips.push({ label: "What is " + e.term + "?", say: "what is " + e.term }));
      return r;
    }
    if (lk.exact) return defReply(lk.exact, lk.close);
    if (lk.close.length) {
      state.pending = lk.close.map(e => ({ label: e.term, say: "what is " + e.term }));
      return reply("clarify", [P(`No PYQ matches “${qText}”. Closest keywords:`)], state.pending.map(p => ({ label: p.label, say: p.say })), { term: qText, options: lk.close.map(e => e.term) });
    }
    return reply("none", [P(`No PYQ matches “${qText}”${describe(f) ? " in " + describe(f) : ""}. Try fewer or different words.`)], helpChips(), { term: qText });
  }

  function nextQ(step) {
    const q = BY.get(state.cur);
    let ids = state.list.includes(q.id) ? state.list : Q.filter(x => x.s === q.s && x.t === q.t).sort((a, b) => b.y - a.y || a.n - b.n).map(x => x.id);
    const i = ids.indexOf(q.id);
    if (ids.length < 2) return reply("open", [P("This is the only question in its topic.")], followChips(q), { end: true });
    const j = (i + step + ids.length) % ids.length;   // wraps round
    return openQ(BY.get(ids[j]), `${step > 0 ? "Next" : "Previous"} in ${state.list.includes(q.id) ? "the list" : q.t} (${j + 1} of ${ids.length}).`);
  }

  // ================= UI =================
  let log, input;
  function addUser(text) { log.append(el("div", { class: "pt-msg pt-user" }, text)); }
  function addBot(r) {
    const chips = r.chips && r.chips.length ? el("div", { class: "pt-chips" }, r.chips.map(c => el("button", {
      class: "pt-chip", type: "button",
      onclick: () => c.act ? show(c.label, c.act()) : ask(c.say, { echo: c.label }),
    }, c.label))) : null;
    const q = r.meta && r.meta.raw;
    if (window.PQLog && q) {
      if (r.intent === "none") PQLog.record({ q, engine: "tutor", intent: r.intent, reason: "no-match" });
      else if (r.intent === "clarify") PQLog.record({ q, engine: "tutor", intent: r.intent, reason: "asked-back" });
    }
    const flag = window.PQLog && q ? el("button", { class: "pt-link pt-flag", type: "button", onclick: e => { PQLog.record({ q, engine: "tutor", intent: r.intent, reason: "flagged" }); e.target.replaceWith(el("span", { class: "pt-flag" }, "Noted — thanks.")); } }, "Not what I wanted") : null;
    const m = el("div", { class: "pt-msg pt-bot" }, r.nodes, chips, flag);
    log.append(m);
    log.scrollTo({ top: m.offsetTop - 12, behavior: "smooth" });
  }
  function show(label, r) { addUser(label); addBot(r); }
  function ask(text, opts) {
    const r = answer(text);
    if (log) { addUser((opts && opts.echo) || text); addBot(r); }
    return r;
  }

  function mount() {
    const root = document.getElementById("pt-root");
    if (!root) return;
    log = el("div", { class: "pt-log", "aria-live": "polite" });
    input = el("input", { type: "text", placeholder: "Ask: quiz me on polity · what is fiscal deficit", "aria-label": "Ask the tutor", autocomplete: "off" });
    const form = el("form", { class: "pt-form", onsubmit: e => { e.preventDefault(); const v = input.value.trim(); if (!v) return; input.value = ""; ask(v); } },
      input, el("button", { class: "pt-send", type: "submit", "aria-label": "Send" }, "↑"));
    root.append(log, form);
    addBot(help());
    input.focus();
  }

  function peek(text) {
    const snap = Object.assign({}, state, { list: state.list.slice(), quiz: state.quiz && Object.assign({}, state.quiz, { ids: state.quiz.ids.slice(), wrong: state.quiz.wrong.slice() }) });
    let r;
    try { r = answer(text); } finally { Object.keys(state).forEach(k => delete state[k]); Object.assign(state, snap); }
    return { intent: r.intent, meta: r.meta };
  }

  window.PQTutor = { ask, answer, peek, reset: resetState, state, search, lookup, related, readFilter, prep };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
})();
