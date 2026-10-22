import fs from 'fs';
import path from 'path';
import {
  TOPIC_GROUPS,
  SUBJECT_ORDER,
  SUBJECT_SHORT,
  getTopicSyllabusOrder,
  groupTopics,
  normalizeCanonicalSubject
} from '../app/prelims/pyq/topicGroups.js';

export {
  TOPIC_GROUPS,
  SUBJECT_ORDER,
  SUBJECT_SHORT,
  getTopicSyllabusOrder,
  groupTopics,
  normalizeCanonicalSubject
};

/**
 * Returns the canonical module/theme label for a given subject and topic.
 * (e.g. 'Foundations', 'The Executive', 'Physical', 'Money & Finance')
 */
export function getTopicModule(subject, topic) {
  if (!subject || !topic) return 'General';
  const groups = TOPIC_GROUPS[subject];
  if (!groups) return 'General';
  for (const [moduleLabel, topics] of groups) {
    if (Array.isArray(topics) && topics.includes(topic)) {
      return moduleLabel;
    }
  }
  return 'General';
}

/**
 * Global cache for microtheme titles index:
 * Key: `${subject}::${topic}` -> Array<string> of microtheme titles
 */
let cachedMicrothemesIndex = null;

export function getMicrothemesIndex() {
  if (cachedMicrothemesIndex) return cachedMicrothemesIndex;
  const index = {};

  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (fs.existsSync(dataDir)) {
      const files = fs.readdirSync(dataDir).filter(f => f.endsWith('_node_bridging.json'));
      for (const f of files) {
        try {
          const raw = fs.readFileSync(path.join(dataDir, f), 'utf8');
          const d = JSON.parse(raw);
          const sub = d.subject === 'Indian Economy' ? 'Economy' : d.subject;
          const nodes = [...(d.nodes || []), ...(d.newNodesToCreate || [])];

          for (const n of nodes) {
            if (!n || !n.title) continue;
            const topics = [];
            if (n.topic) topics.push(n.topic);
            if (Array.isArray(n.mappedQuestionTopics)) {
              for (const t of n.mappedQuestionTopics) {
                if (!topics.includes(t)) topics.push(t);
              }
            }

            for (const t of topics) {
              const key = `${sub}::${t}`;
              if (!index[key]) index[key] = [];
              if (!index[key].includes(n.title)) {
                index[key].push(n.title);
              }
            }
          }
        } catch (err) {
          console.error(`[syllabusTaxonomy] Error reading ${f}:`, err);
        }
      }
    }
  } catch (err) {
    console.error('[syllabusTaxonomy] Failed to scan data directory:', err);
  }

  cachedMicrothemesIndex = index;
  return index;
}

/**
 * Returns the canonical microthemes (neural nodes) for a given subject and topic.
 */
export function getMicrothemesForTopic(subject, topic) {
  if (!subject || !topic || topic === 'ALL') return [];
  const index = getMicrothemesIndex();
  const direct = index[`${subject}::${topic}`];
  if (direct && direct.length > 0) return direct;

  // Case-insensitive or partial subject key match fallback
  const subNorm = subject.toLowerCase().replace(/[^a-z]/g, '');
  for (const [key, list] of Object.entries(index)) {
    const [kSub, kTopic] = key.split('::');
    if (kTopic === topic && kSub.toLowerCase().replace(/[^a-z]/g, '') === subNorm) {
      return list;
    }
  }

  return [];
}

/**
 * Robust multi-subject syllabus sorter:
 * 1. Subject order based on SUBJECT_ORDER
 * 2. Topic order based on getTopicSyllabusOrder within the subject
 * 3. examYear DESC (most recent first within micro-chapter)
 * 4. questionNo ASC
 */
export function sortQuestionsBySyllabus(questions, defaultSubject = 'Indian Polity') {
  if (!Array.isArray(questions)) return [];
  return [...questions].sort((a, b) => {
    const subA = a.srcSubject || defaultSubject;
    const subB = b.srcSubject || defaultSubject;

    if (subA !== subB) {
      const idxA = SUBJECT_ORDER.indexOf(subA);
      const idxB = SUBJECT_ORDER.indexOf(subB);
      const rankA = idxA === -1 ? 999 : idxA;
      const rankB = idxB === -1 ? 999 : idxB;
      if (rankA !== rankB) return rankA - rankB;
      return subA.localeCompare(subB);
    }

    const orderA = getTopicSyllabusOrder(subA, a.srcTopic);
    const orderB = getTopicSyllabusOrder(subB, b.srcTopic);
    if (orderA !== orderB) return orderA - orderB;

    const yearA = Number(a.examYear || 0);
    const yearB = Number(b.examYear || 0);
    if (yearA !== yearB) return yearB - yearA;

    return Number(a.questionNo || 0) - Number(b.questionNo || 0);
  });
}

/**
 * Extracts searchable keyword phrases from a microtheme node title:
 * e.g. "Paris Agreement — NDCs, Finance & Implementation" -> ["Paris Agreement", "NDCs", "Finance"]
 */
export function buildMicrothemeConditions(microtheme) {
  if (!microtheme || microtheme === 'ALL') return null;

  const rawTerms = microtheme
    .split(/[—–\-(]/)
    .map(t => t.replace(/[)\]]/g, '').trim())
    .filter(t => t.length >= 3 && !/^(the|and|for|with|from|types|causes|part|acts?)$/i.test(t));

  const or = [
    { srcTheme: microtheme },
    { stem: { contains: microtheme, mode: 'insensitive' } },
    { explanation: { contains: microtheme, mode: 'insensitive' } },
  ];

  for (const term of rawTerms.slice(0, 3)) {
    or.push({ stem: { contains: term, mode: 'insensitive' } });
    or.push({ explanation: { contains: term, mode: 'insensitive' } });
  }

  return { OR: or };
}
