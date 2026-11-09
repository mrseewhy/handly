import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { listMyActivity } from "@/lib/data/dal/people";
import { formatRelativeTime } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

export const metadata: Metadata = {
  title: "Activity",
};

export default async function UserActivityPage() {
  const entries = await listMyActivity(50);

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
                  href={
                    t.href
                      ? t.href.replace("/admin/tickets/", "/dashboard/tickets/")
                      : "/dashboard/tickets"
                  }
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-muted"
                >
                  <Avatar
                    initials={t.actorName.split(" ").map((p) => p[0]).join("")}
                    size="sm"
                    customer
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{t.actorName}</span>{" "}
                      <span className="text-muted-foreground">{t.action}</span>{" "}
                      <span className="truncate font-medium">{t.target}</span>
                    </p>
                  </div>
                  <time
                    dateTime={t.at}
                    className="w-24 shrink-0 text-right font-mono text-[13px] tabular-nums text-muted-foreground"
                  >
                    {formatRelativeTime(t.at)}
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
