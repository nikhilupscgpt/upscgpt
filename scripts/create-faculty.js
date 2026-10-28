import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const username = args[0] || 'faculty1';
  const password = args[1] || 'FacultyPass2026!';
  const name = args[2] || 'Faculty Member';
  const email = args[3] || `${username}@upscatlas.com`;

  console.log(`Setting up Faculty user:`);
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}`);
  console.log(`Name:     ${name}`);
  console.log(`Email:    ${email}`);

  const hashedPassword = await bcrypt.hash(password, 10);

  const faculty = await prisma.user.upsert({
    where: { username },
    update: {
      password: hashedPassword,
      name,
      role: 'FACULTY',
      tier: 'PRO',
      email,
    },
    create: {
      username,
      password: hashedPassword,
      name,
      role: 'FACULTY',
      tier: 'PRO',
      email,
    },
  });

  console.log('\n✅ Faculty user created/updated successfully:');
  console.log(`ID:       ${faculty.id}`);
  console.log(`Role:     ${faculty.role}`);
  console.log(`Login at: /admin-login`);
}

main()
  .catch((e) => {
    console.error('Error creating faculty user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
