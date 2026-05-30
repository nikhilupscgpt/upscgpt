import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getGeminiModel } from "@/lib/gemini";
import { getRenderedPrompt } from "@/lib/aiPromptRegistry";
import { parseLivingSummary, stripMarkdown } from "@/lib/seo";

/**
 * POST /api/admin/seo/generate
 * Generates SEO-optimized title, description, and keywords for articles, editorials, or news streaks.
 * Body: { type: 'ARTICLE' | 'EDITORIAL' | 'STREAK', id: string }
 */
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, id } = body;

    if (!type || !id) {
      return NextResponse.json({ error: 'Type and ID are required' }, { status: 400 });
    }

    let title = '';
    let content = '';

    if (type === 'ARTICLE') {
      const article = await prisma.article.findUnique({
        where: { id },
        select: { title: true, rawContent: true }
      });
      if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      title = article.title;
      content = article.rawContent?.substring(0, 5000) || '';
    } else if (type === 'EDITORIAL') {
      const editorial = await prisma.editorial.findUnique({
        where: { id },
        select: { title: true, rawContent: true }
      });
      if (!editorial) return NextResponse.json({ error: 'Editorial not found' }, { status: 404 });
      title = editorial.title;
      content = editorial.rawContent?.substring(0, 5000) || '';
    } else if (type === 'STREAK') {
      const streak = await prisma.newsStreak.findUnique({
        where: { id },
        select: { title: true, livingSummary: true }
      });
      if (!streak) return NextResponse.json({ error: 'News streak not found' }, { status: 404 });
      title = streak.title;
      const parsed = parseLivingSummary(streak.livingSummary, streak.title);
      content = stripMarkdown(`${parsed.causes}\n\n${parsed.impact}`).substring(0, 5000);
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const ai = getGeminiModel('extraction');
    if (!ai) {
      return NextResponse.json({ error: 'AI model not configured' }, { status: 500 });
    }

    const prompt = await getRenderedPrompt('seo.generate.metadata', {
      title,
      content
    });

    const seoSchema = {
      type: 'object',
      properties: {
        seoTitle: { type: 'string' },
        seoDescription: { type: 'string' },
        seoKeywords: {
          type: 'array',
          items: { type: 'string' }
        }
      },
      required: ['seoTitle', 'seoDescription', 'seoKeywords']
    };

    const result = await ai.generateContentJson(prompt, seoSchema);

    return NextResponse.json({
      success: true,
      seo: {
        seoTitle: result.seoTitle || '',
        seoDescription: result.seoDescription || '',
        seoKeywords: result.seoKeywords || []
      }
    });
  } catch (error) {
    console.error('[SEO Generate API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
