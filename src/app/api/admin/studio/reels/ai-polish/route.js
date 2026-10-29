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
2. "keywords": 2 to 3 anchor terms students must watch out for before attempting the question:
   - "term": Short name (e.g. "Short Title", "Repeals Clause", "Commencement")
   - "note": 1 plain-spoken sentence explaining what it is (e.g. "Article 393 gives the official legal name to the document.")
3. "verdicts": For each statement in the question:
   - "num": Statement number
   - "isCorrect": boolean (true/false)
   - "stamp": "✓ Correct" OR "✗ Incorrect"
   - "mini": 2-4 word clean memory tag (e.g. "Article 393 · The Name")
   - "source": 1-2 conversational sentences explaining the truth with zero jargon. E.g. "Article 393 explicitly says: 'This Constitution may be called the Constitution of India.' Statement 1 is completely false."
4. "answer":
   - "label": Correct letter ("A", "B", "C", "D")
   - "text": Conversational 1-sentence bottom line.
5. "valueAddition": What forward-looking insight or memory peg saves marks in the next Prelims:
   - "title": A memorable rule (e.g. "The Last 3 Articles to Remember")
   - "trio": Exactly 3 crisp memory pegs:
     - "art": E.g. "393", "394", "395" (or "01", "02", "03")
     - "what": Core concept (e.g. "The Name")
     - "how": Plain explanation (e.g. "Names the Constitution officially")
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
    { "term": "...", "note": "..." }
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
    "title": "...",
    "trio": [
      { "art": "...", "what": "...", "how": "..." }
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
