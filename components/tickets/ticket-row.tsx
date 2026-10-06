import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatRelativeTime } from "@/lib/format";
import type { Ticket } from "@/lib/mock-data";
import { Avatar } from "@/components/ui/avatar";
import { SlaBadge } from "@/components/ui/sla";
import { PriorityInline, StatusBadge } from "@/components/tickets/status-badges";

/**
 * Queue-list row, per design system §7.5. Wrap in a bordered container.
 * Reads priority → subject → status → SLA → assignee → time.
 */
export function TicketRow({
  ticket,
  selected = false,
  href,
  className,
}: {
  ticket: Ticket;
  selected?: boolean;
  href?: string;
  className?: string;
}) {
  const Wrapper = href ? Link : "div";
  const assigneeInitials = ticket.assigneeName
    ? ticket.assigneeName
        .split(" ")
        .map((p) => p[0])
        .join("")
    : null;

  return (
    <Wrapper
      href={href ?? "#"}
      aria-current={selected ? "true" : undefined}
      className={cn(
        "relative flex items-center gap-4 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-surface-muted",
        selected && "bg-primary-subtle",
        className,
      )}
    >
      {/* Selected / unread indicators */}
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-1/2 h-8 w-0.5 -translate-y-1/2 rounded-r-full bg-primary",
          !selected && "hidden",
        )}
      />
      {ticket.unread && !selected && (
        <span
          role="status"
          aria-label="Unread"
          className="absolute left-1.5 h-1.5 w-1.5 rounded-full bg-primary"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[13px] text-muted-foreground">{ticket.displayId}</span>
          <PriorityInline priority={ticket.priority} />
        </div>
        <span className={cn("truncate text-sm text-foreground", ticket.unread ? "font-semibold" : "font-medium")}>
          {ticket.subject}
        </span>
        <span className="truncate text-[13px] text-muted-foreground">{ticket.preview}</span>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <StatusBadge status={ticket.status} className="hidden sm:inline-flex" />
        <SlaBadge state={ticket.slaState} deadline={ticket.slaDeadline} className="hidden md:inline-flex" />
        {assigneeInitials ? (
          <Avatar initials={assigneeInitials} size="sm" />
        ) : (
          <span
            className="inline-flex h-6 items-center rounded-full border border-dashed border-border-strong px-2 text-[11px] text-subtle-foreground"
            title="Unassigned"
          >
            —
          </span>
        )}
        <time
          dateTime={ticket.updatedAt}
          className="w-16 text-right font-mono text-[13px] tabular-nums text-muted-foreground"
        >
          {formatRelativeTime(ticket.updatedAt)}
        </time>
      </div>
    </Wrapper>
  );
}
