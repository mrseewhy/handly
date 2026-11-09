import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact · Handly",
};

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center md:px-6 lg:px-8">
          <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight">
            Talk to a human
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Questions about plans, migrations, or anything else — we answer every message.
          </p>
        </div>
      </section>

      <ContactForm />
    </>
  );
}
