const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const username = 'admin';
  const passwordToTest = process.env.ADMIN_PASSWORD;
  if (!passwordToTest) {
    console.error('Set ADMIN_PASSWORD in the environment first.');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { username: username }
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  const isMatch = await bcrypt.compare(passwordToTest, user.password);
  console.log(`Match: ${isMatch}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
