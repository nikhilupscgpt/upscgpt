import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const prisma = new PrismaClient();

async function generateSummary(issueTitle, domain, topic, context) {
  const apiKey = process.env.GEMINI_API_KEY;
  const client = new GoogleGenAI({ apiKey });
  const model = 'gemma-3-27b-it'; // Use Gemma 3 for bulk background tasks
  
  const prompt = `
You are a UPSC Topper and Subject Specialist. Write a comprehensive, high-depth "Strategic Briefing" for the topic: "${issueTitle}".
Domain: ${domain}
Topic: ${topic}

Context Blocks from Syllabus Materials:
${context}

Instructions:
1. Write 3-4 paragraphs of deep analytical content.
2. Structure: 
   - Thesis/Overview (2 lines)
   - Dimensions of the Issue (Multi-dimensional analysis)
   - Strategic Synthesis (Way forward, link to India angle)
3. Style: Professional, topper-grade, scannable.
4. Format: Use HTML (<b>, <p>, <ul>, <li>). No markdown. No code blocks.
5. Absolute Rule: DO NOT mention missing data. Speak with authority.

YOUR RESPONSE (Raw HTML Only):`;

  try {
    const result = await client.models.generateContent({ model, contents: prompt });
    return typeof result.text === 'function' ? result.text() : result.text;
  } catch (err) {
    console.error(`[AI ERROR] ${err.message}`);
    throw err;
  }
}

async function main() {
  const issues = await prisma.issue.findMany({
    where: { cumulativeSummary: null },
    take: 5 // DEMO MODE: Only 5 issues
  });

  console.log(`Synthesizing summaries for ${issues.length} issues...`);

  for (const issue of issues) {
    console.log(`Processing: ${issue.title}`);
    
    // Find related static content
    const relatedContent = await prisma.subjectContent.findMany({
      where: {
        OR: [
          { title: { contains: issue.title, mode: 'insensitive' } },
          { contentMarkdown: { contains: issue.title, mode: 'insensitive' } }
        ]
      },
      take: 5
    });

    const context = relatedContent.map(c => c.contentMarkdown).join('\n\n---\n\n');
    
    try {
      const summary = await generateSummary(issue.title, issue.domain, issue.topic, context || "Use your internal strategic knowledge for this UPSC syllabus node.");
      
      await prisma.issue.update({
        where: { id: issue.id },
        data: { cumulativeSummary: summary }
      });
      console.log(`  -> Success!`);
    } catch (err) {
      console.error(`  -> Failed:`, err.message);
    }
  }

  console.log('Demo seeding complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
