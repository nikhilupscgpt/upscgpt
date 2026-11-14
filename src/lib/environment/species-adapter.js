/**
 * Normalizes raw species records from curated-env-species.json (and future
 * additive entries with PRD §4 fields) into a defensive UI view-model.
 */

const RISK_META = {
  CR: {
    code: 'CR',
    label: 'Critically Endangered (CR)',
    why: 'Extremely high risk of extinction in the wild.',
  },
  EN: {
    code: 'EN',
    label: 'Endangered (EN)',
    why: 'High risk of dying out in the wild.',
  },
  VU: {
    code: 'VU',
    label: 'Vulnerable (VU)',
    why: 'Faces a high risk of extinction in the medium term.',
  },
  NT: {
    code: 'NT',
    label: 'Near Threatened (NT)',
    why: 'Close to qualifying for a threatened category soon.',
  },
  LC: {
    code: 'LC',
    label: 'Least Concern (LC)',
    why: 'Widespread and abundant; low immediate extinction risk.',
  },
  DD: {
    code: 'DD',
    label: 'Data Deficient (DD)',
    why: 'Not enough data to assess extinction risk yet.',
  },
  NE: {
    code: 'NE',
    label: 'Not Evaluated (NE)',
    why: 'Has not yet been assessed against IUCN criteria.',
  },
  EW: {
    code: 'EW',
    label: 'Extinct in the Wild (EW)',
    why: 'Survives only in captivity or outside its natural range.',
  },
  EX: {
    code: 'EX',
    label: 'Extinct (EX)',
    why: 'No reasonable doubt that the last individual has died.',
  },
};

export const IUCN_SCALE_ORDER = [
  { code: 'NE', name: 'Not Evaluated' },
  { code: 'DD', name: 'Data Deficient' },
  { code: 'LC', name: 'Least Concern' },
  { code: 'NT', name: 'Near Threatened' },
  { code: 'VU', name: 'Vulnerable' },
  { code: 'EN', name: 'Endangered' },
  { code: 'CR', name: 'Critically Endangered' },
  { code: 'EW', name: 'Extinct in the Wild' },
  { code: 'EX', name: 'Extinct' },
];

const LAW_EXPLANATIONS = {
  'Schedule I': 'Highest protection in India. Hunting or trading it is a serious crime.',
  'Schedule II': 'High legal protection in India; offences carry strict penalties.',
  'Schedule III': 'Protected under Indian law with regulated penalties.',
  'Schedule IV': 'Protected species under the Wildlife (Protection) Act, 1972.',
};

const TRADE_EXPLANATIONS = {
  'Appendix I': 'International commercial trade is banned.',
  'Appendix II': 'International trade is strictly controlled with permits.',
  'Appendix III': 'International trade is monitored with cooperation from range countries.',
  'Not listed': 'Not listed under CITES international trade appendices.',
};

export function normalizeIucnCode(raw) {
  const s = String(raw || '').trim().toUpperCase();
  if (RISK_META[s]) return s;
  if (s.includes('CRIT')) return 'CR';
  if (s.includes('ENDANGER')) return 'EN';
  if (s.includes('VULNER')) return 'VU';
  if (s.includes('NEAR')) return 'NT';
  if (s.includes('LEAST')) return 'LC';
  if (s.includes('DATA')) return 'DD';
  if (s.includes('WILD')) return 'EW';
  if (s === 'EXTINCT') return 'EX';
  return 'EN';
}

/**
 * Splits a string or object into { headline, explanation }.
 */
export function splitPoint(entry, fallbackHeadline = 'Key point') {
  if (!entry) return null;
  if (typeof entry === 'object' && !Array.isArray(entry)) {
    const headline = String(entry.headline || entry.title || entry.text || '').trim();
    const explanation = String(entry.explanation || entry.detail || entry.why || '').trim();
    if (!headline && !explanation) return null;
    return {
      headline: headline || fallbackHeadline,
      explanation: explanation || null,
    };
  }
  const text = String(entry).trim();
  if (!text) return null;

  // Prefer explicit separator ":" or " — " when prefix is concise
  const colonIdx = text.indexOf(': ');
  if (colonIdx > 4 && colonIdx <= 72) {
    return {
      headline: text.slice(0, colonIdx).trim(),
      explanation: text.slice(colonIdx + 2).trim() || null,
    };
  }

  const dashIdx = text.indexOf(' — ');
  if (dashIdx > 4 && dashIdx <= 72) {
    return {
      headline: text.slice(0, dashIdx).trim(),
      explanation: text.slice(dashIdx + 3).trim() || null,
    };
  }

  // Fallback: split first sentence if there's a second sentence
  const periodIdx = text.indexOf('. ');
  if (periodIdx > 8 && periodIdx <= 100 && periodIdx < text.length - 4) {
    return {
      headline: text.slice(0, periodIdx + 1).trim(),
      explanation: text.slice(periodIdx + 2).trim() || null,
    };
  }

  return { headline: text, explanation: null };
}

/**
 * Truncates text cleanly at a word boundary without exceeding maxChars.
 */
export function truncateDescription(text, maxChars = 240) {
  const clean = String(text || '').trim();
  if (clean.length <= maxChars) {
    return { text: clean, isTruncated: false };
  }
  const slice = clean.slice(0, maxChars);
  const lastSpace = slice.lastIndexOf(' ');
  const cut = lastSpace > maxChars * 0.6 ? slice.slice(0, lastSpace) : slice;
  return { text: `${cut.replace(/[.,;:\s]+$/, '')}...`, isTruncated: true };
}

export function adaptSpecies(raw) {
  if (!raw) return null;

  const creditObj = raw.credit || raw.photo?.credit || {};
  const author = String(raw.photo?.author || creditObj.artist || '').trim();
  const licence = String(raw.photo?.licence || raw.photo?.license || creditObj.lic || '').trim();
  const sourceUrl = String(raw.photo?.sourceUrl || creditObj.page || '').trim();
  const url = String(raw.photo?.url || raw.imageUrl || (raw.slug ? `/species/${raw.slug}.webp` : '')).trim();
  const focusX = Number.isFinite(raw.photo?.focusX) ? raw.photo.focusX : 50;
  const focusY = Number.isFinite(raw.photo?.focusY) ? raw.photo.focusY : 50;

  const iucnCode = normalizeIucnCode(raw.statusBadges?.iucn || raw.protection?.iucn);
  const iucnMeta = RISK_META[iucnCode] || RISK_META.EN;

  const wpa = String(raw.statusBadges?.wpa || raw.protection?.wpa || 'Schedule I').trim();
  const cites = String(raw.statusBadges?.cites || raw.protection?.cites || 'Appendix I').trim();

  // Build "What Prelims asks": traps first, then facts/idmarks/programmes/behaviour
  const rawTraps =
    Array.isArray(raw.traps) && raw.traps.length > 0
      ? raw.traps
      : raw.confusionTrap
      ? [raw.confusionTrap]
      : [];

  const traps = rawTraps
    .map((t) => splitPoint(t, 'Common Prelims trap'))
    .filter(Boolean)
    .map((item) => ({ ...item, kind: 'trap' }));

  const rawFacts = [];
  if (Array.isArray(raw.facts)) rawFacts.push(...raw.facts);
  if (Array.isArray(raw.idmarks)) rawFacts.push(...raw.idmarks);
  if (Array.isArray(raw.programmes)) rawFacts.push(...raw.programmes);
  if (raw.behaviour) rawFacts.push(`Ecology & behaviour: ${raw.behaviour}`);

  const seenHeadlines = new Set(traps.map((t) => t.headline.toLowerCase()));
  const facts = [];
  for (const f of rawFacts) {
    const parsed = splitPoint(f, 'Key fact');
    if (!parsed) continue;
    const key = parsed.headline.toLowerCase();
    if (seenHeadlines.has(key)) continue;
    seenHeadlines.add(key);
    facts.push({ ...parsed, kind: 'fact' });
  }

  // Normalize Past UPSC Questions
  const rawPyqs =
    Array.isArray(raw.pastQuestions) && raw.pastQuestions.length > 0
      ? raw.pastQuestions
      : Array.isArray(raw.similarPYQ)
      ? raw.similarPYQ
      : [];

  const pastQuestions = rawPyqs
    .map((q, idx) => {
      if (typeof q === 'string') {
        return {
          id: `${raw.slug || 'sp'}-pyq-${idx}`,
          year: null,
          stem: q.trim(),
          options: null,
          answer: null,
          explanation: null,
        };
      }
      if (q && typeof q === 'object') {
        return {
          id: q.id || `${raw.slug || 'sp'}-pyq-${idx}`,
          year: q.year || null,
          stem: String(q.stem || q.question || q.text || '').trim(),
          options: Array.isArray(q.options) ? q.options : null,
          answer: q.answer ? String(q.answer).trim() : null,
          explanation: q.explanation ? String(q.explanation).trim() : null,
        };
      }
      return null;
    })
    .filter((q) => q && q.stem);

  // Filter out sourceless news items
  const rawNews = Array.isArray(raw.newsTriggers) ? raw.newsTriggers : Array.isArray(raw.news) ? raw.news : [];
  const news = rawNews.filter((n) => {
    const src = String(n?.src || n?.source || '').trim();
    return Boolean(src);
  });

  return {
    id: raw.id || raw.slug,
    slug: raw.slug,
    title: raw.title,
    subtitle: raw.subtitle || '',
    category: raw.category || raw.group || '',
    startWith: Boolean(raw.startWith),
    headlineStat: raw.headlineStat ? String(raw.headlineStat).trim() : null,
    description: String(raw.oneline || raw.description || raw.habitatType || '').trim(),
    photo: {
      url,
      focusX,
      focusY,
      author,
      licence,
      sourceUrl: sourceUrl && sourceUrl !== '#' ? sourceUrl : null,
      hasValidCredit: Boolean(author && licence),
    },
    protection: {
      iucnCode,
      iucnLabel: iucnMeta.label,
      iucnWhy: iucnMeta.why,
      wpa,
      wpaWhy: LAW_EXPLANATIONS[wpa] || 'Protected under the Wildlife (Protection) Act, 1972.',
      cites,
      citesWhy: TRADE_EXPLANATIONS[cites] || 'Regulated under CITES international trade rules.',
    },
    prelimsPoints: [...traps, ...facts],
    pastQuestions,
    news,
  };
}
