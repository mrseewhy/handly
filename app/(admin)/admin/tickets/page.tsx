import type { Metadata } from "next";
import { tickets } from "@/lib/mock-data";
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { PageHeader } from "@/components/ui/page-header";
import { TicketList } from "@/components/tickets/ticket-list";

export const metadata: Metadata = {
  title: "All tickets · Handly admin",
};

export default function AdminAllTicketsPage() {
  const sorted = [...tickets].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

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
        Showing {sorted.length} ticket{sorted.length === 1 ? "" : "s"}.
      </p>
      <TicketList tickets={sorted} basePath="/admin/tickets" />
    </div>
  );
}
