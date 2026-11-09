import type { Metadata } from "next";
import { listAllTickets } from "@/lib/data/dal/tickets";
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { TicketList } from "@/components/tickets/ticket-list";
import { requireAdminPage } from "@/lib/data/dal/session";

export const metadata: Metadata = {
  title: "All tickets · Handly admin",
};

export default async function AdminAllTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireAdminPage();
  const params = await searchParams;
  const result = await listAllTickets(params.page);

  return (
    <div className="space-y-6">
      <PageHeader
        title="All tickets"
        description="Every ticket from every customer, newest activity first."
      />
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "All tickets" },
        ]}
      />
      <p className="text-[13px] text-subtle-foreground" aria-live="polite">
        Showing {result.items.length} of {result.total} ticket
        {result.total === 1 ? "" : "s"}.
      </p>
      <TicketList tickets={result.items} basePath="/admin/tickets" initialQuery={params.q ?? ""} />
      <Pagination page={result} basePath="/admin/tickets" query={{ q: params.q }} />
    </div>
  );
}
