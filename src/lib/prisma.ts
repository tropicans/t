import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://taut_admin:taut_password_123!@localhost:5436/taut_db?schema=public";

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter } as any);
}

// Reuse singleton across hot module reloads in development
if (!global.__prisma) {
  global.__prisma = createPrismaClient();
}

export const prisma = global.__prisma;
