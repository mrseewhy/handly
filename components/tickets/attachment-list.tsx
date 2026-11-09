import { FileText, Image as ImageIcon, Paperclip } from "lucide-react";
import { formatFileSize } from "@/lib/attachments-config";
import type { AttachmentMeta } from "@/lib/data/dal/attachments";
import { cn } from "@/lib/cn";

function IconFor({ contentType }: { contentType: string }) {
  if (contentType.startsWith("image/")) return ImageIcon;
  if (contentType === "application/pdf" || contentType.startsWith("text/")) return FileText;
  return Paperclip;
}

/**
 * Attachment list for a ticket thread.
 *
 * Links go to `/api/attachments/<id>`, which re-checks the session before
 * streaming bytes — hiding a link here is cosmetic, not the security boundary.
 */
export function AttachmentList({
  attachments,
  className,
}: {
  attachments: AttachmentMeta[];
  className?: string;
}) {
  if (attachments.length === 0) return null;

  return (
    <ul className={cn("flex flex-wrap gap-2", className)} aria-label="Attachments">
      {attachments.map((file) => {
        const Icon = IconFor(file);
        return (
          <li key={file.id}>
            <a
              href={`/api/attachments/${file.id}`}
              className="inline-flex max-w-full items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5 text-[13px] text-foreground transition-colors hover:border-border-strong hover:bg-surface-muted"
              // Downloads are new files, not navigations inside the app.
              download={file.fileName}
            >
              <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="min-w-0 truncate">{file.fileName}</span>
              <span className="shrink-0 font-mono text-[11px] tabular-nums text-subtle-foreground">
                {formatFileSize(file.size)}
              </span>
              {file.internal && (
                <span className="shrink-0 rounded bg-warning-subtle px-1.5 py-0.5 text-[11px] font-medium text-warning">
                  Internal
                </span>
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
