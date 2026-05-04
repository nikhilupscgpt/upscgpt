import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateEmbedding, searchSimilarContent, searchSimilarPYQs } from '@/lib/rag-utils';
import { getTierStatus } from '@/lib/tier-gate';
import { getPromptValue } from '@/lib/aiPromptRegistry';
import prisma from '@/lib/prisma';

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
  const prompt = `Rephrase the follow-up question to be a standalone search query for a UPSC database.
History: ${history.map(m => `${m.role}: ${m.content}`).join('\n')}
Follow-up: ${currentQuery}
Standalone Query:`;
  try {
    const result = await ollamaGenerate(OLLAMA_FAST_MODEL, prompt);
    return result.trim() || currentQuery;
  } catch (err) { return currentQuery; }
}

export async function POST(req) {
  const { isPro, user } = await getTierStatus();
  if (!user) return new Response(JSON.stringify({ error: 'Auth required' }), { status: 401 });

  try {
    const body = await req.json();
    const { query, subject, examType, optionalSlug, history = [] } = body;
    if (!query) return new Response(JSON.stringify({ error: 'Missing query' }), { status: 400 });

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
    const [results, pyqs] = await Promise.all([
      searchSimilarContent(queryEmbedding, subject, examType, 4, optionalId),
      searchSimilarPYQs(queryEmbedding, subject, optionalId, 3)
    ]);

    const contextStrs = results.map(r => `[Source: ${r.title}]\n${r.contentMarkdown}`).join('\n\n---\n\n');
    const pyqStrs = pyqs.length > 0 ? pyqs.map(p => `[PYQ ${p.year} (${p.paper})]: ${p.questionText}`).join('\n') : '';
    const historyStrs = history.slice(-4).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
    
    const sources = results.map(r => ({ title: r.title, url: r.sourceUrl }));
    const pyqMeta = pyqs.map(p => ({ year: p.year, paper: p.paper, text: p.questionText, marks: p.marks }));

    let promptId = optionalSlug ? 'rag.query.optional' : (examType === 'MAINS' ? 'rag.query.mains' : 'rag.query.prelims');
    const instruction = await getPromptValue(promptId);

    const finalPrompt = `
SYSTEM INSTRUCTION:
${instruction}

CONTEXT LOCK: 
1. Use ONLY the "REFERENCE MATERIAL" provided below to answer the question.
2. If the answer is not explicitly contained in the reference material or your core UPSC strategic knowledge, state "I do not have specific data on this in my current vectors" rather than guessing.
3. DO NOT invent dates, statistics, or names of committees.

${matchingIssue ? `PROACTIVE GUIDANCE:
I found a comprehensive UPSC Content Page for "${matchingIssue.title}". 
Before giving the answer, prefix your response with a 1-sentence note suggesting the student check out this content page for structured preparation. 
Link: /issues/${matchingIssue.slug}` : ''}

REFERENCE MATERIAL:
${contextStrs}

UPSC EXAM HISTORY (PYQs):
${pyqStrs}

CONVERSATION MEMORY:
${historyStrs}

STUDENT QUESTION:
${query}

RESPONSE (Professional, scannable, and grounded):`;

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
            body: JSON.stringify({ model: OLLAMA_REASON_MODEL, prompt: finalPrompt, stream: true }),
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
            const model = genAI.getGenerativeModel({ model: "gemma-3n-e4b-it" });
            const result = await model.generateContentStream(finalPrompt);

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
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
