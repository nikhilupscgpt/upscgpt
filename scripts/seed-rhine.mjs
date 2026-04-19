import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const Rhine = {
  name: 'Rhine', lat: 50.0, lon: 7.5, category: 'river',
  tags: 'River,Europe,Rhine,Physical', continent: 'Europe',
  geoGroup: 'Western Europe', worldPart: 'PHYSICAL', nodeSubType: 'PHYSICAL',
  riverOutflow: 'North Sea',
  countriesSpread: 'Switzerland, Liechtenstein, Austria, Germany, France, Netherlands',
  shape: JSON.stringify([[46.8,9.2],[47.0,8.5],[47.6,7.5],[48.5,7.8],[50.0,7.5],[51.5,6.5],[52.0,5.2],[51.9,4.5]]),
  prelims: "One of Europe's most important commercial waterways. Rotterdam (Rhine mouth) is Europe's largest port. Rhine-Main-Danube Canal links North Sea to Black Sea. 1986 Sandoz chemical spill—model river cleanup.",
  mains: "Rhine Action Programme (post-Sandoz spill) is a landmark example of transboundary pollution law and successful river rejuvenation—frequently cited in environmental governance.",
  india: "Rhine cleanup model cited for Ganga Action Plan comparison. Sandoz case relevant in India's environmental liability debates.",
  upscFrequency: 5
}

const existing = await prisma.mapEntry.findFirst({ where: { name: 'Rhine', worldPart: 'PHYSICAL' } })
if (!existing) {
  const r = await prisma.mapEntry.create({ data: Rhine })
  console.log('✅ Rhine seeded:', r.id)
} else {
  await prisma.mapEntry.update({ where: { id: existing.id }, data: Rhine })
  console.log('🔄 Rhine updated:', existing.id)
}
await prisma.$disconnect()
