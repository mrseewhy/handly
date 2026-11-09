"use client";

import { CircleCheck } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea, FieldHint, FieldError } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { CATEGORY_LABELS, TICKET_CATEGORIES, priorityConfig, TICKET_PRIORITIES } from "@/lib/ticket-config";
import { rules, useFormFields } from "@/lib/use-form-fields";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTicket } from "@/lib/data/actions/tickets";
import { filesToUploadInput } from "@/lib/attachments-config";
import { AttachmentPicker } from "@/components/tickets/attachment-picker";
import type { TicketCategory, TicketPriority } from "@/lib/ticket-config";

const formRules = {
  subject: rules.minLength(5, "Enter a subject for your issue."),
  category: rules.choice("Choose a category."),
  description: rules.minLength(15, "Add a bit more detail so we can help faster."),
};

export function CreateTicketForm() {
  const { toast } = useToast();
  const { values, errors, setValue, touchAll, isValid } = useFormFields({
    rules: formRules,
    initial: { priority: "medium" },
  });
  const [pending, setPending] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    touchAll();
    if (!isValid || pending) return;

    setFormError(null);
    setPending(true);
    const result = await createTicket({
      subject: values.subject ?? "",
      description: values.description ?? "",
      category: (values.category ?? "other") as TicketCategory,
      priority: (values.priority ?? "medium") as TicketPriority,
      files: await filesToUploadInput(files),
    });
    setPending(false);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    setCreatedId(result.data.displayId);
    toast({
      tone: "success",
      title: `Ticket ${result.data.displayId} created`,
      description: "Our team has been notified and will reply here.",
    });
    router.refresh();
  }

  if (createdId) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-3 rounded-md border border-border bg-success-subtle p-4 text-sm text-foreground">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success/20 text-success">
              <CircleCheck className="h-3.5 w-3.5" aria-hidden />
            </span>
            <div>
              <p className="font-medium">Ticket created</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Your ticket is <span className="font-mono">{createdId}</span>. Our team will
                reply in this thread, and you can follow it from your queue.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t border-border">
          <ButtonLink href="/dashboard/tickets" variant="secondary" size="sm">
            Back to my tickets
          </ButtonLink>
          <ButtonLink href={`/dashboard/tickets/${createdId}`} size="sm">
            Open ticket
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
              value={values.subject ?? ""}
              onChange={(e) => setValue("subject", e.target.value)}
              aria-invalid={errors.subject ? true : undefined}
              aria-describedby={errors.subject ? "ticket-subject-error" : undefined}
            />
            {errors.subject && (
              <FieldError id="ticket-subject-error" className="mt-1">
                {errors.subject}
              </FieldError>
            )}
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
                value={values.category ?? ""}
                onChange={(e) => setValue("category", e.target.value)}
                aria-invalid={errors.category ? true : undefined}
                aria-describedby={errors.category ? "ticket-category-error" : undefined}
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
              {errors.category ? (
                <FieldError id="ticket-category-error" className="mt-1">
                  {errors.category}
                </FieldError>
              ) : (
                <FieldHint>Helps us route your ticket to the right team.</FieldHint>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ticket-priority">Priority</Label>
              <Select
                id="ticket-priority"
                name="priority"
                value={values.priority ?? "medium"}
                onChange={(e) => setValue("priority", e.target.value)}
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
              value={values.description ?? ""}
              onChange={(e) => setValue("description", e.target.value)}
              aria-invalid={errors.description ? true : undefined}
              aria-describedby={errors.description ? "ticket-description-error" : undefined}
            />
            {errors.description && (
              <FieldError id="ticket-description-error" className="mt-1">
                {errors.description}
              </FieldError>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-[13px] font-medium text-foreground">Attachments</p>
            <p className="text-[13px] text-muted-foreground">
              Screenshots, logs, or PDFs. Up to 10 MB each.
            </p>
            <AttachmentPicker files={files} onChange={setFiles} disabled={pending} />
          </div>

          <CardFooter className="justify-between border-t border-border pt-4">
            <p className="text-[13px] text-muted-foreground">
              We reply to most tickets within one business day.
            </p>
            <div className="flex items-center gap-2">
              <ButtonLink href="/dashboard/tickets" variant="ghost" size="md">
                Cancel
              </ButtonLink>
              <Button type="submit" disabled={pending}>
                {pending ? "Submitting…" : "Submit ticket"}
              </Button>
            </div>
            {formError && (
              <p role="alert" className="w-full text-right text-[13px] text-danger">
                {formError}
              </p>
            )}
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
