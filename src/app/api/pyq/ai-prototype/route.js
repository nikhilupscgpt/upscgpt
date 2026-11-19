import fs from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { authorizeAiRequest, logPyqAiUsage } from '@/lib/pyq/aiAccess';

const DEFAULT_MODEL = '@cf/meta/llama-3.1-8b-instruct-fast';

// Simple in-memory cache so identical queries during dev/demo cost 0 Neurons
const localReplyCache = new Map();

const FALLBACK_ARTICLES = {
  '394': {
    article: '394',
    title: 'Commencement',
    text: 'This article and Articles 5, 6, 7, 8, 9, 60, 324, 366, 367, 379, 380, 388, 391, 392 and 393 came into force on 26 November 1949; the remaining provisions came into force on 26 January 1950 (referred to as the commencement of the Constitution).',
  },
  '395': {
    article: '395',
    title: 'Repeals',
    text: 'Repeals the Indian Independence Act, 1947 and the Government of India Act, 1935 (together with enactments amending or supplementing it, other than the Abolition of Privy Council Jurisdiction Act, 1949).',
  },
  '110': {
    article: '110',
    title: 'Definition of Money Bills',
    text: 'Speaker of the Lok Sabha certifies whether a Bill is a Money Bill and that decision is final; deals exclusively with taxes, borrowing, Consolidated/Contingency Fund, etc.',
  },
  '117': {
    article: '117',
    title: 'Special provisions as to Financial Bills',
    text: 'Article 117(1) Financial Bill Type I requires President recommendation and can only be introduced in Lok Sabha (Rajya Sabha can amend/reject); Article 117(3) Financial Bill Type II can be introduced in either House and needs President recommendation for consideration.',
  },
  '368': {
    article: '368',
    title: 'Power of Parliament to amend the Constitution and procedure therefor',
    text: 'Requires a special majority of each House separately (no joint sitting). Federal provisions additionally require ratification by at least half the State Legislatures.',
  },
};

let cachedConstitution = null;
function formatArticleRecord(item) {
  const clauseText = Array.isArray(item.clauses) && item.clauses.length
    ? item.clauses.map((c) => (typeof c === 'string' ? c : c.text || '')).filter(Boolean).join(' ')
    : '';
  const body = String(item.text || clauseText || item.text_official || '').trim().slice(0, 900);
  return {
    article: String(item.article),
    title: item.title || '',
    part: item.part || null,
    part_title: item.part_title || null,
    status: item.status || 'active',
    amended_by: Array.isArray(item.amended_by) ? item.amended_by.slice(0, 5) : [],
    text: body,
  };
}

function getConstitutionData() {
  if (cachedConstitution) return cachedConstitution;
  const root = process.cwd();
  const coiPath = path.join(root, 'tools/pyq/input/constitution_of_india.json');
  const articlesMap = { ...FALLBACK_ARTICLES };
  const schedulesMap = new Map();
  let preamble = null;

  if (fs.existsSync(coiPath)) {
    try {
      const coi = JSON.parse(fs.readFileSync(coiPath, 'utf8'));
      const arts = Array.isArray(coi.articles) ? coi.articles : [];
      for (const a of arts) {
        if (a?.article) {
          articlesMap[String(a.article).trim().toLowerCase()] = formatArticleRecord(a);
        }
      }
      const scheds = Array.isArray(coi.schedules) ? coi.schedules : [];
      for (const s of scheds) {
        if (s?.schedule) {
          schedulesMap.set(String(s.schedule).trim(), {
            article: `Schedule ${s.schedule}`,
            title: s.title || s.name || '',
            status: 'active',
            text: String(s.text || '').trim().slice(0, 900),
          });
        }
      }
      if (coi.preamble?.text) {
        preamble = {
          article: 'Preamble',
          title: 'Preamble to the Constitution of India',
          status: 'active',
          text: String(coi.preamble.text).trim().slice(0, 900),
        };
      }
    } catch {
      // fall through to optional articles.json / fallback
    }
  } else {
    const candidates = [
      path.join(root, 'tools/pyq/input/articles.json'),
      path.join(root, 'data/articles.json'),
      path.join(root, 'public/pyq/data/articles.json'),
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        try {
          const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
          if (Array.isArray(raw)) {
            for (const item of raw) {
              if (item?.article) {
                articlesMap[String(item.article).trim().toLowerCase()] = formatArticleRecord(item);
              }
            }
          } else if (raw && typeof raw === 'object') {
            Object.assign(articlesMap, raw);
          }
          break;
        } catch {
          // ignore malformed optional file
        }
      }
    }
  }

  cachedConstitution = { articlesMap, schedulesMap, preamble };
  return cachedConstitution;
}

const ORDINAL_TO_NUM = {
  first: '1', '1st': '1', second: '2', '2nd': '2', third: '3', '3rd': '3',
  fourth: '4', '4th': '4', fifth: '5', '5th': '5', sixth: '6', '6th': '6',
  seventh: '7', '7th': '7', eighth: '8', '8th': '8', ninth: '9', '9th': '9',
  tenth: '10', '10th': '10', eleventh: '11', '11th': '11', twelfth: '12', '12th': '12',
};

function extractArticleFacts(question, contextPyqs) {
  const { articlesMap, schedulesMap, preamble } = getConstitutionData();
  const combined = [
    question,
    ...contextPyqs.map((q) => `${q.stem} ${q.explanation || ''}`),
  ].join(' ');
  const found = [];
  const seen = new Set();

  for (const m of combined.matchAll(/\barticle\s+(\d+[a-z]?)\b/gi)) {
    const key = m[1].toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    if (articlesMap[key]) found.push(articlesMap[key]);
  }

  for (const m of combined.matchAll(/\b(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|\d{1,2}(?:st|nd|rd|th)?)\s+schedule\b|\bschedule\s+(\d{1,2})\b/gi)) {
    const rawNum = (m[1] || m[2] || '').toLowerCase();
    const num = ORDINAL_TO_NUM[rawNum] || rawNum.replace(/(st|nd|rd|th)$/i, '');
    const key = `sched:${num}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (schedulesMap.has(num)) found.push(schedulesMap.get(num));
  }

  if (preamble && /\bpreamble\b/i.test(combined)) {
    found.push(preamble);
  }

  return found.slice(0, 5);
}

let cachedCorpus = null;
function getCorpus() {
  if (cachedCorpus) return cachedCorpus;
  const root = process.cwd();
  const dashPath = fs.existsSync(path.join(root, 'public/pyq/data/questions.json'))
    ? path.join(root, 'public/pyq/data/questions.json')
    : path.join(root, 'tools/pyq/dashboard/questions.json');
  const neonPath = path.join(root, 'tools/pyq/input/neon_pyqs_with_solutions.json');

  const dashQs = fs.existsSync(dashPath) ? JSON.parse(fs.readFileSync(dashPath, 'utf8')) : [];
  const neonQs = fs.existsSync(neonPath) ? JSON.parse(fs.readFileSync(neonPath, 'utf8')) : [];
  const neonById = new Map(neonQs.map((q) => [String(q.id), q]));

  cachedCorpus = { dashQs, neonById };
  return cachedCorpus;
}

const STOP = new Set([
  'what', 'which', 'how', 'when', 'where', 'why', 'who', 'the', 'and', 'for', 'with',
  'about', 'from', 'into', 'between', 'compare', 'difference', 'explain', 'tell', 'upsc',
  'prelims', 'pyq', 'pyqs', 'question', 'questions', 'did', 'does', 'was', 'were', 'are',
]);

function retrieveContextPyqs(query, limit = 4) {
  const { dashQs, neonById } = getCorpus();
  const tokens = String(query || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOP.has(w));

  const phrase = tokens.join(' ');
  const scored = [];

  for (const dq of dashQs) {
    const nq = neonById.get(String(dq.id));
    const stemL = String(dq.stem || '').toLowerCase();
    const themeL = `${dq.theme || ''} ${dq.sub || ''} ${dq.subject || ''}`.toLowerCase();
    const expL = nq?.explanation ? String(nq.explanation).toLowerCase() : '';
    const anL = nq?.analysis ? JSON.stringify(nq.analysis).toLowerCase() : '';

    let score = 0;
    if (phrase.length >= 3) {
      if (themeL.includes(phrase)) score += 45;
      if (stemL.includes(phrase)) score += 35;
      if (anL.includes(phrase)) score += 20;
    }

    let hits = 0;
    let numMiss = false;
    const queryNums = tokens.filter((t) => /^\d+$/.test(t) && !/^20[12]\d$/.test(t));
    for (const nTok of queryNums) {
      const nRe = new RegExp(`\\b${nTok}\\b`);
      if (!nRe.test(themeL) && !nRe.test(stemL) && !nRe.test(expL) && !nRe.test(anL)) {
        numMiss = true;
      }
    }
    if (numMiss) continue;

    for (const tok of tokens) {
      if (/^20[12]\d$/.test(tok)) {
        if (dq.year === Number(tok)) score += 6;
        continue;
      }
      const isNum = /^\d+$/.test(tok);
      const tokRe = isNum ? new RegExp(`\\b${tok}\\b`) : null;
      const has = (txt) => (tokRe ? tokRe.test(txt) : txt.includes(tok));
      let matched = false;
      if (has(themeL)) { score += isNum ? 30 : 14; matched = true; }
      if (has(stemL)) { score += isNum ? 28 : 10; matched = true; }
      if (has(expL)) { score += isNum ? 20 : 5; matched = true; }
      if (has(anL)) { score += isNum ? 24 : 6; matched = true; }
      if (matched) hits++;
    }
    if (tokens.length > 1 && hits === tokens.length) score += 25;

    if (score > 0) {
      if (nq?.hasSolution) score += 4;
      scored.push({ dq, nq, score });
    }
  }

  scored.sort((a, b) => b.score - a.score || b.dq.year - a.dq.year);

  return scored.slice(0, limit).map(({ dq, nq }) => {
    let solSummary = nq?.explanation || '';
    if (!solSummary && nq?.analysis) {
      const sb = Array.isArray(nq.analysis.statementBreakdown)
        ? nq.analysis.statementBreakdown.map((s) => s.explanation || s.text).filter(Boolean).join(' ')
        : '';
      const ob = Array.isArray(nq.analysis.optionBreakdown)
        ? nq.analysis.optionBreakdown.map((o) => o.explanation || o.text).filter(Boolean).join(' ')
        : '';
      solSummary = [sb, ob].filter(Boolean).join(' ');
    }
    const rawOpts = Array.isArray(nq?.options) && nq.options.length
      ? nq.options
      : Array.isArray(dq.options)
        ? dq.options
        : [];
    return {
      id: dq.id,
      examYear: dq.year,
      subject: dq.subject,
      topic: `${dq.theme} · ${dq.sub}`,
      stem: dq.stem,
      options: rawOpts.map((o) => ({
        label: String(o.label || '').toUpperCase(),
        text: String(o.text || '').trim(),
      })),
      correctLabel: (nq?.correctLabel || dq.answer || '').toUpperCase(),
      answerText: dq.answerText || '',
      explanation: solSummary.slice(0, 1200),
      hasSolution: Boolean(nq?.hasSolution),
    };
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const question = String(body?.question || '').trim().slice(0, 400);
    if (question.length < 3) {
      return NextResponse.json({ error: 'Please enter at least 3 characters.' }, { status: 400 });
    }

    const t0 = Date.now();

    const gate = await authorizeAiRequest(req, {
      turnstileToken: body?.turnstileToken || null,
      consume: true,
    });
    if (!gate.allowed) {
      return NextResponse.json(
        {
          error: gate.error,
          quota: {
            tier: gate.tier,
            limit: gate.limit,
            remaining: gate.remaining,
            cachedOnly: false,
          },
        },
        { status: gate.status }
      );
    }

    const quota = {
      tier: gate.tier,
      limit: gate.limit,
      remaining: gate.remaining,
      cachedOnly: gate.cachedOnly,
    };

    const missing = Array.isArray(body?.missing) ? body.missing : [];
    const shownSummary = String(body?.shownSummary || '').slice(0, 1800);
    const cacheKey = `v9:${question.toLowerCase()}:${missing.join(',')}`;

    if (localReplyCache.has(cacheKey)) {
      const hit = localReplyCache.get(cacheKey);
      const latencyMs = Date.now() - t0;
      logPyqAiUsage({
        userId: gate.userId,
        tier: gate.tier,
        model: hit.model,
        neurons: 0,
        cacheHit: true,
        latencyMs,
      });
      return NextResponse.json({
        ...hit,
        cached: true,
        elapsedMs: latencyMs,
        quota,
      });
    }

    const workerUrl = process.env.CLOUDFLARE_PYQ_WORKER_URL;
    const cfToken = process.env.CLOUDFLARE_API_TOKEN;
    const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID || '10fc7c3149d7fe4a1a4d9109bc58a2ad';

    // Option A: Deployed Cloudflare Worker (Gap-Fill: Gemma 4 main, Llama 3.1 8B FP8 fallback)
    if (workerUrl) {
      const wRes = await fetch(workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          missing,
          shownSummary,
          poolPct: gate.pool?.poolPct || 0,
          cachedOnly: gate.cachedOnly,
        }),
      });
      const wData = await wRes.json();
      if (wData?.cachedOnlyMiss) {
        return NextResponse.json({ error: wData.error, quota }, { status: 429 });
      }
      if (wRes.ok && wData?.ok) {
        const latencyMs = Date.now() - t0;
        const neuronsUsed = wData.cached ? 0 : Number(wData.usage?.neurons || 0);
        logPyqAiUsage({
          userId: gate.userId,
          tier: gate.tier,
          model: wData.model || DEFAULT_MODEL,
          neurons: neuronsUsed,
          cacheHit: Boolean(wData.cached),
          latencyMs,
        });
        const result = {
          mode: 'gap-fill',
          model: wData.model || DEFAULT_MODEL,
          cached: Boolean(wData.cached),
          sourceMode: wData.sourceMode || 'general',
          label: wData.label || 'Concept Overview',
          sources: Array.isArray(wData.sources) ? wData.sources : [],
          points: Array.isArray(wData.points) ? wData.points : [],
          empty: Boolean(wData.empty),
          usage: wData.usage || null,
        };
        if (!result.empty) localReplyCache.set(cacheKey, result);
        return NextResponse.json({
          ...result,
          elapsedMs: latencyMs,
          quota,
        });
      }
    }

    const contextPyqs = retrieveContextPyqs(question, 4);

    // Option B: Direct Cloudflare Workers AI REST API (if CLOUDFLARE_API_TOKEN is configured)
    if (cfToken) {
      const contextBlock = contextPyqs.length
        ? contextPyqs
            .map(
              (q, i) =>
                `[PYQ ${i + 1}] (${q.examYear} · ${q.subject} · ${q.topic})\nStem: ${q.stem}\nAnswer: (${q.correctLabel || '?'}) ${q.answerText || ''}\nExplanation: ${String(q.explanation || '').slice(0, 900)}`
            )
            .join('\n\n')
        : 'No direct PYQ matched; answer concisely using standard UPSC CSE Prelims syllabus.';

      const aiRes = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/${DEFAULT_MODEL}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${cfToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content:
                  'You are a crisp UPSC CSE Prelims mentor. Answer strictly using the provided PYQ context and standard UPSC syllabus facts. Structure your reply cleanly in 3 short sections: (1) Direct Answer, (2) How UPSC Tests This (cite years from context), and (3) Common Trap to Avoid. Keep it under 220 words. Never invent fake UPSC years.',
              },
              {
                role: 'user',
                content: `Student Question: ${question}\n\nRetrieved UPSC PYQ Context:\n${contextBlock}`,
              },
            ],
            max_tokens: 450,
            temperature: 0.2,
          }),
        }
      );

      const aiJson = await aiRes.json();
      if (aiRes.ok && aiJson?.success) {
        const answer =
          aiJson.result?.response ||
          aiJson.result?.choices?.[0]?.message?.content ||
          'No response text returned.';
        const result = {
          mode: 'workers-ai-rest',
          model: DEFAULT_MODEL,
          cached: false,
          answer,
          usage: aiJson.result?.usage || null,
        };
        localReplyCache.set(cacheKey, result);
        return NextResponse.json({ ...result, elapsedMs: Date.now() - t0, contextPyqs });
      }
    }

    // Option C: Fallback Grounded Preview before Worker deploy / token setup
    return NextResponse.json({
      mode: 'grounded-preview',
      model: DEFAULT_MODEL,
      cached: false,
      elapsedMs: Date.now() - t0,
      answer: null,
      setupNote:
        'Ground-truth PYQ context retrieved at 0 cost. Deploy workers/pyq-ai-bot (`npm run deploy` inside workers/pyq-ai-bot) and set CLOUDFLARE_PYQ_WORKER_URL in .env.local to generate live Workers AI answers (10,000 free Neurons/day).',
      contextPyqs,
    });
  } catch (err) {
    console.error('[POST /api/pyq/ai-prototype] Error:', err);
    return NextResponse.json({ error: err.message || 'Prototype error' }, { status: 500 });
  }
}
