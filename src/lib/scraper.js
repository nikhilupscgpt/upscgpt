import prisma from "./prisma"
import { getGeminiModel } from "./gemini"
import { getRenderedPrompt } from "./aiPromptRegistry"
import { JSDOM } from 'jsdom'
import { Readability } from '@mozilla/readability'
import { runWithRetry } from './db-retry'
import Parser from 'rss-parser';

const rssParser = new Parser();

const delay = (ms) => new Promise(res => setTimeout(res, ms))

async function harvestArticleText(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) return null;
    const html = await res.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    return article ? article.textContent : null;
  } catch (err) {
    console.warn(`[Scraper] Failed to fetch text for ${url}: ${err.message}`);
    return null;
  }
}

export const RSS_FEEDS = [
  { label: 'PIB Press Releases', url: 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=1', source: 'PIB' },
  { label: 'The Hindu National', url: 'https://www.thehindu.com/news/national/feeder/default.rss', source: 'The Hindu' },
  { label: 'The Hindu International', url: 'https://www.thehindu.com/news/international/feeder/default.rss', source: 'The Hindu' },
  { label: 'The Hindu Economy', url: 'https://www.thehindu.com/business/Economy/feeder/default.rss', source: 'The Hindu' },
];

async function fetchFromRSS(feedConfig, max = 10) {
  console.log(`[Scraper] Fetching RSS: ${feedConfig.label}...`);
  try {
    const feed = await rssParser.parseURL(feedConfig.url, { timeout: 10000 });
    const now = new Date();
    
    return feed.items
      .map(item => ({
        title: item.title,
        description: item.contentSnippet || item.content || '',
        url: item.link,
        publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
        source: feedConfig.source
      }))
      .filter(item => {
        // Only keep articles from the last 48 hours to be safe
        const pubDate = new Date(item.publishedAt);
        const hoursOld = (now - pubDate) / (1000 * 60 * 60);
        return hoursOld <= 48;
      })
      .slice(0, max);
  } catch (error) {
    console.error(`[Scraper] Failed to fetch RSS ${feedConfig.label}:`, error.message);
    return [];
  }
}

export async function scrapeAndEnrich() {
  const model = getGeminiModel('extraction')
  const mapEntries = await prisma.mapEntry.findMany()

  let totalFetched = 0
  let totalEnriched = 0
  let totalCreated = 0
  let totalFiltered = 0

  for (const feed of RSS_FEEDS) {
    let articles = await fetchFromRSS(feed, 3);
    totalFetched += articles.length;

    for (const article of articles) {
      if (!model) continue

      try {
        // Stay safely below 15 RPM free tier limit
        await delay(4200) 

        // FETCH FULL TEXT
        let fullText = await harvestArticleText(article.url);
        const articleText = fullText ? fullText.substring(0, 5000) : `${article.title} ${article.description || ''}`;

        const sourceName = (() => {
          try { return new URL(article.url).hostname.replace('www.', '') } catch { return 'unknown' }
        })()

        const promptText = await getRenderedPrompt('news.scraper.enrichment', {
          articleText,
          sourceName,
        })

        const response = await model.generateContent(promptText)
        let cleanText = response.text.trim()
          .replace(/^```json\n?/, '').replace(/\n?```$/, '')
          .replace(/^```\n?/, '').replace(/\n?```$/, '')

        const parsed = JSON.parse(cleanText)
        
        if (!parsed.isGeopolitical || parsed.upscRelevance < 4) {
          totalFiltered++
          continue
        }

        const formattedDate = new Date(article.publishedAt || new Date()).toISOString()
        
        // 1. Create or Update the News Article and related data in a transaction
        await runWithRetry(async () => {
          await prisma.$transaction(async (tx) => {
            const upsertedArticle = await tx.newsArticle.upsert({
              where: { url: article.url },
              update: {
                title: article.title,
                content: articleText.substring(0, 2000), // store a snippet
                summary: parsed.summary || article.description || '',
                publishedAt: new Date(formattedDate),
                category: parsed.category || 'general',
                relevance: parsed.upscRelevance,
              },
              create: {
                title: article.title,
                url: article.url,
                source: sourceName,
                content: articleText.substring(0, 2000),
                summary: parsed.summary || article.description || '',
                publishedAt: new Date(formattedDate),
                category: parsed.category || 'general',
                relevance: parsed.upscRelevance,
              }
            });

            // 2. Clear existing editorials and facts to avoid duplicates
            await tx.editorialAnalysis.deleteMany({ where: { articleId: upsertedArticle.id } });
            await tx.newsFact.deleteMany({ where: { articleId: upsertedArticle.id } });

            // 3. Build Editorials
            if (parsed.editorials && Array.isArray(parsed.editorials)) {
              for (const ed of parsed.editorials) {
                await tx.editorialAnalysis.create({
                  data: {
                    article: { connect: { id: upsertedArticle.id } },
                    issue: ed.issue || '',
                    crux: ed.crux || '',
                    gsPaper: ed.gsPaper || ''
                  }
                });
              }
            }

            // 4. Build Facts and Link to Map
            if (parsed.facts && Array.isArray(parsed.facts)) {
              for (const fact of parsed.facts) {
                let mapEntryId = null;
                // Map Linking Logic
                if (parsed.locationName && parsed.locationName.trim() !== '' && parsed.locationName.toLowerCase() !== 'null') {
                  let matchedEntry = await tx.mapEntry.findFirst({
                    where: { name: { equals: parsed.locationName, mode: 'insensitive' } }
                  });
                  
                  if (matchedEntry) {
                     mapEntryId = matchedEntry.id;
                     const existingMentions = matchedEntry.newsMentions || '';
                     const newMentionStr = `\n\n### [${article.title}](${article.url})\n**Source:** ${sourceName}`;
                     if (!existingMentions.includes(article.url)) {
                       await tx.mapEntry.update({
                         where: { id: matchedEntry.id },
                         data: {
                           newsMentions: existingMentions + newMentionStr,
                           lastNewsDate: new Date()
                         }
                       });
                     }
                  } else {
                     const newEntry = await tx.mapEntry.create({
                       data: {
                         name: parsed.locationName,
                         lat: 0,
                         lon: 0,
                         category: parsed.category || 'general',
                         shape: 'marker',
                         year: new Date().getFullYear(),
                         newsMentions: `\n\n### [${article.title}](${article.url})\n**Source:** ${sourceName}`,
                         lastNewsDate: new Date()
                       }
                     });
                     mapEntryId = newEntry.id;
                     totalCreated++;
                  }
                }

                await tx.newsFact.create({
                  data: {
                    article: { connect: { id: upsertedArticle.id } },
                    type: fact.type || 'PRELIMS_FACT',
                    content: fact.content || '',
                    category: fact.category || 'general',
                    year: new Date().getFullYear(),
                    mapEntry: mapEntryId ? { connect: { id: mapEntryId } } : undefined,
                    questionData: fact.mcq || null
                  }
                });
              }
            }
          });
        }, 3, 1000);
        
        totalEnriched++;
        
      } catch (err) {
        console.error(`[Scraper] AI Enrichment failed for: "${article.title}"`, err.message)
      }
    }
  }

  return { totalFetched, totalEnriched, totalCreated, totalFiltered }
}
