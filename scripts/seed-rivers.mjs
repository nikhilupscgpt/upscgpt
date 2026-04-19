import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 16 most UPSC-critical river systems, with accurate GIS traces
// shape = [[lat, lon], ...] from source → mouth
const RIVERS = [
  // ─── South Asia ──────────────────────────────────────────────────────────────
  {
    name: 'Ganga (Ganges)',
    lat: 25.3, lon: 83.0,        // midpoint near Varanasi
    category: 'nature',
    tags: 'River,Himalayan,India,Physical',
    continent: 'Asia',
    geoGroup: 'South Asia',
    worldPart: 'PHYSICAL',
    nodeSubType: 'PHYSICAL',
    riverOutflow: 'Bay of Bengal',
    countriesSpread: 'India, Bangladesh',
    shape: JSON.stringify([
      [30.9, 78.9], [29.9, 78.2], [27.9, 78.0],
      [25.4, 81.9], [25.3, 83.0], [25.6, 85.1],
      [24.9, 87.8], [24.0, 88.5], [21.8, 88.9], [21.6, 89.5]
    ]),
    prelims: 'Originates at Gangotri Glacier (Uttarakhand). Joins Yamuna at Prayagraj (Triveni Sangam). Drains into Bay of Bengal via Sundarbans delta. Major tributaries: Yamuna, Ghaghara, Gandak, Kosi.',
    mains: 'Namami Gange programme, Ganga Action Plan, Interlinking of rivers, National Waterway 1. River rejuvenation linked to SDG 6 (Clean Water). Impact of glacial retreat on river flows.',
    india: 'National River of India. Culturally and spiritually central to Hindu civilization. Sustains ~40% of India\'s population. Critically polluted—Ganga Pollution Index high.',
    upscFrequency: 10
  },
  {
    name: 'Indus',
    lat: 30.5, lon: 71.0,        // midpoint in Pakistan Punjab
    category: 'nature',
    tags: 'River,Himalayan,Indus Valley,Physical',
    continent: 'Asia',
    geoGroup: 'South / Central Asia',
    worldPart: 'PHYSICAL',
    nodeSubType: 'PHYSICAL',
    riverOutflow: 'Arabian Sea',
    countriesSpread: 'China (Tibet), India, Pakistan',
    shape: JSON.stringify([
      [31.5, 80.0], [34.2, 77.6], [35.6, 74.3],
      [33.0, 73.0], [30.5, 71.0], [27.5, 68.0],
      [24.5, 68.0], [24.1, 67.4]
    ]),
    prelims: 'Originates near Lake Manasarovar in Tibet (Sengge Zangbo). Flows NW before turning SW through Pakistan. Tributaries: Jhelum, Chenab, Ravi, Beas, Sutlej (Punjab = "Five Rivers"). Drainage area 1.1 million km².',
    mains: 'Indus Waters Treaty (1960) between India and Pakistan brokered by World Bank. Eastern rivers (Ravi, Beas, Sutlej) allocated to India; Western (Indus, Jhelum, Chenab) to Pakistan. Triggered by construction of Baglihar and Kishenganga dams.',
    india: 'Indus Waters Treaty under stress post-Pulwama tensions. India\'s Kishenganga and Ratle hydropower projects. "Punjab" means Land of Five Rivers—all Indus tributaries.',
    upscFrequency: 9
  },
  {
    name: 'Brahmaputra (Yarlung Tsangpo)',
    lat: 26.7, lon: 93.7,        // midpoint in Assam
    category: 'nature',
    tags: 'River,Himalayan,Brahmaputra,Physical',
    continent: 'Asia',
    geoGroup: 'South / East Asia',
    worldPart: 'PHYSICAL',
    nodeSubType: 'PHYSICAL',
    riverOutflow: 'Bay of Bengal',
    countriesSpread: 'China (Tibet), India, Bangladesh',
    shape: JSON.stringify([
      [31.5, 82.0], [29.5, 87.0], [29.0, 91.5],
      [29.6, 95.3], [27.5, 95.0], [26.7, 93.7],
      [26.1, 91.7], [25.6, 89.9], [24.0, 90.0],
      [23.5, 90.5]
    ]),
    prelims: 'Longest river in India (2900 km total course). Called Yarlung Tsangpo in Tibet, Siang in Arunachal, Brahmaputra in Assam, Jamuna in Bangladesh. Makes a hairpin bend at Namcha Barwa. Antecedent drainage—older than Himalayas.',
    mains: 'China\'s planned dams on Yarlung Tsangpo (Great Bend) threaten downstream flows to India/Bangladesh. Responsible for floods in Assam annually. Majuli Island (largest river island). Northeast India connectivity.',
    india: 'India concerned about Chinese dam at "Great Bend" (3x Three Gorges Dam capacity proposed). Critical for Assam agriculture and ecology. India\'s MNES projects in Arunachal utilize its tributaries.',
    upscFrequency: 9
  },

  // ─── Africa ──────────────────────────────────────────────────────────────────
  {
    name: 'Nile',
    lat: 17.7, lon: 33.5,        // Sudan midpoint
    category: 'nature',
    tags: 'River,Africa,Nile,Physical',
    continent: 'Africa',
    geoGroup: 'Northeastern Africa',
    worldPart: 'PHYSICAL',
    nodeSubType: 'PHYSICAL',
    riverOutflow: 'Mediterranean Sea',
    countriesSpread: 'Uganda, South Sudan, Sudan, Ethiopia (Blue Nile), Egypt',
    shape: JSON.stringify([
      [0.3, 33.0], [4.9, 31.5], [9.0, 28.5],
      [15.5, 32.5], [17.7, 33.5], [22.0, 31.2],
      [25.0, 32.4], [30.0, 31.0], [31.2, 30.0]
    ]),
    prelims: 'World\'s longest river (6,650 km). Two main tributaries: White Nile (source: Lake Victoria) and Blue Nile (source: Lake Tana, Ethiopia). The Blue Nile contributes ~85% of Nile\'s water volume. Flows north into Mediterranean.',
    mains: 'Grand Ethiopian Renaissance Dam (GERD) — biggest water dispute in Africa. Egypt fears freshwater reduction; Ethiopia sees it as development right. Nile Basin Initiative (NBI) attempts multilateral governance under UNCLOS principles.',
    india: 'India-Africa water diplomacy. GERD dispute is classic case study in transboundary water resource management—relevant for India\'s Brahmaputra concerns with China.',
    upscFrequency: 8
  },
  {
    name: 'Congo (Zaire)',
    lat: -3.0, lon: 16.5,        // midpoint DRC
    category: 'nature',
    tags: 'River,Africa,Congo,Physical',
    continent: 'Africa',
    geoGroup: 'Central Africa',
    worldPart: 'PHYSICAL',
    nodeSubType: 'PHYSICAL',
    riverOutflow: 'Atlantic Ocean',
    countriesSpread: 'DRC, Republic of Congo, Zambia, Central African Republic',
    shape: JSON.stringify([
      [-11.0, 29.5], [-8.0, 26.5], [-4.0, 24.5],
      [-1.0, 23.5], [0.0, 18.5], [-1.0, 16.5],
      [-3.0, 16.5], [-4.5, 15.3], [-6.0, 12.4]
    ]),
    prelims: 'World\'s deepest river (over 220m). Second largest by discharge after Amazon. Crosses the equator twice. Congo Basin = world\'s second largest tropical rainforest. Has enormous untapped hydropower potential (Inga Dam proposals).',
    mains: 'Inga Dam Mega-project — could generate 40,000 MW (twice China\'s Three Gorges). Congo Basin deforestation linked to global CO₂ cycle. DRC political instability affects resource utilization.',
    india: 'Congo Basin relevance to climate talks. India\'s forest carbon commitments echo Congo-basin concerns. Inga Dam financing debates involve Chinese BRI vs Western funding.',
    upscFrequency: 6
  },
  {
    name: 'Niger',
    lat: 12.0, lon: 9.0,         // midpoint Nigeria
    category: 'nature',
    tags: 'River,Africa,Niger,Physical',
    continent: 'Africa',
    geoGroup: 'West Africa',
    worldPart: 'PHYSICAL',
    nodeSubType: 'PHYSICAL',
    riverOutflow: 'Atlantic Ocean (Gulf of Guinea)',
    countriesSpread: 'Guinea, Mali, Niger, Benin, Nigeria',
    shape: JSON.stringify([
      [9.0, -12.0], [11.5, -8.0], [13.5, -4.5],
      [16.0, 0.0], [15.8, 3.0], [13.5, 6.0],
      [12.0, 9.0], [9.0, 9.0], [7.5, 6.5], [4.3, 6.4]
    ]),
    prelims: 'Third longest river in Africa. Unique boomerang shape—flows NE into the Sahara (Inland Niger Delta in Mali) then SE to the Gulf of Guinea. Niger Delta in Nigeria is the largest delta in Africa and a major oil-producing area.',
    mains: 'Niger Delta oil spills and Shell\'s liability (landmark court rulings). Sahel region instability (coups in Mali, Niger). Inland Niger Delta = important Ramsar wetland. Climate change is shrinking Lake Chad fed by Niger tributaries.',
    india: 'Nigeria is India\'s key West African oil partner (crude oil imports). Niger Delta oil spills cited in environmental jurisprudence. Sahel coups threaten India\'s energy security in the region.',
    upscFrequency: 6
  },
  {
    name: 'Zambezi',
    lat: -17.5, lon: 25.0,       // midpoint Zambia
    category: 'nature',
    tags: 'River,Africa,Zambezi,Physical',
    continent: 'Africa',
    geoGroup: 'Southern Africa',
    worldPart: 'PHYSICAL',
    nodeSubType: 'PHYSICAL',
    riverOutflow: 'Indian Ocean (Mozambique Channel)',
    countriesSpread: 'Zambia, Angola, Namibia, Botswana, Zimbabwe, Mozambique',
    shape: JSON.stringify([
      [-11.4, 24.2], [-15.0, 22.5], [-17.0, 24.0],
      [-17.9, 25.9], [-17.9, 25.9], [-17.9, 28.0],
      [-16.5, 30.4], [-16.1, 33.6], [-18.9, 35.3]
    ]),
    prelims: 'Fourth longest river in Africa. Victoria Falls (Mosi-oa-Tunya = "The Smoke that Thunders") located on Zambia-Zimbabwe border — largest waterfall by flow volume. Kariba Dam (Zambia-Zimbabwe) and Cahora Bassa Dam (Mozambique).',
    mains: 'Victoria Falls as UNESCO World Heritage Site. Drought risk to hydropower — Kariba Dam critical for electricity in Zambia and Zimbabwe. Transboundary river governance (ZAMCOM treaty).',
    india: 'Zambezi relevance to India-Africa relations. India finances infrastructure in Mozambique. Victoria Falls is a key geography landmark in map-based questions.',
    upscFrequency: 5
  },

  // ─── East / Southeast Asia ────────────────────────────────────────────────
  {
    name: 'Yangtze (Chang Jiang)',
    lat: 30.5, lon: 110.0,       // Three Gorges area
    category: 'nature',
    tags: 'River,China,Yangtze,Physical',
    continent: 'Asia',
    geoGroup: 'East Asia',
    worldPart: 'PHYSICAL',
    nodeSubType: 'PHYSICAL',
    riverOutflow: 'East China Sea',
    countriesSpread: 'China',
    shape: JSON.stringify([
      [33.5, 96.0], [30.0, 98.5], [28.0, 103.5],
      [28.8, 106.5], [30.7, 111.5], [30.4, 114.3],
      [30.5, 117.0], [30.9, 120.3], [31.4, 121.7]
    ]),
    prelims: 'Longest river in Asia (6,300 km). Third longest in the world. Three Gorges Dam (Yangtze) is the world\'s largest hydropower station by installed capacity (22,500 MW). Originates in Tanggula Range, Tibet.',
    mains: 'Three Gorges Dam: benefits (flood control, power, navigation) vs concerns (seismic risk, sedimentation, displacement of 1.2 million people, impact on Yangtze River dolphin extinction). China\'s water diversion (South-North Water Transfer Project).',
    india: 'Three Gorges Dam cited in debates around India\'s Narmada (SSP) and Brahmaputra hydro-projects. China\'s river diversion plans relevant to Brahmaputra water flow to India.',
    upscFrequency: 7
  },
  {
    name: 'Mekong',
    lat: 15.0, lon: 105.5,       // midpoint Laos-Thailand
    category: 'nature',
    tags: 'River,Mekong,Southeast Asia,Physical',
    continent: 'Asia',
    geoGroup: 'Southeast Asia',
    worldPart: 'PHYSICAL',
    nodeSubType: 'PHYSICAL',
    riverOutflow: 'South China Sea',
    countriesSpread: 'China (Lancang), Myanmar, Laos, Thailand, Cambodia, Vietnam',
    shape: JSON.stringify([
      [33.0, 94.5], [30.0, 98.0], [24.0, 100.5],
      [21.0, 100.2], [18.0, 102.5], [15.0, 105.5],
      [12.5, 105.8], [11.0, 105.2], [9.5, 106.0]
    ]),
    prelims: 'Called Lancang in China. Flows through the "Golden Triangle". Tonle Sap Lake (Cambodia) is a unique reverse-flowing seasonal tributary. Mekong Delta (Vietnam) = "Rice Bowl of Asia." Rich in fisheries—world\'s most biodiverse river after Amazon.',
    mains: 'China\'s upstream dams (11+ on Lancang) reduce downstream flows, affecting food security in Laos, Cambodia, Vietnam. Mekong River Commission (MRC) vs China\'s non-participation. US-China competition in Mekong Sub-region.',
    india: 'India\'s Mekong-Ganga Cooperation (MGC) initiative. India-ASEAN strategic partnership involves Mekong nations. Relevant to QUAD, Act East Policy.',
    upscFrequency: 8
  },
  {
    name: 'Huang He (Yellow River)',
    lat: 35.5, lon: 108.0,       // Loess Plateau midpoint
    category: 'nature',
    tags: 'River,China,Yellow River,Physical',
    continent: 'Asia',
    geoGroup: 'East Asia',
    worldPart: 'PHYSICAL',
    nodeSubType: 'PHYSICAL',
    riverOutflow: 'Bohai Sea (Yellow Sea)',
    countriesSpread: 'China',
    shape: JSON.stringify([
      [34.8, 96.0], [36.0, 100.5], [37.5, 107.5],
      [35.5, 108.0], [34.8, 110.5], [34.5, 113.5],
      [35.7, 115.5], [36.5, 116.5], [37.8, 118.5]
    ]),
    prelims: 'Second longest river in China (5,464 km). Called "China\'s Sorrow" due to catastrophic floods. Carries the most sediment of any river (Loess Plateau erosion). Cradles Chinese civilization — Shang and Zhou dynasties.',
    mains: 'Yellow River frequently floods, changing course multiple times in history. Loess Plateau afforestation as an effective land-restoration model. River runs dry in its lower course due to over-extraction—water crisis in North China Plain.',
    india: 'China\'s water management challenges mirror India\'s. Loess Plateau restoration used as a model for India\'s land degradation neutrality targets.',
    upscFrequency: 5
  },
  {
    name: 'Irrawaddy (Ayeyarwady)',
    lat: 21.0, lon: 96.0,        // central Myanmar
    category: 'nature',
    tags: 'River,Myanmar,Irrawaddy,Physical',
    continent: 'Asia',
    geoGroup: 'Southeast Asia',
    worldPart: 'PHYSICAL',
    nodeSubType: 'PHYSICAL',
    riverOutflow: 'Andaman Sea (Bay of Bengal)',
    countriesSpread: 'Myanmar',
    shape: JSON.stringify([
      [28.0, 98.5], [25.5, 97.5], [23.0, 96.0],
      [21.0, 96.0], [19.5, 96.1], [17.8, 96.0],
      [16.5, 95.6], [15.8, 95.2]
    ]),
    prelims: 'Myanmar\'s principal river. Forms the Irrawaddy Delta—one of the world\'s major rice-growing regions. Navigable for most of its length. Myitsone Dam (China-funded) controversy led to suspension in 2011.',
    mains: 'Myitsone Dam: Chinese investment cancelled by Myanmar to assert sovereignty—key example of Chinese infrastructure investment backlash. Kaladan Multi-Modal Transit Transport Project (India) uses Kaladan River (Irrawaddy basin). Myanmar junta and India\'s border security.',
    india: 'Kaladan Project connects Mizoram to Sittwe Port (Myanmar) via Kaladan River. India\'s Act East Policy pivot. Myanmar\'s domestic instability (post-2021 coup) affects project progress.',
    upscFrequency: 6
  },

  // ─── Europe ──────────────────────────────────────────────────────────────────
  {
    name: 'Danube',
    lat: 45.0, lon: 21.0,        // Serbia midpoint
    category: 'nature',
    tags: 'River,Europe,Danube,Physical',
    continent: 'Europe',
    geoGroup: 'Central / Eastern Europe',
    worldPart: 'PHYSICAL',
    nodeSubType: 'PHYSICAL',
    riverOutflow: 'Black Sea',
    countriesSpread: 'Germany, Austria, Slovakia, Hungary, Croatia, Serbia, Romania, Bulgaria, Moldova, Ukraine',
    shape: JSON.stringify([
      [48.0, 8.2], [48.5, 13.5], [48.4, 15.5],
      [47.8, 17.0], [47.7, 18.9], [47.5, 19.1],
      [45.7, 18.8], [44.7, 20.7], [44.2, 22.7],
      [45.0, 28.8], [45.2, 29.7]
    ]),
    prelims: 'Second longest river in Europe (2,860 km). Flows through or borders 10 countries — most multi-national river in the world. Danube Delta (Romania/Ukraine) is a UNESCO Biosphere Reserve and Ramsar site.',
    mains: 'Iron Gate gorge (Romania-Serbia) hydropower dam. Danube Commission — multinational river governance model. Black Sea pollution from Danube tributary agriculture. Danube connects Black Sea to North Sea via Rhine-Main-Danube Canal.',
    india: 'Danube used as standard example of international river governance and transboundary cooperation agreements in GS-II and GS-III questions.',
    upscFrequency: 6
  },
  {
    name: 'Rhine',
    lat: 50.0, lon: 7.5,         // Germany midpoint
    category: 'nature',
    tags: 'River,Europe,Rhine,Physical',
    continent: 'Europe',
    geoGroup: 'Western Europe',
    worldPart: 'PHYSICAL',
    nodeSubType: 'PHYSICAL',
    riverOutflow: 'North Sea',
    countriesSpread: 'Switzerland, Liechtenstein, Austria, Germany, France, Netherlands',
    shape: JSON.stringify([
      [46.8, 9.2], [47.0, 8.5], [47.6, 7.5],
      [48.5, 7.8], [50.0, 7.5], [51.5, 6.5],
      [52.0, 5.2], [51.9, 4.5]
    ]),
    prelims: 'One of Europe\'s most important commercial waterways. Forms part of France-Germany border. Rotterdam (Rhine mouth) is Europe\'s largest port. Rhine Action Programme (post-1986 Sandoz chemical spill) is model for river cleanup. Rhine-Main-Danube Canal links North Sea to Black Sea.',
    mains: 'Rhine chemicals disaster (1986 Sandoz spill): polluted 480 km of river, killed 500,000 fish—example of transboundary industrial pollution and effective international cleanup. Rhine Action Programme success used in environmental law.',
    india: 'Rhine cleanup model often cited in context of Ganga Action Plan and Namami Gange. Environmental liability across borders (Sandoz case) relevant in India\'s own industrial pollution cases.',
    upscFrequency: 5
  },

  // ─── Americas ────────────────────────────────────────────────────────────────
  {
    name: 'Amazon',
    lat: -3.0, lon: -62.0,       // midpoint Brazil
    category: 'nature',
    tags: 'River,Amazon,South America,Physical',
    continent: 'South America',
    geoGroup: 'South America',
    worldPart: 'PHYSICAL',
    nodeSubType: 'PHYSICAL',
    riverOutflow: 'Atlantic Ocean',
    countriesSpread: 'Brazil, Peru, Colombia, Venezuela, Ecuador, Bolivia',
    shape: JSON.stringify([
      [-15.4, -71.5], [-12.0, -74.0], [-8.0, -74.5],
      [-5.0, -73.5], [-3.0, -67.0], [-2.5, -60.0],
      [-1.5, -52.0], [-0.2, -50.1], [0.2, -50.5]
    ]),
    prelims: 'Largest river by discharge (accounts for ~20% of all freshwater entering world\'s oceans). Longest or second-longest river by length (debate with Nile, ~6,400 km). Amazon Basin = 7.4 million km² — world\'s largest drainage basin. Brazil holds 60% of Amazon rainforest.',
    mains: 'Amazon deforestation — Brazil\'s NDC commitments, COP debates. Amazon tipping point theory (40% deforestation → savannification). Lula\'s Amazon Fund. Rights of Indigenous Peoples to forest land. Amazon fires and global CO₂.',
    india: 'Amazon deforestation discussed at all recent COPs — India\'s LIFE Mission and green commitments in context. Brazil-India BRICS cooperation on green finance. Amazon relevant in biodiversity law debates (Nagoya Protocol).',
    upscFrequency: 7
  },
  {
    name: 'Mississippi-Missouri',
    lat: 38.0, lon: -90.5,       // Missouri-Mississippi confluence
    category: 'nature',
    tags: 'River,North America,Mississippi,Physical',
    continent: 'North America',
    geoGroup: 'North America',
    worldPart: 'PHYSICAL',
    nodeSubType: 'PHYSICAL',
    riverOutflow: 'Gulf of Mexico',
    countriesSpread: 'United States',
    shape: JSON.stringify([
      [47.2, -95.2], [44.7, -92.2], [41.3, -90.2],
      [38.0, -90.5], [36.0, -89.6], [32.5, -91.0],
      [30.0, -91.0], [29.0, -89.8]
    ]),
    prelims: 'Mississippi-Missouri system = 4th longest river system in the world (6,275 km). Drains most of the central US (3.2 million km²). Missouri River is its longest tributary. Mississippi Delta in Louisiana — important Gulf wetlands under threat from coastal erosion.',
    mains: 'Mississippi floods: levee failures during Hurricane Katrina (2005). Army Corps of Engineers river management. Dead Zone in Gulf of Mexico (agricultural runoff nitrates). US infrastructure for inland waterways.',
    india: 'Mississippi Dead Zone used as example of eutrophication from agricultural runoff — relevant to India\'s fertilizer overuse and river pollution. Coastal erosion at Mississippi Delta mirrors India\'s Sundarbans erosion.',
    upscFrequency: 5
  },

  // ─── Middle East ─────────────────────────────────────────────────────────────
  {
    name: 'Tigris-Euphrates',
    lat: 33.5, lon: 43.5,        // central Iraq
    category: 'nature',
    tags: 'River,Middle East,Mesopotamia,Physical',
    continent: 'Asia',
    geoGroup: 'Middle East',
    worldPart: 'PHYSICAL',
    nodeSubType: 'PHYSICAL',
    riverOutflow: 'Persian Gulf (Shatt al-Arab)',
    countriesSpread: 'Turkey, Syria, Iraq (Euphrates); Turkey, Syria, Iraq (Tigris)',
    shape: JSON.stringify([
      [38.5, 38.5], [36.5, 38.0], [34.5, 40.5],
      [33.5, 43.5], [31.5, 44.5], [30.5, 47.5],
      [30.9, 47.8]
    ]),
    prelims: 'Cradle of Mesopotamian civilization (Tigris + Euphrates). Both originate in Anatolian Plateau, Turkey. Shatt al-Arab waterway (confluence) is disputed Iraq-Iran boundary. Euphrates flows through Syria before entering Iraq. Reduced flow due to Turkey\'s GAP project (Southeastern Anatolia Project — 22 dams).',
    mains: 'Turkey\'s Atatürk Dam (GAP project) sharply reduces Euphrates flow to Syria and Iraq — major cause of Syrian water crisis (linked to Arab Spring). Shrinking of Mesopotamian Marshes (UNESCO World Heritage). ISIS exploited water infrastructure (Mosul Dam). Iraq\'s water security crisis.',
    india: 'Tigris-Euphrates water wars are the best global case study for water-conflict nexus, frequently asked in GS-III Mains. Links to India\'s own river-water disputes (Cauvery, Krishna).',
    upscFrequency: 7
  },
]

async function seedRivers() {
  console.log('🌊 Seeding river systems for PHYSICAL layer...\n')

  let inserted = 0
  let updated = 0

  for (const river of RIVERS) {
    try {
      // Use upsert on the unique [name, lat, lon] constraint
      const existing = await prisma.mapEntry.findFirst({
        where: { name: river.name, worldPart: 'PHYSICAL' }
      })

      if (!existing) {
        await prisma.mapEntry.create({ data: river })
        console.log(`  ✅ [NEW]  ${river.name}  →  ${river.riverOutflow}`)
        inserted++
      } else {
        await prisma.mapEntry.update({ where: { id: existing.id }, data: river })
        console.log(`  🔄 [UPD]  ${river.name}`)
        updated++
      }
    } catch (err) {
      console.warn(`  ⚠️  Skipped ${river.name}: ${err.message}`)
    }
  }

  console.log(`\n✨ Done. Inserted: ${inserted}  |  Updated: ${updated}  |  Total: ${RIVERS.length} rivers.`)
}

seedRivers()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
