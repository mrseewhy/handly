import type { Metadata } from "next";
import Link from "next/link";
import {
  CircleAlert,
  CircleDot,
  Info,
  KeyRound,
  MessageSquareText,
  ScrollText,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { sortedActivityLog } from "@/lib/mock-data";
import { formatDateTime, formatDayGroup, formatRelativeTime } from "@/lib/format";
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { PageHeader, EmptyState } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

export const metadata: Metadata = {
  title: "Activity log · Handly admin",
};

const kindMeta = {
  ticket_created: { icon: CircleDot, color: "text-info" },
  reply: { icon: MessageSquareText, color: "text-primary" },
  status_change: { icon: Info, color: "text-warning" },
  assignment: { icon: UserCog, color: "text-muted-foreground" },
  admin: { icon: ShieldCheck, color: "text-success" },
  auth: { icon: KeyRound, color: "text-muted-foreground" },
  user_admin: { icon: CircleAlert, color: "text-danger" },
} as const;

export default function ActivityLogPage() {
  // Group entries by day (already sorted newest first).
  const groups: Array<{ day: string; entries: typeof sortedActivityLog }> = [];
  for (const entry of sortedActivityLog) {
    const day = formatDayGroup(entry.at);
    const existing = groups.find((g) => g.day === day);
    if (existing) existing.entries.push(entry);
    else groups.push({ day, entries: [entry] });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity log"
        description="Every ticket, reply, and admin action in this workspace. Entries are read-only."
      />

      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Activity log" },
        ]}
      />

      {groups.length === 0 ? (
        <Card>
          <EmptyState
            icon={ScrollText}
            title="No activity yet"
            description="Actions taken in the workspace will appear here."
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.day} aria-label={group.day}>
              <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-subtle-foreground">
                {group.day}
              </h2>
              <Card>
                <CardContent className="p-0">
                  <ol className="divide-y divide-border">
                    {group.entries.map((entry) => {
                      const meta = kindMeta[entry.kind];
                      const Icon = meta.icon;
                      const targetId = entry.target.split(" · ")[0];
                      const isTicketTarget = targetId.startsWith("HND-");
                      return (
                        <li key={entry.id} className="flex items-start gap-3 px-4 py-3">
                          <Avatar
                            initials={entry.actorName.split(" ").map((p) => p[0]).join("")}
                            size="sm"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm leading-snug">
                              <span className="font-medium">{entry.actorName}</span>{" "}
                              <span className="text-muted-foreground">{entry.action}</span>{" "}
                              {isTicketTarget && entry.href ? (
                                <Link href={entry.href} className="font-mono text-[13px] text-primary hover:underline underline-offset-4">
                                  {targetId}
                                </Link>
                              ) : (
                                <span className="font-medium">{entry.target}</span>
                              )}
                              {isTicketTarget && entry.href && (
                                <span className="text-muted-foreground"> — {entry.target.split(" · ")[1]}</span>
                              )}
                            </p>
                            <time
                              dateTime={entry.at}
                              title={formatDateTime(entry.at)}
                              className="text-xs text-subtle-foreground"
                            >
                              {formatRelativeTime(entry.at)}
                            </time>
                          </div>
                          <Icon className={`mt-1 h-4 w-4 shrink-0 ${meta.color}`} aria-hidden />
                        </li>
                      );
                    })}
                  </ol>
                </CardContent>
              </Card>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
