import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getIstDayBounds,
  getIstWeekBounds,
  getIstMonthBounds,
  toIstDateStr,
  countDistinctActiveActors,
} from './rollups.ts';

test('IST midnight boundaries split 23:59 IST and 00:01 IST into consecutive days', () => {
  // 2026-11-14 23:59:00 IST = 2026-11-14T18:29:00Z
  const beforeMidnight = new Date('2026-11-14T18:29:00.000Z');
  // 2026-11-15 00:01:00 IST = 2026-11-14T18:31:00Z
  const afterMidnight = new Date('2026-11-14T18:31:00.000Z');

  assert.equal(toIstDateStr(beforeMidnight), '2026-11-14');
  assert.equal(toIstDateStr(afterMidnight), '2026-11-15');

  const day14 = getIstDayBounds('2026-11-14');
  assert.ok(beforeMidnight >= day14.startUtc && beforeMidnight < day14.endUtc);
  assert.ok(!(afterMidnight >= day14.startUtc && afterMidnight < day14.endUtc));
});

test('IST weeks start Monday and months align to calendar 1st', () => {
  // 2026-11-15 is a Sunday -> belongs to week starting Monday 2026-11-09
  const week = getIstWeekBounds('2026-11-15');
  assert.equal(week.periodStart, '2026-11-09');
  assert.equal(week.endUtc.getTime() - week.startUtc.getTime(), 7 * 86400_000);

  const month = getIstMonthBounds('2026-11-15');
  assert.equal(month.periodStart, '2026-11-01');
});

test('one user active on 5 days of one week counts ONCE in weekly active_users', () => {
  const week = getIstWeekBounds('2026-11-14');
  const fiveDaysOfEvents = [0, 1, 2, 3, 4].map((offset) => ({
    name: 'entity_view_end',
    userId: 'user_streak',
    anonId: 'anon_streak',
    props: { activeSec: 25 },
    createdAt: new Date(week.startUtc.getTime() + offset * 86400_000 + 3600_000),
  }));

  const shallowSkim = {
    name: 'entity_view_end',
    userId: 'user_skimmer',
    anonId: 'anon_skimmer',
    props: { activeSec: 4 }, // < 10s does NOT count as active user
    createdAt: new Date(week.startUtc.getTime() + 1000),
  };

  const count = countDistinctActiveActors(
    [],
    [...fiveDaysOfEvents, shallowSkim],
    week.startUtc,
    week.endUtc
  );

  assert.equal(count, 1);
});
