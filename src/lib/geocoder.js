import { generateJSON } from './ai.js'
import { geocodeCountryEntries } from './countryGeocoder.js'
import { getRenderedPrompt } from './aiPromptRegistry.js'

/**
 * Intelligent Data Enrichment for the UPSC Atlas Portal.
 * Extracts geopolitical groups and strategic regions for geocoded locations.
 */
async function enrichWithAI(entries, worldPart) {
  const systemInstruction = await getRenderedPrompt('geocoder.enrichment.system', { worldPart })

  const prompt = `
    Enrich the following strategic locations with UPSC metadata:
    ${entries.map(e => `- ${e.name} (Source: ${e.geocodeSource || 'GIS'})`).join('\n')}
  `

  try {
    const enrichment = await generateJSON(prompt, systemInstruction)
    if (!Array.isArray(enrichment)) return entries

    return entries.map(entry => {
      const match = enrichment.find(r => r.name?.toLowerCase() === entry.name.toLowerCase())
      if (match) {
        return {
          ...entry,
          continent: entry.continent || match.continent,
          admRegion: entry.admRegion || match.admRegion,
          geoGroup: entry.geoGroup || match.geoGroup,
          capital: entry.capital || match.capital
        }
      }
      return entry
    })
  } catch (error) {
    console.warn(`[Geocoder] AI Enrichment failed, returning GIS data only:`, error.message)
    return entries
  }
}

async function chunkBatch(entries, worldPart) {
  try {
    // 1. GIS Geocoding (Level 1-4)
    const { resolved } = await geocodeCountryEntries(entries)
    
    // 2. AI Intelligence Enrichment (Optional high-value metadata)
    return await enrichWithAI(resolved, worldPart)
  } catch (error) {
    console.error(`[Geocoder] Chunk processing failed:`, error.message)
    return entries.map(e => ({ ...e, lat: e.lat || 0, lon: e.lon || 0 }))
  }
}

export async function batchGeocode(entries, worldPart = 'POLITICAL') {
  if (!entries || entries.length === 0) return []
  
  // Split into batches of 5 to prevent LLM timeout/truncation
  const batchSize = 5
  const results = []
  
  process.stdout.write(`[Bulk] AI Discovery: Processing ${entries.length} nodes in ${Math.ceil(entries.length/batchSize)} batches...\n`)
  
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize)
    process.stdout.write(`[Bulk] Batch ${Math.floor(i/batchSize)+1}/${Math.ceil(entries.length/batchSize)} starting...\n`)
    try {
      const batchResults = await chunkBatch(batch, worldPart)
      results.push(...batchResults)
    } catch (e) {
      console.error(`[Bulk] Batch ${Math.floor(i/batchSize)+1} failed completely. Skipping batch components. Error: ${e.message}`)
      // Add original entries for this failed batch so the import continues without geocoding for them
      results.push(...batch)
    }
  }
  
  return results
}
