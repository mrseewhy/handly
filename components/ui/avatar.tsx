import { cn } from "@/lib/cn";

export function Badge({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
      {...props}
    />
  );
}

export type AvatarSize = "sm" | "md" | "lg";

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
};

export function Avatar({
  initials,
  size = "md",
  customer = false,
  online,
  className,
}: {
  initials: string;
  size?: AvatarSize;
  /** Customers use a neutral fill; agents/admins use the brand subtle fill. */
  customer?: boolean;
  /** Presence dot: true = online (success), false = offline (subtle). */
  online?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full font-medium",
          sizeClasses[size],
          customer
            ? "bg-surface-muted text-muted-foreground"
            : "bg-primary-subtle text-primary",
        )}
      >
        {initials}
      </span>
      {online !== undefined && (
        <span
          aria-hidden
          className={cn(
            "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-surface",
            online ? "bg-success" : "bg-subtle-foreground",
          )}
        />
      )}
    </span>
  );
}
