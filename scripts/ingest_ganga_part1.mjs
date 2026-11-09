import fs from 'fs';
import { CURATED_MAPPING_NODES } from '../src/lib/static-mapping-data.js';

const rawGanga = JSON.parse(fs.readFileSync('/Users/nikhilwandhe/Downloads/ganga_system_part1.json', 'utf8'));

const riverShapes = {
  'ganga-river': [
    [30.92, 78.95], // Gangotri / Gaumukh
    [30.14, 78.60], // Devprayag (Bhagirathi + Alaknanda)
    [29.95, 78.16], // Haridwar / Rishikesh
    [27.90, 78.05], // Narora Barrage
    [27.10, 79.95], // Kannauj (meets Ramganga)
    [26.45, 80.33], // Kanpur
    [25.43, 81.88], // Prayagraj (Triveni Sangam with Yamuna)
    [25.32, 82.97], // Varanasi
    [25.73, 84.83], // Chhapra (meets Ghaghara)
    [25.68, 85.18], // Patna (meets Son & Gandak)
    [25.45, 87.25], // Kursela / Katihar (meets Kosi)
    [24.80, 87.92], // Farakka Barrage (splits into Padma & Hooghly)
    [23.90, 88.25], // Murshidabad / Nabadwip
    [22.57, 88.36], // Kolkata (Howrah Bridge)
    [21.80, 88.10]  // Sagar Island / Sundarbans mouth
  ],
  'ramganga-river': [
    [30.07, 79.27], // Dudhatoli Hills
    [30.05, 79.28], // Gairsain
    [29.53, 78.75], // Jim Corbett National Park / Kalagarh Dam
    [28.84, 78.78], // Moradabad
    [28.37, 79.43], // Bareilly plains
    [27.10, 79.95]  // Kannauj (joins Ganga)
  ],
  'gomti-river': [
    [28.60, 80.05], // Gomat Taal / Fulhar Jheel (Pilibhit)
    [27.57, 80.66], // Sitapur / Lakhimpur
    [26.85, 80.95], // Lucknow
    [26.26, 82.07], // Sultanpur
    [25.75, 82.68], // Jaunpur
    [25.50, 83.17]  // Kaithi / Markandey Mahadev (joins Ganga)
  ],
  'ghaghara-river': [
    [30.45, 81.35], // Mapchachungo Glacier (Tibet)
    [28.64, 81.28], // Karnali / Shishapani gorge (Nepal)
    [28.33, 81.13], // Katarniaghat Wildlife Sanctuary
    [27.58, 81.60], // Bahraich / Sarda confluence
    [26.80, 82.20], // Ayodhya
    [26.27, 83.75], // Barhaj (meets Rapti)
    [25.73, 84.83]  // Chhapra / Doriganj (joins Ganga)
  ],
  'gandak-river': [
    [29.25, 83.95], // Nhubine Himal / Mustang (Nepal)
    [28.50, 83.65], // Kali Gandaki gorge (Dhaulagiri-Annapurna)
    [27.43, 83.92], // Tribeni / Gandak Barrage (Valmiki NP)
    [27.10, 84.09], // Bagaha (Bihar)
    [25.68, 85.20], // Hajipur
    [25.68, 85.18]  // Sonpur (joins Ganga opposite Patna)
  ],
  'kosi-river': [
    [28.45, 86.55], // Arun River (Tibet / North of Everest)
    [26.85, 87.15], // Sapta Kosi confluence / Chatra gorge (Nepal)
    [26.52, 86.93], // Kosi Barrage / Bhimnagar (border)
    [26.12, 86.60], // Supaul (Kosi megafan)
    [25.88, 86.60], // Saharsa
    [25.45, 87.25]  // Kursela (joins Ganga near Katihar)
  ],
  'mahananda-river': [
    [26.88, 88.32], // Mahaldiram Hills / Kurseong (Darjeeling)
    [26.72, 88.43], // Siliguri Corridor (Mahananda WLS)
    [26.10, 87.95], // Kishanganj (Bihar)
    [25.00, 88.14], // Malda / English Bazar (WB)
    [24.47, 88.33]  // Godagari (joins Padma in Bangladesh)
  ]
};

const riverIds = {
  'ganga-river': 'IND-RIV-01',
  'ramganga-river': 'IND-RIV-01B',
  'gomti-river': 'IND-RIV-01C',
  'ghaghara-river': 'IND-RIV-01D',
  'gandak-river': 'IND-RIV-01E',
  'kosi-river': 'IND-RIV-01F',
  'mahananda-river': 'IND-RIV-01G'
};

const riverAliases = {
  'ganga-river': ['Bhagirathi', 'Alaknanda', 'Padma', 'Hooghly', 'Ganges', 'Jahnavi'],
  'ramganga-river': ['Ramganga', 'Rathwahini', 'Jim Corbett River'],
  'gomti-river': ['Gomati', 'Gomat River', 'Fulhar Jheel River'],
  'ghaghara-river': ['Karnali', 'Sarda', 'Sarju', 'Sarayu', 'Mapchachungo'],
  'gandak-river': ['Narayani', 'Kali Gandak', 'Gandaki', 'Salagrami'],
  'kosi-river': ['Saptakoshi', 'Sapta Kosi', 'Arun', 'Kausiki', 'Sorrow of Bihar'],
  'mahananda-river': ['Mahananda', 'Mahaldiram River', 'Siliguri Corridor River']
};

const riverPYQs = {
  'ganga-river': [
    'UPSC-2024-06',
    'GEO-CDS1-2020-05',
    'GEO-UPSC-2019-04',
    'GEO-CDS1-2018-08',
    'ENV-UPSC-2014-15'
  ],
  'ramganga-river': [
    'GEO-CDS1-2018-08',
    'ENV-UPSC-2014-15'
  ],
  'gomti-river': [
    'UPSC-2024-06',
    'GEO-CDS1-2018-08'
  ],
  'ghaghara-river': [
    'UPSC-2024-06',
    'GEO-CDS1-2018-08'
  ],
  'gandak-river': [
    'UPSC-2024-06',
    'GEO-UPSC-2023-07',
    'GEO-CDS1-2018-08'
  ],
  'kosi-river': [
    'UPSC-2024-06',
    'GEO-CDS1-2019-04',
    'GEO-CDS1-2018-08'
  ],
  'mahananda-river': [
    'UPSC-2024-06',
    'UPSC-2026-61'
  ]
};

const newGangaNodes = rawGanga.map((r) => {
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

// Replace 'ganga-river' with the 7 new nodes in CURATED_MAPPING_NODES
const gangaIdx = CURATED_MAPPING_NODES.findIndex((n) => n.slug === 'ganga-river');
if (gangaIdx === -1) {
  console.error('ganga-river not found in CURATED_MAPPING_NODES');
  process.exit(1);
}

const updatedNodes = [
  ...CURATED_MAPPING_NODES.slice(0, gangaIdx),
  ...newGangaNodes,
  ...CURATED_MAPPING_NODES.slice(gangaIdx + 1)
];

const fileHeader = `/**\n * Clean, single-feature GIS nodes for Static Mapping (India & World) and IR Mapping.\n * Every node has 100% verified PYQ IDs from mapping_pyqs (covering UPSC CSE 2011–2026 & CDS 2014–2023)\n * and bidirectional neural links to canonical Geography, Environment, and History Issue nodes.\n */\n\nexport const CURATED_MAPPING_NODES = `;

fs.writeFileSync(
  'src/lib/static-mapping-data.js',
  fileHeader + JSON.stringify(updatedNodes, null, 2) + ';\n'
);

console.log('Successfully updated src/lib/static-mapping-data.js with', newGangaNodes.length, 'Ganga Part 1 river nodes!');
console.log('Total nodes now:', updatedNodes.length);
