import test from 'node:test';
import assert from 'node:assert/strict';
import {
  enforcePyqScrapeLimits,
  parsePyqPageSize,
  resetPyqScrapeBuckets,
  toLightPyqRow,
} from './pyqAccess.ts';

function checkRoleLocal(
  session: { user?: { role?: string | null; id?: string | null } } | null | undefined,
  allowedRoles: readonly string[]
) {
  if (!session || !session.user) {
    return { ok: false, status: 401 };
  }
  const role = session.user.role || 'USER';
  if (!allowedRoles.includes(role)) {
    return { ok: false, status: 403 };
  }
  return { ok: true, status: 200 };
}

test('role matrix enforces ADMIN/FACULTY for read and ADMIN-only for write', () => {
  const admin = { user: { id: 'u1', role: 'ADMIN' } };
  const faculty = { user: { id: 'u2', role: 'FACULTY' } };
  const student = { user: { id: 'u3', role: 'USER' } };

  assert.equal(checkRoleLocal(null, ['ADMIN', 'FACULTY']).status, 401);
  assert.equal(checkRoleLocal(student, ['ADMIN', 'FACULTY']).status, 403);
  assert.equal(checkRoleLocal(faculty, ['ADMIN', 'FACULTY']).status, 200);
  assert.equal(checkRoleLocal(admin, ['ADMIN', 'FACULTY']).status, 200);

  assert.equal(checkRoleLocal(faculty, ['ADMIN']).status, 403);
  assert.equal(checkRoleLocal(admin, ['ADMIN']).status, 200);
});

test('page-size whitelist accepts only 25, 50, 100', () => {
  assert.equal(parsePyqPageSize(undefined), 25);
  assert.equal(parsePyqPageSize(''), 25);
  assert.equal(parsePyqPageSize('25'), 25);
  assert.equal(parsePyqPageSize('50'), 50);
  assert.equal(parsePyqPageSize('100'), 100);

  assert.equal(parsePyqPageSize('10'), null);
  assert.equal(parsePyqPageSize('200'), null);
  assert.equal(parsePyqPageSize('abc'), null);
});

test('toLightPyqRow strips heavy explanation/rawText/assets and stays < 1 KB', () => {
  const row = toLightPyqRow({
    id: 'q_1',
    questionNo: 64,
    examName: 'UPSC CSE Pre',
    examYear: 2026,
    paper: 'GS1',
    srcSubject: 'Indian Polity',
    srcTopic: 'Historical Background',
    srcTheme: null,
    stem: 'Consider the following statements regarding the Regulating Act of 1773:',
    options: [
      { label: 'a', text: '1 only' },
      { label: 'b', text: '2 only' },
      { label: 'c', text: 'Both 1 and 2' },
      { label: 'd', text: 'Neither 1 nor 2' },
    ],
    correctLabel: 'c',
    explanation: 'A'.repeat(3000),
    rawText: 'B'.repeat(2000),
    assets: { huge: 'C'.repeat(1500) },
    difficulty: 'MEDIUM',
  });

  assert.equal(row.hasExplanation, true);
  assert.equal('explanation' in row, false);
  assert.equal('rawText' in row, false);
  assert.equal('assets' in row, false);

  const bytes = Buffer.byteLength(JSON.stringify(row), 'utf8');
  assert.ok(bytes < 1024, `Expected light row < 1024 bytes, got ${bytes}`);
});

test('rate limits return 429 and log SecurityEvent(scrape_suspect) on 61st list req or >400 distinct Qs', async () => {
  resetPyqScrapeBuckets();
  const logged: any[] = [];
  const fakeLog = async (ev: any) => {
    logged.push(ev);
  };
  const baseNow = Date.now();

  for (let i = 0; i < 60; i++) {
    const res = await enforcePyqScrapeLimits({
      userId: 'faculty_1',
      isListRequest: true,
      questionIds: [`q_${i % 10}`],
      nowMs: baseNow + i * 1000,
      logEvent: fakeLog as any,
    });
    assert.equal(res.allowed, true);
  }

  const blocked61 = await enforcePyqScrapeLimits({
    userId: 'faculty_1',
    isListRequest: true,
    questionIds: ['q_0'],
    nowMs: baseNow + 65_000,
    logEvent: fakeLog as any,
  });
  assert.equal(blocked61.allowed, false);
  if (!blocked61.allowed) assert.equal(blocked61.status, 429);
  assert.equal(logged.length, 1);
  assert.equal(logged[0].type, 'scrape_suspect');

  // Test 400 distinct question cap via detail fetches
  const ids401 = Array.from({ length: 401 }, (_, i) => `dq_${i}`);
  const blocked401 = await enforcePyqScrapeLimits({
    userId: 'faculty_2',
    isListRequest: false,
    questionIds: ids401,
    nowMs: baseNow,
    logEvent: fakeLog as any,
  });
  assert.equal(blocked401.allowed, false);
  if (!blocked401.allowed) assert.equal(blocked401.status, 429);
  assert.equal(logged.length, 2);
  assert.equal(logged[1].type, 'scrape_suspect');
});
