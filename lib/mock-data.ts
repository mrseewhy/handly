import type { TicketCategory, TicketPriority, TicketStatus } from "@/lib/ticket-config";
import { NOW } from "@/lib/format";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type UserRole = "user" | "admin";

export interface Person {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  initials: string;
  /** Fixed epoch ISO date used as the signup date. */
  joinedAt: string;
  status: "active" | "suspended" | "invited";
  ticketCount: number;
  lastSeenAt?: string;
  title?: string;
}

export interface TicketReply {
  id: string;
  ticketId: string;
  authorId: string;
  authorRole: UserRole;
  kind: "customer" | "agent" | "internal_note" | "system";
  /** epoch ISO date */
  createdAt: string;
  body?: string;
  /** For system events, e.g. "Status changed to Pending". */
  event?: string;
}

export type SlaState = "on_track" | "at_risk" | "critical" | "breached";

export interface Ticket {
  id: string;
  /** Display ID, e.g. "HND-1042". */
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
  /** ISO deadline derived from SLA hours after creation. */
  slaDeadline: string;
  slaState: SlaState;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  /** Customer-visible first message body. */
  preview: string;
  unread: boolean;
  replyCount: number;
}

export interface ActivityEntry {
  id: string;
  actorId: string;
  actorName: string;
  /** epoch ISO date */
  at: string;
  action: string;
  target: string;
  /** Route to the affected ticket, when applicable. */
  href?: string;
  kind: "ticket_created" | "reply" | "status_change" | "assignment" | "admin" | "auth" | "user_admin";
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
  href: string;
  tone: "info" | "success" | "warning" | "danger";
}

/* ------------------------------------------------------------------ */
/* People                                                              */
/* ------------------------------------------------------------------ */

export const people: Person[] = [
  // The signed-in customer (mock user)
  {
    id: "u-1",
    name: "Alex Rivera",
    email: "alex@brightpath.io",
    role: "user",
    initials: "AR",
    joinedAt: "2026-02-11T09:12:00Z",
    status: "active",
    ticketCount: 5,
    lastSeenAt: "2026-10-05T11:45:00Z",
  },
  // The signed-in admin (mock admin)
  {
    id: "a-1",
    name: "Dana Okafor",
    email: "dana@handly.app",
    role: "admin",
    initials: "DO",
    joinedAt: "2025-11-03T14:00:00Z",
    status: "active",
    ticketCount: 46,
    lastSeenAt: "2026-10-05T11:58:00Z",
    title: "Support lead",
  },
  // Other customers
  {
    id: "u-2",
    name: "Priya Sharma",
    email: "priya@northwind.co",
    role: "user",
    initials: "PS",
    joinedAt: "2026-03-02T10:30:00Z",
    status: "active",
    ticketCount: 3,
    lastSeenAt: "2026-10-05T10:12:00Z",
  },
  {
    id: "u-3",
    name: "Marcus Webb",
    email: "marcus@ferndale.shop",
    role: "user",
    initials: "MW",
    joinedAt: "2026-01-19T16:45:00Z",
    status: "active",
    ticketCount: 2,
    lastSeenAt: "2026-10-04T18:40:00Z",
  },
  {
    id: "u-4",
    name: "Elena Petrova",
    email: "elena@atlas-labs.dev",
    role: "user",
    initials: "EP",
    joinedAt: "2026-04-22T08:05:00Z",
    status: "active",
    ticketCount: 4,
    lastSeenAt: "2026-10-05T09:30:00Z",
  },
  {
    id: "u-5",
    name: "Tom Becker",
    email: "tom@harborlogs.com",
    role: "user",
    initials: "TB",
    joinedAt: "2026-05-30T13:20:00Z",
    status: "suspended",
    ticketCount: 1,
    lastSeenAt: "2026-09-28T11:10:00Z",
  },
  {
    id: "u-6",
    name: "Yuki Tanaka",
    email: "yuki@sakura-works.jp",
    role: "user",
    initials: "YT",
    joinedAt: "2026-06-14T07:55:00Z",
    status: "active",
    ticketCount: 2,
    lastSeenAt: "2026-10-03T15:22:00Z",
  },
  // Other admins / agents
  {
    id: "a-2",
    name: "Samir Haddad",
    email: "samir@handly.app",
    role: "admin",
    initials: "SH",
    joinedAt: "2026-01-08T09:00:00Z",
    status: "active",
    ticketCount: 38,
    lastSeenAt: "2026-10-05T11:50:00Z",
    title: "Support agent",
  },
  {
    id: "a-3",
    name: "Grace Lin",
    email: "grace@handly.app",
    role: "admin",
    initials: "GL",
    joinedAt: "2026-03-17T11:30:00Z",
    status: "active",
    ticketCount: 31,
    lastSeenAt: "2026-10-05T09:05:00Z",
    title: "Support agent",
  },
  {
    id: "a-4",
    name: "Nina Kovač",
    email: "nina@handly.app",
    role: "admin",
    initials: "NK",
    joinedAt: "2026-07-01T10:00:00Z",
    status: "invited",
    ticketCount: 0,
    title: "Support agent (pending invite)",
  },
];

export const currentUser = people[0]; // mock signed-in customer
export const currentAdmin = people[1]; // mock signed-in admin

/* ------------------------------------------------------------------ */
/* Tickets                                                             */
/* ------------------------------------------------------------------ */

function hoursBeforeNow(h: number): string {
  return new Date(NOW.getTime() - h * 3_600_000).toISOString();
}
function hoursAfterNow(h: number): string {
  return new Date(NOW.getTime() + h * 3_600_000).toISOString();
}

export const tickets: Ticket[] = [
  {
    id: "t-1042",
    displayId: "HND-1042",
    subject: "Billing: double charge on September invoice",
    status: "open",
    priority: "high",
    category: "billing",
    creatorId: "u-1",
    creatorName: "Alex Rivera",
    creatorEmail: "alex@brightpath.io",
    assigneeId: null,
    assigneeName: null,
    createdAt: hoursBeforeNow(5),
    updatedAt: hoursBeforeNow(5),
    slaDeadline: hoursAfterNow(19), // 24h SLA
    slaState: "on_track",
    firstResponseAt: null,
    resolvedAt: null,
    preview:
      "Our September invoice charged the card twice — once on Sep 30 and again on Oct 1. Can you refund the duplicate charge of $79?",
    unread: true,
    replyCount: 1,
  },
  {
    id: "t-1039",
    displayId: "HND-1039",
    subject: "API returns 500 on bulk export endpoint",
    status: "in_progress",
    priority: "urgent",
    category: "technical",
    creatorId: "u-1",
    creatorName: "Alex Rivera",
    creatorEmail: "alex@brightpath.io",
    assigneeId: "a-1",
    assigneeName: "Dana Okafor",
    createdAt: hoursBeforeNow(26),
    updatedAt: hoursBeforeNow(3),
    slaDeadline: hoursAfterNow(2), // 4h SLA for urgent
    slaState: "at_risk",
    firstResponseAt: hoursBeforeNow(25),
    resolvedAt: null,
    preview:
      "POST /v1/export/bulk has been returning 500 since this morning when we request more than 5,000 rows.",
    unread: false,
    replyCount: 3,
  },
  {
    id: "t-1031",
    displayId: "HND-1031",
    subject: "Change workspace email address",
    status: "pending",
    priority: "medium",
    category: "account",
    creatorId: "u-1",
    creatorName: "Alex Rivera",
    creatorEmail: "alex@brightpath.io",
    assigneeId: "a-3",
    assigneeName: "Grace Lin",
    createdAt: hoursBeforeNow(52),
    updatedAt: hoursBeforeNow(20),
    slaDeadline: hoursAfterNow(24),
    slaState: "on_track",
    firstResponseAt: hoursBeforeNow(49),
    resolvedAt: null,
    preview:
      "We rebranded to brightpath.io and would like the workspace email updated from brightpath.co to the new domain.",
    unread: false,
    replyCount: 4,
  },
  {
    id: "t-1017",
    displayId: "HND-1017",
    subject: "Export to CSV drops timezone information",
    status: "resolved",
    priority: "medium",
    category: "bug",
    creatorId: "u-1",
    creatorName: "Alex Rivera",
    creatorEmail: "alex@brightpath.io",
    assigneeId: "a-2",
    assigneeName: "Samir Haddad",
    createdAt: "2026-09-24T14:20:00Z",
    updatedAt: "2026-09-26T10:05:00Z",
    slaDeadline: "2026-09-26T14:20:00Z",
    slaState: "breached",
    firstResponseAt: "2026-09-24T15:02:00Z",
    resolvedAt: "2026-09-26T10:05:00Z",
    preview:
      "CSV exports render timestamps in UTC instead of the workspace timezone, which breaks our nightly import.",
    unread: false,
    replyCount: 6,
  },
  {
    id: "t-1008",
    displayId: "HND-1008",
    subject: "Feature request: saved filter views for tickets",
    status: "closed",
    priority: "low",
    category: "feature_request",
    creatorId: "u-1",
    creatorName: "Alex Rivera",
    creatorEmail: "alex@brightpath.io",
    assigneeId: "a-2",
    assigneeName: "Samir Haddad",
    createdAt: "2026-09-10T09:40:00Z",
    updatedAt: "2026-09-12T16:30:00Z",
    slaDeadline: "2026-09-13T09:40:00Z",
    slaState: "breached",
    firstResponseAt: "2026-09-10T11:15:00Z",
    resolvedAt: "2026-09-12T16:30:00Z",
    preview:
      "We spend a lot of time rebuilding the same filters each morning. Saved views would help a lot.",
    unread: false,
    replyCount: 4,
  },
  // Other customers' tickets (admin-facing lists)
  {
    id: "t-1044",
    displayId: "HND-1044",
    subject: "Cannot sign in after password reset",
    status: "open",
    priority: "urgent",
    category: "account",
    creatorId: "u-2",
    creatorName: "Priya Sharma",
    creatorEmail: "priya@northwind.co",
    assigneeId: null,
    assigneeName: null,
    createdAt: hoursBeforeNow(2),
    updatedAt: hoursBeforeNow(2),
    slaDeadline: hoursAfterNow(2),
    slaState: "critical",
    firstResponseAt: null,
    resolvedAt: null,
    preview:
      "After the password reset email, the new password is rejected and the reset link says it already expired.",
    unread: true,
    replyCount: 1,
  },
  {
    id: "t-1043",
    displayId: "HND-1043",
    subject: "Webhooks fire twice for the same event",
    status: "open",
    priority: "high",
    category: "bug",
    creatorId: "u-4",
    creatorName: "Elena Petrova",
    creatorEmail: "elena@atlas-labs.dev",
    assigneeId: null,
    assigneeName: null,
    createdAt: hoursBeforeNow(4),
    updatedAt: hoursBeforeNow(4),
    slaDeadline: hoursAfterNow(20),
    slaState: "on_track",
    firstResponseAt: null,
    resolvedAt: null,
    preview:
      "Each ticket.created webhook arrives twice about 40 seconds apart with identical payloads. We dedupe now, but this doubled our event volume.",
    unread: true,
    replyCount: 1,
  },
  {
    id: "t-1041",
    displayId: "HND-1041",
    subject: "Upgrade to Team plan — proration question",
    status: "open",
    priority: "medium",
    category: "billing",
    creatorId: "u-6",
    creatorName: "Yuki Tanaka",
    creatorEmail: "yuki@sakura-works.jp",
    assigneeId: null,
    assigneeName: null,
    createdAt: hoursBeforeNow(7),
    updatedAt: hoursBeforeNow(7),
    slaDeadline: hoursAfterNow(17),
    slaState: "on_track",
    firstResponseAt: null,
    resolvedAt: null,
    preview:
      "If we upgrade five seats to the Team plan mid-cycle, will we be charged only for the remaining days?",
    unread: true,
    replyCount: 1,
  },
  {
    id: "t-1040",
    displayId: "HND-1040",
    subject: "Mobile app crashes on ticket attachments",
    status: "in_progress",
    priority: "high",
    category: "bug",
    creatorId: "u-3",
    creatorName: "Marcus Webb",
    creatorEmail: "marcus@ferndale.shop",
    assigneeId: "a-2",
    assigneeName: "Samir Haddad",
    createdAt: hoursBeforeNow(9),
    updatedAt: hoursBeforeNow(1),
    slaDeadline: hoursAfterNow(15),
    slaState: "on_track",
    firstResponseAt: hoursBeforeNow(8),
    resolvedAt: null,
    preview:
      "The iOS app closes as soon as I attach a photo over 5 MB to a new ticket. Reproduces every time.",
    unread: false,
    replyCount: 2,
  },
  {
    id: "t-1038",
    displayId: "HND-1038",
    subject: "Rate limit errors during nightly sync",
    status: "in_progress",
    priority: "high",
    category: "technical",
    creatorId: "u-4",
    creatorName: "Elena Petrova",
    creatorEmail: "elena@atlas-labs.dev",
    assigneeId: "a-1",
    assigneeName: "Dana Okafor",
    createdAt: hoursBeforeNow(30),
    updatedAt: hoursBeforeNow(6),
    slaDeadline: hoursAfterNow(1),
    slaState: "critical",
    firstResponseAt: hoursBeforeNow(28),
    resolvedAt: null,
    preview:
      "Our nightly sync gets 429 responses on about 2% of requests even though we stay under the documented limit.",
    unread: false,
    replyCount: 5,
  },
  {
    id: "t-1036",
    displayId: "HND-1036",
    subject: "Refund request for annual plan",
    status: "pending",
    priority: "medium",
    category: "billing",
    creatorId: "u-3",
    creatorName: "Marcus Webb",
    creatorEmail: "marcus@ferndale.shop",
    assigneeId: "a-3",
    assigneeName: "Grace Lin",
    createdAt: hoursBeforeNow(55),
    updatedAt: hoursBeforeNow(30),
    slaDeadline: hoursAfterNow(17),
    slaState: "at_risk",
    firstResponseAt: hoursBeforeNow(52),
    resolvedAt: null,
    preview:
      "We were moved to a different invoicing system and no longer need the annual plan purchased in August.",
    unread: false,
    replyCount: 3,
  },
  {
    id: "t-1033",
    displayId: "HND-1033",
    subject: "SSO setup with Okta — metadata URL rejected",
    status: "on_hold",
    priority: "medium",
    category: "technical",
    creatorId: "u-4",
    creatorName: "Elena Petrova",
    creatorEmail: "elena@atlas-labs.dev",
    assigneeId: "a-1",
    assigneeName: "Dana Okafor",
    createdAt: "2026-10-02T09:15:00Z",
    updatedAt: "2026-10-03T14:40:00Z",
    slaDeadline: "2026-10-03T09:15:00Z",
    slaState: "breached",
    firstResponseAt: "2026-10-02T10:05:00Z",
    resolvedAt: null,
    preview:
      "Uploading our Okta metadata URL fails with 'Invalid XML'. Our admin exported it twice, same result.",
    unread: false,
    replyCount: 7,
  },
  {
    id: "t-1029",
    displayId: "HND-1029",
    subject: "Two-factor codes not arriving via SMS",
    status: "resolved",
    priority: "high",
    category: "account",
    creatorId: "u-2",
    creatorName: "Priya Sharma",
    creatorEmail: "priya@northwind.co",
    assigneeId: "a-3",
    assigneeName: "Grace Lin",
    createdAt: "2026-09-29T13:30:00Z",
    updatedAt: "2026-09-30T09:20:00Z",
    slaDeadline: "2026-09-30T13:30:00Z",
    slaState: "breached",
    firstResponseAt: "2026-09-29T14:10:00Z",
    resolvedAt: "2026-09-30T09:20:00Z",
    preview:
      "Switched phone providers last week and 2FA texts stopped arriving. Email codes work fine.",
    unread: false,
    replyCount: 5,
  },
  {
    id: "t-1024",
    displayId: "HND-1024",
    subject: "Notification digest arrives at wrong hour",
    status: "resolved",
    priority: "low",
    category: "bug",
    creatorId: "u-6",
    creatorName: "Yuki Tanaka",
    creatorEmail: "yuki@sakura-works.jp",
    assigneeId: "a-2",
    assigneeName: "Samir Haddad",
    createdAt: "2026-09-27T08:00:00Z",
    updatedAt: "2026-09-28T11:45:00Z",
    slaDeadline: "2026-10-01T08:00:00Z",
    slaState: "on_track",
    firstResponseAt: "2026-09-27T09:30:00Z",
    resolvedAt: "2026-09-28T11:45:00Z",
    preview:
      "The daily digest lands at 18:00 JST although my settings say 09:00 JST. Everything else respects the timezone.",
    unread: false,
    replyCount: 3,
  },
  {
    id: "t-1019",
    displayId: "HND-1019",
    subject: "Invoice PDF missing VAT number",
    status: "closed",
    priority: "low",
    category: "billing",
    creatorId: "u-5",
    creatorName: "Tom Becker",
    creatorEmail: "tom@harborlogs.com",
    assigneeId: "a-3",
    assigneeName: "Grace Lin",
    createdAt: "2026-09-14T10:10:00Z",
    updatedAt: "2026-09-15T15:25:00Z",
    slaDeadline: "2026-09-17T10:10:00Z",
    slaState: "breached",
    firstResponseAt: "2026-09-14T12:00:00Z",
    resolvedAt: "2026-09-15T15:25:00Z",
    preview:
      "Our accountant says the downloaded PDF is missing the VAT ID that we entered in billing settings.",
    unread: false,
    replyCount: 2,
  },
];

/* ------------------------------------------------------------------ */
/* Replies / conversation thread                                       */
/* ------------------------------------------------------------------ */

const replySeeds: TicketReply[] = [
  // HND-1042
  {
    id: "r-1042-1",
    ticketId: "t-1042",
    authorId: "u-1",
    authorRole: "user",
    kind: "customer",
    createdAt: hoursBeforeNow(5),
    body:
      "Our September invoice charged the card twice — once on Sep 30 and again on Oct 1. Can you refund the duplicate charge of $79? The invoice numbers are INV-2026-0912 and INV-2026-0913.",
  },
  // HND-1044
  {
    id: "r-1044-1",
    ticketId: "t-1044",
    authorId: "u-2",
    authorRole: "user",
    kind: "customer",
    createdAt: hoursBeforeNow(2),
    body:
      "After the password reset email, the new password is rejected with 'Invalid credentials'. The reset link now says it already expired even though it arrived ten minutes ago.",
  },
  // HND-1043
  {
    id: "r-1043-1",
    ticketId: "t-1043",
    authorId: "u-4",
    authorRole: "user",
    kind: "customer",
    createdAt: hoursBeforeNow(4),
    body:
      "Each ticket.created webhook arrives twice about 40 seconds apart with identical payloads. We dedupe on our side for now, but this doubled our event volume overnight.",
  },
  // HND-1041
  {
    id: "r-1041-1",
    ticketId: "t-1041",
    authorId: "u-6",
    authorRole: "user",
    kind: "customer",
    createdAt: hoursBeforeNow(7),
    body:
      "If we upgrade five seats to the Team plan mid-cycle, will we be charged only for the remaining days, or the full amount now? Planning our budget for next quarter.",
  },
  // HND-1039
  {
    id: "r-1039-1",
    ticketId: "t-1039",
    authorId: "u-1",
    authorRole: "user",
    kind: "customer",
    createdAt: hoursBeforeNow(26),
    body:
      "POST /v1/export/bulk has been returning 500 since this morning when we request more than 5,000 rows. Smaller requests complete normally. Request ID example: req_8f3a91c2.",
  },
  {
    id: "r-1039-2",
    ticketId: "t-1039",
    authorId: "a-1",
    authorRole: "admin",
    kind: "agent",
    createdAt: hoursBeforeNow(25),
    body:
      "Thanks Alex — I reproduced it with a 6,000-row request. It looks like a timeout in the CSV writer for large batches. Engineering is on it; I will keep this ticket updated.",
  },
  {
    id: "r-1039-3",
    ticketId: "t-1039",
    authorId: "a-1",
    authorRole: "admin",
    kind: "internal_note",
    createdAt: hoursBeforeNow(20),
    body:
      "Root cause: chunk size was raised to 10k in last week's deploy. Rolling back to 5k while a streaming fix is reviewed.",
  },
  {
    id: "r-1039-4",
    ticketId: "t-1039",
    authorId: "u-1",
    authorRole: "user",
    kind: "customer",
    createdAt: hoursBeforeNow(3),
    body:
      "Any rough ETA? We run the full export for finance every Monday morning, so before 08:00 UTC would save us a workaround.",
  },
  // HND-1040
  {
    id: "r-1040-1",
    ticketId: "t-1040",
    authorId: "u-3",
    authorRole: "user",
    kind: "customer",
    createdAt: hoursBeforeNow(9),
    body:
      "The iOS app closes as soon as I attach a photo over 5 MB to a new ticket. Reproduces every time on iPhone 14, app version 3.2.1.",
  },
  {
    id: "r-1040-2",
    ticketId: "t-1040",
    authorId: "a-2",
    authorRole: "admin",
    kind: "agent",
    createdAt: hoursBeforeNow(8),
    body:
      "Thanks Marcus — confirmed on our test device. Attachments over 5 MB hit a memory limit on iOS. A fix is in review; meanwhile compressing the photo first avoids the crash.",
  },
  {
    id: "r-1040-3",
    ticketId: "t-1040",
    authorId: "u-3",
    authorRole: "user",
    kind: "customer",
    createdAt: hoursBeforeNow(1),
    body: "Compressing works, thanks. Looking forward to the fix.",
  },
  // HND-1038
  {
    id: "r-1038-1",
    ticketId: "t-1038",
    authorId: "u-4",
    authorRole: "user",
    kind: "customer",
    createdAt: hoursBeforeNow(30),
    body:
      "Our nightly sync gets 429 responses on about 2% of requests even though we stay under the documented limit of 600 requests per minute.",
  },
  {
    id: "r-1038-2",
    ticketId: "t-1038",
    authorId: "a-1",
    authorRole: "admin",
    kind: "agent",
    createdAt: hoursBeforeNow(28),
    body:
      "Hi Elena — the limit is per workspace, not per API key. Your three integration keys share one bucket; stagger them by a minute and the 429s should stop.",
  },
  {
    id: "r-1038-3",
    ticketId: "t-1038",
    authorId: "a-1",
    authorRole: "admin",
    kind: "internal_note",
    createdAt: hoursBeforeNow(24),
    body: "Docs only mention the per-key limit. Filed DOC-221 to clarify per-workspace limits.",
  },
  {
    id: "r-1038-4",
    ticketId: "t-1038",
    authorId: "u-4",
    authorRole: "user",
    kind: "customer",
    createdAt: hoursBeforeNow(12),
    body:
      "Staggering the keys worked. Could the docs mention that the bucket is per workspace? It took us a while to find this.",
  },
  {
    id: "r-1038-5",
    ticketId: "t-1038",
    authorId: "a-1",
    authorRole: "admin",
    kind: "agent",
    createdAt: hoursBeforeNow(6),
    body:
      "Great to hear. The docs update is queued for this week — I will link it here when it ships.",
  },
  // HND-1036
  {
    id: "r-1036-1",
    ticketId: "t-1036",
    authorId: "u-3",
    authorRole: "user",
    kind: "customer",
    createdAt: hoursBeforeNow(55),
    body:
      "We were moved to a different invoicing system and no longer need the annual plan purchased in August. Can we get a refund for the unused months?",
  },
  {
    id: "r-1036-2",
    ticketId: "t-1036",
    authorId: "a-3",
    authorRole: "admin",
    kind: "agent",
    createdAt: hoursBeforeNow(52),
    body:
      "Hi Marcus — refunds on annual plans after 60 days are prorated as account credit. You are on day 41, so a credit for the remaining term is possible. Want me to apply it?",
  },
  {
    id: "r-1036-3",
    ticketId: "t-1036",
    authorId: "u-3",
    authorRole: "user",
    kind: "customer",
    createdAt: hoursBeforeNow(34),
    body: "Account credit works for us. Please go ahead.",
  },
  {
    id: "r-1036-4",
    ticketId: "t-1036",
    authorId: "a-3",
    authorRole: "admin",
    kind: "internal_note",
    createdAt: hoursBeforeNow(30),
    body: "Credit calculated at $214.50. Applied pending finance approval — check tomorrow.",
  },
  {
    id: "r-1036-5",
    ticketId: "t-1036",
    authorId: "a-3",
    authorRole: "admin",
    kind: "agent",
    createdAt: hoursBeforeNow(30),
    body: "Applied — you should see the $214.50 credit on your next invoice. Anything else I can help with?",
  },
  // HND-1033
  {
    id: "r-1033-1",
    ticketId: "t-1033",
    authorId: "u-4",
    authorRole: "user",
    kind: "customer",
    createdAt: "2026-10-02T09:15:00Z",
    body:
      "Uploading our Okta metadata URL fails with 'Invalid XML'. Our admin exported it twice, same result. We are blocked on the SSO rollout planned for Monday.",
  },
  {
    id: "r-1033-2",
    ticketId: "t-1033",
    authorId: "a-1",
    authorRole: "admin",
    kind: "agent",
    createdAt: "2026-10-02T10:05:00Z",
    body:
      "Hi Elena — the parser is strict about XML namespaces. Can you try the metadata file export instead of the URL? Okta's file export includes the namespace our parser expects.",
  },
  {
    id: "r-1033-3",
    ticketId: "t-1033",
    authorId: "u-4",
    authorRole: "user",
    kind: "customer",
    createdAt: "2026-10-02T12:30:00Z",
    body: "File export also fails, but with a different error: 'Signature validation failed'.",
  },
  {
    id: "r-1033-4",
    ticketId: "t-1033",
    authorId: "a-1",
    authorRole: "admin",
    kind: "internal_note",
    createdAt: "2026-10-03T08:20:00Z",
    body:
      "Signature mismatch is server-side — escalated to platform team as PLAT-881. Do not promise a date until they scope it.",
  },
  {
    id: "r-1033-5",
    ticketId: "t-1033",
    authorId: "a-1",
    authorRole: "admin",
    kind: "agent",
    createdAt: "2026-10-03T14:40:00Z",
    body:
      "Update: the signature issue is on our side, and platform engineering is investigating as a priority. Putting this on hold until we have a confirmed fix — we will notify you the moment it is resolved.",
  },
  {
    id: "r-1033-6",
    ticketId: "t-1033",
    authorId: "u-1",
    authorRole: "user",
    kind: "system",
    createdAt: "2026-10-03T14:41:00Z",
    event: "Status changed to On hold",
  },
  // HND-1031
  {
    id: "r-1031-1",
    ticketId: "t-1031",
    authorId: "u-1",
    authorRole: "user",
    kind: "customer",
    createdAt: hoursBeforeNow(52),
    body:
      "We rebranded to brightpath.io and would like the workspace email updated from brightpath.co to the new domain. Invoices should go to billing@brightpath.io.",
  },
  {
    id: "r-1031-2",
    ticketId: "t-1031",
    authorId: "a-3",
    authorRole: "admin",
    kind: "agent",
    createdAt: hoursBeforeNow(49),
    body:
      "Hi Alex — happy to help. For security, domain changes need a confirmation from the current workspace email. Can you confirm you received our verification message at the old address?",
  },
  {
    id: "r-1031-3",
    ticketId: "t-1031",
    authorId: "u-1",
    authorRole: "user",
    kind: "customer",
    createdAt: hoursBeforeNow(44),
    body: "Confirmed, the verification link is clicked.",
  },
  {
    id: "r-1031-4",
    ticketId: "t-1031",
    authorId: "a-3",
    authorRole: "admin",
    kind: "internal_note",
    createdAt: hoursBeforeNow(21),
    body: "Domain verified. Workspace rename scheduled in the next maintenance window (Tue 06:00 UTC).",
  },
  {
    id: "r-1031-5",
    ticketId: "t-1031",
    authorId: "a-3",
    authorRole: "admin",
    kind: "agent",
    createdAt: hoursBeforeNow(20),
    body:
      "Verified, thanks. The rename runs in Tuesday's maintenance window — we will email you before and after. Anything else in the meantime?",
  },
  {
    id: "r-1031-6",
    ticketId: "t-1031",
    authorId: "u-1",
    authorRole: "user",
    kind: "system",
    createdAt: hoursBeforeNow(20),
    event: "Status changed to Pending",
  },
  // HND-1029
  {
    id: "r-1029-1",
    ticketId: "t-1029",
    authorId: "u-2",
    authorRole: "user",
    kind: "customer",
    createdAt: "2026-09-29T13:30:00Z",
    body:
      "Switched phone providers last week and 2FA texts stopped arriving. Email codes work fine, but I would like SMS fixed or reset.",
  },
  {
    id: "r-1029-2",
    ticketId: "t-1029",
    authorId: "a-3",
    authorRole: "admin",
    kind: "agent",
    createdAt: "2026-09-29T14:10:00Z",
    body:
      "Hi Priya — I cleared the cached phone number on our side. Please re-add your new number from Settings → Security and we will send a test code.",
  },
  {
    id: "r-1029-3",
    ticketId: "t-1029",
    authorId: "a-3",
    authorRole: "admin",
    kind: "internal_note",
    createdAt: "2026-09-29T16:00:00Z",
    body: "Carrier lookup showed the old provider was still black-holed for this number.",
  },
  {
    id: "r-1029-4",
    ticketId: "t-1029",
    authorId: "u-2",
    authorRole: "user",
    kind: "customer",
    createdAt: "2026-09-30T08:40:00Z",
    body: "Re-added the number and the test code arrived instantly. All good!",
  },
  {
    id: "r-1029-5",
    ticketId: "t-1029",
    authorId: "a-3",
    authorRole: "admin",
    kind: "agent",
    createdAt: "2026-09-30T09:20:00Z",
    body: "Wonderful — marking this resolved. Reach out any time if SMS acts up again.",
  },
  {
    id: "r-1029-6",
    ticketId: "t-1029",
    authorId: "u-1",
    authorRole: "user",
    kind: "system",
    createdAt: "2026-09-30T09:20:00Z",
    event: "Ticket marked as resolved",
  },
  // HND-1017
  {
    id: "r-1017-1",
    ticketId: "t-1017",
    authorId: "u-1",
    authorRole: "user",
    kind: "customer",
    createdAt: "2026-09-24T14:20:00Z",
    body:
      "CSV exports render timestamps in UTC instead of the workspace timezone, which breaks our nightly import. Started after the Sep 20 release.",
  },
  {
    id: "r-1017-2",
    ticketId: "t-1017",
    authorId: "a-2",
    authorRole: "admin",
    kind: "agent",
    createdAt: "2026-09-24T15:02:00Z",
    body:
      "Thanks Alex — confirmed as a regression from the Sep 20 release. Logged as BUG-512; the fix is scheduled for this sprint.",
  },
  {
    id: "r-1017-3",
    ticketId: "t-1017",
    authorId: "a-2",
    authorRole: "admin",
    kind: "agent",
    createdAt: "2026-09-26T10:05:00Z",
    body:
      "Fix shipped in 2026.9.4 — exports now use the workspace timezone again. Could you verify on your side so I can close the loop?",
  },
  {
    id: "r-1017-4",
    ticketId: "t-1017",
    authorId: "u-1",
    authorRole: "user",
    kind: "system",
    createdAt: "2026-09-26T10:05:00Z",
    event: "Ticket marked as resolved",
  },
  // HND-1024
  {
    id: "r-1024-1",
    ticketId: "t-1024",
    authorId: "u-6",
    authorRole: "user",
    kind: "customer",
    createdAt: "2026-09-27T08:00:00Z",
    body:
      "The daily digest lands at 18:00 JST although my settings say 09:00 JST. Everything else respects the timezone.",
  },
  {
    id: "r-1024-2",
    ticketId: "t-1024",
    authorId: "a-2",
    authorRole: "admin",
    kind: "agent",
    createdAt: "2026-09-27T09:30:00Z",
    body:
      "Hi Yuki — found it: the digest scheduler stored your preference in UTC hours without conversion. Corrected it and queued a code fix so this cannot recur.",
  },
  {
    id: "r-1024-3",
    ticketId: "t-1024",
    authorId: "u-6",
    authorRole: "user",
    kind: "customer",
    createdAt: "2026-09-28T08:05:00Z",
    body: "Today's digest arrived at 09:00 JST. Fixed, thank you!",
  },
  {
    id: "r-1024-4",
    ticketId: "t-1024",
    authorId: "u-1",
    authorRole: "user",
    kind: "system",
    createdAt: "2026-09-28T11:45:00Z",
    event: "Ticket marked as resolved",
  },
  // HND-1008
  {
    id: "r-1008-1",
    ticketId: "t-1008",
    authorId: "u-1",
    authorRole: "user",
    kind: "customer",
    createdAt: "2026-09-10T09:40:00Z",
    body:
      "We spend a lot of time rebuilding the same filters each morning. Saved filter views would help a lot for our daily triage.",
  },
  {
    id: "r-1008-2",
    ticketId: "t-1008",
    authorId: "a-2",
    authorRole: "admin",
    kind: "agent",
    createdAt: "2026-09-10T11:15:00Z",
    body:
      "This is a popular request and already on the roadmap for Q4. I added your workspace to the early-access list.",
  },
  {
    id: "r-1008-3",
    ticketId: "t-1008",
    authorId: "a-2",
    authorRole: "admin",
    kind: "agent",
    createdAt: "2026-09-12T16:30:00Z",
    body:
      "Closing for now — early access opens in November and we will email you. Reopen this ticket any time.",
  },
  {
    id: "r-1008-4",
    ticketId: "t-1008",
    authorId: "u-1",
    authorRole: "user",
    kind: "system",
    createdAt: "2026-09-12T16:30:00Z",
    event: "Ticket closed",
  },
  // HND-1019
  {
    id: "r-1019-1",
    ticketId: "t-1019",
    authorId: "u-5",
    authorRole: "user",
    kind: "customer",
    createdAt: "2026-09-14T10:10:00Z",
    body:
      "Our accountant says the downloaded PDF is missing the VAT ID that we entered in billing settings.",
  },
  {
    id: "r-1019-2",
    ticketId: "t-1019",
    authorId: "a-3",
    authorRole: "admin",
    kind: "agent",
    createdAt: "2026-09-14T12:00:00Z",
    body:
      "Hi Tom — the VAT field was blank on your billing profile because a recent save overwrote it. Re-added it and regenerated the August and September invoices.",
  },
  {
    id: "r-1019-3",
    ticketId: "t-1019",
    authorId: "u-1",
    authorRole: "user",
    kind: "system",
    createdAt: "2026-09-15T15:25:00Z",
    event: "Ticket closed",
  },
];

export const ticketReplies = replySeeds;

/* ------------------------------------------------------------------ */
/* Activity log                                                        */
/* ------------------------------------------------------------------ */

export const activityLog: ActivityEntry[] = [
  {
    id: "act-01",
    actorId: "u-2",
    actorName: "Priya Sharma",
    at: hoursBeforeNow(2),
    action: "created ticket",
    target: "HND-1044 · Cannot sign in after password reset",
    href: "/admin/tickets/HND-1044",
    kind: "ticket_created",
  },
  {
    id: "act-02",
    actorId: "a-1",
    actorName: "Dana Okafor",
    at: hoursBeforeNow(3),
    action: "replied to",
    target: "HND-1039 · API returns 500 on bulk export endpoint",
    href: "/admin/tickets/HND-1039",
    kind: "reply",
  },
  {
    id: "act-03",
    actorId: "u-3",
    actorName: "Marcus Webb",
    at: hoursBeforeNow(1),
    action: "replied to",
    target: "HND-1040 · Mobile app crashes on ticket attachments",
    href: "/admin/tickets/HND-1040",
    kind: "reply",
  },
  {
    id: "act-04",
    actorId: "a-1",
    actorName: "Dana Okafor",
    at: hoursBeforeNow(6),
    action: "changed status to In progress on",
    target: "HND-1038 · Rate limit errors during nightly sync",
    href: "/admin/tickets/HND-1038",
    kind: "status_change",
  },
  {
    id: "act-05",
    actorId: "u-6",
    actorName: "Yuki Tanaka",
    at: hoursBeforeNow(7),
    action: "created ticket",
    target: "HND-1041 · Upgrade to Team plan — proration question",
    href: "/admin/tickets/HND-1041",
    kind: "ticket_created",
  },
  {
    id: "act-06",
    actorId: "a-1",
    actorName: "Dana Okafor",
    at: hoursBeforeNow(8),
    action: "assigned",
    target: "HND-1040 to Samir Haddad",
    href: "/admin/tickets/HND-1040",
    kind: "assignment",
  },
  {
    id: "act-07",
    actorId: "a-3",
    actorName: "Grace Lin",
    at: hoursBeforeNow(20),
    action: "replied to",
    target: "HND-1031 · Change workspace email address",
    href: "/admin/tickets/HND-1031",
    kind: "reply",
  },
  {
    id: "act-08",
    actorId: "a-1",
    actorName: "Dana Okafor",
    at: "2026-10-04T16:20:00Z",
    action: "invited",
    target: "nina@handly.app as support agent",
    kind: "admin",
  },
  {
    id: "act-09",
    actorId: "a-2",
    actorName: "Samir Haddad",
    at: "2026-10-04T14:05:00Z",
    action: "marked resolved",
    target: "HND-1024 · Notification digest arrives at wrong hour",
    href: "/admin/tickets/HND-1024",
    kind: "status_change",
  },
  {
    id: "act-10",
    actorId: "u-4",
    actorName: "Elena Petrova",
    at: "2026-10-04T09:30:00Z",
    action: "created ticket",
    target: "HND-1043 · Webhooks fire twice for the same event",
    href: "/admin/tickets/HND-1043",
    kind: "ticket_created",
  },
  {
    id: "act-11",
    actorId: "a-1",
    actorName: "Dana Okafor",
    at: "2026-10-03T14:41:00Z",
    action: "changed status to On hold on",
    target: "HND-1033 · SSO setup with Okta — metadata URL rejected",
    href: "/admin/tickets/HND-1033",
    kind: "status_change",
  },
  {
    id: "act-12",
    actorId: "a-1",
    actorName: "Dana Okafor",
    at: "2026-10-03T09:12:00Z",
    action: "signed in from",
    target: "Lisbon, PT · Chrome 141",
    kind: "auth",
  },
  {
    id: "act-13",
    actorId: "a-3",
    actorName: "Grace Lin",
    at: "2026-10-02T15:45:00Z",
    action: "replied to",
    target: "HND-1036 · Refund request for annual plan",
    href: "/admin/tickets/HND-1036",
    kind: "reply",
  },
  {
    id: "act-14",
    actorId: "a-1",
    actorName: "Dana Okafor",
    at: "2026-10-02T11:02:00Z",
    action: "suspended",
    target: "Tom Becker (tom@harborlogs.com)",
    kind: "user_admin",
  },
];

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export const userNotifications: AppNotification[] = [
  {
    id: "n-1",
    title: "Reply on HND-1039",
    body: "Dana replied to “API returns 500 on bulk export endpoint”.",
    at: hoursBeforeNow(3),
    read: false,
    href: "/tickets/HND-1039",
    tone: "info",
  },
  {
    id: "n-2",
    title: "HND-1042 needs a first response",
    body: "Your billing ticket has been open for 5 hours.",
    at: hoursBeforeNow(5),
    read: false,
    href: "/tickets/HND-1042",
    tone: "warning",
  },
  {
    id: "n-3",
    title: "HND-1031 is waiting on you",
    body: "Grace asked for confirmation of the verification email.",
    at: hoursBeforeNow(20),
    read: true,
    href: "/tickets/HND-1031",
    tone: "info",
  },
  {
    id: "n-4",
    title: "HND-1017 resolved",
    body: "The CSV timezone fix shipped in 2026.9.4.",
    at: "2026-09-26T10:05:00Z",
    read: true,
    href: "/tickets/HND-1017",
    tone: "success",
  },
];

export const adminNotifications: AppNotification[] = [
  {
    id: "an-1",
    title: "HND-1044 is critical",
    body: "Sign-in lockout has 2h of SLA left and no assignee.",
    at: hoursBeforeNow(2),
    read: false,
    href: "/admin/tickets/HND-1044",
    tone: "danger",
  },
  {
    id: "an-2",
    title: "HND-1039 at risk",
    body: "First response done, but resolution SLA ends in 2h.",
    at: hoursBeforeNow(3),
    read: false,
    href: "/admin/tickets/HND-1039",
    tone: "warning",
  },
  {
    id: "an-3",
    title: "New ticket HND-1043",
    body: "Elena reported duplicate webhooks (high priority).",
    at: hoursBeforeNow(4),
    read: false,
    href: "/admin/tickets/HND-1043",
    tone: "info",
  },
  {
    id: "an-4",
    title: "Nina accepted her invite",
    body: "She joins the support team on Monday.",
    at: "2026-10-04T09:00:00Z",
    read: true,
    href: "/admin/admins",
    tone: "success",
  },
];

/* ------------------------------------------------------------------ */
/* Dashboard stats                                                     */
/* ------------------------------------------------------------------ */

export const adminStats = {
  openTickets: 4,
  unanswered: 4,
  resolvedToday: 6,
  avgFirstResponseHours: 0.8,
  avgResolutionHours: 21,
  satisfaction: 94,
  /** Ticket counts per weekday for the last 7 days (Oldest → today). */
  ticketsByDay: [
    { label: "Mon", created: 12, resolved: 10 },
    { label: "Tue", created: 9, resolved: 11 },
    { label: "Wed", created: 14, resolved: 9 },
    { label: "Thu", created: 11, resolved: 13 },
    { label: "Fri", created: 16, resolved: 12 },
    { label: "Sat", created: 7, resolved: 8 },
    { label: "Sun", created: 10, resolved: 9 },
  ],
  /** Ticket counts per category, derived from the mock tickets below. */
  byCategory: [
    { label: "Billing", value: 5 },
    { label: "Technical", value: 3 },
    { label: "Bug report", value: 3 },
    { label: "Account", value: 2 },
    { label: "Feature request", value: 1 },
    { label: "Other", value: 1 },
  ],
};

/* ------------------------------------------------------------------ */
/* Marketing content (public pages)                                    */
/* ------------------------------------------------------------------ */

export const marketingFeatures = [
  {
    icon: "Inbox",
    title: "Unified inbox",
    description:
      "Email, chat, and web form tickets land in one calm queue with SLA timers and clear priorities.",
  },
  {
    icon: "Workflow",
    title: "Smart workflows",
    description:
      "Route tickets by topic, priority, or workload. Escalations happen automatically before SLAs break.",
  },
  {
    icon: "MessagesSquare",
    title: "Shared conversations",
    description:
      "Internal notes, canned replies, and collision detection keep your whole team on the same page.",
  },
  {
    icon: "BarChart3",
    title: "Insightful reports",
    description:
      "First response time, resolution time, and satisfaction trends — ready for your Monday stand-up.",
  },
  {
    icon: "ShieldCheck",
    title: "Enterprise security",
    description:
      "SSO, two-factor authentication, granular roles, and a full audit log of every action.",
  },
  {
    icon: "Bot",
    title: "Assistive automation",
    description:
      "Draft replies, tag tickets, and detect sentiment automatically — your agents stay in control.",
  },
];

export const marketingTestimonials = [
  {
    quote:
      "Handly cut our first response time from 6 hours to 40 minutes. The queue finally tells the truth about what matters.",
    name: "Maya Lindqvist",
    role: "Head of support, Nordic Home",
    initials: "ML",
  },
  {
    quote:
      "We migrated 40,000 tickets in an afternoon. Our agents needed zero training — the queue reads like a to-do list.",
    name: "Jonas Weber",
    role: "COO, Kranich Software",
    initials: "JW",
  },
  {
    quote:
      "The internal notes and collision detection alone paid for the plan. No more double replies to angry customers.",
    name: "Amara Diallo",
    role: "Support lead, Sahel Cloud",
    initials: "AD",
  },
];

export const marketingFaq = [
  {
    question: "Is there a free trial?",
    answer:
      "Yes — every plan starts with a 14-day free trial. No credit card required, and you keep every setting if you continue.",
  },
  {
    question: "Can I change plans later?",
    answer:
      "Any time. Upgrades apply immediately with prorated billing; downgrades take effect at the end of your cycle.",
  },
  {
    question: "How does per-seat billing work?",
    answer:
      "You pay for admins and agents who can reply to tickets. Customers and read-only viewers are always free.",
  },
  {
    question: "Do you offer data migration?",
    answer:
      "The Starter plan includes CSV import. Team and Enterprise plans include guided migration from Zendesk, Intercom, and Help Scout.",
  },
  {
    question: "Is Handly GDPR compliant?",
    answer:
      "Yes. Data is hosted in the EU and US, we sign DPAs on request, and you can export or delete every customer record.",
  },
  {
    question: "What support do I get?",
    answer:
      "Email support on all plans, live chat on Team, and a dedicated success manager plus 99.9% uptime SLA on Enterprise.",
  },
];

export const pricingPlans = [
  {
    name: "Starter",
    price: "$9",
    period: "per agent / month",
    description: "For small teams getting support off email.",
    cta: "Start free trial",
    highlight: false,
    features: [
      "3 inboxes (email, chat, form)",
      "Unlimited customers",
      "SLA timers & priorities",
      "Canned replies",
      "CSV import",
      "Email support",
    ],
  },
  {
    name: "Team",
    price: "$24",
    period: "per agent / month",
    description: "For growing teams that need automation and insight.",
    cta: "Start free trial",
    highlight: true,
    badge: "Most popular",
    features: [
      "Everything in Starter",
      "Unlimited inboxes",
      "Saved views & custom fields",
      "Automation rules & macros",
      "Reports & satisfaction surveys",
      "Live chat support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "billed annually",
    description: "For organizations with advanced security needs.",
    cta: "Contact sales",
    highlight: false,
    features: [
      "Everything in Team",
      "SSO / SAML & SCIM",
      "Audit log & data residency",
      "99.9% uptime SLA",
      "Dedicated success manager",
      "Guided migration",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Helper functions                                                    */
/* ------------------------------------------------------------------ */

export function getPerson(id: string): Person | undefined {
  return people.find((p) => p.id === id);
}

export function getTicketByDisplayId(displayId: string): Ticket | undefined {
  const normalized = displayId.toUpperCase().startsWith("HND-")
    ? displayId.toUpperCase()
    : `HND-${displayId}`;
  return tickets.find((t) => t.displayId === normalized);
}

export function getRepliesForTicket(ticketId: string): TicketReply[] {
  return ticketReplies
    .filter((r) => r.ticketId === ticketId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

/** Tickets created by the mock signed-in user, newest first. */
export const myTickets: Ticket[] = tickets
  .filter((t) => t.creatorId === currentUser.id)
  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

/** Mock user's tickets that have at least one agent/public reply. */
export const myAnsweredTickets: Ticket[] = myTickets.filter(
  (t) => getRepliesForTicket(t.id).some((r) => r.authorRole === "admin"),
);

/** Tickets without any agent reply — the admin's main queue. */
export const unansweredTickets: Ticket[] = tickets
  .filter((t) => t.firstResponseAt === null && t.resolvedAt === null)
  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

/** Tickets with at least one agent reply and not closed. */
export const adminAnsweredTickets: Ticket[] = tickets
  .filter((t) => t.firstResponseAt !== null)
  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

export const adminUsers = people.filter((p) => p.role === "user");
export const adminAdmins = people.filter((p) => p.role === "admin");

export const sortedActivityLog: ActivityEntry[] = [...activityLog].sort(
  (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
);
