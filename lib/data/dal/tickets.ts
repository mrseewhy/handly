import "server-only";

import { and, asc, desc, eq, inArray, isNull, ne, sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { ticketReplies, tickets, user } from "@/lib/db/schema";
import type {
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/lib/ticket-config";
import { ForbiddenError, requireActor, requireAdmin, requireTicketReader } from "@/lib/data/dal/session";
import { makePage, parsePage, type Page } from "@/lib/pagination";

/* ------------------------------------------------------------------ */
/* Public shapes (what the UI renders)                                 */
/* ------------------------------------------------------------------ */

export type SlaState = "on_track" | "at_risk" | "critical" | "breached";

export interface TicketView {
  id: string;
  displayId: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  assigneeId: string | null;
  assigneeName: string | null;
  createdAt: string;
  updatedAt: string;
  slaDeadline: string;
  slaState: SlaState;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  preview: string;
  unread: boolean;
  replyCount: number;
}

export interface ReplyView {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorRole: "user" | "admin";
  kind: "customer" | "agent" | "internal_note" | "system";
  body?: string;
  event?: string;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Derived helpers                                                     */
/* ------------------------------------------------------------------ */

/** SLA thresholds per designsystem.md §2.6. */
export function slaStateFor(deadline: Date, resolvedAt: Date | null): SlaState {
  if (resolvedAt) return "on_track";
  const remainingMs = deadline.getTime() - Date.now();
  if (remainingMs <= 0) return "breached";

  // Compare against total window when known is impossible from one row, so use
  // absolute bands: <15% of a 24h window is under ~3.6h.
  const hoursLeft = remainingMs / 3_600_000;
  if (hoursLeft <= 4) return "critical";
  if (hoursLeft <= 12) return "at_risk";
  return "on_track";
}

const iso = (d: Date | null): string | null => (d ? d.toISOString() : null);

interface TicketRowLike {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  assigneeId: string | null;
  createdAt: Date;
  updatedAt: Date;
  slaDeadline: Date;
  firstResponseAt: Date | null;
  resolvedAt: Date | null;
  preview: string;
  unreadForCustomer: boolean;
  unreadForAdmin: boolean;
}

function toTicketView(
  row: TicketRowLike,
  viewer: { isAdmin: boolean; replyCount?: number },
): TicketView {
  return {
    id: row.id,
    displayId: row.id,
    subject: row.subject,
    status: row.status,
    priority: row.priority,
    category: row.category,
    creatorId: row.creatorId,
    creatorName: row.creatorName,
    creatorEmail: row.creatorEmail,
    assigneeId: row.assigneeId,
    assigneeName: null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    slaDeadline: row.slaDeadline.toISOString(),
    slaState: slaStateFor(row.slaDeadline, row.resolvedAt),
    firstResponseAt: iso(row.firstResponseAt),
    resolvedAt: iso(row.resolvedAt),
    preview: row.preview,
    unread: viewer.isAdmin ? row.unreadForAdmin : row.unreadForCustomer,
    replyCount: viewer.replyCount ?? 0,
  };
}

/** Assignee display names for a set of tickets, in one query. */
async function assigneeNames(ids: (string | null)[]): Promise<Map<string, string>> {
  const unique = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  if (unique.length === 0) return new Map();

  const rows = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(inArray(user.id, unique));

  return new Map(rows.map((r) => [r.id, r.name]));
}

async function replyCounts(ids: string[]): Promise<Map<string, number>> {
  if (ids.length === 0) return new Map();
  const rows = await db
    .select({
      ticketId: ticketReplies.ticketId,
      count: sql<number>`count(*)::int`,
    })
    .from(ticketReplies)
    .where(inArray(ticketReplies.ticketId, ids))
    .groupBy(ticketReplies.ticketId);
  return new Map(rows.map((r) => [r.ticketId, r.count]));
}

/** Adds assignee names + reply counts to a batch of rows. */
async function decorate(
  rows: TicketRowLike[],
  isAdmin: boolean,
): Promise<TicketView[]> {
  const ids = rows.map((r) => r.id);
  const [names, counts] = await Promise.all([
    assigneeNames(rows.map((r) => r.assigneeId)),
    replyCounts(ids),
  ]);
  return rows.map((row) => ({
    ...toTicketView(row, { isAdmin, replyCount: counts.get(row.id) ?? 0 }),
    assigneeName: row.assigneeId ? names.get(row.assigneeId) ?? null : null,
  }));
}

/* ------------------------------------------------------------------ */
/* Lists                                                               */
/* ------------------------------------------------------------------ */

const ticketColumns = {
  id: tickets.id,
  subject: tickets.subject,
  status: tickets.status,
  priority: tickets.priority,
  category: tickets.category,
  creatorId: tickets.creatorId,
  creatorName: tickets.creatorName,
  creatorEmail: tickets.creatorEmail,
  assigneeId: tickets.assigneeId,
  createdAt: tickets.createdAt,
  updatedAt: tickets.updatedAt,
  slaDeadline: tickets.slaDeadline,
  firstResponseAt: tickets.firstResponseAt,
  resolvedAt: tickets.resolvedAt,
  preview: tickets.preview,
  unreadForCustomer: tickets.unreadForCustomer,
  unreadForAdmin: tickets.unreadForAdmin,
};

/** Paginated query scoped to the signed-in customer's own tickets. */
async function paginateMyTickets(
  where: SQL | undefined,
  pageParam: string | string[] | undefined,
): Promise<Page<TicketView>> {
  const actor = await requireActor();
  const params = parsePage(pageParam);
  const scoped = and(eq(tickets.creatorId, actor.id), where);

  const [rows, [countRow]] = await Promise.all([
    db
      .select(ticketColumns)
      .from(tickets)
      .where(scoped)
      .orderBy(desc(tickets.updatedAt))
      .limit(params.pageSize)
      .offset(params.offset),
    db.select({ n: sql<number>`count(*)::int` }).from(tickets).where(scoped),
  ]);

  return makePage(await decorate(rows, false), countRow?.n ?? 0, params);
}

/** Tickets belonging to the signed-in customer. */
export async function listMyTickets(
  pageParam?: string | string[],
): Promise<Page<TicketView>> {
  return paginateMyTickets(undefined, pageParam);
}

/** Customer tickets that have at least one agent reply. */
export async function listMyAnsweredTickets(
  pageParam?: string | string[],
): Promise<Page<TicketView>> {
  return paginateMyTickets(
    sql`exists (select 1 from ${ticketReplies} r
          where r.ticket_id = ${tickets.id} and r.kind = 'agent')`,
    pageParam,
  );
}

/**
 * Runs a paginated ticket query. `where` is shared by the count and the page
 * so the two can never drift apart.
 */
async function paginateTickets(
  where: SQL | undefined,
  orderBy: SQL | ReturnType<typeof desc>,
  pageParam: string | string[] | undefined,
  isAdmin: boolean,
): Promise<Page<TicketView>> {
  const params = parsePage(pageParam);

  const [rows, [countRow]] = await Promise.all([
    db
      .select(ticketColumns)
      .from(tickets)
      .where(where)
      .orderBy(orderBy)
      .limit(params.pageSize)
      .offset(params.offset),
    db.select({ n: sql<number>`count(*)::int` }).from(tickets).where(where),
  ]);

  return makePage(await decorate(rows, isAdmin), countRow?.n ?? 0, params);
}

/** Every ticket, paginated — admin only. */
export async function listAllTickets(
  pageParam?: string | string[],
): Promise<Page<TicketView>> {
  await requireAdmin();
  return paginateTickets(undefined, desc(tickets.updatedAt), pageParam, true);
}

/** No first agent reply yet, oldest first — admin only. */
export async function listUnansweredTickets(
  pageParam?: string | string[],
): Promise<Page<TicketView>> {
  await requireAdmin();
  return paginateTickets(
    and(isNull(tickets.firstResponseAt), isNull(tickets.resolvedAt)),
    asc(tickets.createdAt),
    pageParam,
    true,
  );
}

/** At least one agent reply — admin only. */
export async function listAnsweredTickets(
  pageParam?: string | string[],
): Promise<Page<TicketView>> {
  await requireAdmin();
  return paginateTickets(
    sql`${tickets.firstResponseAt} is not null`,
    desc(tickets.updatedAt),
    pageParam,
    true,
  );
}

/* ------------------------------------------------------------------ */
/* Single ticket                                                       */
/* ------------------------------------------------------------------ */

/**
 * Loads one ticket by display id. Customers may only read their own; admins
 * may read any. Returns null when missing (so pages can call notFound()).
 */
export async function getTicket(displayId: string): Promise<TicketView | null> {
  const { actor, isAdmin } = await requireTicketReader();

  const [row] = await db
    .select(ticketColumns)
    .from(tickets)
    .where(eq(tickets.id, displayId))
    .limit(1);

  if (!row) return null;
  if (!isAdmin && row.creatorId !== actor.id) {
    // Do not distinguish "not yours" from "not found" to the caller.
    return null;
  }

  const [decorated] = await decorate([row], isAdmin);
  return decorated;
}

/** Same as getTicket but throws when the actor may not read it. */
export async function getTicketOrThrow(displayId: string): Promise<TicketView> {
  const ticket = await getTicket(displayId);
  if (!ticket) throw new Error("Ticket not found or not accessible.");
  return ticket;
}

/**
 * Thread for a ticket. Internal notes are only included for admins, so a
 * customer can never receive staff-only content.
 */
export async function listTicketReplies(displayId: string): Promise<ReplyView[]> {
  const { actor, isAdmin } = await requireTicketReader();

  const [ticket] = await db
    .select({ creatorId: tickets.creatorId })
    .from(tickets)
    .where(eq(tickets.id, displayId))
    .limit(1);

  if (!ticket) return [];
  if (!isAdmin && ticket.creatorId !== actor.id) {
    throw new ForbiddenError();
  }

  const rows = await db
    .select()
    .from(ticketReplies)
    .where(
      isAdmin
        ? eq(ticketReplies.ticketId, displayId)
        : and(
            eq(ticketReplies.ticketId, displayId),
            ne(ticketReplies.kind, "internal_note"),
          ),
    )
    .orderBy(asc(ticketReplies.createdAt));

  return rows.map((r) => ({
    id: r.id,
    ticketId: r.ticketId,
    authorId: r.authorId ?? "",
    authorName: r.authorName,
    authorRole: r.authorRole === "admin" ? "admin" : "user",
    kind: r.kind,
    body: r.body ?? undefined,
    event: r.event ?? undefined,
    createdAt: r.createdAt.toISOString(),
  }));
}

/* ------------------------------------------------------------------ */
/* Aggregates                                                          */
/* ------------------------------------------------------------------ */

export interface AdminStats {
  openTickets: number;
  unanswered: number;
  resolvedToday: number;
  avgFirstResponseHours: number;
  ticketsByDay: { label: string; created: number; resolved: number }[];
  byCategory: { label: string; value: number }[];
}

export async function getAdminStats(): Promise<AdminStats> {
  await requireAdmin();

  const [counts] = await db
    .select({
      open: sql<number>`count(*) filter (where ${tickets.status} in ('open','in_progress','pending','on_hold'))::int`,
      unanswered: sql<number>`count(*) filter (where ${tickets.firstResponseAt} is null and ${tickets.resolvedAt} is null)::int`,
      resolvedToday: sql<number>`count(*) filter (where ${tickets.resolvedAt} >= date_trunc('day', now()))::int`,
      avgFirstResponse: sql<number | null>`avg(extract(epoch from (${tickets.firstResponseAt} - ${tickets.createdAt})) / 3600)`,
    })
    .from(tickets);

  const byDay = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${tickets.createdAt}), 'Dy')`,
      created: sql<number>`count(*)::int`,
    })
    .from(tickets)
    .where(sql`${tickets.createdAt} >= now() - interval '7 days'`)
    .groupBy(sql`date_trunc('day', ${tickets.createdAt})`)
    .orderBy(sql`date_trunc('day', ${tickets.createdAt})`);

  const resolvedByDay = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${tickets.resolvedAt}), 'Dy')`,
      resolved: sql<number>`count(*)::int`,
    })
    .from(tickets)
    .where(
      and(
        sql`${tickets.resolvedAt} is not null`,
        sql`${tickets.resolvedAt} >= now() - interval '7 days'`,
      ),
    )
    .groupBy(sql`date_trunc('day', ${tickets.resolvedAt})`);

  const resolvedMap = new Map(resolvedByDay.map((r) => [r.day, r.resolved]));

  const byCategory = await db
    .select({
      category: tickets.category,
      value: sql<number>`count(*)::int`,
    })
    .from(tickets)
    .groupBy(tickets.category)
    .orderBy(desc(sql`count(*)`));

  return {
    openTickets: counts?.open ?? 0,
    unanswered: counts?.unanswered ?? 0,
    resolvedToday: counts?.resolvedToday ?? 0,
    avgFirstResponseHours: Number(counts?.avgFirstResponse ?? 0),
    ticketsByDay: byDay.map((d) => ({
      label: d.day.trim(),
      created: d.created,
      resolved: resolvedMap.get(d.day) ?? 0,
    })),
    byCategory: byCategory.map((c) => ({
      label:
        c.category === "feature_request"
          ? "Feature request"
          : c.category === "bug"
            ? "Bug report"
            : c.category.charAt(0).toUpperCase() + c.category.slice(1),
      value: c.value,
    })),
  };
}

/** Counts used by the sidebar and dashboard cards. */
export async function getQueueCounts(): Promise<{
  open: number;
  unanswered: number;
  answered: number;
}> {
  await requireAdmin();
  const [row] = await db
    .select({
      open: sql<number>`count(*) filter (where ${tickets.status} in ('open','in_progress','pending','on_hold'))::int`,
      unanswered: sql<number>`count(*) filter (where ${tickets.firstResponseAt} is null and ${tickets.resolvedAt} is null)::int`,
      answered: sql<number>`count(*) filter (where ${tickets.firstResponseAt} is not null)::int`,
    })
    .from(tickets);
  return { open: row?.open ?? 0, unanswered: row?.unanswered ?? 0, answered: row?.answered ?? 0 };
}

/** Customer dashboard counters. */
export async function getCustomerStats(): Promise<{
  total: number;
  open: number;
  answered: number;
  unread: number;
}> {
  const actor = await requireActor();
  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`,
      open: sql<number>`count(*) filter (where ${tickets.status} in ('open','in_progress','pending','on_hold'))::int`,
      answered: sql<number>`count(*) filter (where ${tickets.firstResponseAt} is not null)::int`,
      unread: sql<number>`count(*) filter (where ${tickets.unreadForCustomer})::int`,
    })
    .from(tickets)
    .where(eq(tickets.creatorId, actor.id));
  return {
    total: row?.total ?? 0,
    open: row?.open ?? 0,
    answered: row?.answered ?? 0,
    unread: row?.unread ?? 0,
  };
}
