/**
 * Single source of truth for provider unit prices (in integer paise).
 * AI token prices are specified in paise per 1,000,000 tokens.
 * Update here when provider pricing changes (see PRD Appendix A).
 */
export interface PriceEntry {
  unit: 'tokens_in' | 'tokens_out' | 'sms' | 'email' | 'whatsapp' | 'request' | 'gb';
  paisePerUnit?: number;
  paisePerMillion?: number;
}

export const PRICE_TABLE: Record<string, PriceEntry> = {
  // Messaging (paise per message)
  'msg91:sms': { unit: 'sms', paisePerUnit: 20 },          // ~₹0.20 / SMS
  'msg91:whatsapp': { unit: 'whatsapp', paisePerUnit: 85 }, // ~₹0.85 / utility/auth msg
  'resend:email': { unit: 'email', paisePerUnit: 8 },       // ~₹0.08 / email
  'smtp:email': { unit: 'email', paisePerUnit: 0 },
  'simulation:email': { unit: 'email', paisePerUnit: 0 },
  'simulation:sms': { unit: 'sms', paisePerUnit: 0 },
  'simulation:whatsapp': { unit: 'whatsapp', paisePerUnit: 0 },

  // Gemini / Gemma (paise per 1M tokens; ~85 INR/USD)
  'gemini:gemini-2.5-flash:tokens_in': { unit: 'tokens_in', paisePerMillion: 2550 },
  'gemini:gemini-2.5-flash:tokens_out': { unit: 'tokens_out', paisePerMillion: 21250 },
  'gemini:gemini-2.0-flash:tokens_in': { unit: 'tokens_in', paisePerMillion: 850 },
  'gemini:gemini-2.0-flash:tokens_out': { unit: 'tokens_out', paisePerMillion: 3400 },
  'gemini:gemma-3-27b-it:tokens_in': { unit: 'tokens_in', paisePerMillion: 0 },
  'gemini:gemma-3-27b-it:tokens_out': { unit: 'tokens_out', paisePerMillion: 0 },
  'gemini:text-embedding-004:tokens_in': { unit: 'tokens_in', paisePerMillion: 0 },
  'gemini:default:tokens_in': { unit: 'tokens_in', paisePerMillion: 850 },
  'gemini:default:tokens_out': { unit: 'tokens_out', paisePerMillion: 3400 },

  // OpenAI (paise per 1M tokens)
  'openai:gpt-4o-mini:tokens_in': { unit: 'tokens_in', paisePerMillion: 1275 },
  'openai:gpt-4o-mini:tokens_out': { unit: 'tokens_out', paisePerMillion: 5100 },
  'openai:default:tokens_in': { unit: 'tokens_in', paisePerMillion: 1275 },
  'openai:default:tokens_out': { unit: 'tokens_out', paisePerMillion: 5100 },

  // Local Ollama (self-hosted = 0 paise)
  'ollama:default:tokens_in': { unit: 'tokens_in', paisePerMillion: 0 },
  'ollama:default:tokens_out': { unit: 'tokens_out', paisePerMillion: 0 },

  // Search / News APIs
  'gnews:request': { unit: 'request', paisePerUnit: 0 },
  'newsdata:request': { unit: 'request', paisePerUnit: 0 },
};

export function estimateCostPaise(params: {
  provider: string;
  unit: string;
  quantity: number;
  model?: string | null;
  cacheHit?: boolean;
}): number {
  if (params.cacheHit) return 0;
  const qty = Number(params.quantity);
  if (!Number.isFinite(qty) || qty <= 0) return 0;

  const provider = params.provider.toLowerCase();
  const unit = params.unit.toLowerCase();
  const model = params.model ? params.model.toLowerCase() : null;

  const keysToTry = [
    ...(model ? [`${provider}:${model}:${unit}`] : []),
    `${provider}:default:${unit}`,
    `${provider}:${unit}`,
  ];

  for (const key of keysToTry) {
    const entry = PRICE_TABLE[key];
    if (!entry) continue;
    if (typeof entry.paisePerMillion === 'number') {
      return Math.round((qty / 1_000_000) * entry.paisePerMillion);
    }
    if (typeof entry.paisePerUnit === 'number') {
      return Math.round(qty * entry.paisePerUnit);
    }
  }

  return 0;
}
