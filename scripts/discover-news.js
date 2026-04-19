require('dotenv').config();
const Parser = require('rss-parser');
const rssParser = new Parser();

const NEWSDATA_API_KEY = process.env.NEWSDATA_API_KEY;
const DOMAINS = "thehindu.com,indianexpress.com";
const PIB_RSS_URL = "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=1";

async function fetchLatestNewsUrls() {
  console.log(`[NewsData] Fetching from ${DOMAINS}...`);
  const url = `https://newsdata.io/api/1/latest?apikey=${NEWSDATA_API_KEY}&domainurl=${DOMAINS}&language=en`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === "error") throw new Error(data.results.message);
    return (data.results || []).map(r => ({
        title: r.title,
        link: r.link,
        pubDate: r.pubDate,
        source: r.source_id
    }));
  } catch (error) {
    console.error("[ERROR] NewsData fetch failed:", error.message);
    return [];
  }
}

async function fetchPibRss() {
  console.log(`[PIB] Fetching from RSS...`);
  try {
    const feed = await rssParser.parseURL(PIB_RSS_URL);
    return feed.items.map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.isoDate,
      source: "pib"
    }));
  } catch (error) {
    console.log(`[ERROR] PIB fetch failed: ${error.message}`);
    return [];
  }
}

async function runDiscovery() {
  console.log("------------------------------------------");
  console.log("🔍 UPSC ATLAS: DAILY NEWS DISCOVERY");
  console.log("------------------------------------------\n");

  const [news, pib] = await Promise.all([
    fetchLatestNewsUrls(),
    fetchPibRss()
  ]);

  const all = [...news, ...pib];
  
  if (all.length === 0) {
    console.log("No news items found for today.");
    return;
  }

  console.log(`\nFound ${all.length} potential articles:\n`);
  
  // Output in a format that's easy to read in the console
  all.forEach((item, index) => {
    console.log(`${index + 1}. [${item.source.toUpperCase()}] ${item.title}`);
    console.log(`   Link: ${item.link}`);
    console.log(`   Date: ${item.pubDate}\n`);
  });

  console.log("------------------------------------------");
  console.log("✅ Discovery Complete.");
}

runDiscovery();
