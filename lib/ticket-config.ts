import {
  AlertOctagon,
  Archive,
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
  CircleDot,
  Clock,
  Loader,
  MinusCircle,
  PauseCircle,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Ticket status                                                       */
/* ------------------------------------------------------------------ */

export const TICKET_STATUSES = [
  "open",
  "in_progress",
  "pending",
  "on_hold",
  "resolved",
  "closed",
] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const statusConfig: Record<
  TicketStatus,
  { label: string; icon: LucideIcon; badgeClass: string }
> = {
  open: {
    label: "Open",
    icon: CircleDot,
    badgeClass: "text-status-open bg-info-subtle",
  },
  in_progress: {
    label: "In progress",
    icon: Loader,
    badgeClass: "text-status-progress bg-primary-subtle",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    badgeClass: "text-status-pending bg-warning-subtle",
  },
  on_hold: {
    label: "On hold",
    icon: PauseCircle,
    badgeClass: "text-status-hold bg-surface-muted",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle2,
    badgeClass: "text-status-resolved bg-success-subtle",
  },
  closed: {
    label: "Closed",
    icon: Archive,
    badgeClass: "text-status-closed bg-surface-muted",
  },
};

/** Statuses that still need work (used for queue counts). */
export const ACTIVE_STATUSES: TicketStatus[] = [
  "open",
  "in_progress",
  "pending",
  "on_hold",
];

export function isActiveStatus(status: TicketStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

/* ------------------------------------------------------------------ */
/* Ticket priority                                                     */
/* ------------------------------------------------------------------ */

export const TICKET_PRIORITIES = ["urgent", "high", "medium", "low"] as const;

export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export const priorityConfig: Record<
  TicketPriority,
  { label: string; icon: LucideIcon; textClass: string; badgeClass: string }
> = {
  urgent: {
    label: "Urgent",
    icon: AlertOctagon,
    textClass: "text-priority-urgent",
    badgeClass: "text-priority-urgent bg-danger-subtle",
  },
  high: {
    label: "High",
    icon: ArrowUpCircle,
    textClass: "text-priority-high",
    badgeClass: "text-priority-high bg-warning-subtle",
  },
  medium: {
    label: "Medium",
    icon: MinusCircle,
    textClass: "text-priority-medium",
    badgeClass: "text-priority-medium bg-warning-subtle",
  },
  low: {
    label: "Low",
    icon: ArrowDownCircle,
    textClass: "text-priority-low",
    badgeClass: "text-priority-low bg-surface-muted",
  },
};

/* ------------------------------------------------------------------ */
/* Ticket category                                                     */
/* ------------------------------------------------------------------ */

export const CATEGORY_LABELS = {
  billing: "Billing",
  technical: "Technical",
  account: "Account",
  bug: "Bug report",
  feature_request: "Feature request",
  other: "Other",
} as const;

export type TicketCategory = keyof typeof CATEGORY_LABELS;

export const TICKET_CATEGORIES = Object.keys(CATEGORY_LABELS) as TicketCategory[];
