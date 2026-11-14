import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  computeQuestionScale,
  buildQuestionMetaLine,
  buildStageCounter,
} from './transition-math.ts';
import { buildQuestionSteps } from '../pyqSlideDeck.js';

test('computeQuestionScale keeps identical-line-break transform when scaled font >= 28px', () => {
  // Full width 1380px scaled down to 776px (45% of 1920 minus padding)
  const res = computeQuestionScale({
    fullWidth: 1380,
    targetLeftWidth: 776,
    baseFontPx: 52,
    minFontPx: 28,
  });
  assert.ok(res.scale < 1 && res.scale > 0.55);
  assert.ok(res.effectiveFontPx >= 28);
  assert.equal(res.shouldReflow, false);
});

test('computeQuestionScale triggers reflow at 28px minimum when transform would shrink below 28px', () => {
  const res = computeQuestionScale({
    fullWidth: 1600,
    targetLeftWidth: 700,
    baseFontPx: 32,
    minFontPx: 28,
  });
  assert.ok(res.effectiveFontPx < 28);
  assert.equal(res.shouldReflow, true);
});

test('buildQuestionMetaLine and buildStageCounter produce single quiet strings', () => {
  const meta = buildQuestionMetaLine({
    examName: 'UPSC CSE Pre',
    examYear: 2026,
    questionNo: 64,
    srcSubject: 'Polity',
    srcTopic: 'Historical Background',
  });
  assert.equal(meta, 'UPSC CSE Pre 2026 · Q64 · Polity › Historical Background');
  assert.equal(buildStageCounter(2, 12, 1, 6), 'Question 3 of 12 · Step 2 of 6');
});

test('buildQuestionSteps produces full-width intro, statement sync, answer, and full-width takeaway', () => {
  const steps = buildQuestionSteps({
    id: 'q1',
    examYear: 2024,
    stem: 'Consider the following statements:\n1. First statement\n2. Second statement',
    options: [
      { label: 'A', text: '1 only' },
      { label: 'B', text: '2 only' },
    ],
    correctLabel: 'A',
    explanation: JSON.stringify({
      statementBreakdown: [
        { statementNo: 1, verdict: 'Correct', explanation: 'Statement 1 is true.' },
        { statementNo: 2, verdict: 'Incorrect', explanation: 'Statement 2 is false.' },
      ],
      keywords: ['Constitutionalism', 'Federalism', 'Parliament'],
      coreTakeaway: 'Always check the exact constitutional article.',
    }),
  });

  assert.equal(steps[0].type, 'intro');
  assert.equal(steps[0].isFullWidth, true);
  assert.equal(steps[0].subtitle, null);

  const stmtStep = steps.find((s) => s.type === 'statement_breakdown');
  assert.ok(stmtStep);
  assert.deepEqual(stmtStep.activeStatements, ['1', '2']);

  const answerStep = steps.find((s) => s.type === 'answer');
  assert.ok(answerStep);
  assert.equal(answerStep.showAnswer, true);
  assert.equal(answerStep.highlightedOption, 'A');

  const lastStep = steps[steps.length - 1];
  assert.equal(lastStep.type, 'takeaway');
  assert.equal(lastStep.isFullWidth, true);
  assert.equal(lastStep.takeawayRule, 'Always check the exact constitutional article.');
});

test('legacy /admin/pyq/present redirects with all query params and /remote/join targets /admin/studio/present', () => {
  const root = process.cwd();
  const legacyPage = fs.readFileSync(path.join(root, 'src/app/admin/pyq/present/page.js'), 'utf8');
  assert.match(legacyPage, /permanentRedirect/);
  assert.match(legacyPage, /\/admin\/studio\/present/);
  assert.match(legacyPage, /URLSearchParams/);

  const joinPage = fs.readFileSync(path.join(root, 'src/app/remote/join/page.js'), 'utf8');
  assert.match(joinPage, /\/admin\/studio\/present\?board=/);
  assert.doesNotMatch(joinPage, /\/admin\/pyq\/present/);
});
