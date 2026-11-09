"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, FieldError } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { rules, useFormFields } from "@/lib/use-form-fields";
import { resetPasswordAction } from "@/lib/data/actions/auth";

const formRules = {
  password: rules.minLength(12, "Use at least 12 characters."),
  confirm: rules.minLength(12, "Repeat your new password."),
};

export function ResetPasswordForm({
  token,
  expired = false,
}: {
  token: string;
  /** Set when Better Auth rejected the token before reaching this page. */
  expired?: boolean;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const { values, errors, setValue, touchAll, isValid } = useFormFields({
    rules: formRules,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    touchAll();
    if (!isValid || pending) return;

    const password = values.password ?? "";
    if (password !== (values.confirm ?? "")) {
      setFormError("Those passwords do not match.");
      return;
    }
    setFormError(null);

    startTransition(async () => {
      const result = await resetPasswordAction({ token, password });
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      setDone(true);
      toast({
        tone: "success",
        title: "Password updated",
        description: "Sign in with your new password.",
      });
      router.replace("/sign-in");
    });
  }

  if (!token || expired) {
    return (
      <Card>
        <CardContent className="space-y-3 p-6">
          <p className="font-medium">
            {expired ? "This reset link has expired." : "This reset link is missing its token."}
          </p>
          <p className="text-sm text-muted-foreground">
            Reset links are valid for one hour. Request a new one to continue.
          </p>
          <Button onClick={() => router.push("/forgot-password")}>
            Request a new link
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="reset-password">New password</Label>
            <Input
              id="reset-password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={values.password ?? ""}
              onChange={(e) => setValue("password", e.target.value)}
              aria-invalid={errors.password ? true : undefined}
            />
            {errors.password && <FieldError className="mt-1">{errors.password}</FieldError>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reset-confirm">Confirm new password</Label>
            <Input
              id="reset-confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              value={values.confirm ?? ""}
              onChange={(e) => setValue("confirm", e.target.value)}
              aria-invalid={errors.confirm ? true : undefined}
            />
            {errors.confirm && <FieldError className="mt-1">{errors.confirm}</FieldError>}
          </div>

          {formError && (
            <p role="alert" className="text-[13px] text-danger">
              {formError}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={pending || done}>
            <KeyRound className="h-4 w-4" aria-hidden />
            {pending ? "Updating…" : "Set new password"}
          </Button>
        </form>

        <p className="text-center text-[13px] text-muted-foreground">
          Remembered it?{" "}
          <Link href="/sign-in" className="font-medium text-primary hover:underline underline-offset-4">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
