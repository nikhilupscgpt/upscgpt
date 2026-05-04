import { PrismaClient } from "@prisma/client"

// Neural Resync - Clear global cache to force schema update
if (globalThis.prisma) {
  console.log("Neural Re-Sync: Flushing Prisma Singleton...");
  globalThis.prisma.$disconnect().catch(() => {});
  globalThis.prisma = undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
}

const globalForPrisma = globalThis
const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
