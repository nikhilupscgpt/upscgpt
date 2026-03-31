const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { mapEntrySchema, adminUserSchema, bulkEntriesSchema } = require('../src/lib/validations');

// Mock data
const VALID_ENTRY = {
  lat: 25.5,
  lon: 77.2,
  name: "New Delhi",
  category: "capital",
  tags: "india, centre",
  year: 2024,
  prelims: "Seat of power",
  mains: "Strategic depth",
  india: "Core"
};

const INVALID_ENTRY = {
  lat: 100, // Invalid latitude
  lon: -200, // Invalid longitude
  name: "", // Empty name
};

async function runSmokeTests() {
  console.log('🚀 Starting UPSCGPT Smoke Tests...\n');
  const prisma = new PrismaClient();
  let failCount = 0;

  async function test(name, fn) {
    process.stdout.write(`- ${name}: `);
    try {
      await fn();
      console.log('✅ PASS');
    } catch (err) {
      console.log(`❌ FAIL\n  Error: ${err.message}`);
      failCount++;
    }
  }

  // 1. Database Connectivity
  await test('Database Connection', async () => {
    const userCount = await prisma.user.count();
    console.log(`(Users in DB: ${userCount})`);
  });

  // 2. Admin User Verification
  await test('Admin User Existence', async () => {
    const admin = await prisma.user.findUnique({ where: { username: 'admin' } });
    if (!admin) throw new Error('Admin user "admin" not found in database');
    if (admin.role !== 'ADMIN') throw new Error('Admin user has incorrect role: ' + admin.role);
    if (admin.tier !== 'PRO') throw new Error('Admin user tier not normalized to PRO: ' + admin.tier);
  });

  // 3. Validation Logic (Zod)
  await test('Zod Validation - Single Entry', async () => {
    const valid = mapEntrySchema.safeParse(VALID_ENTRY);
    if (!valid.success) throw new Error('Valid entry failed parsing: ' + JSON.stringify(valid.error.format()));
    
    const invalid = mapEntrySchema.safeParse(INVALID_ENTRY);
    if (invalid.success) throw new Error('Invalid entry passed parsing incorrectly');
  });

  await test('Zod Validation - Bulk Entries', async () => {
    const bulk = bulkEntriesSchema.safeParse({ entries: [VALID_ENTRY, VALID_ENTRY] });
    if (!bulk.success) throw new Error('Bulk parsing failed');
  });

  // 4. Auditing Logic
  await test('ActionLog Creation', async () => {
    const admin = await prisma.user.findUnique({ where: { username: 'admin' } });
    const log = await prisma.actionLog.create({
      data: {
        action: 'SMOKE_TEST',
        details: 'Automated smoke test run',
        userId: admin.id
      }
    });
    if (!log) throw new Error('Failed to create ActionLog');
    // Cleanup
    await prisma.actionLog.delete({ where: { id: log.id } });
  });

  // 5. Normalization Check
  await test('Tier Compatibility Check', async () => {
    const usersWithPremium = await prisma.user.count({ where: { tier: 'PREMIUM' } });
    if (usersWithPremium > 0) throw new Error(`Found ${usersWithPremium} users with deprecated PREMIUM tier! Run migrate-tiers.js.`);
  });

  console.log('\n-----------------------------------------');
  if (failCount === 0) {
    console.log('✨ ALL SMOKE TESTS PASSED! PLATFORM INTEGRITY VERIFIED.');
  } else {
    console.log(`🚨 ${failCount} SMOKE TESTS FAILED. CHECK SYSTEM INTEGRITY.`);
    process.exit(1);
  }

  await prisma.$disconnect();
}

runSmokeTests();
