import type { Metadata } from "next";
import { isActiveStatus } from "@/lib/ticket-config";
import { myTickets } from "@/lib/mock-data";
import { PageHeader } from "@/components/ui/page-header";
import { TicketList } from "@/components/tickets/ticket-list";

export const metadata: Metadata = {
  title: "My tickets",
};

type StatusFilter = "open" | "closed" | "all";

export default async function MyTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const p = await searchParams;
  const status: StatusFilter =
    p.status === "open" || p.status === "closed" || p.status === "all"
      ? p.status
      : "all";

  const visible =
    status === "all"
      ? myTickets
      : myTickets.filter((t) =>
          status === "open" ? isActiveStatus(t.status) : !isActiveStatus(t.status),
        );

  return (
    <div className="space-y-6">
      <PageHeader
        title="My tickets"
        description="Every ticket you have created, newest activity first."
      />
      <StatusTabs current={status} />
      <p className="text-[13px] text-subtle-foreground" aria-live="polite">
        Showing {visible.length} of {myTickets.length} ticket{myTickets.length === 1 ? "" : "s"}.
      </p>
      <TicketList tickets={visible} basePath="/dashboard/tickets" showCreateButton />
    </div>
  );
}

function StatusTabs({ current }: { current: StatusFilter }) {
  const tabs: StatusFilter[] = ["open", "closed", "all"];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tabs.map((f) => (
        <a
          key={f}
          href={`/dashboard/tickets?status=${f}`}
          className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors ${
            current === f
              ? "border-primary bg-primary-subtle text-primary"
              : "border-border-strong text-muted-foreground hover:bg-surface-muted hover:text-foreground"
          }`}
        >
          {f}
        </a>
      ))}
    </div>
  );
}
