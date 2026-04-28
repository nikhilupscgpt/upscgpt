import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  const username = 'admin';
  const password = 'AdminPassword2026!';
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { username: username },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      tier: 'PREMIUM'
    },
    create: {
      username: username,
      password: hashedPassword,
      role: 'ADMIN',
      tier: 'PREMIUM',
      email: 'admin@upscatlas.com'
    }
  });

  console.log('Admin user created/updated successfully:');
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
