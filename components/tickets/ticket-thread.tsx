import { Lock } from "lucide-react";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import type { TicketReply } from "@/lib/mock-data";
import { getPerson } from "@/lib/mock-data";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";

/**
 * Conversation thread per design system §7.7. Message bodies use 16px
 * (`text-base`) for comfortable reading, max width `max-w-prose`.
 */
export function TicketThread({
  replies,
}: {
  replies: TicketReply[];
}) {
  return (
    <ol className="space-y-4" aria-label="Conversation">
      {replies.map((reply) => {
        const author = getPerson(reply.authorId);
        const initials = author?.initials ?? "??";
        const name = author?.name ?? "Unknown";
        const time = formatRelativeTime(reply.createdAt);

        if (reply.kind === "system") {
          return (
            <li key={reply.id} className="flex items-center gap-3 py-1" aria-label={`System event: ${reply.event}`}>
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">{reply.event}</span>
              <span className="h-px flex-1 bg-border" />
            </li>
          );
        }

        if (reply.kind === "internal_note") {
          return (
            <li key={reply.id} className="flex gap-3">
              <Avatar initials={initials} size="md" />
              <div className="min-w-0 flex-1 rounded-lg border border-dashed border-warning/40 bg-warning-subtle p-4">
                <div className="mb-1 flex items-center gap-2 text-xs">
                  <Lock className="h-3 w-3 text-warning" aria-hidden />
                  <span className="font-medium text-foreground">Internal note</span>
                  <span className="text-muted-foreground">
                    {name} · {formatDateTime(reply.createdAt)}
                  </span>
                  <time className="ml-auto text-muted-foreground" dateTime={reply.createdAt}>
                    {time}
                  </time>
                </div>
                <p className="max-w-prose text-base leading-relaxed text-foreground">{reply.body}</p>
              </div>
            </li>
          );
        }

        const isAgent = reply.kind === "agent";

        return (
          <li key={reply.id} className="flex gap-3">
            <Avatar initials={initials} size="md" customer={!isAgent} />
            <div
              className={cn(
                "min-w-0 flex-1 rounded-lg border p-4",
                isAgent
                  ? "border-transparent bg-primary-subtle"
                  : "border-border bg-surface",
              )}
            >
              <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                <span className="font-medium text-foreground">{name}</span>
                {isAgent && (
                  <span className="rounded-full bg-primary px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-primary-foreground">
                    Staff
                  </span>
                )}
                <span className="text-muted-foreground">{formatDateTime(reply.createdAt)}</span>
                <time className="ml-auto text-muted-foreground" dateTime={reply.createdAt}>
                  {time}
                </time>
              </div>
              <p className="max-w-prose whitespace-pre-line text-base leading-relaxed text-foreground">
                {reply.body}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
