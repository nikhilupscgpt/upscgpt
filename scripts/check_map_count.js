import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const count = await prisma.mapEntry.count()
  console.log('MapEntry Count:', count)
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
