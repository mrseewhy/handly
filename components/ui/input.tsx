import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const fieldClasses =
  "w-full rounded-md border border-border-strong bg-surface px-3 text-sm text-foreground " +
  "placeholder:text-muted-foreground " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary " +
  "disabled:bg-surface-muted disabled:text-subtle-foreground aria-[invalid=true]:border-danger";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(fieldClasses, "h-9", className)}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(fieldClasses, "min-h-24 py-2 leading-relaxed", className)}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select className={cn(fieldClasses, "h-9 pr-8", className)} {...props}>
      {children}
    </select>
  );
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("block text-sm font-medium text-foreground", className)} {...props} />;
}

export function FieldHint({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("text-[13px] text-muted-foreground", className)} {...props} />;
}

export function FieldError({ className, children, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn("flex items-center gap-1.5 text-[13px] text-danger", className)}
      {...props}
    >
      {children}
    </p>
  );
}
