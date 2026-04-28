import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { batchGeocode } from "@/lib/geocoder"
import { geocodeCountryEntries } from "@/lib/countryGeocoder"
import { mapEntrySchema } from "@/lib/validations"

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const { entries: rawEntries, autoGeocode, worldPart: bodyWorldPart } = body
    
    if (!rawEntries || !Array.isArray(rawEntries)) {
      return NextResponse.json({ error: "Invalid payload: 'entries' must be an array" }, { status: 400 })
    }

    const targetWorldPart = bodyWorldPart || 'POLITICAL'
    const safeParseNum = (val) => {
      if (val === undefined || val === null || val === '') return null;
      // Handle string numbers with commas/spaces
      const cleaned = String(val).replace(/[^0-9.-]/g, '');
      const n = parseFloat(cleaned);
      return isNaN(n) ? null : n;
    };

    // 1. Map to standard payload (Case-insensitive & Spreadsheet-tolerant)
    let payload = rawEntries.map((e, idx) => ({
      name: (e.Country || e.country || e.Name || e.name || `Unnamed Entry ${idx + 1}`).trim(),
      lat: safeParseNum(e.lat || e.Latitude),
      lon: safeParseNum(e.lon || e.Longitude),
      category: (e.category || e.Category || 'mineral').toLowerCase(),
      tags: e.Tags || e.tags || "",
      year: safeParseNum(e.year || e.Year),
      prelims: e.prelims || e.Prelims || "",
      mains: e.mains || e.Mains || "",
      india: e.india || e.India || "",
      
      // Hierarchy Mapping
      worldPart: e.worldPart || targetWorldPart,
      continent: (e.Continent || e.continent || "").trim(),
      admRegion: (e['Adm. Region'] || e.admRegion || e.Region || "").trim(),
      geoGroup: (e['Geo-Political Group'] || e.geoGroup || e.GeoGroup || "").trim(),
      capital: (e.Capital || e.capital || "").trim(),

      createdAt: new Date(),
      updatedAt: new Date()
    }))

    // 2. Validate the mapped payload
    const validation = z.array(mapEntrySchema).safeParse(payload)
    if (!validation.success) {
      const errorMsg = validation.error.issues.map(i => {
        const row = i.path[0];
        const field = i.path[1];
        return `Row ${Number(row)+1} (${payload[row]?.name}): ${field} - ${i.message}`;
      }).join(' | ');
      
      console.error("[Bulk Import] Validation failed:", errorMsg)
      return NextResponse.json({ 
        error: validation.error.format(), 
        details: `Data Error: ${errorMsg.slice(0, 500)}...` 
      }, { status: 400 })
    }

    // 2. Perform GIS-First Geocoding if requested
    if (autoGeocode) {
      const missingCoords = payload.filter(p => p.lat == null || p.lon == null)
      
      if (missingCoords.length > 0) {
        process.stdout.write(`[Bulk] Orchestrating GIS-First Geocoding for ${missingCoords.length} entries...\n`)
        const geocoded = await batchGeocode(missingCoords, targetWorldPart)
        const geocodedMap = new Map(geocoded.map(entry => [entry.name, entry]))

        // Merge results back into payload
        payload = payload.map(p => {
          const matched = geocodedMap.get(p.name)
          if (matched) {
            return {
              ...p,
              lat: matched.lat,
              lon: matched.lon,
              continent: p.continent || matched.continent,
              admRegion: p.admRegion || matched.admRegion,
              geoGroup: p.geoGroup || matched.geoGroup,
              capital: p.capital || matched.capital,
            }
          }
          return p
        })
      }
    }

    const result = await prisma.mapEntry.createMany({
      data: payload,
      skipDuplicates: true
    })

    // Audit the action
    await prisma.actionLog.create({
      data: {
        action: 'CONTENT_EDIT',
        details: `Bulk created map entries (AI Geocode: ${autoGeocode}). Count: ${result.count}`,
        userId: session.user.id
      }
    })

    return NextResponse.json({ success: true, count: result.count })
  } catch (error) {
    console.error("Bulk POST Error:", error)
    return NextResponse.json({ 
      error: "Bulk Geocoding/Insertion Failed", 
      details: error.message || "An unknown server error occurred during the geocoding process."
    }, { status: 500 })
  }
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const result = await prisma.mapEntry.deleteMany({})
    
    // Audit the action
    await prisma.actionLog.create({
      data: {
        action: 'CONTENT_EDIT',
        details: `Deleted all map entries. Count: ${result.count}`,
        userId: session.user.id
      }
    })
    
    return NextResponse.json({ success: true, count: result.count })
  } catch (error) {
    console.error("Bulk DELETE Error:", error)
    return NextResponse.json({ error: "Failed to delete all entries" }, { status: 500 })
  }
}
