"use client";

import { KeyRound } from "lucide-react";
import { currentUser } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, Badge } from "@/components/ui/avatar";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { useState } from "react";

const notificationPrefs = [
  { id: "replies", label: "Replies to my tickets", detail: "Email me when the team replies.", enabled: true },
  { id: "status", label: "Status changes", detail: "Email me when a ticket is resolved or closed.", enabled: true },
  { id: "digest", label: "Daily digest", detail: "One summary email each morning at 09:00.", enabled: false },
];

export function SettingsForm() {
  const { toast } = useToast();
  const [fullName, setFullName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [timezone, setTimezone] = useState("Europe/Lisbon (UTC+01:00)");
  const [notifications, setNotifications] = useState<Record<string, boolean>>(
    Object.fromEntries(notificationPrefs.map((p) => [p.id, p.enabled])),
  );
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  const fullNameTouched = fullName !== currentUser.name;
  const emailTouched = email !== currentUser.email;

  const fullNameValid = fullName.trim().length >= 2;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const nameFieldInvalid = fullNameTouched && !fullNameValid;
  const emailFieldInvalid = emailTouched && !emailValid;

  const canSave = fullNameValid && emailValid && !pending;

  function handleFullNameChange(value: string) {
    setFullName(value);
    if (nameError) setNameError(null);
  }
  function handleEmailChange(value: string) {
    setEmail(value);
    if (emailError) setEmailError(null);
  }
  function toggleNotification(id: string) {
    setNotifications((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave) return;

    setNameError(null);
    setEmailError(null);

    if (!fullNameValid) {
      setNameError("Enter your full name.");
      return;
    }
    if (!emailValid) {
      setEmailError("Enter a valid email address.");
      return;
    }

    setPending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      setSaved(true);
      toast({
        tone: "success",
        title: "Settings saved",
        description:
          "This demo does not connect to a backend yet. In production your profile and notification choices would be saved.",
      });
    } catch {
      toast({
        tone: "error",
        title: "Settings could not be saved",
        description:
          "We could not save your changes. Try again in a moment.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Profile & settings"
        description="Manage how you appear to the support team and how we contact you."
      />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-4">
          <Avatar initials={currentUser.initials} size="lg" customer />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-lg font-semibold">{currentUser.name}</p>
              <Badge className="bg-surface-muted text-muted-foreground">Customer</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {currentUser.email} · Member since {formatDate(currentUser.joinedAt)}
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
                  value={fullName}
                  onChange={(e) => handleFullNameChange(e.target.value)}
                  aria-invalid={nameFieldInvalid || undefined}
                  aria-describedby={nameError ? "settings-name-error" : undefined}
                  className={nameFieldInvalid ? "aria-[invalid=true]" : undefined}
                />
                {nameError ? (
                  <FieldError id="settings-name-error" className="mt-1">
                    {nameError}
                  </FieldError>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="settings-email">Email address</Label>
                <Input
                  id="settings-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  aria-invalid={emailFieldInvalid || undefined}
                  aria-describedby={emailError ? "settings-email-error" : undefined}
                  className={emailFieldInvalid ? "aria-[invalid=true]" : undefined}
                />
                {emailError ? (
                  <FieldError id="settings-email-error" className="mt-1">
                    {emailError}
                  </FieldError>
                ) : null}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settings-timezone">Timezone</Label>
              <Input
                id="settings-timezone"
                name="timezone"
                defaultValue="Europe/Lisbon (UTC+01:00)"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              />
              <p className="text-[13px] text-muted-foreground">
                Used for timestamps and the daily digest.
              </p>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={!canSave} aria-disabled={!canSave || undefined}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Email notifications</CardTitle>
          <CardDescription>Choose which emails we send you.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {notificationPrefs.map((pref) => {
              const enabled = notifications[pref.id] ?? pref.enabled;
              return (
                <li
                  key={pref.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">{pref.label}</p>
                    <p className="text-[13px] text-muted-foreground">{pref.detail}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleNotification(pref.id)}
                    aria-pressed={enabled}
                    aria-label={`Toggle ${pref.label}`}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
                      enabled ? "bg-primary" : "bg-border-strong",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                        enabled ? "translate-x-[18px]" : "translate-x-0.5",
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Use at least 12 characters with a mix of types.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="settings-current">Current password</Label>
              <Input id="settings-current" type="password" placeholder="••••••••••••" readOnly />
              <p className="text-[13px] text-muted-foreground">
                Password changes are not available in this demo yet.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settings-new">New password</Label>
              <Input id="settings-new" type="password" placeholder="••••••••••••" readOnly />
              <p className="text-[13px] text-muted-foreground">
                Password changes are not available in this demo yet.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" size="sm" disabled>
              <KeyRound className="h-4 w-4" aria-hidden />
              Update password
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-danger/40">
          <CardHeader>
            <CardTitle className="text-danger">Danger zone</CardTitle>
            <CardDescription>
              Deleting your account removes your tickets and data. This cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="danger" size="sm" disabled title="Account deletion is not available in this demo">
              Delete account
            </Button>
          </CardFooter>
        </Card>
      </div>

      {saved && (
        <p className="text-[13px] text-muted-foreground" role="status">
          Your changes were saved locally. Backend sync is pending.
        </p>
      )}
    </div>
  );
}
