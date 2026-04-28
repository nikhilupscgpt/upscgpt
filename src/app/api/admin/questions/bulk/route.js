import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { questions } = body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'Invalid input: questions must be a non-empty array' }, { status: 400 });
    }

    // Validate each question structure briefly
    const validQuestions = questions.filter(q => q.text && Array.isArray(q.options) && q.correctLabel);
    
    if (validQuestions.length === 0) {
      return NextResponse.json({ error: 'No valid questions found in payload' }, { status: 400 });
    }

    // Bulk create
    const created = await prisma.question.createMany({
      data: validQuestions.map(q => ({
        text: q.text,
        options: q.options,
        correctLabel: q.correctLabel,
        explanation: q.explanation || '',
        difficulty: q.difficulty || 'MEDIUM',
        gsPaper: q.gsPaper,
        issueId: q.issueId,
        tags: q.tags || [],
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({ 
      success: true, 
      count: created.count,
      message: `Successfully imported ${created.count} questions.`
    });
  } catch (error) {
    console.error(`[Admin Questions Bulk API] Error:`, error);
    return NextResponse.json({ error: 'Failed to bulk import questions' }, { status: 500 });
  }
}
