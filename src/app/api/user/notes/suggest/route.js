import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';
import prisma from '@/lib/prisma';
import { getGeminiModel } from '@/lib/gemini';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entityType, entityId } = await req.json();

    if (!entityType || !entityId) {
      return NextResponse.json({ error: 'entityType and entityId are required' }, { status: 400 });
    }

    // Fetch the content from the entity
    let content = null;

    if (entityType === 'article') {
      const article = await prisma.article.findUnique({
        where: { id: entityId },
        select: { rawContent: true, title: true },
      });
      content = article?.rawContent || article?.title;
    } else if (entityType === 'issue') {
      const issue = await prisma.issue.findUnique({
        where: { id: entityId },
        select: { cumulativeSummary: true, title: true },
      });
      content = issue?.cumulativeSummary || issue?.title;
    } else if (entityType === 'editorial') {
      const editorial = await prisma.editorial.findUnique({
        where: { id: entityId },
        select: { rawContent: true, title: true },
      });
      content = editorial?.rawContent || editorial?.title;
    } else if (entityType === 'streak') {
      const streak = await prisma.newsStreak.findUnique({
        where: { id: entityId },
        select: { livingSummary: true, title: true },
      });
      content = streak?.livingSummary || streak?.title;
    } else {
      return NextResponse.json({ error: 'Invalid entityType. Must be issue, article, editorial, or streak.' }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: 'No content found for the specified entity' }, { status: 404 });
    }

    const prompt = `You are a UPSC exam preparation expert. Based on the following content, generate a concise, exam-ready study note (max 500 characters) that captures the most important points for a UPSC aspirant. Focus on key facts, dates, committees, and analytical angles.

Content:
${content}

Generate only the note text, no labels or prefixes.`;

    const model = getGeminiModel('flash');
    if (!model) {
      return NextResponse.json({ error: 'AI model not configured' }, { status: 503 });
    }

    const result = await model.generateContent(prompt);
    const suggestedNote = result.text().trim();

    return NextResponse.json({ suggestedNote, suggestion: suggestedNote });
  } catch (error) {
    console.error('Failed to generate note suggestion:', error);
    return NextResponse.json({ error: 'Failed to generate note suggestion' }, { status: 500 });
  }
}
