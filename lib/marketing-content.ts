/**
 * Static marketing copy. Not part of the database: these are fixed product
 * pages (features, pricing, testimonials) whose content is edited with code,
 * not by users, so it lives here instead of being seeded into Postgres.
 */

export const marketingFeatures = [
  {
    icon: "Inbox",
    title: "Unified inbox",
    description:
      "Email, chat, and web form tickets land in one calm queue with SLA timers and clear priorities.",
  },
  {
    icon: "Workflow",
    title: "Smart workflows",
    description:
      "Route tickets by topic, priority, or workload. Escalations happen automatically before SLAs break.",
  },
  {
    icon: "MessagesSquare",
    title: "Shared conversations",
    description:
      "Internal notes, canned replies, and collision detection keep your whole team on the same page.",
  },
  {
    icon: "BarChart3",
    title: "Insightful reports",
    description:
      "First response time, resolution time, and satisfaction trends — ready for your Monday stand-up.",
  },
  {
    icon: "ShieldCheck",
    title: "Enterprise security",
    description:
      "SSO, two-factor authentication, granular roles, and a full audit log of every action.",
  },
  {
    icon: "Bot",
    title: "Assistive automation",
    description:
      "Draft replies, tag tickets, and detect sentiment automatically — your agents stay in control.",
  },
];

export const marketingTestimonials = [
  {
    quote:
      "Handly cut our first response time from 6 hours to 40 minutes. The queue finally tells the truth about what matters.",
    name: "Maya Lindqvist",
    role: "Head of support, Nordic Home",
    initials: "ML",
  },
  {
    quote:
      "We migrated 40,000 tickets in an afternoon. Our agents needed zero training — the queue reads like a to-do list.",
    name: "Jonas Weber",
    role: "COO, Kranich Software",
    initials: "JW",
  },
  {
    quote:
      "The internal notes and collision detection alone paid for the plan. No more double replies to angry customers.",
    name: "Amara Diallo",
    role: "Support lead, Sahel Cloud",
    initials: "AD",
  },
];

export const marketingFaq = [
  {
    question: "Is there a free trial?",
    answer:
      "Yes — every plan starts with a 14-day free trial. No credit card required, and you keep every setting if you continue.",
  },
  {
    question: "Can I change plans later?",
    answer:
      "Any time. Upgrades apply immediately with prorated billing; downgrades take effect at the end of your cycle.",
  },
  {
    question: "How does per-seat billing work?",
    answer:
      "You pay for admins and agents who can reply to tickets. Customers and read-only viewers are always free.",
  },
  {
    question: "Do you offer data migration?",
    answer:
      "The Starter plan includes CSV import. Team and Enterprise plans include guided migration from Zendesk, Intercom, and Help Scout.",
  },
  {
    question: "Is Handly GDPR compliant?",
    answer:
      "Yes. Data is hosted in the EU and US, we sign DPAs on request, and you can export or delete every customer record.",
  },
  {
    question: "What support do I get?",
    answer:
      "Email support on all plans, live chat on Team, and a dedicated success manager plus 99.9% uptime SLA on Enterprise.",
  },
];

export const pricingPlans = [
  {
    name: "Starter",
    price: "$9",
    period: "per agent / month",
    description: "For small teams getting support off email.",
    cta: "Start free trial",
    highlight: false,
    features: [
      "3 inboxes (email, chat, form)",
      "Unlimited customers",
      "SLA timers & priorities",
      "Canned replies",
      "CSV import",
      "Email support",
    ],
  },
  {
    name: "Team",
    price: "$24",
    period: "per agent / month",
    description: "For growing teams that need automation and insight.",
    cta: "Start free trial",
    highlight: true,
    badge: "Most popular",
    features: [
      "Everything in Starter",
      "Unlimited inboxes",
      "Saved views & custom fields",
      "Automation rules & macros",
      "Reports & satisfaction surveys",
      "Live chat support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "billed annually",
    description: "For organizations with advanced security needs.",
    cta: "Contact sales",
    highlight: false,
    features: [
      "Everything in Team",
      "SSO / SAML & SCIM",
      "Audit log & data residency",
      "99.9% uptime SLA",
      "Dedicated success manager",
      "Guided migration",
    ],
  },
];
