import fs from 'fs';
import path from 'path';

let politySequenceMap = null;

function loadPolityMap() {
  if (politySequenceMap) return politySequenceMap;
  try {
    const filePath = path.resolve(process.cwd(), 'data/polity_topic_sequence_map.json');
    if (fs.existsSync(filePath)) {
      politySequenceMap = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (err) {
    console.warn('[syllabusSequence] Could not read polity_topic_sequence_map.json:', err.message);
  }
  return politySequenceMap || {};
}

/**
 * Returns a numerical syllabusOrder for a given subject and topic.
 * Lower numbers appear first in syllabus flow.
 */
export function getTopicSyllabusOrder(subject, topic) {
  if (!topic) return 9999;
  if (subject === 'Indian Polity') {
    const map = loadPolityMap();
    if (map[topic]?.syllabusOrder) {
      return map[topic].syllabusOrder;
    }
  }
  return 999;
}

/**
 * Sorts questions array in syllabus flow:
 * 1. syllabusOrder ASC (Chapter sequence: Foundations -> Rights -> Executive -> Legislature...)
 * 2. examYear DESC (Most recent exam first within the same micro-chapter)
 * 3. questionNo ASC
 */
export function sortQuestionsBySyllabus(questions, subject = 'Indian Polity') {
  if (!Array.isArray(questions)) return [];
  return [...questions].sort((a, b) => {
    const orderA = getTopicSyllabusOrder(a.srcSubject || subject, a.srcTopic);
    const orderB = getTopicSyllabusOrder(b.srcSubject || subject, b.srcTopic);

    if (orderA !== orderB) {
      return orderA - orderB;
    }
    const yearA = Number(a.examYear || 0);
    const yearB = Number(b.examYear || 0);
    if (yearA !== yearB) {
      return yearB - yearA;
    }
    return Number(a.questionNo || 0) - Number(b.questionNo || 0);
  });
}
