import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const optionals = [
    { name: 'Geography', slug: 'geography' },
    { name: 'Political Science & IR', slug: 'psir' },
    { name: 'Public Administration', slug: 'pub-ad' },
    { name: 'Sociology', slug: 'sociology' },
    { name: 'Agriculture', slug: 'agriculture' },
    { name: 'History', slug: 'history' },
    { name: 'Anthropology', slug: 'anthropology' },
  ];

  console.log('Seeding optional subjects...');

  for (const opt of optionals) {
    await prisma.optionalSubject.upsert({
      where: { slug: opt.slug },
      update: { name: opt.name },
      create: { name: opt.name, slug: opt.slug },
    });
    console.log(`- ${opt.name}`);
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
