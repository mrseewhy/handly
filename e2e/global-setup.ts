import { execSync } from "node:child_process";
import pg from "pg";
import "dotenv/config";

/**
 * Prepares a throwaway database for the E2E run.
 *
 * The tests create tickets and change settings, so pointing them at the demo
 * database would corrupt it and make repeat runs non-deterministic. Instead we
 * derive a sibling database name from DATABASE_URL and rebuild it from the real
 * migrations, then run the real seed script.
 *
 * Requires the `postgres` role to be able to CREATE DATABASE on the same host.
 * Neon does allow this; if your provider does not, set E2E_DATABASE_URL to a
 * database you have already created and this setup will only migrate + seed it.
 */

const base = process.env.DATABASE_URL;
if (!base) throw new Error("DATABASE_URL is not set; E2E needs it to clone a test database.");

export const E2E_DATABASE_URL =
  process.env.E2E_DATABASE_URL ?? deriveTestUrl(base);

/** swaps the database name in the connection string for `<name>_e2e`. */
function deriveTestUrl(url: string): string {
  const parsed = new URL(url);
  const dbName = parsed.pathname.replace(/^\//, "");
  parsed.pathname = `/${dbName}_e2e`;
  return parsed.toString();
}

function withDatabase(url: string, dbName: string): string {
  const parsed = new URL(url);
  parsed.pathname = `/${dbName}`;
  return parsed.toString();
}

function parseDbName(url: string): string {
  return new URL(url).pathname.replace(/^\//, "");
}

export default async function globalSetup() {
  const targetDb = parseDbName(E2E_DATABASE_URL);

  if (!process.env.E2E_DATABASE_URL) {
    // Connect to the maintenance DB to create/drop the test database.
    const adminUrl = withDatabase(base!, "postgres");
    const admin = new pg.Client({
      connectionString: adminUrl,
      ssl: adminUrl.includes("sslmode=disable") ? undefined : { rejectUnauthorized: false },
    });
    await admin.connect();
    try {
      await admin.query(`DROP DATABASE IF EXISTS "${targetDb}" WITH (FORCE)`);
      await admin.query(`CREATE DATABASE "${targetDb}"`);
    } finally {
      await admin.end();
    }
  }

  // Build the schema from the same migrations production uses, so drift between
  // migrations and the E2E schema is impossible.
  execSync("npx drizzle-kit migrate", {
    stdio: "pipe",
    env: { ...process.env, DATABASE_URL: E2E_DATABASE_URL },
  });

  execSync("node --experimental-strip-types scripts/seed.ts", {
    stdio: "pipe",
    env: { ...process.env, DATABASE_URL: E2E_DATABASE_URL },
  });

  // The webServer inherits this so the app under test uses the test database.
  process.env.DATABASE_URL = E2E_DATABASE_URL;
}
