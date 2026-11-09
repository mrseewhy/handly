import "server-only";

import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { notifications, user } from "@/lib/db/schema";
import type { NotificationTone } from "@/lib/view-types";

/**
 * Notification fan-out.
 *
 * Every notification is created here so the recipient's destination is decided
 * in one place: a customer's copy of an event links into `/dashboard/...`, an
 * admin's into `/admin/...`. Before this existed, links were hard-coded per
 * call-site and an admin could receive a `/dashboard/` link they had no access
 * to (the customer layout redirects admins to `/admin`).
 */

interface NotifyTx {
  insert: typeof db.insert;
}

export interface NotifyArgs {
  userIds: string[];
  title: string;
  body: string;
  /** Ticket display id, used to build a role-appropriate link. */
  ticketId: string;
  tone?: NotificationTone;
}

/** Never notify someone about their own action. */
function dedupe(ids: (string | null | undefined)[], excludeId: string): string[] {
  return [...new Set(ids.filter((id): id is string => Boolean(id)))].filter(
    (id) => id !== excludeId,
  );
}

/**
 * Inserts one notification per recipient, choosing the link by role.
 * Runs inside the caller's transaction so it commits with the event.
 */
export async function notifyUsers(
  tx: NotifyTx,
  args: NotifyArgs & { actorId: string },
): Promise<void> {
  const recipients = dedupe(args.userIds, args.actorId);
  if (recipients.length === 0) return;

  // One query to learn who is an admin, so links point somewhere reachable.
  const rows = await db
    .select({ id: user.id, role: user.role })
    .from(user)
    .where(inArray(user.id, recipients));

  if (rows.length === 0) return;

  await tx.insert(notifications).values(
    rows.map((row) => ({
      id: randomUUID(),
      userId: row.id,
      title: args.title,
      body: args.body,
      href:
        row.role === "admin"
          ? `/admin/tickets/${args.ticketId}`
          : `/dashboard/tickets/${args.ticketId}`,
      tone: args.tone ?? "info",
      read: false,
      createdAt: new Date(),
    })),
  );
}

/** Ids of every admin, for broadcasts like "a new ticket arrived". */
export async function adminIds(): Promise<string[]> {
  const rows = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.role, "admin"));
  return rows.map((r) => r.id);
}
