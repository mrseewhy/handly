"use client";

import Link from "next/link";
import { ChevronRight, MailCheck } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, FieldHint, FieldError } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { rules, useFormFields } from "@/lib/use-form-fields";
import { useState } from "react";
import { requestPasswordResetAction } from "@/lib/data/actions/auth";

const formRules = { email: rules.email() };

export function ForgotPasswordForm() {
  const { toast } = useToast();
  const { values, errors, setValue, touchAll, isValid, reset } = useFormFields({
    rules: formRules,
  });
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    touchAll();
    if (!isValid || pending) return;

    setPending(true);
    const result = await requestPasswordResetAction({ email: values.email ?? "" });
    setPending(false);

    if (!result.ok) {
      toast({ tone: "error", title: "Could not send reset link", description: result.error });
      return;
    }

    setSent(true);
    toast({
      tone: "info",
      title: "Check your inbox",
      description: "If that email is registered, a reset link is on its way.",
    });
  }

  function handleEdit() {
    setSent(false);
    reset();
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4 md:px-6">
        <Logo />
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
                <div className="flex items-start gap-3 rounded-md bg-success-subtle p-4 text-[13px] text-success">
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
                      value={values.email ?? ""}
                      onChange={(e) => setValue("email", e.target.value)}
                      disabled={pending}
                      aria-invalid={errors.email ? true : undefined}
                      aria-describedby={errors.email ? "reset-email-error" : undefined}
                    />
                    <FieldHint>
                      The reset link expires after 30 minutes. Check your spam folder if it does not
                      arrive.
                    </FieldHint>
                    {errors.email && (
                      <FieldError id="reset-email-error" className="mt-1">
                        {errors.email}
                      </FieldError>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={pending}>
                    {pending ? "Sending…" : "Send reset link"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {sent ? (
              <button
                type="button"
                onClick={handleEdit}
                className="font-medium text-primary hover:underline underline-offset-4"
              >
                Use a different email
              </button>
            ) : (
              <>
                Remembered it after all?{" "}
                <Link href="/sign-in" className="font-medium text-primary hover:underline underline-offset-4">
                  Back to sign in
                </Link>
              </>
            )}
          </p>
        </div>
      </main>
    </div>
  );
}
