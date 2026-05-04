import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateJSON } from '@/lib/ai';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { issueId, count = 5 } = await req.json();

    if (!issueId) {
      return NextResponse.json({ error: 'Issue ID is required' }, { status: 400 });
    }

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        articles: { where: { status: 'DONE' }, take: 5 },
        nodeContent: true
      }
    });

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    const contextText = `
      Title: ${issue.title}
      Background: ${issue.backgroundNote || ''}
      Prelims Note: ${issue.prelimsNote || issue.nodeContent?.prelimsNote || ''}
      Recent News: ${issue.articles.map(a => a.title).join('; ')}
    `;

    const systemInstruction = `
      You are a UPSC Prelims Question Setter. Your task is to generate high-fidelity, concept-heavy Multiple Choice Questions (MCQs) for the UPSC Civil Services Examination.
      
      CRITICAL RULES:
      1. Every question must have 4 options (a, b, c, d).
      2. The "correctLabel" must be one of 'a', 'b', 'c', or 'd'.
      3. The explanation should be detailed and pedagogical (Mission Debrief).
      4. Difficulty should be MEDIUM or HARD.
      5. Use the provided context to ensure relevance to current affairs and syllabus.
      6. Return a JSON array of objects with fields: text, options (array of {label, text}), correctLabel, explanation, difficulty, gsPaper.
      7. DO NOT use markdown fences. Return ONLY the JSON array.
    `;

    const prompt = `Generate ${count} UPSC Prelims MCQs for the topic: ${issue.title}. 
    Context: ${contextText}
    
    Format example:
    [
      {
        "text": "Which of the following statements regarding...",
        "options": [
          {"label": "a", "text": "Statement 1 only"},
          {"label": "b", "text": "Statement 2 only"},
          {"label": "c", "text": "Both 1 and 2"},
          {"label": "d", "text": "Neither 1 nor 2"}
        ],
        "correctLabel": "c",
        "explanation": "Detailed explanation...",
        "difficulty": "HARD",
        "gsPaper": "GS2"
      }
    ]
    `;

    const generatedQuestions = await generateJSON(prompt, systemInstruction);

    if (!Array.isArray(generatedQuestions)) {
      throw new Error("AI failed to return an array of questions");
    }

    // Save questions to database
    const savedQuestions = await Promise.all(generatedQuestions.map(q => 
      prisma.question.create({
        data: {
          text: q.text,
          options: q.options,
          correctLabel: q.correctLabel.toLowerCase(),
          explanation: q.explanation,
          difficulty: q.difficulty || 'MEDIUM',
          gsPaper: q.gsPaper || 'GS1',
          issueId: issue.id,
          domain: issue.domain || 'General',
          tags: [issue.category, issue.topic].filter(Boolean)
        }
      })
    ));

    return NextResponse.json({ 
      success: true, 
      count: savedQuestions.length,
      questions: savedQuestions
    });

  } catch (error) {
    console.error(`[Admin Questions Generate API] Error:`, error);
    return NextResponse.json({ error: error.message || 'Failed to generate questions' }, { status: 500 });
  }
}
