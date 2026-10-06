import type { Metadata } from "next";
import { Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { marketingFaq, pricingPlans } from "@/lib/mock-data";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Pricing · Handly",
};

export default function PricingPage() {
  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center md:px-6 lg:px-8">
          <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight">
            Simple pricing that scales with your team
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            Pay per agent, never per ticket. Every plan starts with a 14-day free trial.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "relative flex flex-col p-6",
                plan.highlight && "border-primary shadow-md",
              )}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-xs font-medium text-accent-foreground">
                  {plan.badge}
                </span>
              )}
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <p className="mt-1 text-[13px] text-muted-foreground">{plan.description}</p>
              <p className="mt-5 flex items-baseline gap-1.5">
                <span className="font-mono text-4xl font-semibold tracking-tight">{plan.price}</span>
                <span className="text-[13px] text-muted-foreground">{plan.period}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
              <ButtonLink
                href={plan.cta === "Contact sales" ? "/contact" : "/sign-up"}
                variant={plan.highlight ? "primary" : "secondary"}
                size="md"
                className="mt-8"
              >
                {plan.cta}
              </ButtonLink>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-center text-[13px] text-muted-foreground">
          All prices in USD, billed annually. Monthly billing available at a 20% premium.
          Nonprofits and education get 50% off.
        </p>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-semibold tracking-tight md:text-3xl">
            Frequently asked questions
          </h2>
          <div className="mt-8 space-y-3">
            {marketingFaq.map((item) => (
              <details
                key={item.question}
                className="group rounded-lg border border-border bg-surface px-4 py-3 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-medium">
                  {item.question}
                  <span
                    className="text-muted-foreground transition-transform group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
              </details>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Still have a question?{" "}
            <ButtonLink href="/contact" variant="link" size="sm" className="h-auto p-0">
              Talk to us
            </ButtonLink>
          </p>
        </div>
      </section>
    </>
  );
}
