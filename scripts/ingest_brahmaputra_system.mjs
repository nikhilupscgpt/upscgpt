import fs from 'fs';
import { CURATED_MAPPING_NODES } from '../src/lib/static-mapping-data.js';

const rawBrahma = JSON.parse(fs.readFileSync('/Users/nikhilwandhe/Downloads/brahmaputra_system.json', 'utf8'));

const riverShapes = {
  'brahmaputra-river': [
    [30.35, 82.10], // Chemayungdung / Angsi Glacier (Tibet)
    [29.30, 89.15], // Shigatse
    [29.25, 91.10], // Lhasa / Tsela Dzong
    [29.56, 94.95], // Namcha Barwa Great Bend
    [28.85, 95.30], // Gelling / Tuting (enters India as Siang)
    [28.05, 95.33], // Pasighat (joins Dibang & Lohit)
    [27.85, 95.65], // Sadiya
    [27.48, 94.90], // Dibrugarh (Bogibeel Bridge)
    [26.95, 94.20], // Majuli Island / Jorhat
    [26.60, 92.80], // Tezpur (Kolia Bhomora Setu)
    [26.18, 91.75], // Guwahati (Saraighat Bridge)
    [26.00, 90.50], // Goalpara / Jogighopa
    [26.02, 89.98], // Dhubri (enters Bangladesh as Jamuna)
    [23.80, 89.80], // Goalundo (meets Padma)
    [22.50, 90.75]  // Meghna estuary into Bay of Bengal
  ],
  'dibang-river': [
    [28.95, 95.75], // Indo-China border (Mishmi Hills)
    [28.55, 95.80], // Anini (Dibang Valley)
    [28.25, 95.82], // Munli (Dibang Multipurpose Project dam site)
    [28.00, 95.68], // Roing
    [27.80, 95.65]  // Meets Siang & Lohit near Sadiya
  ],
  'lohit-river': [
    [28.66, 97.47], // Zayul Chu (Tibet)
    [28.23, 97.02], // Kibithu / Walong (India border)
    [28.08, 96.55], // Hayuliang (Anjaw district)
    [27.93, 96.18], // Parasuram Kund (Tezu)
    [27.85, 95.55]  // Dhola-Sadiya Bridge / meets Siang
  ],
  'subansiri-river': [
    [28.65, 92.80], // Tibet headwaters
    [28.15, 93.85], // Daporijo (Upper Subansiri)
    [27.55, 94.25], // Gerukamukh (Subansiri Lower HEP 2,000 MW)
    [27.20, 94.15], // North Lakhimpur
    [26.95, 94.20]  // Joins Brahmaputra opposite Majuli
  ],
  'kameng-river': [
    [27.80, 92.40], // Gori Chen glacier / Tawang
    [27.33, 92.82], // Bhalukpong (Arunachal-Assam border, Pakke TR)
    [26.95, 92.85], // Nameri National Park
    [26.62, 92.85]  // Tezpur (joins Brahmaputra as Jia Bharali)
  ],
  'manas-river': [
    [28.00, 91.00], // Drangme Chhu & Mangde Chhu (Bhutan)
    [26.79, 90.97], // Royal Manas - Manas National Park
    [26.50, 90.80], // Barpeta Road
    [26.23, 90.57]  // Jogighopa (joins Brahmaputra)
  ],
  'teesta-river': [
    [27.98, 88.80], // Tso Lhamo Lake / Teesta Khangse Glacier
    [27.60, 88.55], // Chungthang (meets Lachen & Lachung)
    [27.33, 88.50], // Singtam / Rangpo
    [27.08, 88.45], // Teesta Bazaar (meets Rangeet River)
    [26.88, 88.58], // Sevoke (Coronation Bridge)
    [26.55, 88.75], // Jalpaiguri (Gajoldoba Barrage)
    [25.55, 89.65]  // Chilmari (joins Jamuna in Bangladesh)
  ],
  'dhansiri-river': [
    [25.55, 93.95], // Laisang peak (Nagaland)
    [25.90, 93.73], // Dimapur
    [26.15, 93.80], // Doyang confluence (Amur Falcon sanctuary)
    [26.50, 93.85], // Golaghat
    [26.73, 93.83]  // Dhansirimukh (joins Brahmaputra)
  ],
  'barak-river': [
    [25.40, 94.10], // Liyai Kullen (Senapati district, Manipur)
    [24.85, 93.05], // Tipaimukh (Manipur-Mizoram-Assam trijunction)
    [24.82, 92.80], // Silchar (Cachar, Barak Valley)
    [24.88, 92.48], // Bhanga / Karimganj (splits into Surma & Kushiyara)
    [24.05, 91.00]  // Reunites as Meghna in Bangladesh
  ]
};

const riverIds = {
  'brahmaputra-river': 'IND-RIV-03',
  'dibang-river': 'IND-RIV-03B',
  'lohit-river': 'IND-RIV-03C',
  'subansiri-river': 'IND-RIV-03D',
  'kameng-river': 'IND-RIV-03E',
  'manas-river': 'IND-RIV-03F',
  'teesta-river': 'IND-RIV-03G',
  'dhansiri-river': 'IND-RIV-03H',
  'barak-river': 'IND-RIV-03I'
};

const riverAliases = {
  'brahmaputra-river': ['Yarlung Tsangpo', 'Siang', 'Dihang', 'Jamuna', 'Luit', 'Red River'],
  'dibang-river': ['Sikang', 'Talon', 'Dibang Valley River', 'Idu Mishmi River'],
  'lohit-river': ['Zayu Chu', 'River of Blood', 'Parasuram Kund River', 'Mishmi River'],
  'subansiri-river': ['Gold River', 'Kamla River', 'Lower Subansiri River', 'Mirihills River'],
  'kameng-river': ['Jia Bharali', 'Bhareli', 'Kameng River', 'Pakke River'],
  'manas-river': ['Drangme Chhu', 'Dangme Chhu', 'Manasa', 'Manas National Park River'],
  'teesta-river': ['Tista', 'Rangeet River', 'Lifeline of Sikkim', 'Tso Lhamo River'],
  'dhansiri-river': ['Dhansiri South', 'Doyang River', 'Dimapur River', 'Golaghat River'],
  'barak-river': ['Surma', 'Kushiyara', 'Meghna headwaters', 'Tuivai', 'NW-16 River']
};

const riverPYQs = {
  'brahmaputra-river': [
    'GEO-UPSC-2016-04',
    'GEO-UPSC-2014-06',
    'GEO-CDS1-2016-07',
    'ENV-UPSC-2020-05',
    'ENV-UPSC-2012-11'
  ],
  'dibang-river': [
    'GEO-UPSC-2016-04',
    'GEO-CDS1-2016-07'
  ],
  'lohit-river': [
    'GEO-UPSC-2016-04',
    'GEO-UPSC-2014-06',
    'GEO-CDS1-2016-07'
  ],
  'subansiri-river': [
    'GEO-UPSC-2014-06',
    'GEO-CDS1-2016-07',
    'GEO-CDS2-2022-07'
  ],
  'kameng-river': [
    'GEO-UPSC-2016-04',
    'GEO-CDS1-2016-07'
  ],
  'manas-river': [
    'GEO-CDS1-2016-07',
    'ENV-UPSC-2020-05',
    'ENV-UPSC-2012-11',
    'GEO-UPSC-2019-04'
  ],
  'teesta-river': [
    'GEO-UPSC-2017-04',
    'UPSC-2026-25',
    'GEO-CDS1-2016-07'
  ],
  'dhansiri-river': [
    'UPSC-2026-27',
    'GEO-CDS2-2022-07'
  ],
  'barak-river': [
    'GEO-UPSC-2014-06',
    'GEO-CDS2-2022-07'
  ]
};

const newBrahmaNodes = rawBrahma.map((r) => {
  const slug = r.slug;
  return {
    id: riverIds[slug] || ('IND-RIV-' + slug.toUpperCase().slice(0, 6)),
    slug: slug,
    pillar: 'STATIC',
    regionScope: 'India',
    subject: 'Geography',
    mapCategory: ['India – rivers, lakes, reservoirs & glaciers'],
    place: r.place,
    aliases: riverAliases[slug] || [r.place],
    placeType: r.placeType,
    priority: r.priority || 'High',
    locatedIn: r.locatedIn,
    lat: r.lat,
    lng: r.lng,
    shape: riverShapes[slug] || [],
    neighbours: [
      `Source: ${r.riverDetails?.origin?.slice(0, 80) || ''}`,
      `Mouth: ${r.riverDetails?.mouth?.slice(0, 80) || ''}`
    ],
    riverDetails: r.riverDetails,
    staticFacts: r.staticFacts || [],
    similarPYQ: riverPYQs[slug] || [],
    linkedIssueSlug: 'indian-drainage-himalayan-peninsular-river-systems',
    linkedIssueTitle: 'Indian Drainage — Himalayan & Peninsular River Systems',
    linkedIssueDomain: 'GEOGRAPHY'
  };
});

// Replace 'brahmaputra-river' with the 9 new nodes in CURATED_MAPPING_NODES
const brahmaIdx = CURATED_MAPPING_NODES.findIndex((n) => n.slug === 'brahmaputra-river');
if (brahmaIdx === -1) {
  console.error('brahmaputra-river not found in CURATED_MAPPING_NODES');
  process.exit(1);
}

const updatedNodes = [
  ...CURATED_MAPPING_NODES.slice(0, brahmaIdx),
  ...newBrahmaNodes,
  ...CURATED_MAPPING_NODES.slice(brahmaIdx + 1)
];

const fileHeader = `/**\n * Clean, single-feature GIS nodes for Static Mapping (India & World) and IR Mapping.\n * Every node has 100% verified PYQ IDs from mapping_pyqs (covering UPSC CSE 2011–2026 & CDS 2014–2023)\n * and bidirectional neural links to canonical Geography, Environment, and History Issue nodes.\n */\n\nexport const CURATED_MAPPING_NODES = `;

fs.writeFileSync(
  'src/lib/static-mapping-data.js',
  fileHeader + JSON.stringify(updatedNodes, null, 2) + ';\n'
);

console.log('Successfully updated src/lib/static-mapping-data.js with', newBrahmaNodes.length, 'Brahmaputra system nodes!');
console.log('Total nodes now:', updatedNodes.length);
