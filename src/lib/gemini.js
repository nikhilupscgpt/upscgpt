import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Gemini / Gemma AI Model Utility
 *
 * QUOTA SEPARATION STRATEGY
 * ─────────────────────────────────────────────
 * Task routing:
 *  ┌──────────────┬─────────────────────────────┬─────────────────────────┐
 *  │ synthesis     │ gemini-2.5-flash            │ Living Summary / Streak │
 *  │ background    │ gemma-4-26b-a4b-it          │ News enrichment         │
 *  │ extraction    │ gemma-4-26b-a4b-it          │ Metadata / Forge        │
 *  │ chat          │ gemma-4-26b-a4b-it          │ Nano assistant chat     │
 *  │ analysis      │ gemma-4-26b-a4b-it          │ Node/Detailed Forge     │
 *  └──────────────┴─────────────────────────────┴─────────────────────────┘
 */

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
};

const FALLBACK_MODEL_CHAIN = {
  // synthesis: Use Flash 2.5 for clean structured JSON output (Living Summary)
  synthesis:  ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemma-4-26b-a4b-it'],
  // Batch processing: Gemma 26B for high RPD quota
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
    // Standard text generation
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

    // JSON-forced generation — guarantees pure JSON output with no markdown fences or preamble.
    // Uses responseMimeType: 'application/json' at the API level.
    async generateContentJson(contents) {
      let lastError = null;

      for (const modelName of modelCandidates) {
        try {
          const model = client.getGenerativeModel({
            model: modelName,
            generationConfig: {
              responseMimeType: 'application/json',
            },
          });
          const result = await model.generateContent(contents);
          const response = await result.response;
          const rawText = response.text();

          if (process.env.NODE_ENV !== 'production') {
            console.log(`[AI JSON] Task="${taskType}" model="${modelName}" ✓`);
          }

          try {
            // First attempt: Direct parse (works when responseMimeType is fully respected)
            return JSON.parse(rawText);
          } catch (parseError) {
            console.warn(`[AI JSON] Model ${modelName} didn't return pure JSON, attempting regex extraction...`);
            // Second attempt: Fallback models (like Gemma) might wrap in markdown fences or add preamble
            const match = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            const cleanStr = match ? match[1] : rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            
            // Try to find the first '{' and last '}' if there's preamble/postamble
            const startIndex = cleanStr.indexOf('{');
            const endIndex = cleanStr.lastIndexOf('}');
            
            if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
              const substring = cleanStr.substring(startIndex, endIndex + 1);
              return JSON.parse(substring);
            }
            
            throw new Error(`Failed to parse extracted JSON from ${modelName}`);
          }
        } catch (error) {
          console.warn(`[AI JSON] Task="${taskType}" model="${modelName}" failed: ${error?.message}`);
          lastError = error;
        }
      }

      throw (
        lastError ||
        new Error(`All JSON model candidates exhausted for task "${taskType}": ${modelCandidates.join(', ')}`)
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
