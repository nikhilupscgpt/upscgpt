import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Gemini / Gemma AI Model Utility
 *
 * QUOTA SEPARATION STRATEGY
 * ─────────────────────────────────────────────
 * Task routing (Optimized for Forge Batch):
 *  ┌──────────────┬─────────────────────────┬─────────────────────────┐
 *  │ background    │ gemma-4-26b-a4b-it      │ News enrichment         │
 *  │ extraction    │ gemma-4-26b-a4b-it      │ Metadata / Forge        │
 *  │ chat          │ gemma-4-26b-a4b-it      │ Nano assistant chat     │
 *  │ analysis      │ gemma-4-26b-a4b-it      │ Node/Detailed Forge     │
 *  └──────────────┴─────────────────────────┴─────────────────────────┘
 */

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
};

const FALLBACK_MODEL_CHAIN = {
  // PIVOT: Using Gemma 26B as Sole Primary to leverage 1.5K RPD and 15 RPM limit
  background: ['gemma-4-26b-a4b-it', 'gemini-1.5-flash'],
  extraction: ['gemma-4-26b-a4b-it', 'gemini-1.5-flash'],
  chat:       ['gemma-4-26b-a4b-it', 'gemini-1.5-flash'],
  analysis:   ['gemma-4-26b-a4b-it', 'gemini-1.5-flash'],
};

function uniqueNonEmpty(values) {
  return [...new Set(values.filter(Boolean).map((value) => String(value).trim()))];
}

function resolveModelCandidates(taskType) {
  const defaultModel = process.env.GEMINI_MODEL;
  const envOverrides = {
    background: process.env.GEMINI_BACKGROUND_MODEL,
    extraction: process.env.GEMINI_EXTRACTION_MODEL,
    chat:       process.env.GEMINI_CHAT_MODEL,
    analysis:   process.env.GEMINI_ANALYSIS_MODEL,
  };

  const taskOverride = envOverrides[taskType];
  const fallback = FALLBACK_MODEL_CHAIN[taskType] || FALLBACK_MODEL_CHAIN.extraction;
  return uniqueNonEmpty([taskOverride, defaultModel, ...fallback]);
}

export const getGeminiModel = (taskType = 'extraction') => {
  const client = getClient();
  if (!client) return null;

  const modelCandidates = resolveModelCandidates(taskType);

  return {
    async generateContent(contents) {
      let lastError = null;

      for (const modelName of modelCandidates) {
        try {
          const model = client.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(contents);
          const response = await result.response;
          
          if (process.env.NODE_ENV !== 'production') {
            console.log(`[AI] Task="${taskType}" model="${modelName}" ✓`);
          }
          
          return {
            text: () => response.text(),
            response: response
          };
        } catch (error) {
          console.warn(`[AI] Task="${taskType}" model="${modelName}" failed: ${error?.message}`);
          lastError = error;
        }
      }

      throw (
        lastError ||
        new Error(`All model candidates exhausted for task "${taskType}": ${modelCandidates.join(', ')}`)
      );
    },
  };
};

export const generateEmbedding = async (text) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({ model: 'gemini-embedding-2' });

  const result = await model.embedContent(text);
  return result.embedding.values;
};

export default getGeminiModel;
