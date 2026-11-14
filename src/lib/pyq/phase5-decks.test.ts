import test from 'node:test';
import assert from 'node:assert/strict';
import {
  dedupeQuestionIds,
  moveArrayItem,
  sanitizeDeckInput,
  computeSectionSummary,
} from './deck-helpers.ts';

test('dedupeQuestionIds preserves order and removes duplicates/blanks', () => {
  assert.deepEqual(dedupeQuestionIds(['q1', ' q2 ', 'q1', '', null, 'q3']), ['q1', 'q2', 'q3']);
});

test('moveArrayItem reorders deck items cleanly and ignores out-of-bounds', () => {
  const arr = ['q1', 'q2', 'q3'];
  assert.deepEqual(moveArrayItem(arr, 0, 2), ['q2', 'q3', 'q1']);
  assert.deepEqual(moveArrayItem(arr, 0, -1), ['q1', 'q2', 'q3']);
  assert.deepEqual(moveArrayItem(arr, 2, 3), ['q1', 'q2', 'q3']);
});

test('sanitizeDeckInput enforces title and non-empty questionIds', () => {
  assert.equal(sanitizeDeckInput({ title: '  ', questionIds: ['q1'] }).ok, false);
  assert.equal(sanitizeDeckInput({ title: 'Polity FR', questionIds: [] }).ok, false);
  const res = sanitizeDeckInput({
    title: ' Polity FR ',
    questionIds: ['q1', 'q2', 'q1'],
    isShared: true,
    sectionPath: 'Polity › Fundamental Rights',
  });
  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.data.title, 'Polity FR');
    assert.deepEqual(res.data.questionIds, ['q1', 'q2']);
    assert.equal(res.data.isShared, true);
  }
});

test('computeSectionSummary estimates duration and counts broken/incomplete', () => {
  const summary = computeSectionSummary(
    20,
    [
      { contentStatus: 'ready' },
      { contentStatus: 'incomplete' },
      { contentStatus: 'broken' },
    ],
    75,
  );
  assert.equal(summary.total, 20);
  assert.equal(summary.estMinutes, 25);
  assert.equal(summary.needsExplanation, 1);
  assert.equal(summary.broken, 1);
});
