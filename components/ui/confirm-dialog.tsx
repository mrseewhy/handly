"use client";

import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Short heading, e.g. "Delete ticket". */
  title: string;
  /** One or two sentences. Be explicit about what will be lost. */
  description?: string;
  /** Visible left of the primary action button, e.g. "Delete ticket". */
  actionLabel: string;
  /** Destructive action invoked only after the user confirms. */
  onConfirm: () => void;
  /** Extra UI inside the dialog body, for example a readonly summary. */
  children?: ReactNode;
  /** Optional class on the dialog panel. */
  className?: string;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  actionLabel,
  onConfirm,
  children,
  className,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} id="confirm-dialog">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && (
          <DialogDescription>{description}</DialogDescription>
        )}
      </DialogHeader>

      <DialogBody className={cn(children ? "pb-2" : "", className)}>
        {children}
      </DialogBody>

      <DialogFooter>
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {actionLabel}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

interface DangerSummaryProps {
  label: string;
  value: string | ReactNode;
}

export function DangerSummary({ label, value }: DangerSummaryProps) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-warning/40 bg-warning-subtle p-3">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}
