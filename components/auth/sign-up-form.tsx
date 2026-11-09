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
import { rules, useFormFields } from "@/lib/use-form-fields";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signUpAction } from "@/lib/data/actions/auth";

const formRules = {
  name: rules.minLength(2, "Enter your full name."),
  email: rules.email("Enter a valid work email address."),
  password: rules.minLength(12, "Use at least 12 characters."),
};

const perks = ["Unlimited customers on every plan", "Cancel any time, keep your exports"];

export function SignUpForm() {
  const { toast } = useToast();
  const { values, errors, setValue, touchAll, isValid } = useFormFields({
    rules: formRules,
  });
  const [showPassword, setShowPassword] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    touchAll();
    if (!isValid || pending) return;
    setFormError(null);

    startTransition(async () => {
      const result = await signUpAction({
        name: values.name ?? "",
        email: values.email ?? "",
        password: values.password ?? "",
      });

      if (!result.ok) {
        setFormError(result.error);
        return;
      }

      toast({
        tone: "success",
        title: "Account created",
        description: "You are signed in. Create your first ticket to get started.",
      });
      router.replace("/dashboard");
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
                    value={values.name ?? ""}
                    onChange={(e) => setValue("name", e.target.value)}
                    aria-invalid={errors.name ? true : undefined}
                    aria-describedby={errors.name ? "signup-name-error" : undefined}
                  />
                  {errors.name && (
                    <FieldError id="signup-name-error" className="mt-1">
                      {errors.name}
                    </FieldError>
                  )}
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
                    value={values.email ?? ""}
                    onChange={(e) => setValue("email", e.target.value)}
                    aria-invalid={errors.email ? true : undefined}
                    aria-describedby={errors.email ? "signup-email-error" : undefined}
                  />
                  {errors.email && (
                    <FieldError id="signup-email-error" className="mt-1">
                      {errors.email}
                    </FieldError>
                  )}
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
                      value={values.password ?? ""}
                      onChange={(e) => setValue("password", e.target.value)}
                      aria-invalid={errors.password ? true : undefined}
                      aria-describedby={errors.password ? "signup-password-error" : undefined}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className={cn(
                        "absolute right-1.5 top-1/2 inline-flex h-7 w-7 -translate-y-1/2",
                        "items-center justify-center rounded text-muted-foreground",
                        "hover:bg-surface-muted hover:text-foreground",
                      )}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden />
                      )}
                    </button>
                  </div>
                  <FieldHint>Use 12+ characters with a mix of letters, numbers, and symbols.</FieldHint>
                  {errors.password && (
                    <FieldError id="signup-password-error" className="mt-1">
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
                  {pending ? "Creating account…" : "Create account"}
                </Button>

                <ul className="space-y-1.5 text-[13px] text-muted-foreground">
                  {perks.map((item) => (
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
