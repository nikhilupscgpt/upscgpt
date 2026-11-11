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

  for (const item of records) {
    if (!item.slug || !item.title) {
      errors.push(`Missing slug or title for item: ${JSON.stringify(item)}`);
      continue;
    }

    const existingIndex = dynamicItems.findIndex((i) => i.slug === item.slug);

    const formatted = {
      id: item.id || `ENV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      envId: item.envId || item.id || `ENV-${Date.now()}`,
      slug: item.slug,
      module: item.module || 'SPECIES',
      category: item.category || 'General',
      title: item.title,
      subtitle: item.subtitle || null,
      aliases: normalizeArray(item.aliases),
      oneline: item.oneline || '',
      priority: item.priority || 'High',
      isStarter: !!item.isStarter,
      sortOrder: Number(item.sortOrder) || 100,
      wikiTitle: item.wikiTitle || item.title.replace(/\s+/g, '_'),
      imageUrl: item.imageUrl || null,
      imageCredit: item.imageCredit || null,
      rememberBullets: Array.isArray(item.rememberBullets) ? item.rememberBullets : [],
      confusionTrap: item.confusionTrap || null,
      confusedWith: normalizeArray(item.confusedWith),
      statusBadges: item.statusBadges || {},
      regionScope: item.regionScope || 'India',
      states: normalizeArray(item.states),
      lat: typeof item.lat === 'number' ? item.lat : null,
      lng: typeof item.lng === 'number' ? item.lng : null,
      networkKey: item.networkKey || null,
      places: Array.isArray(item.places) ? item.places : [],
      relatedSlugs: normalizeArray(item.relatedSlugs),
      similarPYQ: normalizeArray(item.similarPYQ),
      newsTriggers: Array.isArray(item.newsTriggers) ? item.newsTriggers : [],
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

