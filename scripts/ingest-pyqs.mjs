import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateEmbedding(text) {
  const ollamaUrl = process.env.OLLAMA_HOST;
  if (ollamaUrl) {
    try {
      const response = await fetch(`${ollamaUrl}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'nomic-embed-text', prompt: text }),
      });
      if (response.ok) {
        const data = await response.json();
        return data.embedding;
      }
    } catch (err) {}
  }
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const result = await model.embedContent({
    content: { parts: [{ text: text }] },
    outputDimensionality: 768
  });
  return result.embedding.values;
}

async function main() {
  const args = process.argv.slice(2);
  const filePath = args.find(a => a.startsWith('--file='))?.split('=')[1];
  const optionalSlug = args.find(a => a.startsWith('--optional='))?.split('=')[1];

  if (!filePath) {
    console.log('Usage: node scripts/ingest-pyqs.mjs --file=pyqs.json [--optional=geography]');
    process.exit(1);
  }

  let optionalId = null;
  if (optionalSlug) {
    const opt = await prisma.optionalSubject.findUnique({ where: { slug: optionalSlug } });
    if (opt) optionalId = opt.id;
  }

  const rawData = fs.readFileSync(filePath, 'utf-8');
  const pyqs = JSON.parse(rawData);

  console.log(`\n[PYQ Ingest] Processing ${pyqs.length} questions...`);

  for (const q of pyqs) {
    try {
      const embedding = await generateEmbedding(q.question);
      const vectorStr = `[${embedding.join(',')}]`;

      await prisma.$executeRawUnsafe(`
        INSERT INTO "PreviousYearQuestion" (id, paper, "optionalId", subject, year, "questionText", marks, "modelAnswer", "createdAt", "updatedAt", embedding)
        VALUES (
          gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $8::vector
        )
      `, 
        q.paper || 'GS',
        optionalId,
        q.subject || 'GENERAL',
        parseInt(q.year) || 2024,
        q.question,
        parseInt(q.marks) || 10,
        q.modelAnswer || '',
        vectorStr
      );
      process.stdout.write('.');
    } catch (err) {
      console.error(`\n[Error] Failed on question: ${q.question.substring(0, 30)}...`, err.message);
    }
  }

  console.log(`\n[COMPLETED] Ingested ${pyqs.length} PYQs.`);
  await prisma.$disconnect();
}

main();
