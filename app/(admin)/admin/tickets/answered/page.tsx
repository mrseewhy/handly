import type { Metadata } from "next";
import { adminAnsweredTickets } from "@/lib/mock-data";
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { PageHeader } from "@/components/ui/page-header";
import { TicketList } from "@/components/tickets/ticket-list";

export const metadata: Metadata = {
  title: "Answered tickets · Handly admin",
};

export default function AdminAnsweredTicketsPage() {
  return (
    <div>
      <div className="space-y-6">
        <PageHeader
          title="Answered tickets"
          description="Tickets with at least one admin reply, newest activity first."
        />
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "All tickets", href: "/admin/tickets" },
            { label: "Answered" },
          ]}
        />
        <TicketList tickets={adminAnsweredTickets} basePath="/admin/tickets" />
      </div>
    </div>
  );
}
