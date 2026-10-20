import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL
  const adapter = new PrismaMariaDb(connectionString ?? '')
  const baseClient = new PrismaClient({ adapter })

  // Extend PrismaClient to catch connection/schema errors on read queries and return safe fallbacks
  return baseClient.$extends({
    query: {
      async $allOperations({ model, operation, args, query }) {
        try {
          const result = await query(args);
          const globalStore = globalThis as unknown as { isDbDown?: boolean };
          if (globalStore.isDbDown) {
            globalStore.isDbDown = false;
          }
          return result;
        } catch (error) {
          const err = error as { code?: string; name?: string; message?: string } & Record<string, unknown>;

          const isWriteOperation = [
            "create",
            "update",
            "upsert",
            "delete",
            "createMany",
            "updateMany",
            "deleteMany",
            "executeRaw",
          ].includes(operation);

          if (isWriteOperation) {
            console.error(`[Prisma Write Error] Error during ${model ?? "global"}.${operation}:`, error);
            throw error;
          }

          // Detect connection, initialization, or missing-table exceptions (e.g. table not found P2021, unreachable P1001)
          const isDbUnavailable =
            err?.code === "P2021" ||
            err?.code === "P1001" ||
            err?.code === "P1002" ||
            err?.code === "ECONNREFUSED" ||
            err?.name === "PrismaClientInitializationError" ||
            err?.code === "ETIMEDOUT" ||
            err?.code === "PROTOCOL_CONNECTION_LOST" ||
            err?.message?.includes("does not exist") ||
            err?.message?.includes("connect") ||
            err?.message?.includes("ECONNREFUSED") ||
            err?.message?.includes("Access denied");

          if (isDbUnavailable) {
            const globalStore = globalThis as unknown as { isDbDown?: boolean };
            globalStore.isDbDown = true;
            console.warn(`[Prisma Safe Catch] Database is temporarily unavailable during read operation ${model ?? "global"}.${operation}. Returning safe fallback.`);
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

          console.error(`[Prisma Query Error] Error during ${model ?? "global"}.${operation}:`, error);
          throw error;
        }
      },
    },
  });
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
  isDbDown?: boolean;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}
