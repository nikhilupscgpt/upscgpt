// Serialise data for a <script type="application/ld+json"> block.
// Escaping "<" stops scraped or AI text from closing the script tag (stored XSS).
export function safeJsonLd(data) {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
