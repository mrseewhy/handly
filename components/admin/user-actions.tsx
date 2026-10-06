"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, DangerSummary } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import type { Person } from "@/lib/mock-data";

export function UserActions({ user }: { user?: Person }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [action, setAction] = useState<"suspend" | "restore" | null>(null);

  function openConfirm(nextAction: "suspend" | "restore", id: string) {
    setPendingId(id);
    setAction(nextAction);
    setOpen(true);
  }

  function handleConfirm() {
    if (!pendingId || !action) return;
    // No backend: simulate the confirmation path only.
    toast({
      tone: action === "suspend" ? "warning" : "success",
      title: action === "suspend" ? "User suspended" : "User restored",
      description:
        action === "suspend"
          ? "Sending a suspension notice is pending backend integration."
          : "Restoring access is pending backend integration.",
    });
    setOpen(false);
    setPendingId(null);
    setAction(null);
  }

  if (!user) return null;

  const isSuspended = user.status === "suspended";

  return (
    <>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={isSuspended ? "Restore user" : "Suspend user"}
        description={
          isSuspended
            ? "This will re-enable the user's access to the workspace. They will need to sign in again."
            : "This will stop the user from signing in and hide their active tickets from the queue. Tickets are not deleted."
        }
        actionLabel={isSuspended ? "Restore user" : "Suspend user"}
        onConfirm={handleConfirm}
      >
        {pendingId && (
          <DangerSummary
            label={isSuspended ? "User will be restored" : "User will be suspended"}
            value={
              <span className="flex items-center gap-2">
                <Avatar initials={user.initials} size="sm" customer />
                <span className="text-sm font-medium">{user.name}</span>
                <span className="block text-[13px] text-muted-foreground">{user.email}</span>
              </span>
            }
          />
        )}
      </ConfirmDialog>

      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          openConfirm(isSuspended ? "restore" : "suspend", user.id)
        }
        className={isSuspended ? "text-success hover:bg-success-subtle hover:text-success" : ""}
        aria-label={isSuspended ? `Restore ${user.name}` : `Suspend ${user.name}`}
      >
        {isSuspended ? "Restore" : "Suspend"}
      </Button>
    </>
  );
}
