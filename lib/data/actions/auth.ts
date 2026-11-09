"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getActor } from "@/lib/data/dal/session";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export type AuthResult =
  | { ok: true; role?: "customer" | "admin" }
  | { ok: false; error: string };

/** Where to land after signing in, by role. */
export async function landingPathForCurrentUser(): Promise<string> {
  const actor = await getActor();
  if (!actor) return "/sign-in";
  return actor.role === "admin" ? "/admin" : "/dashboard";
}

export async function signInAction(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const email = input.email?.trim().toLowerCase() ?? "";
  if (!email || !input.password) {
    return { ok: false, error: "Enter your email and password." };
  }

  // Slow down credential stuffing: 10 attempts per IP per 5 minutes.
  const limit = rateLimit(await clientKey("signin"), { limit: 10, windowMs: 5 * 60_000 });
  if (!limit.ok) {
    return { ok: false, error: "Too many sign-in attempts. Wait a few minutes and try again." };
  }

  try {
    await auth.api.signInEmail({
      body: { email, password: input.password },
      headers: await headers(),
    });
  } catch {
    // Deliberately vague: do not reveal whether the email exists.
    return { ok: false, error: "That email and password combination is not valid." };
  }

  // The client needs the role to pick a landing page: sending an admin to
  // /dashboard means landing in the customer area before being redirected.
  const actor = await getActor();
  return { ok: true, role: actor?.role ?? "customer" };
}

export async function signUpAction(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const name = input.name?.trim() ?? "";
  const email = input.email?.trim().toLowerCase() ?? "";

  if (name.length < 2) return { ok: false, error: "Enter your full name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (input.password.length < 12) {
    return { ok: false, error: "Use at least 12 characters for your password." };
  }

  // Sign-up is public: 5 accounts per IP per hour.
  const limit = rateLimit(await clientKey("signup"), { limit: 5, windowMs: 60 * 60_000 });
  if (!limit.ok) {
    return { ok: false, error: "Too many sign-up attempts. Try again later." };
  }

  try {
    await auth.api.signUpEmail({
      body: { name, email, password: input.password },
      headers: await headers(),
    });
  } catch (error) {
    const message =
      error instanceof Error && /exist/i.test(error.message)
        ? "An account with that email already exists."
        : "We could not create your account. Try again in a moment.";
    return { ok: false, error: message };
  }

  return { ok: true };
}

export async function signOutAction(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
  redirect("/sign-in");
}

/**
 * Starts a password reset. Better Auth emails the link when `sendResetPassword`
 * is configured; without an email provider we still return ok so the UI does
 * not leak whether an address is registered.
 */
export async function requestPasswordResetAction(input: {
  email: string;
}): Promise<AuthResult> {
  const email = input.email?.trim().toLowerCase() ?? "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  // Prevent reset-link spam: 3 requests per IP per 15 minutes.
  const limit = rateLimit(await clientKey("reset"), { limit: 3, windowMs: 15 * 60_000 });
  if (!limit.ok) {
    return { ok: false, error: "Too many reset requests. Try again later." };
  }

  try {
    await auth.api.requestPasswordReset({
      body: { email, redirectTo: "/reset-password" },
    });
  } catch {
    // Ignore: never reveal whether the address exists.
  }

  return { ok: true };
}

/**
 * Completes a password reset with the token from the emailed link.
 *
 * Better Auth validates the token and expiry; we only shape the input and keep
 * the error message vague enough not to leak account state.
 */
export async function resetPasswordAction(input: {
  token: string;
  password: string;
}): Promise<AuthResult> {
  const token = input.token?.trim() ?? "";
  if (!token) return { ok: false, error: "This reset link is invalid." };
  if (input.password.length < 12) {
    return { ok: false, error: "Use at least 12 characters for your password." };
  }

  try {
    await auth.api.resetPassword({
      body: { newPassword: input.password, token },
    });
  } catch {
    return {
      ok: false,
      error: "This reset link is invalid or has expired. Request a new one.",
    };
  }

  return { ok: true };
}
