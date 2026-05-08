import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const OLLAMA_HOST = 'http://localhost:11434';
const EMBEDDING_MODEL = 'nomic-embed-text';

async function getQueryEmbedding(query) {
  const start = Date.now();
  const response = await fetch(`${OLLAMA_HOST}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      prompt: query
    })
  });
  const data = await response.json();
  const end = Date.now();
  return { embedding: data.embedding, time: end - start };
}

async function search(query) {
  // --- WARM UP ---
  // The first query always has Prisma/Postgres connection overhead
  await prisma.issue.findFirst(); 

  console.log(`\n🔍 Searching for: "${query}"...`);

  // 1. Keyword Search (tsvector) - The V1 Primary Method
  const kwStart = Date.now();
  const keywordResults = await prisma.$queryRawUnsafe(`
    SELECT title, ts_rank("searchVector", plainto_tsquery('english', $1)) as rank
    FROM "Issue"
    WHERE "searchVector" @@ plainto_tsquery('english', $1)
    ORDER BY rank DESC
    LIMIT 3;
  `, query);
  const kwEnd = Date.now();
  console.log(`✅ Keyword Search (DB): ${kwEnd - kwStart}ms`);

  // 2. Semantic Search (pgvector) - The V2 Upgrade Path
  const embedStart = Date.now();
  const { embedding, time: embedTime } = await getQueryEmbedding(query);
  const semanticResults = await prisma.$queryRawUnsafe(`
    SELECT title, 1 - ("embedding" <=> $1::vector) as similarity
    FROM "Issue"
    WHERE "embedding" IS NOT NULL
    ORDER BY similarity DESC
    LIMIT 3;
  `, `[${embedding.join(',')}]`);
  const semanticEnd = Date.now();
  
  console.log(`✅ Embedding (Local Ollama): ${embedTime}ms`);
  console.log(`✅ Vector Search (DB): ${semanticEnd - embedStart - embedTime}ms`);
  console.log(`\n🚀 TOTAL Latency (Keyword V1): ${kwEnd - kwStart}ms`);
  console.log(`🚀 TOTAL Latency (Semantic V2): ${semanticEnd - kwStart}ms`);
}

async function main() {
  const query = process.argv[2] || "Climate change and farming";
  console.log(`\n🔍 Performance Test for: "${query}"`);
  
  // Warm up
  await prisma.issue.findFirst();

  for (let i = 1; i <= 3; i++) {
    console.log(`\n--- Iteration ${i} ---`);
    await search(query);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
