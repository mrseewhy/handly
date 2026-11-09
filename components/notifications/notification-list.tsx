"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Bell, CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import type { AppNotification } from "@/lib/view-types";
import { markNotificationRead } from "@/lib/data/actions/tickets";
import { formatRelativeTime } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

const toneIcon = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
} as const;

const toneColor = {
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
} as const;

/**
 * Notification list.
 *
 * Clicking an item marks it read as part of the navigation, so the unread badge
 * clears itself. Without this, "New" markers never went away and the sidebar
 * count only ever grew.
 */
export function NotificationList({ items }: { items: AppNotification[] }) {
  const [, startTransition] = useTransition();

  function markRead(id: string, read: boolean) {
    if (read) return;
    startTransition(async () => {
      await markNotificationRead(id);
    });
  }

  if (items.length === 0) {
    return (
      <Card>
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No notifications yet</p>
          <p className="text-sm text-muted-foreground">
            Replies and updates about your tickets will appear here.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-0">
      <ul className="divide-y divide-border">
        {items.map((n) => {
          const Icon = toneIcon[n.tone];
          return (
            <li key={n.id}>
              <Link
                href={n.href}
                onClick={() => markRead(n.id, n.read)}
                className={cn(
                  "flex gap-3 px-4 py-3 transition-colors hover:bg-surface-muted",
                  !n.read && "bg-primary-subtle/40",
                )}
              >
                <Icon
                  className={cn("mt-0.5 h-4 w-4 shrink-0", toneColor[n.tone])}
                  aria-hidden
                />
                <span className="min-w-0">
                  <p className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {n.title}
                    </span>
                    {!n.read && (
                      <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-white">
                        New
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 truncate text-[13px] leading-snug text-muted-foreground">
                    {n.body}
                  </p>
                  <time
                    dateTime={n.at}
                    className="mt-1 block text-[11px] text-subtle-foreground"
                  >
                    {formatRelativeTime(n.at)}
                  </time>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
