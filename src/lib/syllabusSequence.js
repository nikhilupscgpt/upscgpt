import { getTopicSyllabusOrder } from '@/app/prelims/pyq/topicGroups';

export { getTopicSyllabusOrder };

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
