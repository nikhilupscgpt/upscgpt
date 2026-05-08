import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const issueCount = await prisma.issue.count()
  const issueWithMetadata = await prisma.issue.count({
    where: {
      metadata: { not: null }
    }
  })
  
  const pyqCount = await prisma.previousYearQuestion.count()
  const pyqWithMetadata = await prisma.previousYearQuestion.count({
    where: {
      metadata: { not: null }
    }
  })

  console.log('--- Discovery Engine Status ---')
  console.log(`Issues: ${issueWithMetadata}/${issueCount} nodes processed`)
  console.log(`PYQs: ${pyqWithMetadata}/${pyqCount} questions processed`)
}

main().finally(() => prisma.$disconnect())
