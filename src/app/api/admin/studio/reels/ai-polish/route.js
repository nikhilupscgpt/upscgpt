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

    const prompt = `You are a real, veteran UPSC mentor speaking directly into a camera to explain a Prelims question to an aspirant. 

CORE TONE RULE:
Write in natural, plain-spoken, human educator language. 
STRICTLY FORBIDDEN ROBOTIC CLICHÉS:
- DO NOT say: "spot the trap", "delve", "test your knowledge", "crucial", "mind-blowing", "in accordance with", "statutory veracity", "statutory guidelines", "let's dive in", "high-yield", "elimination matrix".
- DO speak like a mentor across a desk: "Look at the wording here", "Here's where people slip", "Notice Article 393—it's literally one sentence", "The catch is simple".

Generate the 7-step pedagogical script:
1. "hook": 
   - "headline": A genuine, spoken curiosity question or counter-intuitive truth (under 12 words). E.g.: "Does the Constitution actually call itself 'Constitution of India'?" or "Why doesn't the Gomti River start in the Himalayas?"
   - "teaser": A natural 1-line conversational setup (under 16 words). E.g.: "UPSC tested the very last 3 articles of the Constitution in 2024. Let's see if you catch it."
2. "keywords": 2 keyword spotlight stages to highlight exact words in the statements:
   - Spotlight 1: Focus on the major recurring phrase or absolute qualifier (e.g. "There is no Article", "only", "all", etc.)
     - "term": The exact phrase
     - "calloutTerm": Quoted display name (e.g. "“There is no Article”")
     - "calloutNote": 1 punchy human sentence (e.g. "An absolute claim. Finding a single Article is enough to prove it wrong.")
     - "activePhrases": Array containing the exact phrase as it appears in the statements (e.g. ["There is no Article"])
     - "dimmedPhrases": []
   - Spotlight 2: Focus on the specific substantive anchor or legal verb in the statements (e.g. "stand repealed", "scheduled areas")
     - "term": The exact phrase
     - "calloutTerm": Quoted display name (e.g. "“stand repealed”")
     - "calloutNote": 1 punchy human sentence (e.g. "Points to the repeal clause. Which earlier Acts did the Constitution end?")
     - "activePhrases": [the second phrase]
     - "dimmedPhrases": [the first phrase from spotlight 1]
     - "contextPhrases": [any optional secondary keyword phrase]
3. "verdicts": For each statement in the question:
   - "num": Statement number
   - "isCorrect": boolean (true/false)
   - "stamp": "✓ Correct" OR "✗ Incorrect"
   - "mini": 2-4 word clean memory tag (e.g. "Article 393 · The Name")
   - "source": 1-2 conversational sentences explaining the truth with zero jargon. E.g. "Article 393 explicitly says: 'This Constitution may be called the Constitution of India.' Statement 1 is completely false."
4. "answer":
   - "label": Correct letter ("A", "B", "C", "D")
   - "text": Conversational 1-sentence bottom line.
5. "valueAddition": High-yield factual notes students should add to their syllabus notebooks:
   - "title": "Value addition"
   - "subtitle": "Add these to your [Topic/Part] notes" (e.g. "Add these to your Part XXII notes")
   - "items": Exactly 3 high-yield factual rows:
     - "art": Large Article number or section/topic number (e.g. "394", "394A", "395")
     - "title": Short punchy bold title (e.g. "Came into force early", "Authoritative Hindi text", "Not repealed")
     - "desc": Crisp factual bullet note (e.g. "Arts. 5–9, 60, 324, 366, 367, 379, 380, 388 and 391–394 came into force on 26 November 1949.")
   - "note": The examiner's actual psychology in plain English. E.g.: "UPSC loves testing the very end (Articles 393–395) because most aspirants stop revising after Emergency provisions."

Question Details:
Subject: ${question.srcSubject || 'General Studies'}
Topic: ${question.srcTopic || 'Prelims'}
Stem: ${question.stem || ''}
Options: ${JSON.stringify(question.options || [])}
Correct Key: ${question.correctLabel || ''}
Existing Explanation: ${question.explanation || ''}

${customInstructions ? `Additional Teacher Note: ${customInstructions}` : ''}

Respond ONLY with valid, raw JSON (no markdown formatting, no code fences):
{
  "hook": {
    "headline": "...",
    "teaser": "..."
  },
  "keywords": [
    {
      "term": "...",
      "calloutTerm": "“...”",
      "calloutNote": "...",
      "activePhrases": ["..."],
      "dimmedPhrases": []
    },
    {
      "term": "...",
      "calloutTerm": "“...”",
      "calloutNote": "...",
      "activePhrases": ["..."],
      "dimmedPhrases": ["..."],
      "contextPhrases": ["..."]
    }
  ],
  "verdicts": [
    {
      "num": 1,
      "isCorrect": false,
      "stamp": "✗ Incorrect",
      "mini": "...",
      "source": "..."
    }
  ],
  "answer": {
    "label": "...",
    "text": "..."
  },
  "valueAddition": {
    "title": "Value addition",
    "subtitle": "Add these to your ... notes",
    "items": [
      { "art": "394", "title": "...", "desc": "..." },
      { "art": "394A", "title": "...", "desc": "..." },
      { "art": "395", "title": "...", "desc": "..." }
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
