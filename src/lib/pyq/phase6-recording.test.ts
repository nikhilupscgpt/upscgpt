import test from 'node:test';
import assert from 'node:assert/strict';
import {
  splitIntoParts,
  buildSectionTitle,
  formatTimestampSec,
  buildUploadPack,
  estimateRecordingMinutes,
} from './recording-helpers.ts';

test('splitIntoParts balances 34 questions with partSize=20 into 17 + 17', () => {
  const ids = Array.from({ length: 34 }, (_, i) => `q${i + 1}`);
  const parts = splitIntoParts(ids, 20);
  assert.equal(parts.length, 2);
  assert.equal(parts[0].length, 17);
  assert.equal(parts[1].length, 17);
});

test('buildSectionTitle formats UPSC Prelims PYQs title with year range and part', () => {
  const title = buildSectionTitle({
    subject: 'Polity',
    topic: 'Salient Features',
    years: [2011, 2016, 2026],
    part: 1,
    totalParts: 2,
  });
  assert.equal(title, 'UPSC Prelims PYQs | Polity: Salient Features (2011–2026) | Part 1');
});

test('formatTimestampSec formats mm:ss and h:mm:ss cleanly', () => {
  assert.equal(formatTimestampSec(0), '00:00');
  assert.equal(formatTimestampSec(65), '01:05');
  assert.equal(formatTimestampSec(3665), '1:01:05');
});

test('buildUploadPack generates YouTube chapters, description, and retake markers', () => {
  const pack = buildUploadPack({
    title: 'UPSC Prelims PYQs | Polity: Salient Features (2016–2020) | Part 1',
    subject: 'Polity',
    topic: 'Salient Features',
    questions: [
      { id: 'q1', examName: 'UPSC CSE', examYear: 2016, questionNo: 12 },
      { id: 'q2', examName: 'UPSC CSE', examYear: 2020, questionNo: 5 },
    ],
    timestamps: [
      { questionId: 'q1', startSec: 0 },
      {
        questionId: 'q2',
        startSec: 82,
        replacedBy: { videoRef: 'retake_q2.webm', recordedAt: '2026-11-14T12:00:00Z' },
      },
    ],
  });

  assert.ok(pack.chapters.includes('00:00 Q1 UPSC CSE 2016 Q12'));
  assert.ok(pack.chapters.includes('01:22 Q2 UPSC CSE 2020 Q5 [Retake: retake_q2.webm]'));
  assert.ok(pack.description.includes('Questions covered in this lecture:'));
  assert.ok(pack.tags.includes('Polity'));
  assert.equal(estimateRecordingMinutes(34, 75), 43);
});
