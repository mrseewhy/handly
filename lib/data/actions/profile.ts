"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { requireActor } from "@/lib/data/dal/session";
import { auth } from "@/lib/auth";
import type { ActionResult } from "@/lib/data/actions/tickets";

/**
 * Updates the signed-in user's profile.
 *
 * Email is intentionally not editable here: changing a sign-in identity needs
 * a verification round-trip, which is not built yet.
 */
export async function updateProfile(input: { name: string }): Promise<ActionResult> {
  let actor;
  try {
    actor = await requireActor();
  } catch {
    return { ok: false, error: "You must be signed in." };
  }

  const name = input.name?.trim() ?? "";
  if (name.length < 2) {
    return { ok: false, error: "Enter your full name (at least 2 characters)." };
  }
  if (name.length > 80) {
    return { ok: false, error: "Names are limited to 80 characters." };
  }

  await db
    .update(user)
    .set({ name, updatedAt: new Date() })
    .where(eq(user.id, actor.id));

  // The shell shows the name, so refresh the areas that render it.
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  revalidatePath("/admin");

  return { ok: true, data: undefined };
}

/**
 * Changes the signed-in user's password.
 *
 * Better Auth verifies the current password itself, so a stolen session alone
 * cannot rotate the credential. Other sessions are revoked so a compromised
 * device is logged out.
 */
export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<ActionResult> {
  try {
    await requireActor();
  } catch {
    return { ok: false, error: "You must be signed in." };
  }

  if (!input.currentPassword) {
    return { ok: false, error: "Enter your current password." };
  }
  if (input.newPassword.length < 12) {
    return { ok: false, error: "Use at least 12 characters for your new password." };
  }
  if (input.currentPassword === input.newPassword) {
    return { ok: false, error: "Choose a password different from your current one." };
  }

  try {
    await auth.api.changePassword({
      body: {
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
        revokeOtherSessions: true,
      },
      headers: await headers(),
    });
  } catch {
    return { ok: false, error: "That current password is not correct." };
  }

  return { ok: true, data: undefined };
}

/**
 * Deletes the signed-in user's own account.
 *
 * Refused while they still own tickets: `tickets.creator_id` cascades, so a
 * naive delete would silently destroy the support history admins rely on. The
 * user is told to ask an admin instead of us guessing.
 */
export async function deleteOwnAccount(input: {
  password: string;
}): Promise<ActionResult> {
  let actor;
  try {
    actor = await requireActor();
  } catch {
    return { ok: false, error: "You must be signed in." };
  }

  if (!input.password) return { ok: false, error: "Enter your password to confirm." };

  const { tickets, user } = await import("@/lib/db/schema");
  const [{ n: owned }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(tickets)
    .where(eq(tickets.creatorId, actor.id));

  if (owned > 0) {
    return {
      ok: false,
      error:
        owned === 1
          ? "You still have an open ticket, so we cannot delete your account yet. Ask an admin to close it first."
          : `You still own ${owned} tickets. Ask an admin to close them before deleting your account.`,
    };
  }

  try {
    await auth.api.deleteUser({
      body: { password: input.password },
      headers: await headers(),
    });
  } catch {
    return { ok: false, error: "That password is not correct." };
  }

  // Belt and braces: Better Auth removes sessions; clear our own user row's
  // dependent notifications if anything is left behind.
  await db.delete(user).where(eq(user.id, actor.id)).catch(() => {});

  return { ok: true, data: undefined };
}
