import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/settings/settings-form";
import { getActor } from "@/lib/data/dal/session";

export const metadata: Metadata = {
  title: "Profile & settings · Handly",
};

export default async function SettingsPage() {
  const actor = await getActor();
  if (!actor) redirect("/sign-in?next=/dashboard/settings");

  return <SettingsForm user={actor} />;
}
