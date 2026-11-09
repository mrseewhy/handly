import { NextResponse } from "next/server";
import { getAttachmentForDownload } from "@/lib/data/dal/attachments";

/**
 * Streams one attachment back to an authorized viewer.
 *
 * Authorization happens in the DAL against the live session, so a stolen id is
 * useless without access to the ticket. Responses are always `attachment` with
 * `nosniff`, so a crafted content type cannot be rendered as HTML in the app's
 * origin (which would otherwise be a stored-XSS vector).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let file;
  try {
    file = await getAttachmentForDownload(id);
  } catch {
    // No session, or a session that cannot read this ticket.
    return new NextResponse("Not found", { status: 404 });
  }

  if (!file) return new NextResponse("Not found", { status: 404 });

  // RFC 5987 so non-ASCII filenames survive the header.
  const encoded = encodeURIComponent(file.fileName);

  return new NextResponse(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.contentType,
      "Content-Length": String(file.data.length),
      "Content-Disposition": `attachment; filename="${encoded}"; filename*=UTF-8''${encoded}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
