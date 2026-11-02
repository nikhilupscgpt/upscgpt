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

const GENERIC_CONTEXT_PATTERNS = /^(?:india|the constitution of india|constitution of india|indian constitution|indian polity|the indian polity|polity|indian history|the history of india|history of india|ancient india|medieval india|modern india|indian economy|the indian economy|economy|the union government|union government|the government of india|government of india|general|miscellaneous|the following|above statements?|following statements?|following pairs?)$/i;

function cleanEntityPhrase(phrase) {
  if (!phrase) return '';
  return phrase
    .replace(/^(?:the|a|an)\s+/i, '')
    .replace(/['"“”‘’`]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[,:;.\-]+$/, '')
    .trim();
}

/**
 * Extracts the core subject/concept entity from a Prelims PYQ question object
 * so <title> tags and schema headings front-load the actual entity tested
 * rather than generic UPSC stem openers like "Consider the following statements".
 * @param {object} q
 * @returns {string}
 */
export function extractCoreSubjectEntity(q) {
  if (!q) return 'UPSC Prelims';
  const stem = (q.stem || '').replace(/\s+/g, ' ').trim();
  const topic =
    q.srcTopic && !/^(general|miscellaneous|other)$/i.test(q.srcTopic.trim())
      ? q.srcTopic.trim()
      : '';
  const subject = (q.srcSubject || 'UPSC Prelims').trim();

  // 1. Check structured analysis keywords/theme if available
  let analysisObj = q.analysis || null;
  if (!analysisObj && typeof q.explanation === 'string' && q.explanation.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(q.explanation.trim());
      analysisObj = parsed.analysis || parsed;
    } catch {
      // ignore
    }
  }
  if (analysisObj) {
    if (analysisObj.themeInfo?.theme) {
      const th = cleanEntityPhrase(String(analysisObj.themeInfo.theme));
      if (th.length >= 3 && th.length <= 60 && !GENERIC_CONTEXT_PATTERNS.test(th)) {
        return th;
      }
    }
    if (Array.isArray(analysisObj.keywords) && analysisObj.keywords.length > 0) {
      const firstKw = analysisObj.keywords[0];
      const rawKw = typeof firstKw === 'string' ? firstKw.split(':')[0] : (firstKw?.term || firstKw?.concept?.split(':')[0]);
      const cleanedKw = cleanEntityPhrase(String(rawKw || ''));
      if (cleanedKw.length >= 3 && cleanedKw.length <= 60 && !GENERIC_CONTEXT_PATTERNS.test(cleanedKw)) {
        return cleanedKw;
      }
    }
  }

  // 2. Extract specific named entity from common UPSC stem framing patterns
  const refPatterns = [
    /^With reference to\s+([^,:;\n]{3,75}?),\s*(?:consider|which|what|who|how)/i,
    /^In the context of\s+(?:Indian history|India|Indian Polity|Indian Economy)?[, ]*(?:the\s+)?(?:principle of\s+|term\s+)?['"“‘]?([^,:;\n?'”’]{3,65})['"”’]?\s*(?:refers to|means|consider|which)/i,
    /^In the context of\s+([^,:;\n]{3,75}?),\s*(?:consider|which|what|who|how)/i,
    /^Consider the following statements\s+(?:with reference to|with regard to|regarding|about|in respect of|in relation to|pertaining to|on)\s+([^:.\n]{3,75}?)[:.]/i,
    /^Which (?:one )?of the following statements (?:relating to|regarding|about|with reference to|with respect to)\s+([^?.\n]{3,75}?)\s+(?:is\/are|is|are)\b/i,
    /^Which (?:one )?of the following (?:is\/are )?(?:regarded as )?(?:the )?(?:main |chief |best )?(?:features?|purpose|objectives?|safeguards?|functions?|implications?) of (?:the )?['"“‘]?([^?.\n'”’]{3,55})['"”’]?/i,
    /^The provisions of\s+([^,.\n]{3,65}?)\s+in the Constitution/i,
    /^The\s+([A-Z][^,.\n]{3,55}?(?:Act|Schedule|Mission|Council|Movement|Treaty|Doctrine|Preamble|Amendment|Committee|Commission)[^,.\n]{0,25}?)[,\s]+(?:was|is|are|refers|amends|enacted)/i,
    /^['"“‘]?([A-Z][A-Za-z0-9\s\-()]{2,50}?)['"”’]?\s+(?:refers to|means|is defined as|can be best explained as|as one of the objectives)/i,
  ];

  for (const pat of refPatterns) {
    const m = stem.match(pat);
    if (m && m[1]) {
      const candidate = cleanEntityPhrase(m[1]);
      if (
        candidate.length >= 3 &&
        candidate.length <= 68 &&
        !GENERIC_CONTEXT_PATTERNS.test(candidate)
      ) {
        return candidate;
      }
    }
  }

  // 3. Fallback to canonical Topic or Subject
  return topic || subject;
}

/**
 * Strips repetitive UPSC opening boilerplate ("Consider the following statements",
 * "With reference to the Constitution of India...", statement numbers, and trailing
 * code instructions) to surface the substantive question hook.
 * @param {string} stemRaw
 * @returns {string}
 */
export function stripBoilerplateFromStem(stemRaw) {
  if (!stemRaw) return '';
  let s = stemRaw.replace(/\s+/g, ' ').trim();

  const stripRules = [
    /^With reference to\s+[^,:\n]{2,85}?,\s*consider the following\s+(?:statements|pairs|items|information|organizations|bodies|provisions|rows)\s*[:.\-]*\s*/i,
    /^In the context of\s+[^,:\n]{2,85}?,\s*consider the following\s+(?:statements|pairs|items|information)\s*[:.\-]*\s*/i,
    /^Consider the following statements\s*(?:with reference to|with regard to|regarding|about|in respect of|in relation to|pertaining to|on)?\s*[^:.\n]{0,85}?[:.]\s*/i,
    /^Consider the following\s+(?:statements|pairs|items|information|organizations|bodies|provisions|subjects[^:.\n]*)\s*[:.\-]*\s*/i,
    /^(?:With reference to|In the context of)\s+(?:India|the Indian Polity|Indian Polity|the Constitution of India|Constitution of India|Indian history|the Indian Economy|Indian Economy|the Union Government|Polity),\s*/i,
    /^Which (?:one )?of the following (?:statements |factors |provisions |principles |objectives )?(?:is\/are |are |is )?(?:regarded as |widely believed to be )?(?:best )?(?:reflects|describes|defines|constitutes|is\/are correct|are correct|is correct)?\s*(?:about|regarding|with reference to|with respect to|in respect of|relating to)?\s*(?:the\s+)?/i,
  ];

  for (const rule of stripRules) {
    const next = s.replace(rule, '').trim();
    if (next.length >= 12) {
      s = next;
    }
  }

  // Strip leading statement markers like "Statement-I:", "Statement I:", "1.", "I."
  s = s.replace(/^(?:Statement[\s\-]*(?:I|1)\s*[:.\-]?|(?:1|I)\s*[.)])\s*/i, '').trim();

  // Strip secondary numbered statements ("2. ...", "Statement-II: ...", "II. ...") so the hook stays focused
  s = s.replace(/\s+(?:Statement[\s\-]*(?:II|2)\s*[:.\-]|(?:2|II)\s*[.)])\s+.*$/i, '').trim();

  // Strip trailing boilerplate directives and dangling punctuation
  s = s
    .replace(
      /\s*(?:Which of the statements given above|Which one of the following is correct in respect of|Select the correct answer using the code|How many of the above|How many of the statements).*$/i,
      ''
    )
    .replace(/[,:;.\-]+$/, '')
    .trim();

  return s;
}

/**
 * Generates an SEO-optimized <title> string for Prelims PYQ pages that
 * front-loads the core subject entity and substantive hook instead of
 * repeating generic opening phrases like "Consider the following statements".
 * Note: Root layout appends " | UPSCGPT" via title.template.
 * @param {object} q
 * @returns {string}
 */
export function buildPyqSeoTitle(q) {
  if (!q) return 'UPSC Prelims Solved PYQ';
  const entity = extractCoreSubjectEntity(q);
  const hook = stripBoilerplateFromStem(q.stem || '');
  const examShort = (q.examName || 'UPSC')
    .replace(/UPSC\s+CSE\s+Pre(?:lims)?/i, 'UPSC Prelims')
    .trim();
  const examTag = `${examShort} ${q.examYear || ''} PYQ`.replace(/\s+/g, ' ').trim();

  let coreText = '';
  if (entity && hook) {
    const cleanHookStart = hook.replace(/^(?:the|a|an)\s+/i, '');
    const normEntity = entity.toLowerCase().replace(/[^a-z0-9]+/g, '');
    const normHookStart = cleanHookStart.toLowerCase().replace(/[^a-z0-9]+/g, '');
    if (normHookStart.startsWith(normEntity)) {
      coreText = cleanHookStart.charAt(0).toUpperCase() + cleanHookStart.slice(1);
    } else {
      const capHook = hook.charAt(0).toUpperCase() + hook.slice(1);
      coreText = `${entity}: ${capHook}`;
    }
  } else {
    coreText = entity || hook || 'UPSC Prelims Solved Question';
  }

  const maxCoreLen = 82;
  const trimmedCore =
    coreText.length > maxCoreLen
      ? coreText.slice(0, maxCoreLen).replace(/\s+\S*$/, '') + '…'
      : coreText;

  return `${trimmedCore} | ${examTag}`;
}

/**
 * Extracts plain-text explanation content from a question (handling both plain text
 * and JSON-encoded deep-dive payloads) and strips direct answer-key giveaways.
 * @param {object} q
 * @returns {string}
 */
function extractCleanExplanationBody(q) {
  if (!q) return '';
  let rawExp = q.explanation || '';
  let analysisObj = q.analysis || null;

  if (typeof rawExp === 'string') {
    const trimmed = rawExp.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        analysisObj = parsed.analysis || parsed;
        rawExp = typeof parsed.explanation === 'string' ? parsed.explanation : '';
      } catch {
        rawExp = '';
      }
    }
  }

  if (!rawExp && analysisObj) {
    if (typeof analysisObj.coreTakeaway === 'string') {
      rawExp = analysisObj.coreTakeaway;
    } else if (Array.isArray(analysisObj.statementBreakdown) && analysisObj.statementBreakdown[0]?.explanation) {
      rawExp = analysisObj.statementBreakdown[0].explanation;
    } else if (Array.isArray(analysisObj.optionBreakdown) && analysisObj.optionBreakdown[0]?.explanation) {
      rawExp = analysisObj.optionBreakdown[0].explanation;
    }
  }

  return stripMarkdown(stripHtml(String(rawExp || '')))
    // Strip direct answer-key giveaway prefixes so SERP snippets don't leak the option letter
    .replace(/^(?:Official\s+)?(?:Correct\s+)?Answer\s*(?:Key)?\s*[:\-–]\s*\(?[a-dA-D]\)?[^.]*\.\s*/i, '')
    .replace(/^Option\s*\(?[a-dA-D]\)?\s*is\s*(?:the\s*)?correct(?:\s*answer)?[.:]?\s*/i, '')
    .replace(/^Under the official.*?correct answer[.:]?\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Builds a brief, curiosity-gap teaser for QAPage JSON-LD `acceptedAnswer.text`
 * that prevents Google from rendering the complete answer in zero-click SERP
 * carousels (Q&A rich results / Education Q&A) and directs users to click through.
 * @param {object} q
 * @param {string} [canonicalUrl]
 * @returns {string}
 */
export function buildPyqSchemaTeaser(q, canonicalUrl = 'https://www.upscgpt.in/prelims/pyq') {
  const entity = extractCoreSubjectEntity(q);
  const examLabel = `${q?.examName || 'UPSC Prelims'} ${q?.examYear || ''}`.trim();
  const topicLabel = [q?.srcSubject, q?.srcTopic].filter(Boolean).join(' › ');
  const body = extractCleanExplanationBody(q);

  if (body && body.length > 25) {
    const snippet = body.length > 110
      ? body.slice(0, 110).replace(/\s+\S*$/, '') + '…'
      : body;
    return `Concept Focus (${entity}): ${snippet} [Read the verified ${examLabel} Official Answer Key, statement-by-statement elimination & Prelims notes on UPSCGPT: ${canonicalUrl}]`;
  }

  return `Concept Focus (${entity} — ${topicLabel || 'General Studies'}): Step-by-step statement elimination and verified ${examLabel} Official Answer Key available on UPSCGPT. Click to attempt this PYQ and view the full explanation: ${canonicalUrl}`;
}

/**
 * Builds a high-CTR meta description for Prelims PYQ pages without leaking
 * the final answer option letter in the SERP snippet.
 * @param {object} q
 * @returns {string}
 */
export function buildPyqMetaDescription(q) {
  const entity = extractCoreSubjectEntity(q);
  const hook = stripBoilerplateFromStem(q?.stem || '').slice(0, 95);
  const examLabel = `${q?.examName || 'UPSC Prelims'} ${q?.examYear || ''}`.trim();
  const topicLabel = [q?.srcSubject, q?.srcTopic].filter(Boolean).join(' – ');
  return `Practice ${examLabel} PYQ on ${entity} (${topicLabel}): "${hook}…" Verify with the official UPSC answer key, option elimination breakdown & syllabus notes on UPSCGPT.`;
}

