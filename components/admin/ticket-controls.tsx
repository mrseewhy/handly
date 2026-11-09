"use client";

import { useState, useTransition } from "react";
import { Send, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label, Select, Textarea } from "@/components/ui/input";
import { replyToTicket, updateTicket } from "@/lib/data/actions/tickets";
import { filesToUploadInput } from "@/lib/attachments-config";
import { AttachmentPicker } from "@/components/tickets/attachment-picker";
import {
  priorityConfig,
  statusConfig,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/ticket-config";

/** Admin reply / internal-note composer. */
export function AdminReplyForm({
  displayId,
  creatorName,
}: {
  displayId: string;
  creatorName: string;
}) {
  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await replyToTicket({
        displayId,
        body,
        internal,
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
      <div className="space-y-1.5">
        <Label htmlFor="reply">
          {internal ? "Internal note" : `Reply to ${creatorName}`}
        </Label>
        <Textarea
          id="reply"
          rows={5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={
            internal
              ? "Visible to staff only…"
              : "Your reply is sent to the customer…"
          }
          disabled={pending}
        />
      </div>
      <AttachmentPicker files={files} onChange={setFiles} disabled={pending} />
      {error && (
        <p role="alert" className="text-[13px] text-danger">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <input
            type="checkbox"
            checked={internal}
            onChange={(e) => setInternal(e.target.checked)}
            className="h-4 w-4 rounded border-border"
            disabled={pending}
          />
          <StickyNote className="h-3.5 w-3.5" aria-hidden />
          Internal note (not sent to the customer)
        </label>
        <Button
          type="button"
          onClick={submit}
          disabled={pending || (body.trim().length === 0 && files.length === 0)}
        >
          <Send className="h-4 w-4" aria-hidden />
          {pending ? "Sending…" : internal ? "Add note" : "Send reply"}
        </Button>
      </div>
    </div>
  );
}

/** Admin status / priority / assignee controls. */
export function TicketPropertiesForm({
  displayId,
  status,
  priority,
  assigneeId,
  agents,
}: {
  displayId: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigneeId: string | null;
  agents: { id: string; name: string }[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function update(patch: {
    status?: TicketStatus;
    priority?: TicketPriority;
    assigneeId?: string | null;
  }) {
    setError(null);
    startTransition(async () => {
      const result = await updateTicket({ displayId, ...patch });
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="status">Status</Label>
        <Select
          id="status"
          value={status}
          disabled={pending}
          onChange={(e) => update({ status: e.target.value as TicketStatus })}
        >
          {TICKET_STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusConfig[s].label}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="priority">Priority</Label>
        <Select
          id="priority"
          value={priority}
          disabled={pending}
          onChange={(e) => update({ priority: e.target.value as TicketPriority })}
        >
          {TICKET_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {priorityConfig[p].label}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="assignee">Assignee</Label>
        <Select
          id="assignee"
          value={assigneeId ?? ""}
          disabled={pending}
          onChange={(e) => update({ assigneeId: e.target.value || null })}
        >
          <option value="">Unassigned</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
      </div>
      {error && (
        <p role="alert" className="text-[13px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
