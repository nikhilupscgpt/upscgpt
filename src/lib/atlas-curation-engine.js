import { prisma, withRetry } from './prisma.js';

/**
 * Calculates Great-Circle distance between two coordinates in kilometers (Haversine formula).
 */
export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return Infinity;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Common geographic features and basin keywords used to detect logical clusters.
 */
/**
 * High-precision sub-regional and corridor keywords.
 * Macro rivers (Ganga, Brahmaputra) are handled with secondary proximity/state constraints.
 */
const SPECIFIC_CORRIDORS = [
  'burhi dihing',
  'kaziranga',
  'karbi anglong',
  'siliguri corridor',
  'sehore',
  'bherunda',
  'saru maru',
  'vindhya',
  'satpura',
  'chotanagpur',
  'malwa',
  'kumaon',
  'garo hills',
  'khasi',
  'western ghats',
  'nilgiri',
  'cardamom hills',
  'bab-el-mandeb',
  'strait of hormuz',
  'persian gulf',
  'crete',
  'souda bay',
  'sahel',
  'gaza',
  'donbas',
  'zaporizhzhia',
  'taiwan strait',
  'malacca',
  'chao phraya',
  'kamchatka',
  'lakshadweep',
  'amindivi',
  'minicoy',
  'andaman',
  'nicobar',
];

const MACRO_BASINS = ['ganga', 'brahmaputra', 'narmada', 'godavari', 'krishna', 'kaveri', 'red sea', 'baltic'];

function extractCorridors(text) {
  if (!text) return new Set();
  const lower = String(text).toLowerCase();
  const found = new Set();
  for (const kw of SPECIFIC_CORRIDORS) {
    if (lower.includes(kw)) {
      found.add(kw);
    }
  }
  return found;
}

function extractMacroBasins(text) {
  if (!text) return new Set();
  const lower = String(text).toLowerCase();
  const found = new Set();
  for (const kw of MACRO_BASINS) {
    if (lower.includes(kw)) {
      found.add(kw);
    }
  }
  return found;
}

/**
 * Finds candidate clusters among active (non-archived) pins.
 * Groups pins by:
 * 1. Physical proximity <= maxDistanceKm (default: 75 km).
 * 2. Shared geographic anchor tokens in placeLine, neighbours, or staticFacts.
 */
export async function findCandidateClusters(options = {}) {
  const maxDistanceKm = options.maxDistanceKm || 75;

  const pins = await withRetry(() =>
    prisma.placeInNews.findMany({
      where: {
        tier: { not: 'archived' },
        parentId: null, // Only top-level active pins
      },
      orderBy: [{ date: 'desc' }, { place: 'asc' }],
    })
  );

  const clusters = [];
  const visited = new Set();

  for (let i = 0; i < pins.length; i++) {
    const pinA = pins[i];
    if (visited.has(pinA.id)) continue;

    const clusterMembers = [pinA];
    const latA = pinA.lat ?? pinA.coordinates?.lat;
    const lngA = pinA.lng ?? pinA.coordinates?.lng;

    const fullTextA = [
      pinA.place,
      pinA.locatedIn?.placeLine || '',
      pinA.locatedIn?.stateOrProvince || '',
      (pinA.neighbours || []).join(' '),
      (pinA.staticFacts || []).join(' '),
    ].join(' ');

    const corridorsA = extractCorridors(fullTextA);
    const macroBasinsA = extractMacroBasins(fullTextA);
    const stateA = (pinA.locatedIn?.stateOrProvince || '').trim().toLowerCase();

    for (let j = i + 1; j < pins.length; j++) {
      const pinB = pins[j];
      if (visited.has(pinB.id)) continue;

      let isMatch = false;
      let matchReason = '';

      const latB = pinB.lat ?? pinB.coordinates?.lat;
      const lngB = pinB.lng ?? pinB.coordinates?.lng;
      let dist = Infinity;
      if (latA != null && lngA != null && latB != null && lngB != null) {
        dist = haversineDistanceKm(latA, lngA, latB, lngB);
      }

      // Check 1: Geographic proximity (default <= 75 km)
      if (dist <= maxDistanceKm) {
        isMatch = true;
        matchReason = `Spatial proximity: ~${Math.round(dist)} km apart`;
      }

      const fullTextB = [
        pinB.place,
        pinB.locatedIn?.placeLine || '',
        pinB.locatedIn?.stateOrProvince || '',
        (pinB.neighbours || []).join(' '),
        (pinB.staticFacts || []).join(' '),
      ].join(' ');

      // Check 2: Specific high-precision corridor match
      if (!isMatch && corridorsA.size > 0) {
        const corridorsB = extractCorridors(fullTextB);
        for (const c of corridorsA) {
          if (corridorsB.has(c)) {
            isMatch = true;
            matchReason = `Shared specific corridor: "${c.toUpperCase()}"`;
            break;
          }
        }
      }

      // Check 3: Macro basin match ONLY IF within same state or <= 150 km
      if (!isMatch && macroBasinsA.size > 0) {
        const macroBasinsB = extractMacroBasins(fullTextB);
        const stateB = (pinB.locatedIn?.stateOrProvince || '').trim().toLowerCase();
        for (const mb of macroBasinsA) {
          if (macroBasinsB.has(mb)) {
            if ((stateA && stateB && stateA === stateB) || dist <= 150) {
              isMatch = true;
              matchReason = `Same state & sub-basin: "${mb.toUpperCase()}" (~${Math.round(dist)} km)`;
              break;
            }
          }
        }
      }

      if (isMatch) {
        clusterMembers.push({ ...pinB, matchReason });
        visited.add(pinB.id);
      }
    }

    if (clusterMembers.length > 1) {
      visited.add(pinA.id);
      clusters.push({
        clusterId: `cluster-${pinA.id}`,
        primaryPin: pinA,
        members: clusterMembers,
        reasons: clusterMembers.slice(1).map((m) => m.matchReason || 'Close proximity'),
      });
    }
  }

  return clusters;
}

/**
 * Merges one or more child pins into a parent Master Anchor pin.
 */
export async function mergePins({ parentId, childIds, newPlaceTitle, newPlaceLine, mergeNotes }) {
  if (!parentId || !Array.isArray(childIds) || childIds.length === 0) {
    throw new Error('parentId and childIds array are required for merge');
  }

  const [parent, children] = await Promise.all([
    withRetry(() => prisma.placeInNews.findUnique({ where: { id: parentId } })),
    withRetry(() => prisma.placeInNews.findMany({ where: { id: { in: childIds } } })),
  ]);

  if (!parent) throw new Error(`Parent pin with id ${parentId} not found`);

  // 1. Combine News Triggers (deduplicating by hook/date)
  const existingTriggers = Array.isArray(parent.newsTriggers) ? [...parent.newsTriggers] : [];
  const seenHooks = new Set(existingTriggers.map((t) => (t.newsHook || '').toLowerCase().trim()));

  for (const child of children) {
    const childTriggers = Array.isArray(child.newsTriggers) ? child.newsTriggers : [];
    for (const t of childTriggers) {
      const hookKey = (t.newsHook || '').toLowerCase().trim();
      if (hookKey && !seenHooks.has(hookKey)) {
        seenHooks.add(hookKey);
        existingTriggers.push(t);
      }
    }
  }

  // 2. Combine Static Facts (deduplicating by prefix/content)
  const existingFacts = Array.isArray(parent.staticFacts) ? [...parent.staticFacts] : [];
  const seenFacts = new Set(existingFacts.map((f) => f.toLowerCase().slice(0, 40)));

  for (const child of children) {
    for (const fact of child.staticFacts || []) {
      const factKey = fact.toLowerCase().slice(0, 40);
      if (!seenFacts.has(factKey)) {
        seenFacts.add(factKey);
        existingFacts.push(fact);
      }
    }
  }

  // 3. Combine Similar PYQ IDs
  const combinedPyqs = Array.from(
    new Set([...(parent.similarPYQ || []), ...children.flatMap((c) => c.similarPYQ || [])])
  );

  // 4. Combine Aliases
  const combinedAliases = Array.from(
    new Set([
      ...(parent.aliases || []),
      parent.place,
      ...children.flatMap((c) => [c.place, ...(c.aliases || [])]),
    ])
  ).filter((a) => a && a !== newPlaceTitle);

  // 5. Update Parent
  const updatedLocatedIn = {
    ...(typeof parent.locatedIn === 'object' && parent.locatedIn ? parent.locatedIn : {}),
    ...(newPlaceLine ? { placeLine: newPlaceLine } : {}),
  };

  const nextMergeNotes = [
    parent.mergeNotes || '',
    `Merged with [${children.map((c) => c.place).join(', ')}] on ${new Date().toISOString().split('T')[0]}: ${mergeNotes || 'Clustered anchor'}`,
  ]
    .filter(Boolean)
    .join('\n');

  await withRetry(() =>
    prisma.placeInNews.update({
      where: { id: parent.id },
      data: {
        place: newPlaceTitle || parent.place,
        aliases: combinedAliases,
        locatedIn: updatedLocatedIn,
        newsTriggers: existingTriggers,
        staticFacts: existingFacts.slice(0, 4), // Keep top 3-4 clean facts
        similarPYQ: combinedPyqs,
        tier: 'master', // Parent elevated to master
        isCurated: true,
        curatedAt: new Date(),
        mergeNotes: nextMergeNotes,
      },
    })
  );

  // 6. Update Children: link to parent and set tier to archived
  await withRetry(() =>
    prisma.placeInNews.updateMany({
      where: { id: { in: childIds } },
      data: {
        parentId: parent.id,
        tier: 'archived',
        isCurated: true,
        curatedAt: new Date(),
        mergeNotes: `Merged into parent ${parent.place} (${parent.id})`,
      },
    })
  );

  return { success: true, parentId: parent.id, mergedChildrenCount: children.length };
}

/**
 * Returns curation status counts across the database.
 */
export async function getCurationStatus() {
  const [total, masterCount, dailyCount, archivedCount, uncuratedCount] = await Promise.all([
    withRetry(() => prisma.placeInNews.count()),
    withRetry(() => prisma.placeInNews.count({ where: { tier: 'master' } })),
    withRetry(() => prisma.placeInNews.count({ where: { tier: 'daily', parentId: null } })),
    withRetry(() => prisma.placeInNews.count({ where: { tier: 'archived' } })),
    withRetry(() => prisma.placeInNews.count({ where: { isCurated: false, parentId: null } })),
  ]);

  const candidateClusters = await findCandidateClusters();

  return {
    total,
    masterCount,
    dailyCount,
    archivedCount,
    uncuratedCount,
    candidateClustersCount: candidateClusters.length,
    candidateClusters,
  };
}

/**
 * Gets pins for weekly clearing, historical backlog, or uncurated batches.
 * Supports:
 * - Number (daysBack, e.g. 7, 30, 90, 365)
 * - Object: { daysBack, uncuratedOnly, allTime, month }
 */
export async function getWeeklyBatch(options = 7) {
  const where = { parentId: null };

  let uncuratedOnly = false;
  let allTime = false;
  let daysBack = null;
  let month = null;

  if (typeof options === 'number') {
    daysBack = options;
  } else if (typeof options === 'object' && options !== null) {
    uncuratedOnly = !!options.uncuratedOnly;
    allTime = !!options.allTime;
    daysBack = options.daysBack != null ? Number(options.daysBack) : null;
    month = options.month || null;
  }

  if (uncuratedOnly) {
    where.isCurated = false;
  } else if (month) {
    where.date = { startsWith: month };
  } else if (!allTime && daysBack && daysBack > 0) {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - daysBack);
    where.date = { gte: sinceDate.toISOString().split('T')[0] };
  }

  const pins = await withRetry(() =>
    prisma.placeInNews.findMany({
      where,
      orderBy: [{ date: 'desc' }, { place: 'asc' }],
    })
  );

  return {
    filterApplied: { uncuratedOnly, allTime, daysBack, month },
    count: pins.length,
    pins,
  };
}

/**
 * Sets tier and curated status for a list of pin IDs.
 */
export async function updatePinTiers(pinIds, tier, isCurated = true) {
  if (!Array.isArray(pinIds) || pinIds.length === 0) return { count: 0 };
  const res = await withRetry(() =>
    prisma.placeInNews.updateMany({
      where: { id: { in: pinIds } },
      data: {
        tier,
        isCurated,
        curatedAt: new Date(),
      },
    })
  );
  return res;
}
