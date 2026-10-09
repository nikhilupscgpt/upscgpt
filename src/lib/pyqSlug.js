/**
 * Utility for SEO & GEO-optimized question slugs.
 * Converts questions into high-CTR semantic slugs like:
 * /prelims/pyq/upsc-cse-pre-2014-if-a-wetland-of-international-importance-is-brought-under-the-montreux-record--ENV-UPSC-2014-07
 */

export function generateQuestionSlug(q) {
  if (!q) return '';
  
  // 1. Clean exam name (e.g. "UPSC CSE Pre" -> "upsc-cse-pre")
  const exam = (q.examName || 'upsc')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // 2. Exam Year
  const year = q.examYear || '';

  // 3. Question Stem keywords (first 12-14 meaningful words)
  const cleanStem = (q.stem || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 13)
    .join('-');

  // 4. Stable unique identifier suffix (dedupHash or ID)
  const key = q.dedupHash || q.id;

  if (!cleanStem) {
    return key;
  }

  const prefix = [exam, year, cleanStem].filter(Boolean).join('-');
  return `${prefix}--${key}`.replace(/--+/g, '--');
}

/**
 * Extracts the stable question key/hash from a slug.
 * Handles both:
 * - Semantic slug: "upsc-cse-pre-2014-if-a-wetland...--ENV-UPSC-2014-07" -> "ENV-UPSC-2014-07"
 * - Raw identifier: "ENV-UPSC-2014-07" -> "ENV-UPSC-2014-07"
 * - CUID: "cmuzobl8f03f6nf4sdnsbzb6x" -> "cmuzobl8f03f6nf4sdnsbzb6x"
 */
export function extractQuestionIdFromSlug(slug) {
  if (!slug) return '';
  const decoded = decodeURIComponent(slug);
  if (decoded.includes('--')) {
    const parts = decoded.split('--');
    return parts[parts.length - 1].trim();
  }
  return decoded.trim();
}
