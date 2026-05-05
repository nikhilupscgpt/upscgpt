import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getGeminiModel, generateEmbedding } from '@/lib/gemini';
import { getRenderedPrompt } from '@/lib/aiPromptRegistry';

export async function POST(req) {
  try {
    const { 
      query, 
      entryId = null, 
      regionKey = 'global', 
      chatHistory = [],
      lang = 'en' 
    } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required." }, { status: 400 });
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
    const systemPrompt = await getRenderedPrompt('atlas.discovery_engine.system', {
      context: contextStr,
      lang: lang === 'hi' ? 'Hindi' : (lang === 'mr' ? 'Marathi' : 'English')
    });

    const response = await ai.generateContent([
      { role: 'system', content: systemPrompt },
      ...chatHistory.slice(-5), // Send last 5 messages for context
      { role: 'user', content: query }
    ]);

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
