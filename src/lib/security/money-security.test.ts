import test from 'node:test';
import assert from 'node:assert/strict';
import {
  enforceProDeviceLimit,
  checkScrapeGuard,
  findPaymentReconciliationMismatches,
  capPageSize,
  getLoginBackoffSec,
} from './guards.ts';

test('capPageSize caps at 50 and getLoginBackoffSec scales exponentially', () => {
  assert.equal(capPageSize(200), 50);
  assert.equal(capPageSize(25), 25);
  assert.equal(capPageSize(-1, 10), 10);
  assert.equal(getLoginBackoffSec(2), 0);
  assert.equal(getLoginBackoffSec(3), 15);
  assert.equal(getLoginBackoffSec(4), 30);
});

test('enforceProDeviceLimit revokes oldest device on 3rd login, logs SecurityEvent, and emails user', async () => {
  const devices = [
    { id: 'd1', userId: 'u1', deviceId: 'dev_old', lastSeen: new Date('2026-11-01T10:00:00Z'), revokedAt: null },
    { id: 'd2', userId: 'u1', deviceId: 'dev_mid', lastSeen: new Date('2026-11-02T10:00:00Z'), revokedAt: null },
  ];
  const securityEvents = [];
  const emails = [];

  const mockDb = {
    userDevice: {
      upsert: async ({ create }) => {
        const row = { id: 'd3', ...create, revokedAt: null };
        devices.push(row);
        return row;
      },
      findMany: async ({ where }) =>
        devices
          .filter((d) => d.userId === where.userId && d.revokedAt === null)
          .sort((a, b) => a.lastSeen.getTime() - b.lastSeen.getTime()),
      update: async ({ where, data }) => {
        const target = devices.find((d) => d.id === where.id);
        if (target) target.revokedAt = data.revokedAt;
        return target;
      },
    },
    securityEvent: {
      create: async ({ data }) => {
        securityEvents.push(data);
        return data;
      },
    },
  };

  const res = await enforceProDeviceLimit({
    db: mockDb,
    userId: 'u1',
    userEmail: 'pro@example.com',
    deviceId: 'dev_new',
    maxDevices: 2,
    notifyFn: async (msg) => {
      emails.push(msg);
    },
  });

  assert.deepEqual(res.evicted, ['dev_old']);
  assert.equal(res.activeCount, 2);
  assert.equal(securityEvents.length, 1);
  assert.equal(securityEvents[0].type, 'device_evicted');
  assert.equal(emails.length, 1);
});

test('checkScrapeGuard flags > 300 distinct items per hour', async () => {
  const securityEvents = [];
  const mockDb = {
    securityEvent: {
      create: async ({ data }) => {
        securityEvents.push(data);
        return data;
      },
    },
  };

  const batch1 = Array.from({ length: 300 }, (_, i) => `q_${i}`);
  const ok = await checkScrapeGuard({
    db: mockDb,
    actorKey: 'test_scraper_1',
    itemIds: batch1,
    limitPerHour: 300,
  });
  assert.equal(ok.allowed, true);
  assert.equal(securityEvents.length, 0);

  const throttled = await checkScrapeGuard({
    db: mockDb,
    actorKey: 'test_scraper_1',
    itemIds: ['q_301'],
    limitPerHour: 300,
  });
  assert.equal(throttled.allowed, false);
  assert.equal(securityEvents.length, 1);
  assert.equal(securityEvents[0].type, 'scrape_suspect');
});

test('findPaymentReconciliationMismatches detects paidNotPro, proWithoutPayment, and refundedStillPro', async () => {
  const future = new Date('2027-01-01T00:00:00Z');
  const now = new Date('2026-11-14T10:00:00Z');

  const mockDb = {
    user: {
      findMany: async () => [
        { id: 'u_paid_not_pro', role: 'USER', tier: 'FREE', validUntil: null },
        { id: 'u_pro_no_pay', role: 'USER', tier: 'PRO', validUntil: future },
        { id: 'u_refunded_pro', role: 'USER', tier: 'PRO', validUntil: future },
        { id: 'u_granted_pro', role: 'USER', tier: 'PRO', validUntil: future },
      ],
    },
    order: {
      findMany: async () => [
        { userId: 'u_paid_not_pro', status: 'paid', createdAt: now },
        { userId: 'u_refunded_pro', status: 'refunded', createdAt: now },
        { userId: 'u_refunded_pro', status: 'paid', createdAt: new Date('2026-11-01T00:00:00Z') },
      ],
    },
    auditLog: {
      findMany: async () => [{ entityId: 'u_granted_pro' }],
    },
  };

  const mismatches = await findPaymentReconciliationMismatches({ db: mockDb, now });
  assert.deepEqual(mismatches.paidNotPro, ['u_paid_not_pro']);
  assert.deepEqual(mismatches.proWithoutPayment, ['u_pro_no_pay']);
  assert.deepEqual(mismatches.refundedStillPro, ['u_refunded_pro']);
});
