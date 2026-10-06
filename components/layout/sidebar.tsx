"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  Bell,
  LifeBuoy,
  LogOut,
  MessageSquareText,
  Settings,
  Ticket as TicketIcon,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { currentUser, currentAdmin, type Person } from "@/lib/mock-data";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/components/ui/logo";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  countTone?: "default" | "danger";
}

interface NavSection {
  title: string;
  items: NavItem[];
}

function useNavSections(role: "user" | "admin"): NavSection[] {
  const user: NavSection[] = [
    {
      title: "Support",
      items: [
        { href: "/dashboard/tickets", label: "My tickets", icon: TicketIcon },
        { href: "/dashboard/tickets/answered", label: "Answered", icon: MessageSquareText },
        { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
      ],
    },
    {
      title: "Account",
      items: [{ href: "/dashboard/settings", label: "Profile & settings", icon: Settings }],
    },
  ];

  const admin: NavSection[] = [
    {
      title: "Overview",
      items: [{ href: "/admin", label: "Dashboard", icon: BadgeCheck }],
    },
    {
      title: "Queues",
      items: [
        { href: "/admin/tickets/unanswered", label: "Unanswered", icon: MessageSquareText, count: 4, countTone: "danger" },
        { href: "/admin/tickets/answered", label: "Answered", icon: TicketIcon },
        { href: "/admin/tickets", label: "All tickets", icon: TicketIcon },
      ],
    },
    {
      title: "Manage",
      items: [
        { href: "/admin/admins", label: "Admins", icon: LifeBuoy },
        { href: "/admin/users", label: "Users", icon: Settings },
        { href: "/admin/activity", label: "Activity log", icon: MessageSquareText },
      ],
    },
  ];

  return role === "admin" ? admin : user;
}

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active =
    item.href === "/admin" || item.href === "/dashboard/tickets"
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + "/");

  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-9 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground",
        active && "bg-primary-subtle font-medium text-primary",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span className="truncate">{item.label}</span>
      {item.count !== undefined && (
        <span
          className={cn(
            "ml-auto rounded-full px-2 py-0.5 font-mono text-[11px] tabular-nums",
            item.countTone === "danger"
              ? "bg-danger-subtle text-danger"
              : "bg-surface-muted text-muted-foreground",
          )}
        >
          {item.count}
        </span>
      )}
    </Link>
  );
}

function SidebarNav({ role, onNavigate }: { role: "user" | "admin"; onNavigate?: () => void }) {
  const sections = useNavSections(role);
  return (
    <nav aria-label="Primary" className="flex-1 space-y-6 overflow-y-auto p-3">
      {sections.map((section) => (
        <div key={section.title}>
          <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wide text-subtle-foreground">
            {section.title}
          </p>
          <div className="space-y-0.5">
            {section.items.map((item) => (
              <NavLink key={item.href} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function UserCard({ person }: { person: Person }) {
  return (
    <div className="border-t border-border p-3">
      <div className="flex items-center gap-3 rounded-md px-1 py-1.5">
        <Avatar initials={person.initials} size="md" customer={person.role === "user"} online />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{person.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {person.role === "admin" ? person.title ?? "Support" : person.email}
          </p>
        </div>
        <button
          type="button"
          aria-label="Sign out"
          title="Sign out"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

export function DashboardSidebar({
  role,
  mobileOpen,
  onCloseMobile,
}: {
  role: "user" | "admin";
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const person = role === "admin" ? currentAdmin : currentUser;
  const homeHref = role === "admin" ? "/admin" : "/dashboard";

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex h-14 items-center border-b border-border px-4">
          <Logo href={homeHref} />
        </div>
        <SidebarNav role={role} />
        <UserCard person={person} />
      </aside>

      {/* Mobile slide-over */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" aria-modal="true" aria-label="Navigation">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={onCloseMobile}
            aria-hidden
          />
          <aside
            ref={(node) => {
              // Keep BackCompat behavior without a direct effect here.
              void node;
            }}
            className="fixed inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-surface shadow-lg"
          >
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <Logo href={homeHref} />
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close navigation"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-muted hover:text-foreground"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <SidebarNav role={role} onNavigate={onCloseMobile} />
            <UserCard person={person} />
          </aside>
        </div>
      )}
    </>
  );
}
