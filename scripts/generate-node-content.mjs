import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { getGeminiModel } from "../src/lib/gemini.js";

dotenv.config();

let prisma = new PrismaClient();

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function ensureDbConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e) {
    console.warn("⚠️ Database connection lost. Reconnecting...");
    await prisma.$disconnect();
    prisma = new PrismaClient();
    await prisma.$connect();
  }
}

async function forgeDetailedContentWithGemma(node, index, total) {
  try {
    await ensureDbConnection();

    // Fetch custom subject prompts from DB
    const mainsKey = `AI_PROMPT__forge.detailed_mains.${node.category}`;
    const prelimsKey = `AI_PROMPT__forge.detailed_prelims.${node.category}`;

    const [mainsConfig, prelimsConfig] = await Promise.all([
      prisma.platformConfig.findUnique({ where: { key: mainsKey } }),
      prisma.platformConfig.findUnique({ where: { key: prelimsKey } })
    ]);

    const mainsTemplate = mainsConfig?.value || "Generate a detailed Mains study note.";
    const prelimsTemplate = prelimsConfig?.value || "Generate a fact-dense Prelims briefing.";

    const combinedPrompt = `
      You are a UPSC expert. For the topic: "${node.title}" (Category: ${node.category}, Paper: ${node.gsPapers.join(", ")})
      
      TASK 1: MAINS ANALYTICAL NOTE
      ${mainsTemplate}
      
      TASK 2: PRELIMS FACTUAL BRIEFING
      ${prelimsTemplate}
      
      IMPORTANT: RETURN ONLY A VALID JSON OBJECT WITH THIS EXACT STRUCTURE (NO EXTRA TEXT):
      {
        "mainsNote": { ... content from Task 1 ... },
        "prelimsNote": { ... content from Task 2 ... }
      }
    `;

    console.log(`[MASTER FORGE] Node [${index + 1}/${total}]: ${node.title} | Category: ${node.category}`);

    const ai = getGeminiModel('analysis');
    const result = await ai.generateContent(combinedPrompt);
    const aiResponseText = typeof result.text === 'function' ? result.text() : result.text;
    
    // Extract JSON if AI included markdown blocks
    const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI did not return valid JSON structure");
    
    const data = JSON.parse(jsonMatch[0]);

    await prisma.issue.update({
      where: { id: node.id },
      data: {
        mainsNote: data.mainsNote,
        prelimsNote: data.prelimsNote
      }
    });

    console.log(`✅ Success: ${node.title} (Cloud Gemma 26B)`);
    
    // 6-second delay to maintain ~10 RPM (limit is 15 RPM)
    await sleep(6000); 

  } catch (error) {
    console.error(`❌ Failed "${node.title}":`, error.message);
    // Extra sleep on failure to allow quota cooldown
    await sleep(10000);
  }
}

async function main() {
  console.log(`🚀 Starting Global Master Forge: ALL 558 Nodes (Model: Cloud Gemma 26B)...`);

  // Fetch all nodes and filter in-memory to avoid Prisma's complex JSON null checks
  const allNodes = await prisma.issue.findMany({
    select: { id: true, title: true, category: true, gsPapers: true, mainsNote: true, prelimsNote: true }
  });

  const nodes = allNodes.filter(n => !n.mainsNote || !n.prelimsNote);

  const total = nodes.length;
  console.log(`📡 Found ${total} nodes requiring content synthesis.`);

  for (let i = 0; i < nodes.length; i++) {
    await forgeDetailedContentWithGemma(nodes[i], i, total);
  }
  
  console.log("🎉 GLOBAL MASTER FORGE COMPLETE.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
