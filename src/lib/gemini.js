import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Gemini / Gemma AI Model Utility
 *
 * QUOTA SEPARATION STRATEGY
 * ─────────────────────────────────────────────
 * Task routing:
 *  ┌──────────────┬─────────────────────────────┬─────────────────────────┐
 *  │ synthesis     │ gemma-4-31b-it              │ Living Summary / Streak │
 *  │ background    │ gemma-4-31b-it              │ News enrichment         │
 *  │ extraction    │ gemma-4-31b-it              │ Metadata / Forge        │
 *  │ chat          │ gemma-4-31b-it              │ Nano assistant chat     │
 *  │ analysis      │ gemma-4-31b-it              │ Node/Detailed Forge     │
 *  └──────────────┴─────────────────────────────┴─────────────────────────┘
 */

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
};

const FALLBACK_MODEL_CHAIN = {
  // synthesis: Use Gemma 31B for high daily quota, fallback to Flash 2.5
  synthesis:  ['gemma-4-31b-it', 'gemini-2.5-flash', 'gemini-2.0-flash'],
  // Batch processing: Gemma 31B for high RPD quota
  background: ['gemma-4-31b-it', 'gemini-2.5-flash', 'gemini-2.0-flash'],
  extraction: ['gemma-4-31b-it', 'gemini-2.5-flash', 'gemini-2.0-flash'],
  chat:       ['gemma-4-31b-it', 'gemini-2.5-flash', 'gemini-2.0-flash'],
  analysis:   ['gemma-4-31b-it', 'gemini-2.5-flash', 'gemini-2.0-flash'],
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

function sanitizeJsonString(rawText) {
  if (!rawText) return '';
  let cleaned = rawText.trim();

  // 1. Extract content from markdown code block if present
  const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match) {
    cleaned = match[1].trim();
  } else {
    cleaned = cleaned.replace(/```json/g, '').replace(/```/g, '').trim();
  }

  // 2. Remove single-line comments (// ...) and block comments (/* ... */)
  cleaned = cleaned.replace(/\/\/.*$/gm, '');
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');

  // 3. Find the first '{' and last '}' to isolate the JSON object
  const startIndex = cleaned.indexOf('{');
  const endIndex = cleaned.lastIndexOf('}');
  if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
    cleaned = cleaned.substring(startIndex, endIndex + 1);
  }

  // 4. Escape raw newlines inside JSON string values.
  let inString = false;
  let result = '';
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    const prevChar = i > 0 ? cleaned[i - 1] : '';

    if (char === '"' && prevChar !== '\\') {
      inString = !inString;
      result += char;
    } else if (inString && (char === '\n' || char === '\r')) {
      result += char === '\n' ? '\\n' : '\\r';
    } else {
      result += char;
    }
  }

  return result;
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function callWithRetry(model, contents, maxRetries = 5) {
  let attempt = 0;
  while (true) {
    try {
      return await model.generateContent(contents);
    } catch (error) {
      attempt++;
      const isTransient = 
        error.status === 500 || 
        error.status === 503 || 
        error.status === 429 ||
        error.message?.includes('500') ||
        error.message?.includes('503') ||
        error.message?.includes('429');
      
      if (isTransient && attempt < maxRetries) {
        const waitTime = Math.min(attempt * 5000, 30000); // 5s, 10s, 15s, 20s... max 30s
        console.warn(`[AI Retry] Transient error (${error.status || error.message}) on attempt ${attempt}. Retrying in ${waitTime}ms...`);
        await delay(waitTime);
        continue;
      }
      throw error;
    }
  }
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
          const result = await callWithRetry(model, contents);
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
    async generateContentJson(contents, schema = null) {
      let lastError = null;

      for (const modelName of modelCandidates) {
        try {
          const generationConfig = {
            responseMimeType: 'application/json',
          };
          if (schema) {
            generationConfig.responseSchema = schema;
          }
          const model = client.getGenerativeModel({
            model: modelName,
            generationConfig,
          });
          const result = await callWithRetry(model, contents);
          const response = await result.response;
          const rawText = response.text();

          if (process.env.NODE_ENV !== 'production') {
            console.log(`[AI JSON] Task="${taskType}" model="${modelName}" ✓`);
          }

          try {
            // First attempt: Direct parse (works when responseMimeType is fully respected)
            return JSON.parse(rawText);
          } catch (parseError) {
            console.warn(`[AI JSON] Model ${modelName} didn't return pure JSON, attempting regex extraction & sanitization...`);
            
            const sanitized = sanitizeJsonString(rawText);
            if (sanitized) {
              try {
                return JSON.parse(sanitized);
              } catch (innerErr) {
                console.warn(`[AI JSON] Sanitized JSON parse also failed: ${innerErr.message}`);
              }
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
