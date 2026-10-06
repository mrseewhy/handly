import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Send } from "lucide-react";
import { getRepliesForTicket, getTicketByDisplayId } from "@/lib/mock-data";
import { formatDateTime, slaPercentUsed } from "@/lib/format";
import { CATEGORY_LABELS, priorityConfig, statusConfig, TICKET_PRIORITIES, TICKET_STATUSES } from "@/lib/ticket-config";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label, Select, Textarea } from "@/components/ui/input";
import { SlaMeter } from "@/components/ui/sla";
import { PriorityBadge, StatusBadge } from "@/components/tickets/status-badges";
import { TicketThread } from "@/components/tickets/ticket-thread";
import { people } from "@/lib/mock-data";
import { cn } from "@/lib/cn";

interface PageProps {
  params: Promise<{ displayId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { displayId } = await params;
  const ticket = getTicketByDisplayId(decodeURIComponent(displayId));
  return {
    title: ticket ? `${ticket.displayId} · Handly admin` : "Ticket not found · Handly admin",
  };
}

export default async function AdminTicketDetailPage({ params }: PageProps) {
  const { displayId } = await params;
  const ticket = getTicketByDisplayId(decodeURIComponent(displayId));
  if (!ticket) notFound();

  const replies = getRepliesForTicket(ticket.id);
  const agents = people.filter((p) => p.role === "admin" && p.status !== "invited");

  return (
    <div className="space-y-6">
      <PageHeader
        title={ticket.subject}
        backHref="/admin/tickets"
        backLabel="All tickets"
        actions={
          <>
            <StatusBadge status={ticket.status} className="h-fit px-3 py-1 text-[13px]" />
            <PriorityBadge priority={ticket.priority} className="h-fit px-3 py-1 text-[13px]" />
          </>
        }
      />

      <Breadcrumbs
        items={[
          { label: "All tickets", href: "/admin/tickets" },
          { label: ticket.displayId },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[13px] text-muted-foreground">{ticket.displayId}</span>
                <span className="text-[13px] text-muted-foreground">
                  via {CATEGORY_LABELS[ticket.category].toLowerCase()} form
                </span>
              </div>
              <span className="text-[13px] text-muted-foreground">
                Opened {formatDateTime(ticket.createdAt)}
              </span>
            </CardHeader>
            <CardContent>
              <TicketThread replies={replies} />
            </CardContent>
          </Card>

          {/* Composer */}
          <Card>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="reply">Reply to {ticket.creatorName}</Label>
                <Textarea
                  id="reply"
                  rows={5}
                  placeholder="Write a reply…"
                />
                <p className="text-[13px] text-muted-foreground">
                  Replies are public. Internal notes are not sent to the customer.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-3">
                <Button
                  type="button"
                  disabled
                  aria-disabled="true"
                  title="Connected backend required to send replies"
                >
                  <Send className="h-4 w-4" aria-hidden />
                  Send reply
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Properties panel */}
        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select id="status" defaultValue={ticket.status}>
                  {TICKET_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {statusConfig[s].label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="priority">Priority</Label>
                <Select id="priority" defaultValue={ticket.priority}>
                  {TICKET_PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {priorityConfig[p].label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="assignee">Assignee</Label>
                <Select id="assignee" defaultValue={ticket.assigneeId ?? ""}>
                  <option value="">Unassigned</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="border-t border-border pt-4">
                <SlaMeter
                  state={ticket.slaState}
                  deadline={ticket.slaDeadline}
                  percentUsed={slaPercentUsed(ticket.createdAt, ticket.slaDeadline)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Avatar initials={ticket.creatorName.split(" ").map((p) => p[0]).join("")} size="md" customer />
                <div className="min-w-0">
                  <p className="truncate font-medium">{ticket.creatorName}</p>
                  <p className="truncate text-[13px] text-muted-foreground">{ticket.creatorEmail}</p>
                </div>
              </div>
              <Link
                href="/admin/users"
                className="inline-block text-[13px] font-medium text-primary hover:underline underline-offset-4"
              >
                View all users
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
