/**
 * UPSC Question Format Classification
 * Detects the modern 2022–2025 pattern:
 * - Pair-based elimination breaker ("Only one pair", "Only two pairs", "All three", "None")
 * - Statement-I & Statement-II (Assertion-Reason with modern 4-option code)
 * - Matching list questions
 */

export function isPairQuestion(q) {
  const s = q.stem || '';
  const optStr = Array.isArray(q.options)
    ? q.options.map(o => o.text).join(' ')
    : typeof q.options === 'string'
      ? q.options
      : JSON.stringify(q.options || '');

  return (
    /how many of the above (pairs|statements|is|are)/i.test(s) ||
    (/only one\b/i.test(optStr) && /only two\b/i.test(optStr))
  );
}

export function isStatementQuestion(q) {
  const s = q.stem || '';
  return /Statement[\s-]*(I|1)\b.*Statement[\s-]*(II|2)\b/i.test(s);
}

export function isMatchingQuestion(q) {
  const s = q.stem || '';
  return /Match List|List[\s-]*(I|1)\b/i.test(s);
}

export function isNewPatternQuestion(q) {
  return isPairQuestion(q) || isStatementQuestion(q);
}

export function getPatternType(q) {
  if (isPairQuestion(q)) return 'PAIR';
  if (isStatementQuestion(q)) return 'STATEMENT';
  if (isMatchingQuestion(q)) return 'MATCHING';
  return 'STANDARD';
}
