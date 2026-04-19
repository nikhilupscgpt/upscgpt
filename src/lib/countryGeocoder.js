import { generateJSON } from './ai.js'
const REST_COUNTRIES_URL = 'https://restcountries.com/v3.1/all?fields=name,altSpellings,cca2,cca3,capital,latlng'
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search'

const COUNTRY_ALIASES = {
  'cape verde': 'cabo verde',
  "côte d'ivoire": 'ivory coast',
  'congo (brazzaville)': 'republic of the congo',
  'dr congo': 'democratic republic of the congo',
  'east timor': 'timor-leste',
  'uae': 'united arab emirates',
  'south korea': 'korea, republic of',
  'north korea': "korea, democratic people's republic of",
  'czech republic': 'czechia',
  'micronesia (fed. states)': 'micronesia',
  'vatican city': 'vatican city',
}

const REGIONAL_CENTERS = {
  // Continents
  'asia': { lat: 34.0479, lon: 100.6197 },
  'africa': { lat: 8.7832, lon: 34.5085 },
  'europe': { lat: 54.5260, lon: 15.2551 },
  'north america': { lat: 54.5260, lon: -105.2551 },
  'south america': { lat: -8.7832, lon: -55.4915 },
  'oceania': { lat: -25.2744, lon: 133.7751 },
  'middle east': { lat: 29.2985, lon: 42.5510 },
  
  // Specific UPSC Regions
  'sahel': { lat: 15.0292, lon: 10.1559 },
  'maghreb': { lat: 31.7917, lon: -7.0926 },
  'central asia': { lat: 45.4507, lon: 63.1200 },
  'southeast asia': { lat: -2.3333, lon: 115.0000 },
  'west africa': { lat: 13.5301, lon: 2.4604 },
  'east africa': { lat: 1.2921, lon: 36.8219 },
  'horn of africa': { lat: 9.1450, lon: 40.4897 },
}

function normalizeCountryName(value) {
  return (value || '')
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/[().']/g, ' ')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function buildCountrySearchTerms(entry) {
  const rawName = entry?.name || ''
  const normalizedName = normalizeCountryName(rawName)
  const alias = COUNTRY_ALIASES[normalizedName]
  const terms = new Set([rawName, normalizedName])

  if (alias) {
    terms.add(alias)
  }

  if (entry?.capital) {
    terms.add(`${rawName} ${entry.capital}`)
  }

  return [...terms].filter(Boolean)
}

function buildCountryIndex(countries) {
  const index = new Map()

  const addKey = (key, country) => {
    const normalized = normalizeCountryName(key)
    if (!normalized || index.has(normalized)) return
    index.set(normalized, country)
  }

  for (const country of countries) {
    addKey(country?.name?.common, country)
    addKey(country?.name?.official, country)
    for (const spelling of country?.altSpellings || []) {
      addKey(spelling, country)
    }
    addKey(country?.cca2, country)
    addKey(country?.cca3, country)
  }

  return index
}

function mapCountryToGeocode(country) {
  const [lat, lon] = country?.latlng || []
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null

  return {
    lat,
    lon,
    matchedName: country?.name?.common || country?.name?.official || null,
  }
}

async function fetchAllCountries() {
  const response = await fetch(REST_COUNTRIES_URL, {
    headers: {
      'User-Agent': 'UPSCAtlasPortal/1.0 (deterministic country geocoder)',
    },
  })

  if (!response.ok) {
    throw new Error(`restcountries lookup failed with ${response.status}`)
  }

  const data = await response.json()
  return Array.isArray(data) ? data : []
}

async function fetchNominatimGeocode(entry) {
  const params = new URLSearchParams({
    q: [entry?.name, entry?.capital, entry?.continent].filter(Boolean).join(', '),
    format: 'jsonv2',
    limit: '1',
  })

  const response = await fetch(`${NOMINATIM_BASE_URL}?${params.toString()}`, {
    headers: {
      'User-Agent': 'UPSCAtlasPortal/1.0 (deterministic country geocoder)',
      'Accept-Language': 'en',
    },
  })

  if (!response.ok) {
    throw new Error(`nominatim lookup failed with ${response.status}`)
  }

  const data = await response.json()
  const first = Array.isArray(data) ? data[0] : null
  if (!first) return null

  const lat = Number(first.lat)
  const lon = Number(first.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null

  return {
    lat,
    lon,
    matchedName: first.display_name || entry?.name || null,
  }
}

async function fetchAiGeocode(entry) {
  const systemInstruction = `
    You are a Geographic Intelligence Assistant. 
    Find the precise Lat/Lon for the provided location.
    Return JSON: {"lat": number, "lon": number, "name": "matching display name"}
  `
  const prompt = `Geocode: ${entry.name} ${entry.admRegion || ''} ${entry.continent || ''}`
  
  try {
    const result = await generateJSON(prompt, systemInstruction)
    if (result && typeof result.lat === 'number' && typeof result.lon === 'number') {
      return {
        lat: result.lat,
        lon: result.lon,
        matchedName: result.name || entry.name
      }
    }
  } catch (err) {
    console.warn(`[GIS] AI Fallback failed for ${entry.name}:`, err.message)
  }
  return null
}

export async function geocodeCountryEntries(entries) {
  const input = Array.isArray(entries) ? entries : []
  if (input.length === 0) return { resolved: [], unresolved: [] }

  const countries = await fetchAllCountries()
  const index = buildCountryIndex(countries)

  const resolved = []
  const unresolved = []

  for (const entry of input) {
    let geocode = null

    // 1. Try RestCountries (Exact match)
    for (const term of buildCountrySearchTerms(entry)) {
      const match = index.get(normalizeCountryName(term))
      geocode = mapCountryToGeocode(match)
      if (geocode) break
    }

    // 2. Try Nominatim (Precise search)
    if (!geocode) {
      try {
        geocode = await fetchNominatimGeocode(entry)
      } catch (err) {
        console.warn(`[GIS] Nominatim failed for ${entry.name}:`, err.message)
      }
    }

    // 3. Tier-3 Fallback: AI Precise Coordinate
    if (!geocode) {
      geocode = await fetchAiGeocode(entry)
    }

    // 4. Tier-4 Fallback: Regional Center (Safety Net)
    if (!geocode) {
      const regionKey = normalizeCountryName(entry.admRegion || entry.continent || '')
      const center = REGIONAL_CENTERS[regionKey]
      if (center) {
        geocode = {
          lat: center.lat,
          lon: center.lon,
          matchedName: `Regional Fallback: ${entry.admRegion || entry.continent}`,
        }
      }
    }

    // 4. Global Fallback (Last Resort - 0,0)
    if (!geocode) {
      geocode = {
        lat: 0.0,
        lon: 0.0,
        matchedName: "Global Fallback (0,0)",
      }
    }

    resolved.push({
      ...entry,
      lat: geocode.lat,
      lon: geocode.lon,
      geocodeSource: geocode.matchedName,
    })
  }

  return { resolved, unresolved: [] } // In the new system, nothing is unresolved
}
