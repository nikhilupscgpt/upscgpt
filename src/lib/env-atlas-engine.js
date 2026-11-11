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
 * In-memory fallback and store for Environment Atlas items
 */
let dynamicItems = [...curatedData.items];
let dynamicNews = [...curatedData.news];
let dynamicNetworks = { ...curatedData.networks };

/**
 * Fetches all Environment Atlas items for a given module/category with optional search filter
 */
export async function getEnvAtlasItems({ module = 'SPECIES', category = 'ALL', search = '' } = {}) {
  let list = dynamicItems;

  if (module && module !== 'ALL') {
    list = list.filter((i) => (i.module || '').toUpperCase() === module.toUpperCase());
  }

  if (category && category !== 'ALL') {
    list = list.filter((i) => (i.category || '').toLowerCase() === category.toLowerCase());
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter((i) =>
      (i.title || '').toLowerCase().includes(q) ||
      (i.subtitle || '').toLowerCase().includes(q) ||
      (i.oneline || '').toLowerCase().includes(q) ||
      (i.aliases || []).some((a) => a.toLowerCase().includes(q)) ||
      (i.places || []).some((p) => (p.name || '').toLowerCase().includes(q) || (p.state || '').toLowerCase().includes(q))
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
 * Idempotently ingests JSON or JSONL content into Environment Atlas
 */
export function ingestEnvAtlasJsonl(rawText) {
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

    const existingIndex = dynamicItems.findIndex((i) => i.slug === slug);

    const formatted = {
      id: raw.id || `ENV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      envId: raw.envId || raw.id || `ENV-${Date.now()}`,
      slug,
      module: raw.module || 'SPECIES',
      category: raw.category || 'Mammals',
      title,
      subtitle: subtitle || null,
      habitatType: habitatType || null,
      behaviour: behaviour || null,
      distributionText: distributionText || null,
      uniqueFeatures,
      aliases: normalizeArray(raw.aliases),
      oneline: raw.oneline || habitatType || '',
      priority: raw.priority || 'High',
      isStarter: !!raw.isStarter,
      sortOrder: Number(raw.sortOrder) || 100,
      wikiTitle: raw.wikiTitle || title.replace(/\s+/g, '_'),
      imageUrl: raw.imageUrl || null,
      imageCredit: raw.imageCredit || null,
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
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      // Merge updates
      const old = dynamicItems[existingIndex];
      dynamicItems[existingIndex] = {
        ...old,
        ...formatted,
        // preserve & merge arrays
        aliases: normalizeArray([...old.aliases, ...formatted.aliases]),
        similarPYQ: normalizeArray([...old.similarPYQ, ...formatted.similarPYQ]),
        newsTriggers: [...(formatted.newsTriggers || []), ...(old.newsTriggers || [])],
      };
      updated++;
    } else {
      dynamicItems.push(formatted);
      inserted++;
    }
  }

  return {
    success: errors.length === 0,
    inserted,
    updated,
    totalCount: dynamicItems.length,
    errors,
  };
}

/**
 * Deletes an Environment Atlas item by slug
 */
export function deleteEnvAtlasItem(slug) {
  if (!slug) return { success: false, error: 'Slug is required' };
  const idx = dynamicItems.findIndex((i) => i.slug === slug);
  if (idx >= 0) {
    const deleted = dynamicItems.splice(idx, 1);
    return { success: true, deleted: deleted[0], remaining: dynamicItems.length };
  }
  return { success: false, error: `Item with slug "${slug}" not found` };
}

