import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getGeminiModel } from "@/lib/gemini";
import { getRenderedPrompt } from "@/lib/aiPromptRegistry";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Helper to clean JSON from markdown
const cleanJson = (text) => {
  if (!text) return null;
  const str = typeof text === 'function' ? text() : text;
  const match = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const cleanStr = match ? match[1] : str.replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleanStr);
  } catch (e) {
    console.error("Failed to parse JSON:", cleanStr);
    return null;
  }
};

const translateNewsContent = async (aiClient, title, content, language) => {
  if (!content) return { title: null, content: null };
  const prompt = `You are an expert bilingual translator for UPSC civil services preparation.
Translate the following English news article into formal, highly accurate ${language}.
Ensure that technical terms, government schemes, and legal vocabulary are translated correctly as per UPSC standards.

Return a JSON object with this exact structure:
{
  "title": "Translated title here",
  "content": "Translated content here (retain markdown formatting if any)"
}

English Original:
Title: ${title}
Content:
${content.substring(0, 4500)}`;

  const translationSchema = {
    type: 'object',
    properties: {
      title: { type: 'string' },
      content: { type: 'string' }
    },
    required: ['title', 'content']
  };

  try {
    const res = await aiClient.generateContentJson(prompt, translationSchema);
    return res;
  } catch (e) {
    console.error(`Translation failed for ${language}:`, e);
    return { title: null, content: null };
  }
};

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      // Empty or invalid body (e.g. from background triggers)
    }
    const { mode, issueId, field, articleId, editorialId } = body;

    const batchAi = getGeminiModel('background');   // Gemma 26B for bulk article/editorial processing
    const synthesisAi = getGeminiModel('synthesis'); // Gemini 2.5 Flash for structured JSON synthesis
    if (!batchAi || !synthesisAi) {
      return NextResponse.json({ error: 'AI Model not configured' }, { status: 500 });
    }

    // --- NEW: NODE_CONTENT_REBUILD MODE ---
    if (mode === 'NODE_CONTENT_REBUILD') {
      if (!issueId || !field) {
        return NextResponse.json({ error: 'Missing issueId or field' }, { status: 400 });
      }

      const issue = await prisma.issue.findUnique({
        where: { id: issueId }
      });

      if (!issue) return NextResponse.json({ error: 'Issue not found' }, { status: 404 });

      // Determine prompt type
      let promptKey = 'cms.node.generate.mains';
      if (field === 'prelimsNote') promptKey = 'cms.node.generate.prelims';

      const prompt = await getRenderedPrompt(promptKey, {
        title: issue.title,
        domain: issue.domain,
        topic: issue.topic
      });

      const response = await batchAi.generateContent(prompt);
      let output = typeof response.text === 'function' ? response.text() : response.text;
      
      // Clean markdown
      output = output.replace(/```(?:markdown|html)?\s*([\s\S]*?)\s*```/g, '$1').trim();

      return NextResponse.json({
        success: true,
        output
      });
    }

    // --- NEW: STREAK_REBUILD MODE ---
    if (mode === 'STREAK_REBUILD') {
      const { streakId } = body;
      if (!streakId) {
        return NextResponse.json({ error: 'Missing streakId' }, { status: 400 });
      }

      const streak = await prisma.newsStreak.findUnique({
        where: { id: streakId },
        include: {
          issues: true,
          articles: { where: { status: 'DONE' }, orderBy: { publishedAt: 'desc' } },
          editorials: { where: { status: 'DONE' }, orderBy: { publishedAt: 'desc' } }
        }
      });

      if (!streak) {
        return NextResponse.json({ error: 'News Streak not found' }, { status: 404 });
      }

      const timelineLines = [];
      streak.articles.forEach(a => {
        timelineLines.push(`- [Article] ${a.title} (${a.publishedAt?.toISOString().split('T')[0]}): ${a.structuredData?.crux || ''}`);
      });
      streak.editorials.forEach(e => {
        timelineLines.push(`- [Editorial] ${e.title} (${e.publishedAt?.toISOString().split('T')[0]}): ${e.structuredData?.crux || ''}`);
      });
      
      const timelineData = timelineLines.join('\n');
      const syllabusNodes = streak.issues.map(iss => `${iss.gsPapers?.[0] || 'GS'} • ${iss.title}`).join(', ');

      const prompt = await getRenderedPrompt('streak.living.summary.synthesis', {
        streakTitle: streak.title,
        syllabusNodes: syllabusNodes,
        timelineData: timelineData.substring(0, 8000)
      });

      // Define schema for news streak living summary
      const streakSchema = {
        type: 'object',
        properties: {
          causes: { type: 'string' },
          impact: { type: 'string' },
          tracker: { type: 'string' }
        },
        required: ['causes', 'impact', 'tracker']
      };

      // Use JSON mode with schema to guarantee pure JSON output conforming to the structure
      const parsedJson = await synthesisAi.generateContentJson(prompt, streakSchema);

      const finalSummaryStr = JSON.stringify(parsedJson);

      await prisma.newsStreak.update({
        where: { id: streakId },
        data: { livingSummary: finalSummaryStr }
      });

      return NextResponse.json({
        success: true,
        livingSummary: finalSummaryStr
      });
    }

    const processedItems = { articles: 0, editorials: 0 };
    const issueIdsToRebuild = new Set();

    // 1. Process PENDING Articles
    const pendingArticles = await prisma.article.findMany({
      where: { 
        id: articleId || undefined,
        status: 'PENDING', 
        rawContent: { not: null } 
      },
      take: articleId ? 1 : 5 // Process 1 if specific ID, else batch
    });

    for (const article of pendingArticles) {
      console.log(`[Processing Article] ${article.title}`);
      
      const prompt = await getRenderedPrompt('issue.article.extraction', {
        title: article.title,
        content: article.rawContent.substring(0, 6000) // limit context
      });

      try {
        const response = await batchAi.generateContent(prompt);
        const structuredData = cleanJson(response.text);

        if (structuredData) {
          const aiImportance = structuredData.importanceScore ? (parseInt(structuredData.importanceScore) || 1) : 1;
          
          console.log(`[Translating Article] ${article.title} to Hindi...`);
          const hiTranslation = await translateNewsContent(synthesisAi, article.title, article.rawContent, "Hindi");
          
          console.log(`[Translating Article] ${article.title} to Marathi...`);
          const mrTranslation = await translateNewsContent(synthesisAi, article.title, article.rawContent, "Marathi");

          await prisma.article.update({
            where: { id: article.id },
            data: {
              structuredData,
              status: 'DONE',
              importanceScore: aiImportance,
              title_hi: hiTranslation.title,
              rawContent_hi: hiTranslation.content,
              title_mr: mrTranslation.title,
              rawContent_mr: mrTranslation.content,
            }
          });
          processedItems.articles++;
          issueIdsToRebuild.add(article.issueId);
          
          await prisma.actionLog.create({
            data: { action: 'PROCESSING_STARTED', entityType: 'Article', entityId: article.id, status: 'SUCCESS', message: `Processed: ${article.title}` }
          });
        }
      } catch (err) {
        console.error(`[Error Processing Article] ${article.id}:`, err);
        await prisma.actionLog.create({
          data: { action: 'PROCESSING_STARTED', entityType: 'Article', entityId: article.id, status: 'FAILED', message: err.message }
        });
      }
    }

    // 2. Process PENDING Editorials
    const pendingEditorials = await prisma.editorial.findMany({
      where: { 
        id: editorialId || undefined,
        status: 'PENDING', 
        rawContent: { not: null } 
      },
      take: editorialId ? 1 : 5
    });

    for (const editorial of pendingEditorials) {
      console.log(`[Processing Editorial] ${editorial.title}`);
      
      const prompt = await getRenderedPrompt('issue.article.extraction', {
        title: editorial.title,
        content: editorial.rawContent.substring(0, 6000)
      });

      try {
        const response = await batchAi.generateContent(prompt);
        const structuredData = cleanJson(response.text);

        if (structuredData) {
          const aiImportance = structuredData.importanceScore ? (parseInt(structuredData.importanceScore) || 1) : 1;
          
          console.log(`[Translating Editorial] ${editorial.title} to Hindi...`);
          const hiTranslation = await translateNewsContent(synthesisAi, editorial.title, editorial.rawContent, "Hindi");
          
          console.log(`[Translating Editorial] ${editorial.title} to Marathi...`);
          const mrTranslation = await translateNewsContent(synthesisAi, editorial.title, editorial.rawContent, "Marathi");

          await prisma.editorial.update({
            where: { id: editorial.id },
            data: {
              structuredData,
              status: 'DONE',
              importanceScore: aiImportance,
              title_hi: hiTranslation.title,
              rawContent_hi: hiTranslation.content,
              title_mr: mrTranslation.title,
              rawContent_mr: mrTranslation.content,
            }
          });
          processedItems.editorials++;
          issueIdsToRebuild.add(editorial.issueId);

          await prisma.actionLog.create({
            data: { action: 'PROCESSING_STARTED', entityType: 'Editorial', entityId: editorial.id, status: 'SUCCESS', message: `Processed: ${editorial.title}` }
          });
        }
      } catch (err) {
        console.error(`[Error Processing Editorial] ${editorial.id}:`, err);
        await prisma.actionLog.create({
          data: { action: 'PROCESSING_STARTED', entityType: 'Editorial', entityId: editorial.id, status: 'FAILED', message: err.message }
        });
      }
    }

    // 3. Rebuild Cumulative Summaries for affected Issues
    let rebuiltIssues = 0;
    for (const issueId of issueIdsToRebuild) {
      console.log(`[Rebuilding Issue] ${issueId}`);
      
      const issue = await prisma.issue.findUnique({
        where: { id: issueId },
        include: {
          articles: { where: { status: 'DONE' }, orderBy: { publishedAt: 'desc' }, take: 10 },
          editorials: { where: { status: 'DONE' }, orderBy: { publishedAt: 'desc' }, take: 10 }
        }
      });

      if (!issue) continue;

      // Compile timeline text for the AI
      const timelineLines = [];
      issue.articles.forEach(a => {
        timelineLines.push(`- [Article] ${a.title} (${a.publishedAt?.toISOString().split('T')[0]}): ${a.structuredData?.crux || 'No crux available'}`);
      });
      issue.editorials.forEach(e => {
        timelineLines.push(`- [Editorial] ${e.title} (${e.publishedAt?.toISOString().split('T')[0]}): ${e.structuredData?.crux || 'No crux available'}`);
      });

      const timelineData = timelineLines.join('\n');

      const prompt = await getRenderedPrompt('issue.cumulative.synthesis', {
        issueTitle: issue.title,
        domain: issue.domain,
        topic: issue.topic,
        timelineData: timelineData.substring(0, 8000) // Ensure we don't blow context limits
      });

      try {
        const response = await batchAi.generateContent(prompt);
        let htmlSummary = typeof response.text === 'function' ? response.text() : response.text;
        
        // Clean markdown backticks if AI included them
        htmlSummary = htmlSummary.replace(/```(?:html)?\s*([\s\S]*?)\s*```/g, '$1').trim();

        await prisma.issue.update({
          where: { id: issueId },
          data: { cumulativeSummary: htmlSummary }
        });
        
        rebuiltIssues++;
        await prisma.actionLog.create({
          data: { action: 'SUMMARY_REBUILT', entityType: 'Issue', entityId: issueId, status: 'SUCCESS', message: `Rebuilt cumulative summary` }
        });
      } catch (err) {
        console.error(`[Error Rebuilding Issue] ${issueId}:`, err);
        await prisma.actionLog.create({
          data: { action: 'SUMMARY_REBUILT', entityType: 'Issue', entityId: issueId, status: 'FAILED', message: err.message }
        });
      }
    }

    // 4. Rebuild Living Summaries for affected News Streaks
    const affectedStreaks = await prisma.newsStreak.findMany({
      where: {
        OR: [
          { issues: { some: { id: { in: Array.from(issueIdsToRebuild) } } } },
          { articles: { some: { id: { in: pendingArticles.map(a => a.id) } } } },
          { editorials: { some: { id: { in: pendingEditorials.map(e => e.id) } } } }
        ]
      },
      include: {
        issues: true,
        articles: { where: { status: 'DONE' }, orderBy: { publishedAt: 'desc' } },
        editorials: { where: { status: 'DONE' }, orderBy: { publishedAt: 'desc' } }
      }
    });

    let rebuiltStreaks = 0;
    for (const streak of affectedStreaks) {
      console.log(`[Rebuilding News Streak Summary] ${streak.title}`);
      
      const timelineLines = [];
      streak.articles.forEach(a => {
        timelineLines.push(`- [Article] ${a.title} (${a.publishedAt?.toISOString().split('T')[0]}): ${a.structuredData?.crux || ''}`);
      });
      streak.editorials.forEach(e => {
        timelineLines.push(`- [Editorial] ${e.title} (${e.publishedAt?.toISOString().split('T')[0]}): ${e.structuredData?.crux || ''}`);
      });
      
      const timelineData = timelineLines.join('\n');
      const syllabusNodes = streak.issues.map(iss => `${iss.gsPapers?.[0] || 'GS'} • ${iss.title}`).join(', ');

      const prompt = await getRenderedPrompt('streak.living.summary.synthesis', {
        streakTitle: streak.title,
        syllabusNodes: syllabusNodes,
        timelineData: timelineData.substring(0, 8000)
      });

      try {
        const streakSchema = {
          type: 'object',
          properties: {
            causes: { type: 'string' },
            impact: { type: 'string' },
            tracker: { type: 'string' }
          },
          required: ['causes', 'impact', 'tracker']
        };
        const parsedJson = await synthesisAi.generateContentJson(prompt, streakSchema);

        const finalSummaryStr = JSON.stringify(parsedJson);

        await prisma.newsStreak.update({
          where: { id: streak.id },
          data: { livingSummary: finalSummaryStr }
        });
        
        rebuiltStreaks++;
        
        await prisma.actionLog.create({
          data: { action: 'STREAK_REBUILT', entityType: 'NewsStreak', entityId: streak.id, status: 'SUCCESS', message: `Auto-updated Living Summary` }
        });
      } catch (err) {
        console.error(`[Error Rebuilding Streak] ${streak.id}:`, err);
        await prisma.actionLog.create({
          data: { action: 'STREAK_REBUILT', entityType: 'NewsStreak', entityId: streak.id, status: 'FAILED', message: err.message }
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedItems,
      issuesRebuilt: rebuiltIssues,
      streaksRebuilt: rebuiltStreaks
    });

  } catch (error) {
    console.error("[News Engine Process API] Fatal Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
