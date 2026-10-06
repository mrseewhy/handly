import type { Metadata } from "next";
import Link from "next/link";
import { Inbox, MessageSquareText, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { currentUser, myTickets, myAnsweredTickets, userNotifications } from "@/lib/mock-data";
import { getRepliesForTicket } from "@/lib/mock-data";
import { formatDateTime, formatRelativeTime, formatDate } from "@/lib/format";
import { isActiveStatus } from "@/lib/ticket-config";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Dashboard",
};

function latestReplyFor(ticketId: string): { body: string; at: string } | null {
  const replies = getRepliesForTicket(ticketId);
  const agentReplies = replies.filter((r) => r.authorRole === "admin" && r.body);
  if (agentReplies.length === 0) return null;
  const last = agentReplies[agentReplies.length - 1];
  return { body: last.body ?? "", at: last.createdAt };
}

export default function CustomerDashboardPage() {
  const open = myTickets.filter((t) => isActiveStatus(t.status));
  const answered = myAnsweredTickets;
  const unread = userNotifications.filter((n) => !n.read).length;
  const needsAttention = open.filter((t) => t.firstResponseAt === null && t.resolvedAt === null);
  const mostRecent = myTickets[0];
  const latestAgentReply = mostRecent ? latestReplyFor(mostRecent.id) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${currentUser.name.split(" ")[0]}.`}
      />

      {/* Greeting card */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4">
          <Avatar initials={currentUser.initials} size="lg" customer />
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold">{currentUser.name}</p>
            <p className="text-sm text-muted-foreground">
              {currentUser.email} · Member since {formatDate(currentUser.joinedAt)}
            </p>
          </div>
          <ButtonLink href="/dashboard/tickets/new" size="sm">
            New ticket
          </ButtonLink>
        </CardContent>
      </Card>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Inbox}
          label="Total tickets"
          value={String(myTickets.length)}
          href="/dashboard/tickets"
        />
        <StatCard
          icon={Clock}
          label="Open"
          value={String(open.length)}
          href="/dashboard/tickets?status=open"
          tone={open.length > 0 ? "text-info" : undefined}
        />
        <StatCard
          icon={MessageSquareText}
          label="Answered"
          value={String(answered.length)}
          href="/dashboard/tickets/answered"
        />
        <StatCard
          icon={CheckCircle2}
          label="Unread notices"
          value={String(unread)}
          href="/dashboard/notifications"
          tone={unread > 0 ? "text-warning" : undefined}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Latest activity / reply */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Latest activity</CardTitle>
          </CardHeader>
          <CardContent>
            {mostRecent ? (
              <Link
                href={`/dashboard/tickets/${mostRecent.displayId}`}
                className="flex items-start gap-3 rounded-md border border-border bg-surface px-4 py-3 transition-colors hover:bg-surface-muted"
              >
                <Avatar
                  initials={mostRecent.creatorName.split(" ").map((p) => p[0]).join("")}
                  size="sm"
                  customer
                />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2">
                    <span className="font-mono text-[13px] text-muted-foreground">
                      {mostRecent.displayId}
                    </span>
                    <span className="truncate text-sm font-medium">{mostRecent.subject}</span>
                  </p>                    <p className="mt-1 text-sm text-muted-foreground">
                      {mostRecent.status === "resolved" ? "Resolved" : "Open"}
                    </p>
                  {latestAgentReply && (
                    <p className="mt-2 text-sm">
                      <span className="text-muted-foreground">Support replied: </span>
                      <span className="text-foreground">&ldquo;{latestAgentReply.body}&rdquo;</span>
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2 text-[13px] text-muted-foreground">
                    <time dateTime={mostRecent.updatedAt}>{formatRelativeTime(mostRecent.updatedAt)}</time>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    Open thread
                  </div>
                </div>
              </Link>
            ) : (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                No tickets yet. Create one to get started.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Needs attention */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Needs your attention</CardTitle>
            <Link
              href="/dashboard/tickets?status=open"
              className="text-[13px] font-medium text-primary hover:underline underline-offset-4"
            >
              View all open
            </Link>
          </CardHeader>
          <CardContent>
            {needsAttention.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                Nothing waiting on you right now.
              </p>
            ) : (
              <ul className="space-y-2">
                {needsAttention.slice(0, 3).map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/dashboard/tickets/${t.displayId}`}
                      className="flex items-center justify-between rounded-md border border-border bg-surface px-4 py-3 transition-colors hover:bg-surface-muted"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2">
                          <span className="font-mono text-[13px] text-muted-foreground">
                            {t.displayId}
                          </span>
                          <span className="truncate text-sm font-medium">{t.subject}</span>
                        </p>
                        <p className="mt-0.5 text-[13px] text-muted-foreground">
                          Opened {formatRelativeTime(t.createdAt)}
                          {t.unread && " · Unread"}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-warning-subtle px-2 py-0.5 text-[11px] font-medium text-warning">
                        Awaiting reply
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href: string;
  tone?: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="h-full p-4 transition group-hover:border-border-strong group-hover:shadow-md">
        <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
        <p className={cn("mt-2 font-mono text-3xl font-semibold tabular-nums", tone ?? "text-foreground")}>
          {value}
        </p>
        <p className="mt-1 flex items-center gap-1 text-[13px] text-subtle-foreground">
          <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
          {label === "Answered"
            ? "Agent replied"
            : label === "Open"
              ? "Need attention"
              : label === "Unread notices"
                ? "In your inbox"
                : "All tickets"}
        </p>
      </Card>
    </Link>
  );
}
