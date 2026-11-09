"use client";

import { useState, useTransition } from "react";
import { ShieldPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { promoteToAdmin } from "@/lib/data/actions/tickets";
import type { Person } from "@/lib/view-types";

/** Grants admin access to an existing customer (promote, not invite). */
export function PromoteUserButton({ user }: { user: Person }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      const result = await promoteToAdmin(user.id);
      setOpen(false);
      if (!result.ok) {
        toast({ tone: "error", title: "Could not promote", description: result.error });
        return;
      }
      toast({
        tone: "success",
        title: "Admin access granted",
        description: `${user.name} can now use the admin dashboard.`,
      });
    });
  }

  return (
    <>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Make this user an admin?"
        description="They will gain access to every ticket, user management, and the activity log. You can remove access again from the Admins page."
        actionLabel="Grant admin access"
        onConfirm={confirm}
      >
        <p className="text-sm">
          <span className="font-medium">{user.name}</span>{" "}
          <span className="text-muted-foreground">{user.email}</span>
        </p>
      </ConfirmDialog>

      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} disabled={pending}>
        <ShieldPlus className="h-3.5 w-3.5" aria-hidden />
        Make admin
      </Button>
    </>
  );
}
