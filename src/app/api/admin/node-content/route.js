import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from "@/lib/auth";
import { getRenderedPrompt, getPromptValue } from '@/lib/aiPromptRegistry';
import { OpenAI } from 'openai';
import { recordUsage } from '@/lib/cost/recordUsage';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
  baseURL: process.env.OPENAI_API_BASE, // For Ollama or other providers
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return null;
  }
  return session;
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')  // Remove all non-word chars
    .replace(/--+/g, '-')     // Replace multiple - with single -
    .replace(/^-+/, '')       // Trim - from start of text
    .replace(/-+$/, '');      // Trim - from end of text
}

export async function GET(req) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const list = searchParams.get('list');
  const issueId = searchParams.get('issueId');

  if (list) {
    try {
      const issues = await prisma.issue.findMany({
        select: {
          id: true,
          title: true,
          domain: true,
          gsPapers: true,
          category: true,
          orderIndex: true,
          nodeContent: {
            select: {
              status: true
            }
          }
        },
        orderBy: { orderIndex: 'asc' }
      });
      return NextResponse.json({ issues });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch issues list' }, { status: 500 });
    }
  }

  if (!issueId) return NextResponse.json({ error: 'Issue ID required' }, { status: 400 });

  try {
    const content = await prisma.nodeContent.findUnique({
      where: { issueId },
      include: { issue: true }
    });

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error fetching node content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { issueId, prelimsNote, mainsNote, status, generateType } = body;

    if (!issueId) return NextResponse.json({ error: 'Issue ID required' }, { status: 400 });

    const issue = await prisma.issue.findUnique({ where: { id: issueId } });
    if (!issue) return NextResponse.json({ error: 'Issue not found' }, { status: 404 });

    // AI Generation Mode
    if (generateType) {
      const promptId = generateType === 'PRELIMS' ? 'cms.node.generate.prelims' : 'cms.node.generate.mains';
      const prompt = await getRenderedPrompt(promptId, {
        issueTitle: issue.title,
        domain: issue.domain,
        topic: issue.topic
      });

      const systemPrompt = await getPromptValue('cms.node.openai.system');
      const modelName = process.env.AI_REASONING_MODEL || 'gpt-4';
      const startedAt = Date.now();
      const response = await openai.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      });

      const aiText = response.choices[0].message.content;
      const tokensIn = Number(response.usage?.prompt_tokens) || Math.ceil((systemPrompt.length + prompt.length) / 4);
      const tokensOut = Number(response.usage?.completion_tokens) || Math.ceil(String(aiText || '').length / 4);
      const isOllama = Boolean(process.env.OPENAI_API_BASE);
      await Promise.all([
        recordUsage({ provider: isOllama ? 'ollama' : 'openai', category: 'ai', feature: 'cms', unit: 'tokens_in', quantity: tokensIn, meta: { model: modelName, cacheHit: false, latencyMs: Date.now() - startedAt } }),
        recordUsage({ provider: isOllama ? 'ollama' : 'openai', category: 'ai', feature: 'cms', unit: 'tokens_out', quantity: tokensOut, meta: { model: modelName, cacheHit: false, latencyMs: Date.now() - startedAt } }),
      ]);
      return NextResponse.json({ aiText });
    }

    // Regular Update Mode
    const updatedContent = await prisma.nodeContent.upsert({
      where: { issueId },
      update: {
        prelimsNote,
        mainsNote,
        status: status || 'DRAFT',
        lastEditedBy: session.user.email
      },
      create: {
        issueId,
        prelimsNote,
        mainsNote,
        status: status || 'DRAFT',
        lastEditedBy: session.user.email
      }
    });

    // Sync notes back to parent Issue model for student-facing interface
    const issueUpdateData = {};
    if (prelimsNote !== undefined) issueUpdateData.prelimsNote = prelimsNote;
    if (mainsNote !== undefined) issueUpdateData.mainsNote = mainsNote;

    // SEO Slug Logic: Update issue slug if it looks generic or is missing
    const newSlug = `${slugify(issue.title)}-${slugify(issue.domain)}`;
    if (issue.slug !== newSlug) {
      issueUpdateData.slug = newSlug;
    }

    if (Object.keys(issueUpdateData).length > 0) {
      await prisma.issue.update({
        where: { id: issueId },
        data: issueUpdateData
      });
    }

    return NextResponse.json({ success: true, content: updatedContent, newSlug });
  } catch (error) {
    console.error('Error saving node content:', error);
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 });
  }
}
