import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { PageHeader, EmptyState } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Users as UsersIcon } from "lucide-react";
import { listCustomers } from "@/lib/data/dal/people";
import type { Person } from "@/lib/view-types";
import { formatDate, formatRelativeTime } from "@/lib/format";
import { UserActions } from "@/components/admin/user-actions";
import { PromoteUserButton } from "@/components/admin/promote-user-button";
import { cn } from "@/lib/cn";
import { requireAdminPage } from "@/lib/data/dal/session";

const userStatusBadge: Record<string, string> = {
  active: "text-success bg-success-subtle",
  invited: "text-warning bg-warning-subtle",
  suspended: "text-danger bg-danger-subtle",
};

export const metadata = {
  title: "Users · Handly admin",
};

export default async function ManageUsersPage() {
  await requireAdminPage();
  const adminUsers = await listCustomers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Everyone who has contacted support through this workspace."
      />

      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Users" },
        ]}
      />

      
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <caption className="sr-only">Customer accounts</caption>
          <thead>
            <tr className="bg-surface-muted text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="px-4 py-2.5">User</th>
              <th scope="col" className="hidden px-4 py-2.5 md:table-cell">Joined</th>
              <th scope="col" className="hidden px-4 py-2.5 md:table-cell">Tickets</th>
              <th scope="col" className="px-4 py-2.5">Status</th>
              <th scope="col" className="hidden px-4 py-2.5 lg:table-cell">Last seen</th>
              <th scope="col" className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {adminUsers.map((u) => (
              <UserRow key={u.id} user={u} />
            ))}
          </tbody>
        </table>
      </Card>

      {adminUsers.length === 0 ? (
        <Card>
          <EmptyState
            icon={UsersIcon}
            title="No users yet"
            description="Customer accounts will appear here once they contact support."
          />
        </Card>
      ) : null}

      <p className="text-[13px] text-subtle-foreground" aria-live="polite">
        Showing {adminUsers.length} user{adminUsers.length === 1 ? "" : "s"}
      </p>
    </div>
  );
}

function UserRow({ user }: { user: Person }) {
  return (
    <tr className="border-t border-border hover:bg-surface-muted">
      <td className="px-4 py-3">
        <span className="flex items-center gap-3">
          <Avatar initials={user.initials} size="md" customer />
          <span>
            <span className="block font-medium">{user.name}</span>
            <span className="block text-[13px] text-muted-foreground">{user.email}</span>
          </span>
        </span>
      </td>
      <td className="hidden px-4 py-3 text-[13px] text-muted-foreground md:table-cell">
        {formatDate(user.joinedAt)}
      </td>
      <td className="hidden px-4 py-3 font-mono text-[13px] tabular-nums text-muted-foreground md:table-cell">
        {user.ticketCount}
      </td>
      <td className="px-4 py-3">
        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize", userStatusBadge[user.status])}>
          {user.status}
        </span>
      </td>
      <td className="hidden px-4 py-3 text-[13px] text-muted-foreground lg:table-cell">
        {user.lastSeenAt ? formatRelativeTime(user.lastSeenAt) : "—"}
      </td>
      <td className="px-4 py-3">
        <span className="flex items-center justify-end gap-1">
          {user.status === "active" && <PromoteUserButton user={user} />}
          <UserActions user={user} />
        </span>
      </td>
    </tr>
  );
}
