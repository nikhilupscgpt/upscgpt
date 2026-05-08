import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const OLLAMA_HOST = 'http://localhost:11434';
const GENERATION_MODEL = 'gemma4:e4b';
const EMBEDDING_MODEL = 'nomic-embed-text';

async function generatePyqMetadata(pyq) {
  const prompt = `You are building a UPSC preparation knowledge base. For the following Previous Year Question (PYQ):
"${pyq.questionText}"

Generate a JSON with exactly these fields:
- topicTags: Array of 3-5 specific UPSC syllabus topics this question relates to.
- keywordsToAddress: Array of 3-5 critical terms/concepts that must be included in the answer.
- questionType: One of "Critical Analysis", "Discuss", "Explain", "Examine", "Comment".
- examRelevance: One of "High", "Medium", "Low".

Return only valid JSON, no explanation.`;

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

async function generatePyqEmbedding(pyq, metadataJson) {
  const textToEmbed = `
    Question: ${pyq.questionText}
    Tags: ${(metadataJson.topicTags || []).join(', ')}
    Keywords: ${(metadataJson.keywordsToAddress || []).join(', ')}
    Type: ${metadataJson.questionType || ''}
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

async function processPyq(pyq) {
  console.log(`\n⏳ Processing PYQ: ${pyq.questionText.substring(0, 50)}...`);

  try {
    // 1. Generate Metadata
    const metadata = await generatePyqMetadata(pyq);
    
    // Inject core fields for consistency
    metadata.pyqId = pyq.id;
    metadata.year = pyq.year;
    metadata.paper = pyq.paper;

    // 2. Generate Embedding
    const embedding = await generatePyqEmbedding(pyq, metadata);

    // 3. Save to DB
    await prisma.$transaction(async (tx) => {
      await tx.previousYearQuestion.update({
        where: { id: pyq.id },
        data: { metadata: metadata }
      });

      await tx.$executeRawUnsafe(
        `UPDATE "PreviousYearQuestion" SET "embedding" = $1::vector WHERE "id" = $2`, 
        `[${embedding.join(',')}]`, 
        pyq.id
      );
    });

    console.log(`✅ Success: PYQ processed.`);
  } catch (error) {
    console.error(`❌ Failed: PYQ`, error.message);
  }
}

async function main() {
  console.log('🔥 Starting AI Forge: PYQ Metadata Generation (Optimized)...');
  
  const allPyqs = await prisma.previousYearQuestion.findMany({
    where: {},
    select: {
      id: true,
      questionText: true,
      year: true,
      paper: true,
      metadata: true
    }
  });

  const pyqsToProcess = allPyqs.filter(p => !p.metadata);
  console.log(`Found ${pyqsToProcess.length} PYQs to process.\n`);

  const CONCURRENCY_LIMIT = 3;
  const chunks = [];
  for (let i = 0; i < pyqsToProcess.length; i += CONCURRENCY_LIMIT) {
    chunks.push(pyqsToProcess.slice(i, i + CONCURRENCY_LIMIT));
  }

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`\n🚀 Processing Chunk ${i + 1}/${chunks.length} (${chunk.length} PYQs)...`);
    await Promise.all(chunk.map(pyq => processPyq(pyq)));
  }

  console.log('\n🎉 PYQ AI Forge Complete!');
}

main()
  .catch(e => console.error('Fatal Error:', e))
  .finally(async () => {
    await prisma.$disconnect();
  });
