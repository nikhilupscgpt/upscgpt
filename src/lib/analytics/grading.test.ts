import test from 'node:test';
import assert from 'node:assert/strict';
import {
  stripAnswerFields,
  buildEnvAtlasQuiz,
  gradeAttemptAnswer,
} from './grading.ts';

function createMockDb(seed = {}) {
  const attempts = new Map(Object.entries(seed.attempts || {}));
  const answers = [];
  const drafts = new Map(Object.entries(seed.drafts || {}));
  const questions = new Map(Object.entries(seed.questions || {}));
  const securityEvents = [];

  return {
    securityEvents,
    answers,
    attempt: {
      findUnique: async ({ where }) => attempts.get(where.id) || null,
      update: async ({ where, data }) => {
        const cur = attempts.get(where.id);
        const next = { ...cur, ...data };
        attempts.set(where.id, next);
        return next;
      },
    },
    attemptAnswer: {
      findUnique: async ({ where }) => {
        const key = where.attemptId_sourceType_sourceId;
        return (
          answers.find(
            (a) =>
              a.attemptId === key.attemptId &&
              a.sourceType === key.sourceType &&
              a.sourceId === key.sourceId
          ) || null
        );
      },
      create: async ({ data }) => {
        const row = { id: `ans_${answers.length + 1}`, ...data };
        answers.push(row);
        return row;
      },
      count: async ({ where }) =>
        answers.filter((a) => {
          if (a.attemptId !== where.attemptId) return false;
          if (where.isCorrect !== undefined && a.isCorrect !== where.isCorrect) return false;
          return true;
        }).length,
    },
    questionDraft: {
      findUnique: async ({ where }) => drafts.get(where.id) || null,
    },
    question: {
      findUnique: async ({ where }) => questions.get(where.id) || null,
    },
    securityEvent: {
      create: async ({ data }) => {
        securityEvents.push(data);
        return data;
      },
    },
  };
}

test('stripAnswerFields removes correctLabel, explanation, analysis, answer', () => {
  const safe = stripAnswerFields({
    id: 'q1',
    stem: 'Which article?',
    options: [{ label: 'a', text: 'Art 14' }],
    correctLabel: 'a',
    explanation: 'Secret explanation',
    analysis: { trap: 'x' },
    answer: 'Art 14',
  });
  assert.equal('correctLabel' in safe, false);
  assert.equal('explanation' in safe, false);
  assert.equal('analysis' in safe, false);
  assert.equal('answer' in safe, false);
  assert.equal(safe.stem, 'Which article?');
});

test('buildEnvAtlasQuiz separates public prompts from server answer keys', () => {
  const { publicQuestions, ephemeralQuestions } = buildEnvAtlasQuiz(
    [
      { slug: 'bengal-tiger', title: 'Bengal Tiger', iucnStatus: 'Endangered', places: [{ name: 'Jim Corbett' }] },
      { slug: 'snow-leopard', title: 'Snow Leopard', iucnStatus: 'Vulnerable', places: [{ name: 'Hemis' }] },
    ],
    2
  );
  assert.equal(publicQuestions.length, 2);
  for (const q of publicQuestions) {
    assert.equal('correctLabel' in q, false);
    assert.equal('answer' in q, false);
    assert.ok(ephemeralQuestions[q.sourceId]?.correctLabel);
  }
});

test('gradeAttemptAnswer grades on server, rejects duplicates, and logs forged submissions', async () => {
  const db = createMockDb({
    attempts: {
      att_1: {
        id: 'att_1',
        userId: 'user_1',
        anonId: null,
        total: 1,
        ephemeralQuestions: null,
        completedAt: null,
      },
    },
    drafts: {
      q_100: {
        id: 'q_100',
        correctLabel: 'b',
        explanation: 'Option B is correct.',
        srcSubject: 'Indian Polity',
        srcTopic: 'Parliament',
        examYear: 2023,
      },
    },
  });

  // Forged negative time
  const badTime = await gradeAttemptAnswer({
    db: db as never,
    attemptId: 'att_1',
    userId: 'user_1',
    sourceType: 'pyq',
    sourceId: 'q_100',
    selectedLabel: 'b',
    timeSpentSec: -10,
  });
  assert.equal(badTime.ok, false);
  assert.equal(badTime.status, 400);
  assert.equal(db.securityEvents.length, 1);
  assert.equal(db.securityEvents[0].type, 'forged_answer');

  // Unknown sourceId
  const badSource = await gradeAttemptAnswer({
    db: db as never,
    attemptId: 'att_1',
    userId: 'user_1',
    sourceType: 'pyq',
    sourceId: 'q_nonexistent',
    selectedLabel: 'a',
    timeSpentSec: 12,
  });
  assert.equal(badSource.ok, false);
  assert.equal(badSource.status, 404);
  assert.equal(db.securityEvents.length, 2);

  // Valid submission
  const okRes = await gradeAttemptAnswer({
    db: db as never,
    attemptId: 'att_1',
    userId: 'user_1',
    sourceType: 'pyq',
    sourceId: 'q_100',
    selectedLabel: 'B',
    timeSpentSec: 25,
  });
  assert.equal(okRes.ok, true);
  if (okRes.ok) {
    assert.equal(okRes.data.isCorrect, true);
    assert.equal(okRes.data.correctLabel, 'b');
    assert.equal(okRes.data.explanation, 'Option B is correct.');
    assert.equal(okRes.data.correct, 1);
  }

  // Duplicate rejection
  const dupRes = await gradeAttemptAnswer({
    db: db as never,
    attemptId: 'att_1',
    userId: 'user_1',
    sourceType: 'pyq',
    sourceId: 'q_100',
    selectedLabel: 'a',
    timeSpentSec: 5,
  });
  assert.equal(dupRes.ok, false);
  assert.equal(dupRes.status, 409);
});
