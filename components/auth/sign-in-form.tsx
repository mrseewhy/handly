"use client";

import Link from "next/link";
import { ChevronRight, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, FieldError } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { rules, useFormFields } from "@/lib/use-form-fields";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signInAction } from "@/lib/data/actions/auth";

const formRules = {
  email: rules.email(),
  password: rules.required("Enter your password."),
};

export function SignInForm({ next }: { next?: string | null }) {
  const { toast } = useToast();
  const { values, errors, setValue, touchAll, isValid } = useFormFields({
    rules: formRules,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const email = values.email ?? "";
  const password = values.password ?? "";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    touchAll();
    if (!isValid || pending) return;
    setFormError(null);

    startTransition(async () => {
      const result = await signInAction({ email, password });

      if (!result.ok) {
        setFormError(result.error);
        return;
      }

      toast({ tone: "success", title: "Signed in", description: "Welcome back." });
      // Honour `next` (set by proxy.ts when it bounced an anonymous visit),
      // otherwise land on the area that matches the role. Sending an admin to
      // /dashboard made them pass through the customer shell first.
      const fallback = result.role === "admin" ? "/admin" : "/dashboard";
      router.replace(next ?? fallback);
      router.refresh();
    });
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
          Sign in
        </Link>
      </nav>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sign in to your Handly workspace.
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setValue("email", e.target.value)}
                    aria-invalid={errors.email ? true : undefined}
                    aria-describedby={errors.email ? "signin-email-error" : undefined}
                  />
                  {errors.email && (
                    <FieldError id="signin-email-error" className="mt-1">
                      {errors.email}
                    </FieldError>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="text-[13px] font-medium text-primary hover:underline underline-offset-4"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setValue("password", e.target.value)}
                      aria-invalid={errors.password ? true : undefined}
                      aria-describedby={errors.password ? "signin-password-error" : undefined}
                      className={cn("pr-10")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-1.5 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <FieldError id="signin-password-error" className="mt-1">
                      {errors.password}
                    </FieldError>
                  )}
                </div>

                {formError && (
                  <p role="alert" className="rounded-md border border-danger/30 bg-danger-subtle px-3 py-2 text-[13px] text-danger">
                    {formError}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={pending}>
                  {pending ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to Handly?{" "}
            <Link href="/sign-up" className="font-medium text-primary hover:underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
