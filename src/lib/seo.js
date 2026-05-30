/**
 * SEO Utility Functions
 */

/**
 * Strips HTML tags from a string and normalizes whitespace.
 * Useful for extracting plain text descriptions from HTML content blocks.
 * @param {string} html 
 * @returns {string}
 */
export function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '') // Strip html tags
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * Strips Markdown syntax from a string.
 * @param {string} markdown 
 * @returns {string}
 */
export function stripMarkdown(markdown) {
  if (!markdown) return '';
  return markdown
    .replace(/#+\s+/g, '') // Headers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/[*_`~]/g, '') // Bold, italic, code, strike
    .replace(/-\s+/g, '') // Lists
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Safely parses the news streak livingSummary JSON string.
 * @param {string} summaryStr 
 * @param {string} fallbackTitle
 * @returns {{causes: string, impact: string, tracker: string}}
 */
export function parseLivingSummary(summaryStr, fallbackTitle = '') {
  const fallback = {
    causes: fallbackTitle ? `Causes and background of ${fallbackTitle}.` : '',
    impact: fallbackTitle ? `Impact assessment of ${fallbackTitle}.` : '',
    tracker: fallbackTitle ? `Key tracker metrics for ${fallbackTitle}.` : '',
  };

  if (!summaryStr) return fallback;

  try {
    const parsed = JSON.parse(summaryStr);
    return {
      causes: parsed.causes || parsed.background || fallback.causes,
      impact: parsed.impact || fallback.impact,
      tracker: parsed.tracker || fallback.tracker,
    };
  } catch (e) {
    // If it's not a JSON string, it might be raw markdown from legacy database entries
    console.warn("Failed to parse livingSummary JSON, treating as raw text/markdown:", e.message);
    return {
      causes: summaryStr,
      impact: fallback.impact,
      tracker: fallback.tracker,
    };
  }
}
