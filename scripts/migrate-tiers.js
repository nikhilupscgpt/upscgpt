const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting tier normalization migration...');
  const updated = await prisma.user.updateMany({
    where: { tier: 'PREMIUM' },
    data: { tier: 'PRO' }
  });

  console.log(`Successfully migrated ${updated.count} users from PREMIUM to PRO.`);
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
