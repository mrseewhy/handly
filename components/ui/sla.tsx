import { cn } from "@/lib/cn";
import { formatTimeLeft } from "@/lib/format";
import type { SlaState } from "@/lib/mock-data";

const slaStyles: Record<SlaState, { badge: string; label: string }> = {
  on_track: { badge: "text-success bg-success-subtle", label: "On track" },
  at_risk: { badge: "text-warning bg-warning-subtle", label: "At risk" },
  critical: { badge: "text-danger bg-danger-subtle", label: "Critical" },
  breached: { badge: "text-white bg-danger", label: "Breached" },
};

export function SlaBadge({
  state,
  deadline,
  className,
}: {
  state: SlaState;
  deadline: string;
  className?: string;
}) {
  const style = slaStyles[state];
  const timeLeft = formatTimeLeft(deadline);
  const isBreached = state === "breached";

  return (
    <span
      title={isBreached ? "SLA breached" : `SLA ${style.label.toLowerCase()} — ${timeLeft}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[11px] font-medium tabular-nums",
        style.badge,
        className,
      )}
    >
      {isBreached ? "SLA breached" : `${timeLeft}`}
    </span>
  );
}

/** Non-interactive bar + label used on the dashboard and ticket detail. */
export function SlaMeter({
  state,
  deadline,
  percentUsed,
}: {
  state: SlaState;
  deadline: string;
  /** 0–100, how much of the SLA window has elapsed. */
  percentUsed: number;
}) {
  const color =
    state === "breached" || state === "critical"
      ? "bg-danger"
      : state === "at_risk"
        ? "bg-warning"
        : "bg-success";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">SLA</span>
        <span className="font-mono tabular-nums text-muted-foreground">
          {formatTimeLeft(deadline)}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={Math.round(percentUsed)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="SLA time used"
        className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted"
      >
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${Math.min(100, Math.max(4, percentUsed))}%` }}
        />
      </div>
    </div>
  );
}
