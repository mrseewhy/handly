"use client";

import { useTransition } from "react";
import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markNotificationsRead } from "@/lib/data/actions/tickets";

/** Clears the unread badge. Rendered only when there is something to clear. */
export function MarkAllReadButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => void markNotificationsRead())}
    >
      <CheckCheck className="h-4 w-4" aria-hidden />
      {pending ? "Marking…" : "Mark all as read"}
    </Button>
  );
}
