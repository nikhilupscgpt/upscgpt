import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const OLLAMA_HOST = 'http://localhost:11434';
const GENERATION_MODEL = 'gemma4:e4b';
const EMBEDDING_MODEL = 'nomic-embed-text';

async function generateMetadata(node) {
  const start = Date.now();
  const prompt = `You are building a UPSC preparation knowledge base. For the syllabus node '${node.title}' under domain '${node.domain}', paper '${node.gsPapers.join(', ')}': Generate a JSON with — 5 keyThemes (specific UPSC concepts), 5 subtopics, 3 linkedConcepts, 3 pyqAngles (typical Mains exam question framings), examRelevance (High/Medium/Low). Return only valid JSON, no explanation.`;

  try {
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
      console.error(`Ollama error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    const end = Date.now();
    console.log(`  - Generation took: ${((end - start) / 1000).toFixed(2)}s`);
    return JSON.parse(data.response);
  } catch (e) {
    console.error(`Fetch error: ${e.message}`);
    return null;
  }
}

async function main() {
  const node = await prisma.issue.findFirst({
    where: {
      metadata: { equals: null }
    }
  });

  if (!node) {
    console.log('No nodes without metadata found.');
    return;
  }

  console.log(`Testing Node: ${node.title}`);
  const metadata = await generateMetadata(node);
  if (metadata) {
    console.log('Metadata generated successfully.');
    console.log(JSON.stringify(metadata, null, 2));
  } else {
    console.log('Metadata generation failed.');
  }
}

main().finally(() => prisma.$disconnect());
