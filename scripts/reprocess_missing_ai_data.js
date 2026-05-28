import { PrismaClient } from '@prisma/client';
import { getGeminiModel } from '../src/lib/gemini.js';
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
      const prompt = `You are an elite UPSC Strategic Analyst.
Analyze the provided content to extract high-yield insights for the UPSC Civil Services Exam.

Title: "${article.title}"
Content: "${article.rawContent.substring(0, 6000)}"

Return strictly valid JSON:
{
  "crux": "1-2 paragraph deep analytical synthesis of the core arguments/developments (150-200 words)",
  "importanceScore": <an integer between 1 and 5 indicating the importance for UPSC: 1 = Normal daily updates/minor events, 3 = High relevance/recurrent syllabus themes, 5 = Critical landmark events/landmark judgment/major policy release>,
  "prelimsFact": "A highly specific, testable factual point (e.g., a treaty, index, organization, or geographic location) mentioned in the text, or null if none",
  "mcq": {
    "question": "A conceptual UPSC Prelims-style MCQ based on the text",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "answer": "Exact text of the correct option",
    "explanation": "Why this option is correct"
  }
}
If the text does not contain enough info for a Prelims Fact or MCQ, return null for those fields.`;

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
      const prompt = `You are an elite UPSC Strategic Analyst.
Analyze the provided content to extract high-yield insights for the UPSC Civil Services Exam.

Title: "${editorial.title}"
Content: "${editorial.rawContent.substring(0, 6000)}"

Return strictly valid JSON:
{
  "crux": "1-2 paragraph deep analytical synthesis of the core arguments/developments (150-200 words)",
  "importanceScore": <an integer between 1 and 5 indicating the importance for UPSC: 1 = Normal daily updates/minor events, 3 = High relevance/recurrent syllabus themes, 5 = Critical landmark events/landmark judgment/major policy release>,
  "prelimsFact": "A highly specific, testable factual point (e.g., a treaty, index, organization, or geographic location) mentioned in the text, or null if none",
  "mcq": {
    "question": "A conceptual UPSC Prelims-style MCQ based on the text",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "answer": "Exact text of the correct option",
    "explanation": "Why this option is correct"
  }
}
If the text does not contain enough info for a Prelims Fact or MCQ, return null for those fields.`;

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

        const summaryPrompt = `You are a UPSC Mains examiner and strategic content synthesizer.
Your task is to write a cohesive "Strategic Summary" for a UPSC Syllabus Topic (an "Issue Node"), using a provided timeline of recent developments.

Issue: "${issue.title}"
Domain: "${issue.domain}"
Topic: "${issue.topic}"

Recent Developments (Chronological):
${timelineData}

Instructions:
1. Write 3 to 4 paragraphs synthesizing the overarching narrative of this issue.
2. Incorporate the recent developments provided to show how the issue has evolved.
3. Focus on: Core Challenge, Government/Policy Response, and the Way Forward.
4. Format using HTML: use <b> for emphasis, <ul>/<li> for brief lists if needed, and wrap paragraphs in <p> tags.
5. Do NOT include markdown blocks. Return raw HTML string only.
6. Make it exam-ready for UPSC Mains GS papers.`;

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

        const prompt = `You are an expert UPSC current affairs analyst writing exam-ready study notes.
Based on the news timeline below, generate a "Living Summary" as a single valid JSON object with exactly three keys.

Topic: "${streak.title}"
Syllabus: ${syllabusNodes}

News Timeline:
${timelineData}

Rules:
- Return ONLY raw JSON. No markdown code fences, no preamble, no explanations.
- Each value is a markdown string that reads like a flowing document section.
- Use **bold** for all key terms and concepts.
- Use \n\n to separate paragraphs within a string.

JSON schema to follow exactly:
{
  "causes": "### Why is ${streak.title} Happening?\\n\\n[Paragraph 1]\\n\\n[Paragraph 2]",
  "impact": "### Economic & Policy Impact\\n\\n[Paragraph 1]\\n\\n**Key Specific Effects:**\\n- **[Effect 1]:** [explanation]",
  "tracker": "### Key Data & Concepts to Remember\\n\\n| Metric / Term | What It Means | UPSC Angle |\\n| :--- | :--- | :--- |"
}`;

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
