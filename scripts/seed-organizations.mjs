import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const ORGANIZATIONS = [
  {
    name: 'North Atlantic Treaty Organization',
    shortName: 'NATO',
    category: 'MILITARY',
    members: 'Albania,Belgium,Bulgaria,Canada,Croatia,Czech Republic,Denmark,Estonia,Finland,France,Germany,Greece,Hungary,Iceland,Italy,Latvia,Lithuania,Luxembourg,Montenegro,Netherlands,North Macedonia,Norway,Poland,Portugal,Romania,Slovakia,Slovenia,Spain,Sweden,Turkey,United Kingdom,United States',
    hqCity: 'Brussels',
    hqLat: 50.8799,
    hqLon: 4.4280,
    founded: 1949,
    description: 'A military alliance of 32 member states from Europe and North America. Collective defence under Article 5 is its cornerstone.',
    upscContext: 'UPSC tests NATO expansion (Finland & Sweden joining 2023-24), India-NATO relations (non-member), Article 5 collective defence, and NATO vs CSTO as strategic blocs.',
    indiaRole: 'NOT_MEMBER'
  },
  {
    name: 'Association of Southeast Asian Nations',
    shortName: 'ASEAN',
    category: 'REGIONAL',
    members: 'Brunei,Cambodia,Indonesia,Laos,Malaysia,Myanmar,Philippines,Singapore,Thailand,Vietnam',
    hqCity: 'Jakarta',
    hqLat: -6.2088,
    hqLon: 106.8456,
    founded: 1967,
    description: 'A regional intergovernmental organization of 10 Southeast Asian countries, promoting economic growth, political stability, and cultural exchange.',
    upscContext: 'UPSC tests ASEAN centrality, India\'s Act East Policy, ASEAN+3, RCEP, and maritime disputes in the South China Sea involving ASEAN members.',
    indiaRole: 'DIALOGUE_PARTNER'
  },
  {
    name: 'BRICS',
    shortName: 'BRICS',
    category: 'ECONOMIC',
    members: 'Brazil,Russia,India,China,South Africa,Egypt,Ethiopia,Indonesia,Iran,Saudi Arabia,UAE',
    hqCity: 'Shanghai',
    hqLat: 31.2304,
    hqLon: 121.4737,
    founded: 2009,
    description: 'An intergovernmental organization of major emerging economies. Expanded to BRICS+ in 2024 with six new members.',
    upscContext: 'UPSC tests BRICS expansion (2024 inductees), New Development Bank (NDB), de-dollarisation debates, and India\'s balancing of BRICS with Quad.',
    indiaRole: 'MEMBER'
  },
  {
    name: 'Shanghai Cooperation Organisation',
    shortName: 'SCO',
    category: 'REGIONAL',
    members: 'China,India,Iran,Kazakhstan,Kyrgyzstan,Pakistan,Russia,Tajikistan,Uzbekistan,Belarus',
    hqCity: 'Beijing',
    hqLat: 39.9042,
    hqLon: 116.4074,
    founded: 2001,
    description: 'A Eurasian political, economic, and security alliance. The world\'s largest regional organisation by geographic scope and population.',
    upscContext: 'UPSC tests India-Pakistan both being SCO members, India\'s tensions within the org, SCO vs NATO framing, and Central Asia connectivity.',
    indiaRole: 'MEMBER'
  },
  {
    name: 'Group of Seven',
    shortName: 'G7',
    category: 'ECONOMIC',
    members: 'Canada,France,Germany,Italy,Japan,United Kingdom,United States',
    hqCity: 'Variable',
    hqLat: 48.8566,
    hqLon: 2.3522,
    founded: 1975,
    description: 'An informal bloc of the seven largest advanced economies. Represents about 40% of global GDP. EU participates as a non-enumerated member.',
    upscContext: 'UPSC tests India being invited (not a member), G7 vs G20, Russia\'s suspension (Crimea 2014), and G7 positions on climate, AI, and geopolitics.',
    indiaRole: 'NOT_MEMBER'
  },
  {
    name: 'Group of Twenty',
    shortName: 'G20',
    category: 'ECONOMIC',
    members: 'Argentina,Australia,Brazil,Canada,China,France,Germany,India,Indonesia,Italy,Japan,Mexico,Russia,Saudi Arabia,South Africa,South Korea,Turkey,United Kingdom,United States',
    hqCity: 'Variable',
    hqLat: 28.6139,
    hqLon: 77.2090,
    founded: 1999,
    description: 'An intergovernmental forum of 19 countries plus the EU and African Union, comprising the world\'s major economies.',
    upscContext: 'India held G20 Presidency in 2023 (New Delhi Summit). UPSC tests the African Union\'s inclusion, India\'s global south leadership, and G20 agenda items.',
    indiaRole: 'MEMBER'
  },
  {
    name: 'Arctic Council',
    shortName: 'Arctic Council',
    category: 'ENVIRONMENTAL',
    members: 'Canada,Denmark,Finland,Iceland,Norway,Russia,Sweden,United States',
    hqCity: 'Tromsø',
    hqLat: 69.6492,
    hqLon: 18.9553,
    founded: 1996,
    description: 'An intergovernmental forum promoting cooperation among Arctic states and Indigenous peoples on Arctic issues, especially environment and sustainable development.',
    upscContext: 'UPSC tests Arctic Council membership (8 states), Russia\'s chairmanship suspension (2022), China as Observer (not a member), and India\'s Arctic policy & Himadri station.',
    indiaRole: 'OBSERVER'
  },
  {
    name: 'South Asian Association for Regional Cooperation',
    shortName: 'SAARC',
    category: 'REGIONAL',
    members: 'Afghanistan,Bangladesh,Bhutan,India,Maldives,Nepal,Pakistan,Sri Lanka',
    hqCity: 'Kathmandu',
    hqLat: 27.7172,
    hqLon: 85.3240,
    founded: 1985,
    description: 'A regional organisation of South Asian nations. SAARC summits have been repeatedly stalled due to India-Pakistan tensions.',
    upscContext: 'UPSC tests SAARC vs BIMSTEC (India\'s pivot), stalled summits since 2016, charter provisions, and Afghanistan\'s membership status under Taliban.',
    indiaRole: 'MEMBER'
  },
  {
    name: 'Bay of Bengal Initiative for Multi-Sectoral Technical and Economic Cooperation',
    shortName: 'BIMSTEC',
    category: 'REGIONAL',
    members: 'Bangladesh,Bhutan,India,Myanmar,Nepal,Sri Lanka,Thailand',
    hqCity: 'Dhaka',
    hqLat: 23.8103,
    hqLon: 90.4125,
    founded: 1997,
    description: 'A regional organisation of seven countries in South and Southeast Asia that border the Bay of Bengal.',
    upscContext: 'UPSC tests India\'s preference for BIMSTEC over SAARC (excludes Pakistan), maritime connectivity, and the 2022 Colombo Summit.',
    indiaRole: 'MEMBER'
  },
  {
    name: 'Quadrilateral Security Dialogue',
    shortName: 'Quad',
    category: 'MILITARY',
    members: 'Australia,India,Japan,United States',
    hqCity: 'Variable',
    hqLat: 35.6762,
    hqLon: 139.6503,
    founded: 2007,
    description: 'A strategic security dialogue between four democracies aimed at a free, open, and prosperous Indo-Pacific, widely seen as a counterweight to China.',
    upscContext: 'UPSC tests Quad vs China framing, India\'s non-alliance stance within Quad, Quad Plus possibilities, and vaccine/tech initiatives.',
    indiaRole: 'MEMBER'
  },
  {
    name: 'AUKUS',
    shortName: 'AUKUS',
    category: 'MILITARY',
    members: 'Australia,United Kingdom,United States',
    hqCity: 'Variable',
    hqLat: -33.8688,
    hqLon: 151.2093,
    founded: 2021,
    description: 'A trilateral security partnership for sharing advanced defence capabilities including nuclear-powered submarines. Caused a major diplomatic dispute with France.',
    upscContext: 'UPSC tests AUKUS vs Quad (different membership), India not a member, France submarine deal fallout, and nuclear-submarine technology transfer.',
    indiaRole: 'NOT_MEMBER'
  },
  {
    name: 'Mekong-Ganga Cooperation',
    shortName: 'MGC',
    category: 'REGIONAL',
    members: 'Cambodia,India,Laos,Myanmar,Thailand,Vietnam',
    hqCity: 'Variable',
    hqLat: 13.7563,
    hqLon: 100.5018,
    founded: 2000,
    description: 'A cooperative initiative between India and five ASEAN countries (those bordering the Mekong), focused on tourism, education, culture, and transport.',
    upscContext: 'A classic UPSC trap question — Bangladesh and China are NOT members despite being nearby. Tests ability to distinguish member vs non-member of sub-regional groups.',
    indiaRole: 'MEMBER'
  },
  {
    name: 'Indian Ocean Rim Association',
    shortName: 'IORA',
    category: 'REGIONAL',
    members: 'Australia,Bangladesh,Comoros,India,Indonesia,Iran,Kenya,Madagascar,Malaysia,Maldives,Mauritius,Mozambique,Oman,Saudi Arabia,Seychelles,Singapore,Somalia,South Africa,Sri Lanka,Tanzania,Thailand,UAE,Yemen',
    hqCity: 'Ebene',
    hqLat: -20.2450,
    hqLon: 57.4896,
    founded: 1997,
    description: 'An international organisation promoting cooperation and trade among Indian Ocean rim countries.',
    upscContext: 'UPSC tests India\'s SAGAR doctrine (Security and Growth for All in the Region) and IORA as a platform for Indian Ocean cooperation against China\'s String of Pearls.',
    indiaRole: 'MEMBER'
  },
]

async function main() {
  console.log('🌍 Seeding organizations...')
  
  for (const org of ORGANIZATIONS) {
    await prisma.organization.upsert({
      where: { name: org.name },
      update: org,
      create: org,
    })
    console.log(`  ✅ ${org.shortName}`)
  }

  console.log(`\n✨ Done. Seeded ${ORGANIZATIONS.length} organizations.`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
