
import 'dotenv/config';
import Parser from 'rss-parser';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { getGeminiModel } from '../src/lib/gemini.js';

const rssParser = new Parser();

// Sources Configuration
const SOURCES = [
  { id: 'pib', name: 'PIB', url: 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=1' },
  { id: 'hindu', name: 'The Hindu Editorial', url: 'https://www.thehindu.com/opinion/editorial/feeder/default.rss' },
  { id: 'ie', name: 'Indian Express Opinion', url: 'https://indianexpress.com/section/opinion/feed/' }
];

async function harvestArticleText(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    if (!res.ok) return null;
    const html = await res.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    return article ? article.textContent : null;
  } catch (err) {
    console.error(`[Harvest] Failed ${url}:`, err.message);
    return null;
  }
}

async function synthesizeArticle(title, text) {
  const ai = getGeminiModel('analysis'); // Uses Gemini 2.5 Flash for high reasoning
  
  const prompt = `
    Task: UPSC Strategic Analysis
    Article: ${title}
    Content: ${text.substring(0, 5000)}
    
    CRITICAL: Answer in strict JSON. Do NOT mention "RBI" or "ECI" unless present in text.
    Identify any Geographic Location (City/River/Border) mentioned for mapping.
    
    JSON Format:
    {
      "is_relevant": boolean,
      "category": "Economy|IR|Polity|Environment|Security",
      "summary": "1-sentence summary",
      "gsPaper": "GS1|GS2|GS3|GS4",
      "crux": "Deep synthesis for Mains",
      "location": "Exact name of location for map link",
      "prelims_fact": "High-yield fact",
      "mcq": {
        "question": "MCQ based on text",
        "options": ["A", "B", "C", "D"],
        "answer": "Correct option text"
      }
    }
  `;

  try {
    const response = await ai.generateContent(prompt);
    const text = typeof response.text === 'function' ? response.text() : response.text;
    // Clean markdown blocks if any
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error(`[AI] Failed ${title}:`, err.message);
    return null;
  }
}

async function syncToPortal(payload) {
  const token = process.env.NEWS_ENGINE_TOKEN;
  const url = 'http://localhost:3000/api/news/sync';
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ articles: [payload] })
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`[Sync] Failed:`, err.message);
    return null;
  }
}

async function runEngine() {
  console.log("🚀 Starting UPSC News Engine v2 (Node-based)");
  
  for (const source of SOURCES) {
    console.log(`\n[Discovery] Checking ${source.name}...`);
    try {
      const feed = await rssParser.parseURL(source.url);
      
      // Process top 3 newest items from each source
      for (const item of feed.items.slice(0, 3)) {
        console.log(` - Processing: ${item.title}`);
        
        const text = await harvestArticleText(item.link);
        if (!text || text.length < 500) {
          console.log(`   ! Content too short or paywalled. Skipping.`);
          continue;
        }

        const analysis = await synthesizeArticle(item.title, text);
        if (!analysis || !analysis.is_relevant) {
          console.log(`   ! Rejected by UPSC relevance gate.`);
          continue;
        }

        console.log(`   + Relevant (${analysis.category}). Syncing...`);
        
        const syncPayload = {
          title: item.title,
          url: item.link,
          source: source.name,
          content: text.substring(0, 1000), // Original content preview
          summary: analysis.summary,
          publishedAt: item.isoDate || new Date().toISOString(),
          category: analysis.category,
          relevance: 9,
          editorials: [{
            issue: analysis.summary,
            crux: analysis.crux,
            gsPaper: analysis.gsPaper
          }],
          facts: [{
            type: 'PRELIMS_FACT',
            content: analysis.prelims_fact,
            category: analysis.category,
            locationName: analysis.location,
            mcq: analysis.mcq
          }]
        };

        const result = await syncToPortal(syncPayload);
        if (result) console.log(`   ✓ Synced successfully.`);
      }
    } catch (err) {
      console.error(`[Source Error] ${source.name}:`, err.message);
    }
  }
}

runEngine();
