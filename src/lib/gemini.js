import { GoogleGenAI } from '@google/genai'

/**
 * Gemini / Gemma AI Model Utility
 *
 * QUOTA SEPARATION STRATEGY
 * ─────────────────────────────────────────────
 * Gemma models run on a COMPLETELY SEPARATE quota from Gemini models.
 * Using Gemma does not consume any Gemini quota.
 *
 * Task routing:
 *  ┌──────────────┬─────────────────────┬─────────────────────────┐
 *  │ background    │ Gemma 3 27B-IT      │ News enrichment (high vol.) │
 *  │ extraction    │ Gemma 3 27B-IT      │ Quiz MCQ generation         │
 *  │ chat          │ Gemma 4 26B-IT      │ Nano assistant chat         │
 *  │ analysis      │ Gemini 2.5 Flash    │ Node/Region explainer       │
 *  └──────────────┴─────────────────────┴─────────────────────────┘
 *
 * Override per-environment via .env:
 *   GEMINI_BACKGROUND_MODEL=gemma-3-27b-it
 *   GEMINI_EXTRACTION_MODEL=gemma-3-27b-it
 *   GEMINI_CHAT_MODEL=gemma-4-26b-it
 *   GEMINI_ANALYSIS_MODEL=gemini-2.5-flash
 */

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null
  return new GoogleGenAI({ apiKey })
}

// Primary model candidates per task — listed in priority order.
// All share the same GEMINI_API_KEY; Gemma and Gemini models are
// independently rate-limited on Google AI Studio.
const FALLBACK_MODEL_CHAIN = {
  // High-volume background tasks: Gemma 3 27B (15K TPM, 14.4K RPD, free quota)
  background: ['gemma-3-27b-it', 'gemma-3-12b-it', 'gemini-2.0-flash'],

  // Structured JSON extraction (quiz, seed scripts): same Gemma 3 pool
  extraction: ['gemma-3-27b-it', 'gemma-3-12b-it', 'gemini-2.0-flash'],

  // Conversational chat (Nano Assistant): Gemma 3 27B — high quality, separate quota
  chat: ['gemma-3-27b-it', 'gemma-2-27b-it', 'gemini-2.0-flash'],

  // Deep analysis (Node Explainer, Region Tutor): needs long context + reasoning
  analysis: ['gemini-2.5-flash', 'gemini-2.0-flash'],
}

function uniqueNonEmpty(values) {
  return [...new Set(values.filter(Boolean).map((value) => String(value).trim()))]
}

function resolveModelCandidates(taskType) {
  const defaultModel = process.env.GEMINI_MODEL

  // Per-task env overrides — set these in .env to tune per environment
  const envOverrides = {
    background: process.env.GEMINI_BACKGROUND_MODEL,
    extraction: process.env.GEMINI_EXTRACTION_MODEL,
    chat:       process.env.GEMINI_CHAT_MODEL,
    analysis:   process.env.GEMINI_ANALYSIS_MODEL,
  }

  const taskOverride = envOverrides[taskType]
  const fallback = FALLBACK_MODEL_CHAIN[taskType] || FALLBACK_MODEL_CHAIN.extraction
  return uniqueNonEmpty([taskOverride, defaultModel, ...fallback])
}

/**
 * Returns the appropriate AI model adapter for a specific task type.
 * @param {('background'|'extraction'|'chat'|'analysis')} taskType
 * @returns {{ generateContent: (contents: string) => Promise<any> } | null}
 */
export const getGeminiModel = (taskType = 'extraction') => {
  const client = getClient()
  if (!client) return null

  const modelCandidates = resolveModelCandidates(taskType)

  return {
    // Backward-compatible adapter: existing call sites use .generateContent(promptText)
    async generateContent(contents) {
      let lastError = null

      for (const model of modelCandidates) {
        try {
          const result = await client.models.generateContent({ model, contents })
          // Log model used so we can monitor which quota pool is being hit
          if (process.env.NODE_ENV !== 'production') {
            console.log(`[AI] Task="${taskType}" model="${model}" ✓`)
          }
          return result
        } catch (error) {
          console.warn(`[AI] Task="${taskType}" model="${model}" failed: ${error?.message}`)
          lastError = error
        }
      }

      throw (
        lastError ||
        new Error(`All model candidates exhausted for task "${taskType}": ${modelCandidates.join(', ')}`)
      )
    },
  }
}

export const generateEmbedding = async (text) => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured')

  const client = new GoogleGenAI(apiKey)
  const model = client.getGenerativeModel({ model: 'text-embedding-004' })

  const result = await model.embedContent(text)
  return result.embedding.values
}

export default getGeminiModel
