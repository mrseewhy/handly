import type { Metadata } from "next";
import { ShieldCheck, UserPlus } from "lucide-react";
import { adminAdmins } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, Badge } from "@/components/ui/avatar";
import { AdminRowActions } from "@/components/admin/admin-row-actions";

export const metadata: Metadata = {
  title: "Admins · Handly admin",
};

const statusBadge: Record<string, string> = {
  active: "text-success bg-success-subtle",
  invited: "text-warning bg-warning-subtle",
  suspended: "text-danger bg-danger-subtle",
};

export default function ManageAdminsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admins"
        description="Teammates who can view queues, reply to customers, and manage settings."
      />

      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Admins" },
        ]}
      />

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <caption className="sr-only">Admin team members</caption>
            <thead>
              <tr className="bg-surface-muted text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="px-4 py-2.5">Name</th>
                <th scope="col" className="hidden px-4 py-2.5 md:table-cell">Role</th>
                <th scope="col" className="px-4 py-2.5">Status</th>
                <th scope="col" className="hidden px-4 py-2.5 lg:table-cell">Joined</th>
                <th scope="col" className="hidden px-4 py-2.5 lg:table-cell">Assigned</th>
                <th scope="col" className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminAdmins.map((admin) => (
                <tr key={admin.id} className="border-t border-border hover:bg-surface-muted">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-3">
                      <Avatar initials={admin.initials} size="md" online={admin.status === "active"} />
                      <span>
                        <span className="block font-medium">{admin.name}</span>
                        <span className="block text-[13px] text-muted-foreground">{admin.email}</span>
                      </span>
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span className="text-[13px]">{admin.title ?? "Support"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={statusBadge[admin.status]}>
                      {admin.status === "invited" ? "Invite pending" : admin.status}
                    </Badge>
                  </td>
                  <td className="hidden px-4 py-3 text-[13px] text-muted-foreground lg:table-cell">
                    {admin.joinedAt && formatDate(admin.joinedAt)}
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-[13px] tabular-nums text-muted-foreground lg:table-cell">
                    {admin.ticketCount}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex justify-end gap-1">
                      <AdminRowActions admin={admin} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Invite panel */}
      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-primary">
              <UserPlus className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-medium">Invite a new admin</p>
              <p className="text-[13px] text-muted-foreground">
                Invited teammates receive an email with a setup link. Roles and permissions are configurable per admin.
              </p>
            </div>
          </div>
          <Button variant="secondary" size="md" className="shrink-0">
            Send invite
          </Button>
        </CardContent>
      </Card>

      <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-success" aria-hidden />
        Admin actions are recorded in the activity log.
      </p>
    </div>
  );
}
