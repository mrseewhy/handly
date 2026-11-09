"use client";

import { KeyRound } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, Badge } from "@/components/ui/avatar";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { rules, useFormFields } from "@/lib/use-form-fields";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { changePassword, deleteOwnAccount, updateProfile } from "@/lib/data/actions/profile";
import type { SessionUser } from "@/lib/view-types";

const formRules = {
  fullName: rules.minLength(2, "Enter your full name."),
};

export function SettingsForm({ user }: { user: SessionUser }) {
  const { toast } = useToast();
  const { values, errors, setValue, touchAll, isValid } = useFormFields({
    rules: formRules,
    initial: {
      fullName: user.name,
    },
  });
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    touchAll();
    if (!isValid || pending) return;

    setPending(true);
    const result = await updateProfile({ name: values.fullName ?? "" });
    setPending(false);

    if (!result.ok) {
      toast({ tone: "error", title: "Could not save", description: result.error });
      return;
    }

    setSaved(true);
    toast({
      tone: "success",
      title: "Profile updated",
      description: "Your display name was saved.",
    });
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Profile & settings"
        description="Manage how you appear to the support team and how we contact you."
      />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-4">
          <Avatar initials={user.initials} size="lg" customer />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-lg font-semibold">{user.name}</p>
              <Badge className="bg-surface-muted text-muted-foreground">Customer</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
          <ButtonLink href="/dashboard/tickets" variant="secondary" size="sm">
            My tickets
          </ButtonLink>
        </CardContent>
      </Card>

      <form onSubmit={handleSave} noValidate>
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your name and email are visible on every ticket you create.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="settings-fullname">Full name</Label>
                <Input
                  id="settings-fullname"
                  name="fullName"
                  value={values.fullName ?? ""}
                  onChange={(e) => setValue("fullName", e.target.value)}
                  aria-invalid={errors.fullName ? true : undefined}
                  aria-describedby={errors.fullName ? "settings-name-error" : undefined}
                />
                {errors.fullName && (
                  <FieldError id="settings-name-error" className="mt-1">
                    {errors.fullName}
                  </FieldError>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="settings-email">Email address</Label>
                <Input
                  id="settings-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  value={user.email}
                  readOnly
                  disabled
                />
                <p className="text-[13px] text-muted-foreground">
                  Contact support to change your sign-in email.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <div className="grid gap-6 md:grid-cols-2">
        <PasswordCard />
        <DangerCard />
      </div>

      {saved && (
        <p className="text-[13px] text-success" role="status">
          Profile saved.
        </p>
      )}
    </div>
  );
}

/** Change-password form. Verifies the current password server-side. */
function PasswordCard() {
  const { toast } = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await changePassword({
        currentPassword: current,
        newPassword: next,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCurrent("");
      setNext("");
      toast({
        tone: "success",
        title: "Password updated",
        description: "Other devices have been signed out.",
      });
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>Use at least 12 characters with a mix of types.</CardDescription>
      </CardHeader>
      <form onSubmit={submit}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="settings-current">Current password</Label>
            <Input
              id="settings-current"
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              disabled={pending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="settings-new">New password</Label>
            <Input
              id="settings-new"
              type="password"
              autoComplete="new-password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              disabled={pending}
            />
          </div>
          {error && (
            <p role="alert" className="text-[13px] text-danger">
              {error}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            disabled={pending || !current || !next}
          >
            <KeyRound className="h-4 w-4" aria-hidden />
            {pending ? "Updating…" : "Update password"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

/** Account deletion. Blocked while the user still owns tickets. */
function DangerCard() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await deleteOwnAccount({ password });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast({ tone: "success", title: "Account deleted" });
      router.replace("/");
      router.refresh();
    });
  }

  return (
    <Card className="border-danger/40">
      <CardHeader>
        <CardTitle className="text-danger">Danger zone</CardTitle>
        <CardDescription>
          Deleting your account removes your profile and sign-in. Tickets you own
          must be closed first.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button
          variant="danger"
          size="sm"
          onClick={() => setOpen((v) => !v)}
          disabled={pending}
        >
          {open ? "Cancel" : "Delete account"}
        </Button>
      </CardFooter>

      {open && (
        <form onSubmit={submit}>
          <CardContent className="space-y-3 border-t border-border pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="delete-password">Confirm your password</Label>
              <Input
                id="delete-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={pending}
              />
            </div>
            {error && (
              <p role="alert" className="text-[13px] text-danger">
                {error}
              </p>
            )}
            <Button type="submit" variant="danger" size="sm" disabled={pending || !password}>
              {pending ? "Deleting…" : "Permanently delete account"}
            </Button>
          </CardContent>
        </form>
      )}
    </Card>
  );
}
