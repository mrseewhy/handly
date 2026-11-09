import type { Metadata } from "next";
import { listAnsweredTickets } from "@/lib/data/dal/tickets";
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { PageHeader } from "@/components/ui/page-header";
import { TicketList } from "@/components/tickets/ticket-list";
import { Pagination } from "@/components/ui/pagination";
import { requireAdminPage } from "@/lib/data/dal/session";

export const metadata: Metadata = {
  title: "Answered tickets · Handly admin",
};

export default async function AdminAnsweredTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdminPage();
  const params = await searchParams;
  const result = await listAnsweredTickets(params.page);

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
        <TicketList tickets={result.items} basePath="/admin/tickets" />
        <Pagination page={result} basePath="/admin/tickets/answered" />
      </div>
    </div>
  );
}
