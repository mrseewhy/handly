import type { Metadata } from "next";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Inbox,
  MessagesSquare,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { marketingFeatures } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Features · Handly",
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Inbox,
  Workflow,
  MessagesSquare,
  BarChart3,
  ShieldCheck,
  Bot,
};

const deepDives = [
  {
    eyebrow: "Queues",
    title: "Every ticket, in the right order",
    body: "Priority, age, and SLA time on every row. Sort by what matters, save the view, and share it with the team. Unanswered tickets get their own queue so nothing hides.",
    bullets: ["SLA timers with breach alerts", "Saved views and custom fields", "Bulk actions for triage"],
  },
  {
    eyebrow: "Collaboration",
    title: "Work together without stepping on toes",
    body: "Agent replies and internal notes live in one thread. Collision detection warns when a teammate is already typing, and private notes stay invisible to customers.",
    bullets: ["Internal notes with clear labels", "Canned responses with variables", "Assignment and @mentions"],
  },
  {
    eyebrow: "Insight",
    title: "Know your numbers on Monday",
    body: "First response time, resolution time, and satisfaction per agent and per topic. Export everything, or check the dashboard before stand-up.",
    bullets: ["Response and resolution reports", "Satisfaction surveys", "Weekly email digest"],
  },
];

export default function FeaturesPage() {
  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center md:px-6 lg:px-8">
          <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight">
            Everything your support team needs, nothing it doesn&apos;t
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            Handly is built for high-volume queues: fast to scan, quick to act, and calm
            to look at all day long.
          </p>
        </div>
      </section>

      {/* Feature grid */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {marketingFeatures.map((f) => {
            const Icon = iconMap[f.icon] ?? Inbox;
            return (
              <Card key={f.title} className="p-6 transition hover:border-border-strong hover:shadow-md">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-subtle text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="mt-4 text-lg font-semibold">{f.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Deep dives */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl space-y-10 px-4 py-16 md:px-6 lg:px-8">
          {deepDives.map((d, i) => (
            <div
              key={d.eyebrow}
              className={`grid items-center gap-8 md:grid-cols-2 ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}
            >
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-primary">{d.eyebrow}</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">{d.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">{d.body}</p>
                <ul className="mt-5 space-y-2">
                  {d.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-border bg-surface-elevated p-5 shadow-sm">
                <div className="space-y-2.5">
                  {[0, 1, 2].map((row) => (
                    <div key={row} className="flex items-center gap-3 rounded-md border border-border bg-surface px-3 py-2.5">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: ["var(--status-open)", "var(--status-pending)", "var(--status-resolved)"][row] }}
                        aria-hidden
                      />
                      <span
                        className="h-2 rounded-full bg-surface-muted"
                        style={{ width: `${70 - row * 18}%` }}
                        aria-hidden
                      />
                      <span className="ml-auto h-2 w-10 rounded-full bg-surface-muted" aria-hidden />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center md:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Ready to see it on your own tickets?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
          Start the 14-day trial — no credit card, no sales call required.
        </p>
        <ButtonLink href="/sign-up" size="lg" className="mt-6">
          Start free trial
          <ArrowRight className="h-4 w-4" aria-hidden />
        </ButtonLink>
      </section>
    </>
  );
}
