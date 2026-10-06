"use client";

import { Info } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea, FieldHint, FieldError } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { CATEGORY_LABELS, TICKET_CATEGORIES, priorityConfig, TICKET_PRIORITIES } from "@/lib/ticket-config";
import { useState } from "react";

export function CreateTicketForm() {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<string>("medium");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const subjectTouched = subject !== "";
  const descriptionTouched = description !== "";

  const subjectValid = subject.trim().length >= 5;
  const descriptionValid = description.trim().length >= 15;

  const subjectError = errors.subject ?? (subjectTouched && !subjectValid ? "Enter a subject for your issue." : null);
  const descriptionError = errors.description ?? (descriptionTouched && !descriptionValid ? "Add a bit more detail so we can help faster." : null);

  const canSubmit = subjectValid && descriptionValid && !pending;

  function handleSubjectChange(value: string) {
    setSubject(value);
    if (errors.subject) setErrors((prev: Record<string, string | null>) => ({ ...prev, subject: null }));
  }
  function handleCategoryChange(value: string) {
    setCategory(value);
    if (errors.category) setErrors((prev: Record<string, string | null>) => ({ ...prev, category: null }));
  }
  function handlePriorityChange(value: string) {
    setPriority(value);
    if (errors.priority) setErrors((prev: Record<string, string | null>) => ({ ...prev, priority: null }));
  }
  function handleDescriptionChange(value: string) {
    setDescription(value);
    if (errors.description) setErrors((prev: Record<string, string | null>) => ({ ...prev, description: null }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setErrors({});

    if (!subjectValid) {
      setErrors((prev: Record<string, string | null>) => ({ ...prev, subject: "Enter a subject for your issue." }));
      return;
    }
    if (!descriptionValid) {
      setErrors((prev: Record<string, string | null>) => ({ ...prev, description: "Add a bit more detail so we can help faster." }));
      return;
    }

    setPending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      setSubmitted(true);
      toast({
        tone: "success",
        title: "Ticket created",
        description:
          "This demo does not connect to a backend yet. In production your ticket would be created and you would be returned to your queue.",
      });
    } catch {
      toast({
        tone: "error",
        title: "Could not create ticket",
        description:
          "We could not create your ticket. Try again in a moment.",
      });
    } finally {
      setPending(false);
    }
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-3 rounded-md border border-border bg-success-subtle p-4 text-sm text-foreground">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success/20 text-success">
              <Info className="h-3.5 w-3.5" aria-hidden />
            </span>
            <div>
              <p className="font-medium">Ticket draft saved locally</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                This demo does not connect to a backend yet, so the ticket was not actually created.
                Your draft is still here if you want to edit it before connecting the backend.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end border-t border-border">
          <ButtonLink href="/dashboard/tickets" variant="secondary" size="sm">
            Back to my tickets
          </ButtonLink>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket details</CardTitle>
        <CardDescription>
          We reply to every ticket by email and in this workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="ticket-subject">Subject</Label>
            <Input
              id="ticket-subject"
              name="subject"
              placeholder="Briefly describe the problem"
              value={subject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              aria-invalid={subjectError ? true : undefined}
              aria-describedby={subjectError ? "ticket-subject-error" : undefined}
              className={subjectError ? "aria-[invalid=true]" : undefined}
            />
            {subjectError ? (
              <FieldError id="ticket-subject-error" className="mt-1">
                {subjectError}
              </FieldError>
            ) : null}
            <FieldHint>
              One clear sentence works best, e.g. “Double charge on September invoice”.
            </FieldHint>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ticket-category">Category</Label>
              <Select
                id="ticket-category"
                name="category"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="" disabled>
                  Choose a category…
                </option>
                {TICKET_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </Select>
              <FieldHint>Helps us route your ticket to the right team.</FieldHint>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ticket-priority">Priority</Label>
              <Select
                id="ticket-priority"
                name="priority"
                value={priority}
                onChange={(e) => handlePriorityChange(e.target.value)}
              >
                {TICKET_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {priorityConfig[p].label}
                  </option>
                ))}
              </Select>
              <FieldHint>Urgent means you cannot work until it is fixed.</FieldHint>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ticket-description">Description</Label>
            <Textarea
              id="ticket-description"
              name="description"
              rows={7}
              placeholder="What did you expect, and what happened instead? Include steps, request IDs, or screenshots if you have them."
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              aria-invalid={descriptionError ? true : undefined}
              aria-describedby={descriptionError ? "ticket-description-error" : undefined}
              className={descriptionError ? "aria-[invalid=true]" : undefined}
            />
            {descriptionError ? (
              <FieldError id="ticket-description-error" className="mt-1">
                {descriptionError}
              </FieldError>
            ) : null}
          </div>

          <div className="rounded-md border border-border bg-surface-muted p-3">
            <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <Info className="h-4 w-4 shrink-0 text-info" aria-hidden />
              Attachments can be added to the conversation after the ticket is created.
            </p>
          </div>

          <CardFooter className="justify-between border-t border-border pt-4">
            <p className="text-[13px] text-muted-foreground">
              Median first response today:{" "}
              <span className="font-medium text-foreground">48 min</span>
            </p>
            <div className="flex items-center gap-2">
              <ButtonLink href="/dashboard/tickets" variant="ghost" size="md">
                Cancel
              </ButtonLink>
              <Button type="submit" disabled={!canSubmit} aria-disabled={!canSubmit || undefined}>
                {pending ? "Submitting…" : "Submit ticket"}
              </Button>
            </div>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
