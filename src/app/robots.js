export default function robots() {
  // Block dynamic/interactive routes that would waste server compute or create infinite URL query permutations
  const disallowedPaths = [
    '/admin/',
    '/admin-login',
    '/api/',
    '/profile/',
    '/dashboard/',
    '/notes/',
    '/prelims/pyq/practice',
    '/search',
    '/_next/',
  ];

  // Aggressive SEO scrapers and bulk AI training crawlers that consume server compute with 0 user traffic
  const blockedCrawlers = [
    'AhrefsBot',
    'SemrushBot',
    'MJ12bot',
    'DotBot',
    'PetalBot',
    'BLEXBot',
    'DataForSeoBot',
    'ClaudeBot',
    'Amazonbot',
    'Meta-webindexer',
    'Bytespider',
    'CCBot',
    'cohere-ai',
    'Diffbot',
    'ImagesiftBot',
    'YouBot',
  ];

  // Live search, ChatGPT browsing & answer citation engines (allowed on static/ISR cached content routes)
  const searchAndDiscoveryBots = [
    'Googlebot',
    'Bingbot',
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'PerplexityBot',
    'Applebot',
  ];

  return {
    rules: [
      // 1. Strictly block aggressive SEO scrapers and bulk training bots from consuming compute
      ...blockedCrawlers.map(bot => ({
        userAgent: bot,
        disallow: '/',
      })),

      // 2. Allow real-time search & citation engines on ISR-cached study routes
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
