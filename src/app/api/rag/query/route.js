import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateEmbedding, searchSimilarContent, searchSimilarPYQs } from '@/lib/rag-utils';
import { getTierStatus } from '@/lib/tier-gate';
import { getPromptValue, getRenderedPrompt } from '@/lib/aiPromptRegistry';
import prisma from '@/lib/prisma';
import { rateLimit } from '@/lib/rateLimit';

const MAX_QUERY_CHARS = 2000;
const MAX_HISTORY_ITEMS = 10;
// No RAG/AI-chat quota exists in monetisation freeLimits, so use fixed daily caps.
const RAG_DAILY_LIMIT_FREE = 20;
const RAG_DAILY_LIMIT_PRO = 200;
const DAY_MS = 24 * 60 * 60 * 1000;

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .slice(-MAX_HISTORY_ITEMS)
    .map((m) => {
      if (!m || typeof m !== 'object') return null;
      const role = m.role === 'user' ? 'user' : ['ai', 'assistant', 'model'].includes(m.role) ? 'assistant' : null;
      const content = typeof m.content === 'string' ? m.content.trim().slice(0, MAX_QUERY_CHARS) : '';
      if (!role || !content) return null;
      return { role, content };
    })
    .filter(Boolean);
}

const jsonResponse = (data, status, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...headers } });

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_FAST_MODEL = 'gemma:2b';       
const OLLAMA_REASON_MODEL = 'gemma:27b-it'; 

/**
 * Call Ollama for a single-shot non-streaming completion (query rewriting).
 */
async function ollamaGenerate(model, prompt) {
  const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false })
  });
  const data = await res.json();
  return data.response || '';
}

/**
 * Generates a standalone search query based on chat history using Gemma 2B (fast).
 */
async function getStandaloneQuery(history, currentQuery) {
  if (!history || history.length === 0) return currentQuery;
  const prompt = await getRenderedPrompt('rag.query.rewrite', {
    history: history.map(m => `${m.role}: ${m.content}`).join('\n'),
    currentQuery,
  });
  try {
    const result = await ollamaGenerate(OLLAMA_FAST_MODEL, prompt);
    return result.trim() || currentQuery;
  } catch (err) { return currentQuery; }
}

export async function POST(req) {
  const { isPro, user } = await getTierStatus();
  if (!user?.id) return jsonResponse({ error: 'Auth required' }, 401);

  try {
    const body = await req.json();
    const { subject, examType, optionalSlug, lang = 'en', language = 'en', exam = 'UPSC' } = body || {};
    const activeLanguage = lang || language;
    const query = typeof body?.query === 'string' ? body.query.trim() : '';
    const history = sanitizeHistory(body?.history);
    if (!query) return jsonResponse({ error: 'Missing query' }, 400);
    if (query.length > MAX_QUERY_CHARS) {
      return jsonResponse({ error: `Please keep your question under ${MAX_QUERY_CHARS} characters.` }, 400);
    }

    const rl = await rateLimit({
      bucket: 'rag-query',
      key: `user:${user.id}`,
      limit: isPro ? RAG_DAILY_LIMIT_PRO : RAG_DAILY_LIMIT_FREE,
      windowMs: DAY_MS,
    });
    if (!rl.allowed) {
      return jsonResponse(
        {
          error: isPro
            ? `You've reached today's limit of ${RAG_DAILY_LIMIT_PRO} AI questions. Please try again tomorrow.`
            : `You've used your ${RAG_DAILY_LIMIT_FREE} free AI questions for today. Upgrade to Pro for more, or try again tomorrow.`,
        },
        429,
        { 'Retry-After': String(rl.retryAfterSec || 3600) }
      );
    }

    let optionalId = null;
    if (optionalSlug) {
      const opt = await prisma.optionalSubject.findUnique({ where: { slug: optionalSlug } });
      optionalId = opt?.id || null;
    }

    // 1. Context Search
    const standaloneQuery = await getStandaloneQuery(history, query);
    console.log(`[RAG] Standalone Query: ${standaloneQuery}`);
    
    // Topic Detection (Search Issue Graph)
    const matchingIssue = await prisma.issue.findFirst({
      where: {
        OR: [
          { title: { contains: query.substring(0, 50), mode: 'insensitive' } },
          { topic: { contains: query.substring(0, 50), mode: 'insensitive' } }
        ]
      },
      select: { title: true, slug: true }
    });

    const queryEmbedding = await generateEmbedding(standaloneQuery);
    // When studying in the optional workspace (optionalId is present), do not segregate content/PYQs by exam (search BOTH).
    const examFilter = optionalId ? 'BOTH' : exam;
    const [results, pyqs] = await Promise.all([
      searchSimilarContent(queryEmbedding, subject, examType, 4, optionalId, activeLanguage, examFilter),
      searchSimilarPYQs(queryEmbedding, subject, optionalId, 3, activeLanguage, examFilter)
    ]);

    const contextStrs = results.map(r => `[Source: ${r.title}]\n${r.contentMarkdown}`).join('\n\n---\n\n');
    const pyqStrs = pyqs.length > 0 ? pyqs.map(p => `[PYQ ${p.year} (${p.paper})]: ${p.questionText}`).join('\n') : '';
    const historyStrs = history.slice(-4).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
    
    const sources = results.map(r => ({ title: r.title, url: r.sourceUrl }));
    const pyqMeta = pyqs.map(p => ({ year: p.year, paper: p.paper, text: p.questionText, marks: p.marks }));

    let promptId = optionalSlug ? 'rag.query.optional' : (examType === 'MAINS' ? 'rag.query.mains' : 'rag.query.prelims');
    const instruction = await getPromptValue(promptId);

    const proactiveGuidance = matchingIssue
      ? `PROACTIVE GUIDANCE:\nI found a comprehensive UPSC Content Page for "${matchingIssue.title}".\nBefore giving the answer, prefix your response with a 1-sentence note suggesting the student check out this content page for structured preparation.\nLink: /issues/${matchingIssue.slug}`
      : '';

    // Decouple system instructions from user query payload to prevent prompt instruction leaking
    const systemPrompt = [
      instruction,
      '',
      'CONTEXT LOCK:',
      '1. Use ONLY the "REFERENCE MATERIAL" provided in the prompt to answer the question.',
      '2. If the answer is not explicitly contained in the reference material or your core UPSC strategic knowledge, state "I do not have specific data on this in my current vectors" rather than guessing.',
      '3. DO NOT invent dates, statistics, or names of committees.',
      '',
      proactiveGuidance
    ].filter(Boolean).join('\n');

    const userPrompt = [
      'REFERENCE MATERIAL:',
      contextStrs,
      '',
      'UPSC EXAM HISTORY (PYQs):',
      pyqStrs,
      '',
      'CONVERSATION MEMORY:',
      historyStrs,
      '',
      'STUDENT QUESTION:',
      query,
      '',
      'RESPONSE (Professional, scannable, and grounded):'
    ].filter(Boolean).join('\n');

    const metadata = { sources, pyqs: pyqMeta, isMetadata: true, matchingIssue };
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        // First packet: Metadata (Sources + PYQs)
        controller.enqueue(encoder.encode(`METADATA:${JSON.stringify(metadata)}\n`));

        try {
          // 2. Attempt Streaming via Ollama
          const ollamaRes = await fetch(`${OLLAMA_HOST}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              model: OLLAMA_REASON_MODEL, 
              prompt: userPrompt, 
              system: systemPrompt,
              stream: true 
            }),
            signal: AbortSignal.timeout(5000), // Timeout after 5s to trigger fallback
          });

          if (!ollamaRes.ok) throw new Error(`Ollama error: ${ollamaRes.status}`);

          const ollamaReader = ollamaRes.body.getReader();
          while (true) {
            const { value, done } = await ollamaReader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(Boolean);
            for (const line of lines) {
              try {
                const parsed = JSON.parse(line);
                if (parsed.response) controller.enqueue(encoder.encode(parsed.response));
              } catch { /* skip malformed lines */ }
            }
          }
        } catch (ollamaErr) {
          console.warn(`[RAG] Ollama generation failed, falling back to Gemini:`, ollamaErr.message);
          
          try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ 
              model: "gemma-4-31b-it",
              systemInstruction: systemPrompt
            });
            const result = await model.generateContentStream(userPrompt);

            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              if (chunkText) controller.enqueue(encoder.encode(chunkText));
            }
          } catch (geminiErr) {
            console.error(`[RAG] Gemini fallback also failed:`, geminiErr);
            controller.enqueue(encoder.encode("\n\n**Error:** AI service unavailable. Please check Ollama and Gemini API status."));
          }
        }
        controller.close();
      }
    });

    // Log usage (fire and forget)
    prisma.actionLog.create({
      data: { userId: user.id, action: 'RAG_QUERY', status: 'SUCCESS', message: `[Gemma4] ${standaloneQuery.substring(0, 50)}` }
    }).catch(() => {});

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });

  } catch (error) {
    console.error('[RAG Query] Failed:', error);
    return jsonResponse({ error: 'AI query failed. Please try again.' }, 500);
  }
}
