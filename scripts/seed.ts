/**
 * Seeds a demo workspace: one admin, two customers, tickets with threads,
 * an activity log, and notifications.
 *
 * Run with: npm run db:seed
 *
 * Idempotent: existing rows with the same ids are replaced.
 */
import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";

const DEMO_PASSWORD = "handly-demo-2026";

const ADMIN_ID = "usr_admin_maya";
const CUSTOMER_ID = "usr_customer_alex";
const OTHER_CUSTOMER_ID = "usr_customer_dana";

/** Fixed "now" so seeded SLA states are stable and reproducible. */
const NOW = new Date("2026-10-05T12:00:00.000Z");
const hoursAgo = (h: number): Date => new Date(NOW.getTime() - h * 3_600_000);

const SLA_HOURS: Record<string, number> = { urgent: 4, high: 8, medium: 24, low: 72 };

function slaDeadline(createdAt: Date, priority: string): Date {
  const hours = SLA_HOURS[priority] ?? 24;
  return new Date(createdAt.getTime() + hours * 3_600_000);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const users = [
  {
    id: ADMIN_ID,
    name: "Maya Lindqvist",
    email: "admin@handly.app",
    role: "admin",
  },
  {
    id: CUSTOMER_ID,
    name: "Alex Rivera",
    email: "alex@brightpath.io",
    role: "customer",
  },
  {
    id: OTHER_CUSTOMER_ID,
    name: "Dana Whitfield",
    email: "dana@northwind.co",
    role: "customer",
  },
];

const tickets = [
  {
    id: "HND-1044",
    number: 1044,
    subject: "Cannot sign in after password reset",
    description:
      "I reset my password twice and still get \"invalid credentials\" when signing in. This blocks my whole team from the dashboard.",
    status: "open",
    priority: "urgent",
    category: "account",
    creatorId: CUSTOMER_ID,
    creatorName: "Alex Rivera",
    creatorEmail: "alex@brightpath.io",
    assigneeId: ADMIN_ID,
    createdAt: hoursAgo(3),
    updatedAt: hoursAgo(1),
    firstResponseAt: null,
    resolvedAt: null,
    preview: "I reset my password twice and still get invalid credentials…",
    unreadForCustomer: false,
    unreadForAdmin: true,
  },
  {
    id: "HND-1042",
    number: 1042,
    subject: "Double charge on September invoice",
    description:
      "My card was charged twice for the same September invoice. I need the duplicate refunded.",
    status: "in_progress",
    priority: "high",
    category: "billing",
    creatorId: CUSTOMER_ID,
    creatorName: "Alex Rivera",
    creatorEmail: "alex@brightpath.io",
    assigneeId: ADMIN_ID,
    createdAt: hoursAgo(20),
    updatedAt: hoursAgo(5),
    firstResponseAt: hoursAgo(18),
    resolvedAt: null,
    preview: "Thanks for the invoice number — I can see the duplicate charge.",
    unreadForCustomer: true,
    unreadForAdmin: false,
  },
  {
    id: "HND-1039",
    number: 1039,
    subject: "API returns 500 on bulk export",
    description:
      "POST /api/export with more than 500 rows returns a 500. Smaller exports work fine.",
    status: "pending",
    priority: "urgent",
    category: "bug",
    creatorId: OTHER_CUSTOMER_ID,
    creatorName: "Dana Whitfield",
    creatorEmail: "dana@northwind.co",
    assigneeId: null,
    createdAt: hoursAgo(26),
    updatedAt: hoursAgo(22),
    firstResponseAt: null,
    resolvedAt: null,
    preview: "POST /api/export with more than 500 rows returns a 500…",
    unreadForCustomer: false,
    unreadForAdmin: true,
  },
  {
    id: "HND-1031",
    number: 1031,
    subject: "Change workspace email address",
    description: "We renamed the company and need the workspace email updated.",
    status: "resolved",
    priority: "low",
    category: "account",
    creatorId: OTHER_CUSTOMER_ID,
    creatorName: "Dana Whitfield",
    creatorEmail: "dana@northwind.co",
    assigneeId: ADMIN_ID,
    createdAt: hoursAgo(70),
    updatedAt: hoursAgo(60),
    firstResponseAt: hoursAgo(68),
    resolvedAt: hoursAgo(60),
    preview: "Your workspace email has been updated and confirmed.",
    unreadForCustomer: true,
    unreadForAdmin: false,
  },
  {
    id: "HND-1027",
    number: 1027,
    subject: "Feature request: saved views",
    description: "It would help if agents could save a filtered queue as a view.",
    status: "on_hold",
    priority: "medium",
    category: "feature_request",
    creatorId: CUSTOMER_ID,
    creatorName: "Alex Rivera",
    creatorEmail: "alex@brightpath.io",
    assigneeId: null,
    createdAt: hoursAgo(90),
    updatedAt: hoursAgo(80),
    firstResponseAt: hoursAgo(88),
    resolvedAt: null,
    preview: "Thanks — logged as a feature request for the team.",
    unreadForCustomer: false,
    unreadForAdmin: false,
  },
];

interface SeedReply {
  kind: "customer" | "agent" | "internal_note" | "system";
  authorId: string | null;
  authorName: string;
  authorRole: "user" | "admin" | "customer";
  body?: string;
  event?: string;
  at: Date;
}

/** Thread seeds keyed by display id. */
const threads: Record<string, SeedReply[]> = {
  "HND-1044": [
    {
      kind: "customer",
      authorId: CUSTOMER_ID,
      authorName: "Alex Rivera",
      authorRole: "customer",
      body: "I reset my password twice and still get \"invalid credentials\" when signing in. This blocks my whole team from the dashboard.",
      at: hoursAgo(3),
    },
    {
      kind: "system",
      authorId: null,
      authorName: "System",
      authorRole: "user",
      event: "Priority changed to Urgent",
      at: hoursAgo(2),
    },
  ],
  "HND-1042": [
    {
      kind: "customer",
      authorId: CUSTOMER_ID,
      authorName: "Alex Rivera",
      authorRole: "customer",
      body: "My card was charged twice for the same September invoice. I need the duplicate refunded.",
      at: hoursAgo(20),
    },
    {
      kind: "agent",
      authorId: ADMIN_ID,
      authorName: "Maya Lindqvist",
      authorRole: "admin",
      body: "Thanks for the invoice number — I can see the duplicate charge and have queued a refund. It should land in 3–5 business days.",
      at: hoursAgo(18),
    },
    {
      kind: "internal_note",
      authorId: ADMIN_ID,
      authorName: "Maya Lindqvist",
      authorRole: "admin",
      body: "Stripe shows two settled payments for inv_9f21. Refund issued via the billing dashboard.",
      at: hoursAgo(17),
    },
    {
      kind: "system",
      authorId: null,
      authorName: "System",
      authorRole: "user",
      event: "Status changed to In progress",
      at: hoursAgo(5),
    },
  ],
  "HND-1039": [
    {
      kind: "customer",
      authorId: OTHER_CUSTOMER_ID,
      authorName: "Dana Whitfield",
      authorRole: "customer",
      body: "POST /api/export with more than 500 rows returns a 500. Smaller exports work fine.",
      at: hoursAgo(26),
    },
    {
      kind: "system",
      authorId: null,
      authorName: "System",
      authorRole: "user",
      event: "Status changed to Pending",
      at: hoursAgo(22),
    },
  ],
  "HND-1031": [
    {
      kind: "customer",
      authorId: OTHER_CUSTOMER_ID,
      authorName: "Dana Whitfield",
      authorRole: "customer",
      body: "We renamed the company and need the workspace email updated.",
      at: hoursAgo(70),
    },
    {
      kind: "agent",
      authorId: ADMIN_ID,
      authorName: "Maya Lindqvist",
      authorRole: "admin",
      body: "Your workspace email has been updated and confirmed.",
      at: hoursAgo(60),
    },
  ],
  "HND-1027": [
    {
      kind: "customer",
      authorId: CUSTOMER_ID,
      authorName: "Alex Rivera",
      authorRole: "customer",
      body: "It would help if agents could save a filtered queue as a view.",
      at: hoursAgo(90),
    },
    {
      kind: "agent",
      authorId: ADMIN_ID,
      authorName: "Maya Lindqvist",
      authorRole: "admin",
      body: "Thanks — logged as a feature request for the team.",
      at: hoursAgo(88),
    },
  ],
};

const activity = [
  { kind: "ticket_created", actor: "Alex Rivera", actorId: CUSTOMER_ID, action: "created ticket", target: "HND-1044 · Cannot sign in after password reset", href: "/admin/tickets/HND-1044", at: hoursAgo(3) },
  { kind: "ticket_created", actor: "Alex Rivera", actorId: CUSTOMER_ID, action: "created ticket", target: "HND-1042 · Double charge on September invoice", href: "/admin/tickets/HND-1042", at: hoursAgo(20) },
  { kind: "reply", actor: "Maya Lindqvist", actorId: ADMIN_ID, action: "replied to", target: "HND-1042 · Double charge on September invoice", href: "/admin/tickets/HND-1042", at: hoursAgo(18) },
  { kind: "status_change", actor: "Maya Lindqvist", actorId: ADMIN_ID, action: "moved to In progress", target: "HND-1042 · Double charge on September invoice", href: "/admin/tickets/HND-1042", at: hoursAgo(5) },
  { kind: "ticket_created", actor: "Dana Whitfield", actorId: OTHER_CUSTOMER_ID, action: "created ticket", target: "HND-1039 · API returns 500 on bulk export", href: "/admin/tickets/HND-1039", at: hoursAgo(26) },
  { kind: "status_change", actor: "Maya Lindqvist", actorId: ADMIN_ID, action: "resolved", target: "HND-1031 · Change workspace email address", href: "/admin/tickets/HND-1031", at: hoursAgo(60) },
  { kind: "auth", actor: "Maya Lindqvist", actorId: ADMIN_ID, action: "signed in", target: "web app", href: null, at: hoursAgo(12) },
];

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Clean slate for the demo rows (not the schema).
    await client.query("DELETE FROM notifications");
    await client.query("DELETE FROM activity_log");
    await client.query("DELETE FROM ticket_replies");
    await client.query("DELETE FROM tickets");
    await client.query('DELETE FROM auth.session');
    await client.query('DELETE FROM auth.account');
    await client.query('DELETE FROM auth."user"');

    const passwordHash = await hashPassword(DEMO_PASSWORD);

    for (const u of users) {
      await client.query(
        `INSERT INTO auth."user" (id, name, email, email_verified, role, created_at, updated_at)
         VALUES ($1,$2,$3,true,$4,$5,$5)`,
        [u.id, u.name, u.email, u.role, hoursAgo(2000)],
      );
      await client.query(
        `INSERT INTO auth.account (id, account_id, provider_id, user_id, password, created_at, updated_at)
         VALUES ($1,$2,'credential',$3,$4,$5,$5)`,
        [randomUUID(), u.id, u.id, passwordHash, hoursAgo(2000)],
      );
    }

    for (const t of tickets) {
      await client.query(
        `INSERT INTO tickets
          (id, number, subject, description, status, priority, category,
           creator_id, creator_name, creator_email, assignee_id,
           created_at, updated_at, first_response_at, resolved_at, sla_deadline,
           preview, unread_for_customer, unread_for_admin)
         OVERRIDING SYSTEM VALUE
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
        [
          t.id, t.number, t.subject, t.description, t.status, t.priority, t.category,
          t.creatorId, t.creatorName, t.creatorEmail, t.assigneeId,
          t.createdAt, t.updatedAt, t.firstResponseAt, t.resolvedAt,
          slaDeadline(t.createdAt, t.priority),
          t.preview, t.unreadForCustomer, t.unreadForAdmin,
        ],
      );
    }

    // Keep the identity sequence ahead of the seeded numbers.
    await client.query(
      "SELECT setval('tickets_number_seq', (SELECT MAX(number) FROM tickets))",
    );

    for (const [ticketId, replies] of Object.entries(threads)) {
      for (const r of replies) {
        await client.query(
          `INSERT INTO ticket_replies
            (id, ticket_id, author_id, author_name, author_role, kind, body, event, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [randomUUID(), ticketId, r.authorId, r.authorName, r.authorRole, r.kind, r.body ?? null, r.event ?? null, r.at],
        );
      }
    }

    for (const a of activity) {
      await client.query(
        `INSERT INTO activity_log (id, actor_id, actor_name, kind, action, target, href, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [randomUUID(), a.actorId, a.actor, a.kind, a.action, a.target, a.href, a.at],
      );
    }

    const notifications = [
      { userId: CUSTOMER_ID, title: "New reply on HND-1042", body: "Maya Lindqvist replied to your billing question.", href: "/dashboard/tickets/HND-1042", tone: "info", read: false, at: hoursAgo(18) },
      { userId: CUSTOMER_ID, title: "HND-1031 was resolved", body: "Your workspace email change is complete.", href: "/dashboard/tickets/HND-1031", tone: "success", read: true, at: hoursAgo(60) },
      { userId: CUSTOMER_ID, title: "SLA at risk on HND-1044", body: "An urgent ticket is close to breaching its SLA.", href: "/dashboard/tickets/HND-1044", tone: "warning", read: false, at: hoursAgo(1) },
      { userId: ADMIN_ID, title: "1 ticket needs a first reply", body: "The unanswered queue has an urgent ticket.", href: "/admin/tickets/unanswered", tone: "danger", read: false, at: hoursAgo(1) },
      { userId: ADMIN_ID, title: "Daily summary ready", body: "5 tickets created, 2 resolved in the last 24 hours.", href: "/admin", tone: "info", read: true, at: hoursAgo(12) },
    ];
    for (const n of notifications) {
      await client.query(
        `INSERT INTO notifications (id, user_id, title, body, href, tone, read, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [randomUUID(), n.userId, n.title, n.body, n.href, n.tone, n.read, n.at],
      );
    }

    await client.query("COMMIT");
    console.log("Seed complete.");
    console.log(`  users: ${users.length}`);
    console.log(`  tickets: ${tickets.length}`);
    console.log(
      `  replies: ${Object.values(threads).reduce((n, t) => n + t.length, 0)}`,
    );
    console.log(`  activity: ${activity.length}`);
    console.log("\nDemo sign-in:");
    console.log("  admin    admin@handly.app / " + DEMO_PASSWORD);
    console.log("  customer alex@brightpath.io / " + DEMO_PASSWORD);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
