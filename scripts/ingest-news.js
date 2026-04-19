require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const Parser = require('rss-parser');

const prisma = new PrismaClient();
const rssParser = new Parser();

// ==========================================
// ⚙️ CONFIGURATION
// ==========================================
const NEWSDATA_API_KEY = process.env.NEWSDATA_API_KEY;
const LLM_API_ENDPOINT = process.env.LLM_API_ENDPOINT || 'http://localhost:11434/api/generate'; 
const DOMAINS = "thehindu.com,indianexpress.com";

const PIB_RSS_URL = "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=1";

// ==========================================
// 🕸️ STEP 1: THE METADATA FETCH (NewsData.io Restore)
// ==========================================
async function fetchLatestNewsUrls() {
  console.log(`\n[STEP 1] Fetching metadata from NewsData.io (Targeting: ${DOMAINS})...`);
  
  // Using the /latest endpoint and the 'domainurl' parameter which solved our domain lookup error
  const url = `https://newsdata.io/api/1/latest?apikey=${NEWSDATA_API_KEY}&domainurl=${DOMAINS}&language=en`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === "error") {
      throw new Error(`NewsData API Error: ${data.results.message}`);
    }
    
    // NewsData returns results in 'results' array
    return (data.results || []).map(r => ({
        title: r.title,
        link: r.link,
        description: r.description,
        pubDate: r.pubDate,
        source_id: r.source_id
    }));
  } catch (error) {
    console.error("[ERROR] Failed to fetch NewsData metadata:", error.message);
    return [];
  }
}

// ==========================================
// 🕸️ STEP 1.1: THE PIB RSS FETCH (Zero Cost)
// ==========================================
async function fetchPibRss() {
  console.log(`\n[STEP 1.1] Fetching metadata from PIB RSS...`);
  try {
    const feed = await rssParser.parseURL(PIB_RSS_URL);
    console.log(`[INFO] PIB RSS Status: ${feed.title} loaded.`);
    
    return feed.items.map(item => ({
      title: item.title,
      link: item.link,
      description: item.contentSnippet,
      pubDate: item.isoDate,
      source_id: "pib"
    }));
  } catch (error) {
    console.log(`[ERROR] PIB RSS Fetch failed: ${error.message}`);
    return [];
  }
}

// ==========================================
// 🚜 STEP 2: THE CONTENT HARVEST
// ==========================================
async function harvestArticleText(url) {
  /* 
   Slows down the loops naturally due to network IO,
   avoiding massive bot spikes. Extracts clean text.
  */
  console.log(`[HARVEST] Scraping full text: ${url}`);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const htmlText = await response.text();
    const doc = new JSDOM(htmlText, { url: url });
    
    const reader = new Readability(doc.window.document);
    const article = reader.parse();
    
    // We get the raw text content without HTML tags
    return article ? article.textContent : null;
  } catch (err) {
    console.error(`[HARVEST ERROR] Failed to parse ${url}: ${err.message}`);
    return null;
  }
}

// ==========================================
// 🧠 STEP 3: THE STRATEGIC SYNTHESIS ENGINE (v2.1)
// ==========================================
async function synthesizeWithGemma(title, fullText, sourceId) {
  console.log(`[GEMMA] Analyzing "${title}"...`);
  const truncatedText = fullText.split(' ').slice(0, 1500).join(' ');

  const prompt = `
  You are an elite UPSC Civil Services Examination analyst. 
  Extract analytical value for General Studies (GS) Papers 1-4.

  <FEW_SHOT_GUIDE>
  
  ### EXAMPLE 1: RELEVANT (GS-2)
  Input Title: "AICC moves ECI against CPI(M) channel for defamation"
  Your Response: {
    "is_upsc_relevant": true,
    "gs_paper": "GS-2 Polity",
    "reasoning": "Involves the role of the Election Commission of India (ECI) and Model Code of Conduct.",
    "crux": "The Model Code of Conduct governs media ethics and political discourse during elections.",
    "conflict_tracker": "ECI must balance free speech with fair election practices.",
    "prelims_fact": {
      "fact": "The ECI issues the Model Code of Conduct under Article 324 of the Constitution.",
      "question": "Which Article of the Constitution empowers the ECI to oversee elections?",
      "options": ["A) Article 324", "B) Article 110", "C) Article 280", "D) Article 312"],
      "correct_answer": "A) Article 324"
    },
    "mains_fact": { "inquiry": "Discuss the effectiveness of the ECI in regulating digital media during election seasons." }
  }

  ### EXAMPLE 2: NOT RELEVANT (REJECT)
  Input Title: "Dhurandhar 2 breaks box office records"
  Your Response: {
    "is_upsc_relevant": false,
    "reasoning": "Entertainment news with zero GS syllabus impact."
  }
  
  </FEW_SHOT_GUIDE>

  <TASK>
  Source: ${sourceId}
  Article: "${title}"
  
  Content:
  ---
  ${truncatedText}
  ---
  
  Analyze the content above. If it fits GS-1, 2, 3, or 4, synthesize it. If it is trivial or entertainment, set "is_upsc_relevant" to false.
  NEVER repeat the example content (like RBI or ECI) in your answer unless the article is actually about those topics.

  OUTPUT VALID JSON:
  {
    "is_upsc_relevant": boolean,
    "gs_paper": "GS-1" | "GS-2" | "GS-3" | "GS-4" | "PRELIMS_ONLY",
    "reasoning": "string",
    "crux": "Deep summary of THIS article",
    "conflict_tracker": "Publication's perspective",
    "prelims_fact": {
      "fact": "Specific factual data point FROM THE TEXT",
      "question": "Challenging MCQ based strictly on this text",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct_answer": "Exact text string of the correct option"
    },
    "mains_fact": { "inquiry": "Analytical inquiry for Mains" }
  }
  </TASK>
  `;

  try {
    const response = await fetch(LLM_API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "gemma:2b", 
        prompt: prompt,
        stream: false,
        format: "json"
      }),
      signal: AbortSignal.timeout(60000)
    });

    const data = await response.json();
    const synthesis = JSON.parse(data.response);

    // [HALLUCINATION SAFEGUARD]
    if (synthesis.is_upsc_relevant) {
      const lowerCrux = synthesis.crux.toLowerCase();
      const lowerText = fullText.toLowerCase();
      
      // If the summary mentions specific keywords from the few-shot examples but they aren't in the text, drop it.
      const leakedKeywords = ["repo rate", "mpc", "article 324", "eci"];
      for (const keyword of leakedKeywords) {
        if (lowerCrux.includes(keyword) && !lowerText.includes(keyword)) {
          console.log(`[HALLUCINATION SAVED] Dropping fake synthesis for "${title}" (Leaked "${keyword}")`);
          return null;
        }
      }
    }

    return synthesis;
  } catch (error) {
    console.error(`[ERROR] Gemma Synthesis failed:`, error.message);
    return null;
  }
}

// ==========================================
// 💾 STEP 4: THE PORTAL SYNC (v2)
// ==========================================
async function storeInDatabase(articleMeta, synthesis) {
  // Only save if Gemma deemed it relevant
  if (!synthesis || synthesis.is_upsc_relevant !== true) {
      console.log(`[DROPPED] Gemma rejected "${articleMeta.title}": ${synthesis?.reasoning || "Failed synthesis"}`);
      return;
  }
  
  const sourceNameMap = {
    "thehindu": "The Hindu",
    "the hindu": "The Hindu",
    "indianexpress": "Indian Express",
    "indian express": "Indian Express",
    "pib": "PIB",
    "press information bureau": "PIB"
  };

  const articleSource = sourceNameMap[articleMeta.source_id?.toLowerCase()] || "Other";
  const category = (synthesis.gs_paper || "GENERAL").split(' ')[0]; // Take only 'GS-1' etc.

  try {
    const savedArticle = await prisma.newsArticle.upsert({
      where: { url: articleMeta.link },
      update: {
          summary: synthesis.crux,
          category: category
      },
      create: {
        title: articleMeta.title,
        url: articleMeta.link,
        source: articleSource,
        content: synthesis.conflict_tracker, 
        summary: synthesis.crux,
        publishedAt: new Date(articleMeta.pubDate || Date.now()),
        category: category, 
        relevance: 9, 
      }
    });

    // Save Prelims Fact (MCQ) - Clear existing to avoid duplicates on re-run
    await prisma.newsFact.deleteMany({ where: { articleId: savedArticle.id } });

    if (synthesis.prelims_fact && synthesis.prelims_fact.fact) {
        await prisma.newsFact.create({
            data: {
                articleId: savedArticle.id,
                type: "PRELIMS_FACT",
                content: synthesis.prelims_fact.fact,
                category: category,
                questionData: JSON.stringify({
                    question: synthesis.prelims_fact.question,
                    options: synthesis.prelims_fact.options,
                    correct_answer: synthesis.prelims_fact.correct_answer
                })
            }
        });
    }

    // Save Mains Fact (Inquiry)
    if (synthesis.mains_fact && synthesis.mains_fact.inquiry) {
        await prisma.newsFact.create({
            data: {
                articleId: savedArticle.id,
                type: "MAINS_FACT",
                content: synthesis.mains_fact.inquiry,
                category: category,
                questionData: "{}" 
            }
        });
    }

    console.log(`[SUCCESS] Stored Intelligence (${category}): ${articleMeta.title}`);
  } catch (error) {
    console.error(`[ERROR] DB Commit failed for "${articleMeta.title}":`, error.message);
  }
}

// ==========================================
// 🚀 ORCHESTRATOR (v2)
// ==========================================
async function executeHarvestAndProcess() {
  console.log("==========================================");
  console.log("🛡️ STRATEGIC HARVEST & PROCESS PIPELINE v2");
  console.log("==========================================");

  if (!NEWSDATA_API_KEY) {
    console.error("[ABORT] NEWSDATA_API_KEY is missing. Add it to .env");
    process.exit(1);
  }

  // 1. Fetch Parallel Sources
  const [newsDataArticles, pibArticles] = await Promise.all([
    fetchLatestNewsUrls(),
    fetchPibRss()
  ]);

  const rawArticles = [...newsDataArticles, ...pibArticles];
  console.log(`[INFO] Discovery Complete. Found ${rawArticles.length} candidates (News: ${newsDataArticles.length}, PIB: ${pibArticles.length}).`);

  for (const articleMeta of rawArticles) {
    // Prevent LLM waste on existing URLs
    const existing = await prisma.newsArticle.findUnique({ where: { url: articleMeta.link } });
    if (existing) {
        console.log(`[SKIP] Already processed: "${articleMeta.title}"`);
        continue;
    }

    // 2. Harvest Full Text
    const fullText = await harvestArticleText(articleMeta.link);
    if (!fullText || fullText.length < 300) {
        console.log(`[SKIP] Text too short/paywalled: "${articleMeta.title}"`);
        continue;
    }

    // 3. Gemma Analysis 
    const synthesis = await synthesizeWithGemma(articleMeta.title, fullText, articleMeta.source_id);
    
    // 4. Sync Database
    if (synthesis) {
        await storeInDatabase(articleMeta, synthesis);
    }
  }

  console.log("==========================================");
  console.log("✅ HARVEST RUN COMPLETE");
  console.log("==========================================");
}

// Global execution
executeHarvestAndProcess()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
