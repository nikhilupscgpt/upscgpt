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
    const { issueId, type } = await req.json();

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        articles: { where: { status: 'DONE' }, take: 10 },
        editorials: { where: { status: 'DONE' }, take: 5 }
      }
    });

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    const context = `
      Topic: ${issue.title}
      Domain: ${issue.domain}
      Topic Details: ${issue.topic}
      Recent News Headings: ${issue.articles.map(a => a.title).join(', ')}
      Recent Editorials: ${issue.editorials.map(e => e.title).join(', ')}
    `;

    let systemInstruction = '';
    let prompt = '';

    switch (type) {
      case 'mainsNote':
        systemInstruction = "You are a UPSC Mains Specialist. Generate a high-yield 'Master Vault' note for the given topic. Focus on multi-dimensional analysis (Social, Political, Economic, Environmental, Tech, Legal). Use professional, strategic language.";
        prompt = `Generate a comprehensive Mains Note for: ${issue.title}. \nContext: ${context}`;
        break;
      case 'cumulativeSummary':
        systemInstruction = "You are a UPSC Content Summarizer. Generate a concise, bulleted executive summary of the given topic. Focus on 'What, Why, and Way Forward'.";
        prompt = `Generate an Executive Summary for: ${issue.title}. \nContext: ${context}`;
        break;
      case 'valueAddition':
        systemInstruction = "You are a UPSC Value Addition Expert. Provide 3-5 high-impact data points, committee names, quotes, or case studies relevant to the topic that a student can use to get extra marks in Mains.";
        prompt = `Provide Value Addition (Data/Case Studies) for: ${issue.title}. \nContext: ${context}`;
        break;
      case 'prelimsNote':
        systemInstruction = "You are a UPSC Prelims Specialist. Generate 5-10 'Quick Fact' points that are highly likely to be asked in the Preliminary exam (e.g., Constitutional articles, years, nodal agencies, reports).";
        prompt = `Generate Prelims Fact-Sheet for: ${issue.title}. \nContext: ${context}`;
        break;
      case 'mainsFacts':
        systemInstruction = "You are a UPSC Data Specialist. Provide 5-10 strategic data points, statistics, or committee facts relevant to the topic for Mains answers.";
        prompt = `Generate Mains Facts/Data for: ${issue.title}. \nContext: ${context}`;
        break;
      case 'possibleQuestions':
        systemInstruction = "You are a UPSC Mains Question Predictor. Based on the current context and importance, generate 3 strategic Mains-style questions (10 and 15 markers).";
        prompt = `Generate Possible Mains Questions for: ${issue.title}. \nContext: ${context}`;
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
