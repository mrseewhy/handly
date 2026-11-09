import type { Metadata } from "next";
import { listNotifications } from "@/lib/data/dal/people";
import { MarkAllReadButton } from "@/components/layout/mark-all-read";
import { NotificationList } from "@/components/notifications/notification-list";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdminPage } from "@/lib/data/dal/session";

export const metadata: Metadata = {
  title: "Notifications · Handly admin",
};

export default async function AdminNotificationsPage() {
  await requireAdminPage();
  const notifications = await listNotifications(50);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={
          unread > 0
            ? `${unread} unread notification${unread === 1 ? "" : "s"}`
            : "You are all caught up."
        }
        actions={unread > 0 ? <MarkAllReadButton /> : undefined}
      />
      <NotificationList items={notifications} />
    </div>
  );
}
