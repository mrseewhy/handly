"use client";

import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

/**
 * Browser auth client. Calls go to /api/auth/* (see app/api/auth/[...all]/route.ts).
 */
export const authClient = createAuthClient({
  plugins: [adminClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
