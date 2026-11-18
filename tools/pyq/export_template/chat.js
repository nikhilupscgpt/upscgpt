/*
 * chat.js — "Ask the PYQs": a rule-based chat box (no LLM).
 *
 * How a question is answered:
 *   1. normalise the text and pull out entities: subjects, themes, years, formats, a number ("top 5")
 *   2. pick an intent from trigger words (count, trend, top, when, compare, show questions, ...)
 *   3. answer from the same calculations the dashboard uses (dash.data('subject_summary') etc.)
 *      or from a small full-text index over every question
 *   4. render text + mini charts + question cards + buttons that open the dashboard pages
 *
 * Before step 1, typos are fixed by edit distance against known words; after it, missing pieces are borrowed from
 * the previous answer (follow-ups), and if something is still missing or ambiguous the bot asks back.
 *
 * To extend: add aliases in SUBJECT_ALIASES / THEME_ALIASES, or add an intent in INTENTS + RUN.
 */
(function () {
  'use strict';

  // ------------------------------------------------------------------ data
  const D = (id) => { const d = dash.data(id); return d && d.status === 'ok' ? d.data : null; };
  const YEARS = [];
  const Y0 = 2011, Y1 = 2026, NP = Y1 - Y0 + 1;   // papers in the data
  for (let y = Y0; y <= Y1; y++) YEARS.push(y);

  // ------------------------------------------------------------------ text helpers
  const STOP = new Set(('a an the and or of in on to for with by from at is are was were be been it its this that these those ' +
    'what which who whom when where why how many much do does did can could should would will me my i we you your our ' +
    'please tell show give list find get all any some about there their them than then into over under per vs versus ' +
    'question questions pyq pyqs asked ask upsc prelims prelim paper papers exam year years topic topics theme themes subject subjects').split(' '));
  const norm = (s) => String(s || '').toLowerCase().replace(/&/g, ' and ').replace(/[’']/g, '').replace(/[^a-z0-9ऀ-ॿ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const stem = (w) => w.length > 4 ? w.replace(/(ies)$/, 'y').replace(/(ing|ed|es|s)$/, '').replace(/(.{4,})e$/, '$1') : w;
  const tokens = (s) => norm(s).split(' ').filter((w) => w && !STOP.has(w)).map(stem);
  const has = (q, re) => re.test(q);
  const fmt1 = (v) => (Math.round(v * 10) / 10).toString();

  // ------------------------------------------------------------------ entity dictionaries
  const SUBJECT_ALIASES = {
    economy: ['economy', 'economics', 'economic', 'eco'],
    environment: ['environment', 'environmental', 'env', 'ecology', 'enviro'],
    science_technology: ['science and technology', 'science tech', 'sci tech', 'scitech', 's and t', 'snt', 'science', 'technology'],
    indian_polity: ['indian polity', 'polity', 'constitution', 'governance'],
    geography: ['geography', 'geo'],
    modern_history: ['modern history', 'modern india', 'history', 'freedom struggle', 'national movement'],
    ancient_history: ['ancient history', 'ancient india', 'ancient'],
    medieval_history: ['medieval history', 'medieval india', 'medieval'],
    art_culture: ['art and culture', 'culture', 'arts'],
    agriculture: ['agriculture', 'agri', 'farming', 'farm']
  };
  const THEME_ALIASES = {
    'economy--banking_rbi': ['rbi', 'reserve bank', 'bank', 'banks', 'banking', 'repo', 'slr', 'crr', 'npa'],
    'economy--fiscal_policy_budget': ['budget', 'fiscal deficit', 'fiscal policy', 'fiscal'],
    'economy--taxation_gst': ['gst', 'tax', 'taxes', 'taxation'],
    'economy--inflation': ['inflation', 'cpi', 'wpi'],
    'economy--balance_of_payments_exchange_rate': ['bop', 'balance of payments', 'exchange rate', 'rupee', 'current account'],
    'economy--international_economic_organisations_trade': ['wto', 'imf', 'world bank', 'trade'],
    'economy--capital_markets_financial_instruments': ['sebi', 'stock market', 'bonds', 'bond', 'capital market', 'shares'],
    'economy--foreign_investment': ['fdi', 'fpi', 'foreign investment'],
    'economy--social_sector_schemes': ['scheme', 'schemes', 'yojana'],
    'economy--national_income_growth': ['gdp', 'gva', 'national income'],
    'economy--monetary_policy': ['monetary policy', 'mpc'],
    'environment--biodiversity_conservation': ['biodiversity', 'wildlife', 'national park', 'national parks', 'tiger reserve', 'species', 'iucn', 'ramsar', 'wetland', 'wetlands', 'protected area'],
    'environment--climate_change': ['climate change', 'global warming', 'unfccc', 'paris agreement', 'greenhouse', 'carbon'],
    'environment--environmental_pollution': ['pollution', 'pollutant', 'air quality', 'plastic'],
    'environment--ecology_ecosystems': ['ecosystem', 'ecosystems', 'food chain', 'ecology basics'],
    'environment--environmental_laws_policies_institutions': ['environment law', 'environmental law', 'ngt', 'eia'],
    'science_technology--space_technology': ['space', 'isro', 'satellite', 'satellites', 'rocket', 'gravitational waves'],
    'science_technology--biotechnology_genetics': ['biotech', 'biotechnology', 'dna', 'gene', 'genes', 'genetic', 'crispr', 'stem cell'],
    'science_technology--it_communication_computing': ['computer', 'computing', 'internet', 'blockchain', 'ai', 'artificial intelligence', 'quantum', '5g', 'cyber'],
    'science_technology--health_diseases_medicine': ['disease', 'diseases', 'health', 'vaccine', 'virus', 'medicine'],
    'science_technology--nuclear_energy_technology': ['nuclear', 'energy', 'solar energy', 'hydrogen'],
    'science_technology--defence_technology': ['defence', 'missile', 'missiles'],
    'indian_polity--fundamental_rights': ['fundamental rights', 'fundamental right', 'article 21', 'article 14', 'right to privacy'],
    'indian_polity--directive_principles_of_state_policy': ['dpsp', 'directive principles'],
    'indian_polity--fundamental_duties': ['fundamental duties'],
    'indian_polity--preamble': ['preamble'],
    'indian_polity--parliament': ['parliament', 'lok sabha', 'rajya sabha', 'speaker'],
    'indian_polity--president': ['president'],
    'indian_polity--governor': ['governor'],
    'indian_polity--supreme_court': ['supreme court'],
    'indian_polity--high_courts': ['high court', 'high courts'],
    'indian_polity--panchayati_raj': ['panchayat', 'panchayati raj', 'local government', 'gram sabha'],
    'indian_polity--emergency_provisions': ['emergency'],
    'indian_polity--constitutional_amendments': ['amendment', 'amendments'],
    'indian_polity--scheduled_tribal_areas': ['fifth schedule', 'sixth schedule', 'tribal areas', 'pesa'],
    'indian_polity--centre_state_relations': ['centre state', 'federalism'],
    'indian_polity--elections_representation': ['election', 'elections', 'election commission'],
    'geography--climatology': ['monsoon', 'climate', 'cyclone', 'winds', 'climatology'],
    'geography--oceanography': ['ocean', 'oceans', 'currents', 'oceanography'],
    'geography--indian_physiography_drainage': ['river', 'rivers', 'drainage', 'himalaya', 'himalayas', 'physiography'],
    'geography--world_geography_places': ['places in news', 'map', 'mapping', 'world geography'],
    'geography--universe_solar_system': ['solar system', 'planet', 'planets', 'universe'],
    'geography--geomorphology': ['geomorphology', 'earthquake', 'volcano', 'volcanoes', 'landforms'],
    'geography--soils_natural_vegetation': ['soil types', 'natural vegetation', 'forests'],
    'modern_history--revolt_of_1857_tribal_peasant_movements': ['1857', 'revolt', 'peasant', 'tribal movement', 'tribal revolts'],
    'modern_history--gandhian_era_mass_movements_1915_1947': ['gandhi', 'gandhian', 'non cooperation', 'civil disobedience', 'quit india'],
    'modern_history--early_nationalism_congress_1885_1919': ['moderates', 'extremists', 'swadeshi', 'early nationalism', 'inc'],
    'modern_history--socio_religious_reform_movements': ['reform movement', 'reform movements', 'social reform', 'brahmo samaj', 'arya samaj'],
    'modern_history--constitutional_administrative_developments': ['governor general', 'regulating act', 'charter act', 'government of india act'],
    'modern_history--personalities_press_culture': ['personalities', 'newspapers', 'press'],
    'agriculture--agricultural_pricing_procurement_msp': ['msp', 'minimum support price', 'procurement'],
    'agriculture--irrigation_water_management': ['irrigation', 'micro irrigation', 'drip'],
    'agriculture--major_crops': ['crops', 'crop', 'rice', 'wheat'],
    'agriculture--soil_fertilizers_farming_practices': ['fertilizer', 'fertilizers', 'zero tillage', 'organic farming'],
    'indian_polity--international_organisations_relations': ['un', 'united nations', 'brics', 'g20', 'sco', 'asean', 'quad', 'groupings', 'west asia', 'middle east', 'international relations', 'foreign policy', 'international affairs', 'bilateral']
  };;;;;;;;;;;;;
  const FORMAT_ALIASES = {
    'How many correct': ['how many correct', 'how many type', 'how many format', 'how many questions format', 'how-many'],
    'Statement I–II': ['statement i', 'statement 1', 'statement ii', 'assertion', 'reason'],
    'Pairs / match': ['pair', 'pairs', 'match', 'matching'],
    'Multi-statement': ['multi statement', 'multiple statement', 'statement based'],
    'Direct': ['direct', 'single answer', 'one liner']
  };

  // ------------------------------------------------------------------ UPSC glossary (data/glossary.js, edited as glossary.json)
  // translate: Hindi/Marathi → English, applied before reading. themes: extra aliases. subjects: words that set only the subject.
  // Each theme term is checked against the data on load: if it appears in 2+ questions and under half of them are in its
  // glossary theme, it moves to the theme the data puts it in (60%+), or else stays a plain search word.
  const GLOSS = window.PQ_GLOSSARY || {translate: {}, themes: {}, subjects: {}};
  const SUBJECT_TOPICS = {};
  const GLOSS_REPORT = [];
  let glossReady = false;
  function ensureGlossary() {
    if (glossReady) return;
    const qs = D('questions');
    if (!qs) return;
    glossReady = true;
    const texts = qs.map((q) => ' ' + norm(q.stem + ' ' + q.options) + ' ');
    for (const [key, terms] of Object.entries(GLOSS.themes || {})) {
      for (const term of terms) {
        const t = norm(term);
        if (!t) continue;
        const hits = [];
        texts.forEach((x, i) => { if (x.includes(' ' + t + ' ')) hits.push(qs[i]); });
        let target = key;
        if (hits.length >= 2 && hits.filter((q) => q.themeKey === key).length / hits.length < 0.5) {
          target = majority(hits, (q) => q.themeKey);
          GLOSS_REPORT.push({term: t, glossary: key, used: target || 'search word only', hits: hits.length});
        }
        if (target) (THEME_ALIASES[target] = THEME_ALIASES[target] || []).push(t);
      }
    }
    for (const [sk, terms] of Object.entries(GLOSS.subjects || {})) SUBJECT_TOPICS[sk] = terms.map(norm);
  }
  function translate(text) {
    let t = ' ' + text + ' ';
    const done = [];
    for (const [from, to] of Object.entries(GLOSS.translate || {}).sort((a, b) => b[0].length - a[0].length)) {
      const f = norm(from), re = new RegExp('(^| )' + f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?= |$)', 'g');
      if (re.test(t)) { t = t.replace(re, '$1' + norm(to)); done.push([f, norm(to)]); }
    }
    return {text: t.trim(), done};
  }

  // ------------------------------------------------------------------ search index over questions
  let INDEX = null;
  function buildIndex() {
    const qs = D('questions');
    if (!qs) return null;
    const docs = [], df = new Map();
    for (const q of qs) {
      const toks = tokens(q.stem + ' ' + q.options + ' ' + q.theme + ' ' + q.sub);
      const tf = new Map();
      for (const t of toks) tf.set(t, (tf.get(t) || 0) + 1);
      for (const t of tf.keys()) df.set(t, (df.get(t) || 0) + 1);
      docs.push({q, tf, len: toks.length, text: norm(q.stem + ' ' + q.options)});
    }
    const avg = docs.reduce((n, d) => n + d.len, 0) / docs.length;
    return {docs, df, n: docs.length, avg};
  }
  function search(text, filter, limit) {
    INDEX = INDEX || buildIndex();
    if (!INDEX) return [];
    const qt = [...new Set(tokens(text))];
    if (!qt.length) return [];
    const phrase = norm(text);
    const out = [];
    for (const d of INDEX.docs) {
      if (filter && !filter(d.q)) continue;
      let s = 0;
      for (const t of qt) {
        const f = d.tf.get(t);
        if (!f) continue;
        const idf = Math.log(1 + (INDEX.n - INDEX.df.get(t) + 0.5) / (INDEX.df.get(t) + 0.5));
        s += idf * (f * 2.2) / (f + 1.2 * (0.25 + 0.75 * d.len / INDEX.avg));
      }
      if (s > 0 && phrase.length > 4 && d.text.includes(phrase)) s *= 1.6;
      if (s > 0) out.push({q: d.q, s});
    }
    out.sort((a, b) => b.s - a.s || b.q.year - a.q.year);
    return out.slice(0, limit || 50).map((x) => x.q);
  }

  // ------------------------------------------------------------------ parsing
  const wordRe = (phrase) => new RegExp('(^| )' + phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '( |$)');

  function parse(raw) {
    const q = ' ' + norm(raw) + ' ';
    const subjects = D('subject_summary') || [];
    const themes = D('theme_summary') || [];
    const res = {raw, q, subjects: [], themes: [], years: [], formats: [], n: null, used: []};

    // years and ranges
    const yrs = (q.match(/\b20(1[1-9]|2[0-6])\b/g) || []).map(Number);
    const range = q.match(/\b(20(?:1[1-9]|2[0-6]))\s*(?:to|till|until|-)\s*(20(?:1[1-9]|2[0-6]))\b/);
    if (range) { for (let y = +range[1]; y <= +range[2]; y++) res.years.push(y); }
    else if (/\b(since|after|from)\s+(20(1[1-9]|2[0-6]))\b/.test(q)) { const y = +q.match(/\b(since|after|from)\s+(20(?:1[1-9]|2[0-6]))\b/)[2]; for (let i = y; i <= Y1; i++) res.years.push(i); }
    else if (/\blast (\d+) years\b/.test(q)) { const k = Math.min(NP, +q.match(/\blast (\d+) years\b/)[1]); for (let i = Y1 + 1 - k; i <= Y1; i++) res.years.push(i); }
    else if (/\b(recent|recently|latest|new pattern)\b/.test(q)) { for (let i = Y1 - 3; i <= Y1; i++) res.years.push(i); res.recent = true; }
    else res.years.push(...yrs);
    if (/\blast year\b/.test(q) && !res.years.length) res.years.push(Y1);

    // top N
    const nm = q.match(/\b(?:top|best|first)\s+(\d{1,2})\b/) || q.match(/\b(\d{1,2})\s+(?:most|top)\b/);
    if (nm) res.n = Math.max(1, Math.min(20, +nm[1]));

    // formats
    for (const [f, al] of Object.entries(FORMAT_ALIASES)) if (al.some((a) => wordRe(a).test(q))) res.formats.push(f);
    if (res.formats.includes('How many correct') && !/\b(format|type|style|pattern)\b/.test(q) && !/how many correct/.test(q)) res.formats = res.formats.filter((f) => f !== 'How many correct');

    // themes: alias phrases, then name overlap
    const themeByKey = new Map(themes.map((t) => [t.key, t]));
    const found = new Map();
    ensureGlossary();
    const aliasHits = [];
    for (const [key, al] of Object.entries(THEME_ALIASES)) {
      const hit = al.filter((a) => wordRe(a).test(q)).sort((a, b) => b.length - a.length)[0];
      if (hit && themeByKey.has(key)) aliasHits.push([key, hit]);
    }
    for (const [key, hit] of aliasHits) {
      if (aliasHits.some(([k2, h2]) => k2 !== key && h2.length > hit.length && wordRe(hit).test(' ' + h2 + ' '))) continue;
      found.set(key, Math.max(found.get(key) || 0, 1 + hit.length / 100));
    }
    const subjWords = new Set(Object.values(SUBJECT_ALIASES).flat().flatMap((a) => a.split(' ')).map(stem));
    const qTok = new Set(tokens(q));
    for (const t of themes) {
      const tt = tokens(t.theme).filter((w) => !['miscellaneou', 'general', 'other'].includes(w));
      if (!tt.length) continue;
      const m = tt.filter((w) => qTok.has(w));
      if (!m.length) continue;
      const score = m.length / tt.length;
      const informative = m.some((w) => !subjWords.has(w));
      // a theme named only by subject words ("Ancient History – General") never wins over the subject itself
      if (informative && score >= 0.5) found.set(t.key, Math.max(found.get(t.key) || 0, score));
    }
    const ranked = [...found.entries()].sort((a, b) => b[1] - a[1]);
    res.themes = ranked.map(([k]) => themeByKey.get(k));
    res.themeScores = ranked.map(([, v]) => v);

    // subjects
    const subjByKey = new Map(subjects.map((s) => [s.key, s]));
    // "ancient history" beats the bare "history" (Modern): drop an alias hit that sits inside a longer hit
    const sHits = [];
    for (const [key, al] of Object.entries(SUBJECT_ALIASES)) for (const a of al) if (wordRe(a).test(q)) sHits.push({key, a});
    for (const h of sHits) {
      if (sHits.some((o) => o.key !== h.key && o.a.length > h.a.length && wordRe(h.a).test(o.a))) continue;
      if (subjByKey.has(h.key) && !res.subjects.includes(subjByKey.get(h.key))) res.subjects.push(subjByKey.get(h.key));
    }
    // glossary words that span themes ("vaccines", "coral") set the subject but stay as search words
    if (!res.subjects.length && !res.themes.length) {
      for (const [key, terms] of Object.entries(SUBJECT_TOPICS)) if (terms.some((a) => wordRe(a).test(q)) && subjByKey.has(key)) res.subjects.push(subjByKey.get(key));
      if (res.subjects.length) res.subjectFromGlossary = true;
    }
    resolveLevels(res, qTok, subjWords);
    return res;
  }



  // ------------------------------------------------------------------ theme guesser (a small statistical model, no AI)
  // Learns from the 1,114 tagged questions which words belong to which theme (word counts per theme), then scores a new
  // question against every theme. This is a Naive Bayes classifier with Dirichlet smoothing: for each word,
  //   P(word | theme) = (times the word appears in that theme + mu * P(word overall)) / (words in that theme + mu)
  // and a theme's score is the sum of log P(word | theme) over the question's words. Scores become percentages (softmax).
  // mu = smoothing (tuned on chat-tests: anything from 60 to 1000 scores within 1 test; 500 was best)
  // auto = guess on its own at this confidence; ask = below auto but above this, ask back with the top themes
  const NBP = {mu: 500, auto: 0.5, ask: 0.3, replaceWeak: 0.6, minEvidence: 1};
  let NB = null;
  function buildGuesser() {
    const themes = (D('theme_summary') || []).filter((t) => t.subjectKey !== 'other_thin_data' || t.count >= 3);
    const counts = new Map(themes.map((t) => [t.key, new Map()])), totals = new Map(themes.map((t) => [t.key, 0]));
    const global = new Map(); let G = 0;
    const add = (key, toks, w) => {
      const m = counts.get(key); if (!m) return;
      for (const x of toks) { m.set(x, (m.get(x) || 0) + w); totals.set(key, totals.get(key) + w); global.set(x, (global.get(x) || 0) + w); G += w; }
    };
    for (const q of D('questions') || []) add(q.themeKey, tokens(q.stem + ' ' + q.options + ' ' + q.sub), 1);
    for (const t of themes) add(t.key, tokens(t.theme), 3);                                        // the theme's own name
    for (const [k, al] of Object.entries(THEME_ALIASES)) add(k, al.flatMap((a) => tokens(a)), 2);  // hand-written aliases
    return {themes, counts, totals, global, G};
  }
  // returns [{theme, p}] best first, plus the words that counted as evidence; null if no word is known
  function guessTheme(qToks, subjectKey) {
    NB = NB || buildGuesser();
    const toks = [...new Set(qToks)].filter((t) => NB.global.has(t));
    if (toks.length < NBP.minEvidence) return null;
    const cands = NB.themes.filter((t) => !subjectKey || t.subjectKey === subjectKey);
    if (!cands.length) return null;
    const scored = cands.map((t) => {
      const m = NB.counts.get(t.key), tot = NB.totals.get(t.key);
      let s = 0;
      for (const x of toks) s += Math.log(((m.get(x) || 0) + NBP.mu * NB.global.get(x) / NB.G) / (tot + NBP.mu));
      return {theme: t, s};
    }).sort((a, b) => b.s - a.s);
    const top = scored[0].s, z = scored.reduce((a, x) => a + Math.exp(x.s - top), 0);
    return {list: scored.slice(0, 5).map((x) => ({theme: x.theme, p: Math.exp(x.s - top) / z})), words: toks};
  }

  // ------------------------------------------------------------------ the 4-step resolver
  // 1 SUBJECT  → named subject (aliases); otherwise inferred later from the theme / sub-topic / matches
  // 2 THEME    → aliases + theme-name words, searched only inside the subject if one was named
  // 3 SUB-TOPIC→ sub-topic-name words, searched only inside the theme (or subject) found so far
  // 4 QUERY    → question type (intent) + any leftover keyword, searched only inside the levels above
  const GENERIC_SUB = new Set(['concept', 'concepts', 'feature', 'features', 'basic', 'basics', 'role', 'provision', 'provisions', 'power', 'powers',
    'related', 'issue', 'issues', 'specific', 'india', 'indian', 'other', 'general', 'status', 'nature', 'their', 'misc', 'miscellaneous',
    'policy', 'policies', 'institution', 'institutions', 'system', 'systems', 'key', 'major', 'important', 'news', 'current', 'world'].map(stem));
  const EXTRA_STOP = new Set(('tell know need want like please explain detail details info information data analysis more less better good best must ' +
    'would day days nowaday nowadays now time times kindly also then only just okay ok same thing things way part parts much lot lots exam cse gs ' +
    'mains area areas field chapter chapters section sections sub subtopic subtopics come came comes appear appeared appearing frequently frequent ' +
    'often generally usually mostly should overall whole entire general across since after before from till until last latest recent recently ' +
    'year years share percentage percent proportion ratio every each ' +
    // Marathi / Hindi filler words
    'aahe ahe ka kay ke ki ko mein me madhe madhye hai hain kya che chi cha chya ani aur ya va sathi saathi var mala mujhe kon konte konta kaun kasa kashi kase kaise ' +
    'pahije chahiye sanga sangaa bata hota hote hoti').split(' ').map(stem));
  const isIntentWord = (w) => INTENTS.some(([, test]) => test(' ' + w + ' ', {formats: []}));

  function resolveLevels(res, qTok, subjWords) {
    const q = res.q;
    const comparing = /\b(vs|versus|compare|compared|comparison)\b/.test(q);
    const how = res.how = {};
    if (res.subjects.length) how.subject = 'named';

    // STEP 2 inside STEP 1: keep only themes of the named subject; if none, look again (more loosely) inside it
    if (res.subjects.length && !comparing) {
      const keys = new Set(res.subjects.map((x) => x.key));
      const pairs = res.themes.map((t, i) => [t, res.themeScores[i]]).filter(([t]) => keys.has(t.subjectKey));
      if (!pairs.length) {
        for (const t of (D('theme_summary') || []).filter((t) => keys.has(t.subjectKey))) {
          const tt = tokens(t.theme).filter((w) => !GENERIC_SUB.has(w));
          const m = tt.filter((w) => qTok.has(w) && !subjWords.has(w));
          if (m.length) pairs.push([t, m.length / tt.length]);
        }
        pairs.sort((a, b) => b[1] - a[1]);
      }
      res.themes = pairs.map(([t]) => t); res.themeScores = pairs.map(([, v]) => v);
    }
    if (res.themes.length) how.theme = 'named';

    // STEP 2b: the theme guesser — when nothing matched, or the only match is a weak single word ("commission", "rights")
    const weak = res.themes.length && res.themeScores[0] < 1 && !Object.entries(THEME_ALIASES).some(([k, al]) => k === res.themes[0].key && al.some((a) => wordRe(a).test(q)));
    if (!comparing && (!res.themes.length || weak)) {
      const evidence = norm(q).split(' ').filter((w) => w && !STOP.has(w) && !isIntentWord(w) && !/^20(1[1-9]|2[0-6])$/.test(w)).map(stem)
        .filter((w) => w && !STOP.has(w) && !EXTRA_STOP.has(w) && !subjWords.has(w));
      const pool = res.subjects[0] ? qsWhere((x) => x.subjectKey === res.subjects[0].key) : (D('questions') || []);
      const literal = !weak && evidence.length ? keywordHits(pool, evidence).length : 0;
      const g = evidence.length && literal < 3 ? guessTheme(evidence, res.subjects[0] && res.subjects[0].key) : null;
      if (g) {
        const best = g.list[0];
        res.guess = {options: g.list.slice(0, 3).map((x) => ({key: x.theme.key, theme: x.theme.theme, p: Math.round(100 * x.p)})), words: g.words};
        if (!res.themes.length && best.p >= NBP.auto) {
          res.themes = [best.theme]; res.themeScores = [best.p]; how.theme = `guessed ${Math.round(100 * best.p)}%`;
        } else if (weak && best.theme.key !== res.themes[0].key && best.p >= NBP.replaceWeak) {
          res.themes = [best.theme]; res.themeScores = [best.p]; how.theme = `guessed ${Math.round(100 * best.p)}%`;
        } else if (!res.themes.length && best.p >= NBP.ask) {
          res.askThemes = g.list.filter((x) => x.p >= 0.1).slice(0, 3);
        }
      }
    }

    // which words have been "used up" by the subject and theme
    const used = new Set();
    for (const [key, al] of Object.entries(SUBJECT_ALIASES)) for (const a of al) if (wordRe(a).test(q)) tokens(a).forEach((w) => used.add(w));
    if (res.themes[0]) tokens(res.themes[0].theme).forEach((w) => used.add(w));
    const aliasUsed = new Set();
    if (res.themes[0]) for (const a of THEME_ALIASES[res.themes[0].key] || []) if (wordRe(a).test(q)) tokens(a).forEach((w) => aliasUsed.add(w));

    // STEP 3: sub-topic, inside the theme (or subject) found so far
    if (!comparing) {
      const subs = (D('sub_summary') || []).filter((r) => res.themes[0] ? r.themeKey === res.themes[0].key
        : res.subjects[0] ? r.themeKey.startsWith(res.subjects[0].key + '--') : true);
      let best = null;
      for (const r of subs) {
        const tt = tokens(r.sub).filter((w) => !GENERIC_SUB.has(w));
        if (!tt.length) continue;
        const m = tt.filter((w) => qTok.has(w) && !used.has(w) && !aliasUsed.has(w));
        if (!m.length) continue;
        const score = m.length / tt.length;
        const strong = m.some((w) => w.length >= 5 || /\d/.test(w));
        const ok = res.themes[0] ? strong : (score >= 0.5 && strong);
        if (ok && (!best || score > best.score || (score === best.score && r.count > best.r.count))) best = {r, score, m};
      }
      if (!best && res.themes[0] && how.theme === 'named') {
        for (const r of (D('sub_summary') || []).filter((r) => !res.subjects[0] || r.themeKey.startsWith(res.subjects[0].key + '--'))) {
          const tt = tokens(r.sub).filter((w) => !GENERIC_SUB.has(w));
          if (tt.length >= 2 && tt.every((w) => qTok.has(w))) { best = {r, score: 1}; res.themes = []; break; }
        }
      }
      if (best) {
        res.sub = best.r; how.sub = 'named';
        tokens(best.r.sub).forEach((w) => used.add(w));
        if (!res.themes[0]) { res.themes = [(D('theme_summary') || []).find((t) => t.key === best.r.themeKey)]; res.themeScores = [1]; how.theme = 'from sub-topic'; }
      }
    }
    if (res.themes[0] && !res.subjects.length) how.subject = how.subject || 'from theme';

    // STEP 4: leftover words become a keyword to search inside the levels above
    const skip = new Set();
    for (const [, al] of Object.entries(FORMAT_ALIASES)) for (const a of al) if (wordRe(a).test(q)) tokens(a).forEach((w) => skip.add(w));
    const words = norm(q).split(' ').filter(Boolean);
    const kept = [];
    for (const w of words) {
      const st = stem(w);
      if (!st || STOP.has(w) || STOP.has(st) || EXTRA_STOP.has(st) || used.has(st) || skip.has(st) || subjWords.has(st)) continue;
      if (/^20(1[1-9]|2[0-6])$/.test(w) || (res.n && w === String(res.n)) || /^\d$/.test(w)) continue;
      if (isIntentWord(w)) continue;
      if (comparing && res.themes.some((t) => tokens(t.theme).includes(st))) continue;
      if (!kept.some((k) => k.st === st)) kept.push({w, st});
    }
    res.kw = kept.length && !comparing ? {tokens: kept.map((k) => k.st), text: kept.map((k) => k.w).join(' ')} : null;
  }

  // ------------------------------------------------------------------ the reader: WHAT is the question about? (one index, both engines)
  // Every name the bot knows — subjects, themes, sub-topics (their full names), their aliases and glossary words, and the keywords
  // of the written solutions — goes into one index. A question is read by finding these names first: the longest match wins, and
  // for the same words a full name beats a solution keyword, which beats an alias. Only the words left over are read for WHAT is
  // being asked, so "Basic Economic Concepts" or "Climate Change" can't be mistaken for "repeated concepts" or "trend".
  const PRIO = {name: 3, term: 2, alias: 1};
  const KIND_RANK = {theme: 0.3, subject: 0.2, sub: 0.1, term: 0};
  let ENT = null;
  function buildEntities() {
    ensureGlossary();
    const byFirst = new Map();
    const add = (phrase, e) => {
      const toks = tokens(phrase);
      if (!toks.length || toks.every((w) => /^\d+$/.test(w))) return;
      const x = Object.assign({toks, score: toks.length * 10 + PRIO[e.src] + KIND_RANK[e.kind]}, e);
      if (!byFirst.has(toks[0])) byFirst.set(toks[0], []);
      const list = byFirst.get(toks[0]);
      if (!list.some((o) => o.kind === x.kind && o.key === x.key && o.src === x.src && o.toks.join(' ') === toks.join(' '))) list.push(x);
    };
    for (const s of D('subject_summary') || []) {
      add(s.subject, {kind: 'subject', key: s.key, name: s.subject, src: 'name', ref: s});
      for (const a of SUBJECT_ALIASES[s.key] || []) add(a, {kind: 'subject', key: s.key, name: s.subject, src: 'alias', ref: s});
    }
    for (const t of D('theme_summary') || []) {
      if (/\b(general|miscellaneous|other)\b/i.test(t.theme)) continue;
      add(t.theme, {kind: 'theme', key: t.key, name: t.theme, src: 'name', ref: t});
      for (const a of THEME_ALIASES[t.key] || []) add(a, {kind: 'theme', key: t.key, name: t.theme, src: 'alias', ref: t});
    }
    for (const r of D('sub_summary') || []) add(r.sub, {kind: 'sub', key: r.themeKey + '|' + r.sub, name: r.sub, src: 'name', ref: r});
    const TQ = (window.PQ_TUTOR || {}).questions || [];
    for (const q of TQ) for (const k of ((q.sol || {}).kw || [])) {
      const term = String(k[0] || '');
      const plain = term.replace(/\([^)]*\)/g, ' ').trim();
      if (plain) add(plain, {kind: 'term', key: norm(plain), name: plain, src: 'term'});
      if (/-/.test(plain)) add(plain.replace(/-/g, ''), {kind: 'term', key: norm(plain), name: plain, src: 'term'});   // "procyclical" = "pro-cyclical"
      const acr = (term.match(/\(([A-Z][A-Za-z&-]*[A-Z])\)/) || [])[1];
      if (acr) add(acr, {kind: 'term', key: norm(plain), name: plain, src: 'term'});
    }
    return {byFirst};
  }

  // read(text): text is already spell-corrected and translated (see readQuestion)
  function read(text) {
    ENT = ENT || buildEntities();
    const words = norm(text).split(' ').filter(Boolean);
    const toks = [];
    words.forEach((w, i) => { if (STOP.has(w)) return; const s = stem(w); if (s && !STOP.has(s)) toks.push({s, i}); });
    const found = [];
    for (let a = 0; a < toks.length; a++) {
      for (const e of ENT.byFirst.get(toks[a].s) || []) {
        const n = e.toks.length;
        if (a + n > toks.length) continue;
        let ok = true;
        for (let j = 1; j < n; j++) if (toks[a + j].s !== e.toks[j]) { ok = false; break; }
        if (ok) found.push({e, a, z: a + n - 1});
      }
    }
    found.sort((x, y) => y.e.score - x.e.score);
    const taken = new Set(), spans = [];
    for (const m of found) {
      let free = true;
      for (let k = m.a; k <= m.z; k++) if (taken.has(k)) { free = false; break; }
      if (!free) continue;
      for (let k = m.a; k <= m.z; k++) taken.add(k);
      // the same words naming another thing of the same kind and rank → a real tie, the bot must ask
      const alts = found.filter((o) => o.a === m.a && o.z === m.z && o.e.kind === m.e.kind && o.e.score === m.e.score && o.e.key !== m.e.key).map((o) => o.e);
      spans.push(Object.assign({}, m.e, {from: toks[m.a].i, to: toks[m.z].i, alts}));
    }
    spans.sort((x, y) => x.from - y.from);
    // words inside a found name are not read as question words (single-word aliases are left alone: "current", "trend"…)
    const hide = new Set();
    for (const sp of spans) if (sp.src !== 'alias' || sp.toks.length > 1) for (let i = sp.from; i <= sp.to; i++) hide.add(i);
    const rest = words.filter((w, i) => !hide.has(i));
    // content words outside every name (not years, numbers, intent or filler words): a term the bot doesn't index by name
    const leftover = toks.filter((t, k) => !taken.has(k) && !/^\d+$/.test(t.s) && !EXTRA_STOP.has(t.s) && !isIntentWord(words[t.i])).map((t) => words[t.i]);
    return {words, spans, masked: ' ' + rest.join(' ') + ' ', leftover};
  }
  const strongTheme = (sp) => sp.kind === 'theme' && (sp.src === 'name' || sp.toks.length > 1);
  let QTEXT = null;
  function phraseInQuestions(R) {
    QTEXT = QTEXT || (D('questions') || []).map((q) => ' ' + norm(q.stem + ' ' + q.options) + ' ');
    const ws = R.words.filter((w) => !STOP.has(w) && !isIntentWord(w) && !/^20\d\d$/.test(w));
    if (ws.length < 2) return false;
    const esc = (w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(' ' + ws.map((w) => esc(stem(w)) + '\\w*').join('(?: \\w+){0,2} ') + ' ');
    return QTEXT.some((t) => re.test(t));
  }
  const readQuestion = (raw) => { ensureGlossary(); return read(translate(norm(correct(raw).text)).text); };

  // what the reader found overrides the older word-overlap guesses: an exact theme / sub-topic name always wins
  function applyRead(p, R) {
    const subjSpans = R.spans.filter((x) => x.kind === 'subject');
    const named = subjSpans.map((x) => x.key);
    let th = R.spans.find(strongTheme);
    if (th && th.alts.length) {
      const all = [th, ...th.alts], inSubj = all.filter((x) => named.includes(x.ref.subjectKey));
      if (inSubj.length === 1) th = inSubj[0];
      else { p.tie = (inSubj.length ? inSubj : all).map((x) => x.ref); return; }
    }
    let sb = R.spans.find((x) => x.kind === 'sub');
    if (sb) {
      const all = [sb, ...sb.alts];
      const fit = all.filter((x) => th ? x.ref.themeKey === th.key : named.length ? named.some((k) => x.ref.themeKey.startsWith(k + '--')) : true);
      sb = fit.length === 1 ? fit[0] : null;
    }
    const themeByKey = (k) => (D('theme_summary') || []).find((t) => t.key === k);
    const t = th ? th.ref : sb ? themeByKey(sb.ref.themeKey) : null;
    if (t) {
      p.themes = [t, ...p.themes.filter((x) => x.key !== t.key)];
      p.themeScores = [2, ...p.themeScores.slice(1)];
      p.how.theme = th ? 'named' : 'from sub-topic';
      p.guess = null; p.askThemes = null;
      if (p.sub && p.sub.themeKey !== t.key) p.sub = null;
      // a subject counts only if it was named outside the theme's own name ("Agriculture Economy" names no subject)
      p.subjects = subjSpans.map((x) => x.ref).filter((x) => x.key === t.subjectKey);
      p.how.subject = p.subjects.length ? 'named' : 'from theme';
    }
    if (sb) { p.sub = sb.ref; p.how.sub = 'named'; }
    // words of a found subject / theme / sub-topic name are not a search keyword
    if (p.kw) {
      const inName = new Set(R.spans.filter((x) => x.kind !== 'term' && x.src === 'name').flatMap((x) => x.toks));
      const ws = p.kw.text.split(' ');
      const keep = p.kw.tokens.map((tk, i) => [tk, ws[i]]).filter(([tk]) => !inName.has(tk));
      p.kw = keep.length ? {tokens: keep.map((x) => x[0]), text: keep.map((x) => x[1]).join(' ')} : null;
    }
  }

  // questions in the narrowest scope found (sub-topic > theme > subject > whole paper)
  function scopePool(p) {
    if (p.sub) return qsWhere((q) => q.themeKey === p.sub.themeKey && q.sub === p.sub.sub);
    if (p.themes[0]) return qsWhere((q) => q.themeKey === p.themes[0].key);
    if (p.subjects[0]) return qsWhere((q) => q.subjectKey === p.subjects[0].key);
    return D('questions') || [];
  }
  // every keyword word must appear in the question (stem, options, theme or sub-topic name)
  function keywordHits(pool, kwTokens) {
    INDEX = INDEX || buildIndex();
    const byId = new Map(INDEX.docs.map((d) => [d.q.id, d]));
    return pool.filter((q) => { const d = byId.get(q.id); return d && kwTokens.every((t) => d.tf.has(t)); }).sort((a, b) => b.year - a.year);
  }
  const majority = (list, keyFn) => {
    const c = new Map(); list.forEach((x) => c.set(keyFn(x), (c.get(keyFn(x)) || 0) + 1));
    const [k, n] = [...c.entries()].sort((a, b) => b[1] - a[1])[0] || [];
    return k && n / list.length >= 0.6 ? k : null;
  };
  function trendOf(counts) {
    const avg = (a, z) => counts.slice(a - Y0, z - Y0 + 1).reduce((x, y) => x + y, 0) / (z - a + 1);
    const a = avg(2011, 2015), m = avg(2016, 2020), c = avg(2021, 2026), total = counts.reduce((x, y) => x + y, 0);
    const t = total < 4 ? 'Too few' : (c >= a * 1.5 && c - a >= 0.5) ? 'Rising' : (a >= c * 1.5 && a - c >= 0.5) ? 'Falling' : 'Steady';
    return {a, m, c, t};
  }

  // answers for the two new levels: a sub-topic, or a keyword inside any level
  function ansScope(p, intent) {
    const ys = p.years, fmtF = p.formats[0];
    const all = p.hits || scopePool(p);
    const list = all.filter((q) => inYears(ys)(q) && (!fmtF || q.format === fmtF));
    const name = p.hits ? `“${p.kw.text}”` + (p.sub ? ` in ${p.sub.sub}` : p.themes[0] ? ` in ${p.themes[0].theme}` : p.subjects[0] ? ` in ${p.subjects[0].subject}` : '') : p.sub.sub;
    const counts = YEARS.map((y) => all.filter((q) => q.year === y && (!fmtF || q.format === fmtF)).length);
    const color = subjColor((p.themes[0] || {}).subjectKey || (p.subjects[0] || {}).key || (all[0] || {}).subjectKey);
    const yrs = YEARS.filter((y, i) => counts[i]);
    const th = p.themes[0] || (all.length && (D('theme_summary') || []).find((t) => t.key === majority(all, (q) => q.themeKey)));
    const actions = th ? [openTheme(th)] : [];
    const dropKw = p.hits ? [{label: p.sub ? `Whole sub-topic instead` : p.themes[0] ? `Whole theme instead` : p.subjects[0] ? 'Whole subject instead' : 'Ignore the keyword', run: () => ask(p.raw, {noKw: true})}] : [];
    // where the matches sit, one level below the scope
    const groupKey = p.sub ? null : p.themes[0] ? (q) => q.sub : p.subjects[0] ? (q) => q.theme : (q) => q.subject;
    const where = () => {
      if (!groupKey || list.length < 2) return null;
      const c = new Map(); list.forEach((q) => c.set(groupKey(q), (c.get(groupKey(q)) || 0) + 1));
      const rows = [...c.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
      return rows.length > 1 ? [el('p', {class: 'pqc-cap'}, 'Where they sit'), bars(rows.map(([l, v]) => ({label: l, value: v, color})))] : null;
    };
    const tr = trendOf(counts);
    if (!list.length) return {miss: 'no-results', text: [`No questions on `, b(name), ys.length ? ` in ${yearsLabel(ys)}` : '', '.'], blocks: [spark(counts, color, name)], actions: [...actions, ...dropKw], suggest: []};
    if (intent === 'questions') return {text: [b(list.length), ` question${list.length === 1 ? '' : 's'} on `, b(name), ys.length ? ` in ${yearsLabel(ys)}` : '', ':'], blocks: [qlist(list)], actions: [...actions, ...dropKw], suggest: [`When was it asked?`, `Is it rising?`]};
    if (intent === 'when') return {text: [b(name), ` was asked in `, b(yrs.length), ` of ${NP} papers: `, yrs.join(', '), '. Last asked in ', b(yrs[yrs.length - 1]), '.'], blocks: [spark(counts, color, name)], actions: [...actions, ...dropKw], suggest: ['Show them']};
    if (intent === 'trend') return {text: [b(name), ` is `, b(trendWord(tr.t)), ': ', b(fmt1(tr.a)), ' → ', b(fmt1(tr.m)), ' → ', b(fmt1(tr.c)), ' questions a paper (2011–15 → 2016–20 → 2021–26).'], blocks: [spark(counts, color, name)], actions: [...actions, ...dropKw], suggest: ['Show them']};
    // count + overview
    return {text: [b(list.length), ` question${list.length === 1 ? '' : 's'} on `, b(name), ys.length ? ` in ${yearsLabel(ys)}` : '', `, asked in ${yrs.length} of ${NP} papers`, yrs.length ? [', last in ', b(yrs[yrs.length - 1])] : '', `. Trend: ${trendWord(tr.t)}.`],
      blocks: [spark(counts, color, name), where(), intent === 'overview' ? qlist(list, 2) : null].flat(), actions: [{label: `Show all ${list.length}`, run: () => ask('show them')}, ...actions, ...dropKw],
      suggest: ['Is it rising?', 'When was it asked?']};
  }

  // ------------------------------------------------------------------ DOM helpers
  const el = (tag, attrs, ...kids) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v; else if (k === 'style') e.style.cssText = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v);
    }
    for (const k of kids.flat(Infinity)) if (k != null && k !== false) e.append(k instanceof Node ? k : document.createTextNode(String(k)));
    return e;
  };
  const b = (t) => el('b', null, t);
  const subjColor = (key) => (window.PQ && PQ.subjColor) ? PQ.subjColor(key) : 'var(--series-1)';
  const trendWord = (t) => t === 'Rising' ? '↑ rising' : t === 'Falling' ? '↓ falling' : t === 'Steady' ? '→ steady' : 'too few to call';

  function spark(counts, color, label) {
    const ns = 'http://www.w3.org/2000/svg', W = counts.length * 14, H = 46;
    const max = Math.max(1, ...counts);
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H + 12}`);
    svg.setAttribute('class', 'pqc-spark');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', label);
    counts.forEach((c, i) => {
      const h = c ? Math.max(2, (H - 10) * c / max) : 1;
      const r = document.createElementNS(ns, 'rect');
      r.setAttribute('x', i * 14 + 2); r.setAttribute('y', H - h); r.setAttribute('width', 10); r.setAttribute('height', h); r.setAttribute('rx', 2);
      r.style.fill = c ? color : 'var(--cds-chart-grid)';
      const tt = document.createElementNS(ns, 'title'); tt.textContent = `${YEARS[i]}: ${c}`; r.appendChild(tt);
      svg.appendChild(r);
      if (c) { const t = document.createElementNS(ns, 'text'); t.setAttribute('x', i * 14 + 7); t.setAttribute('y', H - h - 2); t.setAttribute('text-anchor', 'middle'); t.setAttribute('class', 'pqc-spark-v'); t.textContent = c; svg.appendChild(t); }
      if (i % 2 === 0) { const t = document.createElementNS(ns, 'text'); t.setAttribute('x', i * 14 + 7); t.setAttribute('y', H + 10); t.setAttribute('text-anchor', 'middle'); t.setAttribute('class', 'pqc-spark-y'); t.textContent = "'" + String(YEARS[i]).slice(2); svg.appendChild(t); }
    });
    return svg;
  }
  function bars(items) {
    const max = Math.max(1, ...items.map((i) => i.value));
    return el('div', {class: 'pqc-bars'}, items.map((i) => {
      const fill = el('span', {class: 'pqc-fill'}); fill.style.width = (100 * i.value / max) + '%'; fill.style.background = i.color || 'var(--series-1)';
      const row = el(i.onclick ? 'button' : 'div', {class: 'pqc-bar', type: i.onclick ? 'button' : null, onclick: i.onclick},
        el('span', {class: 'pqc-bar-l'}, i.label, i.note ? el('small', null, ' ' + i.note) : null),
        el('span', {class: 'pqc-bar-v'}, i.valueText != null ? i.valueText : String(i.value)),
        el('span', {class: 'pqc-track'}, fill));
      return row;
    }));
  }
  function stats(list) {
    return el('div', {class: 'pqc-stats'}, list.map(([v, l]) => el('div', {class: 'pqc-stat'}, el('b', null, v), el('span', null, l))));
  }
  function qcard(q) {
    const opts = el('ol', {class: 'pqc-opts'}, String(q.options || '').split('\n').filter(Boolean).map((o) => el('li', null, o)));
    return el('article', {class: 'pqc-q'},
      el('div', {class: 'pqc-q-meta'}, el('span', {class: 'pqc-tag'}, String(q.year)), el('span', null, q.theme + ' · ' + q.sub), q.ca ? el('span', {class: 'pqc-tag'}, 'Current affairs') : null),
      el('p', {class: 'pqc-q-stem'}, q.stem), opts,
      el('details', null, el('summary', null, 'Show answer'), el('p', {class: 'pqc-ans'}, `(${q.answer}) ${q.answerText}`, q.tentative ? ' — tentative' : '')));
  }
  function qlist(list, shown) {
    const box = el('div', {class: 'pqc-qs'});
    let n = shown || 3;
    const draw = () => {
      box.replaceChildren(...list.slice(0, n).map(qcard));
      if (list.length > n) box.append(el('button', {type: 'button', class: 'pqc-more', onclick: () => { n += 5; draw(); }}, `Show ${Math.min(5, list.length - n)} more (${list.length - n} left)`));
    };
    draw();
    return box;
  }
  const openSubject = (s) => ({label: `Open ${s.subject} analysis →`, run: () => { PQ.pickSubject(s.key); maybeClose(); }});
  const openTheme = (t) => ({label: `Open ${t.theme} →`, run: () => { PQ.pickTheme(t.key, t.subjectKey); maybeClose(); }});
  const short = (s) => s.subject === 'Science & Technology' ? 'S&T' : s.subject === 'International Relations' ? 'IR' : s.subject.replace('Indian ', '');

  // ------------------------------------------------------------------ data lookups
  const subjectByKey = (k) => (D('subject_summary') || []).find((s) => s.key === k);
  const themesOf = (sk) => (D('theme_summary') || []).filter((t) => t.subjectKey === sk).sort((a, b) => a.rank - b.rank);
  const subjYearCounts = (sk) => YEARS.map((y) => ((D('subject_year') || []).find((r) => r.key === sk + '|' + y) || {}).count || 0);
  const themeYearCounts = (tk) => YEARS.map((y) => ((D('theme_year') || []).find((r) => r.key === tk + '|' + y) || {}).count || 0);
  const insightsOf = () => D('insights') || {subjects: {}, themes: {}};
  const firstSentences = (s, n) => (String(s || '').match(/[^.!?]+[.!?]+/g) || [s || '']).slice(0, n || 2).join(' ').trim();
  function qsWhere(fn) { return (D('questions') || []).filter(fn); }
  const yearsLabel = (ys) => ys.length === 1 ? String(ys[0]) : ys.length === NP ? '2011–2026' : `${ys[0]}–${ys[ys.length - 1]}`;
  const inYears = (ys) => (q) => !ys.length || ys.includes(q.year);

  // ------------------------------------------------------------------ answers
  // Each returns {text: [...nodes], blocks: [...nodes], actions: [{label, run}], suggest: [...strings]}
  function ansSubjectOverview(s) {
    const counts = subjYearCounts(s.key);
    const top = themesOf(s.key).slice(0, 4);
    const ov = (insightsOf().subjects[s.key] || {}).overview;
    return {
      text: [b(s.subject), ` has `, b(s.count), ` questions (`, b(s.sharePaper + '%'), ` of the paper), `, trendWord(s.trend), `: `, b(fmt1(s.avgEarly)), ' → ', b(fmt1(s.avgRecent)), ' a paper from 2011–15 to 2021–26.'],
      blocks: [spark(counts, subjColor(s.key), `${s.subject} per year`),
        el('p', {class: 'pqc-cap'}, 'Heaviest themes'),
        bars(top.map((t) => ({label: t.theme, value: t.count, color: subjColor(s.key), onclick: () => ask(`Tell me about ${t.theme}`)}))),
        ov ? el('p', {class: 'pqc-note'}, firstSentences(ov, 2)) : null],
      actions: [openSubject(s)],
      suggest: [`Top 5 themes in ${short(s)}`, `How to prepare ${short(s)}`, `${short(s)} questions in 2023`]
    };
  }
  function ansThemeOverview(t) {
    const s = subjectByKey(t.subjectKey);
    const ti = insightsOf().themes[t.key] || {};
    const subs = (D('sub_summary') || []).filter((r) => r.themeKey === t.key).slice(0, 4);
    return {
      text: [b(t.theme), ` (${s.subject}): `, b(t.count), ` questions in `, b(t.yearsAsked), ` of ${NP} papers, last asked in `, b(t.lastYear), `. Trend: ${trendWord(t.trend)} (`, b(fmt1(t.avgEarly)), ' → ', b(fmt1(t.avgRecent)), ' a paper).', ti.priority ? [' Priority: ', b(ti.priority), '.'] : ''],
      blocks: [spark(themeYearCounts(t.key), subjColor(t.subjectKey), `${t.theme} per year`),
        subs.length > 1 ? el('p', {class: 'pqc-cap'}, 'Sub-topics') : null,
        subs.length > 1 ? bars(subs.map((r) => ({label: r.sub, value: r.count, color: subjColor(t.subjectKey)}))) : null,
        ti.summary ? el('p', {class: 'pqc-note'}, firstSentences(ti.summary, 2)) : null],
      actions: [openTheme(t)],
      suggest: [`Show questions on ${t.theme}`, `What to study for ${t.theme}`, `When was ${t.theme} asked`]
    };
  }

  function ansCount(p) {
    const ys = p.years;
    if (p.formats.length) return ansFormats(p);
    if (p.themes[0]) {
      const t = p.themes[0];
      const counts = themeYearCounts(t.key);
      const n = ys.length ? ys.reduce((a, y) => a + counts[y - Y0], 0) : t.count;
      return {text: [b(n), ` question${n === 1 ? '' : 's'} on `, b(t.theme), ` in ${ys.length ? yearsLabel(ys) : '2011–2026'}.`],
        blocks: [spark(counts, subjColor(t.subjectKey), `${t.theme} per year`)], actions: [openTheme(t)],
        suggest: [`Show questions on ${t.theme}${ys.length === 1 ? ' in ' + ys[0] : ''}`, `Is ${t.theme} rising?`]};
    }
    if (p.subjects[0]) {
      const s = p.subjects[0];
      const counts = subjYearCounts(s.key);
      const n = ys.length ? ys.reduce((a, y) => a + counts[y - Y0], 0) : s.count;
      const blocks = [spark(counts, subjColor(s.key), `${s.subject} per year`)];
      if (ys.length === 1) {
        const ty = (D('theme_year') || []).filter((r) => r.subjectKey === s.key && r.year === ys[0] && r.count > 0).sort((a, b) => b.count - a.count);
        blocks.push(el('p', {class: 'pqc-cap'}, `Themes asked in ${ys[0]}`), bars(ty.map((r) => ({label: r.theme, value: r.count, color: subjColor(s.key)}))));
      }
      const showQs = ys.length && n ? [{label: `Show these ${n} questions`, run: () => ask(`Show ${short(s)} questions in ${yearsLabel(ys).replace('–', ' to ')}`)}] : [];
      return {text: [b(n), ` ${s.subject} question${n === 1 ? '' : 's'} in ${ys.length ? yearsLabel(ys) : '2011–2026'}.`], blocks, actions: [...showQs, openSubject(s)],
        suggest: ys.length === 1 ? [`Show ${short(s)} questions in ${ys[0]}`] : [`Top themes in ${short(s)}`]};
    }
    if (ys.length) {
      const sy = D('subject_year') || [];
      const subs = D('subject_summary') || [];
      const rows = subs.map((s) => ({s, n: sy.filter((r) => r.subjectKey === s.key && ys.includes(r.year)).reduce((a, r) => a + r.count, 0)})).sort((a, b) => b.n - a.n);
      const total = rows.reduce((a, r) => a + r.n, 0);
      return {text: [`The dataset has `, b(total), ` questions from ${yearsLabel(ys)}. By subject:`],
        blocks: [bars(rows.filter((r) => r.n).map((r) => ({label: r.s.subject, value: r.n, color: subjColor(r.s.key), onclick: () => ask(`${short(r.s)} in ${yearsLabel(ys)}`)})))],
        actions: [], suggest: [`Question formats in ${ys[ys.length - 1]}`]};
    }
    return ansOverall();
  }

  function ansOverall() {
    const subs = D('subject_summary') || [];
    const total = subs.reduce((a, s) => a + s.count, 0);
    return {text: [b(total), ` questions from ${NP} papers (2011–2026), across `, b(subs.length), ' subject groups:'],
      blocks: [bars(subs.map((s) => ({label: s.subject, value: s.count, note: s.sharePaper + '%', color: subjColor(s.key), onclick: () => ask(`Tell me about ${s.subject}`)})))],
      actions: [{label: 'Open the overview →', run: () => { PQ.show('home'); maybeClose(); }}],
      suggest: ['Which themes are rising?', 'Themes asked every year', 'Question formats in 2023']};
  }

  function ansTop(p) {
    const n = p.n || 5;
    if (p.subjects[0] && !p.themes.length) {
      const s = p.subjects[0];
      const list = themesOf(s.key).slice(0, n);
      return {text: [`Top ${list.length} themes in `, b(s.subject), ' by number of questions:'],
        blocks: [bars(list.map((t) => ({label: t.theme, value: t.count, note: trendWord(t.trend), color: subjColor(s.key), onclick: () => ask(`Tell me about ${t.theme}`)})))],
        actions: [openSubject(s)], suggest: [`Which ${short(s)} themes are rising?`, `How to prepare ${short(s)}`]};
    }
    if (p.themes[0] && !GLOBAL_RE.test(p.q)) {
      // a theme named: rank its sub-topics (a "theme in Parliament" means the parts of Parliament)
      const t = p.themes[0];
      const subs = (D('sub_summary') || []).filter((r) => r.themeKey === t.key).sort((a, b) => b.count - a.count).slice(0, n);
      if (subs.length > 1) {
        return {text: [`Top sub-topics in `, b(t.theme), ` (${t.count} questions):`],
          blocks: [bars(subs.map((r) => ({label: r.sub, value: r.count, color: subjColor(t.subjectKey), onclick: () => ask(`Show questions on ${r.sub}`)})))],
          actions: [openTheme(t)], suggest: [`Most repeated in ${t.theme}`, `Is ${t.theme} rising?`, `Show questions on ${t.theme}`]};
      }
    }
    const wantThemes = /\btheme|topic|area|chapter\b/.test(p.q) || /\bmost (asked|important|repeated)\b/.test(p.q);
    if (wantThemes) {
      const list = [...(D('theme_summary') || [])].sort((a, b) => b.count - a.count).slice(0, n);
      return {text: [`Top ${list.length} themes across the whole paper:`],
        blocks: [bars(list.map((t) => ({label: t.theme, value: t.count, note: short(subjectByKey(t.subjectKey)), color: subjColor(t.subjectKey), onclick: () => ask(`Tell me about ${t.theme}`)})))],
        actions: [], suggest: ['Which themes are rising?', 'Themes asked every year']};
    }
    return ansOverall();
  }

  function ansTrend(p) {
    const wantDown = /\b(falling|declin|decreas|losing|less|reduc|down)/.test(p.q);
    if (p.themes[0]) {
      const t = p.themes[0];
      return {text: [b(t.theme), ` is `, b(trendWord(t.trend)), `: `, b(fmt1(t.avgEarly)), ' → ', b(fmt1(t.avgMid)), ' → ', b(fmt1(t.avgRecent)), ' questions a paper (2011–15 → 2016–20 → 2021–26).'],
        blocks: [spark(themeYearCounts(t.key), subjColor(t.subjectKey), `${t.theme} per year`)], actions: [openTheme(t)], suggest: [`Show questions on ${t.theme}`]};
    }
    let pool = (D('theme_summary') || []).filter((t) => t.trend !== 'Too few' && t.subjectKey !== 'other_thin_data');
    let scope = 'the whole paper';
    if (p.subjects[0]) {
      const s = p.subjects[0];
      if (!/\btheme|topic|area\b/.test(p.q)) {
        return {text: [b(s.subject), ` is `, b(trendWord(s.trend)), `: `, b(fmt1(s.avgEarly)), ' → ', b(fmt1(s.avgMid)), ' → ', b(fmt1(s.avgRecent)), ' questions a paper.'],
          blocks: [spark(subjYearCounts(s.key), subjColor(s.key), `${s.subject} per year`)], actions: [openSubject(s)],
          suggest: [`Which ${short(s)} themes are rising?`, `Which ${short(s)} themes are falling?`]};
      }
      pool = pool.filter((t) => t.subjectKey === s.key); scope = s.subject;
    }
    const withD = pool.map((t) => ({t, d: t.avgRecent - t.avgEarly}));
    const list = (wantDown ? withD.filter((x) => x.d < 0).sort((a, b) => a.d - b.d) : withD.filter((x) => x.d > 0).sort((a, b) => b.d - a.d)).slice(0, p.n || 6);
    if (!list.length) return {text: [`No ${wantDown ? 'falling' : 'rising'} themes with enough questions in ${scope}.`], blocks: [], actions: [], suggest: []};
    return {text: [`Themes ${wantDown ? 'losing' : 'gaining'} the most weight in ${scope} (questions a paper, 2011–15 → 2021–26):`],
      blocks: [bars(list.map(({t}) => ({label: t.theme, value: wantDown ? t.avgEarly : t.avgRecent, valueText: `${fmt1(t.avgEarly)} → ${fmt1(t.avgRecent)}`,
        note: short(subjectByKey(t.subjectKey)), color: subjColor(t.subjectKey), onclick: () => ask(`Tell me about ${t.theme}`)})))],
      actions: [], suggest: [wantDown ? `Which themes are rising?` : 'Which themes are falling?', 'Themes asked every year']};
  }

  function ansWhen(p) {
    const t = p.themes[0], s = !t && p.subjects[0];
    if (!t && !s) return null;
    const counts = t ? themeYearCounts(t.key) : subjYearCounts(s.key);
    const yrs = YEARS.filter((y, i) => counts[i]);
    const name = t ? t.theme : s.subject;
    return {text: [b(name), ` was asked in `, b(yrs.length), ` of ${NP} papers: `, yrs.join(', '), `. Last asked in `, b(yrs[yrs.length - 1]), '.'],
      blocks: [spark(counts, subjColor(t ? t.subjectKey : s.key), `${name} per year`)], actions: [t ? openTheme(t) : openSubject(s)],
      suggest: [`Show questions on ${name} in ${yrs[yrs.length - 1]}`]};
  }

  function ansAlways() {
    const list = (D('theme_summary') || []).filter((t) => t.yearsAsked >= NP - 2).sort((a, b) => b.yearsAsked - a.yearsAsked || b.count - a.count);
    return {text: [`Themes that appear in almost every paper (${NP - 2} or more of ${NP}):`],
      blocks: [bars(list.map((t) => ({label: t.theme, value: t.yearsAsked, valueText: `${t.yearsAsked}/${NP}`, note: short(subjectByKey(t.subjectKey)), color: subjColor(t.subjectKey), onclick: () => ask(`Tell me about ${t.theme}`)})))],
      actions: [], suggest: ['Which themes are rising?']};
  }

  function ansFormats(p) {
    const ys = p.years;
    if ((p.subjects[0] || p.themes[0]) && ys.length) {
      const key = p.themes[0] ? p.themes[0].key : p.subjects[0].key, name = p.themes[0] ? p.themes[0].theme : p.subjects[0].subject;
      const qs = qsWhere((q) => (p.themes[0] ? q.themeKey === key : q.subjectKey === key) && ys.includes(q.year));
      const agg = {}; qs.forEach((q) => { agg[q.format] = (agg[q.format] || 0) + 1; });
      const rows = Object.entries(agg).sort((a, b) => b[1] - a[1]);
      return {text: [`How `, b(name), ` questions were framed in ${yearsLabel(ys)} (`, b(qs.length), ' questions):'],
        blocks: [bars(rows.map(([f, c]) => ({label: f, value: c, valueText: `${c} (${Math.round(100 * c / qs.length)}%)`, color: subjColor(p.themes[0] ? p.themes[0].subjectKey : key)})))], actions: [], suggest: []};
    }
    if (p.subjects[0] && !ys.length) {
      const s = p.subjects[0];
      const rows = (D('format_mix') || []).filter((r) => r.subjectKey === s.key).sort((a, b) => b.count - a.count);
      return {text: [`How `, b(s.subject), ` questions are framed (2011–2026):`],
        blocks: [bars(rows.map((r) => ({label: r.format, value: r.count, valueText: `${r.count} (${r.share}%)`, color: subjColor(s.key)})))], actions: [openSubject(s)],
        suggest: [`Show ${short(s)} statement I–II questions`]};
    }
    const fy = (D('format_year') || []).filter((r) => !ys.length || ys.includes(r.year));
    const agg = {};
    for (const r of fy) agg[r.format] = (agg[r.format] || 0) + r.count;
    const rows = Object.entries(agg).sort((a, b) => b[1] - a[1]);
    const total = rows.reduce((a, r) => a + r[1], 0);
    const blocks = [bars(rows.map(([f, c]) => ({label: f, value: c, valueText: `${c} (${Math.round(100 * c / total)}%)`})))];
    if (p.formats[0]) {
      const f = p.formats[0];
      const per = YEARS.map((y) => ((D('format_year') || []).find((r) => r.year === y && r.format === f) || {}).count || 0);
      blocks.unshift(el('p', {class: 'pqc-cap'}, `"${f}" questions per year`), spark(per, 'var(--series-4)', `${f} per year`));
    }
    return {text: [`Question formats in ${ys.length ? yearsLabel(ys) : '2011–2026'} (all subjects, `, b(total), ' questions):'], blocks, actions: [],
      suggest: ['Question formats in 2023', 'Question formats in 2015']};
  }

  function ansCA(p) {
    const t = p.themes[0], s = p.subjects[0];
    if (t) return {text: [b(t.caShare + '%'), ` of `, b(t.theme), ` questions need current-affairs knowledge.`], blocks: [], actions: [openTheme(t)], suggest: [`Show questions on ${t.theme}`]};
    if (s) return {text: [b(s.caShare + '%'), ` of `, b(s.subject), ` questions need current-affairs knowledge.`], blocks: [], actions: [openSubject(s)], suggest: []};
    const subs = [...(D('subject_summary') || [])].sort((a, b) => b.caShare - a.caShare);
    return {text: ['Share of questions that need current-affairs knowledge, by subject:'],
      blocks: [bars(subs.map((x) => ({label: x.subject, value: x.caShare, valueText: x.caShare + '%', color: subjColor(x.key)})))], actions: [], suggest: []};
  }

  function ansStrategy(p) {
    const ins = insightsOf();
    const t = p.themes[0], s = p.subjects[0];
    if (t) {
      const ti = ins.themes[t.key] || {};
      return {text: [`What to study for `, b(t.theme), ti.priority ? [` (`, b(ti.priority + ' priority'), `)`] : '', ':'],
        blocks: [el('ul', {class: 'pqc-list'}, (ti.whatToStudy || ['No notes for this theme.']).map((x) => el('li', null, x)))], actions: [openTheme(t)],
        suggest: [`Show questions on ${t.theme}`, `Repeated concepts in ${t.theme}`]};
    }
    if (s) {
      const si = ins.subjects[s.key] || {};
      return {text: [`How to prepare `, b(s.subject), ':'],
        blocks: [el('ul', {class: 'pqc-list'}, (si.studyStrategy || ['No notes for this subject.']).map((x) => el('li', null, x)))], actions: [openSubject(s)],
        suggest: [`Top 5 themes in ${short(s)}`, `Repeated concepts in ${short(s)}`]};
    }
    return {text: ['Which subject or theme? For example: ', b('How to prepare Economy'), ' or ', b('What to study for Climate Change'), '.'], blocks: [], actions: [],
      suggest: ['How to prepare Polity', 'What to study for Banking']};
  }

  // ---- what recurs inside one theme, counted from the questions themselves (no AI) ----
  // Sub-topics ranked by how many papers asked them; words / word pairs that come back in 2+ papers and belong
  // to this theme (at least 30% of all their uses are here, 50% for single words). Theme-name words are left out.
  const REP_STOP = new Set(('following statement statements correct incorrect given above below select answer using code only both neither nor not none ' +
    'consider regard respect regarding which with one two three four five six seven eight also such other than may can shall has have had been being ' +
    'india indian under into within more most each its their there these those this that them they what who whom whose how many when where while ' +
    'known called refers refer reference recently recent news statement pair pairs matched match listed list come comes came effect either ' +
    'article articles constitution constitutional provision provisions application among like make made take taken used use case cases ' +
    'part parts would could should does did done way ways time times body bodies new old first second third last ' +
    'between relationship moved move moves intention intend mention mentioned issue issued issues against regarding related relating purpose purposes').split(' '));
  const repTok = (s) => norm(s).split(' ').filter((w) => w.length > 2 && !STOP.has(w) && !REP_STOP.has(w) && !/^\d+$/.test(w) && !/^(i{1,3}|iv|vi{0,3})$/.test(w));
  const repGrams = (q) => {
    const t = repTok(q.stem + ' ' + q.options), g = new Set(t);
    for (let k = 2; k <= 4; k++) for (let i = 0; i + k <= t.length; i++) { const w = t.slice(i, i + k); if (new Set(w).size === k) g.add(w.join(' ')); }
    return g;
  };
  let REP_DF = null;
  function recurringTerms(t, max) {
    if (!REP_DF) { REP_DF = new Map(); for (const q of D('questions') || []) repGrams(q).forEach((x) => REP_DF.set(x, (REP_DF.get(x) || 0) + 1)); }
    const qs = qsWhere((q) => q.themeKey === t.key);
    const nameW = norm(t.theme).split(' ').filter((w) => w.length > 2);
    const own = (w) => nameW.some((n) => n.slice(0, 4) === w.slice(0, 4));
    const aliases = new Set((THEME_ALIASES[t.key] || []).filter((a) => a.includes(' ')).map(norm));
    const aliasW = new Set([...aliases].flatMap((a) => a.split(' ')));
    const minYears = qs.length >= 30 ? 3 : 2;
    const by = new Map();
    qs.forEach((q) => repGrams(q).forEach((x) => { if (!by.has(x)) by.set(x, []); by.get(x).push(q); }));
    let rows = [];
    by.forEach((list, x) => {
      const words = x.split(' '), years = [...new Set(list.map((q) => q.year))].sort();
      if (years.length < minYears || words.every(own) || aliases.has(x) || (words.length === 1 && aliasW.has(x))) return;
      if (list.length / REP_DF.get(x) < (words.length > 1 ? 0.3 : 0.5)) return;
      rows.push({x, words, years, n: list.length, qs: list});
    });
    // a piece of a longer phrase asked in as many papers is dropped ("dissolution lok" inside "dissolution lok sabha")
    rows = rows.filter((r) => !rows.some((o) => o.words.length > r.words.length && (' ' + o.x + ' ').includes(' ' + r.x + ' ') &&
      o.years.length >= r.years.length - (r.words.length === 1 ? 1 : 0)));
    rows.sort((a, b) => b.years.length - a.years.length || b.n - a.n || a.words.length - b.words.length);
    const seen = new Set();   // "legal right" = "right legal", "emission" = "emissions"
    const kept = [];
    rows = rows.filter((r) => {
      const k = r.words.map(stem).sort().join(' ');
      if (seen.has(k) || kept.some((o) => o.words.length < r.words.length && (' ' + r.x + ' ').includes(' ' + o.x + ' '))) return false;
      seen.add(k); kept.push(r); return true;
    });
    return rows.slice(0, max || 8).map((r) => {
      // show the words as written in a question ("Council of Ministers", not "council ministers")
      const re = new RegExp('\\b' + r.words.map((w) => w.replace(/[^a-z0-9]/g, '')).join('(?:[^A-Za-z0-9]+[A-Za-z]{1,8}){0,2}?[^A-Za-z0-9]+') + '\\b', 'i');
      let label = null;
      for (const q of r.qs) { const m = (q.stem + ' ' + q.options).match(re); if (m) { label = m[0].replace(/\s+/g, ' '); break; } }
      label = label || r.x;
      label = label[0].toUpperCase() + label.slice(1);
      return {term: label, years: r.years, n: r.n};
    });
  }

  function ansRepeated(p) {
    const ins = insightsOf();
    const t = p.themes[0], s = p.subjects[0];
    if (t) {
      const notes = (ins.themes[t.key] || {}).repeatedConcepts || [];
      const subs = (D('sub_summary') || []).filter((r) => r.themeKey === t.key).map((r) => {
        const ys = new Set(qsWhere((q) => q.themeKey === t.key && q.sub === r.sub).map((q) => q.year));
        return {r, papers: ys.size};
      }).sort((a, b) => b.papers - a.papers || b.r.count - a.r.count);
      const terms = recurringTerms(t, 8);
      const color = subjColor(t.subjectKey);
      const top = subs[0];
      const blocks = [];
      if (subs.length > 1) {
        blocks.push(el('p', {class: 'pqc-cap'}, 'Sub-topics, by number of papers'),
          bars(subs.map(({r, papers}) => ({label: r.sub, value: papers, valueText: `${papers} papers · ${r.count} Qs`, color, onclick: () => ask(`Show questions on ${r.sub}`)}))));
      }
      if (terms.length) {
        blocks.push(el('p', {class: 'pqc-cap'}, 'Terms that keep coming back'),
          el('ul', {class: 'pqc-list'}, terms.map((x) => el('li', null, b(x.term), ` — ${x.years.length} papers: ${x.years.join(', ')}`))));
      }
      if (notes.length) blocks.push(el('p', {class: 'pqc-cap'}, 'From the theme notes'), el('ul', {class: 'pqc-list'}, notes.map((x) => el('li', null, x))));
      if (!blocks.length) blocks.push(el('p', {class: 'pqc-note'}, 'Nothing has been asked in more than one paper yet.'));
      const lead = top && subs.length > 1
        ? [`Most repeated in `, b(t.theme), `: `, b(top.r.sub), ` — asked in `, b(top.papers), ` of ${NP} papers (${top.r.count} questions). `, `${t.theme} has ${t.count} questions in all.`]
        : terms.length ? [`Most repeated in `, b(t.theme), `: `, b(terms[0].term), ` — in `, b(terms[0].years.length), ' papers.'] : [`What recurs in `, b(t.theme), ':'];
      return {text: lead, blocks, actions: [openTheme(t)],
        suggest: terms.slice(0, 3).map((x) => `Show questions on ${x.term}`).concat(top ? [`Show questions on ${top.r.sub}`] : []).slice(0, 4)};
    }
    if (s) {
      const yearOf = new Map((D('questions') || []).map((q) => [q.id, q.year]));
      const list = (ins.subjects[s.key] || {}).recurringConcepts || [];
      return {text: [`Concepts UPSC keeps returning to in `, b(s.subject), ':'],
        blocks: [el('ul', {class: 'pqc-list'}, list.map((c) => el('li', null, b(c.concept), ' — ', [...new Set((c.ids || []).map((i) => yearOf.get(i)).filter(Boolean))].sort().join(', '))))],
        actions: [openSubject(s)], suggest: []};
    }
    return null;
  }

  function ansCompare(p) {
    const ents = [...p.themes.map((t) => ({kind: 't', x: t})), ...p.subjects.map((s) => ({kind: 's', x: s}))].slice(0, 2);
    if (ents.length < 2) return null;
    const row = (e) => e.kind === 't'
      ? {name: e.x.theme, n: e.x.count, share: e.x.shareSubject + '% of subject', trend: e.x.trend, a: e.x.avgEarly, c: e.x.avgRecent, last: e.x.lastYear, counts: themeYearCounts(e.x.key), color: subjColor(e.x.subjectKey)}
      : {name: e.x.subject, n: e.x.count, share: e.x.sharePaper + '% of paper', trend: e.x.trend, a: e.x.avgEarly, c: e.x.avgRecent, last: Y1, counts: subjYearCounts(e.x.key), color: subjColor(e.x.key)};
    const [A, B] = ents.map(row);
    const table = el('table', {class: 'pqc-table'},
      el('thead', null, el('tr', null, el('th', null, ''), el('th', null, A.name), el('th', null, B.name))),
      el('tbody', null,
        el('tr', null, el('td', null, 'Questions'), el('td', null, A.n), el('td', null, B.n)),
        el('tr', null, el('td', null, 'Share'), el('td', null, A.share), el('td', null, B.share)),
        el('tr', null, el('td', null, 'Per paper 2011–15 → 2021–26'), el('td', null, `${fmt1(A.a)} → ${fmt1(A.c)}`), el('td', null, `${fmt1(B.a)} → ${fmt1(B.c)}`)),
        el('tr', null, el('td', null, 'Trend'), el('td', null, trendWord(A.trend)), el('td', null, trendWord(B.trend)))));
    return {text: [b(A.name), ' vs ', b(B.name), ':'],
      blocks: [table, el('p', {class: 'pqc-cap'}, A.name), spark(A.counts, A.color, A.name), el('p', {class: 'pqc-cap'}, B.name), spark(B.counts, B.color, B.name)],
      actions: [], suggest: []};
  }

  function ansQuestions(p, freeText) {
    const ys = p.years;
    const fmtF = p.formats[0];
    let list, label;
    const keyword = freeText.replace(/\b(show|list|find|search|give|get|me|all|the|pyqs?|questions?|on|about|related|to|from|in|of|asked|regarding|upsc|prelims|20(1[1-9]|2[0-6]))\b/gi, ' ').trim();
    if (p.themes[0]) {
      const t = p.themes[0];
      const inTheme = (q) => q.themeKey === t.key && inYears(ys)(q) && (!fmtF || q.format === fmtF);
      // a specific keyword beyond the theme's own name ("Ramsar" → Biodiversity) narrows to matching questions
      const nameToks = new Set([...tokens(t.theme), ...tokens(subjectByKey(t.subjectKey).subject)]);
      const extra = tokens(keyword).filter((w) => !nameToks.has(w) && !/^(format|type|statement|pair|match|direct)$/.test(w));
      const hits = extra.length ? search(extra.join(' '), inTheme, 40) : [];
      if (hits.length) {
        return {text: [b(hits.length), ` question${hits.length === 1 ? '' : 's'} matching "${extra.join(' ')}" in `, b(t.theme), ys.length ? ` (${yearsLabel(ys)})` : '', ', best matches first:'],
          blocks: [qlist(hits)], actions: [openTheme(t), {label: `All ${t.theme} questions`, run: () => ask(`Show all questions on ${t.theme}`)}], suggest: []};
      }
      list = qsWhere(inTheme).sort((a, b) => b.year - a.year);
      label = [b(list.length), ` question${list.length === 1 ? '' : 's'} on `, b(t.theme), ys.length ? ` in ${yearsLabel(ys)}` : '', ':'];
      return {text: label, blocks: list.length ? [qlist(list)] : [], actions: [openTheme(t)], suggest: [`What to study for ${t.theme}`]};
    }
    if (p.subjects[0] && (ys.length || fmtF || tokens(keyword).every((w) => Object.values(SUBJECT_ALIASES).flat().some((a) => a.split(' ').map(stem).includes(w))))) {
      const s = p.subjects[0];
      list = qsWhere((q) => q.subjectKey === s.key && inYears(ys)(q) && (!fmtF || q.format === fmtF)).sort((a, b) => b.year - a.year);
      label = [b(list.length), ` ${s.subject}${fmtF ? ' "' + fmtF + '"' : ''} question${list.length === 1 ? '' : 's'}`, ys.length ? ` in ${yearsLabel(ys)}` : '', ':'];
      return {text: label, blocks: list.length ? [qlist(list)] : [], actions: [openSubject(s)], suggest: []};
    }
    const filter = (q) => inYears(ys)(q) && (!fmtF || q.format === fmtF) && (!p.subjects[0] || q.subjectKey === p.subjects[0].key);
    list = search(keyword || freeText, filter, 40);
    if (!list.length && fmtF) list = qsWhere(filter).sort((a, b) => b.year - a.year);
    if (!list.length) return null;
    return {text: [`Found `, b(list.length), ` matching question${list.length === 1 ? '' : 's'}${ys.length ? ' in ' + yearsLabel(ys) : ''}, best matches first:`],
      blocks: [qlist(list)], actions: [], suggest: []};
  }

  function ansHelp() {
    return {text: ['I answer from the PYQ data (2011–2026) — no AI, so every number is exact. Try asking:'],
      blocks: [el('ul', {class: 'pqc-list'},
        el('li', null, b('Counts'), ' — "How many Polity questions in 2023?"'),
        el('li', null, b('Rankings'), ' — "Top 5 themes in Economy"'),
        el('li', null, b('Trends'), ' — "Which themes are rising?", "Is Climate Change falling?"'),
        el('li', null, b('History'), ' — "When was Panchayati Raj asked?"'),
        el('li', null, b('Questions'), ' — "Show questions on Ramsar wetlands", "Polity questions in 2021"'),
        el('li', null, b('Formats'), ' — "Question formats in 2023"'),
        el('li', null, b('Compare'), ' — "Economy vs Environment"'),
        el('li', null, b('Study notes'), ' — "How to prepare Geography", "Repeated concepts in Banking"'))],
      actions: [], suggest: ['Top 5 themes in Economy', 'Which themes are rising?', 'Show questions on Ramsar']};
  }

  // ------------------------------------------------------------------ spelling correction (no AI: edit distance against known words)
  // Known words = every subject/theme/alias/intent word (preferred) + every word in the question bank.
  // A word we don't know is replaced by the closest known word: 1 typo allowed for short words, 2 for words of 7+ letters.
  const INTENT_WORDS = ('show list find search give display example examples sample practice trend trending rising rise increase increasing ' +
    'growing gaining decline declining decrease falling fall losing change changed when which last first time top most highest heaviest ' +
    'important importance weightage weight biggest major priority prioritise prioritize prioritising prioritizing prioritize focus should many number count total compare compared comparison versus difference prepare ' +
    'preparation strategy study studying read tips approach focus repeated repeat recurring again concept concepts current affairs static ' +
    'news every each always consistent consistently regular regularly format formats pattern type kind framed style help hello since after ' +
    'till until recent recently latest overall whole entire general reset clear start over also same about ' +
    'easy easier easiest hard harder hardest tough difficult scoring score revision revise syllabus notes books book beginner beginners ' +
    'weak strong marks mark guide suggest suggestion advice plan timetable time skip skipped leave ignore cover covered').split(' ');
  let VOCAB = null;
  function buildVocab() {
    const dom = new Map(), corpus = new Map();
    const add = (s, w) => norm(s).split(' ').forEach((x) => { if (x && !/\d/.test(x)) dom.set(x, Math.max(dom.get(x) || 0, w)); });
    Object.values(SUBJECT_ALIASES).flat().forEach((a) => add(a, 3));
    Object.values(THEME_ALIASES).flat().forEach((a) => add(a, 3));
    Object.values(FORMAT_ALIASES).flat().forEach((a) => add(a, 2));
    (D('theme_summary') || []).forEach((t) => add(t.theme, 3));
    (D('subject_summary') || []).forEach((s) => add(s.subject, 3));
    (D('sub_summary') || []).forEach((r) => add(r.sub, 2));
    // words of the written solutions' keywords are real words, never "corrected" ("landlord", "decrees")
    for (const q of (window.PQ_TUTOR || {}).questions || []) for (const k of ((q.sol || {}).kw || [])) add(String(k[0] || ''), 2);
    INTENT_WORDS.forEach((w) => add(w, 2));
    Object.keys(GLOSS.translate || {}).forEach((w) => add(w, 2));
    Object.values(SUBJECT_TOPICS).flat().forEach((w) => add(w, 2));
    STOP.forEach((w) => add(w, 1));
    for (const q of D('questions') || []) for (const x of norm(q.stem + ' ' + q.options + ' ' + q.sub).split(' ')) if (x.length >= 4 && !/\d/.test(x)) corpus.set(x, (corpus.get(x) || 0) + 1);
    return {dom, corpus};
  }
  // Damerau–Levenshtein distance (swaps count as one typo), stops early once it exceeds max
  function editDistance(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let prev2 = null, prev = Array.from({length: b.length + 1}, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i]; let rowMin = i;
      for (let j = 1; j <= b.length; j++) {
        let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
        cur[j] = v; if (v < rowMin) rowMin = v;
      }
      if (rowMin > max) return max + 1;
      prev2 = prev; prev = cur;
    }
    return prev[b.length];
  }
  function nearest(word, map, max) {
    let best = null, bd = max + 1, bw = -1;
    for (const [v, w] of map) {
      if (Math.abs(v.length - word.length) > max) continue;
      const d = editDistance(word, v, max);
      if (d > max || (d >= 2 && v[0] !== word[0])) continue; // a 2-letter fix must keep the first letter
      if (d < bd || (d === bd && w > bw)) { best = v; bd = d; bw = w; }
    }
    return best ? {word: best, d: bd} : null;
  }
  // letter groups (3-letter pieces): catches spellings 3+ edits away, e.g. "parlimentery" → "parliamentary". Long words only, close lengths.
  const grams = (w) => { const p = '^' + w + '$', g = new Set(); for (let i = 0; i < p.length - 2; i++) g.add(p.slice(i, i + 3)); return g; };
  function byLetters(word, ...maps) {
    const gw = grams(word);
    let best = null, bs = 0;
    for (const map of maps) for (const [v] of map) {
      if (v.length < 6 || Math.abs(v.length - word.length) > 3 || v[0] !== word[0]) continue;
      const gv = grams(v);
      let c = 0; gw.forEach((g) => { if (gv.has(g)) c++; });
      const dice = 2 * c / (gw.size + gv.size);
      if (dice > bs) { best = v; bs = dice; }
    }
    return bs >= 0.62 ? {word: best, d: 3} : null;
  }
  function correct(raw) {
    VOCAB = VOCAB || buildVocab();
    const fixes = [];
    const out = norm(raw).split(' ').map((w) => {
      if (w.length < 4 || /\d/.test(w) || VOCAB.dom.has(w) || VOCAB.corpus.has(w)) return w;
      const max = w.length >= 7 ? 2 : 1;
      const common = new Map([...VOCAB.corpus].filter(([, n]) => n >= 3));
      const hit = nearest(w, VOCAB.dom, max) || (w.length >= 5 ? nearest(w, common, 1) : null) || (w.length >= 7 ? byLetters(w, VOCAB.dom, common) : null);
      if (!hit) return w;
      fixes.push([w, hit.word]);
      return hit.word;
    });
    return {text: out.join(' '), fixes};
  }

  // ------------------------------------------------------------------ conversation memory
  // ctx remembers what the last answer was about, so "and in 2022?", "show them", "what about economy?" work.
  let ctx = {subjects: [], themes: [], sub: null, kw: null, years: [], intent: null, pending: null};
  const ctxName = () => ctx.kw ? `“${ctx.kw.text}”` : ctx.sub ? ctx.sub.sub : ctx.themes[0] ? ctx.themes[0].theme : ctx.subjects[0] ? ctx.subjects[0].subject : '';
  const FOLLOW_RE = /^ (and|what about|how about|same|also|then|now|ok|okay|only|just)\b|\b(it|its|this|that|these|those|them|same|there)\b/;
  const GLOBAL_RE = /\b(overall|whole paper|all subjects|entire paper|across subjects|in general|all themes)\b/;
  const RESET_RE = /^ (reset|clear|new topic|start over|start again|new chat) $/;

  // ------------------------------------------------------------------ intent router
  const INTENTS = [
    ['help', (q) => /^ (hi|hello|hey|help|namaste|start|what can you do|\?) $/.test(q) || /\bhelp\b|what can you/.test(q)],
    ['compare', (q) => /\b(vs|versus|compare|compared|comparison|difference between)\b/.test(q)],
    ['strategy', (q) => /\b(prepare|preparation|strategy|study|studying|read|tips|approach)\b/.test(q)],
    ['repeated', (q) => /\b(repeated|repeat|recurring|again and again|concepts?)\b/.test(q)],
    ['ca', (q) => /\b(current affairs|current|static|news)\b/.test(q) && !/places in news/.test(q)],
    ['always', (q) => /\b(every year|each year|always|consistent|consistently|regular|regularly)\b/.test(q)],
    ['formats', (q, p) => /\b(format|formats|pattern|type of questions|kind of questions|framed|style)\b/.test(q) || (p.formats.length && !/\b(show|list|find|give)\b/.test(q))],
    ['questions', (q) => /\b(show|list|find|search|give me|display|examples?|sample|practice|which questions|what questions|what was asked|questions on|questions about|pyqs? on|pyqs? about)\b/.test(q)],
    ['trend', (q) => /\b(trend|trending|rising|rise|increas|growing|gaining|declin|decreas|falling|fall|losing|importance (over|across)|changed?)\w*/.test(q)],
    ['when', (q) => /\b(when|which years?|last asked|first asked|last time)\b/.test(q)],
    ['top', (q) => /\b(top|most|highest|heaviest|important|weightage|weight|biggest|major|priority|prioriti[sz]\w*|focus on|which (topics?|themes?|areas?) should)\b/.test(q)],
    ['count', (q) => /\b(how many|number of|count|total)\b/.test(q)]
  ];
  const NEEDS_ENTITY = new Set(['strategy', 'repeated', 'when']);
  const RUN = {
    help: () => ansHelp(), compare: (p) => ansCompare(p), strategy: (p) => ansStrategy(p), repeated: (p) => ansRepeated(p),
    ca: (p) => ansCA(p), always: () => ansAlways(), formats: (p) => ansFormats(p), questions: (p) => ansQuestions(p, p.raw),
    trend: (p) => ansTrend(p), when: (p) => ansWhen(p), top: (p) => ansTop(p), count: (p) => ansCount(p)
  };
  const INTENT_LABEL = {strategy: 'how to prepare', repeated: 'repeated concepts', when: 'when it was asked', questions: 'the questions',
    trend: 'the trend', count: 'the count', top: 'the top themes', formats: 'question formats', ca: 'current-affairs share', compare: 'a comparison'};

  // The bot asks back instead of guessing
  function clarifyEntity(intent, raw) {
    ctx.pending = intent;
    const subs = (D('subject_summary') || []).filter((s) => s.key !== 'other_thin_data');
    return {text: [`Which subject or theme should I look at for `, b(INTENT_LABEL[intent] || 'that'), '? Pick one below or type a theme name (e.g. "Banking").'],
      blocks: [], actions: [], suggest: subs.map((s) => short(s)), clarify: true};
  }
  function clarifyTheme(p, intent) {
    ctx.pending = intent || ctx.pending || 'overview';
    const opts = p.themes.slice(0, 4);
    return {text: ['Did you mean one of these themes?'], blocks: [], actions: [], suggest: opts.map((t) => t.theme), clarify: true};
  }

  function answer(raw, opts) {
    opts = opts || {};
    if (RESET_RE.test(' ' + norm(raw) + ' ')) {
      ctx = {subjects: [], themes: [], sub: null, kw: null, years: [], intent: null, pending: null};
      return {text: ['Starting fresh. Ask about any subject, theme or year.'], blocks: [], actions: [], suggest: ['Top 5 themes in Polity', 'Which themes are rising?']};
    }
    ensureGlossary();
    const fixed = opts.exact ? {text: raw, fixes: []} : correct(raw);
    const tr = translate(norm(fixed.text));
    const p = parse(tr.text);
    const q = p.q;
    const notes = [];
    if (fixed.fixes.length) notes.push({kind: 'fix', text: 'Read as: ' + fixed.fixes.map(([a, c]) => `${a} → ${c}`).join(', '), undo: {label: `Use "${raw}" as typed`, run: () => ask(raw, {exact: true})}});
    if (tr.done.length) notes.push({kind: 'ctx', text: 'Translated: ' + tr.done.map(([a, c]) => `${a} → ${c}`).join(', ')});

    // WHAT it is about first (the reader), then WHAT is asked — read only from the words outside the names found
    const R = read(tr.text);
    const qi = R.masked;
    let explicit = INTENTS.filter(([, test]) => test(qi, p)).map(([n]) => n);
    if (/\bhow many\b/.test(qi)) explicit = explicit.filter((n) => n !== 'questions');
    if (!explicit.includes('compare')) applyRead(p, R);
    if (p.tie) {
      ctx.pending = explicit[0] || 'overview';
      return finish({text: ['That name fits more than one topic. Which one do you mean?'], blocks: [], actions: [],
        suggest: p.tie.map((t) => `${t.theme} (${short(subjectByKey(t.subjectKey))})`), clarify: true}, notes, p, null);
    }
    if (opts.noKw) p.kw = null;
    let hasEnt = !!(p.themes.length || p.subjects.length || p.sub || p.kw);

    // --- follow-ups: borrow what the last answer was about
    // entity-less questions borrow the last topic only for topic-level question types (or with "and…", "what about…")
    const TOPIC_INTENTS = new Set(['count', 'when', 'trend', 'questions', 'strategy', 'repeated']);
    const looksFollow = FOLLOW_RE.test(q) || (!hasEnt && explicit.every((n) => TOPIC_INTENTS.has(n)));
    const ctxEnt = ctx.themes.length || ctx.subjects.length || ctx.sub || ctx.kw;
    let remembered = false;
    if (!opts.noCtx && ctxEnt && !GLOBAL_RE.test(q)) {
      if (!hasEnt && looksFollow && !explicit.includes('help') && !explicit.includes('always')) {
        // "which themes…" after a theme means the themes of its subject
        if (ctx.themes[0] && /\b(themes|topics|areas)\b/.test(q)) { p.subjects = [subjectByKey(ctx.themes[0].subjectKey)]; p.themes = []; }
        else { p.subjects = ctx.subjects; p.themes = ctx.themes; p.sub = ctx.sub; p.kw = ctx.kw; }
        hasEnt = true; remembered = true;
        notes.push({kind: 'ctx', text: `Following up on ${ctxName()}`, undo: {label: 'Ask across all subjects instead', run: () => ask(raw, {noCtx: true})}});
      } else if (explicit.includes('compare') && p.themes.length + p.subjects.length === 1) {
        if (ctx.themes[0]) p.themes = [ctx.themes[0], ...p.themes]; else if (ctx.subjects[0]) p.subjects = [ctx.subjects[0], ...p.subjects];
        notes.push({kind: 'ctx', text: `Comparing with ${ctxName()}`});
      } else if (p.kw && !p.subjects.length && !p.themes.length && FOLLOW_RE.test(q) && (ctx.themes.length || ctx.subjects.length)) {
        // "and ramsar?" — keep the remembered subject/theme as the scope for the new keyword
        p.subjects = ctx.subjects; p.themes = ctx.themes; remembered = true;
      }
      if (hasEnt && FOLLOW_RE.test(q) && !p.years.length && ctx.years.length) { p.years = ctx.years; notes.push({kind: 'ctx', text: `Keeping years ${yearsLabel(ctx.years)}`}); }
    }
    if (remembered) { p.how.subject = p.subjects.length ? 'remembered' : p.how.subject; p.how.theme = p.themes.length ? 'remembered' : p.how.theme; if (p.sub) p.how.sub = 'remembered'; }

    if (String(p.how.theme || '').startsWith('guessed') && p.guess) {
      const alt = p.guess.options.filter((o) => o.key !== p.themes[0].key && o.p >= 10);
      notes.push({kind: 'ctx', text: `Theme guessed from the words ${p.guess.words.map((w) => '“' + w + '”').join(', ')}` + (alt.length ? ` · next best: ${alt.map((o) => o.theme + ' ' + o.p + '%').join(', ')}` : '')});
    }
    // --- STEP 4: search the keyword only inside the levels found above
    if (p.kw && !explicit.includes('compare')) {
      const hits = keywordHits(scopePool(p), p.kw.tokens);
      if (hits.length) {
        p.hits = hits;
        if (!p.themes.length) {
          const tk = majority(hits, (q) => q.themeKey);
          if (tk) { p.inferredTheme = (D('theme_summary') || []).find((t) => t.key === tk); p.how.theme = 'from matches'; }
          if (!p.subjects.length) { const sk = majority(hits, (q) => q.subjectKey); if (sk) { p.inferredSubject = subjectByKey(sk); p.how.subject = 'from matches'; } }
          else if (p.subjectFromGlossary) p.how.subject = 'glossary';
        }
      } else {
        if (!String(p.how.theme || '').startsWith('guessed')) notes.push({kind: 'fix', text: `No question mentions “${p.kw.text}”${p.themes[0] ? ' — showing the whole theme' : p.subjects[0] ? ' — showing the whole subject' : ' — ignoring it'}`});
        p.kw = null;
      }
    }
    hasEnt = !!(p.themes.length || p.subjects.length || p.sub || p.kw);

    // a bare answer to the bot's own question ("Polity") or "what about X?" reuses the last intent
    const content = p.kw ? p.kw.tokens : [];
    if (!explicit.length && hasEnt) {
      if (ctx.pending && content.length <= 2 && tokens(q).length <= 3) explicit = [ctx.pending];
      else if (FOLLOW_RE.test(q) && ctx.intent) explicit = [ctx.intent];
    }
    ctx.pending = null;

    // --- ambiguity: two themes match equally well → ask
    if (!p.sub && !p.hits && p.themes.length > 1 && !explicit.includes('compare') && Math.abs(p.themeScores[0] - p.themeScores[1]) < 0.02 && p.themeScores[0] < 1) {
      return finish(clarifyTheme(p, explicit[0]), notes, p, null);
    }
    // the guesser is unsure between a few themes → ask
    if (p.askThemes && !p.themes.length && !p.hits && !explicit.includes('compare')) {
      ctx.pending = explicit[0] || 'overview';
      return finish({text: ['I’m not sure which theme you mean. Did you mean one of these?'], blocks: [], actions: [],
        suggest: p.askThemes.map((x) => x.theme.theme), clarify: true}, notes, p, null);
    }
    // strategy / repeated notes exist per theme: use the theme the keyword points to
    if (!p.themes.length && p.inferredTheme && explicit.some((n) => n === 'strategy' || n === 'repeated')) p.themes = [p.inferredTheme];
    // --- intent needs a subject/theme and we have none → ask
    const need = explicit.find((n) => NEEDS_ENTITY.has(n));
    if (need && !hasEnt && !explicit.includes('compare')) return finish(clarifyEntity(need, raw), notes, p, null);
    if (explicit.includes('compare') && p.themes.length + p.subjects.length < 2) {
      return finish({text: ['Compare what with what? Try ', b('Economy vs Environment'), ' or ', b('RBI vs inflation'), '.'], blocks: [], actions: [], suggest: ['Economy vs Environment', 'Polity vs Economy', 'RBI vs inflation']}, notes, p, null);
    }

    // --- route: sub-topic / keyword questions are answered at that level
    const SCOPE_INTENTS = new Set(['questions', 'when', 'trend', 'count']);
    const narrow = p.sub || p.hits;
    const tries = [];
    for (const n of explicit) {
      if (narrow && SCOPE_INTENTS.has(n)) tries.push([n, () => ansScope(p, n)]);
      else tries.push([n, () => RUN[n](p)]);
    }
    if (narrow) tries.push(['overview', () => ansScope(p, p.years.length ? 'count' : 'overview')]);
    if (hasEnt && p.years.length) tries.push(['count', () => ansCount(p)]);
    if (p.themes.length || p.subjects.length) tries.push(['overview', () => p.themes[0] ? ansThemeOverview(p.themes[0]) : ansSubjectOverview(p.subjects[0])]);
    if (p.years.length) tries.push(['count', () => ansCount(p)]);
    tries.push(['questions', () => ansQuestions(p, p.raw)]);
    for (const [name, t] of tries) {
      const r = t();
      if (r) return finish(r, notes, p, name);
    }
    return finish({miss: 'no-match', text: ["I couldn't match that to the data. Try naming a subject (Polity, Economy…), a theme (Banking, Climate Change…) or a year — or type ", b('help'), '.'],
      blocks: [], actions: [], suggest: ['help', 'Top 5 themes in Polity', 'Which themes are rising?']}, notes, p, null);
  }
  const PATH_INTENT = {overview: 'Overview', count: 'Count', when: 'When asked', trend: 'Trend', questions: 'Show questions', top: 'Top themes',
    strategy: 'How to prepare', repeated: 'Repeated concepts', formats: 'Formats', ca: 'Current affairs', compare: 'Compare', always: 'Asked every year', help: 'Help'};
  function finish(r, notes, p, intent) {
    r.notes = notes;
    // the 4 steps, as the bot understood them
    const subj = p.subjects[0] || (p.themes[0] && subjectByKey(p.themes[0].subjectKey)) || p.inferredSubject;
    const theme = p.themes[0] || p.inferredTheme;
    const comparing = intent === 'compare';
    const query = [PATH_INTENT[intent] || (r.clarify ? 'Asking you' : '—')];
    if (p.kw) query.push(`“${p.kw.text}”`);
    if (p.years.length && intent !== 'trend' && intent !== 'when') query.push(yearsLabel(p.years));
    if (p.formats[0]) query.push(p.formats[0]);
    r.path = comparing ? null : [
      {level: 'Subject', value: subj ? subj.subject : 'all', how: subj ? p.how.subject : ''},
      {level: 'Theme', value: theme ? theme.theme : 'all', how: theme ? p.how.theme : ''},
      {level: 'Sub-topic', value: p.sub ? p.sub.sub : 'all', how: p.sub ? p.how.sub : ''},
      {level: 'Query', value: query.join(' · '), how: '', kw: !!p.kw}];
    // machine-readable reading, used by the test runner (test.html)
    r.debug = {subject: subj ? subj.key : null, theme: theme ? theme.key : null, sub: p.sub ? p.sub.sub : null,
      intent: intent || (r.clarify ? 'clarify' : null), kw: p.kw ? p.kw.text : null, guess: p.guess || null};
    if (intent) {
      if (p.themes.length || p.subjects.length || p.sub || p.kw) { ctx.subjects = p.subjects.slice(0, 1); ctx.themes = p.themes.slice(0, 1); ctx.sub = p.sub || null; ctx.kw = p.hits ? p.kw : null; }
      else if (!GLOBAL_RE.test(p.q) && intent !== 'questions') { ctx.subjects = []; ctx.themes = []; ctx.sub = null; ctx.kw = null; }
      ctx.years = p.years; ctx.intent = intent === 'overview' ? null : intent;
    }
    return r;
  }

  // ------------------------------------------------------------------ UI
  let panel, log, input, fab;
  const mobile = () => window.matchMedia('(max-width: 640px)').matches;
  const maybeClose = () => { if (mobile()) toggle(false); };

  function addMsg(who, nodes) {
    const m = el('div', {class: 'pqc-msg pqc-' + who}, nodes);
    log.append(m);
    // scroll only the message list (scrollIntoView would also shift the fixed panel)
    requestAnimationFrame(() => { log.scrollTo({top: who === 'bot' ? m.offsetTop - 8 : log.scrollHeight, behavior: 'smooth'}); });
    return m;
  }
  function chips(list) {
    return el('div', {class: 'pqc-chips'}, list.map((s) => el('button', {type: 'button', class: 'pqc-chip', onclick: () => ask(s)}, s)));
  }
  // ---- PYQ Tutor (tutor.js) answers in the same box: quizzes, one question explained part by part, keyword meanings.
  // The stats engine above keeps everything about counts, trends, themes and years.
  const tutor = () => window.PQTutor;
  const TUTOR_INTENTS = new Set(['quiz', 'quiz-q', 'quiz-a', 'quiz-end', 'open', 'followup', 'attempt', 'define', 'clarify']);
  // words only the tutor answers (quiz, one question explained); and words that ask for a meaning
  const TUTOR_HARD = new RegExp('\\b(quiz|test me|practi[cs]e|mcqs?|mock|explain|explanation|solution|answer|statement \\d|why not|option [a-d]|keywords?|value addition|' +
    'in news|similar pyq|takeaway|random|any question|one question|open \\d+|20[12]\\d q \\d+)\\b|^[a-d]$|^(next|skip|stop|previous)$');
  const TUTOR_SOFT = /\b(meaning|define|definition)\b|^(what is|what are|whats|who is|who was|tell me about)\b/;
  const TERM_PAGE = new Set(['define', 'search', 'list', 'clarify']);
  // One decision, from what the reader found:
  //  · a quiz, an open question, or tutor-only words          → tutor
  //  · a numbers question (count, trend, top, when, repeated…) → stats, whatever it is about
  //  · a subject / theme / sub-topic name and nothing else     → stats (its overview)
  //  · a term — a solution keyword, or words found in questions → tutor's term page (meaning if stored + every PYQ)
  function route(text) {
    const T = tutor();
    if (!T) return 'stats';
    if (T.state.quiz) return 'tutor';
    const t = T.prep(text).text;
    if (TUTOR_HARD.test(t) || T.state.cur || T.state.pending) { if (TUTOR_INTENTS.has(T.peek(text).intent)) return 'tutor'; }
    const R = readQuestion(text);
    const statsAsk = INTENTS.some(([n, test]) => n !== 'questions' && n !== 'help' && test(R.masked, {formats: []})) ||
      Object.values(FORMAT_ALIASES).some((al) => al.some((a) => wordRe(a).test(R.masked)));
    if (statsAsk) return 'stats';
    const hasTerm = R.spans.some((x) => x.kind === 'term');
    // a theme / sub-topic named in full (or by a 2+ word alias) → its overview; a one-word alias ("election") with other words
    // left over ("commission") is a term, not the theme
    const topic = R.spans.filter((x) => x.kind === 'theme' || x.kind === 'sub');
    if (!hasTerm && topic.some((x) => x.src === 'name' || x.toks.length > 1)) return 'stats';
    if (!hasTerm && topic.length && !R.leftover.length) return 'stats';
    // one-word alias + other words: a term only if that phrase is really written in some question ("repo rate", "mangrove…" no:
    // "missiles and defence systems" is a description of the theme, not a phrase UPSC used)
    if (!hasTerm && topic.length && !phraseInQuestions(R)) return 'stats';
    if (!hasTerm && FOLLOW_RE.test(R.masked) && (ctx.themes.length || ctx.subjects.length || ctx.sub || ctx.kw)) return 'stats';
    if (hasTerm || R.leftover.length || TUTOR_SOFT.test(t)) { if (TERM_PAGE.has(T.peek(text).intent)) return 'tutor'; }
    return 'stats';
  }
  const logMiss = (q, engine, intent, reason) => { if (window.PQLog) PQLog.record({q, engine, intent, reason}); };
  function flagButton(q, engine, intent) {
    const btn = el('button', {type: 'button', class: 'pqc-link pqc-flag', onclick: () => { logMiss(q, engine, intent, 'flagged'); btn.replaceWith(el('span', {class: 'pqc-flag'}, 'Noted — thanks.')); }}, 'Not what I wanted');
    return btn;
  }
  function renderTutor(q, r) {
    const T = tutor();
    const chipsEl = r.chips && r.chips.length ? el('div', {class: 'pqc-chips'}, r.chips.map((c) => el('button', {type: 'button', class: 'pqc-chip',
      onclick: () => { if (c.act) { addMsg('user', [c.label]); renderTutor(c.label, c.act()); } else ask(c.say, {echo: c.label, engine: 'tutor'}); }}, c.label))) : null;
    addMsg('bot', [el('p', {class: 'pqc-ctx'}, 'PYQ Tutor · from the stored solutions'), el('div', {class: 'pqc-tutor'}, r.nodes), chipsEl, flagButton(q, 'tutor', r.intent)]);
    if (r.intent === 'none') logMiss(q, 'tutor', r.intent, 'no-match');
    else if (r.intent === 'clarify') logMiss(q, 'tutor', r.intent, 'asked-back');
    input.placeholder = T && T.state.quiz ? 'Type a, b, c or d…' : T && T.state.cur ? 'Ask: explain · statement 2 · why not b · next' : 'Ask about subjects, themes, years…';
  }
  function ask(text, opts) {
    text = String(text || '').trim();
    if (!text) return;
    opts = opts || {};
    addMsg('user', [opts.echo || text]);
    const engine = opts.engine || route(text);
    if (engine === 'tutor') {
      let r;
      try { r = tutor().answer(text); } catch (e) { console.error(e); r = {intent: 'error', nodes: [el('p', {class: 'pqc-text'}, 'Something went wrong answering that. Try rephrasing.')], chips: []}; }
      return renderTutor(text, r);
    }
    let r;
    try { r = answer(text, opts); } catch (e) { console.error(e); r = {text: ['Something went wrong answering that. Try rephrasing.'], blocks: [], actions: [], suggest: [], notes: []}; }
    const notes = (r.notes || []).map((n) => el('p', {class: 'pqc-ctx pqc-ctx-' + n.kind}, n.kind === 'fix' ? '✎ ' : '↻ ', n.text,
      n.undo ? [' · ', el('button', {type: 'button', class: 'pqc-link', onclick: n.undo.run}, n.undo.label)] : null));
    const actions = (r.actions || []).length ? el('div', {class: 'pqc-actions'}, r.actions.map((a) => el('button', {type: 'button', class: 'pqc-action', onclick: () => {
      a.run();
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({type: 'PQC_OPEN_DASH', params: window.dash && window.dash.params ? window.dash.params() : {}, hash: location.hash}, '*');
        }
      } catch (e) { /* ignore */ }
    }}, a.label))) : null;
    const path = r.path ? el('ol', {class: 'pqc-path', 'aria-label': 'How I read your question'}, r.path.map((st) =>
      el('li', {class: st.value === 'all' ? 'is-any' : null}, el('span', {class: 'pqc-path-l'}, st.level), el('span', {class: 'pqc-path-v'}, st.value),
        st.how && st.how !== 'named' ? el('small', null, st.how) : null))) : null;
    const intent = r.debug ? r.debug.intent : null;
    addMsg('bot', [path, ...notes, el('p', {class: 'pqc-text'}, r.text), ...(r.blocks || []).filter(Boolean), actions, (r.suggest || []).length ? chips(r.suggest) : null, flagButton(text, 'stats', intent)]);
    if (r.miss) logMiss(text, 'stats', intent, r.miss);
    else if (r.clarify) logMiss(text, 'stats', intent, 'asked-back');
    else if ((r.notes || []).some((n) => /^No question mentions/.test(n.text))) logMiss(text, 'stats', intent, 'keyword-not-found');
    const name = ctxName();
    input.placeholder = r.clarify ? 'Type your answer…' : name ? `Follow up on ${name.length > 28 ? name.slice(0, 26) + '…' : name} — e.g. "in 2022?"` : 'Ask about subjects, themes, years…';
  }
  function toggle(open) {
    const on = open === undefined ? panel.hidden : open;
    panel.hidden = !on;
    fab.setAttribute('aria-expanded', String(on));
    fab.classList.toggle('is-open', on);
    if (on) setTimeout(() => input.focus(), 30);
  }

  function mount() {
    const sp = new URLSearchParams(location.search);
    const isEmbedChat = sp.get('embed') === 'chat';
    const hideFab = sp.get('hideFab') === '1' || isEmbedChat;
    if (isEmbedChat) {
      document.documentElement.classList.add('is-pqc-embed');
      const dr = document.getElementById('dash-root');
      if (dr) dr.style.display = 'none';
    }
    const icon = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.6c-.5.4-1.3.1-1.3-.6V16A2.5 2.5 0 0 1 4 13.5v-8Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8 8.5h8M8 11.5h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
    fab = el('button', {type: 'button', class: 'pqc-fab', 'aria-expanded': String(isEmbedChat), 'aria-controls': 'pqc-panel', 'aria-label': 'Ask PrelimsGPT'});
    fab.innerHTML = icon + '<span>Ask PrelimsGPT</span>';
    if (hideFab) fab.style.display = 'none';
    fab.addEventListener('click', () => toggle());
    log = el('div', {class: 'pqc-log', role: 'log', 'aria-live': 'polite'});
    input = el('input', {type: 'text', id: 'pqc-input', placeholder: 'Ask about subjects, themes, years…', autocomplete: 'off', 'aria-label': 'Your question'});
    const form = el('form', {class: 'pqc-form'}, input, el('button', {type: 'submit', class: 'pqc-send', 'aria-label': 'Send'}, '↑'));
    form.addEventListener('submit', (e) => { e.preventDefault(); const v = input.value; input.value = ''; ask(v); });
    const showWelcome = () => {
      addMsg('bot', [el('p', {class: 'pqc-text'}, 'Ask me anything about the 2011–2026 Prelims questions — weightage, trends, years and formats — or practise: quiz yourself, open a question and get it explained, or look up a keyword.'),
        chips(['Top 5 themes in Polity', 'Which themes are rising?', 'Quiz me on Polity', 'What is fiscal deficit?', 'Show questions on Ramsar', 'help'])]);
    };
    const resetChat = () => {
      answer('reset');
      if (tutor()) tutor().reset();
      log.replaceChildren();
      input.value = '';
      input.placeholder = 'Ask about subjects, themes, years…';
      showWelcome();
      input.focus();
    };
    panel = el('section', {class: 'pqc-panel', id: 'pqc-panel', 'aria-label': 'Ask PrelimsGPT'},
      el('header', {class: 'pqc-head'},
        el('div', null, el('strong', null, 'Ask PrelimsGPT'), el('span', null, 'PYQ Trends, Concepts & Quiz · 2011–2026')),
        el('div', {class: 'pqc-head-actions'},
          el('button', {type: 'button', class: 'pqc-reset', 'aria-label': 'Reset conversation', title: 'Reset chat and clear context', onclick: resetChat}, '↻ Reset'),
          el('button', {type: 'button', class: 'pqc-close', 'aria-label': 'Close', onclick: () => {
            if (isEmbedChat && window.parent && window.parent !== window) {
              window.parent.postMessage({type: 'PQC_CLOSE'}, '*');
            } else {
              toggle(false);
            }
          }}, '×'))),
      log, form);
    panel.hidden = !isEmbedChat;
    document.body.append(panel, fab);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panel.hidden) {
        if (isEmbedChat && window.parent && window.parent !== window) window.parent.postMessage({type: 'PQC_CLOSE'}, '*');
        else toggle(false);
      }
    });
    window.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'PQC_ASK' && e.data.q) {
        if (panel.hidden) toggle(true);
        ask(String(e.data.q));
      }
    });
    // clicks inside tutor answers (option buttons, "open 3") come back through this box
    if (tutor()) tutor().host = (t, o) => { if (panel.hidden) toggle(true); ask(t, Object.assign({}, o, {engine: 'tutor'})); };
    showWelcome();
    const initQ = sp.get('q');
    if (initQ) setTimeout(() => ask(initQ), 60);
  }

  window.PQChat = {answer, parse, search, correct, guessTheme, NBP, route, glossaryReport: () => GLOSS_REPORT, context: () => ctx, ask: (t, o) => { if (panel.hidden) toggle(true); ask(t, o); }};
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
