import { z } from 'zod';

const KeywordSchema = z.union([
  z.string(),
  z
    .object({
      slug: z.string().optional(),
      term: z.string(),
      shortNote: z.string().optional(),
      note: z.string().optional(),
    })
    .passthrough(),
]);

const BreakdownItemSchema = z
  .object({
    label: z.string().optional(),
    text: z.string().optional(),
    isCorrect: z.boolean().optional(),
    note: z.string().optional(),
  })
  .passthrough();

export const AnalysisSchema = z
  .object({
    coreTakeaway: z.string().nullish(),
    keywords: z.array(KeywordSchema).nullish().default([]),
    optionBreakdown: z.array(BreakdownItemSchema).nullish(),
    statementBreakdown: z.array(BreakdownItemSchema).nullish(),
    pairBreakdown: z.array(BreakdownItemSchema).nullish(),
    similarPyq: z.union([z.array(z.string()), z.record(z.string(), z.unknown())]).nullish(),
    inNews: z.union([z.string(), z.record(z.string(), z.unknown())]).nullish(),
    valueAddition: z.union([z.string(), z.array(z.unknown())]).nullish(),
    visualSuggestion: z.union([z.string(), z.record(z.string(), z.unknown())]).nullish(),
    reelData: z.unknown().nullish(),
  })
  .passthrough()
  .partial()
  .default({});

export const ExplanationSchema = z.object({
  explanation: z.string().nullish().transform((v) => v ?? ''),
  analysis: AnalysisSchema,
});

export type ExplanationData = z.infer<typeof ExplanationSchema>;

export function parseExplanationValue(raw: unknown): {
  ok: true;
  data: ExplanationData;
} | {
  ok: false;
  error: string;
} {
  if (raw === null || raw === undefined || raw === '') {
    return { ok: true, data: { explanation: '', analysis: {} } };
  }

  let candidate: unknown = raw;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) {
      return { ok: true, data: { explanation: '', analysis: {} } };
    }
    if (trimmed.startsWith('{')) {
      try {
        candidate = JSON.parse(trimmed);
      } catch (err: any) {
        return { ok: false, error: `Invalid JSON explanation: ${err?.message || 'parse error'}` };
      }
    } else {
      candidate = { explanation: trimmed, analysis: {} };
    }
  }

  const parsed = ExplanationSchema.safeParse(candidate);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || 'Invalid explanation schema' };
  }
  return { ok: true, data: parsed.data };
}

export function isExplanationPresent(data: ExplanationData | null | undefined): boolean {
  if (!data) return false;
  if (typeof data.explanation === 'string' && data.explanation.trim().length > 0) {
    return true;
  }
  const a = data.analysis || {};
  if (Array.isArray(a.optionBreakdown) && a.optionBreakdown.length > 0) return true;
  if (Array.isArray(a.statementBreakdown) && a.statementBreakdown.length > 0) return true;
  if (Array.isArray(a.pairBreakdown) && a.pairBreakdown.length > 0) return true;
  if (typeof a.coreTakeaway === 'string' && a.coreTakeaway.trim().length > 0) return true;
  return false;
}

export function hasCoreTakeaway(data: ExplanationData | null | undefined): boolean {
  const takeaway = data?.analysis?.coreTakeaway;
  return typeof takeaway === 'string' && takeaway.trim().length > 0;
}
