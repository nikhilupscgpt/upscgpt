// Serialise data for a <script type="application/ld+json"> block.
// Escaping "<" stops scraped or AI text from closing the script tag (stored XSS).
export function safeJsonLd(data) {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/ /g, '\\u2028')
    .replace(/ /g, '\\u2029');
}
