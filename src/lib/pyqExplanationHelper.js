/**
 * Helper to parse and extract structured analysis from question explanation.
 * Gracefully handles raw JSON strings pasted by admins/curators so the frontend
 * always renders rich Lecture-Grade Deep-Dives instead of raw JSON code.
 */
export function getStructuredExplanation(q) {
  if (!q) return { explanationText: null, analysis: null };

  let explanationText = q.explanation || null;
  let analysis = q.analysis || null;

  if (typeof explanationText === 'string') {
    const trimmed = explanationText.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.analysis && typeof parsed.analysis === 'object') {
          analysis = parsed.analysis;
        } else if (parsed.keywords || parsed.optionBreakdown || parsed.valueAddition) {
          analysis = parsed;
        }

        if (typeof parsed.explanation === 'string' && parsed.explanation.trim()) {
          explanationText = parsed.explanation;
        } else {
          // Clear explanationText so raw JSON string is never printed as text
          explanationText = null;
        }
      } catch (e) {
        // Keep raw text if not valid JSON
      }
    }
  }

  return { explanationText, analysis };
}
