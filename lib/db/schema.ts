import { relations } from "drizzle-orm";
import {
  boolean,
  customType,
  index,
  integer,
  pgEnum,
  pgSchema,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * Raw binary column. Attachments live in Postgres (bytea) rather than an
 * external bucket: the database is already provisioned, it survives serverless
 * deploys, and it keeps downloads behind the same authorization as the ticket.
 */
const bytea = customType<{ data: Buffer; notNull: false; default: false }>({
  dataType() {
    return "bytea";
  },
});

/* ------------------------------------------------------------------ */
/* Better Auth tables (schema: auth)                                   */
/* ------------------------------------------------------------------ */

/**
 * Better Auth owns these tables. Column names/keys match what
 * `getAuthTables()` expects, so the drizzle adapter needs no overrides.
 * `role` and the ban fields are added by the admin plugin.
 */
export const authSchema = pgSchema("auth");

export const user = authSchema.table("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  role: text("role"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires", { withTimezone: true }),
});

export const session = authSchema.table(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    // Required by the Better Auth admin plugin (user impersonation).
    impersonatedBy: text("impersonated_by"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const account = authSchema.table(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("account_user_id_idx").on(t.userId)],
);

export const verification = authSchema.table(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

/* ------------------------------------------------------------------ */
/* Application enums — must stay in sync with lib/ticket-config.ts     */
/* ------------------------------------------------------------------ */

export const ticketStatusEnum = pgEnum("ticket_status", [
  "open",
  "in_progress",
  "pending",
  "on_hold",
  "resolved",
  "closed",
]);

export const ticketPriorityEnum = pgEnum("ticket_priority", [
  "urgent",
  "high",
  "medium",
  "low",
]);

export const ticketCategoryEnum = pgEnum("ticket_category", [
  "billing",
  "technical",
  "account",
  "bug",
  "feature_request",
  "other",
]);

export const ticketReplyKindEnum = pgEnum("ticket_reply_kind", [
  "customer",
  "agent",
  "internal_note",
  "system",
]);

export const activityKindEnum = pgEnum("activity_kind", [
  "ticket_created",
  "reply",
  "status_change",
  "assignment",
  "admin",
  "auth",
  "user_admin",
]);

export const notificationToneEnum = pgEnum("notification_tone", [
  "info",
  "success",
  "warning",
  "danger",
]);

/* ------------------------------------------------------------------ */
/* Tickets                                                             */
/* ------------------------------------------------------------------ */

export const tickets = pgTable(
  "tickets",
  {
    /** Human-facing id used in URLs: "HND-1042". */
    id: text("id").primaryKey(),
    /** Monotonic number behind the display id. */
    number: integer("number").notNull().generatedAlwaysAsIdentity(),
    subject: text("subject").notNull(),
    description: text("description").notNull(),
    status: ticketStatusEnum("status").notNull().default("open"),
    priority: ticketPriorityEnum("priority").notNull().default("medium"),
    category: ticketCategoryEnum("category").notNull().default("other"),
    /** Customer who opened the ticket (auth.user.id). */
    creatorId: text("creator_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** Snapshot of the customer's details for list rendering without a join. */
    creatorName: text("creator_name").notNull(),
    creatorEmail: text("creator_email").notNull(),
    assigneeId: text("assignee_id").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    firstResponseAt: timestamp("first_response_at", { withTimezone: true }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    slaDeadline: timestamp("sla_deadline", { withTimezone: true }).notNull(),
    /** Last reply preview, maintained by the reply action. */
    preview: text("preview").notNull().default(""),
    /** True until the owner (customer) or assignee has read the latest reply. */
    unreadForCustomer: boolean("unread_for_customer").notNull().default(false),
    unreadForAdmin: boolean("unread_for_admin").notNull().default(true),
  },
  (t) => [
    uniqueIndex("tickets_number_unique").on(t.number),
    index("tickets_creator_idx").on(t.creatorId),
    index("tickets_assignee_idx").on(t.assigneeId),
    index("tickets_status_idx").on(t.status),
    index("tickets_updated_idx").on(t.updatedAt),
  ],
);

export const ticketReplies = pgTable(
  "ticket_replies",
  {
    id: text("id").primaryKey(),
    ticketId: text("ticket_id")
      .notNull()
      .references(() => tickets.id, { onDelete: "cascade" }),
    authorId: text("author_id").references(() => user.id, { onDelete: "set null" }),
    /** Denormalised so a deleted account does not blank out the thread. */
    authorName: text("author_name").notNull(),
    authorRole: text("author_role").notNull(),
    kind: ticketReplyKindEnum("kind").notNull(),
    body: text("body"),
    /** For kind="system", e.g. "Status changed to Pending". */
    event: text("event"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("ticket_replies_ticket_idx").on(t.ticketId, t.createdAt)],
);

/* ------------------------------------------------------------------ */
/* Attachments                                                         */
/* ------------------------------------------------------------------ */

/**
 * Files attached to a ticket or to a single reply.
 *
 * `data` holds the bytes; `size` and `checksum` let us reject oversized or
 * corrupted uploads without reading the blob out. Internal-note attachments
 * inherit the reply's visibility, so the DAL filters them alongside replies.
 */
export const attachments = pgTable(
  "attachments",
  {
    id: text("id").primaryKey(),
    ticketId: text("ticket_id")
      .notNull()
      .references(() => tickets.id, { onDelete: "cascade" }),
    /** Null when the file was attached at ticket-creation time. */
    replyId: text("reply_id").references(() => ticketReplies.id, {
      onDelete: "cascade",
    }),
    uploaderId: text("uploader_id").references(() => user.id, {
      onDelete: "set null",
    }),
    fileName: text("file_name").notNull(),
    contentType: text("content_type").notNull(),
    size: integer("size").notNull(),
    /** sha256 of the bytes, used to detect truncated transfers. */
    checksum: text("checksum").notNull(),
    data: bytea("data").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("attachments_ticket_idx").on(t.ticketId, t.createdAt)],
);

/* ------------------------------------------------------------------ */
/* Activity log                                                        */
/* ------------------------------------------------------------------ */

export const activityLog = pgTable(
  "activity_log",
  {
    id: text("id").primaryKey(),
    actorId: text("actor_id").references(() => user.id, { onDelete: "set null" }),
    actorName: text("actor_name").notNull(),
    kind: activityKindEnum("kind").notNull(),
    action: text("action").notNull(),
    target: text("target").notNull(),
    href: text("href"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("activity_log_created_idx").on(t.createdAt)],
);

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export const notifications = pgTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    href: text("href").notNull(),
    tone: notificationToneEnum("tone").notNull().default("info"),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("notifications_user_idx").on(t.userId, t.createdAt)],
);

/**
 * Messages from the public contact form. Stored so nothing is silently
 * dropped while no email provider is configured; admins read them from the
 * activity log once email delivery exists.
 */
export const contactMessages = pgTable(
  "contact_messages",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    topic: text("topic").notNull(),
    message: text("message").notNull(),
    /** Null until a signed-in user's message is tied to their account. */
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    handledAt: timestamp("handled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("contact_messages_created_idx").on(t.createdAt)],
);

/* ------------------------------------------------------------------ */
/* Relations                                                           */
/* ------------------------------------------------------------------ */

export const userRelations = relations(user, ({ many }) => ({
  tickets: many(tickets),
  notifications: many(notifications),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  creator: one(user, { fields: [tickets.creatorId], references: [user.id] }),
  assignee: one(user, { fields: [tickets.assigneeId], references: [user.id] }),
  replies: many(ticketReplies),
}));

export const ticketRepliesRelations = relations(ticketReplies, ({ one }) => ({
  ticket: one(tickets, { fields: [ticketReplies.ticketId], references: [tickets.id] }),
  author: one(user, { fields: [ticketReplies.authorId], references: [user.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(user, { fields: [notifications.userId], references: [user.id] }),
}));

/* ------------------------------------------------------------------ */
/* Inferred types                                                      */
/* ------------------------------------------------------------------ */

export type TicketRow = typeof tickets.$inferSelect;
export type NewTicketRow = typeof tickets.$inferInsert;
export type TicketReplyRow = typeof ticketReplies.$inferSelect;
export type NewTicketReplyRow = typeof ticketReplies.$inferInsert;
export type ActivityRow = typeof activityLog.$inferSelect;
export type NotificationRow = typeof notifications.$inferSelect;
export type UserRow = typeof user.$inferSelect;
