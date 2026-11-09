/**
 * Integration tests against the real database.
 *
 * Unlike the unit tests these DO touch Postgres, because the rules worth
 * protecting here are enforced by SQL: tenant scoping, the identity-backed
 * display id, and attachment visibility. Everything runs inside a transaction
 * that is rolled back, so the demo data is never modified.
 *
 * Run with: npm run test:db
 *
 * Requires DATABASE_URL. Skips cleanly when it is absent (e.g. CI without a DB).
 */
import "dotenv/config";
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { randomUUID } from "node:crypto";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  describe("database integration", () => {
    it("skipped: DATABASE_URL is not set", () => {
      assert.ok(true);
    });
  });
} else {
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  let customerId = "";
  let otherCustomerId = "";
  let adminId = "";

  before(async () => {
    await client.connect();
    const users = await client.query(
      `select id, email, role from auth."user" order by email`,
    );
    const admin = users.rows.find((u) => u.role === "admin");
    const customers = users.rows.filter((u) => u.role !== "admin");
    assert.ok(admin, "seed needs at least one admin (run npm run db:seed)");
    assert.ok(customers.length >= 2, "seed needs two customers");
    adminId = admin.id;
    customerId = customers[0].id;
    otherCustomerId = customers[1].id;

    // Never let a failed run leave rows behind.
    await client.query("BEGIN");
  });

  after(async () => {
    await client.query("ROLLBACK").catch(() => {});
    await client.end();
  });

  /** Creates a ticket for `owner`, returning its display id. */
  async function makeTicket(owner: string, subject = "Test ticket"): Promise<string> {
    const tempId = `tmp_${randomUUID()}`;
    const row = await client.query(
      `INSERT INTO tickets
        (id, subject, description, status, priority, category, creator_id,
         creator_name, creator_email, sla_deadline, preview,
         unread_for_customer, unread_for_admin)
       VALUES ($1,$2,'Body of the test ticket.','open','medium','other',$3,
               'Test User','test@example.com', now() + interval '24 hours',
               'Body of the test ticket.', false, true)
       RETURNING number`,
      [tempId, subject, owner],
    );
    const displayId = `HND-${row.rows[0].number}`;
    await client.query("UPDATE tickets SET id=$1 WHERE id=$2", [displayId, tempId]);
    return displayId;
  }

  describe("ticket display ids", () => {
    it("derives HND-<number> from the identity column", async () => {
      const id = await makeTicket(customerId);
      assert.match(id, /^HND-\d+$/, `unexpected id: ${id}`);

      const row = await client.query(
        "select number, id from tickets where id = $1",
        [id],
      );
      assert.equal(row.rows[0].id, `HND-${row.rows[0].number}`);
    });

    it("produces a larger number for each new ticket", async () => {
      const first = await makeTicket(customerId);
      const second = await makeTicket(customerId);
      const n = (id: string) => Number(id.replace("HND-", ""));
      assert.ok(n(second) > n(first), `${second} should exceed ${first}`);
    });
  });

  describe("tenant scoping", () => {
    it("only lists a ticket for its creator", async () => {
      const id = await makeTicket(customerId);

      const owner = await client.query(
        "select count(*)::int n from tickets where id=$1 and creator_id=$2",
        [id, customerId],
      );
      const stranger = await client.query(
        "select count(*)::int n from tickets where id=$1 and creator_id=$2",
        [id, otherCustomerId],
      );
      assert.equal(owner.rows[0].n, 1);
      assert.equal(stranger.rows[0].n, 0);
    });

    it("hides internal notes from other customers' threads", async () => {
      const id = await makeTicket(customerId);
      await client.query(
        `INSERT INTO ticket_replies (id,ticket_id,author_id,author_name,author_role,kind,body)
         VALUES ($1,$2,$3,'An Admin','admin','internal_note','staff only')`,
        [randomUUID(), id, adminId],
      );

      // The customer-facing filter the DAL applies.
      const asCustomer = await client.query(
        "select count(*)::int n from ticket_replies where ticket_id=$1 and kind <> 'internal_note'",
        [id],
      );
      const asAdmin = await client.query(
        "select count(*)::int n from ticket_replies where ticket_id=$1",
        [id],
      );
      assert.equal(asCustomer.rows[0].n, 0);
      assert.equal(asAdmin.rows[0].n, 1);
    });
  });

  describe("attachments", () => {
    const bytes = Buffer.from("attachment body");

    async function attach(ticketId: string, replyId: string | null) {
      const id = randomUUID();
      await client.query(
        `INSERT INTO attachments
          (id,ticket_id,reply_id,uploader_id,file_name,content_type,size,checksum,data)
         VALUES ($1,$2,$3,$4,'log.txt','text/plain',$5,'test-checksum',$6)`,
        [id, ticketId, replyId, customerId, bytes.length, bytes],
      );
      return id;
    }

    it("round-trips bytes through bytea", async () => {
      const ticketId = await makeTicket(customerId);
      const id = await attach(ticketId, null);
      const row = await client.query(
        "select data, size, content_type from attachments where id=$1",
        [id],
      );
      assert.deepEqual(Buffer.from(row.rows[0].data), bytes);
      assert.equal(row.rows[0].size, bytes.length);
      assert.equal(row.rows[0].content_type, "text/plain");
    });

    it("keeps internal-note files out of the customer view", async () => {
      const ticketId = await makeTicket(customerId);
      const replyId = randomUUID();
      await client.query(
        `INSERT INTO ticket_replies (id,ticket_id,author_id,author_name,author_role,kind,body)
         VALUES ($1,$2,$3,'An Admin','admin','internal_note','note')`,
        [replyId, ticketId, adminId],
      );
      await attach(ticketId, replyId);

      // Mirrors the DAL's customer predicate.
      const visible = await client.query(
        `select count(*)::int n from attachments a
         left join ticket_replies r on r.id = a.reply_id
         where a.ticket_id = $1
           and (a.reply_id is null or r.kind <> 'internal_note')`,
        [ticketId],
      );
      assert.equal(visible.rows[0].n, 0);
    });

    it("cascades deletes with the ticket", async () => {
      const ticketId = await makeTicket(customerId);
      await attach(ticketId, null);
      await client.query("DELETE FROM tickets WHERE id=$1", [ticketId]);
      const left = await client.query(
        "select count(*)::int n from attachments where ticket_id=$1",
        [ticketId],
      );
      assert.equal(left.rows[0].n, 0);
    });
  });

  describe("notifications", () => {
    it("links admins to the admin queue and customers to their dashboard", async () => {
      const id = await makeTicket(customerId);
      const recipients = [adminId, customerId];
      const rows = await client.query(
        `select id, role from auth."user" where id = any($1)`,
        [recipients],
      );

      for (const row of rows.rows) {
        await client.query(
          `INSERT INTO notifications (id,user_id,title,body,href,tone,read,created_at)
           VALUES ($1,$2,'probe','body',$3,'info',false,now())`,
          [
            randomUUID(),
            row.id,
            row.role === "admin"
              ? `/admin/tickets/${id}`
              : `/dashboard/tickets/${id}`,
          ],
        );
      }

      const out = await client.query(
        `select n.href, u.role from notifications n
         join auth."user" u on u.id = n.user_id
         where n.title = 'probe' order by u.role`,
      );
      for (const row of out.rows) {
        const prefix = row.role === "admin" ? "/admin/tickets/" : "/dashboard/tickets/";
        assert.ok(
          row.href.startsWith(prefix),
          `${row.role} got ${row.href}, expected a ${prefix} link`,
        );
      }
    });

    it("clears a new-ticket alert once that ticket is answered", async () => {
      const answered = await makeTicket(customerId);
      const stillWaiting = await makeTicket(customerId);

      // Every admin alert kind for the answered ticket, to prove all of them clear.
      const titles = ["New high ticket", "Customer replied on", "You were assigned"];
      for (const ticketId of [answered, stillWaiting]) {
        for (const title of titles) {
          await client.query(
            `INSERT INTO notifications (id,user_id,title,body,href,tone,read,created_at)
             VALUES ($1,$2,$3,'body',$4,'info',false,now())`,
            [randomUUID(), adminId, `${title} ${ticketId}`, `/admin/tickets/${ticketId}`],
          );
        }
      }

      // The exact predicate replyToTicket uses for the first agent reply.
      await client.query(
        `UPDATE notifications SET read=true
         WHERE read=false AND href LIKE $1`,
        [`%/admin/tickets/${answered}`],
      );

      const rows = await client.query(
        `SELECT href, read FROM notifications
         WHERE href IN ($1,$2)`,
        [`/admin/tickets/${answered}`, `/admin/tickets/${stillWaiting}`],
      );
      const forAnswered = rows.rows.filter((r) => r.href.endsWith(answered));
      const forWaiting = rows.rows.filter((r) => r.href.endsWith(stillWaiting));
      assert.equal(forAnswered.length, titles.length);
      assert.ok(forAnswered.every((r) => r.read), "all alerts for the answered ticket clear");
      assert.ok(forWaiting.every((r) => !r.read), "the untouched ticket keeps its alerts");
    });

    it("cannot mark another user's notification read", async () => {
      const other = await client.query(
        `select id from notifications where user_id <> $1 limit 1`,
        [adminId],
      );
      assert.equal(other.rowCount, 1, "seed needs a non-admin notification");
      const notificationId = other.rows[0].id;

      // The exact predicate markNotificationRead applies for the *wrong* actor.
      const stolen = await client.query(
        "update notifications set read=true where id=$1 and user_id=$2",
        [notificationId, adminId],
      );
      assert.equal(stolen.rowCount, 0, "an admin must not mark a customer's row");
    });
  });

  describe("contact messages", () => {
    it("starts unhandled and can be marked handled", async () => {
      const id = randomUUID();
      await client.query(
        `INSERT INTO contact_messages (id,name,email,topic,message)
         VALUES ($1,'Test Sender','sender@example.com','sales','Hello there, a test message.')`,
        [id],
      );
      const before = await client.query(
        "select handled_at from contact_messages where id=$1",
        [id],
      );
      assert.equal(before.rows[0].handled_at, null);

      await client.query(
        "UPDATE contact_messages SET handled_at=now() WHERE id=$1",
        [id],
      );
      const afterRow = await client.query(
        "select handled_at from contact_messages where id=$1",
        [id],
      );
      assert.ok(afterRow.rows[0].handled_at instanceof Date);
    });
  });
}
