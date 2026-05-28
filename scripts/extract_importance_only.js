import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

const prisma = new PrismaClient();
const delay = (ms) => new Promise(r => setTimeout(r, ms));

// Direct model client — bypass the fallback chain for maximum control
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) { console.error("GEMINI_API_KEY not set"); process.exit(1); }
const genAI = new GoogleGenerativeAI(apiKey);

// Use gemma-4-26b as primary (higher free-tier RPD), fallback to 2.0-flash
const MODEL_CHAIN = ['gemma-4-26b-a4b-it', 'gemini-2.0-flash'];

async function callWithSmartRetry(prompt) {
  for (const modelName of MODEL_CHAIN) {
    const model = genAI.getGenerativeModel({ model: modelName });
    
    for (let attempt = 1; attempt <= 6; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log(`  [✓] model="${modelName}" attempt=${attempt}`);
        return response.text();
      } catch (error) {
        const is429 = error.status === 429 || error.message?.includes('429');
        const is5xx = error.status === 500 || error.status === 503;
        
        if ((is429 || is5xx) && attempt < 6) {
          // Parse retryDelay from API response if available
          let waitMs = attempt * 10000; // Default: 10s, 20s, 30s...
          const retryMatch = error.message?.match(/retryDelay.*?(\d+)s/);
          if (retryMatch) {
            waitMs = Math.max(parseInt(retryMatch[1]) * 1000 + 2000, waitMs);
          }
          console.log(`  [⏳] ${modelName} attempt=${attempt} → 429/5xx, waiting ${Math.round(waitMs/1000)}s...`);
          await delay(waitMs);
          continue;
        }
        console.warn(`  [✗] ${modelName} attempt=${attempt} failed: ${error.message?.substring(0, 100)}`);
        break; // Try next model
      }
    }
  }
  return null; // All models exhausted
}

const cleanJson = (text) => {
  if (!text) return null;
  let cleaned = text.trim();
  const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match) cleaned = match[1].trim();
  else cleaned = cleaned.replace(/```json/g, '').replace(/```/g, '').trim();
  
  // Remove comments
  cleaned = cleaned.replace(/\/\/.*$/gm, '');
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Isolate JSON object
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end > start) cleaned = cleaned.substring(start, end + 1);
  
  try { return JSON.parse(cleaned); } 
  catch (e) { console.error("  [JSON parse failed]:", e.message); return null; }
};

async function processItem(type, item, idx, total) {
  console.log(`\n[${type} ${idx+1}/${total}] "${item.title}"`);
  
  const prompt = `You are an elite UPSC Strategic Analyst.
Analyze the provided content to extract high-yield insights for the UPSC Civil Services Exam.

Title: "${item.title}"
Content: "${item.rawContent.substring(0, 6000)}"

Return strictly valid JSON:
{
  "crux": "1-2 paragraph deep analytical synthesis of the core arguments/developments (150-200 words)",
  "importanceScore": <an integer between 1 and 5 indicating the importance for UPSC: 1 = Normal daily updates/minor events, 3 = High relevance/recurrent syllabus themes, 5 = Critical landmark events/landmark judgment/major policy release>,
  "prelimsFact": "A highly specific, testable factual point mentioned in the text, or null if none",
  "mcq": {
    "question": "A conceptual UPSC Prelims-style MCQ based on the text",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "answer": "Exact text of the correct option",
    "explanation": "Why this option is correct"
  }
}
If the text does not contain enough info for a Prelims Fact or MCQ, return null for those fields.`;

  const rawText = await callWithSmartRetry(prompt);
  if (!rawText) {
    console.log(`  [SKIP] All models failed for "${item.title}"`);
    return null;
  }

  const structuredData = cleanJson(rawText);
  if (!structuredData) {
    console.log(`  [SKIP] JSON parse failed for "${item.title}"`);
    return null;
  }

  const importance = parseInt(structuredData.importanceScore) || 1;
  
  const table = type === 'Article' ? prisma.article : prisma.editorial;
  await table.update({
    where: { id: item.id },
    data: { structuredData, importanceScore: importance }
  });
  
  console.log(`  [SAVED] importance=${importance}`);
  return { id: item.id, importance, issueId: item.issueId };
}

async function main() {
  console.log("=== EXTRACTION-ONLY REPROCESSING (no translations) ===\n");
  
  // Fetch items missing structuredData
  const allArticles = await prisma.article.findMany({ where: { status: 'DONE', rawContent: { not: null } } });
  const articles = allArticles.filter(a => !a.structuredData);
  
  const allEditorials = await prisma.editorial.findMany({ where: { status: 'DONE', rawContent: { not: null } } });
  const editorials = allEditorials.filter(e => !e.structuredData);
  
  console.log(`Articles to process: ${articles.length}`);
  console.log(`Editorials to process: ${editorials.length}`);
  console.log(`Total API calls needed: ~${articles.length + editorials.length} (1 per item)\n`);
  
  const issueIdsToRebuild = new Set();
  let successCount = 0;
  let failCount = 0;

  // Process sequentially with delays
  for (let i = 0; i < articles.length; i++) {
    if (i > 0) await delay(10000); // 10s between items
    const result = await processItem('Article', articles[i], i, articles.length);
    if (result) {
      successCount++;
      if (result.issueId) issueIdsToRebuild.add(result.issueId);
    } else {
      failCount++;
    }
  }

  for (let i = 0; i < editorials.length; i++) {
    if (i > 0 || articles.length > 0) await delay(10000); // 10s between items
    const result = await processItem('Editorial', editorials[i], i, editorials.length);
    if (result) {
      successCount++;
      if (result.issueId) issueIdsToRebuild.add(result.issueId);
    } else {
      failCount++;
    }
  }

  console.log(`\n=== RESULTS ===`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Issues to rebuild: ${issueIdsToRebuild.size}`);
  console.log(`\n=== DONE ===`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
