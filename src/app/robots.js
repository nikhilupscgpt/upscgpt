export default function robots() {
  const disallowedPaths = ['/admin/', '/api/', '/profile/', '/_next/'];

  // AI model training scrapers that extract bulk datasets with 0 referral traffic
  const trainingScrapers = [
    'GPTBot',
    'ClaudeBot',
    'Amazonbot',
    'Meta-webindexer',
    'Bytespider',
    'CCBot',
    'cohere-ai',
    'Diffbot',
  ];

  // Live AI search, answer, and discovery engines (keep open for GEO citations & student traffic)
  const searchAndDiscoveryBots = [
    'Googlebot',
    'Bingbot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'PerplexityBot',
    'Applebot',
  ];

  return {
    rules: [
      // 1. Block bulk training extractors from consuming bandwidth & compute
      ...trainingScrapers.map(bot => ({
        userAgent: bot,
        disallow: '/',
      })),

      // 2. Allow real-time search & citation engines
      ...searchAndDiscoveryBots.map(bot => ({
        userAgent: bot,
        allow: '/',
        disallow: disallowedPaths,
      })),

      // 3. General fallback rules
      {
        userAgent: '*',
        allow: '/',
        disallow: disallowedPaths,
      },
    ],
    sitemap: 'https://www.upscgpt.in/sitemap.xml',
  };
}
