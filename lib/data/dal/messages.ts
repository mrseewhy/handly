import "server-only";

import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/data/dal/session";

export interface ContactMessageView {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  /** Set once an admin marks it handled. */
  handledAt: string | null;
  createdAt: string;
  /** Account of the sender, when they happened to be signed in. */
  userId: string | null;
}

const toView = (row: typeof contactMessages.$inferSelect): ContactMessageView => ({
  id: row.id,
  name: row.name,
  email: row.email,
  topic: row.topic,
  message: row.message,
  handledAt: row.handledAt ? row.handledAt.toISOString() : null,
  createdAt: row.createdAt.toISOString(),
  userId: row.userId,
});

/** All contact-form messages, unhandled first then newest. Admin only. */
export async function listContactMessages(): Promise<ContactMessageView[]> {
  await requireAdmin();
  const rows = await db
    .select()
    .from(contactMessages)
    .orderBy(
      // Unhandled (`handled_at is null`) sorts before handled.
      sql`${contactMessages.handledAt} asc nulls first`,
      asc(contactMessages.createdAt),
    );
  return rows.map(toView);
}

export interface MessageCounts {
  total: number;
  unhandled: number;
}

export async function getContactMessageCounts(): Promise<MessageCounts> {
  await requireAdmin();
  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`,
      unhandled: sql<number>`count(*) filter (where ${contactMessages.handledAt} is null)::int`,
    })
    .from(contactMessages);
  return { total: row?.total ?? 0, unhandled: row?.unhandled ?? 0 };
}

/** One message by id, for the detail view. Admin only. */
export async function getContactMessage(
  id: string,
): Promise<ContactMessageView | null> {
  await requireAdmin();
  const [row] = await db
    .select()
    .from(contactMessages)
    .where(eq(contactMessages.id, id))
    .limit(1);
  return row ? toView(row) : null;
}
