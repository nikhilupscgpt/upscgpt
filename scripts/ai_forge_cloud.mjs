import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// We use gemini-1.5-flash for metadata generation (fast & cheap)
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash',
  generationConfig: { responseMimeType: "application/json" }
});

async function generateIssueMetadata(node) {
  const prompt = `You are building a UPSC preparation knowledge base. 
  For the syllabus node '${node.title}' under domain '${node.domain}', paper '${node.gsPapers?.join(', ') || 'General Studies'}': 
  Generate a JSON with exactly these fields:
  - keyThemes: Array of 5 specific UPSC concepts/terms related to this topic.
  - subtopics: Array of 5 sub-areas under this node.
  - linkedConcepts: Array of 3 related broader UPSC concepts.
  - pyqAngles: Array of 3 typical Mains exam question framings for this topic.
  - examRelevance: One of "High", "Medium", "Low".
  
  Return only valid JSON.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
}

async function generatePyqMetadata(pyq) {
  const prompt = `You are building a UPSC preparation knowledge base. For the following Previous Year Question (PYQ):
  "${pyq.questionText}"
  
  Generate a JSON with exactly these fields:
  - topicTags: Array of 3-5 specific UPSC syllabus topics this question relates to.
  - keywordsToAddress: Array of 3-5 critical terms/concepts that must be included in the answer.
  - questionType: One of "Critical Analysis", "Discuss", "Explain", "Examine", "Comment".
  - examRelevance: One of "High", "Medium", "Low".
  
  Return only valid JSON.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
}

async function updateSearchVector(table, id, metadata, titleField) {
  let weightedText = '';
  
  if (table === 'Issue') {
    weightedText = `
      setweight(to_tsvector('english', '${(metadata.title || titleField || '').replace(/'/g, "''")}'), 'A') ||
      setweight(to_tsvector('english', '${(metadata.keyThemes || []).join(' ').replace(/'/g, "''")}'), 'A') ||
      setweight(to_tsvector('english', '${(metadata.subtopics || []).join(' ').replace(/'/g, "''")}'), 'B') ||
      setweight(to_tsvector('english', '${(metadata.linkedConcepts || []).join(' ').replace(/'/g, "''")}'), 'B') ||
      setweight(to_tsvector('english', '${(metadata.pyqAngles || []).join(' ').replace(/'/g, "''")}'), 'C') ||
      setweight(to_tsvector('english', '${(metadata.domain || '').replace(/'/g, "''")}'), 'C')
    `;
  } else if (table === 'PreviousYearQuestion') {
    weightedText = `
      setweight(to_tsvector('english', '${(titleField || '').replace(/'/g, "''")}'), 'A') ||
      setweight(to_tsvector('english', '${(metadata.topicTags || []).join(' ').replace(/'/g, "''")}'), 'A') ||
      setweight(to_tsvector('english', '${(metadata.keywordsToAddress || []).join(' ').replace(/'/g, "''")}'), 'B')
    `;
  }

  await prisma.$executeRawUnsafe(
    `UPDATE "${table}" SET "searchVector" = ${weightedText} WHERE "id" = '${id}'`
  );
}

async function main() {
  console.log('☁️ Starting AI Forge Cloud (Gemini)...');

  // 1. Process missing Issues
  const missingIssues = await prisma.issue.findMany({
    where: { metadata: { equals: null } } // This might still fail, so I'll fetch all and filter
  }).catch(() => []);
  
  const allIssues = await prisma.issue.findMany({ select: { id: true, metadata: true, title: true, domain: true, gsPapers: true, slug: true } });
  const issuesToProcess = allIssues.filter(i => !i.metadata);

  console.log(`Found ${issuesToProcess.length} Issues to process.`);
  for (const issue of issuesToProcess) {
    console.log(`⏳ Processing Issue: ${issue.title}...`);
    try {
      const metadata = await generateIssueMetadata(issue);
      metadata.nodeId = issue.slug || issue.id;
      metadata.title = issue.title;
      metadata.domain = issue.domain;
      metadata.gsPaper = issue.gsPapers;

      await prisma.issue.update({
        where: { id: issue.id },
        data: { metadata }
      });
      
      await updateSearchVector('Issue', issue.id, metadata, issue.title);
      console.log(`✅ Success: ${issue.title}`);
    } catch (e) {
      console.error(`❌ Failed: ${issue.title}`, e.message);
    }
  }

  // 2. Process missing PYQs
  const allPyqs = await prisma.previousYearQuestion.findMany({
    select: { id: true, metadata: true, questionText: true, year: true, paper: true }
  });
  const pyqsToProcess = allPyqs.filter(p => !p.metadata);

  console.log(`\nFound ${pyqsToProcess.length} PYQs to process.`);
  for (const pyq of pyqsToProcess) {
    console.log(`⏳ Processing PYQ: ${pyq.questionText.substring(0, 50)}...`);
    try {
      const metadata = await generatePyqMetadata(pyq);
      metadata.pyqId = pyq.id;
      metadata.year = pyq.year;
      metadata.paper = pyq.paper;

      await prisma.previousYearQuestion.update({
        where: { id: pyq.id },
        data: { metadata }
      });

      await updateSearchVector('PreviousYearQuestion', pyq.id, metadata, pyq.questionText);
      console.log(`✅ Success: PYQ processed.`);
    } catch (e) {
      console.error(`❌ Failed: PYQ`, e.message);
    }
  }

  console.log('\n🎉 AI Forge Cloud Complete!');
}

main()
  .catch(e => console.error('Fatal Error:', e))
  .finally(async () => {
    await prisma.$disconnect();
  });
