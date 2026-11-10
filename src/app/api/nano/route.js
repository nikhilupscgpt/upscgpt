import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getGeminiModel } from '@/lib/gemini';
import { getRenderedPrompt } from '@/lib/aiPromptRegistry';
import { getTierStatus } from '@/lib/tier-gate';
import { getClientIp, rateLimit, tooManyRequests } from '@/lib/rateLimit';

const MAX_QUERY_CHARS = 2000;
const MAX_HISTORY_ITEMS = 10;
const HOUR_MS = 60 * 60 * 1000;

// Only plain user/model text turns survive; anything else (system roles, extra fields) is dropped.
function sanitizeChatHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .slice(-MAX_HISTORY_ITEMS)
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const role = item.role === 'user' ? 'user' : (item.role === 'model' || item.role === 'assistant') ? 'model' : null;
      const raw = typeof item.text === 'string' ? item.text : (typeof item.content === 'string' ? item.content : '');
      const text = raw.trim().slice(0, MAX_QUERY_CHARS);
      if (!role || !text) return null;
      return { role, parts: [{ text }] };
    })
    .filter(Boolean)
    // Conversations sent to Gemini must open with a user turn.
    .filter((turn, i, arr) => arr.slice(0, i + 1).some((t) => t.role === 'user'));
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = typeof body?.query === 'string' ? body.query.trim() : '';
    const entryId = typeof body?.entryId === 'string' ? body.entryId : null;
    const lang = ['en', 'hi', 'mr'].includes(body?.lang) ? body.lang : 'en';
    const chatHistory = sanitizeChatHistory(body?.chatHistory);

    if (!query) {
      return NextResponse.json({ error: "Query is required." }, { status: 400 });
    }
    if (query.length > MAX_QUERY_CHARS) {
      return NextResponse.json({ error: `Please keep your question under ${MAX_QUERY_CHARS} characters.` }, { status: 400 });
    }

    // Rate limit: anonymous 10/h per IP, FREE 40/h, PRO 150/h per user.
    const { isPro, user } = await getTierStatus();
    const userId = user?.id || null;
    const limit = userId ? (isPro ? 150 : 40) : 10;
    const rl = await rateLimit({
      bucket: 'nano',
      key: userId ? `user:${userId}` : `ip:${getClientIp(req)}`,
      limit,
      windowMs: HOUR_MS,
    });
    if (!rl.allowed) {
      const message = userId
        ? (isPro
            ? "You've reached Nano's hourly limit. Please take a short break and try again in a little while."
            : "You've used this hour's Nano questions. Try again in a little while, or upgrade to Pro for a higher limit.")
        : "You've reached the hourly limit for guests. Sign in for more Nano questions, or try again later.";
      return tooManyRequests(NextResponse, rl.retryAfterSec, message);
    }

    // 1. Semantic Retrieval (Hybrid: Vector + Keyword)
    // For now, we'll use keyword search as a baseline and architect for vector
    const relevantIssues = await prisma.issue.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { domain: { contains: query, mode: 'insensitive' } },
          { topic: { contains: query, mode: 'insensitive' } },
        ]
      },
      take: 5,
      include: {
        pyqs: { take: 3 }
      }
    });

    // 2. Fetch context for the selected entry if provided
    let entryContext = null;
    if (entryId) {
      entryContext = await prisma.mapEntry.findUnique({
        where: { id: entryId }
      });
    }

    // 3. Fetch Recent Crux (Articles linked to relevant issues or region)
    const recentArticles = await prisma.article.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { category: entryContext?.category || undefined }
        ]
      },
      orderBy: { publishedAt: 'desc' },
      take: 3
    });

    // 4. Construct the Discovery Context for the AI
    const anchors = relevantIssues.map(issue => ({
      id: issue.id,
      title: issue.title,
      domain: issue.domain
    }));

    const hooks = relevantIssues.flatMap(issue => issue.pyqs).map(pyq => ({
      id: pyq.id,
      year: pyq.year,
      question: pyq.question.substring(0, 100) + '...'
    }));

    const contextStr = [
      `Knowledge Anchors: ${anchors.map(a => a.title).join(', ')}`,
      `Practice Hooks (PYQs): ${hooks.map(h => `[${h.year}] ${h.question}`).join('; ')}`,
      entryContext ? `Selected Map Node: ${entryContext.name} (${entryContext.category})` : '',
      recentArticles.length > 0 ? `Recent Crux Articles: ${recentArticles.map(a => a.title).join(', ')}` : ''
    ].filter(Boolean).join('\n');

    // 5. Generate Response using the Discovery Persona
    const ai = getGeminiModel('chat');
    if (!ai) {
      return NextResponse.json({ error: "Nano is temporarily unavailable." }, { status: 503 });
    }
    const systemPrompt = await getRenderedPrompt('atlas.discovery_engine.system', {
      context: contextStr,
      lang: lang === 'hi' ? 'Hindi' : (lang === 'mr' ? 'Marathi' : 'English')
    });

    // Gemma models do not accept a system role, so the instructions travel with the
    // latest user turn. History is already sanitized to user/model text only.
    const response = await ai.generateContent({
      contents: [
        ...chatHistory,
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n---\nStudent question: ${query}` }] },
      ],
    });

    const resultText = typeof response.text === 'function' ? response.text() : (response.text || '');

    return NextResponse.json({ 
      result: resultText,
      anchors,
      hooks,
      suggestedFollowups: [
        `Tell me more about ${anchors[0]?.title || 'this topic'}`,
        `How does this link to ${entryContext?.name || 'global geography'}?`,
        `Show me more PYQs on ${anchors[0]?.domain || 'this domain'}`
      ]
    });

  } catch (error) {
    console.error("Discovery Engine API Error:", error);
    return NextResponse.json({ error: "Discovery Engine failed to synthesize response." }, { status: 500 });
  }
}
