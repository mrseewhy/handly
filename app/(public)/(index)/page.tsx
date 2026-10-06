import type { Metadata } from "next";
import {
  ArrowRight,
  BarChart3,
  Check,
  Inbox,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { marketingTestimonials } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Handly — Customer support that stays calm",
};

const highlights = [
  {
    icon: Inbox,
    title: "One calm inbox",
    description: "Email, chat, and forms in a single queue with priorities and SLA timers.",
  },
  {
    icon: Workflow,
    title: "Workflows that route",
    description: "Tickets land with the right agent based on topic, workload, and schedule.",
  },
  {
    icon: MessagesSquare,
    title: "Replies that land",
    description: "Canned responses, internal notes, and collision detection built in.",
  },
  {
    icon: BarChart3,
    title: "Numbers you trust",
    description: "First response, resolution time, and satisfaction — no spreadsheet needed.",
  },
];

export default function HomePage() {
  const t = marketingTestimonials[0];

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center md:px-6 lg:px-8 lg:py-28">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden />
            New: saved views and automation rules
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
            Customer support that stays calm under pressure
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Handly brings every customer conversation into one quiet, scannable queue — so
            your team answers the right ticket first, every time.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/sign-up" size="lg">
              Start free trial
              <ArrowRight className="h-4 w-4" aria-hidden />
            </ButtonLink>
            <ButtonLink href="/features" variant="secondary" size="lg">
              See features
            </ButtonLink>
          </div>
          <p className="mt-4 text-[13px] text-muted-foreground">
            14-day trial · No credit card · Set up in minutes
          </p>
        </div>
      </section>

      {/* Highlights */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((h) => (
            <Card key={h.title} className="p-5 transition hover:border-border-strong hover:shadow-md">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-subtle text-primary">
                <h.icon className="h-4 w-4" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{h.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{h.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Split feature */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-6 lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              The queue tells the truth
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Urgent tickets rise, stale ones surface, and nothing waits silently. Every row
              shows status, priority, and SLA time at a glance — readable in under a second.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "SLA timers with at-risk and breached states",
                "Priority colors that never rely on color alone",
                "Saved views for your team's morning triage",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <ButtonLink href="/sign-up" className="mt-8">
              Try Handly free
            </ButtonLink>
          </div>
          {/* Static product mock */}
          <div className="rounded-xl border border-border bg-surface-elevated p-4 shadow-md">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <span className="h-2.5 w-2.5 rounded-full bg-border-strong" aria-hidden />
              <span className="h-2.5 w-2.5 rounded-full bg-border-strong" aria-hidden />
              <span className="h-2.5 w-2.5 rounded-full bg-border-strong" aria-hidden />
              <span className="ml-2 font-mono text-[11px] text-muted-foreground">handly.app/tickets</span>
            </div>
            <div className="mt-3 space-y-2">
              {[
                { id: "HND-1044", subject: "Cannot sign in after password reset", sla: "2h left", urgent: true },
                { id: "HND-1042", subject: "Double charge on September invoice", sla: "19h left", urgent: false },
                { id: "HND-1039", subject: "API returns 500 on bulk export", sla: "2h left", urgent: true },
                { id: "HND-1031", subject: "Change workspace email address", sla: "1d left", urgent: false },
              ].map((row) => (
                <div
                  key={row.id}
                  className="flex items-center gap-3 rounded-md border border-border bg-surface px-3 py-2.5"
                >
                  <span className="font-mono text-[11px] text-muted-foreground">{row.id}</span>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{row.subject}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${
                      row.urgent ? "bg-warning-subtle text-warning" : "bg-success-subtle text-success"
                    }`}
                  >
                    {row.sla}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center md:px-6 lg:px-8">
        <blockquote>
          <p className="text-xl font-medium leading-relaxed tracking-tight md:text-2xl">
            “{t.quote}”
          </p>
        </blockquote>
        <figure className="mt-6 flex items-center justify-center gap-3">
          <Avatar initials={t.initials} size="md" customer />
          <figcaption className="text-left text-sm">
            <span className="block font-medium">{t.name}</span>
            <span className="block text-muted-foreground">{t.role}</span>
          </figcaption>
        </figure>
      </section>

      {/* Security strip */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-6 text-[13px] text-muted-foreground md:px-6 lg:px-8">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-success" aria-hidden /> SSO & two-factor auth
          </span>
          <span>99.9% uptime SLA</span>
          <span>GDPR compliant</span>
          <span>EU & US data residency</span>
        </div>
      </section>
    </>
  );
}
