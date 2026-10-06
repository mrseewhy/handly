import type { Metadata } from "next";
import { Inbox } from "lucide-react";
import { unansweredTickets } from "@/lib/mock-data";
import { formatRelativeTime } from "@/lib/format";
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { PageHeader, EmptyState } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { SlaBadge } from "@/components/ui/sla";
import { PriorityInline, StatusBadge } from "@/components/tickets/status-badges";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Unanswered tickets · Handly admin",
};

export default function UnansweredTicketsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Unanswered tickets"
        description="Tickets waiting for the first admin reply, most urgent SLA first."
      />

      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "All tickets", href: "/admin/tickets" },
          { label: "Unanswered" },
        ]}
      />

      <p className="text-[13px] text-subtle-foreground" aria-live="polite">
        Showing {unansweredTickets.length} unanswered ticket{unansweredTickets.length === 1 ? "" : "s"}.
      </p>

      {unansweredTickets.length > 0 ? (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <caption className="sr-only">Tickets awaiting a first response</caption>
            <thead>
              <tr className="bg-surface-muted text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="px-4 py-2.5">Ticket</th>
                <th scope="col" className="px-4 py-2.5">Customer</th>
                <th scope="col" className="hidden px-4 py-2.5 md:table-cell">Status</th>
                <th scope="col" className="px-4 py-2.5">SLA</th>
                <th scope="col" className="hidden px-4 py-2.5 text-right sm:table-cell">Waiting</th>
              </tr>
            </thead>
            <tbody>
              {unansweredTickets.map((t) => (
                <tr key={t.id} className="border-t border-border hover:bg-surface-muted">
                  <td className="px-4 py-3">
                    <Link href={`/admin/tickets/${t.displayId}`} className="group block">
                      <span className="font-mono text-[13px] text-muted-foreground">{t.displayId}</span>
                      <span className="mt-0.5 block max-w-xs truncate font-medium group-hover:text-primary md:max-w-sm">
                        {t.subject}
                      </span>
                      <span className="mt-0.5 block md:hidden"><PriorityInline priority={t.priority} /></span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <Avatar
                        initials={t.creatorName.split(" ").map((p) => p[0]).join("")}
                        size="sm"
                        customer
                      />
                      <span className="hidden whitespace-nowrap lg:block">{t.creatorName}</span>
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-4 py-3">
                    <SlaBadge state={t.slaState} deadline={t.slaDeadline} />
                  </td>
                  <td className="hidden px-4 py-3 text-right font-mono text-[13px] tabular-nums text-muted-foreground sm:table-cell">
                    {formatRelativeTime(t.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <Card>
          <EmptyState
            icon={Inbox}
            title="Queue is clear"
            description="No tickets are waiting for a first response. New tickets will show up here."
          />
        </Card>
      )}
    </div>
  );
}
