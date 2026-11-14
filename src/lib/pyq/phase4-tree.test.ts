import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPyqTreeFromRows,
  searchTreeSections,
  invalidatePyqTreeCache,
} from './tree-service.ts';

const SAMPLE_ROWS = [
  {
    id: 'q1',
    srcSubject: 'Polity',
    srcTopic: 'Fundamental Rights',
    srcTheme: 'Right to Equality',
    examCode: 'UPSC_CSE_PRE',
    examName: 'UPSC CSE Prelims',
    contentStatus: 'ready',
    syllabusOrder: 1002,
  },
  {
    id: 'q2',
    srcSubject: 'Polity',
    srcTopic: 'Fundamental Rights',
    srcTheme: null,
    examCode: 'UPSC_CSE_PRE',
    examName: 'UPSC CSE Prelims',
    contentStatus: 'incomplete',
    syllabusOrder: 1002,
  },
  {
    id: 'q3',
    srcSubject: 'Polity',
    srcTopic: 'Parliament',
    srcTheme: null,
    examCode: 'CDS_I',
    examName: 'CDS I',
    contentStatus: 'broken',
    syllabusOrder: 1005,
  },
];

const SAMPLE_USAGE = [
  { questionId: 'q1', presentedAt: new Date('2026-10-12T10:00:00Z') },
];

test('buildPyqTreeFromRows computes accurate CSE vs CDS counts, status counts, and omits empty themes', () => {
  const cseTree = buildPyqTreeFromRows(SAMPLE_ROWS, SAMPLE_USAGE, 'UPSC_CSE_PRE');
  assert.equal(cseTree.totals.total, 2);
  assert.equal(cseTree.totals.cseCount, 2);
  assert.equal(cseTree.totals.cdsCount, 0);
  assert.equal(cseTree.totals.readyCount, 1);
  assert.equal(cseTree.totals.needsExplanationCount, 1);
  assert.equal(cseTree.totals.recordedCount, 1);
  assert.equal(cseTree.totals.recordedPct, 50);

  const polity = cseTree.subjects.find((s) => s.name === 'Polity');
  assert.ok(polity);
  assert.equal(polity.topics.length, 1); // Parliament is CDS-only
  assert.equal(polity.topics[0].name, 'Fundamental Rights');
  assert.equal(polity.topics[0].themes.length, 1);
  assert.equal(polity.topics[0].themes[0].name, 'Right to Equality');

  const allTree = buildPyqTreeFromRows(SAMPLE_ROWS, SAMPLE_USAGE, 'ALL');
  assert.equal(allTree.totals.total, 3);
  assert.equal(allTree.totals.brokenCount, 1);
  const parliament = allTree.subjects[0].topics.find((t) => t.name === 'Parliament');
  assert.ok(parliament);
  assert.equal(parliament.themes.length, 0);
});

test('searchTreeSections returns jump links for matching topics and themes', () => {
  const tree = buildPyqTreeFromRows(SAMPLE_ROWS, SAMPLE_USAGE, 'UPSC_CSE_PRE');
  const hits = searchTreeSections(tree, 'fundamental');
  assert.equal(hits.length, 1);
  assert.equal(hits[0].type, 'topic');
  assert.ok(hits[0].href.includes('subject=Polity'));
  assert.ok(hits[0].href.includes('topic=Fundamental%20Rights'));
});

test('invalidatePyqTreeCache clears global cache map cleanly', () => {
  const g = globalThis as unknown as { __pyqTreeCache?: Map<string, unknown> };
  g.__pyqTreeCache = new Map([['UPSC_CSE_PRE', { expiresAt: Date.now() + 10000, data: {} }]]);
  assert.equal(g.__pyqTreeCache.size, 1);
  invalidatePyqTreeCache();
  assert.equal(g.__pyqTreeCache.size, 0);
});
