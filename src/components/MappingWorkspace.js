'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';

const MappingCanvas = dynamic(() => import('./MappingCanvas'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#475569',
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      Loading interactive map...
    </div>
  ),
});

const STATIC_INDIA_FOLDERS = [
  {
    id: 'india-rivers',
    title: 'Rivers & Drainage Systems',
    shortLabel: 'Rivers & Lakes',
    emoji: '🏞️',
    color: '#0284c7',
    categories: ['India – rivers, lakes, reservoirs & glaciers'],
  },
  {
    id: 'india-relief',
    title: 'Mountain Ranges, Passes & Islands',
    shortLabel: 'Relief & Passes',
    emoji: '⛰️',
    color: '#7c3aed',
    categories: ['India – relief, hills, coasts & islands'],
  },
  {
    id: 'india-protected',
    title: 'National Parks & Tiger Reserves',
    shortLabel: 'Protected Areas',
    emoji: '🐅',
    color: '#10b981',
    categories: ['Protected areas (NPs, WLS, tiger reserves)'],
  },
  {
    id: 'india-wetlands',
    title: 'Wetlands & Ramsar Sites',
    shortLabel: 'Wetlands',
    emoji: '🦩',
    color: '#0d9488',
    categories: ['Wetlands & Ramsar sites'],
  },
  {
    id: 'india-ports',
    title: 'Ports & Strategic Corridors',
    shortLabel: 'Ports & Corridors',
    emoji: '⚓',
    color: '#2563eb',
    categories: ['Ports, highways & corridors'],
  },
  {
    id: 'india-minerals-heritage',
    title: 'Minerals, Energy & Heritage',
    shortLabel: 'Minerals & Heritage',
    emoji: '⛏️',
    color: '#d97706',
    categories: [
      'Minerals & resources by place',
      'Energy & industrial sites',
      'Historical & archaeological sites',
      'Tribes, communities & cultural places',
    ],
  },
];

const STATIC_WORLD_FOLDERS = [
  {
    id: 'world-physical',
    title: 'Major Rivers, Mountains & Lakes',
    shortLabel: 'Physical Features',
    emoji: '🏔️',
    color: '#0284c7',
    categories: ['World – physical features'],
  },
  {
    id: 'world-landforms',
    title: 'Volcanoes, Deserts & Plateaus',
    shortLabel: 'Landforms',
    emoji: '🌋',
    color: '#e11d48',
    categories: ['Landforms & volcanoes'],
  },
  {
    id: 'world-minerals',
    title: 'Global Mineral & Resource Belts',
    shortLabel: 'Minerals',
    emoji: '⛏️',
    color: '#d97706',
    categories: ['Minerals & resources by place'],
  },
];

const IR_FOLDERS = [
  {
    id: 'ir-groupings',
    title: 'International Groupings & Blocs',
    shortLabel: 'IR Groupings',
    emoji: '🏛️',
    color: '#d97706',
    isOrgFolder: true,
    categories: [],
  },
  {
    id: 'ir-chokepoints',
    title: 'Maritime Chokepoints, Straits & Seas',
    shortLabel: 'Borders & Seas',
    emoji: '🌊',
    color: '#2563eb',
    categories: ['World – countries, borders & seas'],
  },
  {
    id: 'ir-projects',
    title: 'Strategic Projects & Ports Abroad',
    shortLabel: 'Strategic Projects',
    emoji: '🛰️',
    color: '#ea580c',
    categories: ['Strategic projects abroad'],
  },
  {
    id: 'ir-flashpoints',
    title: 'Conflict Zones & Flashpoints',
    shortLabel: 'Flashpoints',
    emoji: '⚔️',
    color: '#dc2626',
    categories: ['World – places in news'],
  },
];

const PIN_THEMATIC_FOLDERS = [
  {
    id: 'pin-wetlands',
    title: 'Wetlands & Ramsar Sites',
    shortLabel: 'Wetlands',
    emoji: '🦩',
    color: '#0d9488',
    categories: ['Wetlands & Ramsar sites'],
  },
  {
    id: 'pin-protected',
    title: 'Protected Areas & Corridors',
    shortLabel: 'Protected Areas',
    emoji: '🐅',
    color: '#10b981',
    categories: ['Protected areas (NPs, WLS, tiger reserves)'],
  },
  {
    id: 'pin-india-phys',
    title: 'India Rivers, Dams & Relief',
    shortLabel: 'India Physical',
    emoji: '🏞️',
    color: '#0284c7',
    categories: [
      'India – rivers, lakes, reservoirs & glaciers',
      'India – relief, hills, coasts & islands',
      'Ports, highways & corridors',
      'Minerals & resources by place',
      'Energy & industrial sites',
    ],
  },
  {
    id: 'pin-world-seas',
    title: 'World Borders, Seas & Landforms',
    shortLabel: 'Borders & Seas',
    emoji: '🌊',
    color: '#2563eb',
    categories: [
      'World – countries, borders & seas',
      'World – physical features',
      'Landforms & volcanoes',
    ],
  },
  {
    id: 'pin-world-news',
    title: 'Global Flashpoints',
    shortLabel: 'Flashpoints',
    emoji: '⚔️',
    color: '#dc2626',
    categories: ['World – places in news', 'Strategic projects abroad'],
  },
  {
    id: 'pin-heritage',
    title: 'Heritage, Cultural & Tribal Sites',
    shortLabel: 'Heritage & Tribes',
    emoji: '🏛️',
    color: '#db2777',
    categories: [
      'Historical & archaeological sites',
      'Tribes, communities & cultural places',
    ],
  },
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getNodeDateStr(node) {
  const raw = node?.date || node?.newsTriggers?.[0]?.date || '';
  if (!raw || typeof raw !== 'string') return null;
  const m = raw.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

function formatDayLabel(dateStr) {
  if (!dateStr) return '';
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return dateStr;
  const year = parseInt(m[1], 10);
  const monthIdx = parseInt(m[2], 10) - 1;
  const day = parseInt(m[3], 10);
  const dt = new Date(year, monthIdx, day);
  const wkDay = WEEKDAY_SHORT[dt.getDay()] || '';
  return `${wkDay ? `${wkDay}, ` : ''}${day} ${MONTH_SHORT[monthIdx] || m[2]} ${year}`;
}

function formatDayShort(dateStr) {
  if (!dateStr) return '';
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return dateStr;
  const year = m[1];
  const monthIdx = parseInt(m[2], 10) - 1;
  const day = parseInt(m[3], 10);
  return `${day} ${MONTH_SHORT[monthIdx] || m[2]} ${year}`;
}

function getMonthKey(dateStr) {
  if (!dateStr) return null;
  const m = dateStr.match(/^(\d{4})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}` : null;
}

function formatMonthLabel(monthKey) {
  if (!monthKey) return '';
  const m = monthKey.match(/^(\d{4})-(\d{2})/);
  if (!m) return monthKey;
  const year = m[1];
  const monthIdx = parseInt(m[2], 10) - 1;
  return `${MONTH_NAMES[monthIdx] || m[2]} ${year}`;
}

function formatMonthShort(monthKey) {
  if (!monthKey) return '';
  const m = monthKey.match(/^(\d{4})-(\d{2})/);
  if (!m) return monthKey;
  const year = m[1];
  const monthIdx = parseInt(m[2], 10) - 1;
  return `${MONTH_SHORT[monthIdx] || m[2]} ${year}`;
}

function getWeekInfo(dateStr) {
  if (!dateStr) return null;
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const year = parseInt(m[1], 10);
  const monthIdx = parseInt(m[2], 10) - 1;
  const day = parseInt(m[3], 10);
  const wk = Math.min(5, Math.ceil(day / 7));
  const lastDayOfMonth = new Date(year, monthIdx + 1, 0).getDate();
  const startDay = (wk - 1) * 7 + 1;
  const endDay = wk === 5 ? lastDayOfMonth : Math.min(wk * 7, lastDayOfMonth);
  const monShort = MONTH_SHORT[monthIdx] || m[2];
  return {
    key: `${m[1]}-${m[2]}-W${wk}`,
    label: `${monShort} ${year} · Week ${wk} (${startDay}–${endDay} ${monShort})`,
    shortLabel: `${monShort} Wk ${wk} (${startDay}–${endDay})`,
  };
}

/**
 * Strips internal database PYQ IDs like (ENV-UPSC-2023-03) or GEO-UPSC-2015-08
 * and robotic AI preambles from any mapping text string.
 */
function stripInternalCodes(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\(\s*(?:[A-Z]{2,5}-UPSC-\d{4}-\d{1,3}(?:\s*(?:,|and|&)\s*[A-Z]{2,5}-UPSC-\d{4}-\d{1,3})*)\s*\)/gi, '')
    .replace(/\b[A-Z]{2,5}-UPSC-\d{4}-\d{1,3}\b/g, '')
    .replace(/^Directly?\s+(?:tested|reinforcement|aligned|relevant)\s+(?:in|of|with|to)\s+UPSC[^:—–-]*[:—–-]\s*/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * 1A. Returns a clean, human place heading, e.g. "Sehore (Madhya Pradesh)"
 * instead of "Sehore (Bherunda Teak Belt and Saru Maru Buddhist Site)".
 */
function formatCleanPlaceHeading(node) {
  if (!node) return '';
  const raw = (node.place || '').trim();
  const parenMatch = raw.match(/^([^(]+?)\s*\(([^)]+)\)$/);
  if (!parenMatch) {
    const stateOrCountry =
      node.regionScope === 'World'
        ? node.locatedIn?.country
        : node.locatedIn?.stateOrProvince;
    if (
      stateOrCountry &&
      !raw.toLowerCase().includes(stateOrCountry.toLowerCase()) &&
      stateOrCountry.length <= 24
    ) {
      return `${raw} (${stateOrCountry})`;
    }
    return raw;
  }

  const baseName = parenMatch[1].trim();
  const insideParen = parenMatch[2].trim();
  const isNoisyParen =
    insideParen.length > 26 ||
    /\b(belt|basin|corridor|project|site|zone|landfall|headwaters|confluence|monastery|sanctuary|subgroup|oilfield)\b/i.test(
      insideParen
    );

  if (!isNoisyParen) {
    return raw;
  }

  const state = (node.locatedIn?.stateOrProvince || '').replace(/\s*\([^)]*\)/g, '').trim();
  const country = (node.locatedIn?.country || '').replace(/\s*\([^)]*\)/g, '').trim();
  const qualifier =
    node.regionScope === 'World'
      ? country || state
      : state || country;

  if (qualifier && !baseName.toLowerCase().includes(qualifier.toLowerCase())) {
    return `${baseName} (${qualifier})`;
  }
  return baseName;
}

/**
 * 1A-2. Canonical hydrological ordering of all 59 Indian river & confluence nodes.
 * Grouped strictly by Basin -> Sub-Basin -> Main Trunk River first -> Tributaries (North-to-South / West-to-East).
 */
const HYDROLOGICAL_RIVER_ORDER = [
  // 1. HIMALAYAN — Indus River System (Main Trunk -> N-to-S Panjnad Tributaries)
  'indus-river',
  'jhelum-river',
  'chenab-river',
  'ravi-river',
  'beas-river',
  'sutlej-river',

  // 2. HIMALAYAN — Ganga River System (Main Trunk -> Yamuna -> Left-Bank W-to-E -> Right-Bank W-to-E -> Panch Prayags N-to-S)
  'ganga-river',
  'yamuna-river',
  'ramganga-river',
  'gomti-river',
  'ghaghara-river',
  'gandak-river',
  'kosi-river',
  'mahananda-river',
  'chambal-river',
  'betwa-river',
  'ken-river',
  'son-river',
  'damodar-river',
  'vishnuprayag-confluence',
  'nandaprayag-confluence',
  'karnaprayag-confluence',
  'rudraprayag-confluence',
  'devprayag-confluence',

  // 3. HIMALAYAN — Brahmaputra & Barak System (Main Trunks -> Right-Bank -> Left-Bank)
  'brahmaputra-river',
  'barak-river',
  'subansiri-river',
  'kameng-river',
  'manas-river',
  'teesta-river',
  'dibang-river',
  'lohit-river',
  'dhansiri-river',

  // 4. PENINSULAR — West-Flowing Rift Valley Rivers (N-to-S)
  'narmada-river',
  'tapi-river',

  // 5. PENINSULAR — East-Flowing Peninsular River Systems (N-to-S, Main River before Tributaries)
  'mahanadi-river',
  'godavari-river',
  'krishna-river',
  'bhima-river',
  'tungabhadra-river',
  'cauvery-river',

  // 6. COASTAL — West Coast & Inland Rivers (N-to-S: Rajasthan/Gujarat -> Goa -> Karnataka -> Kerala)
  'luni-river',
  'sabarmati-river',
  'mahi-river',
  'mandovi-river',
  'zuari-river',
  'sharavati-river',
  'bharathapuzha-river',
  'periyar-river',

  // 7. COASTAL — East Coast Minor Rivers (N-to-S: Jharkhand/Odisha -> Andhra Pradesh -> Tamil Nadu)
  'subarnarekha-river',
  'baitarani-river',
  'brahmani-river',
  'vamsadhara-river',
  'nagavali-river',
  'pennar-river',
  'palar-river',
  'south-pennar-river',
  'vellar-river',
  'vaigai-river',
];

const MAIN_TRUNK_RIVER_SLUGS = new Set([
  // Himalayan Main Trunks (5)
  'indus-river',
  'ganga-river',
  'yamuna-river',
  'brahmaputra-river',
  'barak-river',
  // Peninsular Main Trunks (6)
  'narmada-river',
  'tapi-river',
  'mahanadi-river',
  'godavari-river',
  'krishna-river',
  'cauvery-river',
  // Coastal Representative Main Trunks (8)
  'luni-river',
  'sabarmati-river',
  'mahi-river',
  'periyar-river',
  'subarnarekha-river',
  'brahmani-river',
  'pennar-river',
  'vaigai-river',
]);

const BASIN_CATCHMENT_STATES = {
  HIMALAYAN: [
    'ladakh',
    'jammu and kashmir',
    'himachal pradesh',
    'punjab',
    'uttarakhand',
    'haryana',
    'delhi',
    'uttar pradesh',
    'rajasthan',
    'bihar',
    'jharkhand',
    'west bengal',
    'sikkim',
    'arunachal pradesh',
    'assam',
    'meghalaya',
    'nagaland',
    'manipur',
    'mizoram',
    'tripura',
  ],
  PENINSULAR: [
    'madhya pradesh',
    'gujarat',
    'maharashtra',
    'chhattisgarh',
    'odisha',
    'telangana',
    'andhra pradesh',
    'karnataka',
    'tamil nadu',
    'kerala',
  ],
  COASTAL: [
    'rajasthan',
    'gujarat',
    'maharashtra',
    'goa',
    'karnataka',
    'kerala',
    'tamil nadu',
    'puducherry',
    'andhra pradesh',
    'odisha',
    'jharkhand',
    'west bengal',
  ],
};

function isMainTrunkRiver(node) {
  if (!node) return false;
  const s = (node.slug || '').toLowerCase();
  return MAIN_TRUNK_RIVER_SLUGS.has(s);
}

function getRiverHydroRank(node) {
  if (!node) return 9999;
  const s = (node.slug || '').toLowerCase();
  const idx = HYDROLOGICAL_RIVER_ORDER.indexOf(s);
  return idx >= 0 ? idx : 999;
}

function getRiverSubBasin(node) {
  if (!node) return 'Drainage Basin';
  const s = (node.slug || '').toLowerCase();
  const id = node.id || '';
  if (['indus-river', 'jhelum-river', 'chenab-river', 'ravi-river', 'beas-river', 'sutlej-river'].includes(s) || id.startsWith('IND-RIV-02')) {
    return 'Indus River System';
  }
  if (s.includes('prayag') || id.startsWith('IND-PRY') || ['ganga-river', 'ramganga-river', 'gomti-river', 'ghaghara-river', 'gandak-river', 'kosi-river', 'mahananda-river', 'yamuna-river', 'chambal-river', 'betwa-river', 'ken-river', 'son-river', 'damodar-river'].includes(s) || id.startsWith('IND-RIV-01')) {
    return 'Ganga River System';
  }
  if (['brahmaputra-river', 'dibang-river', 'lohit-river', 'subansiri-river', 'kameng-river', 'manas-river', 'teesta-river', 'dhansiri-river', 'barak-river'].includes(s) || id.startsWith('IND-RIV-03')) {
    return 'Brahmaputra & Barak System';
  }
  if (['narmada-river', 'tapi-river'].includes(s)) {
    return 'West-Flowing Peninsular Rifts';
  }
  if (['godavari-river', 'krishna-river', 'bhima-river', 'tungabhadra-river', 'cauvery-river', 'mahanadi-river'].includes(s)) {
    return 'East-Flowing Peninsular Systems';
  }
  if (['sabarmati-river', 'mahi-river', 'luni-river', 'mandovi-river', 'zuari-river', 'sharavati-river', 'periyar-river', 'bharathapuzha-river'].includes(s)) {
    return 'West Coast & Inland Rivers (N → S)';
  }
  if (['subarnarekha-river', 'brahmani-river', 'baitarani-river', 'vamsadhara-river', 'nagavali-river', 'palar-river', 'south-pennar-river', 'pennar-river', 'vaigai-river', 'vellar-river'].includes(s)) {
    return 'East Coast Minor Rivers (N → S)';
  }
  return node.basinLabel || 'Drainage Basin';
}

/**
 * 1B. Returns the concise 1-line "Place" geographic anchor:
 * e.g. "Sehore District (Vindhyan Range / Narmada Basin, MP)"
 */
function formatPlaceDescriptor(node) {
  if (!node) return '';
  if (node.locatedIn?.placeLine && typeof node.locatedIn.placeLine === 'string') {
    return node.locatedIn.placeLine.trim();
  }

  const district = (node.locatedIn?.district || '').trim();
  const state = (node.locatedIn?.stateOrProvince || '').trim();
  const country = (node.locatedIn?.country || '').trim();
  const basin = (
    node.locatedIn?.riverBasin ||
    node.locatedIn?.basin ||
    node.locatedIn?.physiography ||
    ''
  ).trim();

  const parts = [];
  if (district) {
    parts.push(
      /district|province|governorate|prefecture|county|atoll|island/i.test(district)
        ? district
        : `${district} District`
    );
  }
  if (state && (!district || !district.toLowerCase().includes(state.toLowerCase()))) {
    parts.push(state);
  }
  if (
    country &&
    country !== 'India' &&
    !parts.some((p) => p.toLowerCase().includes(country.toLowerCase()))
  ) {
    parts.push(country);
  }

  const baseLoc = parts.join(', ') || node.place || node.regionScope || 'India';
  if (basin && basin.length <= 48) {
    return `${baseLoc} (${basin})`;
  }
  return baseLoc;
}

/**
 * 2. Returns a concise, human "Why in News" explanation strictly <= 30 words.
 */
function formatWhyInNews30Words(node) {
  const rawHook = (node?.newsTriggers?.[0]?.newsHook || '').trim();
  if (!rawHook) return '';

  let cleaned = stripInternalCodes(rawHook)
    .replace(
      /^The\s+Indian\s+Express\s+(?:Explained\s+(?:Climate\s+)?section\s+)?(?:published\s+an?\s+[^,]+?\s+on\s+[A-Za-z]+\s+\d+\s+(?:into|on)\s+how\s+|(?:on\s+[A-Za-z]+\s+\d+\s+)?(?:examined|analysed|featured)\s+(?:how\s+)?)/i,
      ''
    )
    .replace(
      /^(?:The\s+)?(?:Union\s+)?(?:Ministry\s+of\s+[A-Za-z\s,&]+|Prime\s+Minister's\s+Office|Vice-President's\s+Secretariat)\s+announced\s+(?:on\s+[A-Za-z]+\s+\d+\s+)?that\s+/i,
      ''
    )
    .trim();

  if (cleaned) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length <= 30) {
    return /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`;
  }

  const sliced = words.slice(0, 30).join(' ').replace(/[,;:\-–—]+$/, '');
  return `${sliced}.`;
}

/**
 * 3. Returns a deduplicated array of concise "Other Importance" items:
 * [{ label: 'Ecology & Geography', text: '...' }, ...]
 */
function formatOtherImportanceList(node) {
  if (!node) return [];
  const rawFacts = Array.isArray(node.staticFacts) ? node.staticFacts : [];
  const seen = new Set();
  const items = [];

  for (const raw of rawFacts) {
    const cleaned = stripInternalCodes(raw);
    if (!cleaned) continue;

    // Parse "*Category:* text" or "Category: text"
    let label = null;
    let body = cleaned;

    const starMatch = cleaned.match(/^\*([^*:]{2,38}):?\*\s*:?\s*(.+)$/);
    const colonMatch = !starMatch
      ? cleaned.match(/^([A-Za-z][A-Za-z0-9 &/–—'-]{2,36}):\s+(.+)$/)
      : null;

    if (starMatch) {
      label = starMatch[1].trim();
      body = starMatch[2].trim();
    } else if (colonMatch) {
      label = colonMatch[1].trim();
      body = colonMatch[2].trim();
    }

    const normKey = body.toLowerCase().slice(0, 65);
    if (seen.has(normKey)) continue;
    seen.add(normKey);

    items.push({
      label,
      text: /[.!?]$/.test(body) ? body : `${body}.`,
    });
  }

  return items;
}

/**
 * 4. Returns concise "Related PYQ" summary bullets:
 * [{ yearLabel: 'UPSC 2015 & 2023', summary: '...' }]
 */
function formatRelatedPyqList(node) {
  if (!node) return [];

  if (Array.isArray(node.upscAngle?.pyqBullets) && node.upscAngle.pyqBullets.length > 0) {
    return node.upscAngle.pyqBullets
      .map((item) => {
        if (typeof item === 'string') {
          const m = item.match(/^\*\*?([^*:]+?)\*\*?:\s*(.+)$/) || item.match(/^([^:]+):\s*(.+)$/);
          if (m) {
            return { yearLabel: m[1].trim(), summary: m[2].trim() };
          }
          return { yearLabel: 'UPSC PYQ', summary: item.trim() };
        }
        if (item && typeof item === 'object') {
          return {
            yearLabel: item.yearLabel || item.year || 'UPSC PYQ',
            summary: item.summary || item.text || '',
          };
        }
        return null;
      })
      .filter((x) => x && x.summary);
  }

  const pyqs = Array.isArray(node.resolvedSimilarPYQs) ? node.resolvedSimilarPYQs : [];
  if (pyqs.length === 0) return [];

  const seenSummaries = new Set();
  const list = [];

  for (const q of pyqs.slice(0, 3)) {
    const yr = q.examYear ? `UPSC ${q.examYear}` : q.exam || 'UPSC Prelims';
    let summary = '';
    if (q.selection && typeof q.selection === 'string') {
      summary = q.selection.trim();
    } else if (q.answerText && typeof q.answerText === 'string' && q.answerText.length > 10 && !/^(1|2|both|neither|all|only)/i.test(q.answerText.trim())) {
      summary = `${q.subject || 'Mapping'} — ${q.answerText.trim()}`;
    } else if (q.stem) {
      const firstLine = q.stem.split('\n')[0].replace(/consider the following statements\s*(with reference to|regarding|about)?\s*/i, '').replace(/[:?]$/, '').trim();
      summary = firstLine.length > 95 ? `${firstLine.slice(0, 92)}…` : firstLine;
    }
    if (!summary) continue;
    const key = summary.toLowerCase().slice(0, 45);
    if (seenSummaries.has(key)) continue;
    seenSummaries.add(key);
    list.push({
      yearLabel: yr,
      summary: /[.!?]$/.test(summary) ? summary : `${summary}.`,
    });
  }

  return list;
}

function buildSynthesizedMcq(node) {
  if (!node) return null;
  const cleanTitle = formatCleanPlaceHeading(node);
  const loc =
    node.locatedIn?.stateOrProvince ||
    node.locatedIn?.country ||
    node.regionScope ||
    'India';
  const cleanFacts = formatOtherImportanceList(node);
  const fact1 =
    cleanFacts[0]?.text ||
    `${cleanTitle} is classified as a ${node.placeType || 'key geographical feature'} located in ${loc}.`;
  const fact2 =
    cleanFacts[1]?.text ||
    (node.neighbours?.length
      ? `Its surrounding geographical neighbourhood includes ${node.neighbours.slice(0, 3).join(', ')}.`
      : `It was recently in news in connection with ${node.subject || 'Geography & Environment'}.`);

  return {
    id: `SYNTH-MCQ-${node.id}`,
    exam: 'UPSC Prelims Practice Drill',
    examYear: node.targetExamYear || 2026,
    isSynthesized: true,
    stem: `With reference to '${cleanTitle}', recently seen in the news, consider the following statements:\n1. ${fact1}\n2. ${fact2}\nWhich of the statements given above is/are correct?`,
    options: [
      { label: 'a', text: '1 only' },
      { label: 'b', text: '2 only' },
      { label: 'c', text: 'Both 1 and 2' },
      { label: 'd', text: 'Neither 1 nor 2' },
    ],
    correctLabel: 'c',
    answerText: 'Both 1 and 2',
    explanation: `Both statements accurately describe ${cleanTitle} (${node.placeType}, ${loc}).`,
  };
}

export default function MappingWorkspace({
  initialMode = null, // null (Landing) | 'STATIC_INDIA' | 'STATIC_WORLD' | 'PIN' | 'IR'
}) {
  const [activeMode, setActiveMode] = useState(initialMode);
  const [staticExpanded, setStaticExpanded] = useState(false);

  // Mobile responsiveness
  const [isMobile, setIsMobile] = useState(false);
  const [mobileTab, setMobileTab] = useState('map'); // 'map' | 'places' | 'study'

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filters inside the map view
  const [pinScope, setPinScope] = useState('ALL'); // 'ALL' | 'India' | 'World'
  const [pinTimeMode, setPinTimeMode] = useState('DAY'); // 'DAY' | 'WEEK' | 'MONTH' | 'ALL'
  const [selectedPinPeriod, setSelectedPinPeriod] = useState('ALL');
  const [selectedThemeFilter, setSelectedThemeFilter] = useState(null); // null = Level 1 Layer Chooser screen | folder.id | 'ALL'
  const [selectedRiverBasin, setSelectedRiverBasin] = useState(null); // null = Step 2 Choose Basin | 'HIMALAYAN' | 'PENINSULAR' | 'COASTAL' | 'ALL'
  const [activeSubBasin, setActiveSubBasin] = useState(null); // null | 'Indus River System' | 'Ganga River System' | etc.
  const [collapsedSubBasins, setCollapsedSubBasins] = useState({});
  const [collapsedFolders, setCollapsedFolders] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [basemap, setBasemap] = useState('light'); // 'light' (Clean) | 'topo' (Terrain) | 'satellite' (Satellite)
  const [panelMode, setPanelMode] = useState('STUDY'); // 'STUDY' | 'PRACTICE'

  // Data
  const [allNodes, setAllNodes] = useState([]);
  const [allPyqs, setAllPyqs] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selection & Study Progress
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeOrg, setActiveOrg] = useState(null);
  const [studiedIds, setStudiedIds] = useState(() => new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState(() => new Set());
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [revealedQuestions, setRevealedQuestions] = useState({});

  // Floating On-Map PYQ Challenge Dock: 'collapsed' | 'expanded' | 'hidden'
  const [mapPyqDockMode, setMapPyqDockMode] = useState('collapsed');
  const [mapPyqIndex, setMapPyqIndex] = useState(0);

  // Reset floating question index when selected place changes
  useEffect(() => {
    setMapPyqIndex(0);
    setMapPyqDockMode('collapsed');
  }, [selectedNode?.id]);

  const [cameraTarget, setCameraTarget] = useState({
    center: [23.5, 79.5],
    zoom: 5,
    ts: 0,
  });

  useEffect(() => {
    let cancelled = false;
    async function fetchWorkspace() {
      setLoading(true);
      try {
        const res = await fetch('/api/mapping/workspace');
        const data = await res.json();
        if (!cancelled && res.ok) {
          const rawNodes = Array.isArray(data.nodes) ? data.nodes : [];
          const seenIds = new Set();
          const uniqueNodes = rawNodes.map((n, idx) => {
            let uid = n.id || n.dbId || `node-${idx}`;
            if (seenIds.has(uid)) {
              uid = `${uid}-${n.dbId || n.slug || idx}`;
            }
            seenIds.add(uid);
            return uid === n.id ? n : { ...n, id: uid };
          });
          setAllNodes(uniqueNodes);
          setAllPyqs(Array.isArray(data.pyqs) ? data.pyqs : []);
          setOrganizations(Array.isArray(data.organizations) ? data.organizations : []);

          // Auto-select node if requested via query parameter (?node=... or ?slug=...)
          if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const target = params.get('node') || params.get('slug') || params.get('place');
            if (target) {
              const matched = uniqueNodes.find(
                (n) => n.slug === target || n.id === target || n.linkedIssueSlug === target
              );
              if (matched) {
                setSelectedNode(matched);
                if (typeof matched.lat === 'number' && typeof matched.lng === 'number') {
                  setCameraTarget({
                    center: [matched.lat, matched.lng],
                    zoom: 7.2,
                    ts: Date.now(),
                  });
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load mapping workspace:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchWorkspace();
    return () => {
      cancelled = true;
    };
  }, []);

  // All PIN nodes (before scope or period filtering)
  const allPinNodes = useMemo(() => allNodes.filter((n) => n.isPin), [allNodes]);

  // Master Prelims Core pins count
  const masterPinsCount = useMemo(
    () => allPinNodes.filter((n) => n.isMaster || n.tier === 'master').length,
    [allPinNodes]
  );

  // PIN nodes matching the active Day / Week / Month / All / Master period
  const periodMatchedPinNodes = useMemo(() => {
    if (pinTimeMode === 'MASTER') {
      return allPinNodes.filter((n) => n.isMaster || n.tier === 'master');
    }
    if (pinTimeMode === 'ALL' || selectedPinPeriod === 'ALL') {
      return allPinNodes;
    }
    return allPinNodes.filter((n) => {
      const dStr = getNodeDateStr(n);
      if (!dStr) return false;
      if (pinTimeMode === 'DAY') return dStr === selectedPinPeriod;
      if (pinTimeMode === 'WEEK') return getWeekInfo(dStr)?.key === selectedPinPeriod;
      if (pinTimeMode === 'MONTH') return getMonthKey(dStr) === selectedPinPeriod;
      return true;
    });
  }, [allPinNodes, pinTimeMode, selectedPinPeriod]);

  // Live Scope Counts (All X | India Y | World Z) for the current period
  const scopeCounts = useMemo(() => {
    let india = 0;
    let world = 0;
    for (const n of periodMatchedPinNodes) {
      if ((n.regionScope || '').toLowerCase() === 'world') world++;
      else india++;
    }
    return {
      all: periodMatchedPinNodes.length,
      india,
      world,
    };
  }, [periodMatchedPinNodes]);

  // Available Day / Week / Month periods computed from allPinNodes (or scope-filtered if needed)
  const availablePinPeriods = useMemo(() => {
    if (pinTimeMode === 'ALL' || pinTimeMode === 'MASTER') return [];
    const map = new Map();

    for (const n of allPinNodes) {
      if (pinScope !== 'ALL' && (n.regionScope || '').toLowerCase() !== pinScope.toLowerCase()) {
        continue;
      }
      const dStr = getNodeDateStr(n);
      if (!dStr) continue;

      if (pinTimeMode === 'DAY') {
        if (!map.has(dStr)) {
          map.set(dStr, {
            key: dStr,
            label: formatDayLabel(dStr),
            shortLabel: formatDayShort(dStr),
            count: 0,
          });
        }
        map.get(dStr).count++;
      } else if (pinTimeMode === 'WEEK') {
        const wkInfo = getWeekInfo(dStr);
        if (wkInfo) {
          if (!map.has(wkInfo.key)) {
            map.set(wkInfo.key, {
              key: wkInfo.key,
              label: wkInfo.label,
              shortLabel: wkInfo.shortLabel,
              count: 0,
            });
          }
          map.get(wkInfo.key).count++;
        }
      } else if (pinTimeMode === 'MONTH') {
        const mKey = getMonthKey(dStr);
        if (mKey) {
          if (!map.has(mKey)) {
            map.set(mKey, {
              key: mKey,
              label: formatMonthLabel(mKey),
              shortLabel: formatMonthShort(mKey),
              count: 0,
            });
          }
          map.get(mKey).count++;
        }
      }
    }

    return Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key));
  }, [allPinNodes, pinScope, pinTimeMode]);

  // Auto-select latest available period when in DAY / WEEK / MONTH mode
  useEffect(() => {
    if (pinTimeMode === 'ALL') {
      setSelectedPinPeriod('ALL');
      return;
    }
    if (availablePinPeriods.length === 0) {
      setSelectedPinPeriod('ALL');
      return;
    }
    const exists = availablePinPeriods.some((p) => p.key === selectedPinPeriod);
    if (!exists) {
      setSelectedPinPeriod(availablePinPeriods[0].key);
    }
  }, [pinTimeMode, availablePinPeriods, selectedPinPeriod]);

  // Base nodes belonging to the active mode + scope + time period
  const modeBaseNodes = useMemo(() => {
    if (!activeMode) return [];
    if (activeMode === 'STATIC_INDIA') {
      return allNodes.filter(
        (n) => !n.isPin && n.pillar === 'STATIC' && (n.regionScope || '').toLowerCase() === 'india'
      );
    }
    if (activeMode === 'STATIC_WORLD') {
      return allNodes.filter(
        (n) => !n.isPin && n.pillar === 'STATIC' && (n.regionScope || '').toLowerCase() === 'world'
      );
    }
    if (activeMode === 'PIN') {
      return periodMatchedPinNodes.filter((n) => {
        if (pinScope === 'ALL') return true;
        return (n.regionScope || '').toLowerCase() === pinScope.toLowerCase();
      });
    }
    if (activeMode === 'IR') {
      return allNodes.filter((n) => !n.isPin && n.pillar === 'IR');
    }
    return [];
  }, [allNodes, activeMode, periodMatchedPinNodes, pinScope]);

  // Build Thematic Containers (Layer 2) with sequential numbering (1, 2, 3...)
  const { folders, numberedNodes } = useMemo(() => {
    if (!activeMode) return { folders: [], numberedNodes: [] };

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = (n) => {
      if (!q) return true;
      return (
        (n.place || '').toLowerCase().includes(q) ||
        (n.placeType || '').toLowerCase().includes(q) ||
        (n.locatedIn?.stateOrProvince || '').toLowerCase().includes(q) ||
        (n.locatedIn?.district || '').toLowerCase().includes(q) ||
        (n.locatedIn?.country || '').toLowerCase().includes(q)
      );
    };

    const filteredBase = modeBaseNodes.filter((n) => {
      if (!matchesSearch(n)) return false;
      if (selectedRiverBasin && selectedRiverBasin !== 'ALL') {
        const isRiver = Boolean(
          n.basinGroup ||
          n.category === 'river' ||
          (n.mapCategory && n.mapCategory.some((c) => c.includes('rivers'))) ||
          n.riverDetails
        );
        if (isRiver && n.basinGroup !== selectedRiverBasin) {
          return false;
        }
      }
      return true;
    });

    let folderDefs = PIN_THEMATIC_FOLDERS;
    if (activeMode === 'STATIC_INDIA') folderDefs = STATIC_INDIA_FOLDERS;
    else if (activeMode === 'STATIC_WORLD') folderDefs = STATIC_WORLD_FOLDERS;
    else if (activeMode === 'IR') folderDefs = IR_FOLDERS;

    const knownCats = new Set(folderDefs.flatMap((f) => f.categories));
    let runningIndex = 1;
    const flatList = [];
    const assignedNodeIds = new Set();

    const builtFolders = folderDefs
      .map((f) => {
        if (f.isOrgFolder) {
          return {
            ...f,
            items: organizations,
          };
        }
        const matchedItems = filteredBase
          .filter((n) => {
            if (assignedNodeIds.has(n.id)) return false;
            const cats = n.mapCategory || [];
            const primaryCat = cats[0] || '';
            // Match primary category first; or secondary if primary is not a known category
            const isMatch =
              f.categories.includes(primaryCat) ||
              (!knownCats.has(primaryCat) && cats.some((c) => f.categories.includes(c))) ||
              (activeMode === 'PIN' &&
                !cats.some((c) => knownCats.has(c)) &&
                ((n.regionScope || '').toLowerCase() === 'world'
                  ? f.id === 'pin-world-news'
                  : f.id === 'pin-india-phys'));

            if (isMatch) {
              assignedNodeIds.add(n.id);
              return true;
            }
            return false;
          })
          .sort((a, b) => {
            if (f.id === 'india-rivers') {
              const rankA = getRiverHydroRank(a);
              const rankB = getRiverHydroRank(b);
              if (rankA !== rankB) return rankA - rankB;
            }
            return (a.place || '').localeCompare(b.place || '');
          });

        const itemsWithIndex = matchedItems.map((item) => {
          const shouldNumber = selectedThemeFilter === 'ALL' || selectedThemeFilter === f.id;
          const idx = shouldNumber ? runningIndex++ : null;
          const enriched = {
            ...item,
            displayIndex: idx,
            folderId: f.id,
            folderTitle: f.title,
            folderShortLabel: f.shortLabel,
            folderColor: f.color,
          };
          if (shouldNumber) {
            flatList.push(enriched);
          }
          return enriched;
        });

        return {
          ...f,
          items: itemsWithIndex,
        };
      })
      .filter((f) => f.items.length > 0);

    return { folders: builtFolders, numberedNodes: flatList };
  }, [activeMode, modeBaseNodes, organizations, searchQuery, selectedThemeFilter, selectedRiverBasin]);

  // Progressive Map Canvas Nodes:
  // - Step 1 (selectedThemeFilter === null): 0 nodes
  // - Step 2 (Rivers Overview, selectedRiverBasin === null, !selectedNode): Main Trunk Rivers of all 3 basins
  // - Step 3 (Basin Overview, selectedRiverBasin selected, !selectedNode): Main Trunk Rivers of that basin (or activeSubBasin if focused)
  // - Step 4 (selectedNode !== null): Rivers of the selected river's Sub-Basin (selected river in 100% crimson, siblings at 18% opacity)
  const mapCanvasNodes = useMemo(() => {
    if (!numberedNodes || numberedNodes.length === 0) return [];
    if (activeMode === 'STATIC_INDIA' && selectedThemeFilter === 'india-rivers') {
      if (selectedNode) {
        const targetSubBasin = getRiverSubBasin(selectedNode);
        return numberedNodes.filter(
          (n) => n.id === selectedNode.id || getRiverSubBasin(n) === targetSubBasin
        );
      }
      if (activeSubBasin) {
        return numberedNodes.filter((n) => getRiverSubBasin(n) === activeSubBasin);
      }
      return numberedNodes.filter((n) => isMainTrunkRiver(n));
    }
    return numberedNodes;
  }, [numberedNodes, activeMode, selectedThemeFilter, selectedNode, activeSubBasin]);

  // Reset theme filter if the selected theme has no items in the newly chosen period
  useEffect(() => {
    if (!selectedThemeFilter || selectedThemeFilter === 'ALL') return;
    const stillExists = folders.some((f) => f.id === selectedThemeFilter);
    if (!stillExists) {
      setSelectedThemeFilter(null);
    }
  }, [folders, selectedThemeFilter]);

  // Keep selectedNode in sync with numberedNodes (NEVER auto-select #1 in STATIC_INDIA or STATIC_WORLD!)
  useEffect(() => {
    if (!activeMode || activeOrg) return;
    if (numberedNodes.length === 0) {
      setSelectedNode(null);
      return;
    }
    if (activeMode === 'STATIC_INDIA' || activeMode === 'STATIC_WORLD') {
      if (!selectedNode) return;
      const currentMatch = numberedNodes.find((n) => n.id === selectedNode.id);
      if (!currentMatch) {
        setSelectedNode(null);
      } else if (currentMatch.displayIndex !== selectedNode.displayIndex) {
        setSelectedNode(currentMatch);
      }
      return;
    }
    const currentMatch = selectedNode
      ? numberedNodes.find((n) => n.id === selectedNode.id)
      : null;
    if (!currentMatch) {
      setSelectedNode(numberedNodes[0]);
    } else if (currentMatch.displayIndex !== selectedNode.displayIndex) {
      setSelectedNode(currentMatch);
    }
  }, [activeMode, numberedNodes, activeOrg, selectedNode]);

  // Mark a node as studied when selected
  useEffect(() => {
    if (!selectedNode?.id) return;
    setStudiedIds((prev) => {
      if (prev.has(selectedNode.id)) return prev;
      const next = new Set(prev);
      next.add(selectedNode.id);
      return next;
    });
  }, [selectedNode?.id]);

  const enterMode = (mode, initialPinTime = 'DAY') => {
    setActiveMode(mode);
    setSelectedNode(null);
    setActiveOrg(null);
    setActiveSubBasin(null);
    setSearchQuery('');
    setPanelMode('STUDY');

    if (mode === 'STATIC_INDIA') {
      // Level 1: Start on Layer Chooser Hub so all layers are NOT opened at once creating clutter!
      setSelectedThemeFilter(null);
      setSelectedRiverBasin(null);
      setCameraTarget({ center: [22.8, 79.5], zoom: 4.8, ts: Date.now() });
    } else if (mode === 'STATIC_WORLD') {
      setSelectedThemeFilter(null);
      setSelectedRiverBasin(null);
      setCameraTarget({ center: [20.0, 18.0], zoom: 2.4, ts: Date.now() });
    } else if (mode === 'PIN') {
      setSelectedThemeFilter('ALL');
      setSelectedRiverBasin('ALL');
      setPinTimeMode(initialPinTime);
      setPinScope('ALL');
      setCameraTarget({ center: [24.0, 78.0], zoom: 4.8, ts: Date.now() });
    } else if (mode === 'IR') {
      setSelectedThemeFilter('ALL');
      setSelectedRiverBasin('ALL');
      setCameraTarget({ center: [24.0, 48.0], zoom: 3, ts: Date.now() });
    }
  };

  // Questions for the selected node (real PYQs + synthesized Prelims practice MCQ fallback)
  const practiceQuestionsForSelected = useMemo(() => {
    if (!selectedNode) return [];
    const realPyqs = Array.isArray(selectedNode.resolvedSimilarPYQs)
      ? selectedNode.resolvedSimilarPYQs
      : [];
    const synth = buildSynthesizedMcq(selectedNode);
    if (realPyqs.length > 0) {
      return realPyqs;
    }
    return synth ? [synth] : [];
  }, [selectedNode]);

  const handleSelectNode = (node) => {
    setActiveOrg(null);
    setSelectedNode(node);
    if (isMobile) {
      setMobileTab('study');
    }
  };

  const handleSelectOrg = (org) => {
    setSelectedNode(null);
    setActiveOrg((prev) => {
      const next = prev?.id === org.id ? null : org;
      if (next && isMobile) {
        setMobileTab('study');
      }
      return next;
    });
  };

  const handleOptionClick = (qId, label) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: label }));
    setRevealedQuestions((prev) => ({ ...prev, [qId]: true }));
  };

  const toggleBookmark = (nodeId) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  // =========================================================================
  // STEP 1: CALM 3-OPTION LANDING SCREEN (When activeMode === null)
  // =========================================================================
  if (!activeMode) {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - 64px)',
          background: '#0b0f19',
          color: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div style={{ maxWidth: 960, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <h1
              style={{
                fontSize: 'clamp(2rem, 3.5vw, 2.6rem)',
                fontWeight: 800,
                margin: 0,
                letterSpacing: '-0.02em',
                color: '#ffffff',
              }}
            >
              Mapping
            </h1>
            <p
              style={{
                fontSize: 15,
                color: '#94a3b8',
                marginTop: 10,
                marginBottom: 0,
              }}
            >
              Choose a mapping module to open the interactive canvas
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            {/* Card 1: Static Mapping */}
            <div
              onClick={() => setStaticExpanded((prev) => !prev)}
              style={{
                background: '#111827',
                border: staticExpanded
                  ? '1.5px solid #10b981'
                  : '1px solid rgba(255,255,255,0.09)',
                borderRadius: 18,
                padding: 28,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'rgba(16, 185, 129, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    marginBottom: 18,
                  }}
                >
                  🗺️
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: '#f8fafc' }}>
                  Static Mapping
                </h2>
                <p style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                  Rivers, mountain ranges, passes, Ramsar wetlands, protected areas, ports, and mineral belts.
                </p>
              </div>

              {staticExpanded ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 10,
                    marginTop: 22,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => enterMode('STATIC_INDIA')}
                    style={{
                      padding: '12px 10px',
                      borderRadius: 10,
                      border: '1px solid rgba(16,185,129,0.4)',
                      background: 'rgba(16,185,129,0.14)',
                      color: '#34d399',
                      fontWeight: 700,
                      fontSize: 13.5,
                      cursor: 'pointer',
                    }}
                  >
                    🇮🇳 India
                  </button>
                  <button
                    type="button"
                    onClick={() => enterMode('STATIC_WORLD')}
                    style={{
                      padding: '12px 10px',
                      borderRadius: 10,
                      border: '1px solid rgba(56,189,248,0.4)',
                      background: 'rgba(56,189,248,0.14)',
                      color: '#38bdf8',
                      fontWeight: 700,
                      fontSize: 13.5,
                      cursor: 'pointer',
                    }}
                  >
                    🌍 World
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    marginTop: 22,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#34d399',
                  }}
                >
                  Select India or World →
                </div>
              )}
            </div>

            {/* Card 2: PIN (Places in News) */}
            <div
              onClick={() => enterMode('PIN', 'DAY')}
              style={{
                background: '#111827',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 18,
                padding: 28,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'rgba(239, 68, 68, 0.14)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    marginBottom: 18,
                  }}
                >
                  📍
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: '#f8fafc' }}>
                  PIN (Places in News)
                </h2>
                <p style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                  Daily, weekly, and monthly current-affairs places with examiner traps, high-yield GS pointers, and linked PYQs.
                </p>
              </div>

              <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 20 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#64748b',
                    marginBottom: 8,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Browse Timeline By:
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 6,
                  }}
                >
                  {[
                    { id: 'DAY', label: 'Day' },
                    { id: 'WEEK', label: 'Week' },
                    { id: 'MONTH', label: 'Month' },
                    { id: 'ALL', label: 'All' },
                  ].map((tm) => (
                    <button
                      key={tm.id}
                      type="button"
                      onClick={() => enterMode('PIN', tm.id)}
                      style={{
                        padding: '8px 6px',
                        borderRadius: 8,
                        border:
                          tm.id === 'DAY'
                            ? '1px solid rgba(239,68,68,0.5)'
                            : '1px solid rgba(255,255,255,0.12)',
                        background:
                          tm.id === 'DAY'
                            ? 'rgba(239,68,68,0.16)'
                            : 'rgba(255,255,255,0.04)',
                        color: tm.id === 'DAY' ? '#f87171' : '#e2e8f0',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      {tm.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 3: IR Mapping */}
            <div
              onClick={() => enterMode('IR')}
              style={{
                background: '#111827',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 18,
                padding: 28,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'rgba(245, 158, 11, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    marginBottom: 18,
                  }}
                >
                  🌐
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: '#f8fafc' }}>
                  IR Mapping
                </h2>
                <p style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                  International groupings, maritime chokepoints, bordering seas, and strategic projects abroad.
                </p>
              </div>
              <div
                style={{
                  marginTop: 22,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#fbbf24',
                }}
              >
                Open IR Map →
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STEP 2: UNIFIED 3-COLUMN MAPPING WORKSPACE (Matching Approved UI Design)
  // =========================================================================
  const currentPeriodIndex = availablePinPeriods.findIndex((p) => p.key === selectedPinPeriod);
  const currentPeriodObj = currentPeriodIndex >= 0 ? availablePinPeriods[currentPeriodIndex] : null;

  const selectedIndexInFeed = selectedNode
    ? numberedNodes.findIndex((n) => n.id === selectedNode.id)
    : -1;

  const nextNodeInFeed =
    selectedIndexInFeed !== -1 && selectedIndexInFeed < numberedNodes.length - 1
      ? numberedNodes[selectedIndexInFeed + 1]
      : null;
  const nextPlaceName = nextNodeInFeed ? formatCleanPlaceHeading(nextNodeInFeed) : '';

  const studiedInCurrentFeed = numberedNodes.filter((n) => studiedIds.has(n.id)).length;

  const visibleFolders = !selectedThemeFilter
    ? []
    : selectedThemeFilter === 'ALL'
      ? folders
      : folders.filter((f) => f.id === selectedThemeFilter);

  const activeThemeFolder = folders.find((f) => f.id === selectedThemeFilter) || null;

  const activeBasinHighlightStates =
    activeMode === 'STATIC_INDIA' &&
    selectedThemeFilter === 'india-rivers' &&
    !selectedNode &&
    selectedRiverBasin &&
    BASIN_CATCHMENT_STATES[selectedRiverBasin]
      ? BASIN_CATCHMENT_STATES[selectedRiverBasin]
      : [];

  const activeBasinHighlightColor =
    selectedRiverBasin === 'HIMALAYAN'
      ? '#0284c7'
      : selectedRiverBasin === 'PENINSULAR'
        ? '#0d9488'
        : selectedRiverBasin === 'COASTAL'
          ? '#4f46e5'
          : '#0284c7';

  const selectedLocationSubtitle = selectedNode
    ? formatPlaceDescriptor(selectedNode)
    : 'All mapped regions';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 64px)',
        width: '100%',
        background: '#f8fafc',
        color: '#0f172a',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* =================================================================== */}
      {/* UNIFIED TOP CONTROL RIBBON (Secondary Header Bar)                   */}
      {/* =================================================================== */}
      <div
        style={{
          minHeight: isMobile ? 48 : 54,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: isMobile ? 'nowrap' : 'wrap',
          overflowX: isMobile ? 'auto' : 'visible',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          gap: 10,
          padding: isMobile ? '6px 12px' : '6px 16px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          zIndex: 25,
        }}
      >
        {/* Left & Center Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: isMobile ? 'nowrap' : 'wrap', flexShrink: 0 }}>
          {/* Back to Tracks Pill */}
          <button
            type="button"
            onClick={() => {
              setActiveMode(null);
              setSelectedNode(null);
              setActiveOrg(null);
            }}
            title="Switch Mapping Track (PIN / Static / IR)"
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#475569',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <span>←</span>
            <span>Tracks</span>
          </button>

          {/* 1. Scope Segmented Control: All 6 | India 2 | World 4 (in PIN mode) or India | World (in Static) */}
          {activeMode === 'PIN' ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#f1f5f9',
                padding: 3,
                borderRadius: 9,
                border: '1px solid #e2e8f0',
                gap: 2,
              }}
            >
              {[
                { id: 'ALL', label: 'All', count: scopeCounts.all },
                { id: 'India', label: 'India', count: scopeCounts.india },
                { id: 'World', label: 'World', count: scopeCounts.world },
              ].map((sc) => {
                const isActive = pinScope === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => {
                      setPinScope(sc.id);
                      if (sc.id === 'India') {
                        setCameraTarget({ center: [22.8, 79.5], zoom: 5, ts: Date.now() });
                      } else if (sc.id === 'World') {
                        setCameraTarget({ center: [24.0, 22.0], zoom: 2.5, ts: Date.now() });
                      }
                    }}
                    style={{
                      padding: '5px 11px',
                      borderRadius: 6,
                      border: 'none',
                      background: isActive ? '#0f172a' : 'transparent',
                      color: isActive ? '#ffffff' : '#475569',
                      fontSize: 12.5,
                      fontWeight: isActive ? 700 : 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{sc.label}</span>
                    <span
                      style={{
                        fontSize: 11.5,
                        opacity: isActive ? 0.85 : 0.7,
                        fontWeight: 600,
                      }}
                    >
                      {sc.count}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (activeMode === 'STATIC_INDIA' || activeMode === 'STATIC_WORLD') ? (
            <div
              style={{
                display: 'inline-flex',
                background: '#f1f5f9',
                padding: 3,
                borderRadius: 9,
                border: '1px solid #e2e8f0',
              }}
            >
              <button
                type="button"
                onClick={() => enterMode('STATIC_INDIA')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: activeMode === 'STATIC_INDIA' ? '#0f172a' : 'transparent',
                  color: activeMode === 'STATIC_INDIA' ? '#ffffff' : '#475569',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                🇮🇳 India Static
              </button>
              <button
                type="button"
                onClick={() => enterMode('STATIC_WORLD')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: activeMode === 'STATIC_WORLD' ? '#0f172a' : 'transparent',
                  color: activeMode === 'STATIC_WORLD' ? '#ffffff' : '#475569',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                🌍 World Static
              </button>
            </div>
          ) : (
            <span
              style={{
                fontSize: 13.5,
                fontWeight: 700,
                color: '#0f172a',
                padding: '4px 10px',
                background: '#f1f5f9',
                borderRadius: 8,
              }}
            >
              🌐 IR Mapping & Groupings
            </span>
          )}

          {/* Interactive Navigation Breadcrumbs for Static India Flow */}
          {activeMode === 'STATIC_INDIA' && (
            <nav
              aria-label="Mapping Breadcrumb"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12.5,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '4px 10px',
                borderRadius: 8,
              }}
            >
              {/* Level 1: India */}
              <button
                type="button"
                onClick={() => {
                  setSelectedThemeFilter(null);
                  setSelectedRiverBasin(null);
                  setActiveSubBasin(null);
                  setSelectedNode(null);
                  setCameraTarget({ center: [22.8, 79.5], zoom: 4.8, ts: Date.now() });
                }}
                title="Return to Layer Selection"
                style={{
                  border: 'none',
                  background: 'none',
                  padding: 0,
                  color: selectedThemeFilter ? '#2563eb' : '#0f172a',
                  fontWeight: selectedThemeFilter ? 600 : 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span>🇮🇳 India</span>
              </button>

              {/* Level 2: Layer / Theme */}
              {selectedThemeFilter ? (
                <>
                  <span style={{ color: '#cbd5e1', fontWeight: 600 }}>/</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRiverBasin(null);
                      setActiveSubBasin(null);
                      setSelectedNode(null);
                      setCameraTarget({ center: [22.8, 79.5], zoom: 4.8, ts: Date.now() });
                    }}
                    title="Return to Layer / Basin Selection"
                    style={{
                      border: 'none',
                      background: 'none',
                      padding: 0,
                      color: (selectedRiverBasin || selectedNode) ? '#2563eb' : '#0f172a',
                      fontWeight: (selectedRiverBasin || selectedNode) ? 600 : 800,
                      cursor: 'pointer',
                    }}
                  >
                    {activeThemeFolder?.shortLabel || 'Theme'}
                  </button>
                </>
              ) : (
                <>
                  <span style={{ color: '#cbd5e1', fontWeight: 600 }}>/</span>
                  <span style={{ color: '#64748b', fontStyle: 'italic' }}>
                    Select a layer
                  </span>
                </>
              )}

              {/* Level 3: River Basin */}
              {selectedThemeFilter === 'india-rivers' && (
                <>
                  <span style={{ color: '#cbd5e1', fontWeight: 600 }}>/</span>
                  {selectedRiverBasin ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedNode(null);
                        setActiveSubBasin(null);
                        if (selectedRiverBasin === 'HIMALAYAN') {
                          setCameraTarget({ center: [28.2, 81.5], zoom: 5.2, ts: Date.now() });
                        } else if (selectedRiverBasin === 'PENINSULAR') {
                          setCameraTarget({ center: [18.2, 78.5], zoom: 5.4, ts: Date.now() });
                        } else if (selectedRiverBasin === 'COASTAL') {
                          setCameraTarget({ center: [16.8, 78.0], zoom: 5.2, ts: Date.now() });
                        } else {
                          setCameraTarget({ center: [22.8, 79.5], zoom: 4.8, ts: Date.now() });
                        }
                      }}
                      title="Return to Basin Overview (Main Rivers)"
                      style={{
                        border: 'none',
                        background: 'none',
                        padding: 0,
                        color: (selectedNode || activeSubBasin) ? '#2563eb' : '#0f172a',
                        fontWeight: (selectedNode || activeSubBasin) ? 600 : 800,
                        cursor: 'pointer',
                      }}
                    >
                      {selectedRiverBasin === 'HIMALAYAN' ? '🏔️ Himalayan Basin' :
                       selectedRiverBasin === 'PENINSULAR' ? '⛰️ Peninsular Basin' :
                       selectedRiverBasin === 'COASTAL' ? '🌊 Coastal & Minor' : '🌊 All Basins'}
                    </button>
                  ) : (
                    <span style={{ color: '#64748b', fontStyle: 'italic' }}>
                      Choose a basin
                    </span>
                  )}
                </>
              )}

              {/* Level 4: Selected Place / River */}
              {selectedNode && (
                <>
                  <span style={{ color: '#cbd5e1', fontWeight: 600 }}>/</span>
                  <span
                    style={{
                      color: '#0f172a',
                      fontWeight: 800,
                      maxWidth: isMobile ? 120 : 180,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={selectedNode.place}
                  >
                    {formatCleanPlaceHeading(selectedNode)}
                  </span>
                </>
              )}
            </nav>
          )}

          {/* Divider */}
          {activeMode === 'PIN' && (
            <div style={{ width: 1, height: 22, background: '#e2e8f0' }} />
          )}

          {/* 2. Time Horizon Segmented Control: Day | Week | Month | All */}
          {activeMode === 'PIN' && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#f1f5f9',
                padding: 3,
                borderRadius: 9,
                border: '1px solid #e2e8f0',
                gap: 2,
              }}
            >
              {[
                { id: 'DAY', label: 'Day' },
                { id: 'WEEK', label: 'Week' },
                { id: 'MONTH', label: 'Month' },
                { id: 'ALL', label: 'All' },
                { id: 'MASTER', label: `⭐ Prelims Core (${masterPinsCount})` },
              ].map((tm) => {
                const isActive = pinTimeMode === tm.id;
                const isMasterTab = tm.id === 'MASTER';
                return (
                  <button
                    key={tm.id}
                    type="button"
                    onClick={() => {
                      setPinTimeMode(tm.id);
                      setSelectedThemeFilter('ALL');
                    }}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 6,
                      border: isMasterTab && isActive
                        ? '1px solid #fde68a'
                        : isMasterTab
                        ? '1px dashed #f59e0b'
                        : 'none',
                      background: isActive
                        ? isMasterTab
                          ? '#fef3c7'
                          : '#ffffff'
                        : isMasterTab
                        ? 'rgba(245, 158, 11, 0.08)'
                        : 'transparent',
                      color: isActive
                        ? isMasterTab
                          ? '#b45309'
                          : '#0f172a'
                        : isMasterTab
                        ? '#d97706'
                        : '#64748b',
                      boxShadow: isActive ? '0 1px 2px rgba(15,23,42,0.08)' : 'none',
                      fontSize: 12.5,
                      fontWeight: isActive || isMasterTab ? 700 : 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {tm.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* 3. Date / Period Stepper: < Thu, 15 Oct 2026 (6 places) > */}
          {activeMode === 'PIN' && pinTimeMode !== 'ALL' && pinTimeMode !== 'MASTER' && availablePinPeriods.length > 0 && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                disabled={
                  currentPeriodIndex >= availablePinPeriods.length - 1 ||
                  currentPeriodIndex === -1
                }
                onClick={() => {
                  if (currentPeriodIndex < availablePinPeriods.length - 1) {
                    setSelectedPinPeriod(availablePinPeriods[currentPeriodIndex + 1].key);
                    setSelectedThemeFilter('ALL');
                  }
                }}
                title="Previous (older) period"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 7,
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color:
                    currentPeriodIndex >= availablePinPeriods.length - 1 ||
                    currentPeriodIndex === -1
                      ? '#cbd5e1'
                      : '#334155',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor:
                    currentPeriodIndex >= availablePinPeriods.length - 1 ||
                    currentPeriodIndex === -1
                      ? 'not-allowed'
                      : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ‹
              </button>

              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                <select
                  value={selectedPinPeriod}
                  onChange={(e) => {
                    setSelectedPinPeriod(e.target.value);
                    setSelectedThemeFilter('ALL');
                  }}
                  aria-label="Select time period"
                  style={{
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    padding: '5px 26px 5px 12px',
                    borderRadius: 8,
                    border: '1px solid transparent',
                    background: 'transparent',
                    color: '#0f172a',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  {availablePinPeriods.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.label} ({p.count} {p.count === 1 ? 'place' : 'places'})
                    </option>
                  ))}
                  <option value="ALL">
                    All {pinTimeMode === 'DAY' ? 'Days' : pinTimeMode === 'WEEK' ? 'Weeks' : 'Months'} ({allPinNodes.length} places)
                  </option>
                </select>
                <span
                  style={{
                    position: 'absolute',
                    right: 8,
                    pointerEvents: 'none',
                    fontSize: 10,
                    color: '#64748b',
                  }}
                >
                  ▾
                </span>
              </div>

              <button
                type="button"
                disabled={currentPeriodIndex <= 0}
                onClick={() => {
                  if (currentPeriodIndex > 0) {
                    setSelectedPinPeriod(availablePinPeriods[currentPeriodIndex - 1].key);
                    setSelectedThemeFilter('ALL');
                  }
                }}
                title="Next (newer) period"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 7,
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: currentPeriodIndex <= 0 ? '#cbd5e1' : '#334155',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: currentPeriodIndex <= 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ›
              </button>
            </div>
          )}
        </div>

        {/* Right Controls: Studied X of Y mapped + Study | Practice Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 12.5, color: '#64748b', fontWeight: 500 }}>
            Studied{' '}
            <strong style={{ color: '#0f172a', fontWeight: 700 }}>
              {studiedInCurrentFeed} of {numberedNodes.length}
            </strong>{' '}
            mapped
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: '#f1f5f9',
              padding: 3,
              borderRadius: 9,
              border: '1px solid #e2e8f0',
              gap: 2,
            }}
          >
            {[
              { id: 'STUDY', label: 'Study' },
              { id: 'PRACTICE', label: 'Practice' },
            ].map((pm) => {
              const isActive = panelMode === pm.id;
              return (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setPanelMode(pm.id)}
                  style={{
                    padding: '5px 13px',
                    borderRadius: 6,
                    border: 'none',
                    background: isActive ? '#0f172a' : 'transparent',
                    color: isActive ? '#ffffff' : '#475569',
                    fontSize: 12.5,
                    fontWeight: isActive ? 700 : 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {pm.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3-COLUMN WORKSPACE: Left Feed + Center Map + Right Study Sheet      */}
      {/* =================================================================== */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>
        {/* ================================================================= */}
        {/* COLUMN 1: LEFT SIDEBAR (Search + Theme Chips + Numbered Sections) */}
        {/* ================================================================= */}
        <div
          style={{
            width: isMobile ? '100%' : 315,
            minWidth: isMobile ? 0 : 300,
            background: '#ffffff',
            borderRight: isMobile ? 'none' : '1px solid #e2e8f0',
            display: isMobile ? (mobileTab === 'places' ? 'flex' : 'none') : 'flex',
            flexDirection: 'column',
            height: '100%',
            zIndex: isMobile ? 25 : 15,
            paddingBottom: isMobile ? 60 : 0,
            ...(isMobile
              ? {
                  position: 'absolute',
                  inset: 0,
                }
              : {}),
          }}
        >
          {/* Mobile Header for Places View */}
          {isMobile && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                Mapped Places ({numberedNodes.length})
              </span>
              <button
                type="button"
                onClick={() => setMobileTab('map')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '5px 10px',
                  borderRadius: 6,
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                <span>View on Map 🗺️</span>
              </button>
            </div>
          )}
          {/* Search Input */}
          <div style={{ padding: '12px 12px 8px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 11px',
                borderRadius: 8,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              <span style={{ fontSize: 13, color: '#94a3b8' }}>🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeMode === 'PIN' && pinTimeMode === 'DAY'
                    ? "Filter today's places..."
                    : 'Filter places in this view...'
                }
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: '#0f172a',
                  fontSize: 12.5,
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: '#64748b',
                    fontSize: 12,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Quick Thematic Category Filter Chips (Shown when a layer is active) */}
          {selectedThemeFilter !== null && folders.length > 0 && (
            <div
              style={{
                padding: '4px 12px 10px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                alignItems: 'center',
              }}
            >
              {activeMode === 'STATIC_INDIA' && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedThemeFilter(null);
                    setSelectedRiverBasin(null);
                    setActiveSubBasin(null);
                    setSelectedNode(null);
                    setCameraTarget({ center: [22.8, 79.5], zoom: 4.8, ts: Date.now() });
                  }}
                  title="Return to Layer Chooser"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '3px 8px',
                    borderRadius: 999,
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <span>←</span>
                  <span>Layers</span>
                </button>
              )}
              {folders.map((folder) => {
                const isChipActive = selectedThemeFilter === folder.id;
                return (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => {
                      setSelectedThemeFilter(folder.id);
                      setSelectedNode(null);
                      setActiveSubBasin(null);
                      if (folder.id === 'india-rivers') {
                        setSelectedRiverBasin(null);
                        setCameraTarget({ center: [22.8, 79.5], zoom: 4.8, ts: Date.now() });
                      } else {
                        setSelectedRiverBasin('ALL');
                        setCameraTarget({ center: [22.8, 79.5], zoom: 4.8, ts: Date.now() });
                      }
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '4px 9px',
                      borderRadius: 999,
                      border: isChipActive
                        ? `1.5px solid ${folder.color}`
                        : '1px solid #e2e8f0',
                      background: isChipActive ? `${folder.color}14` : '#ffffff',
                      color: isChipActive ? folder.color : '#334155',
                      fontSize: 11.5,
                      fontWeight: isChipActive ? 800 : 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: folder.color,
                        display: 'inline-block',
                      }}
                    />
                    <span>{folder.shortLabel}</span>
                    <span style={{ color: '#64748b', fontWeight: 700 }}>
                      {folder.items.length}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 3-Master River Basin Selection (Shown once a Basin is active so user can switch between Basins) */}
          {activeMode === 'STATIC_INDIA' &&
            selectedThemeFilter === 'india-rivers' &&
            selectedRiverBasin !== null && (
              <div
                style={{
                  padding: '8px 12px 10px',
                  background: '#f0f9ff',
                  borderBottom: '1px solid #bae6fd',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      color: '#0369a1',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>🌊</span> River Basin Selection
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRiverBasin(null);
                      setActiveSubBasin(null);
                      setSelectedNode(null);
                      setCameraTarget({ center: [22.8, 79.5], zoom: 4.8, ts: Date.now() });
                    }}
                    style={{
                      fontSize: 11,
                      color: '#0284c7',
                      background: 'none',
                      border: 'none',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    ← All 3 Basins
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5 }}>
                  {[
                    { id: 'HIMALAYAN', label: 'Himalayan', count: 33, emoji: '🏔️', center: [28.2, 81.5], zoom: 5.2 },
                    { id: 'PENINSULAR', label: 'Peninsular', count: 8, emoji: '⛰️', center: [18.2, 78.5], zoom: 5.4 },
                    { id: 'COASTAL', label: 'Coastal', count: 18, emoji: '🌊', center: [16.8, 78.0], zoom: 5.2 },
                  ].map((b) => {
                    const isActive = selectedRiverBasin === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setSelectedRiverBasin(b.id);
                          setActiveSubBasin(null);
                          setSelectedNode(null);
                          setCameraTarget({ center: b.center, zoom: b.zoom, ts: Date.now() });
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '5px 7px',
                          borderRadius: 7,
                          border: isActive ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                          background: isActive ? '#0284c7' : '#ffffff',
                          color: isActive ? '#ffffff' : '#334155',
                          fontSize: 11,
                          fontWeight: isActive ? 800 : 600,
                          cursor: 'pointer',
                          boxShadow: isActive ? '0 2px 6px rgba(2, 132, 199, 0.25)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
                          <span style={{ fontSize: 11 }}>{b.emoji}</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.label}</span>
                        </span>
                        <span
                          style={{
                            fontSize: 9.5,
                            padding: '1px 4px',
                            borderRadius: 999,
                            background: isActive ? 'rgba(255, 255, 255, 0.28)' : '#f1f5f9',
                            color: isActive ? '#ffffff' : '#64748b',
                            fontWeight: 700,
                          }}
                        >
                          {b.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          {/* Grouped Thematic Sections & Numbered Place Items */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px 18px', background: '#f8fafc' }}>
            {loading ? (
              <div style={{ fontSize: 12.5, color: '#64748b', padding: '12px 6px' }}>
                Loading mapped places...
              </div>
            ) : (activeMode === 'STATIC_INDIA' && selectedThemeFilter === null) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ padding: '2px 4px 6px' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                    Step 1 · Choose UPSC Mapping Layer
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                    Select a theme to explore on map:
                  </div>
                </div>

                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => {
                      setSelectedThemeFilter(folder.id);
                      setSelectedNode(null);
                      setActiveSubBasin(null);
                      if (folder.id === 'india-rivers') {
                        setSelectedRiverBasin(null);
                        setCameraTarget({ center: [22.8, 79.5], zoom: 4.8, ts: Date.now() });
                      } else {
                        setSelectedRiverBasin('ALL');
                        setCameraTarget({ center: [22.8, 79.5], zoom: 4.8, ts: Date.now() });
                      }
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1.5px solid #e2e8f0',
                      background: '#ffffff',
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: `${folder.color}14`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        flexShrink: 0,
                      }}
                    >
                      {folder.emoji}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>
                        {folder.title}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                        {folder.items.length} mapped {folder.items.length === 1 ? 'place' : 'places'} with notes &amp; PYQs
                      </div>
                    </div>
                    <span style={{ color: '#94a3b8', fontSize: 16 }}>›</span>
                  </button>
                ))}
              </div>
            ) : (activeMode === 'STATIC_INDIA' && selectedThemeFilter === 'india-rivers' && selectedRiverBasin === null && !searchQuery.trim()) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ padding: '2px 4px 6px' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0284c7' }}>
                    Step 2 · Choose a River Basin
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                    Select a drainage basin to explore:
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 3, lineHeight: 1.4 }}>
                    The map currently displays India&apos;s main trunk rivers. Select a basin to highlight its catchment region and study system by system:
                  </div>
                </div>

                {[
                  {
                    id: 'HIMALAYAN',
                    emoji: '🏔️',
                    title: 'Himalayan River Basins',
                    count: 33,
                    color: '#0284c7',
                    systems: 'Indus System (6) · Ganga System (18) · Brahmaputra & Barak (9)',
                    mainRivers: 'Main Rivers: Indus, Ganga, Yamuna, Brahmaputra, Barak',
                    center: [28.2, 81.5],
                    zoom: 5.2,
                  },
                  {
                    id: 'PENINSULAR',
                    emoji: '⛰️',
                    title: 'Peninsular River Basins',
                    count: 8,
                    color: '#0d9488',
                    systems: 'West-Flowing Rifts (2) · East-Flowing Deltas (6)',
                    mainRivers: 'Main Rivers: Narmada, Tapi, Mahanadi, Godavari, Krishna, Cauvery',
                    center: [18.2, 78.5],
                    zoom: 5.4,
                  },
                  {
                    id: 'COASTAL',
                    emoji: '🌊',
                    title: 'Coastal & Inland Rivers',
                    count: 18,
                    color: '#4f46e5',
                    systems: 'West Coast & Inland (8) · East Coast Minor (10)',
                    mainRivers: 'Main Rivers: Luni, Sabarmati, Mahi, Periyar, Subarnarekha, Brahmani, Pennar, Vaigai',
                    center: [16.8, 78.0],
                    zoom: 5.2,
                  },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setSelectedRiverBasin(b.id);
                      setActiveSubBasin(null);
                      setSelectedNode(null);
                      setCameraTarget({ center: b.center, zoom: b.zoom, ts: Date.now() });
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '13px 14px',
                      borderRadius: 12,
                      border: `1.5px solid ${b.color}38`,
                      background: '#ffffff',
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: `${b.color}14`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 21,
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      {b.emoji}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>
                          {b.title}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            padding: '1px 7px',
                            borderRadius: 999,
                            background: `${b.color}15`,
                            color: b.color,
                          }}
                        >
                          {b.count}
                        </span>
                      </div>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: '#334155', marginTop: 4 }}>
                        {b.systems}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
                        {b.mainRivers}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : visibleFolders.length === 0 ? (
              <div style={{ fontSize: 12.5, color: '#64748b', padding: '16px', textAlign: 'center' }}>
                No mapped places match the current filter.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {visibleFolders.map((folder) => {
                  const isCollapsed = Boolean(collapsedFolders[folder.id]);
                  const subBasinGroups = [];
                  if (folder.id === 'india-rivers') {
                    const groupMap = new Map();
                    folder.items.forEach((node) => {
                      const sbName = getRiverSubBasin(node);
                      if (!groupMap.has(sbName)) {
                        const grp = { name: sbName, items: [] };
                        groupMap.set(sbName, grp);
                        subBasinGroups.push(grp);
                      }
                      groupMap.get(sbName).items.push(node);
                    });
                  }
                  return (
                    <div
                      key={folder.id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: 12,
                        padding: '6px 8px 8px',
                        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                      }}
                    >
                      {/* Uppercase Section Header */}
                      <button
                        type="button"
                        onClick={() =>
                          setCollapsedFolders((prev) => ({
                            ...prev,
                            [folder.id]: !prev[folder.id],
                          }))
                        }
                        style={{
                          width: '100%',
                          padding: '5px 6px 7px',
                          background: 'transparent',
                          border: 'none',
                          borderBottom: isCollapsed ? 'none' : '1px solid #f1f5f9',
                          marginBottom: isCollapsed ? 0 : 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: folder.color,
                              display: 'inline-block',
                            }}
                          />
                          <span
                            style={{
                              fontSize: 10.5,
                              fontWeight: 800,
                              letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                              color: '#475569',
                            }}
                          >
                            {folder.title}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            padding: '1px 7px',
                            borderRadius: 999,
                            background: `${folder.color}15`,
                            color: folder.color,
                            border: `1px solid ${folder.color}35`,
                          }}
                        >
                          {folder.items.length}
                        </span>
                      </button>

                      {/* Section Items (Each Entry Has a Crisp Card Border) */}
                      {!isCollapsed && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {folder.isOrgFolder
                            ? folder.items.map((org, idx) => {
                                const isOrgSelected = activeOrg?.id === org.id;
                                return (
                                  <div
                                    key={org.id}
                                    onClick={() => handleSelectOrg(org)}
                                    style={{
                                      padding: '9px 11px',
                                      borderRadius: 9,
                                      cursor: 'pointer',
                                      background: isOrgSelected ? '#fffbeb' : '#ffffff',
                                      border: isOrgSelected
                                        ? '1.5px solid #d97706'
                                        : '1px solid #cbd5e1',
                                      borderLeft: isOrgSelected
                                        ? '4px solid #d97706'
                                        : '1px solid #cbd5e1',
                                      boxShadow: isOrgSelected
                                        ? '0 3px 10px rgba(217, 119, 6, 0.12)'
                                        : '0 1px 2px rgba(15, 23, 42, 0.03)',
                                      display: 'flex',
                                      alignItems: 'flex-start',
                                      gap: 10,
                                    }}
                                  >
                                    <span
                                      style={{
                                        width: 22,
                                        height: 22,
                                        borderRadius: '50%',
                                        background: isOrgSelected ? '#d97706' : '#fef3c7',
                                        color: isOrgSelected ? '#ffffff' : '#b45309',
                                        border: isOrgSelected
                                          ? '1.5px solid #ffffff'
                                          : '1px solid #fde68a',
                                        fontSize: 11,
                                        fontWeight: 800,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        marginTop: 1,
                                      }}
                                    >
                                      {idx + 1}
                                    </span>
                                    <div>
                                      <div
                                        style={{
                                          fontSize: 13,
                                          fontWeight: 700,
                                          color: '#0f172a',
                                        }}
                                      >
                                        {org.shortName}
                                      </div>
                                      <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 1 }}>
                                        {org.name}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            : folder.id === 'india-rivers'
                              ? subBasinGroups.map((sbGroup) => {
                                  const isSbCollapsed = Boolean(collapsedSubBasins[sbGroup.name]);
                                  const isSbFocused = activeSubBasin === sbGroup.name;
                                  return (
                                    <div
                                      key={sbGroup.name}
                                      style={{
                                        border: isSbFocused ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                                        borderRadius: 10,
                                        background: isSbFocused ? '#f0f9ff' : '#f8fafc',
                                        padding: '6px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 5,
                                      }}
                                    >
                                      {/* Collapsible Sub-Basin Header */}
                                      <div
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          padding: '3px 4px',
                                          gap: 6,
                                        }}
                                      >
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setCollapsedSubBasins((prev) => ({
                                              ...prev,
                                              [sbGroup.name]: !prev[sbGroup.name],
                                            }))
                                          }
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            border: 'none',
                                            background: 'none',
                                            padding: 0,
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            flex: 1,
                                          }}
                                        >
                                          <span style={{ fontSize: 11, color: '#0284c7', fontWeight: 800 }}>
                                            {isSbCollapsed ? '▸' : '▾'}
                                          </span>
                                          <span
                                            style={{
                                              fontSize: 11,
                                              fontWeight: 800,
                                              color: '#0369a1',
                                              textTransform: 'uppercase',
                                              letterSpacing: '0.05em',
                                            }}
                                          >
                                            {sbGroup.name}
                                          </span>
                                          <span
                                            style={{
                                              fontSize: 10,
                                              fontWeight: 700,
                                              background: '#e0f2fe',
                                              color: '#0369a1',
                                              padding: '1px 6px',
                                              borderRadius: 999,
                                            }}
                                          >
                                            {sbGroup.items.length}
                                          </span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSelectedNode(null);
                                            setActiveSubBasin((prev) =>
                                              prev === sbGroup.name ? null : sbGroup.name
                                            );
                                          }}
                                          title="Preview all rivers of this sub-basin on the map"
                                          style={{
                                            fontSize: 10,
                                            fontWeight: 700,
                                            padding: '2px 7px',
                                            borderRadius: 6,
                                            border: isSbFocused ? '1px solid #0284c7' : '1px solid #cbd5e1',
                                            background: isSbFocused ? '#0284c7' : '#ffffff',
                                            color: isSbFocused ? '#ffffff' : '#475569',
                                            cursor: 'pointer',
                                          }}
                                        >
                                          {isSbFocused ? 'Showing System' : 'Show System'}
                                        </button>
                                      </div>

                                      {/* Sub-Basin Rivers (Main River First -> Tributaries in Hydrological Order) */}
                                      {!isSbCollapsed && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                          {sbGroup.items.map((node) => {
                                            const isSelected = selectedNode?.id === node.id;
                                            const isMainRiver = isMainTrunkRiver(node);
                                            const locParts = [
                                              node.locatedIn?.district,
                                              node.locatedIn?.stateOrProvince,
                                              node.locatedIn?.country || node.regionScope,
                                            ].filter(Boolean);
                                            const subLocation =
                                              locParts.slice(0, 2).join(', ') +
                                              (locParts.length > 2 ? ` · ${locParts[locParts.length - 1]}` : '');

                                            return (
                                              <div
                                                key={node.id}
                                                onClick={() => handleSelectNode(node)}
                                                style={{
                                                  padding: '8px 10px',
                                                  borderRadius: 8,
                                                  cursor: 'pointer',
                                                  background: isSelected
                                                    ? '#fff1f2'
                                                    : isMainRiver
                                                      ? '#ffffff'
                                                      : '#fcfdfe',
                                                  border: isSelected
                                                    ? '1.5px solid #ef4444'
                                                    : isMainRiver
                                                      ? '1.5px solid #7dd3fc'
                                                      : '1px solid #cbd5e1',
                                                  borderLeft: isSelected
                                                    ? '4px solid #ef4444'
                                                    : isMainRiver
                                                      ? '4px solid #0284c7'
                                                      : `3px solid ${folder.color}66`,
                                                  boxShadow: isSelected
                                                    ? '0 3px 10px rgba(239, 68, 68, 0.14)'
                                                    : '0 1px 2px rgba(15, 23, 42, 0.03)',
                                                  display: 'flex',
                                                  alignItems: 'flex-start',
                                                  gap: 9,
                                                  transition: 'all 0.12s ease',
                                                }}
                                              >
                                                <span
                                                  style={{
                                                    width: 22,
                                                    height: 22,
                                                    borderRadius: '50%',
                                                    background: isSelected
                                                      ? '#ef4444'
                                                      : isMainRiver
                                                        ? '#0284c7'
                                                        : `${folder.color}18`,
                                                    color: isSelected || isMainRiver ? '#ffffff' : folder.color,
                                                    border: isSelected
                                                      ? '1.5px solid #ffffff'
                                                      : isMainRiver
                                                        ? '1.5px solid #bae6fd'
                                                        : `1.5px solid ${folder.color}66`,
                                                    fontSize: 10.5,
                                                    fontWeight: 800,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                    marginTop: 1,
                                                  }}
                                                >
                                                  {node.displayIndex || '•'}
                                                </span>

                                                <div style={{ minWidth: 0, flex: 1 }}>
                                                  <div
                                                    style={{
                                                      fontSize: 13,
                                                      fontWeight: isSelected || isMainRiver ? 800 : 600,
                                                      color: '#0f172a',
                                                      lineHeight: 1.3,
                                                      display: 'flex',
                                                      alignItems: 'center',
                                                      gap: 6,
                                                      flexWrap: 'wrap',
                                                    }}
                                                  >
                                                    <span>{formatCleanPlaceHeading(node)}</span>
                                                    {isMainRiver && (
                                                      <span
                                                        style={{
                                                          fontSize: 9.5,
                                                          fontWeight: 800,
                                                          background: '#e0f2fe',
                                                          color: '#0369a1',
                                                          border: '1px solid #7dd3fc',
                                                          padding: '1px 5px',
                                                          borderRadius: 4,
                                                          letterSpacing: '0.02em',
                                                        }}
                                                      >
                                                        ⭐ Main River
                                                      </span>
                                                    )}
                                                  </div>
                                                  <div
                                                    style={{
                                                      fontSize: 11.2,
                                                      color: isSelected ? '#9f1239' : '#64748b',
                                                      marginTop: 2,
                                                      whiteSpace: 'nowrap',
                                                      overflow: 'hidden',
                                                      textOverflow: 'ellipsis',
                                                    }}
                                                  >
                                                    {subLocation || node.placeType}
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              : folder.items.map((node) => {
                                  const isSelected = selectedNode?.id === node.id;
                                  const locParts = [
                                    node.locatedIn?.district,
                                    node.locatedIn?.stateOrProvince,
                                    node.locatedIn?.country || node.regionScope,
                                  ].filter(Boolean);
                                  const subLocation =
                                    locParts.slice(0, 2).join(', ') +
                                    (locParts.length > 2 ? ` · ${locParts[locParts.length - 1]}` : '');

                                  return (
                                    <div
                                      key={node.id}
                                      onClick={() => handleSelectNode(node)}
                                      style={{
                                        padding: '9px 11px',
                                        borderRadius: 9,
                                        cursor: 'pointer',
                                        background: isSelected ? '#fff1f2' : '#ffffff',
                                        border: isSelected
                                          ? '1.5px solid #ef4444'
                                          : '1px solid #cbd5e1',
                                        borderLeft: isSelected
                                          ? '4px solid #ef4444'
                                          : `3px solid ${folder.color}88`,
                                        boxShadow: isSelected
                                          ? '0 3px 10px rgba(239, 68, 68, 0.14)'
                                          : '0 1px 2px rgba(15, 23, 42, 0.03)',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 10,
                                        transition: 'all 0.12s ease',
                                      }}
                                    >
                                      <span
                                        style={{
                                          width: 23,
                                          height: 23,
                                          borderRadius: '50%',
                                          background: isSelected
                                            ? '#ef4444'
                                            : `${folder.color}18`,
                                          color: isSelected ? '#ffffff' : folder.color,
                                          border: isSelected
                                            ? '1.5px solid #ffffff'
                                            : `1.5px solid ${folder.color}66`,
                                          boxShadow: isSelected
                                            ? '0 0 0 2.5px rgba(239,68,68,0.28)'
                                            : 'none',
                                          fontSize: 11,
                                          fontWeight: 800,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          flexShrink: 0,
                                          marginTop: 1,
                                        }}
                                      >
                                        {node.displayIndex || '•'}
                                      </span>

                                      <div style={{ minWidth: 0, flex: 1 }}>
                                        <div
                                          style={{
                                            fontSize: 13.2,
                                            fontWeight: isSelected ? 700 : 600,
                                            color: '#0f172a',
                                            lineHeight: 1.32,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            flexWrap: 'wrap',
                                          }}
                                        >
                                          <span>{formatCleanPlaceHeading(node)}</span>
                                          {(node.isMaster || node.tier === 'master') && (
                                            <span
                                              style={{
                                                fontSize: 9.5,
                                                fontWeight: 800,
                                                background: '#fef3c7',
                                                color: '#b45309',
                                                border: '1px solid #fde68a',
                                                padding: '1px 5px',
                                                borderRadius: 4,
                                                letterSpacing: '0.02em',
                                              }}
                                            >
                                              ⭐ Core
                                            </span>
                                          )}
                                        </div>
                                        <div
                                          style={{
                                            fontSize: 11.5,
                                            color: isSelected ? '#9f1239' : '#64748b',
                                            marginTop: 3,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                          }}
                                        >
                                          {subLocation || node.placeType}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* COLUMN 2: CENTER MAP CANVAS + FLOATING CONTROLS                   */}
        {/* ================================================================= */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            height: '100%',
            minWidth: 0,
            ...(isMobile
              ? {
                  position: 'absolute',
                  inset: 0,
                  zIndex: 10,
                  visibility: mobileTab === 'map' ? 'visible' : 'hidden',
                  pointerEvents: mobileTab === 'map' ? 'auto' : 'none',
                }
              : {}),
          }}
        >
          {/* Top-Left Floating Context Pill: Zoomed to ... | All-India view (Constrained so it NEVER collides with basemap switcher) */}
          <div
            style={{
              position: 'absolute',
              top: isMobile ? 10 : 14,
              left: isMobile ? 10 : 14,
              zIndex: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              border: '1px solid #e2e8f0',
              borderRadius: 9,
              padding: isMobile ? '5px 9px' : '6px 12px',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)',
              fontSize: 12,
              color: '#475569',
              maxWidth: isMobile ? 'calc(100% - 150px)' : 'calc(100% - 240px)',
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 'min(360px, calc(100% - 150px))',
              }}
              title={selectedLocationSubtitle}
            >
              {selectedNode ? (
                <>
                  Zoomed to{' '}
                  <strong style={{ color: '#0f172a' }}>{selectedLocationSubtitle}</strong>
                </>
              ) : selectedThemeFilter === null ? (
                <strong style={{ color: '#0f172a' }}>
                  Step 1 · Choose a layer to begin
                </strong>
              ) : selectedThemeFilter === 'india-rivers' && !selectedRiverBasin ? (
                <strong style={{ color: '#0f172a' }}>
                  Step 2 · Main Rivers of India (Choose a Basin to explore)
                </strong>
              ) : selectedThemeFilter === 'india-rivers' && selectedRiverBasin ? (
                <strong style={{ color: '#0f172a' }}>
                  Step 3 · {selectedRiverBasin === 'HIMALAYAN' ? 'Himalayan' : selectedRiverBasin === 'PENINSULAR' ? 'Peninsular' : 'Coastal'} Basin ({mapCanvasNodes.length} main rivers shown)
                </strong>
              ) : (
                <strong style={{ color: '#0f172a' }}>
                  Showing {mapCanvasNodes.length} mapped places
                </strong>
              )}
            </span>
            <span style={{ width: 1, height: 14, background: '#cbd5e1', flexShrink: 0 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedNode(null);
                  setActiveSubBasin(null);
                  if (selectedThemeFilter === 'india-rivers') {
                    setSelectedRiverBasin(null);
                  } else {
                    setSelectedRiverBasin('ALL');
                  }
                  setCameraTarget({
                    center: [22.8, 79.5],
                    zoom: 4.8,
                    ts: Date.now(),
                  });
                }}
                style={{
                  border: 'none',
                  background: 'none',
                  color: !selectedRiverBasin || selectedRiverBasin === 'ALL' ? '#2563eb' : '#64748b',
                  fontWeight: !selectedRiverBasin || selectedRiverBasin === 'ALL' ? 700 : 500,
                  fontSize: 12,
                  cursor: 'pointer',
                  padding: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                All-India view
              </button>
              {activeMode === 'STATIC_INDIA' && (selectedThemeFilter === 'ALL' || selectedThemeFilter === 'india-rivers') && (
                <>
                  <span style={{ width: 1, height: 12, background: '#cbd5e1' }} />
                  {[
                    { id: 'HIMALAYAN', label: '🏔️ Himalayan', center: [28.2, 81.5], zoom: 5.2 },
                    { id: 'PENINSULAR', label: '⛰️ Peninsular', center: [18.2, 78.5], zoom: 5.4 },
                    { id: 'COASTAL', label: '🌊 Coastal', center: [16.8, 78.0], zoom: 5.2 },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setSelectedNode(null);
                        setActiveSubBasin(null);
                        setSelectedRiverBasin(b.id);
                        setCameraTarget({ center: b.center, zoom: b.zoom, ts: Date.now() });
                      }}
                      style={{
                        border: 'none',
                        background: selectedRiverBasin === b.id ? '#0284c7' : 'none',
                        color: selectedRiverBasin === b.id ? '#ffffff' : '#64748b',
                        fontWeight: selectedRiverBasin === b.id ? 800 : 600,
                        fontSize: 11.5,
                        borderRadius: 6,
                        padding: '1px 6px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {b.label}
                    </button>
                  ))}
                </>
              )}
              <button
                type="button"
                onClick={() =>
                  setCameraTarget({
                    center: [22.0, 25.0],
                    zoom: 2.3,
                    ts: Date.now(),
                  })
                }
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#64748b',
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer',
                  padding: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                World view
              </button>
            </div>
          </div>

          {/* Top-Right Floating Basemap Switcher: Clean | Terrain | Satellite */}
          <div
            style={{
              position: 'absolute',
              top: isMobile ? 10 : 14,
              right: isMobile ? 10 : 14,
              zIndex: 500,
              display: 'inline-flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              border: '1px solid #e2e8f0',
              borderRadius: 9,
              padding: 3,
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)',
              gap: 2,
            }}
          >
            {[
              { id: 'light', label: 'Clean' },
              { id: 'topo', label: 'Terrain' },
              { id: 'satellite', label: 'Satellite' },
            ].map((bm) => {
              const isActive = basemap === bm.id;
              return (
                <button
                  key={bm.id}
                  type="button"
                  onClick={() => setBasemap(bm.id)}
                  style={{
                    padding: isMobile ? '4px 8px' : '5px 11px',
                    borderRadius: 6,
                    border: 'none',
                    background: isActive ? '#0f172a' : 'transparent',
                    color: isActive ? '#ffffff' : '#475569',
                    fontSize: isMobile ? 11 : 12,
                    fontWeight: isActive ? 700 : 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {bm.label}
                </button>
              );
            })}
          </div>

          {/* Bottom-Left Floating Legend Pill (Steps up dynamically to 58px when PYQ dock is present so it NEVER overlaps) */}
          <div
            style={{
              position: 'absolute',
              bottom:
                selectedNode &&
                practiceQuestionsForSelected.length > 0 &&
                mapPyqDockMode !== 'hidden'
                  ? (isMobile ? 116 : 58)
                  : (isMobile ? 68 : 16),
              left: isMobile ? 10 : 14,
              zIndex: 490,
              display: isMobile ? 'none' : 'inline-flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 10,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '5px 10px',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)',
              fontSize: 11,
              color: '#334155',
              fontWeight: 600,
              transition: 'bottom 0.2s ease',
            }}
          >
            {folders.slice(0, 3).map((f) => (
              <span
                key={f.id}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: f.color,
                    display: 'inline-block',
                  }}
                />
                <span>{f.shortLabel}</span>
              </span>
            ))}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#ef4444',
                  boxShadow: '0 0 0 2.5px rgba(239,68,68,0.28)',
                  display: 'inline-block',
                }}
              />
              <span style={{ color: '#dc2626', fontWeight: 700 }}>Active Pin</span>
            </span>
          </div>

          <MappingCanvas
            nodes={mapCanvasNodes}
            selectedNode={selectedNode}
            onSelectNode={handleSelectNode}
            basemap={basemap}
            showIndiaStates={true}
            showGraticules={true}
            cameraTarget={cameraTarget}
            activeOrg={activeOrg}
            basinHighlightStates={activeBasinHighlightStates}
            basinHighlightColor={activeBasinHighlightColor}
          />

          {/* LEVEL 1: Map Stage Layer Chooser Card (Zero Clutter Entry) */}
          {activeMode === 'STATIC_INDIA' && selectedThemeFilter === null && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 490,
                background: 'rgba(255, 255, 255, 0.96)',
                backdropFilter: 'blur(12px)',
                border: '1.5px solid #cbd5e1',
                borderRadius: 18,
                padding: isMobile ? '20px 16px' : '26px 30px',
                maxWidth: 480,
                width: '90%',
                boxShadow: '0 20px 45px rgba(15, 23, 42, 0.16)',
                textAlign: 'center',
                pointerEvents: 'auto',
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 8 }}>🇮🇳</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px', color: '#0f172a' }}>
                India Static Geography
              </h2>
              <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 18px', lineHeight: 1.55 }}>
                Step 1 · Choose a thematic layer to begin:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {folders.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setSelectedThemeFilter(f.id);
                      setSelectedNode(null);
                      setActiveSubBasin(null);
                      if (f.id === 'india-rivers') {
                        setSelectedRiverBasin(null);
                        setCameraTarget({ center: [22.8, 79.5], zoom: 4.8, ts: Date.now() });
                      } else {
                        setSelectedRiverBasin('ALL');
                        setCameraTarget({ center: [22.8, 79.5], zoom: 4.8, ts: Date.now() });
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: `1.5px solid ${f.color}33`,
                      background: `${f.color}0c`,
                      color: '#0f172a',
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = f.color;
                      e.currentTarget.style.background = `${f.color}18`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = `${f.color}33`;
                      e.currentTarget.style.background = `${f.color}0c`;
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{f.emoji}</span>
                    <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {f.shortLabel} ({f.items.length})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* LEVEL 2: Floating River Basin Chooser Bar on Map (Shown while viewing All-India Main Trunk Rivers) */}
          {activeMode === 'STATIC_INDIA' &&
            selectedThemeFilter === 'india-rivers' &&
            selectedRiverBasin === null &&
            !selectedNode && (
              <div
                style={{
                  position: 'absolute',
                  bottom: isMobile ? 64 : 20,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 495,
                  background: 'rgba(255, 255, 255, 0.96)',
                  backdropFilter: 'blur(12px)',
                  border: '1.5px solid #bae6fd',
                  borderRadius: 14,
                  padding: isMobile ? '10px 12px' : '12px 16px',
                  boxShadow: '0 14px 34px rgba(15, 23, 42, 0.14)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  maxWidth: '94%',
                }}
              >
                <div style={{ fontSize: 11.5, fontWeight: 800, color: '#0369a1', letterSpacing: '0.03em' }}>
                  Step 2 · Select a River Basin to Highlight Its Region &amp; Main Rivers:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
                  {[
                    { id: 'HIMALAYAN', label: '🏔️ Himalayan Basin (33)', color: '#0284c7', center: [28.2, 81.5], zoom: 5.2 },
                    { id: 'PENINSULAR', label: '⛰️ Peninsular Basin (8)', color: '#0d9488', center: [18.2, 78.5], zoom: 5.4 },
                    { id: 'COASTAL', label: '🌊 Coastal & Inland (18)', color: '#4f46e5', center: [16.8, 78.0], zoom: 5.2 },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setSelectedRiverBasin(b.id);
                        setActiveSubBasin(null);
                        setSelectedNode(null);
                        setCameraTarget({ center: b.center, zoom: b.zoom, ts: Date.now() });
                      }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 9,
                        border: `1.5px solid ${b.color}`,
                        background: `${b.color}12`,
                        color: '#0f172a',
                        fontSize: 12.5,
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

          {/* Floating On-Map PYQ Challenge Dock (Vibrant High-Yield Gold/Amber Visual Identity) */}
          {selectedNode && practiceQuestionsForSelected.length > 0 && (() => {
            const currentMapQ = practiceQuestionsForSelected[mapPyqIndex] || practiceQuestionsForSelected[0];
            const chosen = currentMapQ ? selectedAnswers[currentMapQ.id] : null;
            const isRevealed = currentMapQ ? revealedQuestions[currentMapQ.id] : false;
            const isAnswerCorrect =
              isRevealed &&
              (chosen || '').toLowerCase() === (currentMapQ?.correctLabel || '').toLowerCase();

            if (mapPyqDockMode === 'hidden') {
              return (
                <button
                  type="button"
                  onClick={() => setMapPyqDockMode('expanded')}
                  title="Open On-Map UPSC Practice Dock"
                  style={{
                    position: 'absolute',
                    bottom: isMobile ? 68 : 16,
                    right: isMobile ? 12 : 68,
                    zIndex: 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#ffffff',
                    border: '1.5px solid #f59e0b',
                    borderRadius: 8,
                    padding: '6px 12px',
                    color: '#0f172a',
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(245, 158, 11, 0.28)',
                  }}
                >
                  <span style={{ color: '#ea580c' }}>🔥</span>
                  <span>Practice ({practiceQuestionsForSelected.length} PYQs)</span>
                </button>
              );
            }

            if (mapPyqDockMode === 'collapsed') {
              return (
                <div
                  style={{
                    position: 'absolute',
                    bottom: isMobile ? 68 : 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: '#ffffff',
                    border: '1.5px solid #f59e0b',
                    borderRadius: 12,
                    padding: '8px 14px',
                    boxShadow:
                      '0 10px 28px -4px rgba(245, 158, 11, 0.35), 0 4px 12px rgba(15, 23, 42, 0.08)',
                    color: '#0f172a',
                    maxWidth: 'min(88%, 560px)',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 900,
                      letterSpacing: '0.03em',
                      textTransform: 'uppercase',
                      padding: '4px 9px',
                      borderRadius: 6,
                      background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                      color: '#ffffff',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 6px rgba(234, 88, 12, 0.35)',
                    }}
                  >
                    🔥 {practiceQuestionsForSelected.length} {practiceQuestionsForSelected.length === 1 ? 'PYQ' : 'PYQs'}
                  </span>
                  <span
                    style={{
                      fontSize: 12.5,
                      fontWeight: 650,
                      color: '#1e293b',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                    }}
                  >
                    Q{mapPyqIndex + 1}: {currentMapQ?.stem?.slice(0, 56)}…
                  </span>
                  <button
                    type="button"
                    onClick={() => setMapPyqDockMode('expanded')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 7,
                      border: '1.5px solid #d97706',
                      background: '#0f172a',
                      color: '#fef08a',
                      fontSize: 11.5,
                      fontWeight: 800,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 6px rgba(15, 23, 42, 0.25)',
                    }}
                  >
                    Solve on Map ▴
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapPyqDockMode('hidden')}
                    title="Dismiss floating question dock"
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#94a3b8',
                      fontSize: 15,
                      cursor: 'pointer',
                      padding: '0 2px',
                      fontWeight: 700,
                    }}
                  >
                    ✕
                  </button>
                </div>
              );
            }

            // Expanded Mode: Full interactive High-Yield MCQ challenge card
            return (
              <div
                style={{
                  position: 'absolute',
                  bottom: isMobile ? 68 : 16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 500,
                  width: 'min(92%, 580px)',
                  maxHeight: isMobile ? '58%' : '48%',
                  background: '#ffffff',
                  border: '2px solid #f59e0b',
                  borderRadius: 14,
                  boxShadow:
                    '0 16px 44px -8px rgba(245, 158, 11, 0.35), 0 8px 24px rgba(15, 23, 42, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                {/* Card Header with Warm Gold tint */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 13px',
                    background: 'linear-gradient(135deg, #fffdf5 0%, #fef3c7 100%)',
                    borderBottom: '1.5px solid #fde68a',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 900,
                        color: '#ffffff',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                        padding: '3px 8px',
                        borderRadius: 5,
                        letterSpacing: '0.04em',
                        boxShadow: '0 2px 6px rgba(234, 88, 12, 0.3)',
                      }}
                    >
                      🔥 {currentMapQ?.exam} {currentMapQ?.examYear ? `(${currentMapQ.examYear})` : ''}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>
                      Question {mapPyqIndex + 1} of {practiceQuestionsForSelected.length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      type="button"
                      disabled={mapPyqIndex <= 0}
                      onClick={() => setMapPyqIndex((i) => Math.max(0, i - 1))}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: mapPyqIndex <= 0 ? '#cbd5e1' : '#0f172a',
                        cursor: mapPyqIndex <= 0 ? 'not-allowed' : 'pointer',
                        fontSize: 13,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      disabled={mapPyqIndex >= practiceQuestionsForSelected.length - 1}
                      onClick={() =>
                        setMapPyqIndex((i) =>
                          Math.min(practiceQuestionsForSelected.length - 1, i + 1)
                        )
                      }
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color:
                          mapPyqIndex >= practiceQuestionsForSelected.length - 1
                            ? '#cbd5e1'
                            : '#0f172a',
                        cursor:
                          mapPyqIndex >= practiceQuestionsForSelected.length - 1
                            ? 'not-allowed'
                            : 'pointer',
                        fontSize: 13,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      ›
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapPyqDockMode('collapsed')}
                      title="Minimize question card"
                      style={{
                        padding: '2px 8px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#475569',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Minimize ▾
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapPyqDockMode('hidden')}
                      title="Close dock"
                      style={{
                        border: 'none',
                        background: 'none',
                        color: '#64748b',
                        fontSize: 14,
                        cursor: 'pointer',
                        padding: '0 4px',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '12px 14px', overflowY: 'auto' }}>
                  <div
                    style={{
                      fontSize: 12.5,
                      fontWeight: 650,
                      color: '#0f172a',
                      lineHeight: 1.45,
                      marginBottom: 10,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {currentMapQ?.stem}
                  </div>

                  {/* Options List */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {(currentMapQ?.options || []).map((opt) => {
                      const isCorrect =
                        (opt.label || '').toLowerCase() ===
                        (currentMapQ.correctLabel || '').toLowerCase();
                      const isSelected = chosen === opt.label;
                      let border = '#cbd5e1';
                      let bg = '#ffffff';
                      let textColor = '#1e293b';
                      if (isRevealed) {
                        if (isCorrect) {
                          border = '#10b981';
                          bg = '#ecfdf5';
                          textColor = '#065f46';
                        } else if (isSelected) {
                          border = '#ef4444';
                          bg = '#fef2f2';
                          textColor = '#991b1b';
                        }
                      }
                      return (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => handleOptionClick(currentMapQ.id, opt.label)}
                          style={{
                            textAlign: 'left',
                            padding: '6px 9px',
                            borderRadius: 7,
                            border: `1.5px solid ${border}`,
                            background: bg,
                            color: textColor,
                            fontSize: 11.5,
                            cursor: 'pointer',
                            fontWeight: isRevealed && isCorrect ? 800 : 600,
                            lineHeight: 1.35,
                            transition: 'all 0.12s ease',
                          }}
                        >
                          <strong style={{ color: '#0f172a' }}>({opt.label})</strong> {opt.text}
                        </button>
                      );
                    })}
                  </div>

                  {isRevealed && (
                    <div
                      style={{
                        marginTop: 9,
                        padding: '7px 11px',
                        borderRadius: 7,
                        background: isAnswerCorrect ? '#ecfdf5' : '#fef2f2',
                        border: `1.5px solid ${isAnswerCorrect ? '#86efac' : '#fca5a5'}`,
                        color: isAnswerCorrect ? '#065f46' : '#991b1b',
                        fontWeight: 700,
                        fontSize: 11.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>
                        {isAnswerCorrect ? '✓ Correct Answer: ' : '✗ Answer: '}
                        ({currentMapQ.correctLabel?.toUpperCase()}) {currentMapQ.answerText}
                      </span>
                      {mapPyqIndex < practiceQuestionsForSelected.length - 1 && (
                        <button
                          type="button"
                          onClick={() => setMapPyqIndex((i) => i + 1)}
                          style={{
                            border: 'none',
                            background: '#0f172a',
                            color: '#fef08a',
                            padding: '3px 9px',
                            borderRadius: 5,
                            fontSize: 11,
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          Next Question →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* ================================================================= */}
        {/* COLUMN 3A: IR ORGANIZATION CARD (When an IR Grouping is selected) */}
        {/* ================================================================= */}
        {activeOrg && !selectedNode && (
          <div
            style={{
              width: isMobile ? '100%' : 400,
              minWidth: isMobile ? 0 : 370,
              background: '#ffffff',
              borderLeft: isMobile ? 'none' : '1px solid #e2e8f0',
              height: '100%',
              overflowY: 'auto',
              padding: isMobile ? '14px 16px 72px' : '18px 20px 28px',
              boxSizing: 'border-box',
              display: isMobile ? (mobileTab === 'study' ? 'flex' : 'none') : 'flex',
              flexDirection: 'column',
              gap: 16,
              zIndex: isMobile ? 25 : 20,
              ...(isMobile
                ? {
                    position: 'absolute',
                    inset: 0,
                  }
                : {}),
            }}
          >
            {isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <button
                  type="button"
                  onClick={() => setMobileTab('map')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  ← Back to Map
                </button>
                <button
                  type="button"
                  onClick={() => setActiveOrg(null)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 8,
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Close ✕
                </button>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#b45309',
                    background: '#fef3c7',
                    padding: '3px 9px',
                    borderRadius: 999,
                  }}
                >
                  International Grouping
                </span>
                <h2 style={{ fontSize: 21, fontWeight: 800, margin: '8px 0 4px', color: '#0f172a' }}>
                  {activeOrg.shortName} — {activeOrg.name}
                </h2>
                <div style={{ fontSize: 12.5, color: '#64748b' }}>
                  HQ: {activeOrg.hq || 'N/A'} • Est. {activeOrg.established || 'N/A'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveOrg(null)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 7,
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#64748b',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: 12,
                padding: '12px 14px',
                fontSize: 13,
                color: '#92400e',
                lineHeight: 1.6,
              }}
            >
              <strong>India&apos;s Position:</strong> {activeOrg.indiaStatus || 'Key strategic partner'}
            </div>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '14px 16px',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                Member Countries (Highlighted on Map)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(activeOrg.members || '')
                  .split(',')
                  .map((m) => m.trim())
                  .filter(Boolean)
                  .map((member) => (
                    <span
                      key={member}
                      style={{
                        fontSize: 12,
                        padding: '4px 9px',
                        borderRadius: 6,
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#0f172a',
                        fontWeight: 600,
                      }}
                    >
                      {member}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* COLUMN 3B: RIGHT STUDY & PRACTICE SHEET (Matches Approved UI)     */}
        {/* ================================================================= */}
        {selectedNode && (
          <div
            style={{
              width: isMobile ? '100%' : 405,
              minWidth: isMobile ? 0 : 375,
              background: '#ffffff',
              borderLeft: isMobile ? 'none' : '1px solid #e2e8f0',
              height: '100%',
              display: isMobile ? (mobileTab === 'study' ? 'flex' : 'none') : 'flex',
              flexDirection: 'column',
              zIndex: isMobile ? 25 : 20,
              paddingBottom: isMobile ? 60 : 0,
              ...(isMobile
                ? {
                    position: 'absolute',
                    inset: 0,
                  }
                : {}),
            }}
          >
            {/* Mobile Header Bar */}
            {isMobile && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                }}
              >
                <button
                  type="button"
                  onClick={() => setMobileTab('map')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: 12.5,
                    cursor: 'pointer',
                  }}
                >
                  ← Back to Map
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 8,
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Close ✕
                </button>
              </div>
            )}
            {/* Scrollable Body */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px 20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              {/* Top Row: #1 · Theme Badge + Bookmark + < > Prev/Next Stepper */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: `${selectedNode.folderColor || '#0d9488'}16`,
                    color: selectedNode.folderColor || '#0d9488',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  <span>
                    {selectedNode.basinLabel
                      ? `${selectedNode.basinLabel} · ${selectedIndexInFeed >= 0 ? selectedIndexInFeed + 1 : 1} of ${numberedNodes.length}`
                      : `${selectedNode.folderShortLabel || selectedNode.placeType} · ${selectedIndexInFeed >= 0 ? selectedIndexInFeed + 1 : 1} of ${numberedNodes.length}`}
                  </span>
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => toggleBookmark(selectedNode.id)}
                    title="Bookmark this place"
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 7,
                      border: '1px solid #e2e8f0',
                      background: bookmarkedIds.has(selectedNode.id) ? '#fef3c7' : '#ffffff',
                      color: bookmarkedIds.has(selectedNode.id) ? '#d97706' : '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                    }}
                  >
                    🔖
                  </button>

                  <button
                    type="button"
                    disabled={selectedIndexInFeed <= 0}
                    onClick={() => {
                      if (selectedIndexInFeed > 0) {
                        handleSelectNode(numberedNodes[selectedIndexInFeed - 1]);
                      }
                    }}
                    title="Previous place"
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 7,
                      border: '1px solid #e2e8f0',
                      background: '#ffffff',
                      color: selectedIndexInFeed <= 0 ? '#cbd5e1' : '#334155',
                      cursor: selectedIndexInFeed <= 0 ? 'not-allowed' : 'pointer',
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    disabled={
                      selectedIndexInFeed === -1 ||
                      selectedIndexInFeed >= numberedNodes.length - 1
                    }
                    onClick={() => {
                      if (
                        selectedIndexInFeed !== -1 &&
                        selectedIndexInFeed < numberedNodes.length - 1
                      ) {
                        handleSelectNode(numberedNodes[selectedIndexInFeed + 1]);
                      }
                    }}
                    title={nextPlaceName ? `Next: ${nextPlaceName}` : 'Next place'}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 7,
                      border: '1px solid #e2e8f0',
                      background: '#ffffff',
                      color:
                        selectedIndexInFeed === -1 ||
                        selectedIndexInFeed >= numberedNodes.length - 1
                          ? '#cbd5e1'
                          : '#334155',
                      cursor:
                        selectedIndexInFeed === -1 ||
                        selectedIndexInFeed >= numberedNodes.length - 1
                          ? 'not-allowed'
                          : 'pointer',
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    ›
                  </button>
                </div>
              </div>

              {/* Clean Place Heading */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h2
                    style={{
                      fontSize: 21,
                      fontWeight: 800,
                      margin: 0,
                      color: '#0f172a',
                      letterSpacing: '-0.01em',
                      lineHeight: 1.25,
                    }}
                  >
                    {formatCleanPlaceHeading(selectedNode)}
                  </h2>
                  {(selectedNode.isMaster || selectedNode.tier === 'master') && (
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 800,
                        background: '#fef3c7',
                        color: '#b45309',
                        border: '1px solid #fde68a',
                        padding: '2px 7px',
                        borderRadius: 5,
                        letterSpacing: '0.02em',
                      }}
                    >
                      ⭐ Prelims Core Anchor
                    </span>
                  )}
                </div>
              </div>

              {panelMode === 'STUDY' ? (
                (() => {
                  const placeDescriptor = formatPlaceDescriptor(selectedNode);
                  const whyInNewsText = formatWhyInNews30Words(selectedNode);
                  const otherImportanceList = formatOtherImportanceList(selectedNode);
                  const relatedPyqList = formatRelatedPyqList(selectedNode);
                  const firstTrigger = selectedNode.newsTriggers?.[0] || null;

                  return (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 14,
                      }}
                    >
                      {/* 1. PLACE */}
                      <div
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: 12,
                          padding: '11px 14px',
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10.5,
                            fontWeight: 800,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            color: '#475569',
                            marginBottom: 4,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                          }}
                        >
                          <span style={{ color: '#ef4444' }}>📍</span>
                          <span>1. Place</span>
                        </div>
                        <div
                          style={{
                            fontSize: 13.5,
                            fontWeight: 700,
                            color: '#0f172a',
                            lineHeight: 1.45,
                          }}
                        >
                          {placeDescriptor}
                        </div>
                      </div>

                      {/* 2. WHY IN NEWS (<= 30 Words) */}
                      {whyInNewsText && (
                        <div
                          style={{
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: 12,
                            padding: '12px 14px',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 8,
                              marginBottom: 5,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 10.5,
                                fontWeight: 800,
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                                color: '#1d4ed8',
                              }}
                            >
                              2. Why in News
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              {firstTrigger?.source && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    padding: '2px 6px',
                                    borderRadius: 5,
                                    background: '#dbeafe',
                                    color: '#1e40af',
                                  }}
                                >
                                  {firstTrigger.source}
                                </span>
                              )}
                              {getNodeDateStr(selectedNode) && (
                                <span style={{ fontSize: 11, color: '#3b82f6', fontWeight: 600 }}>
                                  {formatDayShort(getNodeDateStr(selectedNode))}
                                </span>
                              )}
                            </div>
                          </div>

                          <div
                            style={{
                              fontSize: 13.5,
                              color: '#1e3a8a',
                              lineHeight: 1.5,
                              fontWeight: 500,
                            }}
                          >
                            {whyInNewsText}
                          </div>

                          {firstTrigger?.url && (
                            <div style={{ marginTop: 6 }}>
                              <a
                                href={firstTrigger.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  fontSize: 11.5,
                                  fontWeight: 700,
                                  color: '#2563eb',
                                  textDecoration: 'none',
                                }}
                              >
                                Source ↗
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 3. OTHER IMPORTANCE (Concise, Non-Redundant Static Anchors) */}
                      {otherImportanceList.length > 0 && (
                        <div
                          style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: 12,
                            padding: '13px 15px',
                          }}
                        >
                          <div
                            style={{
                              fontSize: 10.5,
                              fontWeight: 800,
                              letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                              color: '#0f766e',
                              marginBottom: 8,
                            }}
                          >
                            {whyInNewsText ? '3. Other Importance' : '2. Key Importance'}
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 9,
                            }}
                          >
                            {otherImportanceList.map((item, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: 8,
                                  fontSize: 13.5,
                                  color: '#1e293b',
                                  lineHeight: 1.52,
                                }}
                              >
                                <span
                                  style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    background: '#0d9488',
                                    marginTop: 7,
                                    flexShrink: 0,
                                  }}
                                />
                                <span>
                                  {item.label && (
                                    <em
                                      style={{
                                        fontWeight: 700,
                                        color: '#0f172a',
                                        marginRight: 5,
                                      }}
                                    >
                                      {item.label}:
                                    </em>
                                  )}
                                  <span>{item.text}</span>
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 4. RELATED PYQ (If Any) */}
                      {relatedPyqList.length > 0 && (
                        <div
                          style={{
                            background: '#fffbeb',
                            border: '1px solid #fde68a',
                            borderRadius: 12,
                            padding: '12px 14px',
                          }}
                        >
                          <div
                            style={{
                              fontSize: 10.5,
                              fontWeight: 800,
                              letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                              color: '#b45309',
                              marginBottom: 7,
                            }}
                          >
                            {whyInNewsText ? '4. Related PYQ' : '3. Related PYQ'}
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 7,
                            }}
                          >
                            {relatedPyqList.map((pyq, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: 8,
                                  fontSize: 13,
                                  color: '#78350f',
                                  lineHeight: 1.48,
                                }}
                              >
                                <span
                                  style={{
                                    width: 5,
                                    height: 5,
                                    borderRadius: '50%',
                                    background: '#d97706',
                                    marginTop: 7,
                                    flexShrink: 0,
                                  }}
                                />
                                <span>
                                  <strong style={{ color: '#92400e', fontWeight: 800 }}>
                                    {pyq.yearLabel}:
                                  </strong>{' '}
                                  <span>{pyq.summary}</span>
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* DEDICATED RIVER DETAILS (For Static River Nodes) */}
                      {selectedNode.riverDetails && (() => {
                        const rd = selectedNode.riverDetails;
                        return (
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 12,
                              background: '#f0f9ff',
                              border: '1px solid #bae6fd',
                              borderRadius: 14,
                              padding: '14px 16px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e0f2fe', paddingBottom: 8 }}>
                              <span style={{ fontSize: 12, fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span>🌊</span> River Details ({rd.length || 'Full Course'})
                              </span>
                            </div>

                            <div style={{ background: '#ffffff', borderRadius: 10, padding: '10px 12px', border: '1px solid #e2e8f0', fontSize: 12.5, lineHeight: 1.5 }}>
                              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                                <span>📍</span> Where it starts &amp; where it ends
                              </div>
                              <div style={{ color: '#334155' }}>
                                <strong>Origin:</strong> {rd.origin}
                              </div>
                              <div style={{ color: '#334155', marginTop: 3 }}>
                                <strong>Mouth:</strong> {rd.mouth}
                              </div>
                            </div>

                            {rd.states && (
                              <div style={{ background: '#ffffff', borderRadius: 10, padding: '10px 12px', border: '1px solid #e2e8f0', fontSize: 12.5, lineHeight: 1.5 }}>
                                <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                                  <span>🗺️</span> States it passes through
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 4 }}>
                                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, alignSelf: 'center', marginRight: 2 }}>Direct Flow:</span>
                                  {rd.states.flowsThrough?.map((st, sIdx) => (
                                    <span key={sIdx} style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#dbeafe', color: '#1e40af' }}>
                                      {st}
                                    </span>
                                  ))}
                                </div>
                                {rd.states.basinStates && (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
                                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, alignSelf: 'center', marginRight: 2 }}>Basin Catchment:</span>
                                    {rd.states.basinStates.map((st, bIdx) => (
                                      <span key={bIdx} style={{ fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 999, background: '#f1f5f9', color: '#475569' }}>
                                        {st}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {rd.tributaries && (
                              <div style={{ background: '#ffffff', borderRadius: 10, padding: '10px 12px', border: '1px solid #e2e8f0', fontSize: 12.5 }}>
                                <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                                  <span>⚖️</span> Left-bank vs Right-bank Tributaries
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                  <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 8, borderLeft: '3px solid #3b82f6' }}>
                                    <div style={{ fontSize: 11, fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', marginBottom: 4 }}>
                                      ⬅️ Left-Bank
                                    </div>
                                    <ul style={{ margin: 0, paddingLeft: 14, fontSize: 11.5, color: '#334155', lineHeight: 1.45 }}>
                                      {rd.tributaries.leftBank?.map((trib, tIdx) => (
                                        <li key={tIdx} style={{ marginBottom: 4 }}>
                                          <strong>{trib.name}</strong>
                                          {trib.note && <span style={{ color: '#64748b' }}> — {trib.note}</span>}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 8, borderLeft: '3px solid #10b981' }}>
                                    <div style={{ fontSize: 11, fontWeight: 800, color: '#047857', textTransform: 'uppercase', marginBottom: 4 }}>
                                      ➡️ Right-Bank
                                    </div>
                                    <ul style={{ margin: 0, paddingLeft: 14, fontSize: 11.5, color: '#334155', lineHeight: 1.45 }}>
                                      {rd.tributaries.rightBank?.map((trib, tIdx) => (
                                        <li key={tIdx} style={{ marginBottom: 4 }}>
                                          <strong>{trib.name}</strong>
                                          {trib.note && <span style={{ color: '#64748b' }}> — {trib.note}</span>}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            )}

                            {Array.isArray(rd.confluences) && rd.confluences.length > 0 && (
                              <div style={{ background: '#ffffff', borderRadius: 10, padding: '10px 12px', border: '1px solid #e2e8f0', fontSize: 12.5 }}>
                                <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                                  <span>🤝</span> Important Sangams (Confluences)
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                  {rd.confluences.map((c, cIdx) => (
                                    <div key={cIdx} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, fontSize: 12, borderBottom: cIdx === rd.confluences.length - 1 ? 'none' : '1px dashed #f1f5f9', paddingBottom: 4 }}>
                                      <div>
                                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{c.sangam}</span>
                                        {c.note && <div style={{ fontSize: 11, color: '#64748b' }}>{c.note}</div>}
                                      </div>
                                      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                        <span style={{ fontSize: 10.5, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: '#e0f2fe', color: '#0369a1' }}>{c.tributary}</span>
                                        <span style={{ fontSize: 10.5, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: '#f1f5f9', color: '#475569' }}>{c.state}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {Array.isArray(rd.towns) && rd.towns.length > 0 && (
                              <div style={{ background: '#ffffff', borderRadius: 10, padding: '10px 12px', border: '1px solid #e2e8f0', fontSize: 12.5 }}>
                                <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                                  <span>🏛️</span> Important cities &amp; historical towns on the river
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                  {rd.towns.map((tw, twIdx) => (
                                    <div key={twIdx} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, fontSize: 12, borderBottom: twIdx === rd.towns.length - 1 ? 'none' : '1px dashed #f1f5f9', paddingBottom: 4 }}>
                                      <div>
                                        <strong style={{ color: '#0f172a' }}>{tw.name}</strong>
                                        <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: tw.type === 'Cultural' ? '#fef3c7' : tw.type === 'Historical' ? '#f3e8ff' : '#e0f2fe', color: tw.type === 'Cultural' ? '#b45309' : tw.type === 'Historical' ? '#7e22ce' : '#0369a1', marginLeft: 6 }}>
                                          {tw.type}
                                        </span>
                                        <div style={{ fontSize: 11, color: '#64748b' }}>{tw.significance}</div>
                                      </div>
                                      <span style={{ fontSize: 10.5, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: '#f1f5f9', color: '#475569', flexShrink: 0 }}>
                                        {tw.state}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {Array.isArray(rd.dams) && rd.dams.length > 0 && (
                              <div style={{ background: '#ffffff', borderRadius: 10, padding: '10px 12px', border: '1px solid #e2e8f0', fontSize: 12.5 }}>
                                <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                                  <span>🏗️</span> Major dams and barrages (and which state)
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                  {rd.dams.map((dam, dIdx) => (
                                    <div key={dIdx} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, fontSize: 12, borderBottom: dIdx === rd.dams.length - 1 ? 'none' : '1px dashed #f1f5f9', paddingBottom: 4 }}>
                                      <div>
                                        <strong style={{ color: '#0f172a' }}>{dam.name}</strong>
                                        {dam.type && <div style={{ fontSize: 11, color: '#64748b' }}>{dam.type}</div>}
                                      </div>
                                      <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 6, background: '#fee2e2', color: '#b91c1c', flexShrink: 0 }}>
                                        {dam.state}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {Array.isArray(rd.protectedAreas) && rd.protectedAreas.length > 0 && (
                              <div style={{ background: '#ffffff', borderRadius: 10, padding: '10px 12px', border: '1px solid #e2e8f0', fontSize: 12.5 }}>
                                <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                                  <span>🌲</span> National parks &amp; sanctuaries on river or in basin
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                  {rd.protectedAreas.map((pa, paIdx) => (
                                    <div key={paIdx} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, fontSize: 12, borderBottom: paIdx === rd.protectedAreas.length - 1 ? 'none' : '1px dashed #f1f5f9', paddingBottom: 4 }}>
                                      <div>
                                        <strong style={{ color: '#047857' }}>{pa.name}</strong>
                                        <div style={{ fontSize: 11, color: '#64748b' }}>{pa.relation}</div>
                                      </div>
                                      <span style={{ fontSize: 10.5, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: '#f1f5f9', color: '#475569', flexShrink: 0 }}>
                                        {pa.state}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {Array.isArray(rd.species) && rd.species.length > 0 && (
                              <div style={{ background: '#ffffff', borderRadius: 10, padding: '10px 12px', border: '1px solid #e2e8f0', fontSize: 12.5 }}>
                                <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                                  <span>🐬</span> Important animals &amp; birds in the river
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                  {rd.species.map((sp, spIdx) => {
                                    const isCrit = sp.iucn === 'Critically Endangered' || sp.iucn === 'CR';
                                    const isEn = sp.iucn === 'Endangered' || sp.iucn === 'EN';
                                    const badgeBg = isCrit ? '#fee2e2' : isEn ? '#ffedd5' : '#fef9c3';
                                    const badgeColor = isCrit ? '#991b1b' : isEn ? '#9a3412' : '#854d0e';
                                    return (
                                      <div key={spIdx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 9px', flex: '1 1 calc(50% - 6px)', minWidth: 140 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                                          <strong style={{ fontSize: 12, color: '#0f172a' }}>{sp.name}</strong>
                                          {sp.iucn && (
                                            <span style={{ fontSize: 9.5, fontWeight: 800, padding: '1px 5px', borderRadius: 4, background: badgeBg, color: badgeColor }}>
                                              {sp.iucn}
                                            </span>
                                          )}
                                        </div>
                                        {sp.role && <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{sp.role}</div>}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {rd.commonMistake && (
                              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 12px', fontSize: 12, lineHeight: 1.5, color: '#92400e' }}>
                                <strong style={{ color: '#b45309', fontWeight: 800 }}>⚠️ Common student mistake / UPSC Trap: </strong>
                                <span>{rd.commonMistake}</span>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* CONNECTED NEURAL GRAPH NODE */}
                      {selectedNode.linkedIssueSlug && (
                        <div
                          style={{
                            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                            border: '1px solid #a7f3d0',
                            borderRadius: 10,
                            padding: '11px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12,
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: 10,
                                fontWeight: 800,
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                                color: '#047857',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5,
                                marginBottom: 2,
                              }}
                            >
                              <span>🧠</span>
                              <span>CONNECTED NEURAL NODE</span>
                              <span
                                style={{
                                  background: '#d1fae5',
                                  color: '#065f46',
                                  fontSize: 9.5,
                                  padding: '1px 5px',
                                  borderRadius: 4,
                                  fontWeight: 700,
                                }}
                              >
                                {selectedNode.linkedIssueDomain || selectedNode.subject}
                              </span>
                            </div>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: '#064e3b',
                                lineHeight: 1.35,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={selectedNode.linkedIssueTitle}
                            >
                              {selectedNode.linkedIssueTitle || selectedNode.linkedIssueSlug}
                            </div>
                            <div style={{ fontSize: 11, color: '#059669', marginTop: 1 }}>
                              Syllabus Theory & Previous Year Questions
                            </div>
                          </div>
                          <a
                            href={`/node/${selectedNode.linkedIssueSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '6px 12px',
                              background: '#059669',
                              color: '#ffffff',
                              borderRadius: 7,
                              fontSize: 12,
                              fontWeight: 700,
                              textDecoration: 'none',
                              flexShrink: 0,
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            }}
                          >
                            Explore Node →
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                /* PRACTICE MODE VIEW */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingBottom: 8,
                      borderBottom: '1px solid #e2e8f0',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#0f172a',
                      }}
                    >
                      Prelims PYQs & MCQs ({practiceQuestionsForSelected.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setPanelMode('STUDY')}
                      style={{
                        border: 'none',
                        background: 'none',
                        color: '#2563eb',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      ← Back to Study Notes
                    </button>
                  </div>

                  {practiceQuestionsForSelected.map((q) => {
                    const chosen = selectedAnswers[q.id];
                    const isRevealed = revealedQuestions[q.id];
                    return (
                      <div
                        key={q.id}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: 12,
                          padding: 14,
                          fontSize: 13,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            color: q.isSynthesized ? '#2563eb' : '#0d9488',
                            marginBottom: 6,
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>
                            {q.exam} ({q.examYear})
                          </span>
                        </div>
                        <div
                          style={{
                            whiteSpace: 'pre-line',
                            color: '#0f172a',
                            lineHeight: 1.55,
                            marginBottom: 12,
                            fontWeight: 500,
                          }}
                        >
                          {q.stem}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {(q.options || []).map((opt) => {
                            const isCorrect =
                              (opt.label || '').toLowerCase() ===
                              (q.correctLabel || '').toLowerCase();
                            const isSelected = chosen === opt.label;
                            let border = '#cbd5e1';
                            let bg = '#ffffff';
                            let textColor = '#1e293b';
                            if (isRevealed) {
                              if (isCorrect) {
                                border = '#10b981';
                                bg = '#ecfdf5';
                                textColor = '#065f46';
                              } else if (isSelected) {
                                border = '#ef4444';
                                bg = '#fef2f2';
                                textColor = '#991b1b';
                              }
                            }
                            return (
                              <button
                                key={opt.label}
                                type="button"
                                onClick={() => handleOptionClick(q.id, opt.label)}
                                style={{
                                  textAlign: 'left',
                                  padding: '8px 11px',
                                  borderRadius: 8,
                                  border: `1.5px solid ${border}`,
                                  background: bg,
                                  color: textColor,
                                  fontSize: 12.5,
                                  cursor: 'pointer',
                                  fontWeight: isRevealed && isCorrect ? 700 : 500,
                                }}
                              >
                                <strong>({opt.label})</strong> {opt.text}
                              </button>
                            );
                          })}
                        </div>
                        {isRevealed && (
                          <div
                            style={{
                              marginTop: 10,
                              padding: '8px 10px',
                              borderRadius: 8,
                              background: '#ecfdf5',
                              color: '#065f46',
                              fontWeight: 700,
                              fontSize: 12,
                            }}
                          >
                            ✓ Correct Answer: ({q.correctLabel?.toUpperCase()}) {q.answerText}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sticky Bottom Actions (Inspired by Main.dc.html Study View) */}
            <div
              style={{
                padding: '12px 16px',
                borderTop: '1px solid #e2e8f0',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => toggleStudied(selectedNode.id)}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: 9,
                    border: studiedIds.has(selectedNode.id)
                      ? '1.5px solid #10b981'
                      : '1px solid #cbd5e1',
                    background: studiedIds.has(selectedNode.id) ? '#ecfdf5' : '#ffffff',
                    color: studiedIds.has(selectedNode.id) ? '#065f46' : '#334155',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{studiedIds.has(selectedNode.id) ? '✓ Learned' : '○ Mark Learned'}</span>
                </button>

                {nextNodeInFeed && (
                  <button
                    type="button"
                    onClick={() => handleSelectNode(nextNodeInFeed)}
                    style={{
                      flex: 1.2,
                      padding: '10px 12px',
                      borderRadius: 9,
                      border: '1px solid #0f172a',
                      background: '#0f172a',
                      color: '#ffffff',
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.18)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>Next: {nextPlaceName} →</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  setPanelMode((prev) => (prev === 'STUDY' ? 'PRACTICE' : 'STUDY'))
                }
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 9,
                  border: '1px solid #f59e0b',
                  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                  color: '#ffffff',
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 3px 10px rgba(245, 158, 11, 0.2)',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#f59e0b' }}>🔥</span>
                  <span>
                    {panelMode === 'STUDY'
                      ? 'Practice related PYQs & MCQs'
                      : 'Return to Study Notes'}
                  </span>
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      fontSize: 11,
                      padding: '1px 8px',
                      borderRadius: 999,
                      background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                      color: '#ffffff',
                      fontWeight: 900,
                    }}
                  >
                    {practiceQuestionsForSelected.length} Qs
                  </span>
                  <span style={{ color: '#f59e0b', fontWeight: 800 }}>→</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Mobile Study Tab Empty State (when user taps Study tab without selecting a place) */}
        {isMobile && mobileTab === 'study' && !selectedNode && !activeOrg && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px 20px 80px',
              textAlign: 'center',
              zIndex: 25,
            }}
          >
            <div style={{ fontSize: 42, marginBottom: 14 }}>🗺️</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px', color: '#0f172a' }}>
              No Place Selected
            </h3>
            <p style={{ fontSize: 13.5, color: '#64748b', maxWidth: 300, lineHeight: 1.5, margin: '0 0 20px' }}>
              Tap any pin on the interactive map or choose a place from the Places list to open its UPSC study notes and practice questions.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setMobileTab('map')}
                style={{
                  padding: '9px 16px',
                  borderRadius: 8,
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Go to Map 🗺️
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('places')}
                style={{
                  padding: '9px 16px',
                  borderRadius: 8,
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Browse Places 📋
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      {isMobile && activeMode && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 56,
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            zIndex: 1000,
            paddingBottom: 'env(safe-area-inset-bottom)',
            boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.06)',
          }}
        >
          <button
            type="button"
            onClick={() => setMobileTab('map')}
            style={{
              flex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              border: 'none',
              background: 'transparent',
              color: mobileTab === 'map' ? '#0284c7' : '#64748b',
              fontWeight: mobileTab === 'map' ? 800 : 600,
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 18 }}>🗺️</span>
            <span>Map</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('places')}
            style={{
              flex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              border: 'none',
              background: 'transparent',
              color: mobileTab === 'places' ? '#0284c7' : '#64748b',
              fontWeight: mobileTab === 'places' ? 800 : 600,
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 18 }}>📋</span>
            <span>Places ({numberedNodes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('study')}
            style={{
              flex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              border: 'none',
              background: 'transparent',
              color: mobileTab === 'study' ? '#0284c7' : '#64748b',
              fontWeight: mobileTab === 'study' ? 800 : 600,
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 18 }}>📖</span>
            <span>Study Sheet {selectedNode ? '•' : ''}</span>
          </button>
        </div>
      )}
    </div>
  );
}
