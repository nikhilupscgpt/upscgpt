import { NextResponse } from 'next/server';
import { getGeminiModel } from '@/lib/gemini';
import { getRenderedPrompt } from '@/lib/aiPromptRegistry';

export async function POST(req) {
  try {
    const { query, lang = 'en' } = await req.json();
    if (!query) {
      return NextResponse.json({ error: "Query is required." }, { status: 400 });
    }
    
    const langNames = { en: 'English', hi: 'Hindi', mr: 'Marathi' };
    const targetLang = langNames[lang] || 'English';

    const ai = getGeminiModel('chat');
    if (!ai) {
      return NextResponse.json({ error: "AI service is currently unavailable." }, { status: 500 });
    }

    const systemPrompt = await getRenderedPrompt('nano.assistant.system');
    const response = await ai.generateContent(`System: ${systemPrompt}\nIMPORTANT: Respond strictly in ${targetLang} language.\n\nUser: ${query}`);

    const resultText = typeof response.text === 'function' ? response.text() : (response.text || '');

    return NextResponse.json({ result: resultText });
  } catch (error) {
    console.error("Nano Assistant API Error:", error);
    return NextResponse.json({ error: "Failed to generate AI response." }, { status: 500 });
  }
}
