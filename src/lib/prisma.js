import { PrismaClient } from "@prisma/client"

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error"] : ["error"],
  })
}

const globalForPrisma = globalThis
if (globalForPrisma.prisma && (!globalForPrisma.prisma.placeInNews || !globalForPrisma.prisma.mappingPyq)) {
  globalForPrisma.prisma = undefined
}
const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export async function withRetry(fn, retries = 3, delay = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === retries - 1) throw err
      await new Promise((r) => setTimeout(r, delay * (i + 1)))
    }
  }
}

export { prisma }
export default prisma

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
