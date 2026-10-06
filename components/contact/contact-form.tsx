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
import { cn } from "@/lib/cn";
import { useState } from "react";

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

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function ContactForm() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  const nameTouched = name !== "";
  const emailTouched = email !== "";
  const messageTouched = message !== "";

  const nameValid = name.trim().length >= 2;
  const emailValid = isValidEmail(email);
  const topicValid = topic !== "";
  const messageValid = message.trim().length >= 10;

  const nameError =
    errors.name ?? (nameTouched && !nameValid ? "Enter your name." : null);
  const emailError =
    errors.email ??
    (emailTouched && !emailValid ? "Enter a valid email address." : null);
  const topicError = errors.topic ?? null;
  const messageError =
    errors.message ??
    (messageTouched && !messageValid ? "Write at least a short message." : null);

  const canSubmit = nameValid && emailValid && topicValid && messageValid && !pending;

  function handleNameChange(value: string) {
    setName(value);
    if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
  }
  function handleEmailChange(value: string) {
    setEmail(value);
    if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
  }
  function handleTopicChange(value: string) {
    setTopic(value);
    if (errors.topic) setErrors((prev) => ({ ...prev, topic: null }));
  }
  function handleMessageChange(value: string) {
    setMessage(value);
    if (errors.message) setErrors((prev) => ({ ...prev, message: null }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setErrors({});

    if (!nameValid) {
      setErrors((prev) => ({ ...prev, name: "Enter your name." }));
      return;
    }
    if (!emailValid) {
      setErrors((prev) => ({ ...prev, email: "Enter a valid email address." }));
      return;
    }
    if (!topicValid) {
      setErrors((prev) => ({ ...prev, topic: "Choose a topic." }));
      return;
    }
    if (!messageValid) {
      setErrors((prev) => ({ ...prev, message: "Write at least a short message." }));
      return;
    }

    setPending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      setSent(true);
      toast({
        tone: "success",
        title: "Message sent",
        description:
          "This demo does not connect to a backend yet. In production your message would be delivered to the Handly team.",
      });
    } catch {
      toast({
        tone: "error",
        title: "Message could not be sent",
        description:
          "We could not send your message. Try again in a moment.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center md:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight">Talk to a human</h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            Questions about plans, migrations, or anything else — we answer every message.
          </p>
        </div>
      </section>

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
                  We received your message and will reply within one business day. This demo does not
                  connect to a backend yet, so no email was actually sent.
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
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      aria-invalid={nameError ? true : undefined}
                      aria-describedby={nameError ? "contact-name-error" : undefined}
                      className={cn(nameError && "aria-[invalid=true]")}
                    />
                    {nameError ? (
                      <FieldError id="contact-name-error" className="mt-1">
                        {nameError}
                      </FieldError>
                    ) : null}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-email">Work email</Label>
                    <Input
                      id="contact-email"
                      name="email"
                      type="email"
                      inputMode="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      aria-invalid={emailError ? true : undefined}
                      aria-describedby={emailError ? "contact-email-error" : undefined}
                      className={cn(emailError && "aria-[invalid=true]")}
                    />
                    {emailError ? (
                      <FieldError id="contact-email-error" className="mt-1">
                        {emailError}
                      </FieldError>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contact-topic">Topic</Label>
                  <Select
                    id="contact-topic"
                    name="topic"
                    value={topic}
                    onChange={(e) => handleTopicChange(e.target.value)}
                    aria-invalid={topicError ? true : undefined}
                    aria-describedby={topicError ? "contact-topic-error" : undefined}
                  >
                    <option value="" disabled>
                      Choose a topic…
                    </option>
                    {TOPICS.map((topic) => (
                      <option key={topic.value} value={topic.value}>
                        {topic.label}
                      </option>
                    ))}
                  </Select>
                  {topicError ? (
                    <FieldError id="contact-topic-error" className="mt-1">
                      {topicError}
                    </FieldError>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea
                    id="contact-message"
                    name="message"
                    rows={6}
                    placeholder="How can we help?"
                    value={message}
                    onChange={(e) => handleMessageChange(e.target.value)}
                    aria-invalid={messageError ? true : undefined}
                    aria-describedby={messageError ? "contact-message-error" : undefined}
                    className={cn(messageError && "aria-[invalid=true]")}
                  />
                  <FieldHint>The more context you share, the better our first reply.</FieldHint>
                  {messageError ? (
                    <FieldError id="contact-message-error" className="mt-1">
                      {messageError}
                    </FieldError>
                  ) : null}
                </div>

                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={!canSubmit}
                  aria-disabled={!canSubmit || undefined}
                >
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
