import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hasCoreTakeaway,
  isExplanationPresent,
  parseExplanationValue,
} from './explanation-schema.ts';
import {
  computeContentStatus,
  detectStemFormat,
  mapExamCode,
} from './content-status.ts';

test('parseExplanationValue handles plain text, JSON string, and invalid JSON', () => {
  const plain = parseExplanationValue('Article 32 guarantees constitutional remedies.');
  assert.equal(plain.ok, true);
  if (plain.ok) {
    assert.equal(isExplanationPresent(plain.data), true);
    assert.equal(hasCoreTakeaway(plain.data), false);
  }

  const json = parseExplanationValue(
    JSON.stringify({
      explanation: 'Detailed note',
      analysis: {
        coreTakeaway: 'Key UPSC rule',
        keywords: ['Article 32'],
        optionBreakdown: [{ label: 'a', text: 'Right', isCorrect: true }],
      },
    })
  );
  assert.equal(json.ok, true);
  if (json.ok) {
    assert.equal(isExplanationPresent(json.data), true);
    assert.equal(hasCoreTakeaway(json.data), true);
  }

  const brokenJson = parseExplanationValue('{bad json');
  assert.equal(brokenJson.ok, false);
});

test('computeContentStatus enforces broken vs incomplete vs ready', () => {
  const validOpts = [
    { label: 'a', text: '1 only' },
    { label: 'b', text: '2 only' },
    { label: 'c', text: 'Both' },
    { label: 'd', text: 'Neither' },
  ];

  const broken = computeContentStatus({
    correctLabel: 'z',
    options: validOpts,
    explanation: '',
    examName: 'UPSC CSE Pre',
  });
  assert.equal(broken.contentStatus, 'broken');
  assert.ok(broken.missingFlags.includes('answer_mismatch'));

  const incomplete = computeContentStatus({
    correctLabel: 'a',
    options: validOpts,
    explanation: '',
    examName: 'UPSC CSE Pre',
  });
  assert.equal(incomplete.contentStatus, 'incomplete');
  assert.ok(incomplete.missingFlags.includes('explanation'));

  const ready = computeContentStatus({
    correctLabel: 'a',
    options: validOpts,
    explanation: 'Clear explanation',
    examName: 'UPSC CSE Pre',
  });
  assert.equal(ready.contentStatus, 'ready');
  assert.ok(ready.missingFlags.includes('takeaway'));
  assert.ok(ready.missingFlags.includes('theme'));
});

test('detectStemFormat and mapExamCode classify variants cleanly', () => {
  assert.equal(detectStemFormat('Consider the following statements: 1. Foo'), 'statements');
  assert.equal(detectStemFormat('How many of the above pairs are correctly matched?'), 'pairs');
  assert.equal(detectStemFormat('Statement-I: X. Statement-II: Y.'), 'assertion');
  assert.equal(detectStemFormat('Which river flows through Assam?'), 'plain');

  assert.equal(mapExamCode('UPSC CSE Pre'), 'UPSC_CSE_PRE');
  assert.equal(mapExamCode('CDS I 2024'), 'CDS_I');
  assert.equal(mapExamCode('CDS II 2024'), 'CDS_II');
  assert.equal(mapExamCode('CDS 2015'), 'CDS');
});
