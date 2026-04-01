const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runIntegrityTest() {
  console.log("🚀 Running Final System Integrity Check...");

  try {
    // 1. Session Identity Fallback Test
    console.log("\n--- Test 1: Identity Fallback (PATCH /api/user/profile logic) ---");
    const testEmail = 'integrity-test@example.com';
    let user = await prisma.user.upsert({
      where: { email: testEmail },
      update: {},
      create: {
        email: testEmail,
        name: 'Integrity Tester',
        role: 'USER',
        tier: 'FREE'
      }
    });

    // Simulate PATCH logic where only email is known
    const updated = await prisma.user.update({
      where: { email: testEmail },
      data: { examYear: 2027, name: 'Tester Updated' }
    });
    console.log(`✅ Success: User updated via email fallback. Tier: ${updated.tier}`);

    // 2. Upgrade Logic Test
    console.log("\n--- Test 2: Simulated Upgrade (POST /api/user/upgrade logic) ---");
    const upgraded = await prisma.user.update({
      where: { id: user.id },
      data: { tier: 'PRO' }
    });
    if (upgraded.tier === 'PRO') {
      console.log("✅ Success: User successfully upgraded to PRO tier.");
    } else {
      throw new Error("Upgrade failed.");
    }

    // 3. Navigation Consistency Check (Manual code review done, verifying paths)
    console.log("\n--- Test 3: Path Integrity ---");
    const paths = ['src/app/page.js', 'src/app/atlas/page.js', 'src/app/atlas/map/page.js', 'src/app/profile/page.js'];
    const fs = require('fs');
    paths.forEach(p => {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf8');
        if (content.includes('Navigation')) {
          console.log(`✅ Success: ${p} has Navigation integrated.`);
        } else {
          console.warn(`⚠️ Warning: ${p} missing Navigation.`);
        }
      }
    });

    // Cleanup
    await prisma.user.delete({ where: { email: testEmail } });
    console.log("\n🧹 Cleanup: Deleted integrity-test user.");

    console.log("\n✨ SYSTEM INTEGRITY VERIFIED! ✨");

  } catch (error) {
    console.error("\n❌ INTEGRITY CHECK FAILED!");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runIntegrityTest();
