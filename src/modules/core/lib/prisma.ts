import { PrismaClient as SqliteClient } from '@prisma/client';
import { PrismaClient as MysqlClient } from '@/generated/mysql-client';
import { PrismaClient as PostgresClient } from '@/generated/postgres-client';

export type AnyPrismaClient = SqliteClient | MysqlClient | PostgresClient;

const globalForPrisma = globalThis as unknown as {
  prisma: AnyPrismaClient | undefined;
  currentDbUrl: string | undefined;
};

export function getPrismaClient(overrideUrl?: string): AnyPrismaClient {
  const url = overrideUrl || process.env.DATABASE_URL || '';

  // If already instantiated for this URL, reuse
  if (globalForPrisma.prisma && globalForPrisma.currentDbUrl === url && !overrideUrl) {
    return globalForPrisma.prisma;
  }

  let client: AnyPrismaClient;
  if (url.startsWith('mysql:')) {
    client = new MysqlClient({
      datasources: { db: { url } },
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  } else if (url.startsWith('postgres:') || url.startsWith('postgresql:')) {
    client = new PostgresClient({
      datasources: { db: { url } },
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  } else {
    client = new SqliteClient({
      datasources: url ? { db: { url } } : undefined,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }

  if (!overrideUrl) {
    globalForPrisma.prisma = client;
    globalForPrisma.currentDbUrl = url;
  }

  return client;
}

export function resetPrismaClient(newUrl?: string): AnyPrismaClient {
  if (globalForPrisma.prisma) {
    try {
      (globalForPrisma.prisma as any).$disconnect?.();
    } catch {}
    globalForPrisma.prisma = undefined;
    globalForPrisma.currentDbUrl = undefined;
  }
  return getPrismaClient(newUrl);
}

// Transparent Proxy so all existing `prisma.xxx` calls delegate dynamically
export const prisma: SqliteClient = new Proxy({} as unknown as SqliteClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const val = (client as any)[prop];
    if (typeof val === 'function') {
      return val.bind(client);
    }
    return val;
  }
});

export default prisma;
