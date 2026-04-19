import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const MOUNTAINS_SHAPES = {
  'Himalayas': [[35.3, 74.6], [32.5, 78.5], [29.6, 81.3], [28.2, 84.1], [27.7, 88.1], [27.5, 91.5], [29.6, 95.3]],
  'Alps': [[43.7, 7.3], [45.1, 6.7], [45.9, 7.2], [46.7, 9.8], [47.2, 11.4], [47.5, 14.1], [47.8, 16.2]],
  'Atlas Mountains': [[30.4, -9.6], [31.1, -7.9], [32.5, -4.5], [34.2, -1.8], [35.5, 2.3], [36.7, 5.1], [36.8, 10.2]],
  'Andes': [[10.5, -73.2], [4.6, -74.1], [-1.2, -78.5], [-9.5, -77.5], [-16.5, -68.1], [-23.5, -67.4], [-32.8, -70.0], [-41.5, -72.3], [-50.3, -73.0]],
  'Rocky Mountains': [[60.5, -125.0], [53.5, -119.5], [48.0, -113.8], [43.5, -110.5], [39.7, -105.8], [35.5, -105.5]],
  'Ural Mountains': [[68.3, 65.5], [64.5, 60.0], [60.0, 59.5], [56.1, 59.8], [51.5, 58.0]],
  'Caucasus Mountains': [[44.1, 39.5], [43.5, 41.5], [43.1, 44.0], [42.3, 46.5], [41.0, 48.0]],
  'Hindu Kush': [[34.5, 68.5], [35.1, 70.0], [35.8, 71.8], [36.5, 73.5], [37.2, 74.6]]
}

export async function GET() {
  try {
    let updated = 0
    for (const [name, shapeArr] of Object.entries(MOUNTAINS_SHAPES)) {
      const existing = await prisma.mapEntry.findFirst({
        where: { name, worldPart: 'PHYSICAL' }
      })
      if (existing) {
        await prisma.mapEntry.update({
          where: { id: existing.id },
          data: { shape: JSON.stringify(shapeArr) }
        })
        updated++
      }
    }
    return NextResponse.json({ success: true, updated })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
