import { NextResponse } from 'next/server';
import { getGeminiModel } from '@/lib/gemini';

export async function POST(req) {
  try {
    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: "Query is required." }, { status: 400 });
    }

    const ai = getGeminiModel('chat');
    if (!ai) {
      return NextResponse.json({ error: "AI service is currently unavailable." }, { status: 500 });
    }

    const response = await ai.generateContent(`System: You are Nano Assistant for upscgpt, an AI tutor for UPSC students. You provide strategic, concise, and exam-focused guidance. Keep answers professional and use formatting if necessary.

User: ${query}`);

    const resultText = typeof response.text === 'function' ? response.text() : (response.text || '');

    return NextResponse.json({ result: resultText });
  } catch (error) {
    console.error("Nano Assistant API Error:", error);
    return NextResponse.json({ error: "Failed to generate AI response." }, { status: 500 });
  }
}
