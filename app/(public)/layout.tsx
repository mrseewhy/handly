import type { Metadata } from "next";
import { ComponentErrorBoundary } from "@/components/error-boundary";
import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";

export const metadata: Metadata = {
  title: "Handly",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <ComponentErrorBoundary>{children}</ComponentErrorBoundary>
      </main>
      <SiteFooter />
    </div>
  );
}
