// Dynamic import to handle Prisma Client generation
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('@prisma/client');
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

type PrismaClientType = InstanceType<typeof PrismaClient>;

// Load environment variables
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientType | undefined;
};

let db: PrismaClientType;

if (globalForPrisma.prisma) {
  db = globalForPrisma.prisma;
} else {
  // Create PostgreSQL connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  // Create Prisma adapter
  const adapter = new PrismaPg(pool);

  db = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = db;
  }
}

export { db };
