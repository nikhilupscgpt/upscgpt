const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const username = 'admin';
  const passwordToTest = 'AdminPassword2026!';

  const user = await prisma.user.findUnique({
    where: { username: username }
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  const isMatch = await bcrypt.compare(passwordToTest, user.password);
  console.log(`Password: ${passwordToTest}`);
  console.log(`Hash in DB: ${user.password}`);
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
