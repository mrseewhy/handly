"use client";

import { useState, useTransition } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, DangerSummary } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import type { Person } from "@/lib/view-types";
import { removeAdmin } from "@/lib/data/actions/tickets";

export function AdminRowActions({ admin }: { admin: Person }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function openConfirm(id: string) {
    setPendingId(id);
    setOpen(true);
  }

  function handleConfirm() {
    if (!pendingId) return;

    startTransition(async () => {
      const result = await removeAdmin(pendingId);
      setOpen(false);
      setPendingId(null);

      if (!result.ok) {
        toast({ tone: "error", title: "Could not remove admin", description: result.error });
        return;
      }
      toast({
        tone: "success",
        title: "Admin access removed",
        description: "They keep their account and tickets, as a customer.",
      });
    });
  }

  return (
    <>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Remove admin"
        description="This admin will lose access to queues, settings, and admin tools. Their activity in the log is preserved. This cannot be undone from the UI yet."
        actionLabel="Remove admin"
        onConfirm={handleConfirm}
      >
        {pendingId && (
          <DangerSummary
            label="Admin will be removed"
            value={
              <span className="flex items-center gap-2">
                <Avatar initials={admin.initials} size="sm" />
                <span className="text-sm font-medium">{admin.name}</span>
                <span className="block text-[13px] text-muted-foreground">{admin.email}</span>
              </span>
            }
          />
        )}
      </ConfirmDialog>

      <Button
        variant="ghost"
        size="sm"
        className="text-danger hover:bg-danger-subtle hover:text-danger"
        onClick={() => openConfirm(admin.id)}
        aria-label={`Remove admin ${admin.name}`}
      >
        Remove
      </Button>
    </>
  );
}
