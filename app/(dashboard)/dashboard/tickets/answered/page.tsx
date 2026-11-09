import type { Metadata } from "next";
import { MessageSquareText } from "lucide-react";
import { listMyAnsweredTickets } from "@/lib/data/dal/tickets";
import { PageHeader, EmptyState } from "@/components/ui/page-header";
import { TicketList } from "@/components/tickets/ticket-list";
import { Pagination } from "@/components/ui/pagination";

export const metadata: Metadata = {
  title: "Answered tickets · Handly",
};

export default async function AnsweredTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const myAnsweredTickets = await listMyAnsweredTickets(params.page);
  const hasTickets = myAnsweredTickets.items.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Answered tickets"
        description="Tickets our team has replied to. New replies move them to the top."
      />
      {hasTickets ? (
        <TicketList tickets={myAnsweredTickets.items} basePath="/dashboard/tickets" />
      ) : (
        <div className="rounded-lg border border-border bg-surface shadow-sm">
          <EmptyState
            icon={MessageSquareText}
            title="No answered tickets yet"
            description="When our team replies to one of your tickets, it will show up here."
          />
        </div>
      )}

      <Pagination page={myAnsweredTickets} basePath="/dashboard/tickets/answered" />
    </div>
  );
}
