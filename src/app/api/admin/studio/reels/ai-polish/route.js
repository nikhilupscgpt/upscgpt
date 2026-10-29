import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getGeminiModel } from '@/lib/gemini';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'FACULTY')) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Faculty or Admin access required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { question, customInstructions } = await req.json();
    if (!question) {
      return new Response(JSON.stringify({ error: 'Question data required' }), { status: 400 });
    }

    const ai = getGeminiModel('analysis') || getGeminiModel('synthesis');
    if (!ai) {
      return new Response(JSON.stringify({ error: 'AI service currently unavailable' }), { status: 503 });
    }

    const prompt = `You are an elite UPSC Prelims Educator and Short-Form Video Director crafting a 9:16 vertical Reel / YouTube Short script for UPSC civil services aspirants.

Convert the following UPSC question into a high-retention 9-step Reels storyboard:
1. "hook": A punchy, curiosity-inducing headline (under 12 words) that stops the scroll (e.g. "Does the Constitution of India give itself a name?") plus a 1-sentence teaser.
2. "verdicts": For each statement in the question, determine if it is correct or incorrect, supply an authoritative stamp ("✓ Correct" or "✗ Incorrect"), a 2-4 word mini-anchor tag (e.g. "Art. 393 · Short title" or "Ramsar Site · Kerala") for collapsed display, and a punchy 1-2 sentence source explanation.
3. "takeaway": A screenshot-worthy 3-item summary ("trio") where students save the reel. Each item in the trio has "art" (e.g. "393" or "01"), "what" (e.g. "Short title"), and "how" (e.g. "Constitution of India"), plus 1 "note" pointing out common examiner traps.

Question Details:
Subject: ${question.srcSubject || 'General Studies'}
Topic: ${question.srcTopic || 'Prelims'}
Stem: ${question.stem || ''}
Options: ${JSON.stringify(question.options || [])}
Correct Key: ${question.correctLabel || ''}
Existing Explanation: ${question.explanation || ''}

${customInstructions ? `Additional Teacher Note: ${customInstructions}` : ''}

Respond ONLY with valid, raw JSON (no markdown formatting, no code fencing):
{
  "hook": {
    "headline": "...",
    "teaser": "..."
  },
  "verdicts": [
    {
      "num": 1,
      "isCorrect": false,
      "stamp": "✗ Incorrect",
      "mini": "Art. 393 · Short title",
      "source": "..."
    }
  ],
  "takeaway": {
    "title": "...",
    "trio": [
      { "art": "393", "what": "Short title", "how": "..." },
      { "art": "394", "what": "Commencement", "how": "..." },
      { "art": "395", "what": "Repeals", "how": "..." }
    ],
    "note": "..."
  }
}`;

    const result = await ai.generateContent(prompt);
    let rawText = typeof result.text === 'function' ? result.text() : result.text;
    rawText = rawText.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '').trim();

    // Strip code block fence if present
    const match = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      rawText = match[1].trim();
    }

    const parsed = JSON.parse(rawText);
    return new Response(JSON.stringify({ success: true, polished: parsed }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[Reels AI Polish Error]:', err);
    return new Response(JSON.stringify({ error: err.message || 'Failed to polish reel with AI' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
