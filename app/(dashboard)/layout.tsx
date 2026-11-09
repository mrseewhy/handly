import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getActor } from "@/lib/data/dal/session";
import { listNotifications } from "@/lib/data/dal/people";

/**
 * Customer area. Requires a session; admins are redirected to their own
 * dashboard so the two shells never mix.
 */
export default async function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const actor = await getActor();
  if (!actor) redirect("/sign-in?next=/dashboard");
  if (actor.role === "admin") redirect("/admin");

  const notifications = await listNotifications(8);

  return (
    <DashboardShell
      role="customer"
      user={actor}
      notifications={notifications}
      unansweredCount={0}
    >
      {children}
    </DashboardShell>
  );
}
