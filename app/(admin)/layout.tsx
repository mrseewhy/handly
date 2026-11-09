import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getActor } from "@/lib/data/dal/session";
import { getQueueCounts } from "@/lib/data/dal/tickets";
import { listNotifications } from "@/lib/data/dal/people";
import { getContactMessageCounts } from "@/lib/data/dal/messages";

export const metadata: Metadata = {
  title: "Admin · Handly",
};

/** Admin area. Customers are sent back to their own dashboard. */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // These layouts read the session and the database, so they can never be
  // prerendered. Without this, `next build` runs them and fails on missing env.
  await connection();

  const actor = await getActor();
  if (!actor) redirect("/sign-in?next=/admin");
  if (actor.role !== "admin") redirect("/dashboard");

  const [counts, notifications, messages] = await Promise.all([
    getQueueCounts(),
    listNotifications(8),
    getContactMessageCounts(),
  ]);

  return (
    <DashboardShell
      role="admin"
      user={actor}
      notifications={notifications}
      unansweredCount={counts.unanswered}
      unhandledMessages={messages.unhandled}
    >
      {children}
    </DashboardShell>
  );
}
