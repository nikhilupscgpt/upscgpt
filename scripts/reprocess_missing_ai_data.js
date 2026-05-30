import { PrismaClient } from '@prisma/client';
import { getGeminiModel } from '../src/lib/gemini.js';
import { getRenderedPrompt, getPromptValue } from '../src/lib/aiPromptRegistry.js';
import pLimit from 'p-limit';
import 'dotenv/config';

const prisma = new PrismaClient();

// Helper to clean JSON
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
  const prompt = await getRenderedPrompt('news.translation.system', {
    language,
    title,
    content: content.substring(0, 4500)
  });

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

async function main() {
  const batchAi = getGeminiModel('background');
  const synthesisAi = getGeminiModel('synthesis');

  if (!batchAi || !synthesisAi) {
    console.error("AI Model not configured. Please check GEMINI_API_KEY in .env");
    process.exit(1);
  }

  console.log("=== Fetching DONE Articles missing structuredData ===");
  const articles = await prisma.article.findMany({
    where: {
      status: 'DONE',
      rawContent: { not: null }
    }
  });
  const missingArticles = articles.filter(a => !a.structuredData);
  console.log(`Found ${missingArticles.length} articles to reprocess.`);

  console.log("=== Fetching DONE Editorials missing structuredData ===");
  const editorials = await prisma.editorial.findMany({
    where: {
      status: 'DONE',
      rawContent: { not: null }
    }
  });
  const missingEditorials = editorials.filter(e => !e.structuredData);
  console.log(`Found ${missingEditorials.length} editorials to reprocess.`);

  const issueIdsToRebuild = new Set();
  const limit = pLimit(1); // Sequential processing to avoid rate limits
  const interItemDelay = (ms) => new Promise(r => setTimeout(r, ms));

  // Process Articles
  const articlePromises = missingArticles.map((article, idx) => 
    limit(async () => {
      if (idx > 0) await interItemDelay(3000); // 3s delay between items to avoid rate limits
      console.log(`[Article ${idx+1}/${missingArticles.length}] Processing: "${article.title}"`);
      const prompt = await getRenderedPrompt('issue.article.extraction', {
        title: article.title,
        content: article.rawContent.substring(0, 6000),
      });

      try {
        const response = await batchAi.generateContent(prompt);
        const txt = typeof response.text === 'function' ? response.text() : response.text;
        const structuredData = cleanJson(txt);

        if (structuredData) {
          const aiImportance = structuredData.importanceScore ? (parseInt(structuredData.importanceScore) || 1) : 1;

          console.log(` -> [Article ${idx+1}] Translating to Hindi...`);
          const hiTranslation = await translateNewsContent(synthesisAi, article.title, article.rawContent, "Hindi");

          console.log(` -> [Article ${idx+1}] Translating to Marathi...`);
          const mrTranslation = await translateNewsContent(synthesisAi, article.title, article.rawContent, "Marathi");

          await prisma.article.update({
            where: { id: article.id },
            data: {
              structuredData,
              importanceScore: aiImportance,
              title_hi: hiTranslation.title,
              rawContent_hi: hiTranslation.content,
              title_mr: mrTranslation.title,
              rawContent_mr: mrTranslation.content,
            }
          });
          console.log(` -> [Article ${idx+1}] Successfully updated. Importance: ${aiImportance}`);
          if (article.issueId) {
            issueIdsToRebuild.add(article.issueId);
          }
        } else {
          console.warn(` -> [Article ${idx+1}] Failed to generate structured JSON for "${article.title}"`);
        }
      } catch (err) {
        console.error(` -> [Article ${idx+1}] Error processing:`, err);
      }
    })
  );

  await Promise.all(articlePromises);

  // Process Editorials
  const editorialPromises = missingEditorials.map((editorial, idx) =>
    limit(async () => {
      if (idx > 0) await interItemDelay(3000); // 3s delay between items to avoid rate limits
      console.log(`[Editorial ${idx+1}/${missingEditorials.length}] Processing: "${editorial.title}"`);
      const prompt = await getRenderedPrompt('issue.article.extraction', {
        title: editorial.title,
        content: editorial.rawContent.substring(0, 6000),
      });

      try {
        const response = await batchAi.generateContent(prompt);
        const txt = typeof response.text === 'function' ? response.text() : response.text;
        const structuredData = cleanJson(txt);

        if (structuredData) {
          const aiImportance = structuredData.importanceScore ? (parseInt(structuredData.importanceScore) || 1) : 1;

          console.log(` -> [Editorial ${idx+1}] Translating to Hindi...`);
          const hiTranslation = await translateNewsContent(synthesisAi, editorial.title, editorial.rawContent, "Hindi");

          console.log(` -> [Editorial ${idx+1}] Translating to Marathi...`);
          const mrTranslation = await translateNewsContent(synthesisAi, editorial.title, editorial.rawContent, "Marathi");

          await prisma.editorial.update({
            where: { id: editorial.id },
            data: {
              structuredData,
              importanceScore: aiImportance,
              title_hi: hiTranslation.title,
              rawContent_hi: hiTranslation.content,
              title_mr: mrTranslation.title,
              rawContent_mr: mrTranslation.content,
            }
          });
          console.log(` -> [Editorial ${idx+1}] Successfully updated. Importance: ${aiImportance}`);
          if (editorial.issueId) {
            issueIdsToRebuild.add(editorial.issueId);
          }
        } else {
          console.warn(` -> [Editorial ${idx+1}] Failed to generate structured JSON for "${editorial.title}"`);
        }
      } catch (err) {
        console.error(` -> [Editorial ${idx+1}] Error processing:`, err);
      }
    })
  );

  await Promise.all(editorialPromises);

  // Cumulative Summaries Rebuild
  console.log(`\n=== Rebuilding Cumulative Summaries for ${issueIdsToRebuild.size} affected Issues ===`);
  const issueLimit = pLimit(2); // Concurrency of 2 for issues
  const issuePromises = Array.from(issueIdsToRebuild).map(issueId =>
    issueLimit(async () => {
      console.log(`Rebuilding Issue: ${issueId}`);
      try {
        const issue = await prisma.issue.findUnique({
          where: { id: issueId },
          include: {
            articles: { where: { status: 'DONE' }, orderBy: { publishedAt: 'desc' }, take: 10 },
            editorials: { where: { status: 'DONE' }, orderBy: { publishedAt: 'desc' }, take: 10 }
          }
        });

        if (!issue) return;

        const timelineLines = [];
        issue.articles.forEach(a => {
          timelineLines.push(`- [Article] ${a.title} (${a.publishedAt?.toISOString().split('T')[0]}): ${a.structuredData?.crux || 'No crux available'}`);
        });
        issue.editorials.forEach(e => {
          timelineLines.push(`- [Editorial] ${e.title} (${e.publishedAt?.toISOString().split('T')[0]}): ${e.structuredData?.crux || 'No crux available'}`);
        });

        const timelineData = timelineLines.join('\n');

        const summaryPrompt = await getRenderedPrompt('issue.cumulative.synthesis', {
          issueTitle: issue.title,
          domain: issue.domain,
          topic: issue.topic,
          timelineData,
        });

        const summaryResult = await batchAi.generateContent(summaryPrompt);
        const summaryText = typeof summaryResult.text === 'function' ? summaryResult.text() : summaryResult.text;
        let htmlSummary = summaryText.replace(/```(?:html)?\s*([\s\S]*?)\s*```/g, '$1').trim();

        await prisma.issue.update({
          where: { id: issueId },
          data: { cumulativeSummary: htmlSummary }
        });
        console.log(` -> Successfully rebuilt Issue ${issue.title}`);
      } catch (e) {
        console.error(` -> Failed to rebuild issue ${issueId}:`, e);
      }
    })
  );

  await Promise.all(issuePromises);

  // news streaks rebuild
  console.log(`\n=== Rebuilding News Streaks Living Summaries ===`);
  const affectedStreaks = await prisma.newsStreak.findMany({
    where: {
      OR: [
        { issues: { some: { id: { in: Array.from(issueIdsToRebuild) } } } }
      ]
    },
    include: {
      issues: true,
      articles: { where: { status: 'DONE' }, orderBy: { publishedAt: 'desc' } },
      editorials: { where: { status: 'DONE' }, orderBy: { publishedAt: 'desc' } }
    }
  });

  console.log(`Found ${affectedStreaks.length} news streaks to rebuild.`);
  const streakLimit = pLimit(2);
  const streakPromises = affectedStreaks.map(streak =>
    streakLimit(async () => {
      console.log(`Rebuilding News Streak: "${streak.title}"`);
      try {
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
          syllabusNodes,
          timelineData,
        });

        // Define schema for structured output to guarantee valid JSON formatting
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

        await prisma.newsStreak.update({
          where: { id: streak.id },
          data: { livingSummary: JSON.stringify(parsedJson) }
        });
        console.log(` -> Successfully rebuilt News Streak summary for "${streak.title}"`);
      } catch (e) {
        console.error(` -> Failed to rebuild news streak ${streak.id}:`, e);
      }
    })
  );

  await Promise.all(streakPromises);

  console.log("\n=== REPROCESSING COMPLETE ===");
}

main().catch(console.error).finally(() => prisma.$disconnect());
