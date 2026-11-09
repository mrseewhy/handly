import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { activityLog, notifications, user } from "@/lib/db/schema";
import { requireActor, requireAdmin } from "@/lib/data/dal/session";
import { makePage, parsePage, type Page } from "@/lib/pagination";
import type { Person } from "@/lib/view-types";

/* ------------------------------------------------------------------ */
/* Activity log                                                        */
/* ------------------------------------------------------------------ */

export type ActivityKind =
  | "ticket_created"
  | "reply"
  | "status_change"
  | "assignment"
  | "admin"
  | "auth"
  | "user_admin";

export interface ActivityView {
  id: string;
  actorId: string;
  actorName: string;
  at: string;
  action: string;
  target: string;
  href?: string;
  kind: ActivityKind;
}

function toActivity(row: typeof activityLog.$inferSelect): ActivityView {
  return {
    id: row.id,
    actorId: row.actorId ?? "",
    actorName: row.actorName,
    at: row.createdAt.toISOString(),
    action: row.action,
    target: row.target,
    href: row.href ?? undefined,
    kind: row.kind,
  };
}

/** Full audit trail, paginated — admin only. */
export async function listActivity(pageParam?: string | string[]): Promise<Page<ActivityView>> {
  await requireAdmin();
  const params = parsePage(pageParam, 50);

  const [rows, [countRow]] = await Promise.all([
    db
      .select()
      .from(activityLog)
      .orderBy(desc(activityLog.createdAt))
      .limit(params.pageSize)
      .offset(params.offset),
    db.select({ n: sql<number>`count(*)::int` }).from(activityLog),
  ]);

  return makePage(rows.map(toActivity), countRow?.n ?? 0, params);
}

/** Activity entries authored by the signed-in user. */
export async function listMyActivity(limit = 50): Promise<ActivityView[]> {
  const actor = await requireActor();
  const rows = await db
    .select()
    .from(activityLog)
    .where(eq(activityLog.actorId, actor.id))
    .orderBy(desc(activityLog.createdAt))
    .limit(limit);
  return rows.map(toActivity);
}

/* ------------------------------------------------------------------ */
/* Admin: people management                                            */
/* ------------------------------------------------------------------ */

export type PersonStatus = "active" | "invited" | "suspended";

/** Reuse the shared view type so server and client cannot drift apart. */
export type PersonView = Person;

export interface PersonProfile extends Person {
  /** Job title, shown under the name in the admin list. */
  title?: string;
}

interface PersonQueryRow {
  id: string;
  name: string;
  email: string;
  role: string | null;
  banned: boolean | null;
  createdAt: Date;
  lastSeenAt: Date | null;
  ticketCount: number;
}

function toPerson(row: PersonQueryRow): PersonView {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role === "admin" ? "admin" : "customer",
    initials: row.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0] ?? "")
      .join("")
      .toUpperCase(),
    joinedAt: row.createdAt.toISOString(),
    status: row.banned ? "suspended" : "active",
    ticketCount: row.ticketCount,
    lastSeenAt: row.lastSeenAt?.toISOString(),
  };
}

const personColumns = {
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  banned: user.banned,
  createdAt: user.createdAt,
  lastSeenAt: sql<Date | null>`(select max(s.created_at) from auth.session s where s.user_id = ${user.id})`,
  ticketCount: sql<number>`(select count(*)::int from tickets t where t.creator_id = ${user.id})`,
};

/** Customer accounts — admin only. */
export async function listCustomers(): Promise<PersonView[]> {
  await requireAdmin();
  const rows = await db
    .select(personColumns)
    .from(user)
    .where(sql`coalesce(${user.role}, 'customer') <> 'admin'`)
    .orderBy(desc(user.createdAt));
  return rows.map(toPerson);
}

/** Admin accounts — admin only. */
export async function listAdmins(): Promise<PersonView[]> {
  await requireAdmin();
  const rows = await db
    .select(personColumns)
    .from(user)
    .where(eq(user.role, "admin"))
    .orderBy(desc(user.createdAt));
  return rows.map(toPerson);
}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export type NotificationTone = "info" | "success" | "warning" | "danger";

export interface NotificationView {
  id: string;
  title: string;
  body: string;
  href: string;
  tone: NotificationTone;
  read: boolean;
  at: string;
}

const toNotification = (row: typeof notifications.$inferSelect): NotificationView => ({
  id: row.id,
  title: row.title,
  body: row.body,
  href: row.href,
  tone: row.tone,
  read: row.read,
  at: row.createdAt.toISOString(),
});

/** Notifications for the signed-in user, newest first. */
export async function listNotifications(limit = 20): Promise<NotificationView[]> {
  const actor = await requireActor();
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, actor.id))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
  return rows.map(toNotification);
}

/** Unread badge count for the signed-in user. */
export async function countUnreadNotifications(): Promise<number> {
  const actor = await requireActor();
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(notifications)
    .where(and(eq(notifications.userId, actor.id), eq(notifications.read, false)));
  return row?.n ?? 0;
}
