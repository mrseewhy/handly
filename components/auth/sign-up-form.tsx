"use client";

import Link from "next/link";
import { ChevronRight, Eye, EyeOff, Check } from "lucide-react";
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

export function SignUpForm() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const nameTouched = name !== "";
  const emailTouched = email !== "";
  const passwordTouched = password !== "";

  const nameValid = name.trim().length >= 2;
  const emailValid = isValidEmail(email);
  const passwordValid = password.length >= 12;

  const nameFieldInvalid = nameTouched && !nameValid;
  const emailFieldInvalid = emailTouched && !emailValid;
  const passwordFieldInvalid = passwordTouched && !passwordValid;

  const canSubmit = nameValid && emailValid && passwordValid;

  function handleNameChange(value: string) {
    setName(value);
    if (nameError) setNameError(null);
  }
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

    setNameError(null);
    setEmailError(null);
    setPasswordError(null);

    if (!nameValid) {
      setNameError("Enter your full name.");
      return;
    }
    if (!emailValid) {
      setEmailError("Enter a valid work email address.");
      return;
    }
    if (!passwordValid) {
      setPasswordError("Use at least 12 characters.");
      return;
    }

    try {
      toast({
        tone: "success",
        title: "Account created",
        description:
          "This demo does not connect to a backend yet. In production you would be signed in automatically.",
      });
    } catch {
      toast({
        tone: "error",
        title: "Account creation failed",
        description:
          "We could not create your account. Try again in a moment.",
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
          Create account
        </Link>
      </nav>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">Create your account</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Start your 14-day free trial. No credit card needed.
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-name">Full name</Label>
                  <Input
                    id="signup-name"
                    name="name"
                    autoComplete="name"
                    placeholder="Alex Rivera"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    aria-invalid={nameFieldInvalid || undefined}
                    aria-describedby={nameError || (nameTouched && !nameValid) ? "signup-name-error" : undefined}
                    className={cn(nameFieldInvalid && "aria-[invalid=true]")}
                  />
                  {nameError ? (
                    <FieldError id="signup-name-error" className="mt-1">
                      {nameError}
                    </FieldError>
                  ) : nameTouched && !nameValid ? (
                    <FieldError id="signup-name-error" className="mt-1">
                      Enter your full name.
                    </FieldError>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-email">Work email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    aria-invalid={emailFieldInvalid || undefined}
                    aria-describedby={emailError || (emailTouched && !emailValid) ? "signup-email-error" : undefined}
                    className={cn(emailFieldInvalid && "aria-[invalid=true]")}
                  />
                  {emailError ? (
                    <FieldError id="signup-email-error" className="mt-1">
                      {emailError}
                    </FieldError>
                  ) : emailTouched && !emailValid ? (
                    <FieldError id="signup-email-error" className="mt-1">
                      Enter a valid work email address.
                    </FieldError>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="At least 12 characters"
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      aria-invalid={passwordFieldInvalid || undefined}
                      aria-describedby={passwordError || (passwordTouched && !passwordValid) ? "signup-password-error" : undefined}
                      className={cn(
                        "pr-10",
                        passwordFieldInvalid && "aria-[invalid=true]",
                      )}
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
                  <FieldHint>Use 12+ characters with a mix of letters, numbers, and symbols.</FieldHint>
                  {passwordError ? (
                    <FieldError id="signup-password-error" className="mt-1">
                      {passwordError}
                    </FieldError>
                  ) : passwordTouched && !passwordValid ? (
                    <FieldError id="signup-password-error" className="mt-1">
                      Use at least 12 characters.
                    </FieldError>
                  ) : null}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!canSubmit}
                  aria-disabled={!canSubmit || undefined}
                >
                  Create account
                </Button>

                <ul className="space-y-1.5 text-[13px] text-muted-foreground">
                  {[
                    "Unlimited customers on every plan",
                    "Cancel any time, keep your exports",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </form>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-primary hover:underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
