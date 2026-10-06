import Link from "next/link";
import { LifeBuoy } from "lucide-react";
import { cn } from "@/lib/cn";

export function Logo({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-md font-semibold tracking-tight text-foreground",
        className,
      )}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <LifeBuoy className="h-4 w-4" aria-hidden />
      </span>
      <span className="text-[17px]">Handly</span>
    </Link>
  );
}
