import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Splits markdown/text into smaller chunks to fit embedding windows.
 * @param {string} text - The input text to chunk.
 * @param {number} chunkSize - Max characters per chunk.
 */
export function chunkText(text, chunkSize = 1500) {
  if (!text) return [];
  const paragraphs = text.split(/\n\s*\n/);
  const chunks = [];
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    if ((currentChunk.length + paragraph.length) > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
}

/**
 * Generates an embedding vector using Gemini's text-embedding-004.
 * @param {string} text 
 * @returns {Promise<number[]>}
 */
export async function generateEmbedding(text) {
  // Use embedding-001 as it has broader API support in this SDK version
  const model = genAI.getGenerativeModel({ model: "embedding-001" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

/**
 * Performs a vector similarity search in the database.
 * @param {number[]} embedding - The query embedding vector.
 * @param {string} subject - Optional filter by subject.
 * @param {string} examType - Optional filter by examType (PRELIMS/MAINS).
 * @param {number} limit - Number of results to return.
 * @returns {Promise<any[]>}
 */
export async function searchSimilarContent(embedding, subject = null, examType = null, limit = 5) {
  // We format the array to the vector string format pgvector expects: '[0.1, 0.2, ...]'
  const vectorStr = `[${embedding.join(',')}]`;

  // Prisma raw query using pgvector's <=> (cosine distance) operator.
  // Note: We use raw string interpolation cautiously here, but parameterized queries are preferred.
  // Prisma $queryRaw handles basic parameterized logic, but vector casting requires specific syntax.
  
  // Build dynamic conditions
  const conditions = [];
  if (subject) conditions.push(`subject = '${subject}'`);
  if (examType && examType !== 'BOTH') conditions.push(`("examType" = '${examType}' OR "examType" = 'BOTH')`);
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const results = await prisma.$queryRawUnsafe(`
      SELECT 
        id, 
        subject, 
        "examType", 
        title, 
        "contentMarkdown",
        "sourceUrl",
        1 - (embedding <=> $1::vector) as similarity
      FROM "SubjectContent"
      ${whereClause}
      ORDER BY embedding <=> $1::vector
      LIMIT ${limit}
    `, vectorStr);

    return results;
  } catch (error) {
    console.error("Vector search failed:", error);
    return [];
  }
}
