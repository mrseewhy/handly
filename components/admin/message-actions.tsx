"use client";

import { useState, useTransition } from "react";
import { Mail, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { setMessageHandled } from "@/lib/data/actions/tickets";
import type { ContactMessageView } from "@/lib/data/dal/messages";

/** Per-message "mark handled" / "reopen" control. */
export function MessageActions({ message }: { message: ContactMessageView }) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [localHandled, setLocalHandled] = useState(Boolean(message.handledAt));

  function toggle() {
    const next = !localHandled;
    startTransition(async () => {
      const result = await setMessageHandled(message.id, next);
      if (!result.ok) {
        toast({ tone: "error", title: "Could not update", description: result.error });
        return;
      }
      setLocalHandled(next);
      toast({
        tone: "success",
        title: next ? "Marked handled" : "Reopened",
        description: next
          ? `Message from ${message.name} is done.`
          : `Message from ${message.name} is back in the queue.`,
      });
    });
  }

  return (
    <Button
      variant={localHandled ? "ghost" : "secondary"}
      size="sm"
      onClick={toggle}
      disabled={pending}
    >
      {localHandled ? (
        <>
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          Reopen
        </>
      ) : (
        <>
          <Mail className="h-3.5 w-3.5" aria-hidden />
          Mark handled
        </>
      )}
    </Button>
  );
}
