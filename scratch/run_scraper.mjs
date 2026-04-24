import 'dotenv/config';
import { scrapeAndEnrich } from '../src/lib/scraper.js';

async function run() {
  console.log("🚀 Starting Manual News Scrape & Enrich...");
  try {
    const results = await scrapeAndEnrich();
    console.log("✅ Scrape Complete!");
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error("❌ Scrape Failed:", err);
  }
  process.exit(0);
}

run();
