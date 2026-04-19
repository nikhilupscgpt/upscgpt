import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Priority Mountain Systems for UPSC Mapping
const MOUNTAINS = [
  {
    name: 'Himalayas',
    lat: 27.9881,
    lon: 86.9250,
    category: 'mountain',
    tags: 'Fold, Asia, Physical',
    continent: 'Asia',
    geoGroup: 'South Asia / Tibet',
    worldPart: 'PHYSICAL',
    nodeSubType: 'PHYSICAL',
    mountainType: 'Young Fold',
    highestPeak: 'Mount Everest (8,848m)',
    countriesSpread: 'India, Nepal, Bhutan, China, Pakistan',
    shape: JSON.stringify([[35.3, 74.6], [32.5, 78.5], [29.6, 81.3], [28.2, 84.1], [27.7, 88.1], [27.5, 91.5], [29.6, 95.3]]),
    prelims: 'Youngest and highest fold mountains. Formed by collision of Indian and Eurasian plates. Syntaxial bends at Nanga Parbat and Namcha Barwa.',
    mains: 'Acts as a climatic divide for the Indian subcontinent, blocking cold central Asian winds. Source of perennial rivers (Indus, Ganga, Brahmaputra). Critical for monsoon mechanism.',
    india: 'Forms the entire northern boundary of India. Crucial for geopolitical defense, hydro-power, and biodiversity (Himalayan biodiversity hotspot).',
    upscFrequency: 10
  },
  {
    name: 'Alps',
    lat: 46.8876,
    lon: 9.6570,
    category: 'mountain',
    tags: 'Fold, Europe, Physical',
    continent: 'Europe',
    geoGroup: 'Central / Southern Europe',
    worldPart: 'PHYSICAL',
    nodeSubType: 'PHYSICAL',
    mountainType: 'Young Fold',
    highestPeak: 'Mont Blanc (4,805m)',
    countriesSpread: 'France, Switzerland, Italy, Austria, Germany, Slovenia, Liechtenstein, Monaco',
    shape: JSON.stringify([[43.7, 7.3], [45.1, 6.7], [45.9, 7.2], [46.7, 9.8], [47.2, 11.4], [47.5, 14.1], [47.8, 16.2]]),
    prelims: 'Formed by collision of African and Eurasian plates. Fold mountains of Alpine orogeny.',
    mains: 'Key climatic barrier in Europe. Source of major rivers like Rhine, Rhone, and Po. Glacial retreat is a major climate change indicator.',
    india: 'Compared with Himalayas in physical geography questions.',
    upscFrequency: 6
  },
  {
    name: 'Atlas Mountains',
    lat: 31.0639,
    lon: -7.9159,
    category: 'mountain',
    tags: 'Fold, Africa, Physical',
    continent: 'Africa',
    geoGroup: 'Northwestern Africa',
    worldPart: 'PHYSICAL',
    nodeSubType: 'PHYSICAL',
    mountainType: 'Young Fold',
    highestPeak: 'Mount Toubkal (4,167m)',
    countriesSpread: 'Morocco, Algeria, Tunisia',
    shape: JSON.stringify([[30.4, -9.6], [31.1, -7.9], [32.5, -4.5], [34.2, -1.8], [35.5, 2.3], [36.7, 5.1], [36.8, 10.2]]),
    prelims: 'Separates Mediterranean/Atlantic coastlines from the Sahara desert. Formed when Africa and Europe collided.',
    mains: 'Influence on regional climate (rain shadow effect causing the Sahara to extend). Vital for water supply in Maghreb region.',
    india: 'Frequently appears in matching questions for physical features.',
    upscFrequency: 7
  },
  {
    name: 'Andes',
    lat: -32.6531,
    lon: -70.0108,
    category: 'mountain',
    tags: 'Fold, South America, Physical',
    continent: 'South America',
    geoGroup: 'Western South America',
    worldPart: 'PHYSICAL',
    nodeSubType: 'PHYSICAL',
    mountainType: 'Young Fold',
    highestPeak: 'Aconcagua (6,960m)',
    countriesSpread: 'Argentina, Bolivia, Chile, Colombia, Ecuador, Peru, Venezuela',
    shape: JSON.stringify([[10.5, -73.2], [4.6, -74.1], [-1.2, -78.5], [-9.5, -77.5], [-16.5, -68.1], [-23.5, -67.4], [-32.8, -70.0], [-41.5, -72.3], [-50.3, -73.0]]),
    prelims: 'Longest continental mountain range in the world. Formed by subduction of Nazca Plate under South American Plate.',
    mains: 'Causes the formation of the Atacama desert (rain shadow). Rich in mineral resources like Copper (Chile) and Lithium triangle.',
    india: 'Context of ring of fire and tectonic plate boundaries in physical geography.',
    upscFrequency: 8
  },
  {
    name: 'Rocky Mountains',
    lat: 44.0581,
    lon: -110.0135,
    category: 'mountain',
    tags: 'Fold, North America, Physical',
    continent: 'North America',
    geoGroup: 'Western North America',
    worldPart: 'PHYSICAL',
    nodeSubType: 'PHYSICAL',
    mountainType: 'Fold',
    highestPeak: 'Mount Elbert (4,401m)',
    countriesSpread: 'Canada, United States',
    shape: JSON.stringify([[60.5, -125.0], [53.5, -119.5], [48.0, -113.8], [43.5, -110.5], [39.7, -105.8], [35.5, -105.5]]),
    prelims: 'Formed during the Laramide orogeny. Continental divide of the Americas.',
    mains: 'Extensive rain shadow effect creating the Great Plains. Significant for water supply to the western US (Colorado river).',
    india: 'Example of fold mountains formed away from plate boundary (Laramide orogeny anomaly).',
    upscFrequency: 5
  },
  {
    name: 'Ural Mountains',
    lat: 60.0000,
    lon: 59.0000,
    category: 'mountain',
    tags: 'Fold, Old, Eurasia, Physical',
    continent: 'Europe/Asia',
    geoGroup: 'Eurasian Boundary',
    worldPart: 'PHYSICAL',
    nodeSubType: 'PHYSICAL',
    mountainType: 'Old Fold',
    highestPeak: 'Mount Narodnaya (1,894m)',
    countriesSpread: 'Russia, Kazakhstan',
    shape: JSON.stringify([[68.3, 65.5], [64.5, 60.0], [60.0, 59.5], [56.1, 59.8], [51.5, 58.0]]),
    prelims: 'Traditional boundary between Europe and Asia. Highly eroded old fold mountains similar to the Aravallis in India.',
    mains: 'Extremely rich in minerals and metal ores, key to classical industrialization of the region.',
    india: 'Often compared to the Aravallis or Appalachians as examples of ancient, heavily denuded fold mountains.',
    upscFrequency: 6
  },
  {
    name: 'Caucasus Mountains',
    lat: 43.3499,
    lon: 42.4453,
    category: 'mountain',
    tags: 'Fold, Eurasia, Physical',
    continent: 'Europe/Asia',
    geoGroup: 'Caspian-Black Sea Region',
    worldPart: 'PHYSICAL',
    nodeSubType: 'PHYSICAL',
    mountainType: 'Fold',
    highestPeak: 'Mount Elbrus (5,642m)',
    countriesSpread: 'Russia, Georgia, Azerbaijan, Armenia',
    shape: JSON.stringify([[44.1, 39.5], [43.5, 41.5], [43.1, 44.0], [42.3, 46.5], [41.0, 48.0]]),
    prelims: 'Situated between the Black Sea and the Caspian Sea. Elbrus is the highest peak in Europe.',
    mains: 'Major ethno-linguistic and geopolitical dividing line.',
    india: 'Strategic geography context when studying the INSTC (International North-South Transport Corridor) and regional conflicts.',
    upscFrequency: 8
  },
  {
    name: 'Hindu Kush',
    lat: 35.0000,
    lon: 71.0000,
    category: 'mountain',
    tags: 'Fold, Asia, Physical',
    continent: 'Asia',
    geoGroup: 'Central-South Asia',
    worldPart: 'PHYSICAL',
    nodeSubType: 'PHYSICAL',
    mountainType: 'Young Fold',
    highestPeak: 'Tirich Mir (7,708m)',
    countriesSpread: 'Afghanistan, Pakistan, Tajikistan',
    shape: JSON.stringify([[34.5, 68.5], [35.1, 70.0], [35.8, 71.8], [36.5, 73.5], [37.2, 74.6]]),
    prelims: 'Western extension of the Pamir Knot and Himalayan system. Important passes: Khyber Pass.',
    mains: 'Historical gateway to India. Crucial for geopolitical stability and terrorism studies (Af-Pak region).',
    india: 'Directly linked to India\'s historical invasions and current security paradigm in the neighborhood.',
    upscFrequency: 9
  }
]

async function seedPhysicalFeatures() {
  console.log('Seeding physical features (Mountains)...')
  
  let inserted = 0
  for (const m of MOUNTAINS) {
    const existing = await prisma.mapEntry.findFirst({
      where: { name: m.name, worldPart: 'PHYSICAL' }
    })
    
    if (!existing) {
      await prisma.mapEntry.create({ data: m })
      inserted++
    } else {
      await prisma.mapEntry.update({
        where: { id: existing.id },
        data: m
      })
    }
  }
  
  console.log(`Seeded ${inserted} new mountain ranges. Setup complete.`)
}

seedPhysicalFeatures()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
