"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatRelativeTime } from "@/lib/format";
import { adminNotifications, userNotifications, type AppNotification } from "@/lib/mock-data";

function remapUserHref(href: string): string {
  if (href.startsWith("/tickets/")) {
    return `/dashboard/tickets/${href.slice("/tickets/".length)}`;
  }
  return href;
}

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

function NotificationList({ items, role }: { items: AppNotification[]; role: "user" | "admin" }) {
  if (items.length === 0) {
    return <p className="px-3 py-6 text-center text-sm text-muted-foreground">You are all caught up.</p>;
  }
  return (
    <ul className="divide-y divide-border">
      {items.map((n) => {
        const Icon = toneIcon[n.tone];
        return (
          <li key={n.id}>
            <Link href={role === "user" ? remapUserHref(n.href) : n.href} className="flex gap-3 px-3 py-3 hover:bg-surface-muted">
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", toneColor[n.tone])} aria-hidden />
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-foreground">{n.title}</span>
                  {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                </span>
                <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">{n.body}</span>
                <time dateTime={n.at} className="mt-1 block text-[11px] text-subtle-foreground">
                  {formatRelativeTime(n.at)}
                </time>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function NotificationsButton({
  role,
  className,
}: {
  role: "user" | "admin";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const items = role === "admin" ? adminNotifications : userNotifications;
  const unread = items.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
      >
        <Bell className="h-4 w-4" aria-hidden />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 font-mono text-[10px] font-medium tabular-nums text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-md"
        >
          <p className="border-b border-border px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Notifications
          </p>
          <div className="max-h-96 overflow-y-auto">
            <NotificationList items={items} role={role} />
          </div>
        </div>
      )}
    </div>
  );
}
