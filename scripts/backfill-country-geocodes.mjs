import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const REST_COUNTRIES_URL = 'https://restcountries.com/v3.1/all?fields=name,altSpellings,cca2,cca3,capital,latlng'
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search'

const COUNTRY_ALIASES = {
  'cape verde': 'cabo verde',
  "cote d ivoire": 'ivory coast',
  'congo brazzaville': 'republic of the congo',
  'dr congo': 'democratic republic of the congo',
  'east timor': 'timor-leste',
  'uae': 'united arab emirates',
  'south korea': 'korea republic of',
  'north korea': 'korea democratic people s republic of',
  'czech republic': 'czechia',
  'micronesia fed states': 'micronesia',
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

function getRestCountriesMatch(entry, index) {
  const name = normalizeCountryName(entry.name)
  const alias = COUNTRY_ALIASES[name]
  const searchTerms = [entry.name, name, alias, entry.capital ? `${entry.name} ${entry.capital}` : ''].filter(Boolean)

  for (const term of searchTerms) {
    const country = index.get(normalizeCountryName(term))
    const [lat, lon] = country?.latlng || []
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      return { lat, lon, source: country?.name?.common || country?.name?.official || term }
    }
  }

  return null
}

async function getNominatimMatch(entry) {
  const params = new URLSearchParams({
    q: [entry.name, entry.capital, entry.continent].filter(Boolean).join(', '),
    format: 'jsonv2',
    limit: '1',
  })

  const response = await fetch(`${NOMINATIM_BASE_URL}?${params.toString()}`, {
    headers: {
      'User-Agent': 'UPSCAtlasPortal/1.0 (country geocode backfill)',
      'Accept-Language': 'en',
    },
  })

  if (!response.ok) return null
  const data = await response.json()
  const first = Array.isArray(data) ? data[0] : null
  const lat = Number(first?.lat)
  const lon = Number(first?.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null

  return {
    lat,
    lon,
    source: first.display_name || entry.name,
  }
}

async function main() {
  const missingEntries = await prisma.mapEntry.findMany({
    where: {
      worldPart: 'POLITICAL',
      OR: [{ lat: null }, { lon: null }],
    },
    orderBy: { name: 'asc' },
  })

  console.log(`Found ${missingEntries.length} political entries missing coordinates.`)
  if (missingEntries.length === 0) return

  const countriesResponse = await fetch(REST_COUNTRIES_URL, {
    headers: { 'User-Agent': 'UPSCAtlasPortal/1.0 (country geocode backfill)' },
  })
  if (!countriesResponse.ok) {
    throw new Error(`restcountries lookup failed with ${countriesResponse.status}`)
  }
  const countries = await countriesResponse.json()
  const countryIndex = buildCountryIndex(Array.isArray(countries) ? countries : [])

  let updated = 0
  const unresolved = []

  for (const entry of missingEntries) {
    let match = getRestCountriesMatch(entry, countryIndex)
    if (!match) {
      match = await getNominatimMatch(entry)
    }

    if (!match) {
      unresolved.push(entry.name)
      continue
    }

    await prisma.mapEntry.update({
      where: { id: entry.id },
      data: {
        lat: match.lat,
        lon: match.lon,
      },
    })

    updated += 1
    console.log(`Updated ${entry.name} -> ${match.lat}, ${match.lon} (${match.source})`)
  }

  console.log(`Backfill complete. Updated ${updated} entries.`)
  if (unresolved.length > 0) {
    console.log(`Unresolved (${unresolved.length}): ${unresolved.join(', ')}`)
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
