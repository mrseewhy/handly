"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { replyToTicket } from "@/lib/data/actions/tickets";
import { filesToUploadInput } from "@/lib/attachments-config";
import { AttachmentPicker } from "@/components/tickets/attachment-picker";

/**
 * Customer reply composer. Calls the `replyToTicket` server action, which
 * re-verifies the session and ticket ownership before writing.
 */
export function CustomerReplyForm({
  displayId,
  disabled = false,
}: {
  displayId: string;
  disabled?: boolean;
}) {
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await replyToTicket({
        displayId,
        body,
        files: await filesToUploadInput(files),
      });
      if (result.ok) {
        setBody("");
        setFiles([]);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-3">
      <label htmlFor="reply" className="block text-sm font-medium">
        Your reply
      </label>
      <Textarea
        id="reply"
        rows={4}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add more detail or answer a question…"
        disabled={disabled || pending}
      />
      <AttachmentPicker files={files} onChange={setFiles} disabled={disabled || pending} />
      {error && (
        <p role="alert" className="text-[13px] text-danger">
          {error}
        </p>
      )}
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] text-muted-foreground">
          Your reply is added to this thread for the support team.
        </p>
        <Button
          type="button"
          onClick={submit}
          disabled={disabled || pending || (body.trim().length === 0 && files.length === 0)}
        >
          <Send className="h-4 w-4" aria-hidden />
          {pending ? "Sending…" : "Send reply"}
        </Button>
      </div>
    </div>
  );
}
