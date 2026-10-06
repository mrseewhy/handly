"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, CircleAlert, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastTone = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
  persistent?: boolean;
}

interface ToastContextValue {
  toast: (options: Omit<ToastItem, "id">) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within <ToastProvider>");
  }
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const toast = useCallback(
    (options: Omit<ToastItem, "id">) => {
      const id = `toast-${counter.current++}`;
      setItems((prev) => [...prev, { ...options, id }]);
      return id;
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastHost
        items={items}
        onDismiss={(id) => setItems((prev) => prev.filter((i) => i.id !== id))}
      />
    </ToastContext.Provider>
  );
}

interface ToastHostProps {
  items: ToastItem[];
  onDismiss: (id: string) => void;
  className?: string;
}

function IconForTone({ tone }: { tone: ToastTone }) {
  switch (tone) {
    case "success":
      return CheckCircle2;
    case "error":
      return CircleAlert;
    case "warning":
      return TriangleAlert;
    case "info":
    default:
      return Info;
  }
}

function ToneBorder({ tone }: { tone: ToastTone }) {
  switch (tone) {
    case "success":
      return "border-l-success";
    case "error":
      return "border-l-danger";
    case "warning":
      return "border-l-warning";
    case "info":
    default:
      return "border-l-info";
  }
}

export function ToastHost({ items, onDismiss, className }: ToastHostProps) {
  useEffect(() => {
    const timers = new Map<string, ReturnType<typeof setTimeout>>();
    for (const item of items) {
      if (!item.persistent) {
        timers.set(
          item.id,
          setTimeout(() => onDismiss(item.id), 5000),
        );
      }
    }
    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [items, onDismiss]);

  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex w-[min(28rem,100%-1rem)] flex-col gap-2",
        className,
      )}
      aria-live="polite"
      aria-label="Notifications"
    >
      {items.map((item) => {
        const Icon = IconForTone({ tone: item.tone });
        const isError = item.tone === "error";
        return (
          <div
            key={item.id}
            role={isError ? "alert" : "status"}
            className={cn(
              "overflow-hidden rounded-lg border border-border bg-surface-elevated shadow-md",
              "border-l-4",
              ToneBorder({ tone: item.tone }),
            )}
          >
            <div className="flex items-start gap-3 p-3">
              <Icon
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0",
                  item.tone === "success" && "text-success",
                  item.tone === "error" && "text-danger",
                  item.tone === "warning" && "text-warning",
                  item.tone === "info" && "text-info",
                )}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                {item.description && (
                  <p className="mt-0.5 text-[13px] text-muted-foreground">{item.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onDismiss(item.id)}
                aria-label="Dismiss notification"
                className="mt-0.5 h-6 w-6 rounded-md text-muted-foreground hover:bg-surface-muted hover:text-foreground"
              >
                <Info className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Primitives for with-toast hosts that want loading spinners inside toasts.
 * Not a separate component on screen; used when composing toasts for actions.
 */
export { TriangleAlert as ToastWarningIcon };
