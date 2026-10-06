import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { myTickets } from "@/lib/mock-data";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

export const metadata: Metadata = {
  title: "Activity",
};

export default function UserActivityPage() {
  const entries = myTickets
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity"
        description="A summary of your recent ticket activity, newest first."
      />
      {entries.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted">
              <MessageSquareText className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No activity yet</p>
            <p className="text-sm text-muted-foreground">
              Tickets you create and update will show up here.
            </p>
          </div>
        </Card>
      ) : (
        <Card className="p-0">
          <ul className="divide-y divide-border">
            {entries.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/dashboard/tickets/${t.displayId}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-muted"
                >
                  <Avatar
                    initials={t.creatorName.split(" ").map((p) => p[0]).join("")}
                    size="sm"
                    customer
                  />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2">
                      <span className="font-mono text-[13px] text-muted-foreground">
                        {t.displayId}
                      </span>
                      <span className="truncate text-sm font-medium">{t.subject}</span>
                    </p>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">
                      {t.status === "open"
                        ? "Open ticket"
                        : t.status === "resolved"
                          ? "Resolved"
                          : t.status === "closed"
                            ? "Closed"
                            : "Updated"}
                    </p>
                  </div>
                  <time
                    dateTime={t.updatedAt}
                    className="w-24 text-right font-mono text-[13px] tabular-nums text-muted-foreground"
                  >
                    {formatDateTime(t.updatedAt)}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
