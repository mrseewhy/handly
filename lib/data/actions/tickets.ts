"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { and, eq, like, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { activityLog, notifications, ticketReplies, tickets } from "@/lib/db/schema";
import { requireActor, requireAdmin, requireTicketReader } from "@/lib/data/dal/session";
import {
  insertAttachments,
  validateAttachment,
  type NewAttachment,
} from "@/lib/data/dal/attachments";
import { adminIds, notifyUsers } from "@/lib/data/dal/notify";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/ticket-config";

/* ------------------------------------------------------------------ */
/* Result type                                                         */
/* ------------------------------------------------------------------ */

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** SLA hours by priority (designsystem.md §2.6 / support policy). */
const SLA_HOURS: Record<TicketPriority, number> = {
  urgent: 4,
  high: 8,
  medium: 24,
  low: 72,
};

function fail(error: string, fieldErrors?: Record<string, string>): ActionResult<never> {
  return { ok: false, error, fieldErrors };
}

/* ------------------------------------------------------------------ */
/* Create a ticket (customer)                                          */
/* ------------------------------------------------------------------ */

export interface CreateTicketInput {
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  /** Optional files sent with the first message. */
  files?: NewAttachment[];
}

export async function createTicket(
  input: CreateTicketInput,
): Promise<ActionResult<{ displayId: string }>> {
  let actor;
  try {
    actor = await requireActor();
  } catch {
    return fail("You must be signed in to create a ticket.");
  }

  const subject = input.subject?.trim() ?? "";
  const description = input.description?.trim() ?? "";

  const fieldErrors: Record<string, string> = {};
  if (subject.length < 5) fieldErrors.subject = "Enter a subject of at least 5 characters.";
  if (description.length < 15) fieldErrors.description = "Add at least 15 characters of detail.";
  if (!TICKET_CATEGORIES.includes(input.category)) fieldErrors.category = "Choose a category.";
  if (!TICKET_PRIORITIES.includes(input.priority)) fieldErrors.priority = "Choose a priority.";
  if (Object.keys(fieldErrors).length > 0) {
    return fail("Please fix the highlighted fields.", fieldErrors);
  }

  const files = input.files ?? [];
  for (const file of files) {
    const problem = validateAttachment(file);
    if (problem) return fail(problem);
  }

  const now = new Date();
  const slaDeadline = new Date(now.getTime() + SLA_HOURS[input.priority] * 3_600_000);
  const preview = description.length > 80 ? `${description.slice(0, 80)}…` : description;
  const replyId = randomUUID();
  const activityId = randomUUID();

  let displayId = "";

  await db.transaction(async (tx) => {
    // Insert first with a temporary id, read back the identity `number`, then
    // set the display id. This keeps HND-<n> monotonic and race-free.
    const tempId = `tmp_${replyId}`;
    const [row] = await tx
      .insert(tickets)
      .values({
        id: tempId,
        subject,
        description,
        status: "open",
        priority: input.priority,
        category: input.category,
        creatorId: actor.id,
        creatorName: actor.name,
        creatorEmail: actor.email,
        createdAt: now,
        updatedAt: now,
        slaDeadline,
        preview,
        unreadForCustomer: false,
        unreadForAdmin: true,
      })
      .returning({ number: tickets.number });

    displayId = `HND-${row.number}`;

    await tx.update(tickets).set({ id: displayId }).where(eq(tickets.id, tempId));

    await tx.insert(ticketReplies).values({
      id: replyId,
      ticketId: displayId,
      authorId: actor.id,
      authorName: actor.name,
      authorRole: actor.role,
      kind: "customer",
      body: description,
      createdAt: now,
    });

    await insertAttachments(tx, {
      ticketId: displayId,
      replyId,
      uploaderId: actor.id,
      files,
    });

    await tx.insert(activityLog).values({
      id: activityId,
      actorId: actor.id,
      actorName: actor.name,
      kind: "ticket_created",
      action: "created ticket",
      target: `${displayId} · ${subject}`,
      href: `/admin/tickets/${displayId}`,
      createdAt: now,
    });

    // A new ticket needs a first response, so tell the people who can answer it.
    await notifyUsers(tx, {
      actorId: actor.id,
      userIds: await adminIds(),
      ticketId: displayId,
      title: `New ${input.priority} ticket ${displayId}`,
      body: `${actor.name}: ${subject}`,
      tone: input.priority === "urgent" ? "danger" : "info",
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tickets");
  revalidatePath("/admin");
  revalidatePath("/admin/tickets");
  revalidatePath("/admin/tickets/unanswered");

  return { ok: true, data: { displayId } };
}

/* ------------------------------------------------------------------ */
/* Reply to a ticket                                                   */
/* ------------------------------------------------------------------ */

export interface ReplyInput {
  displayId: string;
  body: string;
  /** Admin-only: post as an internal note instead of a public reply. */
  internal?: boolean;
  /** Files attached to this reply. */
  files?: NewAttachment[];
}

export async function replyToTicket(input: ReplyInput): Promise<ActionResult> {
  let actor;
  let isAdmin: boolean;
  try {
    const reader = await requireTicketReader();
    actor = reader.actor;
    isAdmin = reader.isAdmin;
  } catch {
    return fail("You must be signed in to reply.");
  }

  const body = input.body?.trim() ?? "";
  const files = input.files ?? [];

  // A reply with files but no text is legitimate ("here is the log").
  if (body.length < 1 && files.length === 0) return fail("Write a reply before sending.");
  if (body.length > 10_000) return fail("Replies are limited to 10,000 characters.");
  if (input.internal && !isAdmin) return fail("Only staff can post internal notes.");
  for (const file of files) {
    const problem = validateAttachment(file);
    if (problem) return fail(problem);
  }

  const [ticket] = await db
    .select({
      id: tickets.id,
      subject: tickets.subject,
      creatorId: tickets.creatorId,
      assigneeId: tickets.assigneeId,
      firstResponseAt: tickets.firstResponseAt,
      status: tickets.status,
    })
    .from(tickets)
    .where(eq(tickets.id, input.displayId))
    .limit(1);

  if (!ticket) return fail("That ticket no longer exists.");
  // Customers may only reply to their own ticket.
  if (!isAdmin && ticket.creatorId !== actor.id) {
    return fail("You do not have access to that ticket.");
  }
  if (input.internal && !isAdmin) return fail("Only staff can post internal notes.");

  const now = new Date();
  const kind = input.internal ? "internal_note" : isAdmin ? "agent" : "customer";
  const replyId = randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(ticketReplies).values({
      id: replyId,
      ticketId: ticket.id,
      authorId: actor.id,
      authorName: actor.name,
      authorRole: actor.role,
      kind,
      body,
      createdAt: now,
    });

    // Public replies bump the preview and unread flag for the other side;
    // internal notes are staff-only and must not notify the customer.
    const preview = body.length > 80 ? `${body.slice(0, 80)}…` : body;

    await tx
      .update(tickets)
      .set({
        updatedAt: now,
        ...(input.internal
          ? {}
          : {
              preview,
              // An agent reply counts as the first response.
              firstResponseAt: isAdmin
                ? ticket.firstResponseAt ?? now
                : ticket.firstResponseAt,
              unreadForCustomer: isAdmin,
              unreadForAdmin: !isAdmin,
              // Reopen a resolved ticket when the customer replies again.
              status:
                !isAdmin && (ticket.status === "resolved" || ticket.status === "closed")
                  ? "open"
                  : ticket.status,
              resolvedAt:
                !isAdmin && (ticket.status === "resolved" || ticket.status === "closed")
                  ? null
                  : undefined,
            }),
      })
      .where(eq(tickets.id, ticket.id));

    await insertAttachments(tx, {
      ticketId: ticket.id,
      replyId,
      uploaderId: actor.id,
      files,
    });

    await tx.insert(activityLog).values({
      id: randomUUID(),
      actorId: actor.id,
      actorName: actor.name,
      kind: "reply",
      action: input.internal ? "added an internal note to" : "replied to",
      target: `${ticket.id} · ${ticket.subject}`,
      href: `/admin/tickets/${ticket.id}`,
      createdAt: now,
    });

    // An agent reply means every admin alert about this ticket has been dealt
    // with: the new-ticket ping, "customer replied", "you were assigned". They
    // all point at the same thread, which now has an answer. Leaving them
    // unread made the badge report work that was already picked up.
    if (isAdmin && !input.internal) {
      await tx
        .update(notifications)
        .set({ read: true })
        .where(
          and(
            eq(notifications.read, false),
            like(notifications.href, `/admin/tickets/${ticket.id}`),
          ),
        );
    }

    // Internal notes are staff-only: never notify the customer about them.
    if (isAdmin && !input.internal) {
      await notifyUsers(tx, {
        actorId: actor.id,
        userIds: [ticket.creatorId],
        ticketId: ticket.id,
        title: `New reply on ${ticket.id}`,
        body: `${actor.name} replied to your ticket.`,
        tone: "info",
      });
    }

    // A customer reply needs an answer: tell the assignee, or every admin when
    // nobody owns it yet so it cannot sit unnoticed.
    if (!isAdmin && !input.internal) {
      await notifyUsers(tx, {
        actorId: actor.id,
        userIds: ticket.assigneeId ? [ticket.assigneeId] : await adminIds(),
        ticketId: ticket.id,
        title: `Customer replied on ${ticket.id}`,
        body: `${actor.name} replied to the ticket.`,
        tone: "warning",
      });
    }
  });

  revalidatePath(`/dashboard/tickets/${ticket.id}`);
  revalidatePath(`/admin/tickets/${ticket.id}`);
  revalidatePath("/dashboard/tickets");
  revalidatePath("/admin/tickets");
  revalidatePath("/dashboard/notifications");

  return { ok: true, data: undefined };
}

/* ------------------------------------------------------------------ */
/* Update ticket properties (admin)                                    */
/* ------------------------------------------------------------------ */

export interface UpdateTicketInput {
  displayId: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assigneeId?: string | null;
}

export async function updateTicket(input: UpdateTicketInput): Promise<ActionResult> {
  let actor;
  try {
    actor = await requireAdmin();
  } catch {
    return fail("Only admins can change ticket properties.");
  }

  if (input.status && !TICKET_STATUSES.includes(input.status)) {
    return fail("Unknown status.");
  }
  if (input.priority && !TICKET_PRIORITIES.includes(input.priority)) {
    return fail("Unknown priority.");
  }

  const [ticket] = await db
    .select({
      id: tickets.id,
      subject: tickets.subject,
      status: tickets.status,
      priority: tickets.priority,
      assigneeId: tickets.assigneeId,
      creatorId: tickets.creatorId,
    })
    .from(tickets)
    .where(eq(tickets.id, input.displayId))
    .limit(1);

  if (!ticket) return fail("That ticket no longer exists.");

  const now = new Date();
  const events: string[] = [];
  let statusChanged = false;
  let assigneeChanged = false;

  await db.transaction(async (tx) => {
    const patch: Partial<typeof tickets.$inferInsert> = { updatedAt: now };

    if (input.status && input.status !== ticket.status) {
      patch.status = input.status;
      statusChanged = true;
      if (input.status === "resolved") patch.resolvedAt = now;
      if (input.status === "open") patch.resolvedAt = null;
      events.push(`Status changed to ${labelFor(input.status)}`);
    }
    if (input.priority && input.priority !== ticket.priority) {
      patch.priority = input.priority;
      events.push(`Priority changed to ${labelFor(input.priority)}`);
    }
    if (input.assigneeId !== undefined && input.assigneeId !== ticket.assigneeId) {
      patch.assigneeId = input.assigneeId;
      assigneeChanged = true;
      events.push(input.assigneeId ? "Ticket assigned" : "Ticket unassigned");
    }

    if (Object.keys(patch).length === 1) return; // nothing actually changed

    await tx.update(tickets).set(patch).where(eq(tickets.id, ticket.id));

    for (const event of events) {
      await tx.insert(ticketReplies).values({
        id: randomUUID(),
        ticketId: ticket.id,
        authorId: null,
        authorName: "System",
        authorRole: "user",
        kind: "system",
        event,
        createdAt: now,
      });
    }

    await tx.insert(activityLog).values({
      id: randomUUID(),
      actorId: actor.id,
      actorName: actor.name,
      kind: input.status ? "status_change" : "assignment",
      action: input.status ? `moved to ${labelFor(input.status)}` : "updated",
      target: `${ticket.id} · ${ticket.subject}`,
      href: `/admin/tickets/${ticket.id}`,
      createdAt: now,
    });

    // The customer cares about progress on their own ticket.
    if (statusChanged) {
      // Earlier "new reply" alerts for this thread are superseded by the status
      // change; keeping them unread would bury the news that actually matters.
      await tx
        .update(notifications)
        .set({ read: true })
        .where(
          and(
            eq(notifications.read, false),
            eq(notifications.userId, ticket.creatorId),
            like(notifications.href, `/dashboard/tickets/${ticket.id}`),
          ),
        );

      await notifyUsers(tx, {
        actorId: actor.id,
        userIds: [ticket.creatorId],
        ticketId: ticket.id,
        title: `${ticket.id} is now ${labelFor(input.status!)}`,
        body:
          input.status === "resolved"
            ? `${actor.name} marked your ticket resolved. Reply if it is not fixed.`
            : `${actor.name} updated the status of your ticket.`,
        tone: input.status === "resolved" ? "success" : "info",
      });
    }

    // Tell the new assignee they own it now.
    if (assigneeChanged && input.assigneeId) {
      await notifyUsers(tx, {
        actorId: actor.id,
        userIds: [input.assigneeId],
        ticketId: ticket.id,
        title: `You were assigned ${ticket.id}`,
        body: `${actor.name} assigned this ticket to you.`,
        tone: "info",
      });
    }
  });

  revalidatePath(`/admin/tickets/${ticket.id}`);
  revalidatePath("/admin/tickets");
  revalidatePath("/admin");
  return { ok: true, data: undefined };
}

function labelFor(value: string): string {
  if (value === "in_progress") return "In progress";
  if (value === "on_hold") return "On hold";
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ");
}

/* ------------------------------------------------------------------ */
/* Admin: suspend / restore a user                                     */
/* ------------------------------------------------------------------ */

export async function setUserSuspended(
  userId: string,
  suspended: boolean,
): Promise<ActionResult> {
  let actor;
  try {
    actor = await requireAdmin();
  } catch {
    return fail("Only admins can change account status.");
  }

  if (userId === actor.id) return fail("You cannot suspend your own account.");

  const { user } = await import("@/lib/db/schema");
  const [target] = await db
    .select({ id: user.id, name: user.name, role: user.role })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!target) return fail("That user no longer exists.");

  await db.transaction(async (tx) => {
    await tx
      .update(user)
      .set({
        banned: suspended,
        banReason: suspended ? "Suspended by an administrator" : null,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    // Suspending must end any live sessions immediately.
    if (suspended) {
      await tx.execute(sql`delete from auth.session where user_id = ${userId}`);
    }

    await tx.insert(activityLog).values({
      id: randomUUID(),
      actorId: actor.id,
      actorName: actor.name,
      kind: "user_admin",
      action: suspended ? "suspended user" : "restored user",
      target: target.name,
      href: "/admin/users",
      createdAt: new Date(),
    });
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/activity");
  return { ok: true, data: undefined };
}

/* ------------------------------------------------------------------ */
/* Admin: remove an admin                                              */
/* ------------------------------------------------------------------ */

export async function removeAdmin(userId: string): Promise<ActionResult> {
  let actor;
  try {
    actor = await requireAdmin();
  } catch {
    return fail("Only admins can remove admins.");
  }

  if (userId === actor.id) return fail("You cannot remove your own admin access.");

  const { user } = await import("@/lib/db/schema");
  const [target] = await db
    .select({ id: user.id, name: user.name, role: user.role })
    .from(user)
    .where(and(eq(user.id, userId), eq(user.role, "admin")))
    .limit(1);

  if (!target) return fail("That admin no longer exists.");

  const [{ n: adminCount }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(user)
    .where(eq(user.role, "admin"));

  if (adminCount <= 1) return fail("You cannot remove the last admin.");

  await db.transaction(async (tx) => {
    // Demote rather than delete: their tickets and history stay intact.
    await tx
      .update(user)
      .set({ role: "customer", updatedAt: new Date() })
      .where(eq(user.id, userId));

    await tx.insert(activityLog).values({
      id: randomUUID(),
      actorId: actor.id,
      actorName: actor.name,
      kind: "admin",
      action: "removed admin access for",
      target: target.name,
      href: "/admin/admins",
      createdAt: new Date(),
    });
  });

  revalidatePath("/admin/admins");
  revalidatePath("/admin/activity");
  return { ok: true, data: undefined };
}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export async function markNotificationsRead(): Promise<ActionResult> {
  let actor;
  try {
    actor = await requireActor();
  } catch {
    return fail("You must be signed in.");
  }

  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.userId, actor.id), eq(notifications.read, false)));

  revalidatePath("/dashboard/notifications");
  revalidatePath("/admin");
  return { ok: true, data: undefined };
}

/* ------------------------------------------------------------------ */
/* Admin: contact messages                                             */
/* ------------------------------------------------------------------ */

/** Marks a contact-form message handled (or reopens it). Admin only. */
export async function setMessageHandled(
  messageId: string,
  handled: boolean,
): Promise<ActionResult> {
  let actor;
  try {
    actor = await requireAdmin();
  } catch {
    return fail("Only admins can update messages.");
  }

  const { contactMessages } = await import("@/lib/db/schema");

  const [row] = await db
    .select({ id: contactMessages.id, name: contactMessages.name })
    .from(contactMessages)
    .where(eq(contactMessages.id, messageId))
    .limit(1);

  if (!row) return fail("That message no longer exists.");

  await db
    .update(contactMessages)
    .set({ handledAt: handled ? new Date() : null })
    .where(eq(contactMessages.id, messageId));

  await db.insert(activityLog).values({
    id: randomUUID(),
    actorId: actor.id,
    actorName: actor.name,
    kind: "admin",
    action: handled ? "handled message from" : "reopened message from",
    target: row.name,
    href: "/admin/messages",
    createdAt: new Date(),
  });

  revalidatePath("/admin/messages");
  revalidatePath("/admin/activity");
  return { ok: true, data: undefined };
}

/* ------------------------------------------------------------------ */
/* Admin: promote a customer to admin                                  */
/* ------------------------------------------------------------------ */

/**
 * Grants admin access to an existing customer.
 *
 * Promotion is deliberately the only path: there is no invitation flow or email
 * provider, so "invite" would be a promise the app cannot keep. An admin picks
 * someone who already has an account.
 */
export async function promoteToAdmin(userId: string): Promise<ActionResult> {
  let actor;
  try {
    actor = await requireAdmin();
  } catch {
    return fail("Only admins can promote users.");
  }

  const { user } = await import("@/lib/db/schema");
  const [target] = await db
    .select({ id: user.id, name: user.name, role: user.role, banned: user.banned })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!target) return fail("That user no longer exists.");
  if (target.role === "admin") return fail("That user is already an admin.");
  if (target.banned) return fail("Restore that account before making it an admin.");

  await db.transaction(async (tx) => {
    await tx
      .update(user)
      .set({ role: "admin", updatedAt: new Date() })
      .where(eq(user.id, userId));

    await tx.insert(activityLog).values({
      id: randomUUID(),
      actorId: actor.id,
      actorName: actor.name,
      kind: "admin",
      action: "granted admin access to",
      target: target.name,
      href: "/admin/admins",
      createdAt: new Date(),
    });
  });

  revalidatePath("/admin/admins");
  revalidatePath("/admin/users");
  revalidatePath("/admin/activity");
  return { ok: true, data: undefined };
}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

/** Marks a single notification read. Scoped to the caller, so ids cannot be guessed. */
export async function markNotificationRead(id: string): Promise<ActionResult> {
  const actor = await requireActor();

  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, actor.id)));

  revalidatePath("/dashboard/notifications");
  revalidatePath("/admin/notifications");
  return { ok: true, data: undefined };
}
