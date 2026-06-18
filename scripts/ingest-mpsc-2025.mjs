import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateEmbedding(text) {
  // Use gemini-embedding-001 with 768 dimensions to align with pgvector schema
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const result = await model.embedContent({
    content: { parts: [{ text: text }] },
    outputDimensionality: 768
  });
  return result.embedding.values;
}

async function main() {
  const optionalId = 'cmpxs56id0000g35mfi11az04'; // Geography
  
  // 1. Clean up existing 2025 MPSC Geography optional questions to guarantee idempotency
  console.log("Cleaning up existing 2025 MPSC Geography questions...");
  const deleteResult = await prisma.previousYearQuestion.deleteMany({
    where: {
      optionalId: optionalId,
      year: 2025,
      exam: 'MPSC'
    }
  });
  console.log(`Cleaned up ${deleteResult.count} existing questions.`);

  const paper1File = './scripts/paper1_extracted.json';
  const paper2File = './scripts/paper2_extracted.json';

  let questions = [];

  if (fs.existsSync(paper1File)) {
    const raw = fs.readFileSync(paper1File, 'utf-8');
    questions = questions.concat(JSON.parse(raw));
  } else {
    console.warn("Paper 1 JSON file not found!");
  }

  if (fs.existsSync(paper2File)) {
    const raw = fs.readFileSync(paper2File, 'utf-8');
    questions = questions.concat(JSON.parse(raw));
  } else {
    console.warn("Paper 2 JSON file not found!");
  }

  console.log(`Processing ingestion for ${questions.length} questions in both languages...`);

  for (const q of questions) {
    const qNum = q.questionNumber || 'Q';
    console.log(`\nIngesting ${q.paper} - ${qNum} (${q.marks} marks)...`);

    // Ingest English question
    if (q.questionEn) {
      try {
        console.log(`  -> Generating English embedding...`);
        const embeddingEn = await generateEmbedding(q.questionEn);
        const vectorStrEn = `[${embeddingEn.join(',')}]`;

        await prisma.$executeRawUnsafe(`
          INSERT INTO "PreviousYearQuestion" (id, paper, "optionalId", subject, year, "questionText", marks, "modelAnswer", "createdAt", "updatedAt", embedding, language, exam, metadata)
          VALUES (
            gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $8::vector, $9, $10, $11::jsonb
          )
        `,
          q.paper,
          optionalId,
          'Geography',
          2025,
          q.questionEn,
          parseInt(q.marks) || 10,
          '',
          vectorStrEn,
          'en',
          'MPSC',
          JSON.stringify({ questionNumber: qNum })
        );
        console.log(`  -> English version ingested.`);
      } catch (err) {
        console.error(`  [Error] Failed to ingest English question: ${qNum}`, err.message);
      }
    }

    // Ingest Marathi question
    if (q.questionMr) {
      try {
        console.log(`  -> Generating Marathi embedding...`);
        const embeddingMr = await generateEmbedding(q.questionMr);
        const vectorStrMr = `[${embeddingMr.join(',')}]`;

        await prisma.$executeRawUnsafe(`
          INSERT INTO "PreviousYearQuestion" (id, paper, "optionalId", subject, year, "questionText", marks, "modelAnswer", "createdAt", "updatedAt", embedding, language, exam, metadata)
          VALUES (
            gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $8::vector, $9, $10, $11::jsonb
          )
        `,
          q.paper,
          optionalId,
          'Geography',
          2025,
          q.questionMr,
          parseInt(q.marks) || 10,
          '',
          vectorStrMr,
          'mr',
          'MPSC',
          JSON.stringify({ questionNumber: qNum })
        );
        console.log(`  -> Marathi version ingested.`);
      } catch (err) {
        console.error(`  [Error] Failed to ingest Marathi question: ${qNum}`, err.message);
      }
    }
  }

  console.log("\n[INGESTION COMPLETED]");
  await prisma.$disconnect();
}

main();
