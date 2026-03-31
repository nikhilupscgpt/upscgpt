const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findUnique({
    where: { username: 'admin' }
  });

  if (admin) {
    console.log('Admin user found:');
    console.log(`ID: ${admin.id}`);
    console.log(`Username: ${admin.username}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    console.log(`Tier: ${admin.tier}`);
    // DO NOT print password hash for security, but check if it's not null
    console.log(`Password Hash Present: ${!!admin.password}`);
  } else {
    console.log('Admin user NOT found in the database!');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
