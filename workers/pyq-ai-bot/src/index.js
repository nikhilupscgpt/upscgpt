/**
 * PrelimsGPT-First · Gap-Fill UPSC PYQ AI Worker
 * - Main Model: env.AI_MODEL_MAIN (@cf/google/gemma-4-26b-a4b-it)
 * - Fallback Model: env.AI_MODEL_FALLBACK (@cf/meta/llama-3.1-8b-instruct-fp8-fast)
 * - Only called when PrelimsGPT reports non-empty `missing[]`
 * - Answers ONLY the missing gap in <= 3 points (<= 25 words each), no PYQ years/counts/keys
 * - Hard-scrubs overlap, years/counts/keys, and ungrounded facts in (a) solution-backed mode
 */

const STOP_WORDS = new Set([
  'what', 'which', 'how', 'when', 'where', 'why', 'who', 'the', 'and', 'for', 'with',
  'about', 'from', 'into', 'between', 'compare', 'difference', 'explain', 'tell', 'upsc',
  'prelims', 'pyq', 'pyqs', 'question', 'questions', 'did', 'does', 'was', 'were', 'are',
  'is', 'in', 'on', 'of', 'to', 'a', 'an', 'vs', 'versus', 'using', 'under', 'say',
]);

const ROBOTIC_OPENERS = [
  /^(certainly|sure|of course|absolutely|great question|let'?s dive in|here is|here are|as an ai[^.,]*)[!,.:;\s-]*/i,
  /\b(in conclusion|to summarize|it is important to note that|it is worth noting that)[,:\s]*/gi,
];

function corsHeaders(origin, allowedOrigin) {
  const allow =
    !origin ||
    origin.startsWith('http://localhost:') ||
    origin === allowedOrigin ||
    origin === 'https://upscgpt.in'
      ? origin || '*'
      : allowedOrigin;

  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-ingest-secret',
  };
}

function cleanText(val) {
  let raw = '';
  if (typeof val === 'string') {
    raw = val;
  } else if (val && typeof val === 'object') {
    raw =
      val.text ||
      val.point ||
      val.line ||
      val.content ||
      Object.values(val).find((v) => typeof v === 'string') ||
      '';
  }
  let out = String(raw).trim();
  for (const re of ROBOTIC_OPENERS) out = out.replace(re, '');
  return out.replace(/\s+/g, ' ').trim();
}

function extractJsonObject(raw) {
  if (raw && typeof raw === 'object') return raw;
  const txt = String(raw || '').trim();
  const fenced = txt.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : txt;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}

function contentWords(txt) {
  return String(txt || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOP_WORDS.has(w));
}

function buildFtsQuery(question) {
  const tokens = String(question || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w))
    .slice(0, 8);
  if (!tokens.length) return null;
  return tokens.map((t) => `"${t}"`).join(' OR ');
}

async function searchSolutionPassages(question, missing, env) {
  const embedModel = env.EMBED_MODEL || '@cf/baai/bge-m3';
  const rerankModel = env.RERANK_MODEL || '@cf/baai/bge-reranker-base';
  const ftsQuery = buildFtsQuery(question);

  const [vecResult, ftsResult] = await Promise.all([
    (async () => {
      try {
        const emb = await env.AI.run(embedModel, { text: [question] });
        const qVec = emb?.data?.[0];
        if (!Array.isArray(qVec) || !qVec.length) return [];
        const res = await env.VECTORIZE.query(qVec, { topK: 18, returnMetadata: 'all' });
        return res?.matches || [];
      } catch {
        return [];
      }
    })(),
    (async () => {
      if (!ftsQuery) return [];
      try {
        const res = await env.DB.prepare(
          `SELECT chunk_id, doc_id, chunk_type, subject, text, bm25(kb_chunks_fts) AS rank
           FROM kb_chunks_fts
           WHERE kb_chunks_fts MATCH ? AND chunk_type IN ('solution', 'statement', 'article')
           ORDER BY rank LIMIT 14`
        )
          .bind(ftsQuery)
          .all();
        return res?.results || [];
      } catch {
        return [];
      }
    })(),
  ]);

  const candidateMap = new Map();
  for (const r of ftsResult) {
    candidateMap.set(r.chunk_id, {
      chunk_id: r.chunk_id,
      doc_id: r.doc_id,
      chunk_type: r.chunk_type,
      subject: r.subject,
      text: r.text,
      exactBoost: 1,
    });
  }

  const missingVecIds = [];
  for (const m of vecResult) {
    const ct = m.metadata?.chunk_type || 'question';
    if (!['solution', 'statement', 'article'].includes(ct)) continue;
    if (!candidateMap.has(m.id)) {
      missingVecIds.push(m.id);
      candidateMap.set(m.id, {
        chunk_id: m.id,
        doc_id: m.metadata?.doc_id || m.id.split('::')[0],
        chunk_type: ct,
        subject: m.metadata?.subject || '',
        text: '',
        vecScore: m.score || 0,
      });
    }
  }

  if (missingVecIds.length > 0) {
    const placeholders = missingVecIds.map(() => '?').join(',');
    const rows = await env.DB.prepare(
      `SELECT chunk_id, doc_id, chunk_type, subject, text FROM kb_chunks WHERE chunk_id IN (${placeholders})`
    )
      .bind(...missingVecIds)
      .all();
    for (const r of rows?.results || []) {
      const entry = candidateMap.get(r.chunk_id);
      if (entry) entry.text = r.text;
    }
  }

  // Filter & boost exact terms (e.g. "procedure established by law", "due process", "Article 21", case names)
  const qTokens = contentWords(question);
  const missingConceptTokens = missing
    .filter((m) => String(m).startsWith('concept:'))
    .flatMap((m) => contentWords(m.slice(8)));
  const focusTokens = [...new Set([...missingConceptTokens, ...qTokens])];

  let candidates = [...candidateMap.values()].filter((c) => c.text && c.text.length > 20);
  if (candidates.length > 1) {
    const slice = candidates.slice(0, 20);
    try {
      const rr = await env.AI.run(rerankModel, {
        query: question,
        contexts: slice.map((c) => ({ text: c.text.slice(0, 800) })),
      });
      const scores = rr?.response || rr?.data || [];
      for (const item of scores) {
        const idx = Number(item.id ?? item.index);
        if (slice[idx]) slice[idx].rerankScore = Number(item.score ?? 0);
      }
      candidates = slice;
    } catch {
      // keep order
    }
  }

  for (const c of candidates) {
    const low = c.text.toLowerCase();
    const hits = focusTokens.filter((t) => low.includes(t)).length;
    c.tokenCoverage = focusTokens.length ? hits / focusTokens.length : 0;
    c.finalScore = (c.rerankScore || c.vecScore || 0.2) + c.tokenCoverage * 0.6 + (c.exactBoost ? 0.15 : 0);
  }
  candidates.sort((a, b) => b.finalScore - a.finalScore);

  // Decide if retrieved solutions actually cover the missing gap (>= 50% focus token match + rerank/score threshold)
  const goodPassages = candidates.filter(
    (c) => c.tokenCoverage >= 0.45 && (c.rerankScore === undefined || c.rerankScore >= 0.15)
  ).slice(0, 4);

  if (!goodPassages.length) {
    return { sourceMode: 'general', passages: [], sources: [] };
  }

  // Hydrate source labels (year + subject) for chips
  const docIds = [...new Set(goodPassages.map((p) => p.doc_id))];
  const placeholders = docIds.map(() => '?').join(',');
  const docRows = await env.DB.prepare(
    `SELECT id, kind, year, subject, title FROM kb_docs WHERE id IN (${placeholders})`
  )
    .bind(...docIds)
    .all();
  const docMap = new Map((docRows?.results || []).map((d) => [d.id, d]));

  const sources = docIds.map((id) => {
    const d = docMap.get(id);
    if (!d) return { id, label: 'Stored Solution' };
    return {
      id,
      label: d.kind === 'pyq' ? `${d.year} · ${d.subject}` : d.title || 'Constitution Bare Act',
    };
  });

  return { sourceMode: 'solutions', passages: goodPassages, sources };
}

function scrubGapPoints(rawPoints, shownSummary, sourceMode, passages, missing = [], question = '') {
  const querySet = new Set(contentWords(question));
  const shownSet = new Set(contentWords(shownSummary).filter((w) => !querySet.has(w)));
  const isDefiningMissing = missing.includes('definition');
  const passageCorpus = passages.map((p) => p.text).join(' ').toLowerCase();
  const allowedNums = new Set([...(passageCorpus.matchAll(/\b\d+\b/g) || [])].map((m) => m[0]));
  const allowedArts = new Set(
    [...(passageCorpus.matchAll(/\barticle\s+(\d+[a-z]?)\b/gi) || [])].map((m) => m[1].toLowerCase())
  );

  const kept = [];
  for (const raw of Array.isArray(rawPoints) ? rawPoints : []) {
    const pt = cleanText(raw);
    if (!pt || pt.length < 8) continue;

    // Drop any point containing a PYQ year, PYQ count, or answer-key letter
    if (/\b201[1-9]|202[0-6]\b/.test(pt)) continue;
    if (/\b\d+\s+(?:pyqs?|questions?)\b/i.test(pt)) continue;
    if (/\b(?:answer\s*key|correct\s*option|option)\s*\(?[a-d]\)?\b/i.test(pt)) continue;

    // Drop any point whose content words mostly overlap shownSummary (skip when AI is defining a missing term)
    const words = contentWords(pt).filter((w) => !querySet.has(w));
    if (!isDefiningMissing && words.length > 0 && shownSet.size > 0) {
      const overlap = words.filter((w) => shownSet.has(w)).length / words.length;
      if (overlap >= 0.75) continue;
    }

    // In (a) solution-backed mode, drop sentences with numbers or Article numbers not in retrieved passages
    if (sourceMode === 'solutions') {
      let ungrounded = false;
      for (const m of pt.matchAll(/\barticle\s+(\d+[a-z]?)\b/gi)) {
        if (!allowedArts.has(m[1].toLowerCase())) {
          ungrounded = true;
          break;
        }
      }
      if (!ungrounded) {
        for (const m of pt.matchAll(/\b\d+\b/g)) {
          if (!allowedNums.has(m[0])) {
            ungrounded = true;
            break;
          }
        }
      }
      if (ungrounded) continue;
    }

    // Enforce <= 25 words per point cleanly
    const wordList = pt.split(/\s+/);
    const clipped = wordList.length > 25 ? wordList.slice(0, 25).join(' ').replace(/[,;:\s]+$/, '') + '.' : pt;
    kept.push(clipped);
    if (kept.length >= 3) break;
  }

  return kept;
}

async function runGapModel(modelId, messages, env, extraOpts = {}) {
  const result = await env.AI.run(modelId, {
    messages,
    max_tokens: 160,
    temperature: 0.1,
    ...extraOpts,
  });
  const raw = result?.response ?? result?.choices?.[0]?.message?.content ?? '';
  const parsed = extractJsonObject(raw);
  const valid = parsed && Array.isArray(parsed.points) && parsed.points.length > 0;
  return {
    valid,
    parsed,
    raw,
    usage: result?.usage || null,
    model: modelId,
  };
}

async function runWithRetry({ messages, env }) {
  const mainModel = env.AI_MODEL_MAIN || '@cf/meta/llama-3.1-8b-instruct-fp8-fast';

  // Llama retry once -> stored answer only (no Gemma fallback wait)
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await runGapModel(mainModel, messages, env);
      if (res.valid) return res;
    } catch {
      // retry once
    }
  }
  return { valid: false, parsed: null, usage: null, model: mainModel };
}

async function syncDocsToKb(items, env) {
  if (!Array.isArray(items) || !items.length) {
    return { synced: 0, skipped: 0, vectorsUpserted: 0 };
  }
  const embedModel = env.EMBED_MODEL || '@cf/baai/bge-m3';
  const nowIso = new Date().toISOString();
  const changedChunks = [];
  let synced = 0;
  let skipped = 0;

  const ids = items.map((it) => it?.doc?.id).filter(Boolean);
  const existingHashes = new Map();
  if (ids.length > 0) {
    const placeholders = ids.map(() => '?').join(',');
    const res = await env.DB.prepare(`SELECT id, content_hash FROM kb_docs WHERE id IN (${placeholders})`)
      .bind(...ids)
      .all();
    for (const r of res?.results || []) existingHashes.set(r.id, r.content_hash);
  }

  for (const item of items) {
    const d = item?.doc;
    const chunks = Array.isArray(item?.chunks) ? item.chunks : [];
    if (!d?.id) continue;
    if (existingHashes.get(d.id) === d.content_hash) {
      skipped++;
      continue;
    }

    await env.DB.prepare(
      `INSERT OR REPLACE INTO kb_docs
       (id, kind, year, subject, topic, title, stem, options_json, answer_key, answer_text, explanation, has_solution, meta_json, content_hash, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        d.id, d.kind || 'pyq', d.year ?? null, d.subject || 'General', d.topic || 'General',
        d.title || '', d.stem || '', d.options_json || null, d.answer_key || null,
        d.answer_text || null, d.explanation || '', d.has_solution ? 1 : 0,
        d.meta_json || null, d.content_hash || '', nowIso
      )
      .run();

    await env.DB.prepare('DELETE FROM kb_chunks WHERE doc_id = ?').bind(d.id).run();
    await env.DB.prepare('DELETE FROM kb_chunks_fts WHERE doc_id = ?').bind(d.id).run();

    for (const c of chunks) {
      await env.DB.prepare(
        `INSERT INTO kb_chunks (chunk_id, doc_id, chunk_type, year, subject, text, meta_json) VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(c.chunk_id, c.doc_id, c.chunk_type, c.year ?? null, c.subject || 'General', c.text, JSON.stringify({ kind: c.kind || 'pyq' }))
        .run();
      await env.DB.prepare(
        `INSERT INTO kb_chunks_fts (chunk_id, doc_id, chunk_type, subject, text) VALUES (?, ?, ?, ?, ?)`
      )
        .bind(c.chunk_id, c.doc_id, c.chunk_type, c.subject || 'General', c.text)
        .run();
      changedChunks.push(c);
    }
    synced++;
  }

  let vectorsUpserted = 0;
  for (let i = 0; i < changedChunks.length; i += 50) {
    const slice = changedChunks.slice(i, i + 50);
    const emb = await env.AI.run(embedModel, { text: slice.map((c) => c.text) });
    const vectors = slice.map((c, idx) => ({
      id: c.chunk_id,
      values: emb.data[idx],
      metadata: {
        doc_id: c.doc_id,
        chunk_type: c.chunk_type,
        kind: c.kind || 'pyq',
        subject: c.subject || 'General',
        ...(c.year ? { year: Number(c.year) } : {}),
      },
    }));
    await env.VECTORIZE.upsert(vectors);
    vectorsUpserted += vectors.length;
  }

  await env.DB.prepare('INSERT OR REPLACE INTO kb_meta (key, value) VALUES (?, ?)')
    .bind('last_sync_at', nowIso)
    .run()
    .catch(() => {});

  return { synced, skipped, vectorsUpserted, lastSyncAt: nowIso };
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin, env.ALLOWED_ORIGIN || 'https://www.upscgpt.in');
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method === 'POST' && url.pathname === '/admin/ingest-vectors') {
      const secret = request.headers.get('x-ingest-secret') || '';
      if (!env.INGEST_SECRET || secret !== env.INGEST_SECRET) {
        return Response.json({ error: 'Unauthorized' }, { status: 401, headers: cors });
      }
      const body = await request.json();
      const chunks = Array.isArray(body?.chunks) ? body.chunks.slice(0, 50) : [];
      if (!chunks.length) return Response.json({ ok: true, upserted: 0 }, { status: 200, headers: cors });
      const embedModel = env.EMBED_MODEL || '@cf/baai/bge-m3';
      const emb = await env.AI.run(embedModel, { text: chunks.map((c) => c.text) });
      const vectors = chunks.map((c, i) => ({
        id: c.chunk_id,
        values: emb.data[i],
        metadata: {
          doc_id: c.doc_id,
          chunk_type: c.chunk_type,
          kind: c.kind || 'pyq',
          subject: c.subject || 'General',
          ...(c.year ? { year: Number(c.year) } : {}),
        },
      }));
      await env.VECTORIZE.upsert(vectors);
      return Response.json({ ok: true, upserted: vectors.length }, { status: 200, headers: cors });
    }

    if (request.method === 'POST' && url.pathname === '/admin/sync-docs') {
      const secret = request.headers.get('x-ingest-secret') || '';
      if (!env.INGEST_SECRET || secret !== env.INGEST_SECRET) {
        return Response.json({ error: 'Unauthorized' }, { status: 401, headers: cors });
      }
      const body = await request.json();
      const items = Array.isArray(body?.items) ? body.items.slice(0, 100) : [];
      const stats = await syncDocsToKb(items, env);
      return Response.json({ ok: true, ...stats }, { status: 200, headers: cors });
    }

    // Retrieval-only semantic PYQ lookup (bge-m3 + bge-reranker-base, 0 LLM generation, edge-cached)
    if (request.method === 'POST' && url.pathname === '/retrieve') {
      const body = await request.json().catch(() => ({}));
      const q = String(body?.question || '').trim().slice(0, 300);
      if (q.length < 3) return Response.json({ ok: true, docIds: [] }, { status: 200, headers: cors });

      const rCacheUrl = new URL(request.url);
      rCacheUrl.pathname = `/__cache/ret/v4/${encodeURIComponent(q.toLowerCase())}`;
      const rCacheKey = new Request(rCacheUrl.toString(), { method: 'GET' });
      const cached = await caches.default.match(rCacheKey);
      if (cached) {
        return Response.json(await cached.json(), { status: 200, headers: cors });
      }

      const embedModel = env.EMBED_MODEL || '@cf/baai/bge-m3';
      const rerankModel = env.RERANK_MODEL || '@cf/baai/bge-reranker-base';
      const emb = await env.AI.run(embedModel, { text: [q] });
      const qVec = emb?.data?.[0];
      const matches = Array.isArray(qVec) && qVec.length
        ? (await env.VECTORIZE.query(qVec, { topK: 16, filter: { kind: 'pyq' }, returnMetadata: 'all' }))?.matches || []
        : [];

      const candIds = matches.filter((m) => (m.score || 0) >= 0.32).map((m) => m.id).slice(0, 14);
      let docIds = [];
      if (candIds.length > 0 && env.DB) {
        const placeholders = candIds.map(() => '?').join(',');
        const rows = await env.DB.prepare(
          `SELECT chunk_id, doc_id, text FROM kb_chunks WHERE chunk_id IN (${placeholders})`
        ).bind(...candIds).all();
        const chunks = rows?.results || [];
        if (chunks.length > 1) {
          try {
            const rr = await env.AI.run(rerankModel, {
              query: q,
              contexts: chunks.map((c) => ({ text: c.text.slice(0, 700) })),
            });
            const scores = rr?.response || rr?.data || [];
            for (const item of scores) {
              const idx = Number(item.id ?? item.index);
              if (chunks[idx]) chunks[idx].rrScore = Number(item.score ?? 0);
            }
            chunks.sort((a, b) => (b.rrScore ?? 0) - (a.rrScore ?? 0));
          } catch {
            // fallback to vector order
          }
        }
        const seen = new Set();
        for (const c of chunks) {
          if (c.rrScore !== undefined && c.rrScore < 0.55) continue;
          if (!seen.has(c.doc_id)) {
            seen.add(c.doc_id);
            docIds.push({ id: c.doc_id, score: Number((c.rrScore ?? 0.5).toFixed(3)) });
            if (docIds.length >= 8) break;
          }
        }
      }
      const resPayload = { ok: true, docIds };
      ctx.waitUntil(
        caches.default.put(
          rCacheKey,
          new Response(JSON.stringify(resPayload), {
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=604800' },
          })
        )
      );
      return Response.json(resPayload, { status: 200, headers: cors });
    }

    if (request.method !== 'POST') {
      return Response.json(
        {
          ok: true,
          service: 'upscgpt-pyq-ai-bot',
          mode: 'gap-fill',
          mainModel: env.AI_MODEL_MAIN || '@cf/meta/llama-3.1-8b-instruct-fp8-fast',
        },
        { status: 200, headers: cors }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers: cors });
    }

    const question = String(body?.question || '').trim().slice(0, 400);
    const missing = Array.isArray(body?.missing) ? body.missing : [];
    const shownSummary = String(body?.shownSummary || '').slice(0, 1800);

    if (question.length < 3) {
      return Response.json({ error: 'Question is too short' }, { status: 400, headers: cors });
    }

    // Edge cache v9 keyed by question + forceModel (so benchmark doesn't collide)
    const modelTag = body?.forceModel || (Number(body?.poolPct || 0) >= 60 ? 'fallback' : 'auto');
    const cacheKeyUrl = new URL(request.url);
    cacheKeyUrl.pathname = `/__cache/v9/${modelTag}/${encodeURIComponent(question.toLowerCase())}`;
    const cacheKey = new Request(cacheKeyUrl.toString(), { method: 'GET' });
    const cache = caches.default;

    if (!body?.skipCache) {
      const cached = await cache.match(cacheKey);
      if (cached) {
        const data = await cached.json();
        return Response.json({ ...data, cached: true, neuronsUsed: 0 }, { status: 200, headers: cors });
      }
    }

    if (body?.cachedOnly === true) {
      return Response.json(
        { ok: false, cachedOnlyMiss: true, error: 'Free AI pool is resting for today.' },
        { status: 429, headers: cors }
      );
    }

    // Step 5: Search (a) our stored solutions first; fallback to (b) model knowledge
    const { sourceMode, passages, sources } = await searchSolutionPassages(question, missing, env);

    const passageBlock = passages.length
      ? '\n\nStored UPSC Solution Passages:\n' + passages.map((p, i) => `[S${i + 1}] ${p.text.slice(0, 500)}`).join('\n')
      : '';

    const langNote = body?.lang === 'hi'
      ? ' Reply in clear Hindi (Devanagari script).'
      : body?.lang === 'mr'
        ? ' Reply in clear Marathi (Devanagari script).'
        : '';

    const systemPrompt =
      'You are a crisp UPSC CSE Prelims mentor. Return ONLY valid JSON: {"points":["point 1","point 2"]}. ' +
      'Rules: ' +
      '(1) Answer ONLY the missing part(s): ' + (missing.join(', ') || 'missing explanation') + '. ' +
      '(2) At most 3 points, each 25 words or fewer, in plain, human language.' + langNote + ' ' +
      '(3) NO PYQ years (like 2023), NO PYQ counts, NO lists of questions, and NO answer-key letters. ' +
      '(4) NEVER repeat facts already shown to the student. ' +
      (sourceMode === 'solutions'
        ? '(5) Use ONLY the Stored UPSC Solution Passages provided.'
        : '(5) No stored solution covered this gap; give a clean standard UPSC explanation without inventing PYQ years.');

    const userPrompt =
      `Question: ${question}\nAlready shown by PrelimsGPT (do NOT repeat): ${shownSummary || 'none'}${passageBlock}`;

    let runRes;
    if (body?.forceModel === 'gemma-no-think') {
      try {
        runRes = await runGapModel(
          '@cf/google/gemma-4-26b-a4b-it',
          [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          env,
          body?.extraOpts && typeof body.extraOpts === 'object' ? body.extraOpts : {}
        );
      } catch (e) {
        runRes = { valid: false, parsed: null, raw: String(e), usage: null, model: '@cf/google/gemma-4-26b-a4b-it' };
      }
    } else {
      runRes = await runWithRetry({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        env,
      });
    }

    const cleanedPoints = runRes.valid
      ? scrubGapPoints(runRes.parsed.points, shownSummary, sourceMode, passages, missing, question)
      : [];

    const payload = {
      ok: true,
      mode: 'gap-fill',
      model: runRes.model,
      cached: false,
      sourceMode,
      label:
        sourceMode === 'solutions'
          ? 'From our solutions'
          : 'Concept Overview',
      sources: sourceMode === 'solutions' ? sources : [],
      points: cleanedPoints,
      empty: cleanedPoints.length === 0,
      usage: runRes.usage,
      ...(body?.debugRaw ? { raw: runRes.raw } : {}),
    };

    if (!body?.skipCache && cleanedPoints.length > 0) {
      const cacheRes = new Response(JSON.stringify(payload), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=604800' },
      });
      ctx.waitUntil(cache.put(cacheKey, cacheRes));
    }

    return Response.json(payload, { status: 200, headers: cors });
  },

  async scheduled(event, env, ctx) {
    if (!env.APP_ORIGIN || !env.INGEST_SECRET || !env.DB) return;
    try {
      const metaRow = await env.DB.prepare(`SELECT value FROM kb_meta WHERE key = 'last_sync_at'`).first();
      const since = metaRow?.value || new Date(Date.now() - 48 * 3600 * 1000).toISOString();
      const res = await fetch(
        `${env.APP_ORIGIN.replace(/\/$/, '')}/api/internal/pyq-sync?since=${encodeURIComponent(since)}&limit=100`,
        { headers: { 'x-internal-secret': env.INGEST_SECRET } }
      );
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data?.items) && data.items.length > 0) {
        await syncDocsToKb(data.items, env);
      }
    } catch (err) {
      console.error('[scheduled sync] error:', err?.message || String(err));
    }
  },
};
