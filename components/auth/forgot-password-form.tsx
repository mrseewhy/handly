"use client";

import Link from "next/link";
import { ChevronRight, MailCheck } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, FieldHint, FieldError } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { useState } from "react";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function ForgotPasswordForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  const emailTouched = email !== "";
  const emailValid = isValidEmail(email);
  const emailFieldInvalid = emailTouched && !emailValid;
  const canSubmit = emailValid && !pending;

  function handleEmailChange(value: string) {
    setEmail(value);
    if (error) setError(null);
    if (sent) setSent(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setError(null);

    if (!emailValid) {
      setError("Enter a valid email address.");
      return;
    }

    setPending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      setSent(true);
      toast({
        tone: "info",
        title: "Reset link sent",
        description:
          "This demo does not connect to a backend yet. In production a real reset link would be on its way.",
      });
    } catch {
      toast({
        tone: "error",
        title: "Could not send reset link",
        description:
          "We could not start the reset flow. Try again in a moment.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-14 items-center justify-between px-4 md:px-6 border-b border-border bg-surface">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md font-semibold tracking-tight text-foreground"
        >
          <Logo />
        </Link>
        <ThemeToggle />
      </header>

      <nav aria-label="Back to home" className="px-4 md:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground hover:underline underline-offset-2"
        >
          Handly
          <ChevronRight className="h-3 w-3" aria-hidden />
          Forgot password
        </Link>
      </nav>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">Forgot password?</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {sent
                ? "Check your inbox for the reset link."
                : "Enter your email and we will send you a reset link."}
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              {sent ? (
                <div className="items-start gap-3 rounded-md bg-success-subtle p-4 text-[13px] text-success">
                  <MailCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span>
                    If an account exists for that email, a reset link is on its way. It expires in 30
                    minutes.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div className="space-y-1.5">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      disabled={pending}
                      aria-invalid={emailFieldInvalid || undefined}
                      aria-describedby={error || (emailTouched && !emailValid) ? "reset-email-error" : undefined}
                      className={cn(emailFieldInvalid && "aria-[invalid=true]")}
                    />
                    <FieldHint>
                      The reset link expires after 30 minutes. Check your spam folder if it does not
                      arrive.
                    </FieldHint>
                    {error ? (
                      <FieldError id="reset-email-error" className="mt-1">
                        {error}
                      </FieldError>
                    ) : emailTouched && !emailValid ? (
                      <FieldError id="reset-email-error" className="mt-1">
                        Enter a valid email address.
                      </FieldError>
                    ) : null}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!canSubmit}
                    aria-disabled={!canSubmit || undefined}
                  >
                    {pending ? "Sending…" : "Send reset link"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remembered it after all?{" "}
            <Link href="/sign-in" className="font-medium text-primary hover:underline underline-offset-4">
              Back to sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
