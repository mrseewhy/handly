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

/**
 * The pool is created on first use, not on import.
 *
 * Next collects page data during `next build`, which imports every route. A
 * module-level throw made the build itself fail whenever DATABASE_URL was absent
 * (for example in CI, or before Vercel env vars are configured) instead of
 * failing at request time where the error is actionable.
 */
function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env (see .env.example) before starting the app.",
    );
  }

  return new Pool({
    connectionString,
    // Neon (and most managed Postgres) terminate TLS with a cert chain that is
    // not in the local trust store; the connection is still encrypted.
    ssl: connectionString.includes("sslmode=disable")
      ? false
      : { rejectUnauthorized: false },
    max: 10,
  });
}

function getPool(): Pool {
  if (!global.__handlyPool) {
    global.__handlyPool = createPool();
  }
  return global.__handlyPool;
}

/** Kept for scripts that import `pool` directly; resolves on first access. */
export const pool = new Proxy({} as Pool, {
  get(_target, prop) {
    const instance = getPool();
    const value = Reflect.get(instance, prop) as unknown;
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

/**
 * Drizzle is constructed on first use, not at import.
 *
 * `drizzle(pool, ...)` inspects the pool object, so building it eagerly touches
 * the connection during `next build`'s page-data collection and makes the build
 * depend on DATABASE_URL being present. Deferring keeps the build environment
 * independent; a missing URL now surfaces on the first query instead.
 */
let drizzleInstance: ReturnType<typeof buildDb> | undefined;

function buildDb() {
  return drizzle(getPool(), { schema });
}

function getDb(): ReturnType<typeof buildDb> {
  drizzleInstance ??= buildDb();
  return drizzleInstance;
}

export const db = new Proxy({} as ReturnType<typeof buildDb>, {
  get(_target, prop) {
    const instance = getDb();
    const value = Reflect.get(instance, prop) as unknown;
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
