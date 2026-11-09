import type { Metadata } from "next";
import { CreateTicketForm } from "@/components/tickets/create-ticket-form";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Create ticket · Handly",
};

export default function CreateTicketPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Create ticket"
        description="Tell us what happened. The more detail you share, the faster we can help."
        backHref="/dashboard/tickets"
        backLabel="My tickets"
      />

      <div>
        <CreateTicketForm />
      </div>
    </div>
  );
}
