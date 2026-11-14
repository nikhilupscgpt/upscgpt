import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePyqSavePayload, buildBacklogMatrix } from './editor-validation.ts';

test('validatePyqSavePayload rejects missing options, mismatched answer, invalid JSON, and missing examCode', () => {
  const bad = validatePyqSavePayload({
    stem: 'Test',
    options: [{ label: 'A', text: 'Only one' }],
    correctLabel: 'D',
    explanation: '{not-valid-json',
    examName: 'Unknown Exam',
  });
  assert.equal(bad.ok, false);
  if (!bad.ok) {
    assert.ok(bad.errors.length >= 3);
  }
});

test('validatePyqSavePayload recomputes ready status and stemFormat when valid', () => {
  const good = validatePyqSavePayload({
    stem: 'Consider the following statements:\n1. First\n2. Second',
    options: [
      { label: 'A', text: '1 only' },
      { label: 'B', text: '2 only' },
      { label: 'C', text: 'Both 1 and 2' },
      { label: 'D', text: 'Neither 1 nor 2' },
    ],
    correctLabel: 'C',
    explanation: JSON.stringify({
      explanation: 'Both statements are correct.',
      analysis: { coreTakeaway: 'Key concept.' },
    }),
    examName: 'UPSC CSE Prelims',
    srcTheme: 'Parliament',
    difficulty: 'medium',
  });

  assert.equal(good.ok, true);
  if (good.ok) {
    assert.equal(good.computed.examCode, 'UPSC_CSE_PRE');
    assert.equal(good.computed.contentStatus, 'ready');
    assert.equal(good.computed.stemFormat, 'statements');
    assert.deepEqual(good.computed.missingFlags, []);
  }
});

test('buildBacklogMatrix groups by exam x year x subject and finds nextIncompleteId', () => {
  const { cells, nextIncompleteId } = buildBacklogMatrix([
    {
      id: 'q1',
      examCode: 'UPSC_CSE_PRE',
      examName: 'UPSC CSE',
      examYear: 2024,
      srcSubject: 'Polity',
      srcTopic: 'Parliament',
      srcTheme: 'Lok Sabha',
      contentStatus: 'ready',
    },
    {
      id: 'q2',
      examCode: 'UPSC_CSE_PRE',
      examName: 'UPSC CSE',
      examYear: 2024,
      srcSubject: 'Polity',
      srcTopic: 'Parliament',
      srcTheme: null,
      contentStatus: 'incomplete',
    },
  ]);

  assert.equal(nextIncompleteId, 'q2');
  assert.equal(cells.length, 1);
  assert.equal(cells[0].total, 2);
  assert.equal(cells[0].ready, 1);
  assert.equal(cells[0].needsExplanation, 1);
  assert.equal(cells[0].untaggedTheme, 1);
});
