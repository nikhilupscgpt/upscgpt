/** Escape a value for safe interpolation into an HTML string (text or quoted attribute). */
export function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Return the URL only if it is an absolute http(s) URL, else ''. */
export function safeHttpUrl(value) {
  if (!value || typeof value !== 'string') return '';
  try {
    const u = new URL(value.trim());
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : '';
  } catch {
    return '';
  }
}
