import { GoogleGenAI } from '@google/genai'

/**
 * Gemini AI Model Utility
 * Centralizes model selection and client management for cost optimization.
 */

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null
  return new GoogleGenAI({ apiKey })
}

const FALLBACK_MODEL_CHAIN = {
  extraction: ['gemini-2.5-flash', 'gemini-1.5-flash'],
  chat: ['gemini-2.5-flash', 'gemini-1.5-flash'],
  analysis: ['gemini-2.5-flash', 'gemini-1.5-flash'],
}

function uniqueNonEmpty(values) {
  return [...new Set(values.filter(Boolean).map((value) => String(value).trim()))]
}

function resolveModelCandidates(taskType) {
  const defaultModel = process.env.GEMINI_MODEL
  const taskOverride =
    taskType === 'analysis'
      ? process.env.GEMINI_ANALYSIS_MODEL
      : taskType === 'chat'
        ? process.env.GEMINI_CHAT_MODEL
        : process.env.GEMINI_EXTRACTION_MODEL

  const fallback = FALLBACK_MODEL_CHAIN[taskType] || FALLBACK_MODEL_CHAIN.extraction
  return uniqueNonEmpty([taskOverride, defaultModel, ...fallback])
}

/**
 * Returns the optimized Gemini model for a specific task.
 * @param {('extraction'|'analysis'|'chat')} taskType 
 * @returns {any} The generative model instance
 */
export const getGeminiModel = (taskType = 'extraction') => {
  const client = getClient()
  if (!client) return null

  const modelCandidates = resolveModelCandidates(taskType)

  return {
    // Backward-compatible adapter for existing call sites that expect:
    // getGeminiModel(...).generateContent(promptText)
    async generateContent(contents) {
      let lastError = null

      for (const model of modelCandidates) {
        try {
          return await client.models.generateContent({
            model,
            contents,
          })
        } catch (error) {
          lastError = error
        }
      }

      throw (
        lastError ||
        new Error(`Gemini request failed for task "${taskType}" with all model candidates`)
      )
    },
  }
}

export default getGeminiModel
