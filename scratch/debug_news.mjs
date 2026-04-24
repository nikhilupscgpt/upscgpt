
import "dotenv/config";

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

const TRUSTED_SOURCES = {
  india_editorial: 'thehindu.com,indianexpress.com',
  india_business: 'livemint.com,business-standard.com,economictimes.indiatimes.com',
  global_strategic: 'nytimes.com,washingtonpost.com,bbc.com,aljazeera.com,thediplomat.com',
};

async function fetchFromGNews(keywords, sourceGroup, gnewsKey, max = 10) {
  const sourceDomains = TRUSTED_SOURCES[sourceGroup];
  // GNews q query can be complex. Let's see what happens.
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(keywords)}&lang=en&max=${max}&sortby=publishedAt&in=title,description&apikey=${gnewsKey}`;

  console.log(`Fetching: ${url}`);

  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (!res.ok) {
        console.error("Error from GNews:", data);
        return [];
    }

    console.log(`Total articles found: ${data.totalArticles}`);
    console.log(`Articles returned in this batch: ${data.articles?.length || 0}`);

    if (data?.articles?.length) {
      const trustedDomains = sourceDomains.split(',');
      const filtered = data.articles.filter(article => {
        try {
          const host = new URL(article.url).hostname.replace('www.', '');
          const isTrusted = trustedDomains.some(d => host.includes(d));
          console.log(` - ${host} (Trusted: ${isTrusted})`);
          return isTrusted;
        } catch { return false }
      });
      console.log(`Filtered articles: ${filtered.length}`);
      return filtered;
    }
  } catch (e) {
    console.error(`[Scraper] GNews fetch failed:`, e.message);
  }
  return [];
}

const plan = {
  label: 'India Editorial: Foreign Policy & IR',
  keywords: '"India foreign policy" OR "Indo-Pacific" OR "bilateral relations" OR "BRICS summit" OR "SCO summit" OR "G20 summit" OR "UN Security Council"',
  sourceGroup: 'india_editorial',
  max: 10,
};

fetchFromGNews(plan.keywords, plan.sourceGroup, GNEWS_API_KEY).then(res => {
    console.log("Result length:", res.length);
});
