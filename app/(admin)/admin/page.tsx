import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  CircleDot,
  Clock,
  MessageSquareText,
  TrendingUp,
} from "lucide-react";
import {
  adminStats,
  adminAnsweredTickets,
  sortedActivityLog,
  unansweredTickets,
} from "@/lib/mock-data";
import { formatLongDay, formatRelativeTime } from "@/lib/format";
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { SlaBadge } from "@/components/ui/sla";
import { PriorityInline, StatusBadge } from "@/components/tickets/status-badges";
import { NOW } from "@/lib/format";

export const metadata: Metadata = {
  title: "Dashboard · Handly admin",
};

const kindIcon = {
  ticket_created: CircleDot,
  reply: MessageSquareText,
  status_change: Clock,
  assignment: MessageSquareText,
  admin: MessageSquareText,
  auth: MessageSquareText,
  user_admin: MessageSquareText,
} as const;

export default function AdminDashboardPage() {
  const maxCreated = Math.max(...adminStats.ticketsByDay.map((d) => d.created + d.resolved));
  const totalCategory = adminStats.byCategory.reduce((sum, c) => sum + c.value, 0);

  const stats = [
    {
      label: "Open tickets",
      value: adminStats.openTickets,
      hint: "Across all queues",
      href: "/admin/tickets",
      tone: "text-info",
    },
    {
      label: "Unanswered",
      value: adminStats.unanswered,
      hint: "Waiting for first reply",
      href: "/admin/tickets/unanswered",
      tone: "text-danger",
    },
    {
      label: "Resolved today",
      value: adminStats.resolvedToday,
      hint: formatLongDay(NOW),
      href: "/admin/tickets/answered",
      tone: "text-success",
    },
    {
      label: "Avg. first response",
      value: `${adminStats.avgFirstResponseHours}h`,
      hint: "Last 7 days",
      href: "/admin/activity",
      tone: "text-foreground",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Support overview for ${formatLongDay(NOW)}.`}
      />

      <Breadcrumbs
        items={[
          { label: "Dashboard" },
        ]}
      />

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="group">
            <Card className="h-full p-4 transition group-hover:border-border-strong group-hover:shadow-md">
              <p className="text-[13px] font-medium text-muted-foreground">{s.label}</p>
              <p className={`mt-2 font-mono text-3xl font-semibold tabular-nums ${s.tone}`}>
                {s.value}
              </p>
              <p className="mt-1 flex items-center gap-1 text-[13px] text-subtle-foreground">
                {s.hint}
                <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
              </p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Volume chart */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle>Ticket volume</CardTitle>
              <p className="text-[13px] text-muted-foreground">Created vs resolved, last 7 days</p>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden />
          </CardHeader>
          <CardContent>
            {/* Static bar chart: one column per day, created (brand) stacked on resolved (success) */}
            <div className="flex h-40 items-end gap-3" role="img" aria-label="Bar chart of created and resolved tickets per day, last 7 days">
              {adminStats.ticketsByDay.map((d) => {
                const total = d.created + d.resolved;
                return (
                  <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex w-full max-w-10 flex-1 flex-col justify-end gap-0.5">
                      <div
                        className="w-full rounded-t bg-primary/80"
                        style={{ height: `${(d.created / maxCreated) * 100}%` }}
                        title={`${d.created} created`}
                      />
                      <div
                        className="w-full rounded-b bg-success/70"
                        style={{ height: `${(d.resolved / maxCreated) * 100}%` }}
                        title={`${d.resolved} resolved`}
                      />
                      <span className="sr-only">
                        {d.label}: {d.created} created, {d.resolved} resolved
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground">{d.label}</span>
                    <span className="sr-only">{total} total</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-primary/80" aria-hidden /> Created
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-success/70" aria-hidden /> Resolved
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>By category</CardTitle>
            <p className="text-[13px] text-muted-foreground">All open and recent tickets</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {adminStats.byCategory.map((c) => {
                const pct = Math.round((c.value / totalCategory) * 100);
                return (
                  <li key={c.label}>
                    <div className="mb-1 flex items-center justify-between text-[13px]">
                      <span className="font-medium">{c.label}</span>
                      <span className="font-mono tabular-nums text-muted-foreground">
                        {c.value} · {pct}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className="h-full rounded-full bg-primary/80"
                        style={{ width: `${pct}%` }}
                        role="img"
                        aria-label={`${c.label}: ${c.value} tickets, ${pct} percent`}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* SLA risk queue */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Needs attention</CardTitle>
            <Link
              href="/admin/tickets/unanswered"
              className="text-[13px] font-medium text-primary hover:underline underline-offset-4"
            >
              Unanswered queue
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {unansweredTickets.slice(0, 4).map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/admin/tickets/${t.displayId}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-muted"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2">
                        <span className="font-mono text-[13px] text-muted-foreground">{t.displayId}</span>
                        <PriorityInline priority={t.priority} />
                      </p>
                      <p className="mt-0.5 truncate text-sm font-medium">{t.subject}</p>
                    </div>
                    <SlaBadge state={t.slaState} deadline={t.slaDeadline} />
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent activity</CardTitle>
            <Link
              href="/admin/activity"
              className="text-[13px] font-medium text-primary hover:underline underline-offset-4"
            >
              Full log
            </Link>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {sortedActivityLog.slice(0, 6).map((entry) => {
                const Icon = kindIcon[entry.kind];
                return (
                  <li key={entry.id} className="flex gap-3">
                    <Avatar initials={entry.actorName.split(" ").map((p) => p[0]).join("")} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] leading-snug">
                        <span className="font-medium">{entry.actorName}</span>{" "}
                        <span className="text-muted-foreground">{entry.action}</span>{" "}
                        {entry.href ? (
                          <Link href={entry.href} className="font-mono text-[13px] text-primary hover:underline">
                            {entry.target.split(" · ")[0]}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">{entry.target}</span>
                        )}
                      </p>
                      <time dateTime={entry.at} className="text-xs text-subtle-foreground">
                        {formatRelativeTime(entry.at)}
                      </time>
                    </div>
                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-subtle-foreground" aria-hidden />
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Answered strip */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Recently answered</CardTitle>
          <Link
            href="/admin/tickets/answered"
            className="text-[13px] font-medium text-primary hover:underline underline-offset-4"
          >
            All answered
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {adminAnsweredTickets.slice(0, 3).map((t) => (
              <li key={t.id}>
                <Link
                  href={`/admin/tickets/${t.displayId}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-muted"
                >
                  <StatusBadge status={t.status} />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{t.subject}</span>
                  <span className="hidden font-mono text-[13px] text-muted-foreground sm:block">{t.displayId}</span>
                  <time dateTime={t.updatedAt} className="w-16 text-right font-mono text-[13px] tabular-nums text-muted-foreground">
                    {formatRelativeTime(t.updatedAt)}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
