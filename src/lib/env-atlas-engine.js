import prisma from '@/lib/prisma';
import curatedData from './curated-env-species.json' with { type: 'json' };

/**
 * Standardizes string arrays
 */
export function normalizeArray(val) {
  if (!val) return [];
  const arr = Array.isArray(val) ? val : [val];
  const seen = new Set();
  const out = [];
  for (const item of arr) {
    if (typeof item === 'string') {
      const s = item.trim();
      if (s && !seen.has(s)) {
        seen.add(s);
        out.push(s);
      }
    }
  }
  return out;
}

/**
 * Deduplicates an array of items by lowercased title or slug
 */
function dedupeItems(list) {
  const map = new Map();
  for (const item of list) {
    const key = (item.title || item.slug || '').toLowerCase().trim();
    if (!key) continue;
    if (!map.has(key)) {
      map.set(key, item);
    } else {
      const existing = map.get(key);
      map.set(key, { ...existing, ...item });
    }
  }
  return Array.from(map.values());
}

const dynamicNews = [...(curatedData.news || [])];
const dynamicNetworks = { ...(curatedData.networks || {}) };

let seedPromise = null;

/**
 * Serializes a Prisma EnvAtlasItem row into the flat UI item format
 */
export function rowToAtlasItem(row) {
  const d = row.details && typeof row.details === 'object' ? row.details : {};
  return {
    id: row.id,
    envId: row.envId,
    slug: row.slug,
    module: row.module,
    category: row.category,
    title: row.title,
    subtitle: row.subtitle || '',
    aliases: row.aliases || [],
    oneline: row.oneline || '',
    priority: row.priority || 'High',
    isStarter: Boolean(row.isStarter),
    startWith: d.startWith !== undefined ? Boolean(d.startWith) : Boolean(row.isStarter),
    sortOrder: row.sortOrder ?? 100,
    wikiTitle: row.wikiTitle || '',
    imageUrl: row.imageUrl || null,
    credit: d.credit || row.imageCredit || null,
    imageCredit: row.imageCredit || d.credit || null,
    rememberBullets: row.rememberBullets || [],
    confusionTrap: row.confusionTrap || null,
    confusedWith: row.confusedWith || [],
    statusBadges: row.statusBadges || {},
    regionScope: row.regionScope || 'India',
    states: row.states || [],
    lat: row.lat ?? null,
    lng: row.lng ?? null,
    networkKey: row.networkKey || null,
    places: Array.isArray(row.places) ? row.places : [],
    relatedSlugs: row.relatedSlugs || [],
    lastNewsDate: row.lastNewsDate || null,
    newsTriggers: Array.isArray(row.newsTriggers) ? row.newsTriggers : [],
    upscAngle: row.upscAngle || null,
    similarPYQ: row.similarPYQ || [],
    traps: Array.isArray(d.traps) ? d.traps : [],
    facts: Array.isArray(d.facts) ? d.facts : [],
    idmarks: Array.isArray(d.idmarks) ? d.idmarks : [],
    programmes: Array.isArray(d.programmes) ? d.programmes : [],
    behaviour: d.behaviour || null,
    habitatType: d.habitatType || row.oneline || null,
    distributionText: d.distributionText || null,
    uniqueFeatures: Array.isArray(d.uniqueFeatures) ? d.uniqueFeatures : [],
    headlineStat: d.headlineStat || null,
    pastQuestions: Array.isArray(d.pastQuestions) ? d.pastQuestions : [],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function buildPrismaFields(item, existing = null) {
  const newsTriggers = Array.isArray(item.newsTriggers) ? item.newsTriggers : [];
  const lastNewsDate =
    item.lastNewsDate ||
    newsTriggers[0]?.date ||
    newsTriggers[0]?.d ||
    existing?.lastNewsDate ||
    null;

  const existingDetails =
    existing?.details && typeof existing.details === 'object' ? existing.details : {};

  const details = {
    ...existingDetails,
    ...(item.traps !== undefined ? { traps: normalizeArray(item.traps) } : {}),
    ...(item.facts !== undefined ? { facts: normalizeArray(item.facts) } : {}),
    ...(item.idmarks !== undefined ? { idmarks: normalizeArray(item.idmarks) } : {}),
    ...(item.programmes !== undefined ? { programmes: normalizeArray(item.programmes) } : {}),
    ...(item.behaviour !== undefined ? { behaviour: item.behaviour || null } : {}),
    ...(item.habitatType !== undefined ? { habitatType: item.habitatType || null } : {}),
    ...(item.distributionText !== undefined ? { distributionText: item.distributionText || null } : {}),
    ...(item.uniqueFeatures !== undefined ? { uniqueFeatures: normalizeArray(item.uniqueFeatures) } : {}),
    ...(item.headlineStat !== undefined ? { headlineStat: item.headlineStat || null } : {}),
    ...(item.pastQuestions !== undefined ? { pastQuestions: Array.isArray(item.pastQuestions) ? item.pastQuestions : [] } : {}),
    ...(item.credit !== undefined ? { credit: item.credit || null } : {}),
    startWith: item.startWith !== undefined ? Boolean(item.startWith) : Boolean(item.isStarter),
  };

  return {
    envId: item.envId || existing?.envId || `ENV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    slug: item.slug,
    module: (item.module || 'SPECIES').toUpperCase(),
    category: item.category || 'Mammals',
    title: item.title,
    subtitle: item.subtitle || null,
    aliases: normalizeArray(item.aliases),
    oneline: item.oneline || item.habitatType || '',
    priority: item.priority || 'High',
    isStarter: Boolean(item.isStarter),
    sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : 100,
    wikiTitle: item.wikiTitle || item.title.replace(/\s+/g, '_'),
    imageUrl: item.imageUrl || null,
    imageCredit: item.imageCredit || item.credit || null,
    rememberBullets: Array.isArray(item.rememberBullets) ? item.rememberBullets : [],
    confusionTrap: item.confusionTrap || null,
    confusedWith: normalizeArray(item.confusedWith),
    statusBadges: item.statusBadges && typeof item.statusBadges === 'object' ? item.statusBadges : {},
    regionScope: item.regionScope || 'India',
    states: normalizeArray(item.states),
    lat: typeof item.lat === 'number' ? item.lat : null,
    lng: typeof item.lng === 'number' ? item.lng : null,
    networkKey: item.networkKey || null,
    places: Array.isArray(item.places) ? item.places : [],
    relatedSlugs: normalizeArray(item.relatedSlugs),
    lastNewsDate: lastNewsDate ? String(lastNewsDate) : null,
    newsTriggers,
    upscAngle: item.upscAngle || null,
    details,
    similarPYQ: normalizeArray(item.similarPYQ),
  };
}

/**
 * Seeds env_atlas_items from curated-env-species.json once if the table is empty
 */
export async function ensureCuratedSeeded() {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    const count = await prisma.envAtlasItem.count();
    if (count > 0) return;

    const curated = dedupeItems(curatedData.items || []);
    for (const item of curated) {
      const fields = buildPrismaFields(item);
      await prisma.envAtlasItem.upsert({
        where: { slug: fields.slug },
        create: fields,
        update: fields,
      });
    }
  })().catch((err) => {
    seedPromise = null;
    throw err;
  });
  return seedPromise;
}

/**
 * Fetches all Environment Atlas items for a given module/category with optional search filter
 */
export async function getEnvAtlasItems({ module = 'SPECIES', category = 'ALL', search = '' } = {}) {
  let list = [];
  try {
    await ensureCuratedSeeded();
    const where = {};
    if (module && module !== 'ALL') {
      where.module = module.toUpperCase();
    }
    const rows = await prisma.envAtlasItem.findMany({
      where,
      orderBy: [{ isStarter: 'desc' }, { sortOrder: 'asc' }, { title: 'asc' }],
    });
    list = rows.map(rowToAtlasItem);
  } catch (err) {
    console.warn('[env-atlas-engine] Falling back to curated JSON:', err.message);
    list = dedupeItems(curatedData.items || []);
    if (module && module !== 'ALL') {
      list = list.filter((i) => (i.module || '').toUpperCase() === module.toUpperCase());
    }
  }

  if (category && category !== 'ALL') {
    list = list.filter((i) => (i.category || '').toLowerCase() === category.toLowerCase());
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (i) =>
        (i.title || '').toLowerCase().includes(q) ||
        (i.subtitle || '').toLowerCase().includes(q) ||
        (i.oneline || '').toLowerCase().includes(q) ||
        (i.aliases || []).some((a) => a.toLowerCase().includes(q)) ||
        (i.places || []).some(
          (p) => (p.name || p.n || '').toLowerCase().includes(q) || (p.state || p.st || '').toLowerCase().includes(q)
        )
    );
  }

  // Sort: Starters first, then sortOrder
  list.sort((a, b) => {
    if (a.isStarter && !b.isStarter) return -1;
    if (!a.isStarter && b.isStarter) return 1;
    return (a.sortOrder || 100) - (b.sortOrder || 100);
  });

  return {
    total: list.length,
    items: list,
    networks: dynamicNetworks,
    news: dynamicNews,
  };
}

/**
 * Idempotently ingests JSON or JSONL content into Environment Atlas (PostgreSQL)
 */
export async function ingestEnvAtlasJsonl(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { success: false, inserted: 0, updated: 0, errors: ['Empty input'] };
  }

  let records = [];
  const trimmed = rawText.trim();
  const errors = [];

  // 1. Try parsing as a standard JSON object or JSON array first (supports multi-line formatted JSON)
  let parsedJson = false;
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        records = parsed;
        parsedJson = true;
      } else if (parsed && typeof parsed === 'object') {
        records = [parsed];
        parsedJson = true;
      }
    } catch (e) {
      // Not a single valid JSON block (might be JSONL with multiple lines)
    }
  }

  // 2. If not a single JSON block, parse as JSONL (one JSON object per line)
  if (!parsedJson) {
    const lines = trimmed.split(/\r?\n/);
    lines.forEach((l, idx) => {
      const c = l.trim();
      if (!c) return;
      try {
        records.push(JSON.parse(c));
      } catch (err) {
        errors.push(`Line ${idx + 1}: ${err.message}`);
      }
    });
  }

  let inserted = 0;
  let updated = 0;

  for (const raw of records) {
    // Support all naming variations (11-point Prelims format, camelCase, snake_case, or exact header strings)
    const title =
      raw.specie ||
      raw.species ||
      raw['Specie'] ||
      raw['Species'] ||
      raw.speciesName ||
      raw.title ||
      raw.name ||
      '';

    const slug =
      raw.slug ||
      title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const subtitle =
      raw.scientificName ||
      raw['Scientific Name'] ||
      raw.scientific_name ||
      raw.subtitle ||
      '';

    // 3. Habitat & Ecological Role
    const habitatType =
      raw.habitatAndEcologicalRole ||
      raw['Habitat & Ecological Role'] ||
      raw.habitat_and_ecological_role ||
      raw.habitatRole ||
      raw.habitatType ||
      raw['Habitat Type'] ||
      raw.habitat_type ||
      raw.habitat ||
      '';

    // 9. Behaviour & Diet
    const behaviour =
      raw.behaviourAndDiet ||
      raw['Behaviour & Diet'] ||
      raw.behaviour_and_diet ||
      raw.behavior_and_diet ||
      raw.behaviour ||
      raw.behavior ||
      raw['Behaviour'] ||
      raw.ecology ||
      raw.diet ||
      '';

    // 4. Distribution & Endemism (Found In)
    let places = [];
    let detectedEndemic = raw.endemic;
    let distributionText = '';

    const foundInSource =
      raw.distributionAndEndemism ||
      raw['Distribution & Endemism'] ||
      raw.distribution_and_endemism ||
      raw.distribution ||
      raw.foundIn ||
      raw['Found in'] ||
      raw.found_in ||
      raw.places;

    if (foundInSource && typeof foundInSource === 'object' && !Array.isArray(foundInSource)) {
      if (foundInSource.places && Array.isArray(foundInSource.places)) {
        places = foundInSource.places;
      }
      if (foundInSource.endemic !== undefined) {
        detectedEndemic = Boolean(foundInSource.endemic);
      }
      if (foundInSource.rangeLimits || foundInSource.notes) {
        distributionText = foundInSource.rangeLimits || foundInSource.notes;
      }
    } else if (Array.isArray(foundInSource)) {
      places = foundInSource.map((p) => {
        if (typeof p === 'string') return { name: p, state: '', lat: null, lon: null };
        return {
          name: p.name || p.n || p.place || '',
          state: p.state || p.st || '',
          lat: typeof p.lat === 'number' ? p.lat : null,
          lon: typeof p.lon === 'number' ? p.lon : (typeof p.lng === 'number' ? p.lng : null),
          note: p.note || ''
        };
      });
    } else if (typeof foundInSource === 'string') {
      distributionText = foundInSource;
      if (/endemic\s*:\s*(yes|true)/i.test(foundInSource)) detectedEndemic = true;
      if (/endemic\s*:\s*(no|false)/i.test(foundInSource)) detectedEndemic = false;
      places = foundInSource.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean).map((s) => ({
        name: s, state: '', lat: null, lon: null
      }));
    }

    // 5. IUCN Status
    const rawBadges = raw.statusBadges || {};
    const rawIucn =
      raw.iucnStatus ||
      raw['IUCN Status'] ||
      raw['IUCN'] ||
      raw.iucn ||
      rawBadges.iucn ||
      'LC';
    const iucn = String(rawIucn).trim().toUpperCase();

    // 6. WPA, 1972
    const wpa =
      raw['WPA, 1972'] ||
      raw['WPA 1972'] ||
      raw['WPA'] ||
      raw.wpa1972 ||
      raw.wpa_1972 ||
      raw.wpa ||
      rawBadges.wpa ||
      'Schedule I';

    // 7. CITES & CMS
    const rawCitesCms =
      raw['CITES & CMS'] ||
      raw.citesAndCms ||
      raw.cites_cms ||
      raw['CITES'] ||
      raw.cites ||
      rawBadges.cites ||
      'Appendix I';

    let cites = 'Appendix I';
    let cms = raw.cms || raw['CMS'] || rawBadges.cms || null;

    if (typeof rawCitesCms === 'object' && rawCitesCms !== null) {
      cites = rawCitesCms.cites || 'Appendix I';
      cms = rawCitesCms.cms || cms;
    } else if (typeof rawCitesCms === 'string') {
      const citesMatch = rawCitesCms.match(/CITES:?\s*([A-Za-z0-9\s]+?)(?=\s*\||\s*$)/i);
      const cmsMatch = rawCitesCms.match(/CMS:?\s*([A-Za-z0-9\s/]+?)(?=\s*\||\s*$)/i);
      if (citesMatch) cites = citesMatch[1].trim();
      else cites = rawCitesCms;
      if (cmsMatch) {
        const val = cmsMatch[1].trim();
        cms = /^(n\/?a|none|nil|-)$/i.test(val) ? null : val;
      }
    }

    const statusBadges = {
      ...rawBadges,
      iucn,
      wpa,
      cites,
      cms,
      endemic: detectedEndemic !== undefined ? detectedEndemic : (rawBadges.endemic || false)
    };

    // 8. Unique Features
    let uniqueFeatures =
      raw['Unique Features'] ||
      raw.uniqueFeatures ||
      raw.unique_features ||
      raw.rememberBullets ||
      [];
    if (typeof uniqueFeatures === 'string') {
      uniqueFeatures = uniqueFeatures
        .split('\n')
        .map((s) => s.replace(/^[-*•\d.]+\s*/, '').trim())
        .filter(Boolean);
    }

    // 10. In News & Conservation Schemes
    let newsTriggers = Array.isArray(raw.newsTriggers) ? raw.newsTriggers : [];
    const inNewsRaw =
      raw['In News & Conservation Schemes'] ||
      raw.inNewsAndConservationSchemes ||
      raw.in_news_and_conservation_schemes ||
      raw['In News'] ||
      raw.inNews ||
      raw.in_news ||
      raw.conservationSchemes;

    if (inNewsRaw) {
      if (typeof inNewsRaw === 'string') {
        newsTriggers = [{ tag: 'News & Schemes', date: '2024-25', what: inNewsRaw, whyItMatters: '' }, ...newsTriggers];
      } else if (Array.isArray(inNewsRaw)) {
        newsTriggers = [...inNewsRaw, ...newsTriggers];
      }
    }

    // 11. PYQ Reference
    let similarPYQ = normalizeArray(raw.similarPYQ);
    const pyqRaw =
      raw['PYQ Reference'] ||
      raw.pyqReference ||
      raw.pyq_reference ||
      raw['PYQ'] ||
      raw.pyq ||
      raw.pyqs;

    if (pyqRaw) {
      if (typeof pyqRaw === 'string') {
        similarPYQ = [pyqRaw, ...similarPYQ];
      } else if (Array.isArray(pyqRaw)) {
        similarPYQ = [...pyqRaw, ...similarPYQ];
      }
    }

    if (!slug || !title) {
      errors.push(`Missing slug/species name for item: ${JSON.stringify(raw)}`);
      continue;
    }

    await ensureCuratedSeeded();

    const existingRow = await prisma.envAtlasItem.findFirst({
      where: {
        OR: [
          { slug },
          { title: { equals: title.trim(), mode: 'insensitive' } },
        ],
      },
    });

    const finalSlug = existingRow ? existingRow.slug : slug;

    const formatted = {
      envId: raw.envId || existingRow?.envId || `ENV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      slug: finalSlug,
      module: raw.module || 'SPECIES',
      category: raw.category || 'Mammals',
      title,
      subtitle: subtitle || null,
      habitatType: habitatType || null,
      behaviour: behaviour || null,
      distributionText: distributionText || null,
      uniqueFeatures,
      traps: raw.traps !== undefined ? normalizeArray(raw.traps) : undefined,
      facts: raw.facts !== undefined ? normalizeArray(raw.facts) : undefined,
      idmarks: raw.idmarks !== undefined ? normalizeArray(raw.idmarks) : undefined,
      programmes: raw.programmes !== undefined ? normalizeArray(raw.programmes) : undefined,
      headlineStat: raw.headlineStat,
      credit: raw.credit || raw.imageCredit,
      aliases: normalizeArray(raw.aliases),
      oneline: raw.oneline || habitatType || '',
      priority: raw.priority || 'High',
      isStarter: Boolean(raw.isStarter),
      startWith: raw.startWith !== undefined ? Boolean(raw.startWith) : Boolean(raw.isStarter),
      sortOrder: Number(raw.sortOrder) || 100,
      wikiTitle: raw.wikiTitle || title.replace(/\s+/g, '_'),
      imageUrl: raw.imageUrl || null,
      imageCredit: raw.imageCredit || raw.credit || null,
      rememberBullets: uniqueFeatures.length > 0 ? uniqueFeatures : (Array.isArray(raw.rememberBullets) ? raw.rememberBullets : []),
      confusionTrap: raw.confusionTrap || null,
      confusedWith: normalizeArray(raw.confusedWith),
      statusBadges,
      regionScope: raw.regionScope || 'India',
      states: normalizeArray(raw.states),
      lat: typeof raw.lat === 'number' ? raw.lat : null,
      lng: typeof raw.lng === 'number' ? raw.lng : null,
      networkKey: raw.networkKey || null,
      places,
      relatedSlugs: normalizeArray(raw.relatedSlugs),
      similarPYQ,
      newsTriggers,
    };

    if (existingRow) {
      const merged = {
        ...formatted,
        aliases: normalizeArray([...(existingRow.aliases || []), ...formatted.aliases]),
        similarPYQ: normalizeArray([...(existingRow.similarPYQ || []), ...formatted.similarPYQ]),
        newsTriggers: [
          ...(formatted.newsTriggers || []),
          ...(Array.isArray(existingRow.newsTriggers) ? existingRow.newsTriggers : []),
        ],
      };
      const fields = buildPrismaFields(merged, existingRow);
      await prisma.envAtlasItem.update({
        where: { id: existingRow.id },
        data: fields,
      });
      updated++;
    } else {
      const fields = buildPrismaFields(formatted);
      await prisma.envAtlasItem.create({
        data: fields,
      });
      inserted++;
    }
  }

  const totalCount = await prisma.envAtlasItem.count();

  return {
    success: errors.length === 0,
    inserted,
    updated,
    totalCount,
    errors,
  };
}

/**
 * Creates or updates a single Environment Atlas item from the Admin editor
 */
export async function upsertEnvAtlasItem(raw) {
  if (!raw || !raw.title || !String(raw.title).trim()) {
    return { success: false, error: 'Title is required' };
  }

  await ensureCuratedSeeded();

  const title = String(raw.title).trim();
  const slug = (
    raw.slug ||
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  ).trim();

  if (!slug) {
    return { success: false, error: 'Valid slug is required' };
  }

  const existingRow = await prisma.envAtlasItem.findUnique({ where: { slug } });
  const fields = buildPrismaFields({ ...raw, title, slug }, existingRow);

  const saved = existingRow
    ? await prisma.envAtlasItem.update({ where: { slug }, data: fields })
    : await prisma.envAtlasItem.create({ data: fields });

  return {
    success: true,
    isNew: !existingRow,
    item: rowToAtlasItem(saved),
  };
}

/**
 * Deletes an Environment Atlas item by slug from PostgreSQL
 */
export async function deleteEnvAtlasItem(slug) {
  if (!slug) return { success: false, error: 'Slug is required' };
  await ensureCuratedSeeded();
  const existing = await prisma.envAtlasItem.findUnique({ where: { slug } });
  if (!existing) {
    return { success: false, error: `Item with slug "${slug}" not found` };
  }
  await prisma.envAtlasItem.delete({ where: { slug } });
  const remaining = await prisma.envAtlasItem.count();
  return { success: true, deleted: rowToAtlasItem(existing), remaining };
}

