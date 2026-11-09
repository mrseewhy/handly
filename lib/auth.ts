import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

/**
 * Better Auth server instance.
 *
 * - Credentials (email + password) sign-in, no email verification in this app.
 * - The admin plugin provides `role`, ban, and user-management endpoints.
 * - `nextCookies()` must be last so it can write cookies from server actions.
 */

const authSchema = {
  user: schema.user,
  session: schema.session,
  account: schema.account,
  verification: schema.verification,
};

function requireSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    // Fail loudly rather than silently signing sessions with an empty secret.
    // Thrown on first use, not on import: `next build` imports every route and
    // must not fail when secrets live only in the deployment environment.
    throw new Error(
      "BETTER_AUTH_SECRET is not set. Generate one with: openssl rand -base64 32",
    );
  }
  return secret;
}

const createAuth = () =>
  betterAuth({
  appName: "Handly",
  secret: requireSecret(),
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
    schemaName: "auth",
    usePlural: false,
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    requireEmailVerification: false,

    /**
     * No email provider is configured yet. Better Auth refuses to start a reset
     * without this callback, so we implement it by logging the link instead of
     * silently dropping it: an admin can copy the URL from the server logs and
     * pass it on. Swap this body for a real send when a provider is added.
     */
    sendResetPassword: async ({ user, url }) => {
      console.info(
        `[auth] password reset for ${user.email}: ${url}`,
      );
    },
  },

  user: {
    // Account self-deletion. Off by default in Better Auth; our DAL guards it
    // so an account with open tickets cannot be removed.
    deleteUser: { enabled: true },
    additionalFields: {
      // Set at sign-up from the form, not editable afterwards.
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: true,
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh once a day
  },

  plugins: [admin(), nextCookies()],
  });

/**
 * The auth instance is built on first use.
 *
 * Both `betterAuth()` and its secret check used to run at import time, so
 * `next build` failed outright when only the deployment environment had the
 * secret. Deferring keeps the build environment-independent while still failing
 * loudly on the first real request.
 */
let instance: ReturnType<typeof createAuth> | undefined;

function getAuth(): ReturnType<typeof createAuth> {
  instance ??= createAuth();
  return instance;
}

export const auth = new Proxy({} as ReturnType<typeof createAuth>, {
  get(_target, prop) {
    const instance = getAuth();
    const value = Reflect.get(instance, prop) as unknown;
    return typeof value === "function" ? value.bind(instance) : value;
  },
  // Without this, `"handler" in auth` (used by toNextJsHandler) reports false
  // against the empty proxy target and the adapter treats auth as a bare
  // function, which fails at runtime.
  has(_target, prop) {
    return prop in getAuth();
  },
});

export type AuthSession = ReturnType<typeof createAuth>["$Infer"]["Session"];
