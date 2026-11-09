"use client";

import { Clock, Mail, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Input,
  Label,
  Select,
  Textarea,
  FieldHint,
  FieldError,
} from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { rules, useFormFields } from "@/lib/use-form-fields";
import { useState } from "react";
import { submitContactMessage } from "@/lib/data/actions/contact";

const channels = [
  {
    icon: Mail,
    title: "Email us",
    detail: "hello@handly.app",
    note: "We reply within one business day.",
  },
  {
    icon: MessageCircle,
    title: "Sales questions",
    detail: "sales@handly.app",
    note: "Plans, invoicing, and migrations.",
  },
  {
    icon: Clock,
    title: "Support hours",
    detail: "Mon–Fri, 08:00–18:00 UTC",
    note: "Enterprise plans include 24/7.",
  },
  {
    icon: MapPin,
    title: "Office",
    detail: "Lisbon, Portugal",
    note: "Fully remote team, four time zones.",
  },
];

const TOPICS = [
  { value: "sales", label: "Sales and pricing" },
  { value: "support", label: "Product support" },
  { value: "migration", label: "Migration help" },
  { value: "other", label: "Something else" },
];

const formRules = {
  name: rules.minLength(2, "Enter your name."),
  email: rules.email(),
  topic: rules.choice("Choose a topic."),
  message: rules.minLength(10, "Write at least a short message."),
};

export function ContactForm() {
  const { toast } = useToast();
  const { values, errors, setValue, touchAll, isValid } = useFormFields({
    rules: formRules,
  });
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    touchAll();
    if (!isValid || pending) return;

    setFormError(null);
    setPending(true);
    const result = await submitContactMessage({
      name: values.name ?? "",
      email: values.email ?? "",
      topic: values.topic ?? "other",
      message: values.message ?? "",
    });
    setPending(false);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    setSent(true);
    toast({
      tone: "success",
      title: "Message received",
      description: "Your message is with the Handly team.",
    });
  }

  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:px-6 lg:grid-cols-[1fr_1.2fr] lg:px-8">
        <div className="space-y-4">
          {channels.map((c) => (
            <Card key={c.title} className="p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-primary">
                  <c.icon className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-medium">{c.title}</p>
                  <p className="mt-0.5 text-sm text-foreground">{c.detail}</p>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">{c.note}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="h-fit">
          <CardContent className="space-y-4 p-6">
            <div>
              <h2 className="text-lg font-semibold">
                {sent ? "Thanks — we will be in touch" : "Send a message"}
              </h2>
            </div>

            {sent ? (
              <div className="rounded-md border border-border bg-success-subtle p-4 text-sm text-foreground">
                <p className="flex items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success/20 text-success">
                    <Mail className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  We received your message and will reply within one business day. It has been
                  saved to our support inbox.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-name">Name</Label>
                    <Input
                      id="contact-name"
                      name="name"
                      placeholder="Your name"
                      value={values.name ?? ""}
                      onChange={(e) => setValue("name", e.target.value)}
                      aria-invalid={errors.name ? true : undefined}
                      aria-describedby={errors.name ? "contact-name-error" : undefined}
                    />
                    {errors.name && (
                      <FieldError id="contact-name-error" className="mt-1">
                        {errors.name}
                      </FieldError>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-email">Work email</Label>
                    <Input
                      id="contact-email"
                      name="email"
                      type="email"
                      inputMode="email"
                      placeholder="you@company.com"
                      value={values.email ?? ""}
                      onChange={(e) => setValue("email", e.target.value)}
                      aria-invalid={errors.email ? true : undefined}
                      aria-describedby={errors.email ? "contact-email-error" : undefined}
                    />
                    {errors.email && (
                      <FieldError id="contact-email-error" className="mt-1">
                        {errors.email}
                      </FieldError>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contact-topic">Topic</Label>
                  <Select
                    id="contact-topic"
                    name="topic"
                    value={values.topic ?? ""}
                    onChange={(e) => setValue("topic", e.target.value)}
                    aria-invalid={errors.topic ? true : undefined}
                    aria-describedby={errors.topic ? "contact-topic-error" : undefined}
                  >
                    <option value="" disabled>
                      Choose a topic…
                    </option>
                    {TOPICS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  {errors.topic && (
                    <FieldError id="contact-topic-error" className="mt-1">
                      {errors.topic}
                    </FieldError>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea
                    id="contact-message"
                    name="message"
                    rows={6}
                    placeholder="How can we help?"
                    value={values.message ?? ""}
                    onChange={(e) => setValue("message", e.target.value)}
                    aria-invalid={errors.message ? true : undefined}
                    aria-describedby={errors.message ? "contact-message-error" : undefined}
                  />
                  <FieldHint>The more context you share, the better our first reply.</FieldHint>
                  {errors.message && (
                    <FieldError id="contact-message-error" className="mt-1">
                      {errors.message}
                    </FieldError>
                  )}
                </div>

                {formError && (
                  <p role="alert" className="text-[13px] text-danger">
                    {formError}
                  </p>
                )}

                <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
                  {pending ? "Sending…" : "Send message"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
