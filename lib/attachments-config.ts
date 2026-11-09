/**
 * Attachment limits shared by the client picker and the server validator.
 *
 * Kept out of the DAL on purpose: the DAL imports `server-only`, so importing
 * it from a client component would fail the build.
 */

/** 10 MB: generous for screenshots and logs, small enough for Postgres. */
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

/** Content types we are willing to store and serve back. */
export const ALLOWED_ATTACHMENT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/json",
] as const;

export type AllowedAttachmentType = (typeof ALLOWED_ATTACHMENT_TYPES)[number];

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Converts picked browser `File`s into the plain payload the server actions
 * accept. Runs on the client, so it returns plain objects (Buffers cannot cross
 * the RSC boundary).
 */
export async function filesToUploadInput(
  files: File[],
): Promise<{ fileName: string; contentType: string; data: Uint8Array }[]> {
  return Promise.all(
    files.map(async (file) => ({
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      data: new Uint8Array(await file.arrayBuffer()),
    })),
  );
}

/** Minimal shape needed to validate an upload; no Buffer dependency. */
export interface AttachmentCandidate {
  fileName: string;
  contentType: string;
  data: { length: number };
}

/**
 * The single source of truth for what may be stored.
 *
 * Lives here (not in the DAL) so it can be unit-tested without a session, and
 * so client-side checks and server-side enforcement cannot drift apart.
 */
export function validateAttachment(file: AttachmentCandidate): string | null {
  if (file.data.length === 0) return "That file is empty.";
  if (file.data.length > MAX_ATTACHMENT_BYTES) {
    return `Files must be ${MAX_ATTACHMENT_BYTES / (1024 * 1024)} MB or smaller.`;
  }
  if (
    !ALLOWED_ATTACHMENT_TYPES.includes(
      file.contentType as AllowedAttachmentType,
    )
  ) {
    return "That file type is not supported.";
  }
  if (!file.fileName || file.fileName.length > 200) return "That file name is not valid.";
  return null;
}
