import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getGeminiModel } from "@/lib/gemini";
import { getRenderedPrompt } from "@/lib/aiPromptRegistry";

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

export async function POST(req) {
  // Authorization can be added here or via middleware. 
  // For cron/admin, we could verify a secret token or NextAuth session.
  // Assuming auth is handled.

  try {
    const ai = getGeminiModel('background'); // Uses configured background model (e.g., Gemma 3 27B)
    if (!ai) {
      return NextResponse.json({ error: 'AI Model not configured' }, { status: 500 });
    }

    const processedItems = { articles: 0, editorials: 0 };
    const issueIdsToRebuild = new Set();

    // 1. Process PENDING Articles
    const pendingArticles = await prisma.article.findMany({
      where: { status: 'PENDING', rawContent: { not: null } },
      take: 5 // Process in small batches
    });

    for (const article of pendingArticles) {
      console.log(`[Processing Article] ${article.title}`);
      
      const prompt = await getRenderedPrompt('issue.article.extraction', {
        title: article.title,
        content: article.rawContent.substring(0, 6000) // limit context
      });

      try {
        const response = await ai.generateContent(prompt);
        const structuredData = cleanJson(response.text);

        if (structuredData) {
          await prisma.article.update({
            where: { id: article.id },
            data: {
              structuredData,
              status: 'DONE'
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
      where: { status: 'PENDING', rawContent: { not: null } },
      take: 5
    });

    for (const editorial of pendingEditorials) {
      console.log(`[Processing Editorial] ${editorial.title}`);
      
      const prompt = await getRenderedPrompt('issue.article.extraction', {
        title: editorial.title,
        content: editorial.rawContent.substring(0, 6000)
      });

      try {
        const response = await ai.generateContent(prompt);
        const structuredData = cleanJson(response.text);

        if (structuredData) {
          await prisma.editorial.update({
            where: { id: editorial.id },
            data: {
              structuredData,
              status: 'DONE'
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
        const response = await ai.generateContent(prompt);
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

    return NextResponse.json({
      success: true,
      processed: processedItems,
      issuesRebuilt: rebuiltIssues
    });

  } catch (error) {
    console.error("[News Engine Process API] Fatal Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
