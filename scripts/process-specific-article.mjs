import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getRenderedPrompt } from '../src/lib/aiPromptRegistry.js';
import fs from 'fs';
import path from 'path';

// Manual env loading
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const geminiKey = envContent.match(/GEMINI_API_KEY="?([^"\n]+)"?/)?.[1];

if (!geminiKey) {
  console.error("GEMINI_API_KEY not found in .env");
  process.exit(1);
}

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(geminiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const articleId = "cmozx29dg0006x1os1weidni2";

async function process() {
  try {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: { issue: true }
    });

    if (!article) {
      console.error("Article not found");
      process.exit(1);
    }

    console.log(`[Processing] ${article.title}`);

    const prompt = await getRenderedPrompt('issue.article.extraction', {
      title: article.title,
      content: article.rawContent.substring(0, 6000),
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanJson = (str) => {
      const match = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const cleanStr = match ? match[1] : str.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanStr);
    };

    const structuredData = cleanJson(text);

    if (structuredData) {
      const updated = await prisma.article.update({
        where: { id: article.id },
        data: {
          structuredData,
          status: 'DONE'
        }
      });

      // Also rebuild cumulative summary for the issue
      console.log("--- REBUILDING ISSUE SUMMARY ---");
      const issue = await prisma.issue.findUnique({
        where: { id: article.issueId },
        include: {
          articles: { where: { status: 'DONE' }, orderBy: { publishedAt: 'desc' }, take: 5 },
          editorials: { where: { status: 'DONE' }, orderBy: { publishedAt: 'desc' }, take: 5 }
        }
      });

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

      const summaryResult = await model.generateContent(summaryPrompt);
      let htmlSummary = summaryResult.response.text();
      htmlSummary = htmlSummary.replace(/```(?:html)?\s*([\s\S]*?)\s*```/g, '$1').trim();

      await prisma.issue.update({
        where: { id: issue.id },
        data: { cumulativeSummary: htmlSummary }
      });

      console.log(JSON.stringify({ 
        success: true, 
        articleId: article.id, 
        processed: true,
        summaryRebuilt: true,
        data: structuredData 
      }, null, 2));
    }
  } catch (err) {
    console.error("Processing failed:", err);
  } finally {
    process.exit(0);
  }
}

process();
