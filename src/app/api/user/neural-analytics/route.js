import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch recent attempts + wrong answers for the user
    const attempts = await prisma.attempt.findMany({
      where: { userId: session.user.id },
      orderBy: { startedAt: 'desc' },
      take: 20, // Analyze recent performance
      include: {
        answers: {
          where: { isCorrect: false },
          select: { questionId: true, subject: true },
        },
      },
    });

    if (attempts.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Insufficient data for neural analysis. Take more tests!',
        recommendations: [] 
      });
    }

    // 2. Identify weak domains
    const domainMistakes = {}; // domain -> count
    const questionIds = new Set();

    attempts.forEach(attempt => {
      (attempt.answers || []).forEach(ans => {
        if (ans.questionId) {
          questionIds.add(ans.questionId);
        } else if (ans.subject) {
          domainMistakes[ans.subject] = (domainMistakes[ans.subject] || 0) + 1;
        }
      });
    });

    // Fetch question details to get domains
    const questions = await prisma.question.findMany({
      where: { id: { in: Array.from(questionIds) } },
      select: { domain: true }
    });

    questions.forEach(q => {
      domainMistakes[q.domain] = (domainMistakes[q.domain] || 0) + 1;
    });

    // Sort domains by mistakes
    const sortedDomains = Object.entries(domainMistakes)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    if (sortedDomains.length === 0) {
       return NextResponse.json({ 
        success: true, 
        message: 'Perfect score! No weak zones detected.',
        recommendations: [] 
      });
    }

    // 3. Find relevant Issues (Revision Zones)
    const weakDomain = sortedDomains[0]; // Primary focus
    const recommendations = await prisma.issue.findMany({
      where: { domain: weakDomain },
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        topic: true
      }
    });

    return NextResponse.json({
      success: true,
      analysis: {
        primaryWeakness: weakDomain,
        mistakeCount: domainMistakes[weakDomain],
        totalIncorrectAnalyzed: questions.length
      },
      recommendations: recommendations.map(issue => ({
        id: issue.id,
        title: issue.title,
        url: `/atlas/issue/${issue.slug}`,
        category: issue.category,
        topic: issue.topic
      }))
    });

  } catch (error) {
    console.error(`[Neural Analytics API] Error:`, error);
    return NextResponse.json({ error: 'Failed to generate analytics' }, { status: 500 });
  }
}
