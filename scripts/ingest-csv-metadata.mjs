import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import Papa from 'papaparse';

const prisma = new PrismaClient();
const OLLAMA_HOST = 'http://localhost:11434';
const EMBEDDING_MODEL = 'nomic-embed-text';

async function generateEmbedding(metadataJson) {
  const textToEmbed = `
    Title: ${metadataJson.title || ''}
    Themes: ${(metadataJson.keyThemes || []).join(', ')}
    Subtopics: ${(metadataJson.subtopics || []).join(', ')}
    Concepts: ${(metadataJson.linkedConcepts || []).join(', ')}
    PYQs: ${(metadataJson.pyqAngles || []).join(', ')}
  `.trim();

  try {
    const response = await fetch(`${OLLAMA_HOST}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        prompt: textToEmbed
      })
    });

    if (!response.ok) throw new Error(`Ollama Embedding failed`);
    const data = await response.json();
    return data.embedding;
  } catch (e) {
    console.error(`Embedding failed for ${metadataJson.title}: ${e.message}`);
    return null;
  }
}

async function processRow(row) {
  const { id, title, keyThemes, subtopics, linkedConcepts, pyqAngles, examRelevance } = row;
  
  if (!id) return;

  // Split by semicolon or comma, then trim
  const split = (str) => {
    if (!str) return [];
    return str.split(/[;,]/).map(s => s.trim()).filter(Boolean);
  };

  const metadata = {
    nodeId: row.slug || id,
    title: title,
    domain: row.domain,
    gsPaper: split(row.gsPapers),
    examRelevance: examRelevance || 'Medium',
    keyThemes: split(keyThemes),
    subtopics: split(subtopics),
    linkedConcepts: split(linkedConcepts),
    pyqAngles: split(pyqAngles),
    contentStatus: "PARTIAL"
  };

  console.log(`⏳ Processing [${row.domain}] ${title}...`);

  try {
    // 1. Generate Embedding
    const embedding = await generateEmbedding(metadata);

    // 2. Update DB
    await prisma.$transaction(async (tx) => {
      // Update metadata JSON
      await tx.issue.update({
        where: { id: id },
        data: { metadata: metadata }
      });

      // Update vector if generated
      if (embedding) {
        await tx.$executeRawUnsafe(
          `UPDATE "Issue" SET "embedding" = $1::vector WHERE "id" = $2`, 
          `[${embedding.join(',')}]`, 
          id
        );
      }

      // 3. Manually update searchVector (tsvector) for Day 3 compatibility
      const weightedText = `
        setweight(to_tsvector('english', '${(metadata.title || '').replace(/'/g, "''")}'), 'A') ||
        setweight(to_tsvector('english', '${(metadata.keyThemes || []).join(' ').replace(/'/g, "''")}'), 'A') ||
        setweight(to_tsvector('english', '${(metadata.subtopics || []).join(' ').replace(/'/g, "''")}'), 'B') ||
        setweight(to_tsvector('english', '${(metadata.linkedConcepts || []).join(' ').replace(/'/g, "''")}'), 'B') ||
        setweight(to_tsvector('english', '${(metadata.pyqAngles || []).join(' ').replace(/'/g, "''")}'), 'C') ||
        setweight(to_tsvector('english', '${(metadata.domain || '').replace(/'/g, "''")}'), 'C')
      `;

      await tx.$executeRawUnsafe(
        `UPDATE "Issue" SET "searchVector" = ${weightedText} WHERE "id" = '${id}'`
      );
    });

    return true;
  } catch (error) {
    console.error(`❌ Failed: ${title}`, error.message);
    return false;
  }
}

async function main() {
  const csvFile = fs.readFileSync('MASTER_DISCOVERY_NODES.csv', 'utf8');
  const { data } = Papa.parse(csvFile, { header: true, skipEmptyLines: true });

  console.log(`🔥 Starting Ingestion of ${data.length} nodes from CSV...`);

  // Parallel processing with concurrency limit
  const CONCURRENCY_LIMIT = 5;
  const chunks = [];
  for (let i = 0; i < data.length; i += CONCURRENCY_LIMIT) {
    chunks.push(data.slice(i, i + CONCURRENCY_LIMIT));
  }

  let successCount = 0;
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`\n🚀 Chunk ${i + 1}/${chunks.length}...`);
    const results = await Promise.all(chunk.map(row => processRow(row)));
    successCount += results.filter(Boolean).length;
  }

  console.log(`\n🎉 Ingestion Complete! ${successCount}/${data.length} nodes updated.`);
}

main()
  .catch(e => console.error('Fatal Error:', e))
  .finally(async () => {
    await prisma.$disconnect();
  });
