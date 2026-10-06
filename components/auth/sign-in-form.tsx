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
import { useState } from "react";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function SignInForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const emailTouched = email !== "";
  const emailValid = isValidEmail(email);
  const emailFieldInvalid = emailTouched && !emailValid;
  const canSubmit = emailValid && password.length >= 1;

  function handleEmailChange(value: string) {
    setEmail(value);
    if (emailError) setEmailError(null);
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    if (passwordError) setPasswordError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setEmailError(null);
    setPasswordError(null);

    if (!emailValid) {
      setEmailError("Enter a valid email address.");
      return;
    }
    if (password.length < 1) {
      setPasswordError("Enter your password.");
      return;
    }

    try {
      toast({
        tone: "info",
        title: "Sign in",
        description:
          "This demo does not connect to a backend yet. In production this would authenticate you and sign you in.",
      });
    } catch {
      toast({
        tone: "error",
        title: "Sign in failed",
        description:
          "We could not start the sign-in flow. Try again in a moment.",
      });
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
                    onChange={(e) => handleEmailChange(e.target.value)}
                    aria-invalid={emailFieldInvalid || undefined}
                    aria-describedby={emailFieldInvalid ? "signin-email-error" : undefined}
                    className={cn(emailFieldInvalid && "aria-[invalid=true]")}
                  />
                  {emailError ? (
                    <FieldError id="signin-email-error" className="mt-1">
                      {emailError}
                    </FieldError>
                  ) : emailTouched && email && !emailValid ? (
                    <FieldError className="mt-1">
                      Enter a valid email address.
                    </FieldError>
                  ) : null}
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
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      aria-invalid={passwordError ? true : undefined}
                      aria-describedby={passwordError ? "signin-password-error" : undefined}
                      className={cn("pr-10", passwordError && "aria-[invalid=true]")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2.5 top-1/2 h-6 w-6 -translate-y-1/2 rounded text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden />
                      )}
                    </button>
                  </div>
                  {passwordError ? (
                    <FieldError id="signin-password-error" className="mt-1">
                      {passwordError}
                    </FieldError>
                  ) : null}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!canSubmit}
                  aria-disabled={!canSubmit || undefined}
                >
                  Sign in
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
