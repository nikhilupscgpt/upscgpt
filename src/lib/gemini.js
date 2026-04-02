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

/**
 * Returns the optimized Gemini model for a specific task.
 * @param {('extraction'|'analysis'|'chat')} taskType 
 * @returns {any} The generative model instance
 */
export const getGeminiModel = (taskType = 'extraction') => {
  const client = getClient()
  if (!client) return null

  let modelName = 'gemini-1.5-flash' // Default safe/cheap model

  switch (taskType) {
    case 'analysis':
      // Use Pro for deep UPSC reasoning if needed, else stay on Flash for costs
      modelName = 'gemini-1.5-pro' 
      break
    case 'extraction':
    case 'chat':
    default:
      modelName = 'gemini-1.5-flash'
      break
  }

  return client.getGenerativeModel({ model: modelName })
}

export default getGeminiModel
