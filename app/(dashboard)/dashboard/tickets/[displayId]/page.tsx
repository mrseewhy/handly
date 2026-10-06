import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Send } from "lucide-react";
import { getRepliesForTicket, getTicketByDisplayId } from "@/lib/mock-data";
import { formatDateTime, slaPercentUsed } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/ticket-config";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SlaMeter } from "@/components/ui/sla";
import { PriorityBadge, StatusBadge } from "@/components/tickets/status-badges";
import { TicketThread } from "@/components/tickets/ticket-thread";
import { Textarea } from "@/components/ui/input";

interface PageProps {
  params: Promise<{ displayId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { displayId } = await params;
  const ticket = getTicketByDisplayId(decodeURIComponent(displayId));
  return { title: ticket ? `${ticket.displayId} · Handly` : "Ticket not found · Handly" };
}

export default async function TicketDetailPage({ params }: PageProps) {
  const { displayId } = await params;
  const ticket = getTicketByDisplayId(decodeURIComponent(displayId));
  if (!ticket || ticket.creatorId !== "u-1") notFound();

  const replies = getRepliesForTicket(ticket.id);
  const isOpen = !["resolved", "closed"].includes(ticket.status);

  return (
    <div className="space-y-6">
      <PageHeader
        title={ticket.subject}
        backHref="/dashboard/tickets"
        backLabel="My tickets"
        actions={<StatusBadge status={ticket.status} className="h-fit px-3 py-1 text-[13px]" />}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        {/* Conversation + composer */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[13px] text-muted-foreground">{ticket.displayId}</span>
                <PriorityBadge priority={ticket.priority} />
              </div>
              <span className="text-[13px] text-muted-foreground">
                Opened {formatDateTime(ticket.createdAt)}
              </span>
            </CardHeader>
            <CardContent>
              <TicketThread replies={replies} />
            </CardContent>
          </Card>

          {isOpen ? (
            <Card>
              <CardContent className="space-y-3">
                <label htmlFor="reply" className="block text-sm font-medium">
                  Your reply
                </label>
                <Textarea
                  id="reply"
                  rows={4}
                  placeholder="Write your reply…"
                />
                <div className="flex items-center justify-between">
                  <p className="text-[13px] text-muted-foreground">
                    Replies are emailed to you and added to this thread.
                  </p>
                  <Button type="button">
                    <Send className="h-4 w-4" aria-hidden />
                    Send reply
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <p className="rounded-lg border border-border bg-surface-muted px-4 py-3 text-[13px] text-muted-foreground">
              This ticket is {ticket.status === "closed" ? "closed" : "resolved"}. Create a new
              ticket if you still need help.
            </p>
          )}
        </div>

        {/* Properties panel */}
        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <dl className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd><StatusBadge status={ticket.status} /></dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Priority</dt>
                  <dd><PriorityBadge priority={ticket.priority} /></dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="font-medium">{CATEGORY_LABELS[ticket.category]}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Assigned to</dt>
                  <dd className="flex items-center gap-2">
                    {ticket.assigneeName ? (
                      <>
                        <Avatar
                          initials={ticket.assigneeName.split(" ").map((p) => p[0]).join("")}
                          size="sm"
                        />
                        <span className="font-medium">{ticket.assigneeName}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Last update</dt>
                  <dd className="font-medium">{formatDateTime(ticket.updatedAt)}</dd>
                </div>
              </dl>
              <div className="border-t border-border pt-4">
                <SlaMeter
                  state={ticket.slaState}
                  deadline={ticket.slaDeadline}
                  percentUsed={slaPercentUsed(ticket.createdAt, ticket.slaDeadline)}
                />
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
