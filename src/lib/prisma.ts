import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL
  const pool = new Pool({ 
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
  })
  const adapter = new PrismaPg(pool)
  const baseClient = new PrismaClient({ adapter })

  // Extend PrismaClient to catch connection/schema errors on read queries and return safe fallbacks
  return baseClient.$extends({
    query: {
      async $allOperations({ model, operation, args, query }) {
        try {
          return await query(args);
        } catch (error) {
          console.error(`[Prisma Safe Catch] Database error during ${model ?? "global"}.${operation}:`, error);

          const err = error as { code?: string; name?: string; message?: string } & Record<string, unknown>;

          // Detect connection, initialization, or missing-table exceptions (e.g. table not found P2021)
          const isDbUnavailable =
            err?.code === "P2021" ||
            err?.name === "PrismaClientInitializationError" ||
            err?.name === "PrismaClientKnownRequestError" ||
            err?.code === "ETIMEDOUT" ||
            err?.message?.includes("does not exist") ||
            err?.message?.includes("connect");

          if (isDbUnavailable) {
            if (operation === "findMany" || operation === "groupBy") {
              return [];
            }
            if (
              operation === "findUnique" ||
              operation === "findUniqueOrThrow" ||
              operation === "findFirst" ||
              operation === "findFirstOrThrow"
            ) {
              return null;
            }
            if (operation === "count") {
              return 0;
            }
            if (operation === "aggregate") {
              return { _sum: {}, _avg: {}, _count: 0, _min: null, _max: null };
            }
          }

          throw error;
        }
      },
    },
  });
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
