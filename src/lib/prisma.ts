import { PrismaClient } from "@prisma/client";

function createPrismaClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoAuth = process.env.TURSO_AUTH_TOKEN;

  // Production: use Turso (libSQL)
  if (tursoUrl) {
    // Dynamic import avoids bundling libsql in dev when not needed
    const { PrismaLibSQL } = require("@prisma/adapter-libsql");
    const { createClient } = require("@libsql/client");

    const libsql = createClient({
      url: tursoUrl,
      authToken: tursoAuth,
    });
    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({ adapter });
  }

  // Development: use local SQLite via better-sqlite3
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  const path = require("path");
  const dbPath = path.join(process.cwd(), "prisma", "dev.db");
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
