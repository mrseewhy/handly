"use client";

import { ComponentErrorBoundary } from "@/components/error-boundary";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState as useReactState } from "react";
import { Menu, Plus, Search } from "lucide-react";
import { DashboardSidebar } from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationsButton } from "@/components/layout/notifications";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { AppNotification, SessionUser } from "@/lib/view-types";
import type { PersonRole } from "@/lib/view-types";

/**
 * Client shell for the dashboard area: owns the mobile sidebar drawer state
 * and renders the topbar + main content next to the fixed sidebar.
 */
export function DashboardShell({
  role,
  user,
  notifications,
  unansweredCount,
  unhandledMessages = 0,
  children,
}: {
  role: PersonRole;
  user: SessionUser;
  notifications: AppNotification[];
  unansweredCount: number;
  unhandledMessages?: number;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileDrawerRef = useRef<HTMLDivElement | null>(null);
  const person = user;
  const router = useRouter();
  const [search, setSearch] = useReactState("");

  // The queue list pages own the actual filtering; the topbar just navigates
  // to them with `?q=` so there is one search implementation, not two.
  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = search.trim();
    const list = role === "admin" ? "/admin/tickets" : "/dashboard/tickets";
    router.push(q ? `${list}?q=${encodeURIComponent(q)}` : list);
  }

  useEffect(() => {
    if (!mobileOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }
    function onPointerDown(event: PointerEvent) {
      if (
        mobileDrawerRef.current &&
        !mobileDrawerRef.current.contains(event.target as Node)
      ) {
        setMobileOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (mobileOpen && mobileDrawerRef.current) {
      const focusable = mobileDrawerRef.current.querySelector<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
      );
      focusable?.focus();
    }
  }, [mobileOpen]);

  return (
    <div className="min-h-dvh bg-background">
      <DashboardSidebar
        role={role}
        user={user}
        unansweredCount={unansweredCount}
        unhandledMessages={unhandledMessages}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className={cn(
        "flex min-h-dvh flex-col lg:pl-60",
        mobileOpen && "overflow-hidden",
      )}>
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-surface px-4 md:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-muted hover:text-foreground lg:hidden"
          >
            <Menu className="h-4 w-4" aria-hidden />
          </button>

          <form
            onSubmit={submitSearch}
            role="search"
            className="relative hidden max-w-md flex-1 md:block"
          >
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets…"
              className="h-9 w-full rounded-md border border-border bg-surface-muted pl-9 pr-14 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Search tickets"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground hover:text-foreground"
              aria-label="Search"
            >
              ↵
            </button>
          </form>

          <div className="ml-auto flex items-center gap-2">
            {role === "customer" ? (
              <ButtonLink href="/dashboard/tickets/new" size="sm" className="hidden sm:inline-flex">
                <Plus className="h-4 w-4" aria-hidden />
                Create ticket
              </ButtonLink>
            ) : (
              <ButtonLink href="/admin/tickets" size="sm" className="hidden sm:inline-flex">
                All tickets
              </ButtonLink>
            )}
            <ThemeToggle />
            <NotificationsButton role={role} items={notifications} />
            <Link
              href={role === "admin" ? "/admin" : "/dashboard/settings"}
              aria-label="Open profile"
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Avatar initials={person.initials} size="md" customer={role === "customer"} />
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <ComponentErrorBoundary>
            <div className="mx-auto w-full max-w-6xl">
              <div className="animate-in fade-in-0 duration-200 ease-out">{children}</div>
            </div>
          </ComponentErrorBoundary>
        </main>
      </div>
    </div>
  );
}
