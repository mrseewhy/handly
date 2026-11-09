import "server-only";

import { headers } from "next/headers";

/**
 * Minimal in-memory rate limiter.
 *
 * Scope: protects the unauthenticated contact form and auth attempts from
 * trivial abuse on a single instance. It is deliberately NOT a distributed
 * limiter — on multi-instance/serverless hosting each instance keeps its own
 * counters, so the effective limit scales with instance count. That is an
 * acceptable trade for a prototype; swap the store for Redis/Upstash before
 * relying on it as a security control.
 */

interface Bucket {
  count: number;
  /** Epoch ms when the current window started. */
  startedAt: number;
}

const buckets = new Map<string, Bucket>();

/** Stops the map growing without bound on a long-lived process. */
const MAX_BUCKETS = 10_000;

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  /** Seconds until the window resets, for the Retry-After header/message. */
  retryAfter: number;
}

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): RateLimitResult {
  // The E2E suite signs in repeatedly from one IP and would otherwise trip the
  // sign-in limit and fail for the wrong reason. Never set this in production.
  if (process.env.DISABLE_RATE_LIMIT === "1") {
    return { ok: true, remaining: limit, retryAfter: 0 };
  }

  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.startedAt >= windowMs) {
    if (buckets.size >= MAX_BUCKETS) {
      // Drop the oldest entry rather than growing forever.
      const oldest = [...buckets.entries()].sort(
        (a, b) => a[1].startedAt - b[1].startedAt,
      )[0];
      if (oldest) buckets.delete(oldest[0]);
    }
    buckets.set(key, { count: 1, startedAt: now });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  bucket.count += 1;
  const retryAfter = Math.ceil((bucket.startedAt + windowMs - now) / 1000);

  if (bucket.count > limit) {
    return { ok: false, remaining: 0, retryAfter };
  }
  return { ok: true, remaining: Math.max(0, limit - bucket.count), retryAfter };
}

/**
 * Best-effort client identity for rate limiting.
 *
 * Reads `x-forwarded-for` because Vercel terminates TLS upstream. Falls back to
 * a constant so a missing header throttles everyone together rather than
 * silently disabling the limit.
 */
export async function clientKey(scope: string): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  return `${scope}:${ip}`;
}
