import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const OLLAMA_HOST = 'http://localhost:11434';
const EMBEDDING_MODEL = 'nomic-embed-text';

async function getQueryEmbedding(query) {
  const response = await fetch(`${OLLAMA_HOST}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      prompt: query
    })
  });
  const data = await response.json();
  return data.embedding;
}

async function search(query) {
  console.log(`\n🔍 Searching for: "${query}"...`);

  // 1. Keyword Search (tsvector)
  console.log('\n--- KEYWORD RESULTS (tsvector) ---');
  const keywordResults = await prisma.$queryRawUnsafe(`
    SELECT title, domain, ts_rank("searchVector", plainto_tsquery('english', $1)) as rank
    FROM "Issue"
    WHERE "searchVector" @@ plainto_tsquery('english', $1)
    ORDER BY rank DESC
    LIMIT 3;
  `, query);
  
  keywordResults.forEach((r, i) => {
    console.log(`${i + 1}. [${r.domain}] ${r.title} (Score: ${r.rank.toFixed(4)})`);
  });

  // 2. Semantic Search (pgvector)
  console.log('\n--- SEMANTIC RESULTS (vector similarity) ---');
  const queryVector = await getQueryEmbedding(query);
  const semanticResults = await prisma.$queryRawUnsafe(`
    SELECT title, domain, 1 - ("embedding" <=> $1::vector) as similarity
    FROM "Issue"
    WHERE "embedding" IS NOT NULL
    ORDER BY similarity DESC
    LIMIT 3;
  `, `[${queryVector.join(',')}]`);

  semanticResults.forEach((r, i) => {
    const score = r.similarity !== null && r.similarity !== undefined ? r.similarity.toFixed(4) : "0.0000";
    console.log(`${i + 1}. [${r.domain}] ${r.title} (Similarity: ${score})`);
  });
}

const query = process.argv[2] || "Agricultural debt and farmer suicide";
search(query)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
