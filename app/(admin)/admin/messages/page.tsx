import type { Metadata } from "next";
import { Inbox } from "lucide-react";
import { listContactMessages } from "@/lib/data/dal/messages";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { PageHeader, EmptyState } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { MessageActions } from "@/components/admin/message-actions";
import { cn } from "@/lib/cn";
import { requireAdminPage } from "@/lib/data/dal/session";

export const metadata: Metadata = {
  title: "Messages · Handly admin",
};

const TOPIC_LABELS: Record<string, string> = {
  sales: "Sales and pricing",
  support: "Product support",
  migration: "Migration help",
  other: "Something else",
};

export default async function AdminMessagesPage() {
  await requireAdminPage();
  const messages = await listContactMessages();
  const unhandled = messages.filter((m) => !m.handledAt).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Sent through the public contact form. Email delivery is not configured, so nothing is forwarded — this is the inbox."
      />

      <Breadcrumbs
        items={[{ label: "Dashboard", href: "/admin" }, { label: "Messages" }]}
      />

      <p className="text-[13px] text-subtle-foreground" aria-live="polite">
        {messages.length === 0
          ? "No messages yet."
          : `${messages.length} message${messages.length === 1 ? "" : "s"} · ${unhandled} unhandled.`}
      </p>

      {messages.length === 0 ? (
        <Card>
          <EmptyState
            icon={Inbox}
            title="No messages yet"
            description="Messages sent through the contact form will appear here."
          />
        </Card>
      ) : (
        <ul className="space-y-3">
          {messages.map((message) => (
            <li key={message.id}>
              <Card
                className={cn(
                  "p-4",
                  message.handledAt && "opacity-60",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{message.name}</span>
                      <a
                        href={`mailto:${message.email}`}
                        className="font-mono text-[13px] text-primary hover:underline underline-offset-4"
                      >
                        {message.email}
                      </a>
                      <span className="rounded bg-surface-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {TOPIC_LABELS[message.topic] ?? message.topic}
                      </span>
                      {message.handledAt ? (
                        <span className="rounded bg-success-subtle px-1.5 py-0.5 text-[11px] font-medium text-success">
                          Handled
                        </span>
                      ) : (
                        <span className="rounded bg-warning-subtle px-1.5 py-0.5 text-[11px] font-medium text-warning">
                          New
                        </span>
                      )}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                      {message.message}
                    </p>
                    <p className="mt-2 text-[13px] text-subtle-foreground">
                      Sent {formatDateTime(message.createdAt)}
                      <span className="text-muted-foreground"> · {formatRelativeTime(message.createdAt)}</span>
                    </p>
                  </div>
                  <div className="shrink-0">
                    <MessageActions message={message} />
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
