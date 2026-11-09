import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in · Handly",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  // Read the post-sign-in destination on the server: `proxy.ts` sets `next`
  // when it bounces an unauthenticated visit. Keeping this out of the client
  // avoids a useSearchParams() prerender bailout.
  const { next } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;

  return <SignInForm next={safeNext} />;
}
