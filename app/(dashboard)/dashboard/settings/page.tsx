import type { Metadata } from "next";
import { SettingsForm } from "@/components/settings/settings-form";

export const metadata: Metadata = {
  title: "Profile & settings · Handly",
};

export default function SettingsPage() {
  return <SettingsForm />;
}
