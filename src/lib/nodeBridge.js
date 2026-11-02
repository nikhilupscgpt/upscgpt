import fs from 'fs';
import path from 'path';
import { extractCoreSubjectEntity } from './seo.js';

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'which', 'following',
  'consider', 'statement', 'statements', 'correct', 'india', 'indian', 'under',
  'reference', 'context', 'respect', 'regard', 'about', 'above', 'given', 'only',
  'both', 'neither', 'nor', 'select', 'answer', 'using', 'code', 'below', 'one',
  'two', 'three', 'all', 'none', 'are', 'was', 'were', 'has', 'have', 'had',
  'can', 'may', 'will', 'shall', 'not', 'its', 'their', 'into', 'over', 'more',
  'than', 'most', 'some', 'any', 'other', 'such', 'part', 'act', 'acts',
]);

// High-impression Page 2–3 /node/ slugs identified in Google Search Console (positions 10–38)
// where targeted internal link equity from Page-1 PYQs (median pos ~7.7) has maximum ranking lift.
const STRIKING_DISTANCE_NODE_SLUGS = new Set([
  'six-orthodox-schools-of-indian-philosophy-shad-darshana-heterodox-schools',
  'traditional-martial-arts-of-india-kalaripayattu-thang-ta-gatka-silambam',
  'sangam-age-literature-society-economy-polity-in-early-tamilakam',
  'ashoka-the-great-kalinga-war-dhamma-inscriptions-edicts',
  'vijayanagara-administration-the-nayankara-system-society-foreign-travellers',
  'delhi-sultanate-administration-central-departments-the-iqta-system',
  'indo-islamic-architecture-imperial-provincial-mughal-styles',
  'tripartite-struggle-northern-dynasties-palas-pratiharas-rashtrakutas',
  'the-satavahana-dynasty-western-deccan-polities',
  'ancient-indian-guilds-shrenis-trade-routes-maritime-ports',
  'traditional-festivals-tribal-celebrations-cultural-fairs-of-india',
  'bahmani-kingdom-the-deccan-sultanates',
  'industrial-indices-iip-index-of-eight-core-industries',
  'rise-of-the-marathas-chhatrapati-shivaji-maharaj-maratha-swarajya',
  'major-food-crops-of-india-rice-wheat-millets-pulses',
  'indian-drainage-himalayan-peninsular-river-systems',
  'post-mauryan-dynasties-shungas-indo-greeks-sakas-kushanas',
  'trade-networks-merchant-guilds-technology-in-medieval-india',
  'early-vedic-rigvedic-period-society-economy-polity',
  'buddhism-philosophy-four-noble-truths-eightfold-path-canonical-literature',
  'mauryan-empire-administration-economy-kautilyan-statecraft',
  'agricultural-trade-export-policy-apeda-mpeda-global-rules',
  'maps-projections-gis-international-boundary-lines',
  'akbar-s-age-state-consolidation-mansabdari-system-din-i-ilahi',
  'sangam-literature-ancient-dravidian-texts-classical-languages-of-india',
  'landforms-weathering-fluvial-karst-glacial-aeolian-coastal',
  'later-mughal-era-european-travellers-jahangir-to-aurangzeb',
  'the-peshwas-maratha-confederacy-18th-century-successor-states',
  'constitutional-politics-1922-1931-swarajists-simon-commission-nehru-report-lahor',
  'micro-irrigation-solar-energy-pm-kusum-scheme',
  'mamluk-slave-dynasty-state-consolidation-iltutmish-to-balban',
  'buddhist-councils-sects-theravada-mahayana-vajrayana-bodhisattvas',
  'population-census-urbanisation-tribes',
  'epigraphy-numismatics-land-grants-feudal-institutions',
  'administrative-machinery-civil-services-judiciary-police',
]);

export function slugifyNodeTitle(text) {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

function tokenize(text) {
  if (!text) return [];
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !STOP_WORDS.has(w));
}

function extractTitlePhrases(title) {
  if (!title) return [];
  return String(title)
    .split(/[—–,:&()/]/)
    .map(s => s.trim().toLowerCase())
    .filter(s => s.length >= 4 && !STOP_WORDS.has(s));
}

let cachedCatalog = null;

/**
 * Loads and caches the unified static /node/[slug] catalog from
 * MASTER_DISCOVERY_NODES.csv and data/*_node_bridging.json.
 */
export function getSyllabusNodeCatalog() {
  if (cachedCatalog) return cachedCatalog;

  const idToCsvNode = new Map();
  const slugToNode = new Map();
  const allNodes = [];

  try {
    const csvPath = path.join(process.cwd(), 'MASTER_DISCOVERY_NODES.csv');
    if (fs.existsSync(csvPath)) {
      const lines = fs.readFileSync(csvPath, 'utf8').split(/\r?\n/);
      for (const line of lines.slice(1)) {
        if (!line.trim()) continue;
        // Parse CSV row: id,slug,title,domain,gsPapers,keyThemes,subtopics,...
        const cols = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
              cur += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (ch === ',' && !inQuotes) {
            cols.push(cur);
            cur = '';
          } else {
            cur += ch;
          }
        }
        cols.push(cur);

        const [id, slug, title, domain, gsPapers, keyThemes, subtopics] = cols;
        if (!id || !slug || !title) continue;
        const entry = {
          nodeId: id.trim(),
          slug: slug.trim(),
          title: title.trim(),
          domain: (domain || '').trim(),
          subject: mapDomainToSubject((domain || '').trim()),
          module: (domain || 'General Studies').trim(),
          gsPapers: (gsPapers || 'GS1').trim(),
          topics: [],
          alsoRelevantTopics: [],
          keyThemes: (keyThemes || '').trim(),
          subtopics: (subtopics || '').trim(),
          prelimsNotePreview: '',
          titlePhrases: extractTitlePhrases(title),
          titleTokens: new Set(tokenize(title)),
          themeTokens: new Set(tokenize(`${keyThemes || ''} ${subtopics || ''}`)),
          noteTokens: new Set(),
        };
        idToCsvNode.set(entry.nodeId, entry);
        slugToNode.set(entry.slug, entry);
      }
    }
  } catch (err) {
    console.error('[nodeBridge] Failed reading MASTER_DISCOVERY_NODES.csv:', err?.message);
  }

  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (fs.existsSync(dataDir)) {
      const files = fs.readdirSync(dataDir).filter(f => f.endsWith('_node_bridging.json'));
      for (const file of files) {
        try {
          const raw = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
          const subject = raw.subject === 'Indian Economy' ? 'Economy' : (raw.subject || 'General Studies');
          const combined = [...(raw.nodes || []), ...(raw.newNodesToCreate || [])];

          for (const item of combined) {
            if (!item || !item.title) continue;
            const existing = (item.nodeId && idToCsvNode.get(item.nodeId)) || slugToNode.get(slugifyNodeTitle(item.title));
            const slug = existing?.slug || item.slug || slugifyNodeTitle(item.title);
            if (!slug) continue;

            const directTopics = [];
            if (item.topic) directTopics.push(item.topic);
            if (Array.isArray(item.mappedQuestionTopics)) {
              for (const t of item.mappedQuestionTopics) {
                if (t && !directTopics.includes(t)) directTopics.push(t);
              }
            }

            const alsoTopics = Array.isArray(item.alsoRelevantQuestionTopics)
              ? item.alsoRelevantQuestionTopics.filter(Boolean)
              : [];

            const rawNotes = Array.isArray(item.prelimsNote)
              ? item.prelimsNote.join(' ')
              : typeof item.prelimsNote === 'string'
                ? item.prelimsNote
                : '';

            const firstBullet = Array.isArray(item.prelimsNote) && item.prelimsNote[0]
              ? String(item.prelimsNote[0])
              : typeof item.prelimsNote === 'string'
                ? item.prelimsNote.split(/\r?\n/)[0] || ''
                : '';

            const cleanPreview = firstBullet
              .replace(/^[•*\-\s]+/, '')
              .replace(/\s+/g, ' ')
              .trim()
              .slice(0, 155);

            if (existing) {
              existing.subject = subject;
              existing.module = item.module || item.topic || existing.module;
              existing.topics = Array.from(new Set([...existing.topics, ...directTopics]));
              existing.alsoRelevantTopics = Array.from(new Set([...existing.alsoRelevantTopics, ...alsoTopics]));
              if (cleanPreview) existing.prelimsNotePreview = cleanPreview;
              existing.noteTokens = new Set(tokenize(rawNotes));
            } else {
              const created = {
                nodeId: item.nodeId || null,
                slug,
                title: item.title.trim(),
                domain: subject.toUpperCase(),
                subject,
                module: item.module || item.topic || subject,
                gsPapers: inferGsPaperFromSubject(subject),
                topics: directTopics,
                alsoRelevantTopics: alsoTopics,
                keyThemes: '',
                subtopics: '',
                prelimsNotePreview: cleanPreview,
                titlePhrases: extractTitlePhrases(item.title),
                titleTokens: new Set(tokenize(item.title)),
                themeTokens: new Set(tokenize(directTopics.join(' '))),
                noteTokens: new Set(tokenize(rawNotes)),
              };
              slugToNode.set(slug, created);
              if (created.nodeId) idToCsvNode.set(created.nodeId, created);
            }
          }

          // Also wire topicMappings from polity_node_bridging.json if present
          if (Array.isArray(raw.topicMappings)) {
            for (const tm of raw.topicMappings) {
              if (!tm?.srcTopic) continue;
              if (tm.nodeId && idToCsvNode.has(tm.nodeId)) {
                const target = idToCsvNode.get(tm.nodeId);
                if (!target.topics.includes(tm.srcTopic)) {
                  target.topics.push(tm.srcTopic);
                }
              }
              if (Array.isArray(tm.alsoRelevantNodeIds)) {
                for (const relId of tm.alsoRelevantNodeIds) {
                  if (idToCsvNode.has(relId)) {
                    const relNode = idToCsvNode.get(relId);
                    if (!relNode.alsoRelevantTopics.includes(tm.srcTopic)) {
                      relNode.alsoRelevantTopics.push(tm.srcTopic);
                    }
                  }
                }
              }
            }
          }
        } catch (err) {
          console.error(`[nodeBridge] Error parsing ${file}:`, err?.message);
        }
      }
    }
  } catch (err) {
    console.error('[nodeBridge] Failed scanning data directory:', err?.message);
  }

  for (const node of slugToNode.values()) {
    allNodes.push(node);
  }

  cachedCatalog = { allNodes, slugToNode, idToCsvNode };
  return cachedCatalog;
}

function mapDomainToSubject(domain) {
  const d = (domain || '').toUpperCase();
  if (d.includes('POLITY') || d.includes('GOVERNANCE')) return 'Indian Polity';
  if (d.includes('ECONOMY')) return 'Economy';
  if (d.includes('AGRICULTURE')) return 'Agriculture';
  if (d.includes('GEOGRAPHY')) return 'Geography';
  if (d.includes('ENVIRONMENT')) return 'Environment';
  if (d.includes('SCIENCE')) return 'Science & Technology';
  if (d.includes('ANCIENT')) return 'Ancient History';
  if (d.includes('MEDIEVAL')) return 'Medieval History';
  if (d.includes('MODERN') || d === 'HISTORY') return 'Modern History';
  if (d.includes('ART') || d.includes('CULTURE')) return 'Art & Culture';
  return 'General Studies';
}

function inferGsPaperFromSubject(subject) {
  const s = (subject || '').toLowerCase();
  if (s.includes('polity')) return 'GS2';
  if (s.includes('economy') || s.includes('agriculture') || s.includes('environment') || s.includes('science')) return 'GS3';
  return 'GS1';
}

function normalizeSubjectName(sub) {
  if (!sub) return '';
  const s = sub.trim().toLowerCase();
  if (s.includes('polity')) return 'Indian Polity';
  if (s.includes('economy')) return 'Economy';
  if (s.includes('agriculture')) return 'Agriculture';
  if (s.includes('geography')) return 'Geography';
  if (s.includes('environment') || s.includes('ecology')) return 'Environment';
  if (s.includes('science')) return 'Science & Technology';
  if (s.includes('ancient')) return 'Ancient History';
  if (s.includes('medieval')) return 'Medieval History';
  if (s.includes('modern')) return 'Modern History';
  if (s.includes('art') || s.includes('culture')) return 'Art & Culture';
  return sub.trim();
}

/**
 * Resolves the top-matching static /node/[slug] syllabus pages for a Prelims PYQ question.
 * Used to pass internal link equity from high-ranking PYQ pages (median pos ~7.7)
 * directly to their corresponding static /node/[slug] syllabus pages.
 *
 * @param {object} q Question object
 * @param {number} [limit=3] Maximum number of syllabus nodes to return
 * @returns {Array<{slug: string, title: string, subject: string, module: string, gsPapers: string, prelimsNotePreview: string, url: string, isStrikingDistance: boolean}>}
 */
export function resolveSyllabusNodesForQuestion(q, limit = 3) {
  if (!q) return [];
  const { allNodes } = getSyllabusNodeCatalog();
  if (!allNodes.length) return [];

  const canonicalSubject = normalizeSubjectName(q.srcSubject);
  const srcTopic = (q.srcTopic || '').trim();
  const coreEntity = extractCoreSubjectEntity(q).toLowerCase();

  let optText = '';
  if (Array.isArray(q.options)) {
    optText = q.options.map(o => o?.text || '').join(' ');
  } else if (typeof q.options === 'string') {
    optText = q.options;
  }

  const fullTextLower = `${coreEntity} ${q.stem || ''} ${optText} ${q.srcTopic || ''}`.toLowerCase();
  const questionTokens = tokenize(`${coreEntity} ${q.stem || ''} ${optText}`);
  const questionTokenSet = new Set(questionTokens);

  const scored = [];

  for (const node of allNodes) {
    let score = 0;

    // 1. Subject & Topic alignment
    const sameSubject = canonicalSubject && node.subject === canonicalSubject;
    if (sameSubject) {
      score += 10;
    }

    if (srcTopic && node.topics.includes(srcTopic)) {
      score += 35;
    } else if (srcTopic && node.alsoRelevantTopics.includes(srcTopic)) {
      score += 22;
    } else if (
      srcTopic &&
      node.topics.some(t => t.toLowerCase() === srcTopic.toLowerCase())
    ) {
      score += 32;
    }

    // 2. Phrase match between node title segments and question stem / entity
    for (const phrase of node.titlePhrases) {
      if (phrase.length >= 5 && fullTextLower.includes(phrase)) {
        score += 24;
      }
    }

    if (coreEntity && coreEntity.length >= 4 && node.title.toLowerCase().includes(coreEntity)) {
      score += 28;
    }

    // 3. Token overlap with node title, themes/subtopics, and prelimsNote
    let titleHits = 0;
    let themeHits = 0;
    let noteHits = 0;

    for (const tok of questionTokenSet) {
      if (node.titleTokens.has(tok)) titleHits++;
      if (node.themeTokens.has(tok)) themeHits++;
      if (node.noteTokens.has(tok)) noteHits++;
    }

    score += titleHits * 7 + Math.min(themeHits, 5) * 4 + Math.min(noteHits, 6) * 2;

    // 4. Boost Page 2–3 striking-distance nodes when topically relevant
    const isStrikingDistance = STRIKING_DISTANCE_NODE_SLUGS.has(node.slug);
    if (isStrikingDistance && score >= 18) {
      score += 6;
    }

    if (score >= 16) {
      scored.push({
        node,
        score,
        isStrikingDistance,
      });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  const selected = [];
  const seenSlugs = new Set();

  for (const item of scored) {
    if (seenSlugs.has(item.node.slug)) continue;
    seenSlugs.add(item.node.slug);
    selected.push({
      slug: item.node.slug,
      title: item.node.title,
      subject: item.node.subject,
      module: item.node.module,
      gsPapers: item.node.gsPapers || 'GS',
      prelimsNotePreview:
        item.node.prelimsNotePreview ||
        (item.node.keyThemes
          ? `Key Themes: ${item.node.keyThemes.slice(0, 135)}…`
          : `Complete UPSC syllabus framework, key themes, and PYQ analysis for ${item.node.title}.`),
      url: `/node/${item.node.slug}`,
      isStrikingDistance: item.isStrikingDistance,
    });
    if (selected.length >= limit) break;
  }

  return selected;
}

/**
 * Resolves metadata and sibling /node/[slug] links for a given syllabus node slug
 * so /node/[slug] pages can cross-link to related syllabus nodes and PYQ topics.
 */
export function getNodeBridgeContextBySlug(slug) {
  if (!slug) return { catalogNode: null, relatedNodes: [], mappedTopics: [] };
  const { allNodes, slugToNode } = getSyllabusNodeCatalog();
  const catalogNode = slugToNode.get(slug) || null;
  if (!catalogNode) return { catalogNode: null, relatedNodes: [], mappedTopics: [] };

  const mappedTopics = Array.from(
    new Set([...(catalogNode.topics || []), ...(catalogNode.alsoRelevantTopics || [])])
  );

  const relatedNodes = allNodes
    .filter(n => n.slug !== slug && n.subject === catalogNode.subject)
    .map(n => {
      let relScore = 0;
      if (n.module === catalogNode.module) relScore += 20;
      for (const t of catalogNode.topics || []) {
        if (n.topics.includes(t)) relScore += 15;
      }
      if (STRIKING_DISTANCE_NODE_SLUGS.has(n.slug)) relScore += 5;
      return { n, relScore };
    })
    .filter(x => x.relScore > 0)
    .sort((a, b) => b.relScore - a.relScore)
    .slice(0, 4)
    .map(({ n }) => ({
      slug: n.slug,
      title: n.title,
      module: n.module,
      subject: n.subject,
      url: `/node/${n.slug}`,
    }));

  return {
    catalogNode,
    relatedNodes,
    mappedTopics,
  };
}
