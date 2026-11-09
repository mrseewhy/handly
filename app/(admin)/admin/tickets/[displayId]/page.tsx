import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTicket, listTicketReplies } from "@/lib/data/dal/tickets";
import { listTicketAttachments } from "@/lib/data/dal/attachments";
import { AttachmentList } from "@/components/tickets/attachment-list";
import { listAdmins } from "@/lib/data/dal/people";
import { AdminReplyForm, TicketPropertiesForm } from "@/components/admin/ticket-controls";
import { formatDateTime, slaPercentUsed } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/ticket-config";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { SlaMeter } from "@/components/ui/sla";
import { PriorityBadge, StatusBadge } from "@/components/tickets/status-badges";
import { TicketThread } from "@/components/tickets/ticket-thread";
import { requireAdminPage } from "@/lib/data/dal/session";

interface PageProps {
  params: Promise<{ displayId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { displayId } = await params;
  const ticket = await getTicket(decodeURIComponent(displayId));
  return {
    title: ticket ? `${ticket.displayId} · Handly admin` : "Ticket not found · Handly admin",
  };
}

export default async function AdminTicketDetailPage({ params }: PageProps) {
  await requireAdminPage();
  const { displayId } = await params;
  const ticket = await getTicket(decodeURIComponent(displayId));
  if (!ticket) notFound();

  const [replies, admins, attachments] = await Promise.all([
    listTicketReplies(ticket.id),
    listAdmins(),
    listTicketAttachments(ticket.id),
  ]);
  const agents = admins.map((a) => ({ id: a.id, name: a.name }));

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
            <CardContent className="space-y-4">
              <TicketThread replies={replies} />
              <AttachmentList attachments={attachments} className="border-t border-border pt-4" />
            </CardContent>
          </Card>

          {/* Composer */}
          <Card>
            <CardContent>
              <AdminReplyForm displayId={ticket.displayId} creatorName={ticket.creatorName} />
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
              <TicketPropertiesForm
                displayId={ticket.displayId}
                status={ticket.status}
                priority={ticket.priority}
                assigneeId={ticket.assigneeId}
                agents={agents}
              />
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
