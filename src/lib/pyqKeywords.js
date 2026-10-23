/**
 * Shared Keyword & Concept Normalization Utility for PYQ Engine
 * Safe for both Client Components and Server Routes (zero Node-only dependencies).
 */

export function cleanKeywordText(str) {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[*~_]/g, '').trim();
}

export function slugifyKeyword(str) {
  const cleaned = cleanKeywordText(str).toLowerCase();
  if (!cleaned) return '';
  return cleaned
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

/**
 * Extracts base search term without parenthetical qualifiers for broader PYQ matching
 * e.g., "Article 394 (Commencement)" -> "Article 394"
 *       "Constitution Day (Samvidhan Diwas)" -> "Constitution Day"
 */
export function getBaseKeywordTerm(term) {
  const cleaned = cleanKeywordText(term);
  if (!cleaned) return '';
  const withoutParens = cleaned.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  return withoutParens.length >= 3 ? withoutParens : cleaned;
}

/**
 * Parses any raw keyword item (legacy string, legacy { concept, isDistractor },
 * or new { term, shortNote, longContent }) into a canonical Concept object.
 * Returns null if the item is a distractor or empty.
 */
export function parseKeywordItem(kw) {
  if (!kw) return null;

  if (typeof kw === 'object') {
    if (kw.isDistractor === true) return null;
    const rawCheck = String(kw.term || kw.concept || '');
    if (
      rawCheck.toLowerCase().includes('(distractor)') ||
      rawCheck.trim().startsWith('~~')
    ) {
      return null;
    }
  } else if (typeof kw === 'string') {
    if (
      kw.toLowerCase().includes('(distractor)') ||
      kw.trim().startsWith('~~')
    ) {
      return null;
    }
  } else {
    return null;
  }

  let term = '';
  let shortNote = '';
  let longContent = '';

  if (typeof kw === 'object' && kw !== null) {
    longContent = cleanKeywordText(kw.longContent || kw.studyNote || '');

    if (kw.term && String(kw.term).trim()) {
      term = cleanKeywordText(String(kw.term));
      shortNote = cleanKeywordText(
        String(kw.shortNote || kw.description || kw.note || '')
      );
      // If shortNote wasn't explicitly set but concept has "Term: Note"
      if (!shortNote && kw.concept && String(kw.concept).includes(':')) {
        const rawConcept = cleanKeywordText(String(kw.concept));
        const colonIdx = rawConcept.indexOf(':');
        if (colonIdx > 0) {
          shortNote = rawConcept.slice(colonIdx + 1).trim();
        }
      }
    } else if (kw.concept && String(kw.concept).trim()) {
      const rawConcept = cleanKeywordText(String(kw.concept));
      const colonIdx = rawConcept.indexOf(':');
      if (colonIdx > 0 && colonIdx < 110) {
        term = rawConcept.slice(0, colonIdx).trim();
        shortNote =
          cleanKeywordText(String(kw.shortNote || kw.description || '')) ||
          rawConcept.slice(colonIdx + 1).trim();
      } else {
        term = rawConcept;
        shortNote = cleanKeywordText(
          String(kw.shortNote || kw.description || '')
        );
      }
    }
  } else if (typeof kw === 'string') {
    const rawConcept = cleanKeywordText(kw);
    const colonIdx = rawConcept.indexOf(':');
    if (colonIdx > 0 && colonIdx < 110) {
      term = rawConcept.slice(0, colonIdx).trim();
      shortNote = rawConcept.slice(colonIdx + 1).trim();
    } else {
      term = rawConcept;
    }
  }

  if (!term) return null;

  const slug = slugifyKeyword(term);
  const conceptCombined = shortNote ? `${term}: ${shortNote}` : term;

  return {
    slug,
    term,
    shortNote,
    longContent,
    concept: conceptCombined,
    isDistractor: false,
  };
}

/**
 * Normalizes an array of raw keyword items into clean canonical Concept objects,
 * deduplicating by slug.
 */
export function normalizeKeywordsList(rawKeywords) {
  if (!Array.isArray(rawKeywords)) return [];
  const seen = new Set();
  const result = [];

  for (const item of rawKeywords) {
    const parsed = parseKeywordItem(item);
    if (!parsed || !parsed.slug) continue;
    if (seen.has(parsed.slug)) continue;
    seen.add(parsed.slug);
    result.push(parsed);
  }

  return result;
}
