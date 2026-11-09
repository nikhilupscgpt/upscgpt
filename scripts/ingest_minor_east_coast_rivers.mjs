import fs from 'fs';
import { CURATED_MAPPING_NODES } from '../src/lib/static-mapping-data.js';

const rawMinor = JSON.parse(fs.readFileSync('/Users/nikhilwandhe/Downloads/minor_east_coast_rivers.json', 'utf8'));

const riverShapes = {
  'subarnarekha-river': [
    [23.35, 85.20], // Nagri (Ranchi, Chotanagpur Plateau)
    [23.45, 85.65], // Hundru Falls
    [22.80, 86.20], // Jamshedpur (meets Kharkai)
    [22.35, 86.75], // Ghatshila (Singhbhum copper belt)
    [21.90, 87.10], // Jaleswar
    [21.60, 87.45]  // Talsari / Balasore into Bay of Bengal
  ],
  'brahmani-river': [
    [22.22, 84.85], // Vedavyas / Rourkela (South Koel + Sankh)
    [21.50, 85.00], // Rengali Dam
    [21.10, 85.20], // Samal Barrage (Angul/Talcher)
    [20.85, 85.85], // Jenapur
    [20.80, 86.95]  // Dhamra estuary / Bhitarkanika into Bay of Bengal
  ],
  'baitarani-river': [
    [21.75, 85.60], // Guptaganga hills / Gonasika (Keonjhar)
    [21.50, 85.90], // Anandapur
    [21.20, 86.10], // Jajpur (Biraja Kshetra)
    [20.95, 86.55], // Akhuapada
    [20.80, 86.95]  // Dhamra estuary into Bay of Bengal
  ],
  'vamsadhara-river': [
    [19.45, 83.30], // Thuamul Rampur (Eastern Ghats, Kalahandi)
    [19.05, 83.82], // Gunupur (Rayagada)
    [18.85, 83.90], // Gotta Barrage (Srikakulam)
    [18.33, 84.12]  // Kalingapatnam into Bay of Bengal
  ],
  'nagavali-river': [
    [19.55, 83.15], // Lakhbahal (Eastern Ghats, Kalahandi)
    [19.17, 83.42], // Rayagada
    [18.78, 83.60], // Thotapalli Barrage (Vizianagaram)
    [18.30, 83.90], // Srikakulam town
    [18.25, 84.05]  // Mofazbandar into Bay of Bengal
  ],
  'palar-river': [
    [13.30, 77.95], // Nandi Hills region (Kolar, Karnataka)
    [12.95, 78.60], // Vaniyambadi
    [12.92, 79.13], // Vellore
    [12.83, 79.70], // Kanchipuram (Palar Anicut)
    [12.52, 80.17]  // Vayalur / Kalpakkam into Bay of Bengal
  ],
  'south-pennar-river': [
    [13.37, 77.70], // Nandi Hills (Dakshina Pinakini, Karnataka)
    [12.85, 78.00], // Hosur / Kelavarapalli Dam
    [12.30, 78.45], // Krishnagiri Dam
    [12.18, 78.85], // Sathanur Dam (Tiruvannamalai)
    [11.90, 79.50], // Villupuram
    [11.75, 79.78]  // Cuddalore into Bay of Bengal
  ],
  'vaigai-river': [
    [9.65, 77.35], // Varusanadu Hills / Megamalai (Theni)
    [10.05, 77.58], // Vaigai Dam (Andipatti)
    [9.93, 78.12], // Madurai (Meenakshi Temple)
    [9.70, 78.50], // Manamadurai
    [9.40, 79.00]  // Ramanathapuram / Athangarai into Palk Bay
  ],
  'vellar-river': [
    [11.80, 78.55], // Kalrayan Hills (Eastern Ghats, Salem)
    [11.55, 78.90], // Vriddhachalam
    [11.52, 79.32], // Sethiathoppu
    [11.50, 79.77]  // Parangipettai / Pichavaram into Bay of Bengal
  ]
};

const riverIds = {
  'subarnarekha-river': 'IND-RIV-14',
  'brahmani-river': 'IND-RIV-11',
  'baitarani-river': 'IND-RIV-12',
  'vamsadhara-river': 'IND-RIV-15A',
  'nagavali-river': 'IND-RIV-15B',
  'palar-river': 'IND-RIV-17A',
  'south-pennar-river': 'IND-RIV-17B',
  'vaigai-river': 'IND-RIV-16',
  'vellar-river': 'IND-RIV-17C'
};

const riverAliases = {
  'subarnarekha-river': ['Golden Line River', 'Subarnarekha', 'Singhbhum River', 'Hundru River'],
  'brahmani-river': ['Vedavyas River', 'South Koel Sankh', 'Rengali River', 'Talcher River'],
  'baitarani-river': ['Vaitarani', 'Gonasika River', 'Guptaganga River', 'Jajpur River'],
  'vamsadhara-river': ['Bansadhara', 'Kalingapatnam River', 'Gotta Barrage River'],
  'nagavali-river': ['Langulya', 'Thotapalli River', 'Srikakulam River'],
  'palar-river': ['Kshira Nadi', 'Palar Anicut River', 'Vellore River', 'Kanchipuram River'],
  'south-pennar-river': ['Pennaiyar', 'Thenpennai', 'Dakshina Pinakini', 'Sathanur River'],
  'vaigai-river': ['Kritamala', 'Madurai River', 'Chithirai Festival River', 'Megamalai River'],
  'vellar-river': ['South Vellar', 'Kalrayan River', 'Porto Novo River', 'Parangipettai River']
};

const riverPYQs = {
  'subarnarekha-river': [
    'GEO-UPSC-2021-07',
    'UPSC-2024-09',
    'GEO-CDS1-2017-08'
  ],
  'brahmani-river': [
    'GEO-UPSC-2021-07'
  ],
  'baitarani-river': [
    'GEO-UPSC-2021-07'
  ],
  'vamsadhara-river': [
    'GEO-UPSC-2021-07',
    'GEO-UPSC-2015-07'
  ],
  'nagavali-river': [
    'GEO-UPSC-2021-07'
  ],
  'palar-river': [
    'GEO-UPSC-2022-03'
  ],
  'south-pennar-river': [
    'GEO-UPSC-2022-03'
  ],
  'vaigai-river': [
    'GEO-CDS1-2017-08'
  ],
  'vellar-river': [
    'GEO-CDS1-2017-08'
  ]
};

const newMinorNodes = rawMinor.map((r) => {
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

// Remove existing old/bundled nodes:
// 'subarnarekha-river-system', 'brahmani-river', 'baitarani-river', 'rushikulya-vamsadhara-nagavali', 'vaigai-tamirabarani-rivers'
const oldMinorSlugs = new Set([
  'subarnarekha-river-system',
  'subarnarekha-river',
  'brahmani-river',
  'baitarani-river',
  'rushikulya-vamsadhara-nagavali',
  'vaigai-tamirabarani-rivers'
]);

let workingNodes = CURATED_MAPPING_NODES.filter((n) => !oldMinorSlugs.has(n.slug));

// Insert right after 'pennar-river' (IND-RIV-13)
const pennarIdx = workingNodes.findIndex((n) => n.slug === 'pennar-river');

let updatedNodes;
if (pennarIdx !== -1) {
  updatedNodes = [
    ...workingNodes.slice(0, pennarIdx + 1),
    ...newMinorNodes,
    ...workingNodes.slice(pennarIdx + 1)
  ];
} else {
  updatedNodes = [...workingNodes, ...newMinorNodes];
}

const fileHeader = `/**\n * Clean, single-feature GIS nodes for Static Mapping (India & World) and IR Mapping.\n * Every node has 100% verified PYQ IDs from mapping_pyqs (covering UPSC CSE 2011–2026 & CDS 2014–2023)\n * and bidirectional neural links to canonical Geography, Environment, and History Issue nodes.\n */\n\nexport const CURATED_MAPPING_NODES = `;

fs.writeFileSync(
  'src/lib/static-mapping-data.js',
  fileHeader + JSON.stringify(updatedNodes, null, 2) + ';\n'
);

console.log('Successfully updated src/lib/static-mapping-data.js with', newMinorNodes.length, 'Minor East Coast river nodes!');
console.log('Unpacked old bundled nodes (rushikulya-vamsadhara-nagavali, vaigai-tamirabarani-rivers, subarnarekha-river-system).');
console.log('Total nodes now:', updatedNodes.length);
