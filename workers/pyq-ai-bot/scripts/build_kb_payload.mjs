import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workerRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(workerRoot, '../..');
const outDir = path.join(workerRoot, '.kb_build');
fs.mkdirSync(outDir, { recursive: true });

function sqlStr(val) {
  if (val === null || val === undefined) return 'NULL';
  return "'" + String(val).replace(/'/g, "''") + "'";
}

function sha1(val) {
  return crypto.createHash('sha1').update(String(val)).digest('hex').slice(0, 16);
}

const dashPath = path.join(repoRoot, 'public/pyq/data/questions.json');
const neonPath = path.join(repoRoot, 'tools/pyq/input/neon_pyqs_with_solutions.json');
const coiPath = path.join(repoRoot, 'tools/pyq/input/constitution_of_india.json');

const dashQs = JSON.parse(fs.readFileSync(dashPath, 'utf8'));
const neonQs = JSON.parse(fs.readFileSync(neonPath, 'utf8'));
const neonById = new Map(neonQs.map((q) => [String(q.id), q]));
const coi = fs.existsSync(coiPath) ? JSON.parse(fs.readFileSync(coiPath, 'utf8')) : null;

const docs = [];
const chunks = [];
const nowIso = new Date().toISOString();

for (const dq of dashQs) {
  const nq = neonById.get(String(dq.id));
  const id = String(dq.id);
  const year = Number(dq.year || nq?.examYear || 0) || null;
  const subject = dq.subject || nq?.subject || 'General';
  const topic = `${dq.theme || 'General'} · ${dq.sub || nq?.topic || 'General'}`;
  const stem = String(nq?.stem || dq.stem || '').trim();
  const rawOpts = Array.isArray(nq?.options) && nq.options.length
    ? nq.options
    : Array.isArray(dq.options)
      ? dq.options
      : [];
  const opts = rawOpts.map((o) => ({
    label: String(o.label || '').toUpperCase(),
    text: String(o.text || '').trim(),
  }));
  const answerKey = String(nq?.correctLabel || dq.answer || '?').toUpperCase();
  const answerText = String(dq.answerText || '').trim();
  const hasSolution = Boolean(nq?.hasSolution || dq.hasSolution);

  let solSummary = String(nq?.explanation || '').trim();
  if (!solSummary && nq?.analysis) {
    const sb = Array.isArray(nq.analysis.statementBreakdown)
      ? nq.analysis.statementBreakdown.map((s) => s.explanation || s.text).filter(Boolean).join(' ')
      : '';
    const ob = Array.isArray(nq.analysis.optionBreakdown)
      ? nq.analysis.optionBreakdown.map((o) => o.explanation || o.text).filter(Boolean).join(' ')
      : '';
    solSummary = [sb, ob].filter(Boolean).join(' ');
  }

  const meta = {
    questionNo: nq?.questionNo || null,
    map: Boolean(dq.map),
    ca: Boolean(dq.ca),
    format: dq.format || null,
  };

  docs.push({
    id,
    kind: 'pyq',
    year,
    subject,
    topic,
    title: `${year || ''} ${subject} · ${topic}`.trim(),
    stem,
    options_json: JSON.stringify(opts),
    answer_key: answerKey,
    answer_text: answerText,
    explanation: solSummary.slice(0, 2000),
    has_solution: hasSolution ? 1 : 0,
    meta_json: JSON.stringify(meta),
    content_hash: sha1(JSON.stringify({ stem, opts, answerKey, solSummary })),
  });

  // 1. Question chunk
  const optsLine = opts.map((o) => `(${o.label}) ${o.text}`).join(' | ');
  chunks.push({
    chunk_id: `${id}::q`,
    doc_id: id,
    chunk_type: 'question',
    kind: 'pyq',
    year,
    subject,
    text: `[UPSC ${year} · ${subject} · ${topic}] ${stem}${optsLine ? ` Options: ${optsLine}` : ''}`.slice(0, 1400),
  });

  // 2. Statement chunks (if statementBreakdown exists)
  if (Array.isArray(nq?.analysis?.statementBreakdown)) {
    nq.analysis.statementBreakdown.forEach((st, idx) => {
      const stText = [st.statement || st.text, st.isTrue !== undefined ? `(${st.isTrue ? 'TRUE' : 'FALSE'})` : '', st.explanation]
        .filter(Boolean)
        .join(' — ');
      if (stText.trim().length > 12) {
        chunks.push({
          chunk_id: `${id}::st${idx + 1}`,
          doc_id: id,
          chunk_type: 'statement',
          kind: 'pyq',
          year,
          subject,
          text: `[UPSC ${year} · ${subject}] Statement ${idx + 1}: ${stText}`.slice(0, 900),
        });
      }
    });
  }

  // 3. Solution chunk (when solution exists)
  if (hasSolution && solSummary) {
    chunks.push({
      chunk_id: `${id}::sol`,
      doc_id: id,
      chunk_type: 'solution',
      kind: 'pyq',
      year,
      subject,
      text: `[UPSC ${year} · ${subject} · Key (${answerKey}) ${answerText}] ${solSummary}`.slice(0, 1400),
    });
  }

  // 4. Keyword chunk (from analysis.keywords + theme/sub)
  const kws = Array.isArray(nq?.analysis?.keywords) ? nq.analysis.keywords : [];
  if (kws.length > 0 || dq.theme || dq.sub) {
    chunks.push({
      chunk_id: `${id}::kw`,
      doc_id: id,
      chunk_type: 'keyword',
      kind: 'pyq',
      year,
      subject,
      text: `${subject} | ${dq.theme || ''} | ${dq.sub || ''} | ${kws.join(', ')}`.slice(0, 600),
    });
  }
}

// Constitution of India: Articles, Schedules, Preamble
if (coi) {
  for (const a of coi.articles || []) {
    if (!a?.article) continue;
    const id = `coi::art::${String(a.article).trim().toLowerCase()}`;
    const clauseText = Array.isArray(a.clauses) && a.clauses.length
      ? a.clauses.map((c) => (typeof c === 'string' ? c : c.text || '')).filter(Boolean).join(' ')
      : '';
    const body = String(a.text || clauseText || a.text_official || '').trim();
    const meta = {
      article: String(a.article),
      part: a.part || null,
      part_title: a.part_title || null,
      status: a.status || 'active',
      amended_by: Array.isArray(a.amended_by) ? a.amended_by.slice(0, 5) : [],
    };
    docs.push({
      id,
      kind: 'article',
      year: null,
      subject: 'Indian Polity',
      topic: a.part_title || 'Constitution of India',
      title: `Article ${a.article}${a.title ? ` — ${a.title}` : ''}`,
      stem: body.slice(0, 1400),
      options_json: null,
      answer_key: null,
      answer_text: null,
      explanation: body.slice(0, 1400),
      has_solution: 1,
      meta_json: JSON.stringify(meta),
      content_hash: sha1(body + JSON.stringify(meta)),
    });
    chunks.push({
      chunk_id: `${id}::a`,
      doc_id: id,
      chunk_type: 'article',
      kind: 'article',
      year: null,
      subject: 'Indian Polity',
      text: `Article ${a.article} (${a.title || ''}) [Part ${a.part || ''}, status=${a.status || 'active'}]: ${body}`.slice(0, 1400),
    });
  }

  for (const s of coi.schedules || []) {
    if (!s?.schedule) continue;
    const id = `coi::sched::${String(s.schedule).trim()}`;
    const body = String(s.text || '').trim();
    docs.push({
      id,
      kind: 'schedule',
      year: null,
      subject: 'Indian Polity',
      topic: 'Constitution Schedules',
      title: `Schedule ${s.schedule}${s.title ? ` — ${s.title}` : ''}`,
      stem: body.slice(0, 1400),
      options_json: null,
      answer_key: null,
      answer_text: null,
      explanation: body.slice(0, 1400),
      has_solution: 1,
      meta_json: JSON.stringify({ schedule: s.schedule, name: s.name || null }),
      content_hash: sha1(body),
    });
    chunks.push({
      chunk_id: `${id}::s`,
      doc_id: id,
      chunk_type: 'article',
      kind: 'schedule',
      year: null,
      subject: 'Indian Polity',
      text: `Schedule ${s.schedule} (${s.title || s.name || ''}): ${body}`.slice(0, 1400),
    });
  }

  if (coi.preamble?.text) {
    const id = 'coi::preamble';
    const body = String(coi.preamble.text).trim();
    docs.push({
      id,
      kind: 'preamble',
      year: null,
      subject: 'Indian Polity',
      topic: 'Preamble',
      title: 'Preamble to the Constitution of India',
      stem: body.slice(0, 1400),
      options_json: null,
      answer_key: null,
      answer_text: null,
      explanation: body.slice(0, 1400),
      has_solution: 1,
      meta_json: JSON.stringify({}),
      content_hash: sha1(body),
    });
    chunks.push({
      chunk_id: `${id}::p`,
      doc_id: id,
      chunk_type: 'article',
      kind: 'preamble',
      year: null,
      subject: 'Indian Polity',
      text: `Preamble to the Constitution of India: ${body}`.slice(0, 1400),
    });
  }
}

// Write D1 SQL seed file (clear FTS + upsert docs + chunks)
const sqlLines = [
  'DELETE FROM kb_chunks_fts;',
  'DELETE FROM kb_chunks;',
  'DELETE FROM kb_docs;',
];

for (const d of docs) {
  sqlLines.push(
    `INSERT INTO kb_docs (id,kind,year,subject,topic,title,stem,options_json,answer_key,answer_text,explanation,has_solution,meta_json,content_hash,updated_at) VALUES (${sqlStr(d.id)},${sqlStr(d.kind)},${d.year ?? 'NULL'},${sqlStr(d.subject)},${sqlStr(d.topic)},${sqlStr(d.title)},${sqlStr(d.stem)},${sqlStr(d.options_json)},${sqlStr(d.answer_key)},${sqlStr(d.answer_text)},${sqlStr(d.explanation)},${d.has_solution},${sqlStr(d.meta_json)},${sqlStr(d.content_hash)},${sqlStr(nowIso)});`
  );
}

for (const c of chunks) {
  sqlLines.push(
    `INSERT INTO kb_chunks (chunk_id,doc_id,chunk_type,year,subject,text,meta_json) VALUES (${sqlStr(c.chunk_id)},${sqlStr(c.doc_id)},${sqlStr(c.chunk_type)},${c.year ?? 'NULL'},${sqlStr(c.subject)},${sqlStr(c.text)},${sqlStr(JSON.stringify({ kind: c.kind }))});`
  );
  sqlLines.push(
    `INSERT INTO kb_chunks_fts (chunk_id,doc_id,chunk_type,subject,text) VALUES (${sqlStr(c.chunk_id)},${sqlStr(c.doc_id)},${sqlStr(c.chunk_type)},${sqlStr(c.subject)},${sqlStr(c.text)});`
  );
}

fs.writeFileSync(path.join(outDir, 'd1_seed.sql'), sqlLines.join('\n') + '\n', 'utf8');
fs.writeFileSync(path.join(outDir, 'chunks_for_embed.json'), JSON.stringify(chunks), 'utf8');

console.log(`Built ${docs.length} docs and ${chunks.length} chunks into ${outDir}`);
