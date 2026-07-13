// src/lib/prisma.js
// Prisma 7 removed the built-in engine — we must pass a driver adapter.
// We create a pg connection pool and hand it to Prisma via PrismaPg.

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

const globalForPrisma = globalThis;

// Reuse the pool and client across hot reloads in development
const pool =
  globalForPrisma.pool ||
  new Pool({ connectionString: process.env.DATABASE_URL });

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pool = pool;
  globalForPrisma.prisma = prisma;
}