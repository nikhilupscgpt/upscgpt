import fs from 'fs';
import path from 'path';
import prisma from '../src/lib/prisma.js';

async function main() {
  console.log('--- Exporting Geography Architecture for Claude Bridging ---');

  // 1. Fetch all 45 existing nodes in GEOGRAPHY
  const existingNodes = await prisma.issue.findMany({
    where: { OR: [{ domain: 'GEOGRAPHY' }, { category: 'GEOGRAPHY' }] },
    select: {
      id: true,
      title: true,
      slug: true,
      topic: true,
      category: true,
      nodeType: true,
      orderIndex: true,
      prelimsNote: true,
    },
    orderBy: { orderIndex: 'asc' }
  });

  // 2. Fetch all Prelims PYQ topics and question counts
  const drafts = await prisma.questionDraft.findMany({
    where: { srcSubject: 'Geography' },
    select: {
      id: true,
      questionNo: true,
      examName: true,
      examYear: true,
      srcTopic: true,
      stem: true,
    }
  });

  const topicMap = {};
  drafts.forEach(d => {
    if (!topicMap[d.srcTopic]) {
      topicMap[d.srcTopic] = { count: 0, sampleStems: [] };
    }
    topicMap[d.srcTopic].count++;
    if (topicMap[d.srcTopic].sampleStems.length < 3) {
      topicMap[d.srcTopic].sampleStems.push(`[${d.examName} ${d.examYear}] ${d.stem.slice(0, 100)}...`);
    }
  });

  // 3. Define the canonical Prelims syllabus sequence for Geography
  const syllabusFlow = [
    {
      syllabusOrder: 1,
      module: 'Physical Geography',
      topic: 'Universe & Solar System',
      questionCount: topicMap['Universe & Solar System']?.count || 0,
      coreThemes: ['Big Bang & Universe Evolution', 'Solar System Planets (Inner vs Outer planets, Retrograde rotation of Venus & Uranus, Asteroid Belt)', 'Earth Motions (Rotation, Revolution, Solstices, Equinoxes, Seasons, Day/Night variation)', 'Latitudes & Longitudes (International Date Line, Time Zones, Tropics, Prime Meridian)', 'Eclipses (Solar vs Lunar, Umbra, Penumbra)']
    },
    {
      syllabusOrder: 2,
      module: 'Physical Geography',
      topic: 'Geomorphology',
      questionCount: topicMap['Geomorphology']?.count || 0,
      coreThemes: ['Earth Interior Layers (Crust, Moho, Mantle, Asthenosphere, Outer Core, Inner Core)', 'Seismic Waves (P-waves vs S-waves shadow zones)', 'Continental Drift & Paleomagnetism', 'Plate Tectonics (Convergent, Divergent, Transform boundaries, Ring of Fire)', 'Volcanism & Intrusive Landforms (Batholiths, Laccoliths, Sills, Dykes)', 'Earthquakes & Tsunamis', 'Weathering & Mass Wasting', 'Erosional & Depositional Landforms (Fluvial, Karst, Glacial, Aeolian, Coastal)']
    },
    {
      syllabusOrder: 3,
      module: 'Physical Geography',
      topic: 'Climatology',
      questionCount: topicMap['Climatology']?.count || 0,
      coreThemes: ['Atmosphere Layers (Troposphere, Stratosphere, Mesosphere, Thermosphere, Exosphere)', 'Insolation, Heat Budget & Temperature Inversion', 'Atmospheric Pressure & Global Pressure Belts', 'Planetary Winds (Trade Winds, Westerlies, Polar Easterlies)', 'Local Winds (Loo, Chinook, Foehn, Sirocco, Mistral, Harmattan)', 'Jet Streams & Rossby Waves', 'Air Masses, Fronts & Temperate Cyclones', 'Tropical Cyclones (Conditions, Eye, Coriolis necessity)', 'Indian Monsoon Mechanism, ITCZ shift, El Niño / La Niña & Indian Ocean Dipole (IOD)', 'Koppen Climate Classification (Af, Am, Aw, Cs, BWh, etc.)']
    },
    {
      syllabusOrder: 4,
      module: 'Physical Geography',
      topic: 'Oceanography',
      questionCount: topicMap['Oceanography']?.count || 0,
      coreThemes: ['Ocean Bottom Relief (Continental Shelf, Slope, Abyssal Plain, Trenches, Guyots)', 'Temperature & Salinity Distribution (Factors, Halocline, Thermocline)', 'Ocean Currents (Warm vs Cold currents, Gyres, Sargasso Sea, Upwelling)', 'Tides (Spring vs Neap tides, Perigean vs Apogean, Tidal forces)', 'Coral Reefs (Conditions, Fringing, Barrier, Atolls, Coral Bleaching)', 'Marine Resources (Polymetallic nodules, Gas hydrates, EEZ boundaries)']
    },
    {
      syllabusOrder: 5,
      module: 'Physical Geography',
      topic: 'Indian Physiography & Drainage',
      questionCount: topicMap['Indian Physiography & Drainage']?.count || 0,
      coreThemes: ['Northern Mountains (Trans-Himalayas, Greater Himalayas/Himadri, Lesser Himalayas/Himachal, Shiwaliks, Purvanchal)', 'Major Mountain Passes (Zoji La, Shipki La, Nathu La, Rohtang, Lipulekh, Palghat, Bhorghat, Thalghat)', 'Northern Plains (Bhabar, Tarai, Bhangar, Khadar)', 'Peninsular Plateau (Deccan, Malwa, Chota Nagpur, Western Ghats vs Eastern Ghats)', 'Coastal Plains (Konkan, Malabar, Coromandel, Northern Circars) & Island Groups (Ten Degree Channel, Duncan Passage)', 'Himalayan Drainage Systems (Indus & 5 tributaries, Ganga & tributaries, Brahmaputra & tributaries - Left vs Right bank)', 'Peninsular Drainage Systems (Godavari, Krishna, Cauvery, Mahanadi, Narmada, Tapi - East vs West flowing)']
    },
    {
      syllabusOrder: 6,
      module: 'Physical Geography',
      topic: 'Soils & Natural Vegetation',
      questionCount: topicMap['Soils & Natural Vegetation']?.count || 0,
      coreThemes: ['Indian Soils (Alluvial, Black/Regur, Red & Yellow, Laterite, Arid, Saline, Peaty - characteristics, crop suitability, nitrogen/phosphorus status)', 'Soil Degradation & Conservation methods', 'Natural Vegetation Types (Tropical Evergreen & Semi-Evergreen, Tropical Deciduous Moist/Dry, Tropical Thorn, Montane, Mangroves/Littoral)', 'Forest Canopy Density & India State of Forest Report (ISFR) trends']
    },
    {
      syllabusOrder: 7,
      module: 'Human & Economic',
      topic: 'Agriculture & Resources',
      questionCount: topicMap['Agriculture & Resources']?.count || 0,
      coreThemes: ['Cropping Seasons (Kharif, Rabi, Zaid)', 'Major Crops & Growing Conditions (Rice, Wheat, Cotton, Sugarcane, Tea, Coffee, Jute, Millets/Shree Anna)', 'Irrigation Systems (Canals, Wells, Tubewells, Micro-irrigation / Drip & Sprinkler)', 'Mineral Resources in India (Iron Ore, Bauxite, Manganese, Copper, Mica, Coal, Petroleum)', 'Energy Resources (Nuclear minerals - Uranium in Tummalapalle/Jaduguda, Monazite sand / Thorium in Kerala)']
    },
    {
      syllabusOrder: 8,
      module: 'Human & Economic',
      topic: 'Industry, Transport & Trade',
      questionCount: topicMap['Industry, Transport & Trade']?.count || 0,
      coreThemes: ['Industrial Location Factors (Weber Theory, Raw material oriented, Market oriented, Footloose industries)', 'Iron & Steel Plants Location in India', 'Textile Industry (Cotton & Jute belts)', 'National Highways, Golden Quadrilateral, Dedicated Freight Corridors (EDFC & WDFC)', 'Major Seaports of India (West coast vs East coast)', 'National Waterways (NW-1 Ganga, NW-2 Brahmaputra, NW-3 West Coast Canal)']
    },
    {
      syllabusOrder: 9,
      module: 'Human & Economic',
      topic: 'Population & Human Geography',
      questionCount: topicMap['Population & Human Geography']?.count || 0,
      coreThemes: ['Demographic Transition Model (Stages 1 to 5)', 'Census of India Trends (Population density, Sex ratio, Child sex ratio, Literacy, Decadal growth)', 'Urbanisation Trends & Metropolitan agglomerations', 'Major Tribes of India & Geographic distribution (Gonds, Bhils, Santhals, Jarawas, Sentinelese, Todas, Chenchus)']
    },
    {
      syllabusOrder: 10,
      module: 'World',
      topic: 'World Geography & Places',
      questionCount: topicMap['World Geography & Places']?.count || 0,
      coreThemes: ['Strategic Waterways & Straits (Strait of Malacca, Hormuz, Bab-el-Mandeb, Bosphorus, Dardanelles, Gibraltar, Bering, Dover)', 'Seas & Bordering Countries (Mediterranean Sea, Black Sea, Caspian Sea, Red Sea, Baltic Sea, Aral Sea, Dead Sea)', 'Major Rivers of the World (Nile, Amazon, Yangtze, Mississippi, Danube, Mekong, Rhine)', 'Major Mountain Ranges & Peaks (Andes, Rockies, Alps, Atlas, Urals, Great Dividing Range)', 'Major Deserts of the World (Sahara, Kalahari, Atacama, Patagonia, Gobi, Great Victoria)', 'Places in News / Geopolitical Flashpoints (Levant, Sahel, Horn of Africa, Donbas, Nagorno-Karabakh, Tigray, Kuril Islands)']
    },
    {
      syllabusOrder: 11,
      module: 'World',
      topic: 'Miscellaneous Geography',
      questionCount: topicMap['Miscellaneous Geography']?.count || 0,
      coreThemes: ['Cartography, Map Projections & Scales', 'GIS & Remote Sensing Applications', 'Geographical Terms & Definitions', 'International Boundary Lines (Radcliffe, McMahon, Durand, 38th Parallel, 49th Parallel)']
    }
  ];

  const payload = {
    subject: 'Geography',
    totalPrelimsQuestions: drafts.length,
    totalExistingNodesInDB: existingNodes.length,
    syllabusFlow,
    existingNodes: existingNodes.map(n => ({
      nodeId: n.id,
      title: n.title,
      slug: n.slug,
      topic: n.topic,
      nodeType: n.nodeType,
      orderIndex: n.orderIndex,
      hasPrelimsNote: Boolean(n.prelimsNote)
    }))
  };

  const localPath = path.resolve('./data/geography_nodes_architecture.json');
  fs.writeFileSync(localPath, JSON.stringify(payload, null, 2));

  const downloadPath = '/Users/nikhilwandhe/Downloads/geography_nodes_architecture.json';
  fs.writeFileSync(downloadPath, JSON.stringify(payload, null, 2));

  console.log(`✅ Saved Geography architecture to:\n   - ${localPath}\n   - ${downloadPath}`);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
