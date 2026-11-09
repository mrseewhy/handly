import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { attachments, ticketReplies, tickets } from "@/lib/db/schema";
import { requireTicketReader } from "@/lib/data/dal/session";

import { formatFileSize, validateAttachment } from "@/lib/attachments-config";

export interface AttachmentMeta {
  id: string;
  ticketId: string;
  replyId: string | null;
  fileName: string;
  contentType: string;
  size: number;
  createdAt: string;
  /** True when the file belongs to a staff-only internal note. */
  internal: boolean;
}

const metaColumns = {
  id: attachments.id,
  ticketId: attachments.ticketId,
  replyId: attachments.replyId,
  fileName: attachments.fileName,
  contentType: attachments.contentType,
  size: attachments.size,
  createdAt: attachments.createdAt,
};

/**
 * Attachments the given viewer is allowed to see.
 *
 * A file attached to an internal note is staff-only. Customers therefore see
 * only ticket-level files plus files on non-internal replies.
 */
export async function listTicketAttachments(
  ticketId: string,
): Promise<AttachmentMeta[]> {
  const { actor, isAdmin } = await requireTicketReader();

  const [ticket] = await db
    .select({ creatorId: tickets.creatorId })
    .from(tickets)
    .where(eq(tickets.id, ticketId))
    .limit(1);

  if (!ticket) return [];
  if (!isAdmin && ticket.creatorId !== actor.id) return [];

  const rows = await db
    .select({
      ...metaColumns,
      replyKind: ticketReplies.kind,
    })
    .from(attachments)
    .leftJoin(ticketReplies, eq(attachments.replyId, ticketReplies.id))
    .where(
      isAdmin
        ? eq(attachments.ticketId, ticketId)
        : and(
            eq(attachments.ticketId, ticketId),
            // Either attached to the ticket itself, or to a non-internal reply.
            sql`(${attachments.replyId} is null or ${ticketReplies.kind} <> 'internal_note')`,
          ),
    )
    .orderBy(asc(attachments.createdAt));

  return rows.map((r) => ({
    id: r.id,
    ticketId: r.ticketId,
    replyId: r.replyId,
    fileName: r.fileName,
    contentType: r.contentType,
    size: r.size,
    createdAt: r.createdAt.toISOString(),
    internal: r.replyKind === "internal_note",
  }));
}

/**
 * Loads one file's bytes after re-checking visibility. Returns null when the
 * actor may not read it, so callers can answer 404 without leaking existence.
 */
export async function getAttachmentForDownload(
  attachmentId: string,
): Promise<{ fileName: string; contentType: string; data: Buffer } | null> {
  const { actor, isAdmin } = await requireTicketReader();

  const [row] = await db
    .select({
      fileName: attachments.fileName,
      contentType: attachments.contentType,
      data: attachments.data,
      ticketId: attachments.ticketId,
      replyId: attachments.replyId,
      replyKind: ticketReplies.kind,
      creatorId: tickets.creatorId,
    })
    .from(attachments)
    .innerJoin(tickets, eq(attachments.ticketId, tickets.id))
    .leftJoin(ticketReplies, eq(attachments.replyId, ticketReplies.id))
    .where(eq(attachments.id, attachmentId))
    .limit(1);

  if (!row) return null;

  // Ownership check.
  if (!isAdmin && row.creatorId !== actor.id) return null;
  // Internal-note files are staff-only.
  if (!isAdmin && row.replyKind === "internal_note") return null;

  return {
    fileName: row.fileName,
    contentType: row.contentType,
    data: row.data,
  };
}

export interface NewAttachment {
  fileName: string;
  contentType: string;
  /** Buffer on the server; a Uint8Array or number[] across the RSC boundary. */
  data: Buffer | Uint8Array | number[];
}

/** Normalises whatever the RSC transport produced into a Buffer. */
function toBuffer(data: NewAttachment["data"]): Buffer {
  if (Buffer.isBuffer(data)) return data;
  return Buffer.from(data);
}


/**
 * Inserts attachment rows. Called inside the caller's transaction so files and
 * their ticket/reply are committed together.
 */
export async function insertAttachments(
  tx: Pick<typeof db, "insert">,
  args: {
    ticketId: string;
    replyId: string | null;
    uploaderId: string | null;
    files: NewAttachment[];
  },
): Promise<void> {
  if (args.files.length === 0) return;

  await tx.insert(attachments).values(
    args.files.map((file) => {
      const data = toBuffer(file.data);
      return {
        id: randomUUID(),
        ticketId: args.ticketId,
        replyId: args.replyId,
        uploaderId: args.uploaderId,
        fileName: file.fileName,
        contentType: file.contentType,
        size: data.length,
        checksum: createHash("sha256").update(data).digest("hex"),
        data,
      };
    }),
  );
}


export { formatFileSize, validateAttachment };
