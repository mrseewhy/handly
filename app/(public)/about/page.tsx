import type { Metadata } from "next";
import { Award, Heart, Target, Zap } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

export const metadata: Metadata = {
  title: "About · Handly",
};

const values = [
  {
    icon: Target,
    title: "Clarity over cleverness",
    description: "Support work is hard enough. The tool should never add mystery to it.",
  },
  {
    icon: Zap,
    title: "Speed is a feature",
    description: "Every interaction is tuned so agents can move through queues without friction.",
  },
  {
    icon: Heart,
    title: "Empathy, both sides",
    description: "Customers are often frustrated; agents are often overloaded. We design for both.",
  },
  {
    icon: Award,
    title: "Craft matters",
    description: "Details like contrast, focus rings, and loading states are the product.",
  },
];

const timeline = [
  { year: "2024", text: "Handly starts as an internal tool at a two-person agency drowning in email." },
  { year: "2025", text: "We launch publicly. The first 100 teams join within three months." },
  { year: "2026", text: "Saved views, automation rules, and the activity log ship. 1,200 teams later, we are just getting started." },
];

const team = [
  { initials: "ML", name: "Mira Lindholm", role: "Co-founder, product" },
  { initials: "JW", name: "Jonas Weber", role: "Co-founder, engineering" },
  { initials: "AD", name: "Amara Diallo", role: "Design" },
  { initials: "RK", name: "Ravi Krishnan", role: "Engineering" },
];

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center md:px-6 lg:px-8">
          <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight">
            We build the support tool we always wanted
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Handly exists because support teams deserve software that is calm, honest, and
            fast — not another dashboard that fights them.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold tracking-tight">What we believe</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <Card key={v.title} className="p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-subtle text-primary">
                <v.icon className="h-4 w-4" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{v.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{v.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight">The story so far</h2>
          <ol className="mt-8 space-y-0">
            {timeline.map((t, i) => (
              <li key={t.year} className="relative flex gap-6 pb-8 last:pb-0">
                {i < timeline.length - 1 && (
                  <span aria-hidden className="absolute left-[27px] top-10 h-full w-px bg-border" />
                )}
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-subtle font-mono text-[11px] font-semibold text-primary">
                  {t.year.slice(2)}
                </span>
                <div>
                  <p className="font-mono text-[13px] font-medium text-muted-foreground">{t.year}</p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground md:text-base">{t.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold tracking-tight">The team</h2>
        <p className="mt-1 text-sm text-muted-foreground">Small on purpose, remote across four time zones.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member) => (
            <Card key={member.name} className="flex items-center gap-3 p-4">
              <Avatar initials={member.initials} size="lg" customer />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{member.name}</p>
                <p className="truncate text-[13px] text-muted-foreground">{member.role}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-14 rounded-xl border border-border bg-surface p-6 text-center shadow-sm md:p-10">
          <h2 className="text-2xl font-semibold tracking-tight">Want to work on Handly?</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            We hire people who have done support themselves and care about the details.
          </p>
          <ButtonLink href="/contact" variant="secondary" className="mt-6">
            Say hello
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
