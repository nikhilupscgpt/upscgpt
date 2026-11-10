/**
 * Builds the on-demand map layers for one river's study panel:
 * tributaries (lines), sangams, dams, parks and cities (numbered pins).
 *
 * Text comes from the river's `riverDetails` notes. Geometry comes from:
 *  - rivers already drawn in the atlas (most detailed, preferred),
 *  - TRIBUTARY_LINES (OpenStreetMap centre-lines for the deep-coverage rivers),
 *  - RIVER_POINTS (verified locations for dams, parks, towns and sangams).
 * Anything without verified geometry stays text-only.
 */
import { TRIBUTARY_LINES } from '@/lib/river-layers/tributaryLines';
import { RIVER_POINTS } from '@/lib/river-layers/riverPoints';

/** A tributary name that stands for several rivers drawn on the map. */
const GROUP_ALIASES = {
  panjnad: ['jhelum', 'chenab', 'ravi', 'beas', 'sutlej'],
};

/** Name keys used to match a river name: "Tamsa (Tons) River" → ['tamsa', 'tons']. */
export function riverNameKeys(name) {
  if (!name) return [];
  const s = String(name).toLowerCase();
  const clean = (x) =>
    x
      .replace(/\b(rivers?|nadi|basin|system)\b/g, ' ')
      .replace(/[^a-z\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  const keys = new Set([clean(s.replace(/\(.*?\)/g, ' '))]);
  for (const m of s.matchAll(/\(([^)]*)\)/g)) keys.add(clean(m[1]));
  keys.delete('');
  return [...keys];
}

/** "Warna and Panchganga Rivers" → ['Warna', 'Panchganga']; "Tunga + Bhadra" → ['Tunga', 'Bhadra']. */
export function splitRiverNames(name) {
  // Split on "," "+" "and" "&" outside brackets, so "Tamsa (Tons)" keeps its alternate name.
  const parts = [];
  let depth = 0;
  let cur = '';
  const s = String(name || '');
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '(') depth++;
    if (ch === ')') depth = Math.max(0, depth - 1);
    const rest = s.slice(i);
    const sep = depth === 0 ? rest.match(/^(\s*,\s*|\s*\+\s*|\s+and\s+|\s*&\s*)/i) : null;
    if (sep) {
      parts.push(cur);
      cur = '';
      i += sep[0].length - 1;
    } else {
      cur += ch;
    }
  }
  parts.push(cur);
  return parts.map((p) => p.replace(/\b(rivers?)\b/gi, '').trim()).filter(Boolean);
}

/** Flat [lat, lng] list for a node's line (shape, falling back to polylinePoints). */
export function nodeShapePoints(node) {
  const raw =
    Array.isArray(node?.shape) && node.shape.length > 1
      ? node.shape
      : Array.isArray(node?.polylinePoints)
        ? node.polylinePoints
        : [];
  return raw
    .filter((pt) => Array.isArray(pt) && pt.length >= 2)
    .map((pt) => [Number(pt[0]), Number(pt[1])])
    .filter((pt) => Number.isFinite(pt[0]) && Number.isFinite(pt[1]));
}

function sqDist(a, b) {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
}

// About 15 km: further apart than this, the two lines don't really meet on our map.
const MEET_TOLERANCE_SQ = 0.15 ** 2;

/** The point of `line` closest to `main` (where a tributary meets its parent), or null if they never meet. */
function meetingPoint(line, main) {
  if (!line.length || !main.length) return null;
  let best = line[line.length - 1];
  let bestD = Infinity;
  for (const p of line) {
    for (const m of main) {
      const d = sqDist(p, m);
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
  }
  return bestD <= MEET_TOLERANCE_SQ ? best : null;
}

/**
 * Lines for one tributary name. `findAtlasNode(key)` returns an atlas river node (or null).
 * Returns { lines: [[lat,lng][]], nodeIds: [] }.
 */
function resolveLines(name, findAtlasNode, excludeId) {
  const lines = [];
  const nodeIds = [];
  for (const part of splitRiverNames(name)) {
    const keys = riverNameKeys(part);
    const expanded = keys.flatMap((k) => GROUP_ALIASES[k] || [k]);
    const isGroup = expanded.length > keys.length;
    for (const k of isGroup ? expanded : keys) {
      const node = findAtlasNode ? findAtlasNode(k) : null;
      if (node && node.id !== excludeId) {
        const pts = nodeShapePoints(node);
        if (pts.length > 1) {
          lines.push(pts);
          nodeIds.push(node.id);
          if (!isGroup) break;
          continue;
        }
      }
      const osm = TRIBUTARY_LINES[k];
      if (osm && Array.isArray(osm.points) && osm.points.length > 1) {
        lines.push(osm.points);
        if (!isGroup) break;
      }
    }
  }
  return { lines, nodeIds };
}

/** Halfway along a line (by distance): where a river's name reads best. */
function midpointAlong(line) {
  if (line.length < 2) return line[0] || null;
  let total = 0;
  const seg = [];
  for (let i = 1; i < line.length; i++) {
    const d = Math.sqrt(sqDist(line[i], line[i - 1]));
    seg.push(d);
    total += d;
  }
  let target = total / 2;
  for (let i = 0; i < seg.length; i++) {
    if (target <= seg[i] && seg[i] > 0) {
      const t = target / seg[i];
      return [line[i][0] + (line[i + 1][0] - line[i][0]) * t, line[i][1] + (line[i + 1][1] - line[i][1]) * t];
    }
    target -= seg[i];
  }
  return line[line.length - 1];
}

function lineLength(line) {
  let total = 0;
  for (let i = 1; i < line.length; i++) total += Math.sqrt(sqDist(line[i], line[i - 1]));
  return total;
}

/** Colours for comparing picked tributaries (colour-blind-safe, distinct from the blue river and bank colours). */
export const PICK_COLORS = ['#D55E00', '#CC79A7', '#E69F00', '#0F766E'];
export const MAX_PICKS = 4;

/** One-tap groups for common exam comparisons, by river node id. Names must match the notes. */
export const TRIBUTARY_GROUPS = {
  'IND-RIV-05': [{ label: 'Pranhita system', names: ['Pranhita', 'Wainganga', 'Wardha', 'Penganga'] }],
  'IND-RIV-08': [
    { label: 'Western Ghats feeders', names: ['Venna', 'Koyna', 'Warna', 'Panchganga', 'Dudhganga', 'Ghataprabha', 'Malaprabha'] },
  ],
};

const POINT_CATEGORIES = [
  { id: 'dams', source: 'dams', title: (x) => x.name, sub: (x) => x.type, tag: (x) => x.state },
  { id: 'parks', source: 'protectedAreas', title: (x) => x.name, sub: (x) => x.relation, tag: (x) => x.state },
  {
    id: 'towns',
    source: 'towns',
    title: (x) => x.name,
    sub: (x) => [x.type, x.significance].filter(Boolean).join(' · '),
    tag: (x) => x.state,
  },
];

/**
 * @param {object} river          selected atlas node with riverDetails
 * @param {(key:string)=>object}  findAtlasNode  lookup of atlas river nodes by name key
 */
export function buildRiverLayers(river, findAtlasNode) {
  const rd = river?.riverDetails;
  if (!rd) return null;
  const main = nodeShapePoints(river);
  const pointsFor = RIVER_POINTS[river.id] || {};

  let sn = 0;
  const sangams = (Array.isArray(rd.confluences) ? rd.confluences : []).map((c, i) => {
    const verified = pointsFor.sangams?.[`${c.tributary} @ ${c.sangam}`] || [];
    const { lines } = resolveLines(c.tributary, findAtlasNode, river.id);
    let pins = verified;
    // Fallback only for "<tributary> joins this river"; a sangam of two other rivers
    // (e.g. "Alaknanda + Dhauliganga") is not where either meets this river.
    if (!pins.length && lines.length === 1 && splitRiverNames(c.tributary).length === 1) {
      const p = meetingPoint(lines[lines.length - 1], main);
      if (p) pins = [{ label: String(c.sangam).split(/[,(]/)[0].trim(), lat: p[0], lng: p[1] }];
    }
    return {
      id: `sangam:${i}`,
      n: pins.length ? ++sn : null,
      title: c.tributary,
      sub: [c.sangam, c.state].filter(Boolean).join(' · '),
      note: c.note || '',
      pins,
      lines,
    };
  });

  const tributaries = [];
  for (const [side, list] of [
    ['left', rd.tributaries?.leftBank || []],
    ['right', rd.tributaries?.rightBank || []],
  ]) {
    for (const t of list) {
      const { lines, nodeIds } = resolveLines(t.name, findAtlasNode, river.id);
      // Pin where it joins: the verified sangam if the notes have one, else where the lines meet.
      const tKeys = new Set(splitRiverNames(t.name).flatMap(riverNameKeys));
      const sangam = sangams.find(
        (sg) => sg.pins.length && splitRiverNames(sg.title).flatMap(riverNameKeys).some((k) => tKeys.has(k))
      );
      const joinPoint = sangam
        ? [sangam.pins[0].lat, sangam.pins[0].lng]
        : lines.length === 1
          ? meetingPoint(lines[0], main)
          : null;
      tributaries.push({
        id: `trib:${side}:${t.name}`,
        name: String(t.name).replace(/\s+Rivers?$/i, ''),
        side,
        note: t.note || '',
        lines,
        nodeIds,
        point: joinPoint,
        // Name position: mid-course of the longest line; for a group (Panjnad) the join point.
        labelAnchor:
          lines.length === 1
            ? midpointAlong(lines[0])
            : joinPoint || (lines.length ? midpointAlong(lines[0]) : null),
        lengthDeg: lines.reduce((m, l) => Math.max(m, lineLength(l)), 0),
      });
    }
  }

  // Quick groups: by bank, plus named systems for this river.
  const groups = [];
  for (const side of ['left', 'right']) {
    const ids = tributaries.filter((t) => t.side === side && t.lines.length).map((t) => t.id);
    if (ids.length >= 2) groups.push({ id: `bank:${side}`, label: side === 'left' ? 'Left bank' : 'Right bank', ids });
  }
  for (const g of TRIBUTARY_GROUPS[river.id] || []) {
    const wanted = new Set(g.names.flatMap(riverNameKeys));
    const ids = tributaries
      .filter((t) => t.lines.length && splitRiverNames(t.name).flatMap(riverNameKeys).some((k) => wanted.has(k)))
      .map((t) => t.id);
    if (ids.length >= 2) groups.push({ id: `group:${g.label}`, label: g.label, ids });
  }

  const out = { tributaries, sangams, groups };
  for (const cat of POINT_CATEGORIES) {
    let n = 0;
    const list = Array.isArray(rd[cat.source]) ? rd[cat.source] : [];
    out[cat.id] = list.map((x, i) => {
      const pins = pointsFor[cat.id]?.[x.name] || [];
      return {
        id: `${cat.id}:${i}`,
        n: pins.length ? ++n : null,
        title: cat.title(x),
        sub: cat.sub(x) || '',
        tag: cat.tag(x) || '',
        pins,
      };
    });
  }
  return out;
}

export const LAYER_META = {
  tributaries: { label: 'Tributaries', icon: '〰️', color: '#7c3aed' },
  sangams: { label: 'Sangams', icon: '◎', color: '#d97706' },
  dams: { label: 'Dams', icon: '▲', color: '#b91c1c' },
  parks: { label: 'Parks', icon: '●', color: '#15803d' },
  towns: { label: 'Cities', icon: '■', color: '#475569' },
};

/** How many items of a category can be shown on the map. */
export function mappableCount(layers, cat) {
  const list = layers?.[cat] || [];
  return cat === 'tributaries'
    ? list.filter((t) => t.lines.length).length
    : list.filter((x) => x.pins.length).length;
}
