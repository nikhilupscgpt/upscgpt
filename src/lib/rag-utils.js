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
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

/**
 * Generates an embedding vector using Ollama (primary) or Gemini (fallback).
 * @param {string} text 
 * @returns {Promise<number[]>}
 */
export async function generateEmbedding(text) {
  const ollamaUrl = process.env.OLLAMA_HOST;
  
  // 1. Primary Path: Local Ollama (Zero Cost, No latency to cloud)
  if (ollamaUrl) {
    try {
      const formattedUrl = ollamaUrl.startsWith('http') ? ollamaUrl : `http://${ollamaUrl}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // Strict timeout for speed

      const response = await fetch(`${formattedUrl}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text',
          prompt: text,
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        return data.embedding;
      }
    } catch (err) {
      console.warn(`[RAG] Ollama connection skipped or timed out: ${err.message}.`);
    }
  }

  // 2. Secondary Path: Gemini 
  try {
    const model = genAI.getGenerativeModel({ model: "models/gemini-embedding-2" });
    const result = await model.embedContent({
      content: { parts: [{ text: text }] },
      outputDimensionality: 768
    });
    return result.embedding.values;
  } catch (err) {
    console.error(`[RAG] Gemini models/text-embedding-004 failed: ${err.message}`);
    // No more fallbacks - return empty to allow search API to continue with keyword-only
    throw new Error(`CRITICAL: All embedding services unavailable.`);
  }
}

/**
 * Performs a vector similarity search in the database.
 * @param {number[]} queryEmbedding - The query embedding vector.
 * @param {string} subject - Optional filter by subject.
 * @param {string} examType - Optional filter by examType (PRELIMS/MAINS).
 * @param {number} limit - Number of results to return.
 * @param {string|null} optionalId - Optional ID for optional subject filtering.
 * @returns {Promise<any[]>}
 */
export async function searchSimilarContent(queryEmbedding, subject, examType, limit = 5, optionalId = null, language = 'en', exam = 'BOTH') {
  const vectorStr = `[${queryEmbedding.join(',')}]`;
  
  let query = `
    SELECT id, title, subject, "examType", "contentMarkdown", "sourceUrl", 
           (embedding <=> $1::vector) as distance
    FROM "SubjectContent"
    WHERE 1=1
  `;
  const params = [vectorStr];

  if (subject && subject !== 'ALL') {
    params.push(subject);
    query += ` AND subject = $${params.length}`;
  }

  if (examType && examType !== 'BOTH') {
    params.push(examType);
    query += ` AND ("examType" = $${params.length} OR "examType" = 'BOTH')`;
  }

  if (optionalId) {
    params.push(optionalId);
    query += ` AND "optionalId" = $${params.length}`;
    query += ` AND "isOptional" = true`;
  } else {
    query += ` AND "isOptional" = false`;
  }

  if (language) {
    params.push(language);
    query += ` AND language = $${params.length}`;
  }

  if (exam && exam !== 'BOTH') {
    params.push(exam);
    query += ` AND (exam = $${params.length} OR exam = 'BOTH')`;
  }

  query += ` ORDER BY distance ASC LIMIT $${params.length + 1}`;
  params.push(limit);

  try {
    return await prisma.$queryRawUnsafe(query, ...params);
  } catch (error) {
    console.error("Vector search failed:", error);
    return [];
  }
}

/**
 * Performs a vector similarity search for Previous Year Questions.
 */
export async function searchSimilarPYQs(queryEmbedding, subject, optionalId = null, limit = 3, language = 'en', exam = 'UPSC') {
  const vectorStr = `[${queryEmbedding.join(',')}]`;
  
  let query = `
    SELECT id, year, paper, subject, "questionText", marks,
           (embedding <=> $1::vector) as distance
    FROM "PreviousYearQuestion"
    WHERE 1=1
  `;
  const params = [vectorStr];

  if (optionalId) {
    params.push(optionalId);
    query += ` AND "optionalId" = $${params.length}`;
  } else if (subject && subject !== 'ALL') {
    params.push(subject);
    query += ` AND subject = $${params.length}`;
  }

  if (language) {
    params.push(language);
    query += ` AND language = $${params.length}`;
  }

  if (exam && exam !== 'BOTH') {
    params.push(exam);
    query += ` AND (exam = $${params.length} OR exam = 'BOTH')`;
  }

  // We use a slightly stricter threshold for PYQs to avoid irrelevant matches
  query += ` AND (embedding <=> $1::vector) < 0.6`;
  query += ` ORDER BY distance ASC LIMIT $${params.length + 1}`;
  params.push(limit);

  try {
    return await prisma.$queryRawUnsafe(query, ...params);
  } catch (error) {
    console.error("PYQ search failed:", error);
    return [];
  }
}
