"use client";

import { useRef, useState } from "react";
import { Paperclip, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { MAX_ATTACHMENT_BYTES, formatFileSize } from "@/lib/attachments-config";

/** Kept in sync with the DAL allow-list; the server re-validates every file. */
const ACCEPT = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/json",
].join(",");

/**
 * File picker for tickets and replies.
 *
 * Files are held in component state and handed to the server action on submit,
 * so an abandoned form never uploads anything. Client checks are for fast
 * feedback only — `validateAttachment` re-checks size and type on the server.
 */
export function AttachmentPicker({
  files,
  onChange,
  disabled = false,
}: {
  files: File[];
  onChange: (next: File[]) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  function addFiles(selected: FileList | null) {
    if (!selected || selected.length === 0) return;
    setError(null);

    const next = [...files];
    for (const file of Array.from(selected)) {
      if (file.size > MAX_ATTACHMENT_BYTES) {
        setError(`${file.name} is larger than 10 MB.`);
        continue;
      }
      // Skip exact duplicates picked twice.
      if (next.some((f) => f.name === file.name && f.size === file.size)) continue;
      next.push(file);
    }
    onChange(next);
    // Allow re-picking the same file after removing it.
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeAt(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT}
        className="sr-only"
        id="attachment-input"
        disabled={disabled}
        onChange={(e) => addFiles(e.target.files)}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "inline-flex items-center gap-2 rounded-md border border-border-strong px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors",
          "hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        <Paperclip className="h-3.5 w-3.5" aria-hidden />
        Attach files
      </button>

      {files.length > 0 && (
        <ul className="space-y-1.5">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}`}
              className="flex items-center gap-2 rounded-md border border-border bg-surface-muted px-2.5 py-1.5 text-[13px]"
            >
              <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                {formatFileSize(file.size)}
              </span>
              <button
                type="button"
                onClick={() => removeAt(index)}
                disabled={disabled}
                aria-label={`Remove ${file.name}`}
                className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-surface hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="text-[13px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
