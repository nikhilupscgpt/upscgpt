/**
 * Unified AI Interface for UPSC Atlas Portal
 *
 * generateJSON is used by the quiz route for MCQ generation.
 * It delegates to getGeminiModel('extraction') → Gemma 3 27B
 * (separate quota from Gemini, effectively free).
 *
 * Fallback: Ollama local model if all cloud providers fail.
 */

import { getGeminiModel } from '@/lib/gemini'

function safeJsonParse(text) {
  try {
    // 1. Strip markdown fences
    let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // 2. Find the first '{' or '[' and the last '}' or ']'
    const startIdx = Math.min(
      clean.indexOf('{') === -1 ? Infinity : clean.indexOf('{'),
      clean.indexOf('[') === -1 ? Infinity : clean.indexOf('[')
    );
    const endIdx = Math.max(
      clean.lastIndexOf('}'),
      clean.lastIndexOf(']')
    );

    if (startIdx !== Infinity && endIdx !== -1) {
      clean = clean.substring(startIdx, endIdx + 1);
    }

    return JSON.parse(clean);
  } catch (err) {
    console.error("[AI] JSON Parse failed for text:", text.slice(0, 100));
    throw new Error("Invalid AI response format");
  }
}

export async function generateJSON(prompt, systemInstruction = '', retryCount = 0) {
  // 1. Try via centralized model library (Gemma 3 27B → fallback chain)
  const model = getGeminiModel('extraction')
  if (model) {
    try {
      const fullPrompt = systemInstruction
        ? `${systemInstruction}\n\nTask: ${prompt}\n\nReturn ONLY valid JSON, no markdown fences.`
        : prompt

      const response = await model.generateContent(fullPrompt)
      const text = (typeof response.text === 'function' ? response.text() : response.text || '').trim()
      return safeJsonParse(text)
    } catch (e) {
      if (retryCount < 2) {
        console.warn(`[AI] Retry ${retryCount + 1} for: ${prompt.slice(0, 30)}...`)
        return generateJSON(prompt, systemInstruction, retryCount + 1)
      }
      console.warn(`[AI] Cloud provider failed after retries:`, e.message)
    }
  }

  // 2. Fallback: Ollama (local) - Skips in production to avoid hanging requests
  const ollamaUrl = process.env.OLLAMA_HOST
  if (process.env.NODE_ENV === 'production' || !ollamaUrl) {
    if (!model) throw new Error('No AI provider available. Check GEMINI_API_KEY.')
    return // Skip Ollama fallback
  }

  try {
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || 'gemma2',
        prompt: `${systemInstruction}\n\nTask: ${prompt}\n\nReturn ONLY the JSON object.`,
        format: 'json',
        stream: false
      })
    })

    if (response.ok) {
      const data = await response.json()
      return safeJsonParse(data.response)
    }
  } catch (e) {
    console.error('[AI] Ollama fallback also failed:', e.message)
  }

  throw new Error('No AI provider available. Check GEMINI_API_KEY or Ollama setup.')
}
