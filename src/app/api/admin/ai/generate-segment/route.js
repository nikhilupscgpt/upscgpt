import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { generateText } from '@/lib/ai';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { issueId, type, lang = 'EN', sourceText, mode = 'generate' } = await req.json();

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        articles: { where: { status: 'DONE' }, take: 10 },
      }
    });

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    const langName = lang === 'HI' ? 'Hindi' : lang === 'MR' ? 'Marathi' : 'English';

    // TRANSLATION LOGIC
    if (mode === 'translate' && sourceText) {
      const systemInstruction = `You are a UPSC Translation Expert. Translate the following English text into ${langName}. 
      CRITICAL RULES:
      1. Use professional, high-standard ${langName} (official Devnagari).
      2. Keep UPSC technical terms (e.g., 'Federalism', 'Article 21', 'Fiscal Deficit') in brackets after their translated counterparts if appropriate.
      3. Maintain the exact bullet points and structure of the original text.
      4. DO NOT add any new information. Only translate.`;
      
      const prompt = `Translate this UPSC content into ${langName}: \n\n${sourceText}`;
      const content = await generateText(prompt, systemInstruction);
      
      return NextResponse.json({ success: true, content });
    }

    // GENERATION LOGIC (Existing)
    const langInstruction = lang !== 'EN' ? `CRITICAL: You MUST generate the content in ${langName}. Use the official Devnagari script.` : 'Generate in English.';
    const context = `Topic: ${issue.title} \nRecent News: ${issue.articles.map(a => a.title).join(', ')}`;


    let systemInstruction = '';
    let prompt = '';

    switch (type) {
      case 'mainsNote':
        systemInstruction = `You are a UPSC Mains Specialist. Generate a high-yield note in ${langName}. ${langInstruction}`;
        prompt = `Forge a strategic Mains Note in ${langName} for: ${issue.title}. \nContext: ${context}`;
        break;
      case 'cumulativeSummary':
        systemInstruction = `You are a UPSC Content Summarizer. Generate a concise summary in ${langName}. Limit: 150 words. ${langInstruction}`;
        prompt = `Generate an Executive Summary in ${langName} for: ${issue.title}. \nContext: ${context}`;
        break;
      case 'valueAddition':
        systemInstruction = `You are a UPSC Value Addition Expert. Provide 3-5 data points or case studies in ${langName}. ${langInstruction}`;
        prompt = `Provide Value Addition in ${langName} for: ${issue.title}. \nContext: ${context}`;
        break;
      case 'mainsFacts':
        systemInstruction = `You are a UPSC Data Specialist. Provide 5-10 strategic statistics in ${langName}. ${langInstruction}`;
        prompt = `Generate Strategic Stats in ${langName} for: ${issue.title}. \nContext: ${context}`;
        break;
      case 'prelimsNote':
        systemInstruction = `You are a UPSC Prelims Specialist. Generate 5-10 facts in ${langName}. ${langInstruction}`;
        prompt = `Generate Prelims Fact-Sheet in ${langName} for: ${issue.title}. \nContext: ${context}`;
        break;
      default:
        return NextResponse.json({ error: 'Invalid segment type' }, { status: 400 });
    }

    const content = await generateText(prompt, systemInstruction);

    return NextResponse.json({
      success: true,
      content
    });

  } catch (error) {
    console.error('[AI Segment API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
