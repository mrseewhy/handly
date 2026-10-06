import type { Metadata } from "next";
import { MessageSquareText } from "lucide-react";
import { myAnsweredTickets } from "@/lib/mock-data";
import { PageHeader, EmptyState } from "@/components/ui/page-header";
import { TicketList } from "@/components/tickets/ticket-list";

export const metadata: Metadata = {
  title: "Answered tickets · Handly",
};

export default function AnsweredTicketsPage() {
  const hasTickets = myAnsweredTickets.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Answered tickets"
        description="Tickets our team has replied to. New replies move them to the top."
      />
      {hasTickets ? (
        <TicketList tickets={myAnsweredTickets} basePath="/dashboard/tickets" />
      ) : (
        <div className="rounded-lg border border-border bg-surface shadow-sm">
          <EmptyState
            icon={MessageSquareText}
            title="No answered tickets yet"
            description="When our team replies to one of your tickets, it will show up here."
          />
        </div>
      )}
    </div>
  );
}
