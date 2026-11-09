import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Page } from "@/lib/pagination";

/**
 * Numbered pagination for server-rendered lists.
 *
 * Links are real `<a href>`s so pages work without JS and are shareable; the
 * current page is exposed via `aria-current`.
 */
export function Pagination({
  page,
  basePath,
  /** Extra query params to preserve (e.g. the active search query). */
  query,
  className,
}: {
  page: Page<unknown>;
  basePath: string;
  query?: Record<string, string | undefined>;
  className?: string;
}) {
  if (page.totalPages <= 1) return null;

  function hrefFor(target: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value) params.set(key, value);
    }
    if (target > 1) params.set("page", String(target));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  // Show a window around the current page so long lists stay usable.
  const windowSize = 2;
  const numbers: number[] = [];
  for (
    let n = Math.max(1, page.page - windowSize);
    n <= Math.min(page.totalPages, page.page + windowSize);
    n += 1
  ) {
    numbers.push(n);
  }

  const linkBase =
    "inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-[13px] font-medium transition-colors";

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex flex-wrap items-center justify-between gap-3", className)}
    >
      <p className="text-[13px] text-muted-foreground" aria-live="polite">
        Page {page.page} of {page.totalPages} · {page.total} total
      </p>

      <div className="flex items-center gap-1.5">
        {page.hasPrevious ? (
          <Link
            href={hrefFor(page.page - 1)}
            rel="prev"
            aria-label="Previous page"
            className={cn(linkBase, "border-border-strong text-foreground hover:bg-surface-muted")}
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className={cn(linkBase, "border-border text-subtle-foreground opacity-50")}
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
          </span>
        )}

        {numbers.map((n) => (
          <Link
            key={n}
            href={hrefFor(n)}
            aria-current={n === page.page ? "page" : undefined}
            className={cn(
              linkBase,
              n === page.page
                ? "border-primary bg-primary-subtle text-primary"
                : "border-border-strong text-muted-foreground hover:bg-surface-muted hover:text-foreground",
            )}
          >
            {n}
          </Link>
        ))}

        {page.hasNext ? (
          <Link
            href={hrefFor(page.page + 1)}
            rel="next"
            aria-label="Next page"
            className={cn(linkBase, "border-border-strong text-foreground hover:bg-surface-muted")}
          >
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className={cn(linkBase, "border-border text-subtle-foreground opacity-50")}
          >
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        )}
      </div>
    </nav>
  );
}
