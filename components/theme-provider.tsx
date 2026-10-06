"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  THEME_STORAGE_KEY,
  type ThemePreference,
} from "@/lib/theme-script";

/**
 * Self-contained replacement for `next-themes` (same behavior: class-based
 * themes, system preference, localStorage persistence, no flash on load,
 * disabled transitions on switch). The no-flash script itself is rendered by
 * the server layout (app/layout.tsx) — never from this client component, so
 * React 19.2's "script tag while rendering React component" error cannot occur.
 *
 * State is read via `useSyncExternalStore` (localStorage + media query are
 * external systems), avoiding setState-in-effect cascades entirely.
 */

const THEME_CHANGE_EVENT = "handly:theme-change";

interface ThemeContextValue {
  /** Selected preference: "light", "dark", or "system" (default). */
  theme: ThemePreference;
  /** The effective theme; equals `systemTheme` while preference is "system". */
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/* ------------------------------------------------------------------ */
/* External store: preference + system color scheme                    */
/* ------------------------------------------------------------------ */

let mediaQuery: MediaQueryList | null = null;

function getMedia(): MediaQueryList {
  mediaQuery ??= window.matchMedia("(prefers-color-scheme: dark)");
  return mediaQuery;
}

/** Re-render trigger: same-tab writes (custom event), other tabs, and OS changes. */
function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  const media = getMedia();
  media.addEventListener("change", onStoreChange);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
    media.removeEventListener("change", onStoreChange);
  };
}

function getThemeSnapshot(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // localStorage unavailable (private mode etc.) — fall back to system.
  }
  return "system";
}

const getServerThemeSnapshot = (): ThemePreference => "system";

function getSystemSnapshot(): "light" | "dark" {
  return getMedia().matches ? "dark" : "light";
}

const getServerSystemSnapshot = (): "light" | "dark" => "light";

/* ------------------------------------------------------------------ */
/* DOM application                                                     */
/* ------------------------------------------------------------------ */

function applyTheme(theme: ThemePreference, systemDark: boolean): void {
  const root = document.documentElement;
  const dark = theme === "system" ? systemDark : theme === "dark";
  root.classList.remove("light", "dark");
  root.classList.add(dark ? "dark" : "light");
  root.style.colorScheme = dark ? "dark" : "light";
}

/** Temporarily disables CSS transitions so theme switches don't animate. */
function withoutTransitions(apply: () => void): void {
  const style = document.createElement("style");
  style.appendChild(
    document.createTextNode("*,*::before,*::after{transition:none!important}"),
  );
  document.head.appendChild(style);
  apply();
  // Force a style flush, then remove the block after one frame.
  window.getComputedStyle(document.body);
  window.setTimeout(() => document.head.removeChild(style), 1);
}

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribe,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  const systemTheme = useSyncExternalStore(
    subscribe,
    getSystemSnapshot,
    getServerSystemSnapshot,
  );

  const resolvedTheme: "light" | "dark" =
    theme === "system" ? systemTheme : theme;

  // Keep the DOM class in sync with the stored preference and OS changes.
  // (DOM synchronization only — no setState here.)
  useEffect(() => {
    applyTheme(theme, getMedia().matches);
  }, [theme, systemTheme]);

  const setTheme = useCallback((next: ThemePreference) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Ignore persistence failures; the class is still applied.
    }
    withoutTransitions(() => applyTheme(next, getMedia().matches));
    // Notify same-tab subscribers (the `storage` event only fires cross-tab).
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within <ThemeProvider>");
  }
  return ctx;
}
