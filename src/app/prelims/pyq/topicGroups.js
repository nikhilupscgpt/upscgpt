// Sidebar grouping of micro-topics (display only — the DB keeps flat srcTopic values).
// Any topic not listed for a subject falls into a trailing "More" group.

export const TOPIC_GROUPS = {
  'Indian Polity': [
    ['Foundations', [
      'Historical Background', 'Constituent Assembly', 'Salient Features of the Constitution',
      'Schedules of the Constitution', 'Political Theory & Concepts', 'Preamble',
      'Citizenship', 'Fundamental Rights', 'Directive Principles of State Policy',
      'Fundamental Duties', 'Basic Structure', 'Constitutional Amendments'
    ]],
    ['Federalism & Local Govt', [
      'Federal System', 'Centre-State Relations', 'Inter-State Relations',
      'Panchayati Raj', 'Municipalities', 'Scheduled & Tribal Areas'
    ]],
    ['The Executive', [
      'President', 'Vice-President', 'Prime Minister & Council of Ministers',
      'Union Executive & Ministries', 'Attorney General & Solicitor General',
      'Governor', 'Emergency Provisions'
    ]],
    ['The Legislature', [
      'Parliamentary System', 'Parliament', 'Parliamentary Committees',
      'Budget & Financial Procedure', 'State Legislature'
    ]],
    ['The Judiciary', [
      'Supreme Court', 'High Courts', 'Subordinate Courts',
      'Tribunals', 'Judicial Review & Landmark Judgements'
    ]],
    ['Constitutional & Statutory Bodies', [
      'Comptroller and Auditor General', 'Finance Commission',
      'National Commissions (SC/ST/BC/Women/Minorities)',
      'Statutory & Non-Constitutional Bodies'
    ]],
    ['Elections & Representation', [
      'Elections & Representation', 'Elections & Political Parties'
    ]],
    ['Other & Applied', [
      'National Symbols & Awards', 'Miscellaneous', 'International Organisations & Relations',
      'International Organisations & Groupings', 'Country Profiles'
    ]],
  ],
  Economy: [
    ['Macro Foundations', ['Basic Economic Concepts', 'National Income & Growth', 'Inflation', 'Planning', 'Poverty, Unemployment & Human Development']],
    ['Money & Finance', ['Banking & RBI', 'Monetary Policy', 'Capital Markets & Financial Instruments']],
    ['Government & Trade', [
      'Fiscal Policy & Budget', 'Taxation & GST', 'Balance of Payments & Exchange Rate',
      'International Economic Organisations & Trade', 'Foreign Investment',
    ]],
    ['Sectors & Schemes', ['Industry & Infrastructure', 'Social Sector Schemes']],
  ],
  Geography: [
    ['Physical', ['Universe & Solar System', 'Geomorphology', 'Climatology', 'Oceanography', 'Indian Physiography & Drainage', 'Soils & Natural Vegetation']],
    ['Human & Economic', ['Agriculture & Resources', 'Industry, Transport & Trade', 'Population & Human Geography']],
    ['World', ['World Geography & Places', 'Miscellaneous Geography']],
  ],
  'Science & Technology': [
    ['Core Sciences', ['General Science', 'Physics', 'Chemistry', 'Biology']],
    ['Applied Science', ['Biotechnology & Genetics', 'Health, Diseases & Medicine', 'Nanotechnology & Materials']],
    ['Tech & Energy', ['IT, Communication & Computing', 'Space Technology', 'Nuclear & Energy Technology', 'Defence Technology']],
  ],
  'Modern History': [
    ['Foundations', ['Advent of Europeans & British Expansion', 'Revolt of 1857, Tribal & Peasant Movements']],
    ['Reform & Nationalism', ['Socio-Religious Reform Movements', 'Early Nationalism & Congress (1885-1919)', 'Gandhian Era & Mass Movements (1915-1947)']],
    ['Governance & People', ['Constitutional & Administrative Developments', 'Personalities, Press & Culture', 'Miscellaneous']],
  ],
  'Ancient History': [
    ['Prehistory & Early Civilisations', ['Prehistory & Indus Valley Civilisation', 'Vedic Age']],
    ['Heterodox Sects & Empires', ['Mahajanapadas & Mauryas', 'Buddhism & Jainism', 'Post-Mauryan & Sangam Age', 'Guptas & Post-Guptas']],
    ['General & Survey', ['Ancient History – General']],
  ],
  'Medieval History': [
    ['Early Medieval & Sultanate', ['Early Medieval Kingdoms', 'Delhi Sultanate']],
    ['Deccan & Regional States', ['Vijayanagara & Bahmani', 'Marathas & Regional States']],
    ['The Mughal Era', ['Mughal Empire']],
    ['General & Survey', ['Medieval History – General']],
  ],
  'Art & Culture': [
    ['Visual Arts', ['Architecture & Sculpture', 'Painting & Handicrafts']],
    ['Philosophy & Literature', ['Philosophy & Religion', 'Literature & Languages']],
    ['Performing & Living Culture', ['Dance, Music, Theatre & Puppetry', 'Festivals, Martial Arts & Miscellaneous Culture']],
  ],
  Environment: [
    ['Ecology & Biodiversity', ['Ecology & Ecosystems', 'Biodiversity & Conservation']],
    ['Pollution & Climate Change', ['Environmental Pollution', 'Climate Change']],
    ['Laws & Institutions', ['Environmental Laws, Policies & Institutions']],
  ],
  Agriculture: [
    ['Agronomy & Practices', ['Soil, Fertilizers & Farming Practices', 'Major Crops', 'Cropping Patterns & Systems', 'Irrigation & Water Management']],
    ['Agricultural Economics & Policy', ['Agriculture & Economy', 'Agricultural Pricing & Procurement (MSP)', 'Agricultural Credit & Schemes', 'Agricultural Marketing & Trade']],
  ],
};

// Pre-computed subject -> topic -> 1-based order map for O(1) canonical syllabus sorting
const SYLLABUS_ORDER_MAP = {};
for (const [sub, groups] of Object.entries(TOPIC_GROUPS)) {
  SYLLABUS_ORDER_MAP[sub] = {};
  let seq = 1;
  for (const [, topics] of groups) {
    for (const t of topics) {
      SYLLABUS_ORDER_MAP[sub][t] = seq++;
    }
  }
}

/**
 * Returns a numerical syllabusOrder for a given subject and topic.
 * Lower numbers appear first in the official syllabus flow.
 */
export function getTopicSyllabusOrder(subject, topic) {
  if (!topic) return 9999;
  return SYLLABUS_ORDER_MAP[subject]?.[topic] ?? 999;
}

/** Returns [{ label, items: [[topic, count], ...] }] for a subject, given [[topic,count],...] */
export function groupTopics(subject, topicCounts) {
  const groups = TOPIC_GROUPS[subject];
  if (!groups) return [{ label: null, items: topicCounts }];

  const countMap = new Map(topicCounts);
  const used = new Set();
  const out = [];

  for (const [label, names] of groups) {
    const items = names.filter(n => countMap.has(n)).map(n => { used.add(n); return [n, countMap.get(n)]; });
    if (items.length) out.push({ label, items });
  }
  const rest = topicCounts.filter(([n]) => !used.has(n));
  if (rest.length) out.push({ label: out.length ? 'More' : null, items: rest });
  return out;
}

export const SUBJECT_SHORT = {
  'Indian Polity': 'Polity',
  'Science & Technology': 'Sci & Tech',
  'Modern History': 'Modern Hist.',
  'Ancient History': 'Ancient Hist.',
  'Medieval History': 'Medieval Hist.',
  'Art & Culture': 'Art & Culture',
};

export const SUBJECT_ORDER = [
  'Indian Polity', 'Geography', 'Economy', 'Environment', 'Science & Technology',
  'Modern History', 'Ancient History', 'Medieval History', 'Art & Culture', 'Agriculture',
];
