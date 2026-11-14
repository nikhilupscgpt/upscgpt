import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canSendLifecycleMessage,
  parseFixedCostCsv,
  parseMarketingSpendCsv,
  signUnsubscribeToken,
  verifyUnsubscribeToken,
} from './marketing.ts';

test('parseMarketingSpendCsv parses INR and paise rows into integer paise', () => {
  const csv = [
    'date,channel,campaign,amount_inr',
    '2026-11-10,google_ads,"Prelims 2027 Search",1250.50',
    '2026-11-11,youtube,Topper_Review,500',
  ].join('\n');

  const rows = parseMarketingSpendCsv(csv);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].channel, 'google_ads');
  assert.equal(rows[0].campaign, 'Prelims 2027 Search');
  assert.equal(rows[0].amountPaise, 125050);
  assert.equal(rows[1].amountPaise, 50000);
});

test('parseFixedCostCsv parses YYYY-MM and YYYY-MM-DD months', () => {
  const csv = [
    'month,item,amount_inr',
    '2026-11,Neon Postgres Pro,1600',
    '2026-11-01,Vercel Pro,1700',
  ].join('\n');

  const rows = parseFixedCostCsv(csv);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].item, 'Neon Postgres Pro');
  assert.equal(rows[0].amountPaise, 160000);
  assert.equal(rows[1].amountPaise, 170000);
});

test('one-click unsubscribe token round-trips and rejects tampering', () => {
  const token = signUnsubscribeToken('user_12345');
  assert.equal(verifyUnsubscribeToken(token), 'user_12345');
  assert.equal(verifyUnsubscribeToken(`${token}tampered`), null);
  assert.equal(verifyUnsubscribeToken('invalid-token'), null);
});

test('canSendLifecycleMessage enforces marketingOptOut and email presence', () => {
  assert.equal(canSendLifecycleMessage({ email: 'a@b.com', marketingOptOut: false }), true);
  assert.equal(canSendLifecycleMessage({ email: 'a@b.com', marketingOptOut: true }), false);
  assert.equal(canSendLifecycleMessage({ email: null, marketingOptOut: false }), false);
});
