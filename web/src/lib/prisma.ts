import { PrismaClient } from "@prisma/client";

// Singleton in development to survive HMR/hot-reload — Next.js dev rebuilds
// modules and would otherwise leak PrismaClient instances and exhaust the
// connection pool. In production each cold-start gets a fresh client.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
