import Parser from 'rss-parser';
const rssParser = new Parser();

console.log("Testing RSS Parser...");
rssParser.parseURL('https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=1')
  .then(feed => {
    console.log(`Success! Fetched ${feed.items.length} items from PIB.`);
  })
  .catch(err => {
    console.error("RSS Error:", err.message);
  });
