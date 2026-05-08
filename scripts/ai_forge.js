import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const OLLAMA_HOST = 'http://localhost:11434';
const GENERATION_MODEL = 'gemma4:e4b';
const EMBEDDING_MODEL = 'nomic-embed-text';

async function generateMetadata(node) {
  const prompt = `You are building a UPSC preparation knowledge base. For the syllabus node '${node.title}' under domain '${node.domain}', paper '${node.gsPapers.join(', ')}': Generate a JSON with — 5 keyThemes (specific UPSC concepts), 5 subtopics, 3 linkedConcepts, 3 pyqAngles (typical Mains exam question framings), examRelevance (High/Medium/Low). Return only valid JSON, no explanation.`;

  const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: GENERATION_MODEL,
      prompt: prompt,
      stream: false,
      format: 'json'
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama Generation failed: ${response.statusText}`);
  }

  const data = await response.json();
  try {
    return JSON.parse(data.response);
  } catch (e) {
    throw new Error(`Failed to parse JSON from Ollama: ${data.response}`);
  }
}

async function generateEmbedding(metadataJson) {
  // We embed the rich text representation of the metadata for semantic search
  const textToEmbed = `
    Title: ${metadataJson.title || ''}
    Themes: ${(metadataJson.keyThemes || []).join(', ')}
    Subtopics: ${(metadataJson.subtopics || []).join(', ')}
    Concepts: ${(metadataJson.linkedConcepts || []).join(', ')}
    PYQs: ${(metadataJson.pyqAngles || []).join(', ')}
  `.trim();

  const response = await fetch(`${OLLAMA_HOST}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      prompt: textToEmbed
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama Embedding failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.embedding;
}

async function processNode(node) {
  console.log(`\n⏳ Processing: [${node.domain}] ${node.title}...`);

  try {
    // 1. Generate Metadata via Gemma
    const metadata = await generateMetadata(node);
    
    // Inject node-specific UI data into the metadata
    metadata.nodeId = node.slug || node.id;
    metadata.title = node.title;
    metadata.domain = node.domain;
    metadata.gsPaper = node.gsPapers;

    // 2. Generate Embedding via Nomic
    const embedding = await generateEmbedding(metadata);

    // 3. Save to Neon DB (Metadata + Vector)
    await prisma.$transaction(async (tx) => {
      // Update JSON metadata
      await tx.issue.update({
        where: { id: node.id },
        data: { metadata: metadata }
      });

      // Update vector using raw SQL since Prisma 'Unsupported' requires it
      await tx.$executeRawUnsafe(
        `UPDATE "Issue" SET "embedding" = $1::vector WHERE "id" = $2`, 
        `[${embedding.join(',')}]`, 
        node.id
      );
    });

    console.log(`✅ Success: ${node.title}`);
  } catch (error) {
    console.error(`❌ Failed: ${node.title}`, error.message);
  }
}

async function main() {
  console.log('🔥 Starting AI Forge: Batch Metadata Generation (Optimized)...');
  console.log(`Target: Ollama (${OLLAMA_HOST}) | Models: ${GENERATION_MODEL}, ${EMBEDDING_MODEL}`);

  // Fetch all core syllabus nodes
  const allNodes = await prisma.issue.findMany({
    where: {},
    select: {
      id: true,
      title: true,
      domain: true,
      gsPapers: true,
      slug: true,
      metadata: true
    }
  });

  const nodesToProcess = allNodes.filter(n => !n.metadata);
  console.log(`Found ${nodesToProcess.length} nodes to process.\n`);

  const CONCURRENCY_LIMIT = 3;
  const chunks = [];
  for (let i = 0; i < nodesToProcess.length; i += CONCURRENCY_LIMIT) {
    chunks.push(nodesToProcess.slice(i, i + CONCURRENCY_LIMIT));
  }

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`\n🚀 Processing Chunk ${i + 1}/${chunks.length} (${chunk.length} nodes)...`);
    await Promise.all(chunk.map(node => processNode(node)));
  }

  console.log('\n🎉 AI Forge Batch Complete!');
}

main()
  .catch(e => console.error('Fatal Error:', e))
  .finally(async () => {
    await prisma.$disconnect();
  });
