# Handly Design System

Design system for **Handly**, a Customer Support & Ticket Management app.
Stack: Next.js 16 (App Router), React, Tailwind CSS v4, `next-themes`, `lucide-react`.

---

## 1. Principles

1. **Calm under pressure.** Support teams work in high-volume, high-stress situations. The UI stays quiet so urgent items can stand out.
2. **Scannable first.** Agents scan queues all day. Status, priority, and age must be readable in under a second.
3. **Density with breathing room.** Compact tables and lists, but generous spacing around groups.
4. **Color means something.** Color is reserved for status, priority, and actions. Never decorative.
5. **Both themes are first class.** Every token and component is designed for light and dark at the same time.
6. **Accessible by default.** WCAG AA contrast, visible focus rings, full keyboard support, no color-only signals.

---

## 2. Color

### 2.1 Brand palette

Handly Indigo is the primary brand color. Amber is a warm accent used sparingly (highlights, onboarding, "new" badges).

| Token                | Light     | Dark      | Use                                               |
| -------------------- | --------- | --------- | ------------------------------------------------- |
| `primary`            | `#4F46E5` | `#818CF8` | Primary buttons, links, active nav, focus ring    |
| `primary-hover`      | `#4338CA` | `#A5B4FC` | Hover state for primary                           |
| `primary-active`     | `#3730A3` | `#C7D2FE` | Pressed state                                     |
| `primary-foreground` | `#FFFFFF` | `#0B0B12` | Text/icons on primary                             |
| `primary-subtle`     | `#EEF0FF` | `#1E1F4B` | Selected rows, soft badges, active nav background |
| `accent`             | `#F59E0B` | `#FBBF24` | Highlights, "new", onboarding callouts            |
| `accent-foreground`  | `#1F1300` | `#1F1300` | Text on accent                                    |

### 2.2 Neutrals (surfaces, text, borders)

| Token               | Light     | Dark      | Use                                                   |
| ------------------- | --------- | --------- | ----------------------------------------------------- |
| `background`        | `#FAFAFB` | `#0B0B12` | App canvas                                            |
| `surface`           | `#FFFFFF` | `#13131D` | Cards, panels, tables                                 |
| `surface-elevated`  | `#FFFFFF` | `#1B1B28` | Popovers, dropdowns, modals                           |
| `surface-muted`     | `#F3F3F6` | `#171722` | Table headers, input fills, code blocks               |
| `border`            | `#E4E4EA` | `#2A2A3A` | Default borders, dividers                             |
| `border-strong`     | `#CFCFD8` | `#3B3B50` | Inputs, emphasized dividers                           |
| `foreground`        | `#14141F` | `#F2F2F7` | Primary text                                          |
| `muted-foreground`  | `#5B5B6E` | `#9A9AB0` | Secondary text, captions, placeholders                |
| `subtle-foreground` | `#8A8A9C` | `#6E6E85` | Disabled text, tertiary meta (not for essential info) |

### 2.3 Semantic colors

| Token            | Light     | Dark      | Use                                               |
| ---------------- | --------- | --------- | ------------------------------------------------- |
| `success`        | `#059669` | `#34D399` | Resolved, positive confirmations                  |
| `success-subtle` | `#E6F7F0` | `#0C2A21` | Success backgrounds                               |
| `warning`        | `#D97706` | `#FBBF24` | Pending, approaching SLA                          |
| `warning-subtle` | `#FEF3E2` | `#2E2008` | Warning backgrounds                               |
| `danger`         | `#E11D48` | `#FB7185` | Errors, urgent, SLA breached, destructive actions |
| `danger-subtle`  | `#FFE8EE` | `#33121B` | Danger backgrounds                                |
| `info`           | `#0284C7` | `#38BDF8` | Open/new tickets, informational notices           |
| `info-subtle`    | `#E4F4FC` | `#0A2535` | Info backgrounds                                  |

### 2.4 Ticket status colors

Always pair color with a label and an icon.

| Status                        | Token             | Light     | Dark      | Icon (lucide)  |
| ----------------------------- | ----------------- | --------- | --------- | -------------- |
| Open                          | `status-open`     | `#0284C7` | `#38BDF8` | `CircleDot`    |
| In progress                   | `status-progress` | `#7C3AED` | `#A78BFA` | `Loader`       |
| Pending (waiting on customer) | `status-pending`  | `#D97706` | `#FBBF24` | `Clock`        |
| On hold                       | `status-hold`     | `#64748B` | `#94A3B8` | `PauseCircle`  |
| Resolved                      | `status-resolved` | `#059669` | `#34D399` | `CheckCircle2` |
| Closed                        | `status-closed`   | `#6B7280` | `#9CA3AF` | `Archive`      |

### 2.5 Priority colors

| Priority | Token             | Light     | Dark      | Icon (lucide)     |
| -------- | ----------------- | --------- | --------- | ----------------- |
| Urgent   | `priority-urgent` | `#E11D48` | `#FB7185` | `AlertOctagon`    |
| High     | `priority-high`   | `#EA580C` | `#FB923C` | `ArrowUpCircle`   |
| Medium   | `priority-medium` | `#D97706` | `#FBBF24` | `MinusCircle`     |
| Low      | `priority-low`    | `#64748B` | `#94A3B8` | `ArrowDownCircle` |

### 2.6 SLA indicator

| State    | Color                   | Rule                                |
| -------- | ----------------------- | ----------------------------------- |
| On track | `success`               | More than 50% of SLA time remaining |
| At risk  | `warning`               | Less than 50% remaining             |
| Critical | `danger`                | Less than 15% remaining             |
| Breached | `danger` + filled badge | Time exceeded                       |

### 2.7 Contrast rules

- Body text on any surface: minimum 4.5:1.
- Large text (18px+ or 14px bold) and UI components: minimum 3:1.
- Never rely on color alone. Status and priority always include a text label or icon.
- Run every final token pair through a contrast checker before shipping. The values above are strong starting points, not a substitute for testing.

---

## 3. Theme implementation (Tailwind CSS v4)

### 3.1 Install

```bash
npm install next-themes lucide-react
```

### 3.2 `app/globals.css`

```css
@import "tailwindcss";

/* Class-based dark mode: <html class="dark"> */
@custom-variant dark (&:where(.dark, .dark *));

:root {
  /* Brand */
  --primary: #4f46e5;
  --primary-hover: #4338ca;
  --primary-active: #3730a3;
  --primary-foreground: #ffffff;
  --primary-subtle: #eef0ff;
  --accent: #f59e0b;
  --accent-foreground: #1f1300;

  /* Neutrals */
  --background: #fafafb;
  --surface: #ffffff;
  --surface-elevated: #ffffff;
  --surface-muted: #f3f3f6;
  --border: #e4e4ea;
  --border-strong: #cfcfd8;
  --foreground: #14141f;
  --muted-foreground: #5b5b6e;
  --subtle-foreground: #8a8a9c;

  /* Semantic */
  --success: #059669;
  --success-subtle: #e6f7f0;
  --warning: #d97706;
  --warning-subtle: #fef3e2;
  --danger: #e11d48;
  --danger-subtle: #ffe8ee;
  --info: #0284c7;
  --info-subtle: #e4f4fc;

  /* Ticket status */
  --status-open: #0284c7;
  --status-progress: #7c3aed;
  --status-pending: #d97706;
  --status-hold: #64748b;
  --status-resolved: #059669;
  --status-closed: #6b7280;

  /* Priority */
  --priority-urgent: #e11d48;
  --priority-high: #ea580c;
  --priority-medium: #d97706;
  --priority-low: #64748b;

  /* Focus */
  --ring: #4f46e5;

  /* Shape */
  --radius: 0.5rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgb(20 20 31 / 0.06);
  --shadow-md: 0 4px 12px rgb(20 20 31 / 0.08);
  --shadow-lg: 0 12px 32px rgb(20 20 31 / 0.12);
}

.dark {
  --primary: #818cf8;
  --primary-hover: #a5b4fc;
  --primary-active: #c7d2fe;
  --primary-foreground: #0b0b12;
  --primary-subtle: #1e1f4b;
  --accent: #fbbf24;
  --accent-foreground: #1f1300;

  --background: #0b0b12;
  --surface: #13131d;
  --surface-elevated: #1b1b28;
  --surface-muted: #171722;
  --border: #2a2a3a;
  --border-strong: #3b3b50;
  --foreground: #f2f2f7;
  --muted-foreground: #9a9ab0;
  --subtle-foreground: #6e6e85;

  --success: #34d399;
  --success-subtle: #0c2a21;
  --warning: #fbbf24;
  --warning-subtle: #2e2008;
  --danger: #fb7185;
  --danger-subtle: #33121b;
  --info: #38bdf8;
  --info-subtle: #0a2535;

  --status-open: #38bdf8;
  --status-progress: #a78bfa;
  --status-pending: #fbbf24;
  --status-hold: #94a3b8;
  --status-resolved: #34d399;
  --status-closed: #9ca3af;

  --priority-urgent: #fb7185;
  --priority-high: #fb923c;
  --priority-medium: #fbbf24;
  --priority-low: #94a3b8;

  --ring: #818cf8;

  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.4);
  --shadow-md: 0 4px 12px rgb(0 0 0 / 0.5);
  --shadow-lg: 0 12px 32px rgb(0 0 0 / 0.6);
}

/* Expose tokens as Tailwind utilities: bg-surface, text-muted-foreground, etc. */
@theme inline {
  --color-primary: var(--primary);
  --color-primary-hover: var(--primary-hover);
  --color-primary-active: var(--primary-active);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary-subtle: var(--primary-subtle);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);

  --color-background: var(--background);
  --color-surface: var(--surface);
  --color-surface-elevated: var(--surface-elevated);
  --color-surface-muted: var(--surface-muted);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-foreground: var(--foreground);
  --color-muted-foreground: var(--muted-foreground);
  --color-subtle-foreground: var(--subtle-foreground);

  --color-success: var(--success);
  --color-success-subtle: var(--success-subtle);
  --color-warning: var(--warning);
  --color-warning-subtle: var(--warning-subtle);
  --color-danger: var(--danger);
  --color-danger-subtle: var(--danger-subtle);
  --color-info: var(--info);
  --color-info-subtle: var(--info-subtle);

  --color-status-open: var(--status-open);
  --color-status-progress: var(--status-progress);
  --color-status-pending: var(--status-pending);
  --color-status-hold: var(--status-hold);
  --color-status-resolved: var(--status-resolved);
  --color-status-closed: var(--status-closed);

  --color-priority-urgent: var(--priority-urgent);
  --color-priority-high: var(--priority-high);
  --color-priority-medium: var(--priority-medium);
  --color-priority-low: var(--priority-low);

  --color-ring: var(--ring);

  --radius-sm: calc(var(--radius) - 2px);
  --radius-md: var(--radius);
  --radius-lg: calc(var(--radius) + 2px);
  --radius-xl: calc(var(--radius) + 6px);

  --shadow-sm: var(--shadow-sm);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);

  --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, monospace;
}

@layer base {
  * {
    border-color: var(--border);
  }
  body {
    background: var(--background);
    color: var(--foreground);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }
  :focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
}
```

### 3.3 `components/theme-provider.tsx`

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
```

### 3.4 `app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Handly",
  description: "Customer support and ticket management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

### 3.5 Theme toggle

```tsx
"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const next =
    theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

  return (
    <button
      onClick={() => setTheme(next)}
      aria-label={`Theme: ${theme}. Switch to ${next}`}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground hover:bg-surface-muted hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
```

> If you are on Tailwind v3 instead of v4, move the token mapping into `tailwind.config.ts` under `theme.extend.colors` using `var(--token)` values and set `darkMode: "class"`.

---

## 4. Typography

**Fonts:** Geist Sans for UI, Geist Mono for ticket IDs, code, and timestamps.

| Style      | Size / Line height | Weight | Tailwind                                | Use                                    |
| ---------- | ------------------ | ------ | --------------------------------------- | -------------------------------------- |
| Display    | 36 / 44            | 700    | `text-4xl font-bold tracking-tight`     | Marketing, empty states                |
| H1         | 30 / 38            | 650    | `text-3xl font-semibold tracking-tight` | Page titles                            |
| H2         | 24 / 32            | 600    | `text-2xl font-semibold tracking-tight` | Section titles                         |
| H3         | 18 / 28            | 600    | `text-lg font-semibold`                 | Card titles, panel headings            |
| Body       | 14 / 22            | 400    | `text-sm`                               | Default UI text                        |
| Body large | 16 / 24            | 400    | `text-base`                             | Ticket conversation, long-form reading |
| Small      | 13 / 18            | 400    | `text-[13px]`                           | Table meta, helper text                |
| Caption    | 12 / 16            | 500    | `text-xs font-medium`                   | Badges, labels, timestamps             |
| Mono       | 13 / 18            | 500    | `font-mono text-[13px]`                 | Ticket IDs (`HND-1042`), code          |

Rules:

- Default UI text is **14px**. Customer messages in a ticket thread use **16px** for comfortable reading.
- Use `tabular-nums` on counts, SLA timers, and table numbers.
- Max line length for message content: 70 to 80 characters (`max-w-prose`).

---

## 5. Spacing, layout, and shape

### 5.1 Spacing scale (4px base)

`1 = 4px`, `2 = 8px`, `3 = 12px`, `4 = 16px`, `5 = 20px`, `6 = 24px`, `8 = 32px`, `10 = 40px`, `12 = 48px`, `16 = 64px`.

| Context                     | Value                                            |
| --------------------------- | ------------------------------------------------ |
| Inline gap (icon and label) | `gap-2`                                          |
| Form field gap              | `gap-4`                                          |
| Card padding                | `p-4` (compact) or `p-6` (default)               |
| Table cell padding          | `px-4 py-3` (comfortable), `px-3 py-2` (compact) |
| Section gap                 | `gap-6` to `gap-8`                               |
| Page padding                | `px-4 md:px-6 lg:px-8`                           |

### 5.2 Radius

| Token          | Value  | Use                         |
| -------------- | ------ | --------------------------- |
| `rounded-sm`   | 6px    | Badges, small chips         |
| `rounded-md`   | 8px    | Buttons, inputs, selects    |
| `rounded-lg`   | 10px   | Cards, panels               |
| `rounded-xl`   | 14px   | Modals, large containers    |
| `rounded-full` | 9999px | Avatars, status dots, pills |

### 5.3 Elevation

| Level | Token           | Use                           |
| ----- | --------------- | ----------------------------- |
| 0     | none + `border` | Cards in lists and tables     |
| 1     | `shadow-sm`     | Raised cards, sticky headers  |
| 2     | `shadow-md`     | Dropdowns, popovers, tooltips |
| 3     | `shadow-lg`     | Modals, command palette       |

In dark mode, rely more on surface color steps (`surface` to `surface-elevated`) and borders than on shadows.

### 5.4 App layout

```
+--------------------------------------------------------------+
| Topbar (h-14): search, create ticket, theme, notifications, user |
+-----------+------------------------------+-------------------+
| Sidebar   | Main content                 | Detail panel      |
| w-60      | queue / list / dashboard     | w-96 (optional)   |
| (w-16     |                              | ticket details,   |
| collapsed)|                              | customer info     |
+-----------+------------------------------+-------------------+
```

- Sidebar: `bg-surface`, `border-r`, collapses to icon rail under `lg`.
- Ticket view: conversation thread in the center, customer and ticket properties in the right panel.
- Breakpoints follow Tailwind defaults: `sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`.
- Mobile: sidebar becomes a slide-over drawer, detail panel becomes a full-screen sheet.

---

## 6. Iconography

- Library: **lucide-react**.
- Sizes: `h-4 w-4` (inline, buttons), `h-5 w-5` (nav, headers), `h-6 w-6` (empty states).
- Stroke width: default (2). Do not mix icon libraries.
- Icon-only buttons must have an `aria-label`.

---

## 7. Components

### 7.1 Button

| Variant   | Classes                                                                              |
| --------- | ------------------------------------------------------------------------------------ |
| Primary   | `bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active` |
| Secondary | `bg-surface text-foreground border border-border-strong hover:bg-surface-muted`      |
| Ghost     | `text-muted-foreground hover:bg-surface-muted hover:text-foreground`                 |
| Danger    | `bg-danger text-white hover:opacity-90`                                              |
| Link      | `text-primary hover:underline underline-offset-4`                                    |

| Size         | Classes                          |
| ------------ | -------------------------------- |
| sm           | `h-8 px-3 text-sm rounded-md`    |
| md (default) | `h-9 px-4 text-sm rounded-md`    |
| lg           | `h-11 px-5 text-base rounded-md` |

Base: `inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none`.
Loading state: replace the leading icon with a spinner and keep the label.
One primary button per view region.

### 7.2 Input, textarea, select

```
h-9 w-full rounded-md border border-border-strong bg-surface px-3 text-sm
placeholder:text-muted-foreground
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary
disabled:bg-surface-muted disabled:text-subtle-foreground
aria-[invalid=true]:border-danger
```

- Labels sit above fields (`text-sm font-medium`), helper text below (`text-[13px] text-muted-foreground`).
- Error text uses `text-danger` with an `AlertCircle` icon, never color alone.
- The reply composer uses a textarea with a toolbar (formatting, attach, canned responses, internal note toggle).

### 7.3 Badge

Base: `inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium`.

Soft badges use the semantic color at low opacity over the matching subtle background. Example for status:

```tsx
const statusStyles = {
  open: "text-status-open bg-info-subtle",
  in_progress: "text-status-progress bg-primary-subtle",
  pending: "text-status-pending bg-warning-subtle",
  on_hold: "text-status-hold bg-surface-muted",
  resolved: "text-status-resolved bg-success-subtle",
  closed: "text-status-closed bg-surface-muted",
} as const;
```

Always render: dot or icon + label (`Open`, `In progress`, `Pending`, `On hold`, `Resolved`, `Closed`).

### 7.4 Card

`rounded-lg border border-border bg-surface shadow-sm` with `p-4` or `p-6`.
Interactive cards add `hover:border-border-strong hover:shadow-md transition`.

### 7.5 Ticket row (queue list)

| Element   | Style                                                                             |
| --------- | --------------------------------------------------------------------------------- |
| Container | `flex items-center gap-4 px-4 py-3 border-b border-border hover:bg-surface-muted` |
| Selected  | `bg-primary-subtle` with a 2px left border in `primary`                           |
| Unread    | Subject in `font-semibold`, small `primary` dot at the left                       |
| Ticket ID | `font-mono text-[13px] text-muted-foreground`                                     |
| Subject   | `text-sm font-medium text-foreground truncate`                                    |
| Preview   | `text-[13px] text-muted-foreground truncate`                                      |
| Meta      | Status badge, priority icon, assignee avatar, relative time, SLA timer            |

Row order of importance: priority, subject, status, SLA, assignee, time.

### 7.6 Data table

- Header: `bg-surface-muted text-xs font-medium uppercase tracking-wide text-muted-foreground`.
- Rows: `border-b border-border`, hover `bg-surface-muted`.
- Sticky header on scroll, sortable columns show a chevron icon.
- Bulk actions bar appears on selection (assign, change status, merge, close).
- Provide a compact density toggle.

### 7.7 Conversation thread

| Message type     | Style                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| Customer message | `bg-surface border border-border rounded-lg`, avatar left                                                    |
| Agent reply      | `bg-primary-subtle border border-transparent rounded-lg`                                                     |
| Internal note    | `bg-warning-subtle border border-dashed border-warning/40`, with a `Lock` icon and the label "Internal note" |
| System event     | Centered, `text-xs text-muted-foreground` with a thin divider (for example, "Status changed to Pending")     |

Internal notes must be unmistakable. Never rely on color alone, always include the label and icon.

### 7.8 Sidebar navigation

- Item: `h-9 px-3 rounded-md text-sm text-muted-foreground hover:bg-surface-muted hover:text-foreground`.
- Active: `bg-primary-subtle text-primary font-medium`.
- Show count pills for queues (`Unassigned`, `My tickets`, `Overdue`). Overdue count uses `danger`.
- Suggested sections: Inbox, My tickets, Unassigned, All tickets, Customers, Knowledge base, Reports, Settings.

### 7.9 Avatar

Sizes `h-6`, `h-8`, `h-10`. Fallback initials on `primary-subtle` with `text-primary`. Customers use a neutral fill (`surface-muted`). Presence dot: `success` (online), `warning` (away), `subtle-foreground` (offline), with a 2px `surface` ring.

### 7.10 Modal, drawer, popover

- Overlay: `bg-black/50` (light) and `bg-black/70` (dark).
- Panel: `bg-surface-elevated rounded-xl shadow-lg border border-border`.
- Trap focus, close on `Esc`, return focus to the trigger.
- Destructive confirmations use a danger button and explicit wording ("Delete ticket", not "OK").

### 7.11 Toast

Bottom-right, `bg-surface-elevated border border-border shadow-md rounded-lg`, with a leading semantic icon. Auto-dismiss in 5s, errors persist until dismissed. Use `aria-live="polite"` (`assertive` for errors).

### 7.12 Empty, loading, and error states

- **Empty:** icon (`h-6 w-6`, muted), H3 title, one line of help text, one primary action. Example: "No tickets in this queue. New tickets will show up here."
- **Loading:** skeletons (`bg-surface-muted animate-pulse rounded-md`) that match the final layout. No full-page spinners.
- **Error:** `danger-subtle` banner with a clear message and a retry action.

### 7.13 Tabs, filters, and search

- Tabs: underline style, active `text-foreground` with a 2px `primary` bottom border.
- Filter chips: `rounded-full border border-border-strong`, active `bg-primary-subtle border-primary text-primary`.
- Global search and command palette: `Cmd/Ctrl + K`.

---

## 8. Motion

| Token | Value                                  | Use                        |
| ----- | -------------------------------------- | -------------------------- |
| Fast  | 100 to 150ms, `ease-out`               | Hover, focus, button press |
| Base  | 200ms, `ease-out`                      | Dropdowns, tabs, toggles   |
| Slow  | 300ms, `cubic-bezier(0.16, 1, 0.3, 1)` | Drawers, modals            |

- Animate opacity and transform only. Avoid animating layout properties.
- Respect reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. Accessibility checklist

- [ ] Text contrast meets 4.5:1, UI components meet 3:1, in both themes.
- [ ] Every interactive element has a visible `:focus-visible` ring.
- [ ] Full keyboard navigation for queue, ticket actions, modals, and menus.
- [ ] Status, priority, and SLA are never conveyed by color alone.
- [ ] Icon-only buttons have `aria-label`.
- [ ] Forms have associated labels and `aria-describedby` for errors.
- [ ] Live regions for new tickets, toasts, and real-time updates.
- [ ] Touch targets are at least 40x40px on mobile.
- [ ] Layout works at 200% zoom and 320px width.

---

## 10. Content and tone

- Voice: clear, warm, and efficient. Support staff are busy, customers are often frustrated.
- Buttons use verbs: "Create ticket", "Assign to me", "Send reply", "Mark as resolved".
- Errors say what happened and what to do next. No blame, no jargon.
- Use sentence case everywhere (not Title Case), except product names.
- Dates: relative for recent ("5 min ago"), absolute on hover and for items older than 7 days.
- Ticket ID format: `HND-1042`.

---

## 11. Do and don't

**Do**

- Use semantic tokens (`bg-surface`, `text-muted-foreground`) so both themes work automatically.
- Keep one primary action per screen region.
- Reserve `danger` for destructive or urgent states only.
- Test every new component in light and dark before merging.

**Don't**

- Hardcode hex values or Tailwind palette colors (`bg-slate-900`) in components.
- Use `dark:` overrides for colors already covered by tokens.
- Use pure `#000` backgrounds or pure `#FFF` text in dark mode.
- Stack more than three badge colors in one row.
- Use amber accent for large surfaces, it is a highlight color.

---

## 12. File structure suggestion

```
app/
  globals.css            # tokens + theme
  layout.tsx
components/
  theme-provider.tsx
  theme-toggle.tsx
  ui/                    # button, input, badge, card, avatar, dialog, toast, tabs
  tickets/               # ticket-row, ticket-thread, status-badge, priority-icon, sla-timer
  layout/                # sidebar, topbar, detail-panel
lib/
  cn.ts                  # clsx + tailwind-merge helper
  ticket-config.ts       # status and priority maps (labels, icons, token names)
designsystem.md
```

---

## 13. Changelog

| Version | Date       | Notes                                                                 |
| ------- | ---------- | --------------------------------------------------------------------- |
| 0.1.0   | 2026-10-05 | Initial design system: tokens, light and dark themes, core components |
