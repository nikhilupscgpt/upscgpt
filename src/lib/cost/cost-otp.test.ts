import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateCostPaise } from './price-table.ts';
import {
  recordUsage,
  checkOtpGuards,
  hashRecipient,
  toIp24,
} from './recordUsage.ts';

test('estimateCostPaise computes integer paise and respects cacheHit=true', () => {
  assert.equal(estimateCostPaise({ provider: 'msg91', unit: 'sms', quantity: 2 }), 40);
  assert.equal(estimateCostPaise({ provider: 'resend', unit: 'email', quantity: 5 }), 40);
  assert.equal(
    estimateCostPaise({
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      unit: 'tokens_in',
      quantity: 1_000_000,
    }),
    2550
  );
  assert.equal(
    estimateCostPaise({
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      unit: 'tokens_in',
      quantity: 500_000,
      cacheHit: true,
    }),
    0
  );
});

test('hashRecipient and toIp24 scrub PII', () => {
  const h1 = hashRecipient('User@Example.COM ');
  const h2 = hashRecipient('user@example.com');
  assert.equal(h1, h2);
  assert.equal(h1.length, 64);
  assert.equal(toIp24('49.36.12.99'), '49.36.12.0/24');
});

test('recordUsage creates a UsageLedger row with estimated cost', async () => {
  const created = [];
  const mockDb = {
    usageLedger: {
      create: async ({ data }) => {
        created.push(data);
        return data;
      },
    },
  };

  await recordUsage({
    db: mockDb,
    provider: 'msg91',
    category: 'sms',
    feature: 'otp_login',
    unit: 'sms',
    quantity: 1,
    userId: 'u_1',
  });

  assert.equal(created.length, 1);
  assert.equal(created[0].costPaise, 20);
  assert.equal(created[0].provider, 'msg91');
});

test('checkOtpGuards enforces +91, hourly/daily phone limits, device daily limit, and CAPTCHA hook', async () => {
  const now = new Date('2026-11-14T10:00:00Z');
  const rows = [];

  const mockDb = {
    otpRequest: {
      count: async ({ where }) =>
        rows.filter((r) => {
          if (where.phoneHash && r.phoneHash !== where.phoneHash) return false;
          if (where.deviceId && r.deviceId !== where.deviceId) return false;
          if (where.createdAt?.gte && r.createdAt < where.createdAt.gte) return false;
          return true;
        }).length,
    },
  };

  // Reject non-+91 SMS
  const badPhone = await checkOtpGuards({
    db: mockDb,
    channel: 'sms',
    identifier: '+14155551234',
    deviceId: 'dev_1',
    now,
  });
  assert.equal(badPhone.allowed, false);
  assert.equal(badPhone.reason, 'INVALID_INDIAN_PHONE');

  // 2 requests on same device -> allowed, captchaRequired becomes true on 3rd check
  const phoneHash = hashRecipient('+919876543210');
  rows.push(
    { phoneHash, deviceId: 'dev_1', createdAt: new Date(now.getTime() - 10 * 60 * 1000) },
    { phoneHash, deviceId: 'dev_1', createdAt: new Date(now.getTime() - 5 * 60 * 1000) }
  );

  const third = await checkOtpGuards({
    db: mockDb,
    channel: 'sms',
    identifier: '+919876543210',
    deviceId: 'dev_1',
    now,
  });
  assert.equal(third.allowed, true);
  assert.equal(third.captchaRequired, true);

  // 3rd request pushed -> hourly limit (3/hr) reached
  rows.push({ phoneHash, deviceId: 'dev_1', createdAt: new Date(now.getTime() - 1 * 60 * 1000) });
  const fourth = await checkOtpGuards({
    db: mockDb,
    channel: 'sms',
    identifier: '+919876543210',
    deviceId: 'dev_1',
    now,
  });
  assert.equal(fourth.allowed, false);
  assert.equal(fourth.reason, 'PHONE_HOURLY_LIMIT');

  // 5 requests on same device across different numbers -> device daily limit
  const otherHash = hashRecipient('+919811111111');
  rows.push(
    { phoneHash: hashRecipient('+919800000001'), deviceId: 'dev_1', createdAt: new Date(now.getTime() - 3 * 3600 * 1000) },
    { phoneHash: hashRecipient('+919800000002'), deviceId: 'dev_1', createdAt: new Date(now.getTime() - 4 * 3600 * 1000) }
  );
  const devBlocked = await checkOtpGuards({
    db: mockDb,
    channel: 'sms',
    identifier: '+919811111111',
    deviceId: 'dev_1',
    now,
  });
  assert.equal(otherHash.length, 64);
  assert.equal(devBlocked.allowed, false);
  assert.equal(devBlocked.reason, 'DEVICE_DAILY_LIMIT');
});
