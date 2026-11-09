/**
 * View-model types shared between the DAL (server) and presentational
 * components (which may be client components).
 *
 * These are `import type` only — no runtime code, no DB access — so a client
 * component can be typed against them without pulling `server-only` code into
 * the browser bundle. The DAL returns exactly these shapes.
 */

export type SlaState = "on_track" | "at_risk" | "critical" | "breached";

export interface Ticket {
  id: string;
  displayId: string;
  subject: string;
  status: "open" | "in_progress" | "pending" | "on_hold" | "resolved" | "closed";
  priority: "urgent" | "high" | "medium" | "low";
  category: "billing" | "technical" | "account" | "bug" | "feature_request" | "other";
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

export interface TicketReply {
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

/** Mirrors the database: admins are "admin", everyone else is "customer". */
export type PersonRole = "customer" | "admin";

export interface Person {
  id: string;
  name: string;
  email: string;
  role: PersonRole;
  initials: string;
  joinedAt: string;
  status: "active" | "invited" | "suspended";
  ticketCount: number;
  lastSeenAt?: string;
  /** Job title, when we have one. Currently unused by the seed. */
  title?: string;
}

export type NotificationTone = "info" | "success" | "warning" | "danger";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  href: string;
  tone: NotificationTone;
  read: boolean;
  at: string;
}

export type ActivityKind =
  | "ticket_created"
  | "reply"
  | "status_change"
  | "assignment"
  | "admin"
  | "auth"
  | "user_admin";

export interface ActivityEntry {
  id: string;
  actorId: string;
  actorName: string;
  at: string;
  action: string;
  target: string;
  href?: string;
  kind: ActivityKind;
}

/** The signed-in user, as pages need it for greetings and avatars. */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: PersonRole;
  initials: string;
}
