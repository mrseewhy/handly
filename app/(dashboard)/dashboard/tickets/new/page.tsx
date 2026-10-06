import type { Metadata } from "next";
import { CreateTicketForm } from "@/components/tickets/create-ticket-form";

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

function PageHeader({
  title,
  description,
  backHref,
  backLabel,
}: {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {backHref && (
          <a
            href={backHref}
            className="mb-2 inline-flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground"
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            {backLabel ?? "Back"}
          </a>
        )}
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
