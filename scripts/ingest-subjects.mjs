import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { spawn } from 'child_process';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function sanitizeText(text) {
  if (!text) return "";
  return text.replace(/\0/g, '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "");
}

/**
 * Streamed Native OCR: Spawns the OCR tool and reads its output in chunks to avoid buffer overflows.
 */
async function extractTextWithOCR(filePath) {
  return new Promise((resolve, reject) => {
    const ext = path.extname(filePath).toLowerCase();
    if (ext !== '.pdf') {
      return resolve(sanitizeText(fs.readFileSync(filePath, 'utf-8')));
    }

    console.log(`  [VISION SCAN] Starting Deep Page-by-Page OCR...`);
    const tool = path.resolve('./scripts/ocr-tool');
    const child = spawn(tool, [filePath]);

    let fullText = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      const chunk = data.toString();
      fullText += chunk;
      if (chunk.includes('--- PAGE')) {
        const pageMatch = chunk.match(/--- PAGE (\d+) ---/);
        if (pageMatch) process.stdout.write(`\r  [OCR] Scanning Page ${pageMatch[1]}...`);
      }
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        process.stdout.write('\n');
        resolve(sanitizeText(fullText));
      } else {
        console.error(`\n  [VISION FAILED] Code: ${code}. Error: ${errorOutput}`);
        reject(new Error(`Native OCR failed with exit code ${code}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.pdf', '.md', '.txt'].includes(ext)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });
  return arrayOfFiles;
}

function chunkText(text, chunkSize = 2000) {
  if (!text) return [];
  const paragraphs = text.split(/--- PAGE \d+ ---|\n\s*\n/);
  const chunks = [];
  let currentChunk = "";

  for (let paragraph of paragraphs) {
    paragraph = paragraph.trim();
    if (!paragraph) continue;

    if (paragraph.length > chunkSize) {
      const sentences = paragraph.match(/[^\.!\?]+[\.!\?]+/g) || [paragraph];
      for (const sentence of sentences) {
        if ((currentChunk.length + sentence.length) > chunkSize && currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          currentChunk = sentence;
        } else {
          currentChunk += (currentChunk ? " " : "") + sentence;
        }
      }
    } else if ((currentChunk.length + paragraph.length) > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
    }
  }
  if (currentChunk.trim()) chunks.push(currentChunk.trim());
  return chunks;
}

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
  const dirPath = args.find(a => a.startsWith('--dir='))?.split('=')[1];
  const filePath = args.find(a => a.startsWith('--file='))?.split('=')[1];
  const subject = args.find(a => a.startsWith('--subject='))?.split('=')[1] || 'GEOGRAPHY';
  const examType = args.find(a => a.startsWith('--examType='))?.split('=')[1] || 'MAINS';
  const optionalSlug = args.find(a => a.startsWith('--optional='))?.split('=')[1];
  const language = args.find(a => a.startsWith('--language='))?.split('=')[1] || 'en';
  const exam = args.find(a => a.startsWith('--exam='))?.split('=')[1] || 'BOTH';

  let optionalId = null;
  if (optionalSlug) {
    const opt = await prisma.optionalSubject.findUnique({ where: { slug: optionalSlug } });
    if (!opt) {
       console.error(`Error: Optional subject '${optionalSlug}' not found.`);
       process.exit(1);
    }
    optionalId = opt.id;
  }

  if (!dirPath && !filePath) {
    console.log('Usage: node scripts/ingest-subjects.mjs --file=path/to/file.pdf --optional=geography [--language=en] [--exam=BOTH]');
    process.exit(1);
  }

  const filesToProcess = filePath ? [filePath] : getAllFiles(dirPath);
  console.log(`\n[Native Vision Ingest] Memory-Safe OCR enabled for ${filesToProcess.length} sources...`);

  for (const fPath of filesToProcess) {
    const title = path.basename(fPath, path.extname(fPath));
    console.log(`\n[Source] ${title}`);
    
    try {
      const fullText = await extractTextWithOCR(fPath);
      const chunks = chunkText(fullText);
      console.log(`  -> OCR Success: ${fullText.length} chars. Vectorizing ${chunks.length} segments...`);

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        if (chunk.length < 100) continue; 

        const embedding = await generateEmbedding(chunk);
        const vectorStr = `[${embedding.join(',')}]`;

        await prisma.$executeRawUnsafe(`
          INSERT INTO "SubjectContent" (id, subject, "examType", "isOptional", "optionalId", title, "contentMarkdown", "sourceUrl", "createdAt", "updatedAt", embedding, language, exam)
          VALUES (
            gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $8::vector, $9, $10
          )
        `, 
          subject, examType, optionalId ? true : false, optionalId,
          `${title} [Vision-${i+1}]`, chunk, path.basename(fPath), vectorStr,
          language, exam
        );
        if (i % 10 === 0) process.stdout.write('.');
      }
      console.log(`\n  [COMPLETED] ${title} successfully indexed.`);
    } catch (err) {
      console.error(`  [FATAL ERROR] ${title}:`, err.message);
    }
  }

  await prisma.$disconnect();
}

main();
