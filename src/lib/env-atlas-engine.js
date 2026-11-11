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

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const arr = JSON.parse(trimmed);
      if (Array.isArray(arr)) records = arr;
    } catch (e) {
      errors.push(`Invalid JSON Array: ${e.message}`);
    }
  } else {
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
    // Support 11-point format aliases
    const title = raw.specie || raw.species || raw.speciesName || raw.title || raw.name || '';
    const slug = raw.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const subtitle = raw.scientificName || raw.scientific_name || raw.subtitle || '';
    const habitatType = raw.habitatType || raw.habitat_type || raw.habitat || '';
    const behaviour = raw.behaviour || raw.behavior || raw.ecology || '';

    // Normalize Places / Found In
    let places = [];
    const foundInSource = raw.foundIn || raw.found_in || raw.places;
    if (Array.isArray(foundInSource)) {
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
      places = foundInSource.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean).map((s) => ({
        name: s, state: '', lat: null, lon: null
      }));
    }

    // Normalize Status Badges (IUCN, WPA 1972, CITES)
    const rawBadges = raw.statusBadges || {};
    const statusBadges = {
      ...rawBadges,
      iucn: (raw.iucn || rawBadges.iucn || 'LC').toUpperCase(),
      wpa: raw.wpa1972 || raw.wpa || raw.wpa_1972 || rawBadges.wpa || 'Schedule I',
      cites: raw.cites || rawBadges.cites || 'Appendix I',
      endemic: raw.endemic !== undefined ? raw.endemic : (rawBadges.endemic || false)
    };

    // Normalize Unique Features / Remember Bullets
    let uniqueFeatures = raw.uniqueFeatures || raw.unique_features || raw.rememberBullets || [];
    if (typeof uniqueFeatures === 'string') {
      uniqueFeatures = uniqueFeatures.split('\n').map((s) => s.replace(/^[-*•\d.]+\s*/, '').trim()).filter(Boolean);
    }

    // Normalize In News / News Triggers
    let newsTriggers = Array.isArray(raw.newsTriggers) ? raw.newsTriggers : [];
    const inNewsRaw = raw.inNews || raw.in_news;
    if (inNewsRaw) {
      if (typeof inNewsRaw === 'string') {
        newsTriggers = [{ tag: 'Recent News', date: '2024-25', what: inNewsRaw, whyItMatters: '' }, ...newsTriggers];
      } else if (Array.isArray(inNewsRaw)) {
        newsTriggers = [...inNewsRaw, ...newsTriggers];
      }
    }

    // Normalize PYQ
    let similarPYQ = normalizeArray(raw.similarPYQ);
    const pyqRaw = raw.pyq || raw.pyqs;
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

