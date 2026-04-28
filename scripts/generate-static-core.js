import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { getGeminiModel } from '../src/lib/gemini.js';

const prisma = new PrismaClient();
const ai = getGeminiModel('background');

async function processNode(node) {
  const prompt = `
    Task: You are an expert UPSC faculty member. Your goal is to generate study content for a specific syllabus node.
    Node Title: ${node.title}
    Node Topic: ${node.topic}
    Category: ${node.category}

    Please output a JSON object containing two fields:
    1. "backgroundNote": A dense, highly analytical markdown formatted note (approx 300-400 words) that provides strategic intelligence on this topic for UPSC Prelims and Mains. Use headings and bullet points.
    2. "possibleQuestions": A markdown formatted string containing 3 highly probable analytical questions (mix of Prelims statements and Mains questions) that could be asked on this topic.

    CRITICAL: Output ONLY valid JSON, no backticks, no markdown wrapping the JSON itself.
  `;

  try {
    const response = await ai.generateContent(prompt);
    let text = typeof response.text === 'function' ? response.text() : response.text;
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsed = JSON.parse(text);
    
    if (parsed.backgroundNote && parsed.possibleQuestions) {
      await prisma.issue.update({
        where: { id: node.id },
        data: {
          backgroundNote: parsed.backgroundNote,
          possibleQuestions: parsed.possibleQuestions,
        }
      });
      console.log(`[SUCCESS] Generated content for: ${node.title}`);
    } else {
       console.log(`[WARNING] Incomplete JSON for: ${node.title}`);
    }
  } catch (error) {
    console.error(`[ERROR] Failed to process ${node.title}:`, error.message);
  }
}

async function main() {
  const limitArg = process.argv.find(arg => arg.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 545; // default to all

  console.log(`🚀 Starting Static Core Generation (Limit: ${limit})`);

  const nodes = await prisma.issue.findMany({
    where: {
      status: 'ACTIVE',
      OR: [
        { backgroundNote: null },
        { backgroundNote: '' }
      ]
    },
    take: limit
  });

  console.log(`Found ${nodes.length} nodes requiring content generation.`);

  for (let i = 0; i < nodes.length; i++) {
    console.log(`Processing ${i + 1}/${nodes.length}...`);
    await processNode(nodes[i]);
    // Sleep to avoid rate limits
    await new Promise(r => setTimeout(r, 1000)); 
  }

  console.log('✅ Generation complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
