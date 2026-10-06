import {
  AlertOctagon,
  ArrowDownCircle,
  ArrowUpCircle,
  MinusCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { priorityConfig, statusConfig, type TicketPriority, type TicketStatus } from "@/lib/ticket-config";

const statusIcons: Record<TicketStatus, LucideIcon> = {
  open: statusConfig.open.icon,
  in_progress: statusConfig.in_progress.icon,
  pending: statusConfig.pending.icon,
  on_hold: statusConfig.on_hold.icon,
  resolved: statusConfig.resolved.icon,
  closed: statusConfig.closed.icon,
};

const priorityIcons: Record<TicketPriority, LucideIcon> = {
  urgent: AlertOctagon,
  high: ArrowUpCircle,
  medium: MinusCircle,
  low: ArrowDownCircle,
};

export function StatusBadge({ status, className }: { status: TicketStatus; className?: string }) {
  const config = statusConfig[status];
  const Icon = statusIcons[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.badgeClass,
        className,
      )}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority, className }: { priority: TicketPriority; className?: string }) {
  const config = priorityConfig[priority];
  const Icon = priorityIcons[priority];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.badgeClass,
        className,
      )}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {config.label}
    </span>
  );
}

/** Icon + text, no background — used in dense table rows. */
export function PriorityInline({ priority, className }: { priority: TicketPriority; className?: string }) {
  const config = priorityConfig[priority];
  const Icon = priorityIcons[priority];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", config.textClass, className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {config.label}
    </span>
  );
}
