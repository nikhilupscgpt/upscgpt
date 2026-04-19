import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const orgCount = await prisma.organization.count()
  const intelCount = await prisma.mapEntry.count({ where: { worldPart: 'INTELLIGENCE' } })
  const physCount = await prisma.mapEntry.count({ where: { worldPart: 'PHYSICAL' } })
  
  console.log('--- DB Check ---')
  console.log('Organizations:', orgCount)
  console.log('Intelligence Entries:', intelCount)
  console.log('Physical Entries:', physCount)
}

main().finally(() => prisma.$disconnect())
