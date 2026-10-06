"use client";

import { Component, type ReactNode } from "react";
import Link from "next/link";
import { LifeBuoy } from "lucide-react";
import { cn } from "@/lib/cn";

function FallbackLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-md px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-surface-muted hover:text-foreground",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function ErrorBoundaryFallback({
  title,
  detail,
  actions,
}: {
  title: string;
  detail?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-subtle text-danger">
          <LifeBuoy className="h-6 w-6" aria-hidden />
        </div>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h2>
        {detail && (
          <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actions ?? (
            <>
              <FallbackLink href="/">Back to home</FallbackLink>
              <FallbackLink href="/admin">Go to dashboard</FallbackLink>
              <FallbackLink href="/sign-in">Sign in</FallbackLink>
            </>
          )}
        </div>
        <p className="mt-6 text-[13px] text-subtle-foreground">
          Something went wrong rendering this page. Your workspace and data are not
          affected; try refreshing or returning to a previous screen.
        </p>
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

export class ComponentErrorBoundary extends Component<
  ErrorBoundaryProps,
  { hasError: boolean; error: Error | null }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorBoundaryFallback
          title="Something went wrong"
          detail={
            this.state.error?.message
              ? `The error was: ${this.state.error.message}`
              : undefined
          }
        />
      );
    }
    return this.props.children;
  }
}
