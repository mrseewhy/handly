import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Add it to .env before running drizzle-kit.");
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  // Keep generated migrations readable in review.
  verbose: true,
  strict: true,
});
