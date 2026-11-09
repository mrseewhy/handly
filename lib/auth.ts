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

if (!process.env.BETTER_AUTH_SECRET) {
  // Fail loudly in dev instead of silently signing sessions with an empty secret.
  throw new Error(
    "BETTER_AUTH_SECRET is not set. Generate one with: openssl rand -base64 32",
  );
}

export const auth = betterAuth({
  appName: "Handly",
  secret: process.env.BETTER_AUTH_SECRET,
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

export type AuthSession = typeof auth.$Infer.Session;
