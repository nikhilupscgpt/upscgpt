import fs from 'fs';
import { CURATED_MAPPING_NODES } from '../src/lib/static-mapping-data.js';

const rawWest = JSON.parse(fs.readFileSync('/Users/nikhilwandhe/Downloads/west_flowing_rivers.json', 'utf8'));

const riverShapes = {
  'narmada-river': [
    [22.67, 81.75], // Narmada Kund / Amarkantak
    [22.95, 80.60], // Mandla loop
    [23.13, 79.80], // Jabalpur / Marble Rocks (Bhedaghat)
    [22.80, 78.75], // Narsinghpur
    [22.75, 77.72], // Hoshangabad (meets Tawa)
    [22.25, 76.47], // Indira Sagar Dam
    [22.24, 76.15], // Omkareshwar Jyotirlinga
    [22.17, 75.58], // Maheshwar
    [21.83, 73.75], // Sardar Sarovar Dam (Statue of Unity)
    [21.70, 73.00], // Bharuch
    [21.65, 72.60]  // Gulf of Khambhat estuary
  ],
  'tapi-river': [
    [21.77, 78.25], // Multai / Tapi Kund (Satpura)
    [21.30, 76.22], // Burhanpur
    [21.05, 75.80], // Bhusawal (meets Purna)
    [21.12, 75.40], // Hatnur Dam (Jalgaon)
    [21.28, 74.75], // Nandurbar
    [21.25, 73.58], // Ukai Dam
    [21.17, 72.83], // Surat
    [21.05, 72.68]  // Gulf of Khambhat estuary
  ],
  'sabarmati-river': [
    [24.40, 73.40], // Aravalli Hills (Udaipur, Rajasthan)
    [23.95, 72.90], // Dharoi Dam
    [23.22, 72.65], // Gandhinagar
    [23.03, 72.58], // Ahmedabad (Sabarmati Ashram)
    [22.65, 72.50], // Vautha
    [22.25, 72.45]  // Gulf of Khambhat
  ],
  'mahi-river': [
    [22.62, 75.15], // Dhar / Vindhyas (MP)
    [23.35, 75.05], // Ratlam (cuts Tropic of Cancer 1st time)
    [23.63, 74.55], // Banswara / Mahi Bajaj Sagar
    [23.55, 74.00], // Dungarpur / Vagad loop
    [23.10, 73.45], // Kadana Dam (cuts Tropic of Cancer 2nd time)
    [22.75, 73.20], // Wanakbori
    [22.25, 72.60]  // Gulf of Khambhat estuary
  ],
  'luni-river': [
    [26.48, 74.55], // Pushkar / Ajmer (Sagarmati)
    [26.35, 74.30], // Govindgarh (meets Saraswati)
    [25.83, 72.85], // Samdari
    [25.65, 72.24], // Balotra (turns saline / Lavanavari)
    [25.05, 71.70], // Sanchore plains
    [24.50, 71.20]  // Marshes of Rann of Kutch
  ],
  'mandovi-river': [
    [15.55, 74.35], // Bhimgad WLS (Belagavi, Karnataka)
    [15.52, 74.20], // Dudhsagar Falls
    [15.50, 74.05], // Valpoi (Sattari, Goa)
    [15.50, 73.92], // Old Goa
    [15.50, 73.82]  // Panaji / Aguada Bay estuary
  ],
  'zuari-river': [
    [15.10, 74.20], // Western Ghats (Sanguem, Goa)
    [15.25, 74.10], // Curchorem
    [15.30, 74.02], // Cortalim
    [15.41, 73.80]  // Mormugao Bay / Arabian Sea
  ],
  'sharavati-river': [
    [13.83, 75.12], // Ambutirtha / Thirthahalli (Shimoga)
    [14.15, 74.90], // Linganamakki Reservoir
    [14.23, 74.81], // Jog Falls (253m untiered plunge)
    [14.28, 74.60], // Gersoppa
    [14.28, 74.45]  // Honnavar estuary into Arabian Sea
  ],
  'periyar-river': [
    [9.45, 77.25], // Sivagiri Hills (Western Ghats)
    [9.52, 77.15], // Mullaperiyar Dam (Thekkady)
    [9.84, 76.97], // Idukki Arch Dam
    [10.02, 76.50], // Bhoothathankettu / Thattekad Bird Sanctuary
    [10.11, 76.35], // Aluva
    [10.18, 76.17]  // Munambam / Vembanad Lake & Arabian Sea
  ],
  'bharathapuzha-river': [
    [10.55, 77.00], // Anamalai Hills (Tamil Nadu)
    [10.65, 76.85], // Palakkad Gap entry
    [10.77, 76.65], // Palakkad town
    [10.77, 76.37], // Shoranur / Cheruthuruthy (Kalamandalam)
    [10.82, 76.05], // Kuttippuram
    [10.78, 75.90]  // Ponnani estuary into Arabian Sea
  ]
};

const riverIds = {
  'narmada-river': 'IND-RIV-04',
  'tapi-river': 'IND-RIV-10',
  'sabarmati-river': 'IND-RIV-04B',
  'mahi-river': 'IND-RIV-04C',
  'luni-river': 'IND-RIV-04D',
  'mandovi-river': 'IND-RIV-04E',
  'zuari-river': 'IND-RIV-04F',
  'sharavati-river': 'IND-RIV-04G',
  'periyar-river': 'IND-RIV-04H',
  'bharathapuzha-river': 'IND-RIV-04I'
};

const riverAliases = {
  'narmada-river': ['Reva', 'Nerbudda', 'Lifeline of MP and Gujarat', 'Amarkantak River'],
  'tapi-river': ['Tapti', 'Suryaputri', 'Tapi Kund River', 'Surat River'],
  'sabarmati-river': ['Sabarmati', 'Vakaland', 'Harnav', 'Ahmedabad River'],
  'mahi-river': ['Mahisagar', 'Tropic of Cancer River', 'Vagad River', 'Mahi Bajaj Sagar'],
  'luni-river': ['Lavanavari', 'Salt River', 'Sagarmati', 'Thar Desert River'],
  'mandovi-river': ['Mahadayi', 'Mhadei', 'Lifeline of Goa', 'Dudhsagar River'],
  'zuari-river': ['Aghanashini of Goa', 'Cortalim River', 'Mormugao River'],
  'sharavati-river': ['Sharavathi', 'Jog Falls River', 'Gersoppa River', 'Linganamakki River'],
  'periyar-river': ['Lifeline of Kerala', 'Churni', 'Idukki River', 'Mullaperiyar River'],
  'bharathapuzha-river': ['Nila', 'Ponnani River', 'Palakkad Gap River', 'Kalamandalam River']
};

const riverPYQs = {
  'narmada-river': [
    'GEO-UPSC-2013-11',
    'GEO-CDS2-2017-04',
    'GEO-UPSC-2016-03',
    'GEO-CDS2-2021-08'
  ],
  'tapi-river': [
    'GEO-CDS2-2017-04',
    'GEO-CDS2-2021-08'
  ],
  'sabarmati-river': [
    'GEO-CDS2-2021-08'
  ],
  'mahi-river': [
    'GEO-CDS2-2017-04'
  ],
  'luni-river': [
    'GEO-CDS2-2018-02'
  ],
  'mandovi-river': [
    'GEO-CDS2-2017-04'
  ],
  'zuari-river': [
    'GEO-CDS2-2017-04'
  ],
  'sharavati-river': [
    'GEO-CDS1-2017-08'
  ],
  'periyar-river': [
    'GEO-CDS1-2017-08',
    'ENV-UPSC-2019-09'
  ],
  'bharathapuzha-river': [
    'GEO-CDS1-2017-08'
  ]
};

const newWestNodes = rawWest.map((r) => {
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

// Remove existing 'narmada-river' and 'tapi-river' to replace with the new comprehensive nodes
let workingNodes = CURATED_MAPPING_NODES.filter((n) => n.slug !== 'narmada-river' && n.slug !== 'tapi-river');

// Insert after 'barak-river' (IND-RIV-03I) or at the end of the river section
const barakIdx = workingNodes.findIndex((n) => n.slug === 'barak-river');

let updatedNodes;
if (barakIdx !== -1) {
  updatedNodes = [
    ...workingNodes.slice(0, barakIdx + 1),
    ...newWestNodes,
    ...workingNodes.slice(barakIdx + 1)
  ];
} else {
  updatedNodes = [...workingNodes, ...newWestNodes];
}

const fileHeader = `/**\n * Clean, single-feature GIS nodes for Static Mapping (India & World) and IR Mapping.\n * Every node has 100% verified PYQ IDs from mapping_pyqs (covering UPSC CSE 2011–2026 & CDS 2014–2023)\n * and bidirectional neural links to canonical Geography, Environment, and History Issue nodes.\n */\n\nexport const CURATED_MAPPING_NODES = `;

fs.writeFileSync(
  'src/lib/static-mapping-data.js',
  fileHeader + JSON.stringify(updatedNodes, null, 2) + ';\n'
);

console.log('Successfully updated src/lib/static-mapping-data.js with', newWestNodes.length, 'West-flowing river nodes!');
console.log('Total nodes now:', updatedNodes.length);
