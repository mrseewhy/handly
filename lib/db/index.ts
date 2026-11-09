import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/lib/db/schema";

/**
 * Single Drizzle client for the whole server runtime.
 *
 * `pg.Pool` is cached on `globalThis` because Next dev/HMR re-evaluates modules
 * and would otherwise leak a new pool (and its sockets) on every reload.
 */

declare global {
  var __handlyPool: Pool | undefined;
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Add it to .env (see .env.example) before starting the app.",
  );
}

const pool =
  global.__handlyPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // Neon (and most managed Postgres) terminate TLS with a cert chain that is
    // not in the local trust store; the connection is still encrypted.
    ssl: process.env.DATABASE_URL.includes("sslmode=disable")
      ? false
      : { rejectUnauthorized: false },
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  global.__handlyPool = pool;
}

export const db = drizzle(pool, { schema });

export { pool };
