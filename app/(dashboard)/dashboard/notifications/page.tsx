import type { Metadata } from "next";
import { listNotifications } from "@/lib/data/dal/people";
import { MarkAllReadButton } from "@/components/layout/mark-all-read";
import { NotificationList } from "@/components/notifications/notification-list";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Notifications",
};

export default async function NotificationsPage() {
  const userNotifications = await listNotifications(50);
  const unread = userNotifications.filter((n) => !n.read).length;

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
      <NotificationList items={userNotifications} />
    </div>
  );
}
