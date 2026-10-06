"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { statusConfig, TICKET_STATUSES, type TicketStatus } from "@/lib/ticket-config";
import type { Ticket } from "@/lib/mock-data";
import { EmptyState } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { TicketRow } from "@/components/tickets/ticket-row";
import { Button, ButtonLink } from "@/components/ui/button";

type StatusFilter = TicketStatus | "all" | "active";

export function TicketList({
  tickets,
  basePath,
  showCreateButton = false,
  createLabel = "Create ticket",
  createHref = "/dashboard/tickets/new",
}: {
  tickets: Ticket[];
  /** Base path for row links, e.g. "/dashboard/tickets" or "/admin/tickets". */
  basePath: string;
  showCreateButton?: boolean;
  createLabel?: string;
  createHref?: string;
}) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const map = new Map<StatusFilter, number>();
    map.set("all", tickets.length);
    map.set(
      "active",
      tickets.filter((t) => !["resolved", "closed"].includes(t.status)).length,
    );
    for (const s of TICKET_STATUSES) {
      map.set(s, tickets.filter((t) => t.status === s).length);
    }
    return map;
  }, [tickets]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets.filter((t) => {
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "active"
            ? !["resolved", "closed"].includes(t.status)
            : t.status === filter;
      const matchesQuery =
        q === "" ||
        t.subject.toLowerCase().includes(q) ||
        t.displayId.toLowerCase().includes(q) ||
        t.creatorName.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [tickets, filter, query]);

  const filters: Array<{ key: StatusFilter; label: string }> = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "open", label: statusConfig.open.label },
    { key: "in_progress", label: statusConfig.in_progress.label },
    { key: "pending", label: statusConfig.pending.label },
    { key: "resolved", label: statusConfig.resolved.label },
    { key: "closed", label: statusConfig.closed.label },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by status">
          {filters.map((f) => {
            const active = filter === f.key;
            const count = counts.get(f.key) ?? 0;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "border-primary bg-primary-subtle text-primary"
                    : "border-border-strong text-muted-foreground hover:bg-surface-muted hover:text-foreground",
                )}
              >
                {f.label}
                <span className="font-mono tabular-nums opacity-70">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full lg:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search subject, ID, or person…"
              className="pl-9"
              aria-label="Search tickets"
            />
          </div>
          {showCreateButton && (
            <ButtonLink href={createHref} size="md" className="shrink-0">
              {createLabel}
            </ButtonLink>
          )}
        </div>
      </div>

      {/* List */}
      {visible.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
          {visible.map((ticket) => (
            <TicketRow key={ticket.id} ticket={ticket} href={`${basePath}/${ticket.displayId}`} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface shadow-sm">
          <EmptyState
            icon={Search}
            title="No tickets match"
            description={
              query
                ? `Nothing matches “${query}”. Try a different search term or clear the filters.`
                : "No tickets with this status right now. New tickets will show up here."
            }
            action={
              query ? (
                <Button variant="secondary" size="sm" onClick={() => setQuery("")}>
                  Clear search
                </Button>
              ) : undefined
            }
          />
        </div>
      )}

      <p className="text-[13px] text-subtle-foreground" aria-live="polite">
        Showing {visible.length} of {tickets.length} tickets
      </p>
    </div>
  );
}
