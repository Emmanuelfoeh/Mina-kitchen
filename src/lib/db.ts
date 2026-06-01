// Dynamic import to handle Prisma Client generation
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient, Prisma } = require('@prisma/client');
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

type PrismaClientType = InstanceType<typeof PrismaClient>;

// Money columns are Decimal. By default a Prisma.Decimal serializes to a JSON
// *string*; the API contract (and the frontend) expect JSON *numbers*. Make
// Decimal serialize as a number so every NextResponse.json(...) that returns a
// price/total stays numeric. Decimal(10,2) values fit exactly in a JS number.
if (Prisma?.Decimal && !Prisma.Decimal.prototype.__toJSONPatched) {
  Prisma.Decimal.prototype.toJSON = function toJSON(this: {
    toNumber: () => number;
  }) {
    return this.toNumber();
  };
  Prisma.Decimal.prototype.__toJSONPatched = true;
}

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
