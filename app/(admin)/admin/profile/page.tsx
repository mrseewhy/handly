import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/settings/settings-form";
import { getActor } from "@/lib/data/dal/session";

export const metadata: Metadata = {
  title: "Profile & settings · Handly admin",
};

export default async function AdminProfilePage() {
  const actor = await getActor();
  if (!actor) redirect("/sign-in?next=/admin/profile");

  // Same component as the customer page: name, password and account deletion
  // are role-independent. Only the surrounding copy differs.
  return <SettingsForm user={actor} />;
}
