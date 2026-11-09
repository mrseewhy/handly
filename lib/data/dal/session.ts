import "server-only";
import { redirect } from "next/navigation";

import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "@/lib/auth";

/**
 * Session access for the DAL.
 *
 * This is the ONLY place the app turns a request into an identity. Every
 * exported DAL function calls one of the helpers below, so a page can never
 * read another user's data by forgetting a check.
 *
 * `cache()` dedupes the lookup within a single render pass.
 */

export type Role = "admin" | "customer";

export class UnauthorizedError extends Error {
  constructor(message = "You must be signed in to do that.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "You do not have access to this.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export interface Actor {
  id: string;
  name: string;
  email: string;
  /** Normalised: Better Auth stores admins as "admin"; everyone else is a customer. */
  role: Role;
  initials: string;
}

export function initialsFor(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

function normaliseRole(role: string | null | undefined): Role {
  return role === "admin" ? "admin" : "customer";
}

/** Returns the signed-in actor, or null when there is no session. */
export const getActor = cache(async (): Promise<Actor | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  const { user } = session;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: normaliseRole((user as { role?: string | null }).role),
    initials: initialsFor(user.name),
  };
});

/** Throws unless there is a session. Use in server actions and guarded pages. */
export async function requireActor(): Promise<Actor> {
  const actor = await getActor();
  if (!actor) throw new UnauthorizedError();
  return actor;
}

/** Throws unless the signed-in actor is an admin. */
export async function requireAdmin(): Promise<Actor> {
  const actor = await requireActor();
  if (actor.role !== "admin") throw new ForbiddenError();
  return actor;
}

/**
 * Page-level admin guard.
 *
 * Acts instead of throwing: an admin page reached by a customer should redirect
 * them, not render a 500. Next renders the layout and page in parallel, so the
 * layout's own redirect cannot be relied on to run first — the page's data
 * calls would throw before it happened.
 */
export async function requireAdminPage(): Promise<Actor> {
  const actor = await getActor();
  if (!actor) redirect("/sign-in?next=/admin");
  if (actor.role !== "admin") redirect("/dashboard");
  return actor;
}

/**
 * Admins can see every ticket; customers only their own.
 * Returns the actor plus whether they are an admin.
 */
export async function requireTicketReader(): Promise<{ actor: Actor; isAdmin: boolean }> {
  const actor = await requireActor();
  return { actor, isAdmin: actor.role === "admin" };
}
