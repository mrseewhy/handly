import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact · Handly",
};

export default function ContactPage() {
  return <ContactForm />;
}
