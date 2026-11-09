"use server";

import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";
import { getActor } from "@/lib/data/dal/session";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import type { ActionResult } from "@/lib/data/actions/tickets";

const TOPICS = ["sales", "support", "migration", "other"] as const;

/**
 * Public contact form. No sign-in required, so it validates input itself and
 * stores the message. Email delivery is not configured yet, which is why the
 * message is persisted rather than "sent" — nothing is silently lost.
 */
export async function submitContactMessage(input: {
  name: string;
  email: string;
  topic: string;
  message: string;
}): Promise<ActionResult> {
  const name = input.name?.trim() ?? "";
  const email = input.email?.trim().toLowerCase() ?? "";
  const message = input.message?.trim() ?? "";

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "Enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = "Enter a valid email address.";
  if (!TOPICS.includes(input.topic as (typeof TOPICS)[number])) {
    fieldErrors.topic = "Choose a topic.";
  }
  if (message.length < 10) fieldErrors.message = "Write at least a short message.";
  if (message.length > 5_000) fieldErrors.message = "Messages are limited to 5,000 characters.";

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  // Public endpoint: 5 messages per IP per 10 minutes.
  const limit = rateLimit(await clientKey("contact"), {
    limit: 5,
    windowMs: 10 * 60_000,
  });
  if (!limit.ok) {
    return {
      ok: false,
      error: `Too many messages. Try again in ${Math.ceil(limit.retryAfter / 60)} minute(s).`,
    };
  }

  // Attach the account when the sender happens to be signed in.
  const actor = await getActor();

  await db.insert(contactMessages).values({
    id: randomUUID(),
    name,
    email,
    topic: input.topic,
    message,
    userId: actor?.id ?? null,
  });

  return { ok: true, data: undefined };
}
