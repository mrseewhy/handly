import type { Metadata } from "next";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password · Handly",
};

/**
 * Landing page for the reset link.
 *
 * Better Auth's emailed URL is `/api/auth/reset-password/<token>?callbackURL=…`;
 * that endpoint validates the token and redirects here with `?token=`. We also
 * accept `?token=` directly so the link works if the callback is configured to
 * point straight at this page. `?error=INVALID_TOKEN` means the link expired.
 */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const params = await searchParams;
  const token = params.token?.trim() ?? "";
  const expired = params.error === "INVALID_TOKEN";

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4 md:px-6">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Choose a new password</h1>
            <p className="text-sm text-muted-foreground">
              Pick something at least 12 characters long.
            </p>
          </div>
          <ResetPasswordForm token={token} expired={expired} />
        </div>
      </main>
    </div>
  );
}
