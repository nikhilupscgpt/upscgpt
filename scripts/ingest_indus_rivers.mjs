import fs from 'fs';
import { CURATED_MAPPING_NODES } from '../src/lib/static-mapping-data.js';

const rawIndus = JSON.parse(fs.readFileSync('/Users/nikhilwandhe/Downloads/indus_river_system.json', 'utf8'));

const riverShapes = {
  'indus-river': [
    [31.25, 81.35],
    [32.70, 79.40],
    [34.15, 77.58],
    [34.60, 76.10],
    [35.75, 74.60],
    [34.08, 72.70],
    [31.50, 70.90],
    [28.40, 69.70],
    [24.10, 67.45]
  ],
  'jhelum-river': [
    [33.53, 75.25], // Verinag Spring
    [33.73, 75.15], // Khanabal / Anantnag
    [34.08, 74.80], // Srinagar
    [34.35, 74.58], // Wular Lake
    [34.20, 74.35], // Baramulla gorge
    [34.09, 74.04], // Uri Dam
    [34.37, 73.47], // Muzaffarabad (meets Kishanganga)
    [33.14, 73.64], // Mangla Dam
    [31.15, 72.15]  // Trimmu (joins Chenab)
  ],
  'chenab-river': [
    [32.75, 77.40], // Suraj Tal / Bhaga headwaters
    [32.55, 76.97], // Tandi (Chandra + Bhaga confluence)
    [33.08, 76.43], // Pangi Valley
    [33.31, 75.76], // Kishtwar (Dulhasti)
    [33.17, 75.19], // Baglihar Dam / Ramban
    [33.15, 74.88], // Salal Dam / Reasi (Chenab Rail Bridge)
    [32.90, 74.74], // Akhnoor
    [31.15, 72.15], // Trimmu (meets Jhelum)
    [29.35, 71.03]  // Panjnad (meets Sutlej)
  ],
  'ravi-river': [
    [32.32, 76.85], // Bara Bhangal Glacier
    [32.55, 76.12], // Chamba
    [32.58, 75.92], // Chamera Dam
    [32.44, 75.73], // Ranjit Sagar / Thein Dam
    [32.28, 75.65], // Madhopur / Pathankot
    [32.04, 75.03], // Dera Baba Nanak (border)
    [31.62, 74.28], // Lahore / Shahdara
    [30.62, 71.80]  // Ahmadpur Sial (meets Chenab)
  ],
  'beas-river': [
    [32.36, 77.08], // Beas Kund / Rohtang Pass
    [32.24, 77.19], // Manali
    [31.96, 77.11], // Kullu Valley
    [31.67, 77.06], // Pandoh Dam
    [31.71, 76.93], // Mandi
    [31.97, 75.95], // Pong Dam (Maharana Pratap Sagar)
    [32.00, 75.60], // Mukerian plains
    [31.17, 75.00]  // Harike Wetland (meets Sutlej)
  ],
  'sutlej-river': [
    [30.68, 81.25], // Rakshastal, Tibet
    [31.81, 78.75], // Shipki La (enters HP)
    [31.82, 78.65], // Khab (meets Spiti River)
    [31.56, 77.98], // Nathpa Jhakri Dam, Kinnaur
    [31.45, 77.63], // Rampur
    [31.37, 76.86], // Kol Dam, Bilaspur
    [31.41, 76.43], // Bhakra Dam (Govind Sagar)
    [30.97, 76.53], // Nangal Dam & Rupnagar
    [31.17, 75.00], // Harike Wetland (meets Beas)
    [30.93, 74.60], // Ferozepur / Hussainiwala
    [29.35, 71.03]  // Panjnad (meets Chenab)
  ]
};

const riverIds = {
  'indus-river': 'IND-RIV-02',
  'jhelum-river': 'IND-RIV-02B',
  'chenab-river': 'IND-RIV-02C',
  'ravi-river': 'IND-RIV-02D',
  'beas-river': 'IND-RIV-02E',
  'sutlej-river': 'IND-RIV-02F'
};

const riverAliases = {
  'indus-river': ['Sindhu', 'Singi Khamban', "Lion's Mouth", 'Indus'],
  'jhelum-river': ['Vitasta', 'Hydaspes', 'Kashmiri: Vyeth', 'Bihat'],
  'chenab-river': ['Asikni', 'Chandrabhaga', 'Acesines', 'Chandra-Bhaga'],
  'ravi-river': ['Parushni', 'Iravati', 'Hydraotes', 'Ravi'],
  'beas-river': ['Vipasa', 'Vipasha', 'Hyphasis', 'Arjikiya'],
  'sutlej-river': ['Shutudri', 'Zadadros', 'Langchen Khambab', "Elephant's Mouth", 'Satluj']
};

const riverPYQs = {
  'indus-river': ['GEO-UPSC-2021-05', 'GEO-CDS1-2023-10', 'GEO-UPSC-2020-03', 'UPSC-2026-11'],
  'jhelum-river': ['GEO-UPSC-2023-07', 'GEO-UPSC-2021-05', 'UPSC-2026-13'],
  'chenab-river': ['GEO-UPSC-2021-05', 'GEO-UPSC-2019-04', 'UPSC-2026-13'],
  'ravi-river': ['GEO-UPSC-2021-05', 'UPSC-2026-13'],
  'beas-river': ['ENV-UPSC-2014-09', 'UPSC-2026-13'],
  'sutlej-river': ['GEO-UPSC-2021-05', 'ENV-UPSC-2014-09', 'UPSC-2026-13']
};

const newIndusNodes = rawIndus.map((r) => {
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

// Replace 'indus-river' with the 6 new nodes in CURATED_MAPPING_NODES
const indusIdx = CURATED_MAPPING_NODES.findIndex((n) => n.slug === 'indus-river');
if (indusIdx === -1) {
  console.error('indus-river not found in CURATED_MAPPING_NODES');
  process.exit(1);
}

const updatedNodes = [
  ...CURATED_MAPPING_NODES.slice(0, indusIdx),
  ...newIndusNodes,
  ...CURATED_MAPPING_NODES.slice(indusIdx + 1)
];

const fileHeader = `/**\n * Clean, single-feature GIS nodes for Static Mapping (India & World) and IR Mapping.\n * Every node has 100% verified PYQ IDs from mapping_pyqs (covering UPSC CSE 2011–2026 & CDS 2014–2023)\n * and bidirectional neural links to canonical Geography, Environment, and History Issue nodes.\n */\n\nexport const CURATED_MAPPING_NODES = `;

fs.writeFileSync(
  'src/lib/static-mapping-data.js',
  fileHeader + JSON.stringify(updatedNodes, null, 2) + ';\n'
);

console.log('Successfully updated src/lib/static-mapping-data.js with', newIndusNodes.length, 'Indus river nodes!');
console.log('Total nodes now:', updatedNodes.length);
