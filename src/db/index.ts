import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";

type DbClient = ReturnType<typeof drizzle<typeof schema>>;

let dbInstance: DbClient | null = null;

export function getDb(): DbClient {
  if (dbInstance) {
    return dbInstance;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const client = postgres(connectionString, {
    ssl: "prefer",
    max: 1,
  });

  dbInstance = drizzle(client, { schema });
  return dbInstance;
}
