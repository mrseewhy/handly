# Frontend test and e2e plan

This plan is for work after routes are functional with a real backend and real
data. It is scoped to the UX polish and hardening work done so far, not to
backend integration itself.

## Scope

Priority areas:
- Navigation and active state: sidebar, breadcrumbs, header search affordance,
  mobile slide-over open/close.
- Destructive actions: suspend/restore user, remove admin, and future delete
  ticket/user paths.
- Feedback: confirm dialogs and toasts for success/error/warning.
- Accessibility: keyboard focus, focus trap in modals/slide-over, Esc close,
  focus return, labels, non-color signals.
- Error resilience: error boundary fallback renders instead of white screen.
- Public pages: auth flow pages, contact form affordances, marketing pages.

## Unit tests (future)
Tooling: keep it minimal until there is behavior worth testing.
- React component tests for:
  - `ConfirmDialog` open/close and confirm action.
  - `ToastProvider`/`useToast` emit and dismiss behavior.
  - `Breadcrumbs` active page semantics.
  - `UserActions` and `AdminRowActions` interaction path when wired.

## Component/interaction tests (future)
- Modal dialog focus trap, Esc close, and return focus to trigger.
- Dropdown behavior in theme toggle and notifications (pointer-out and Esc).
- Mobile sidebar: open from hamburger, close from overlay and close button,
  and body scroll lock while open.

## E2E tests (future)
Tooling suggestion: Playwright, because it covers navigation, keyboard, and
chrome-level accessibility well.

Smoke flows:
1. Public auth pages render and preserve branding + breadcrumb path.
2. Dashboard shell renders for user and admin roles with correct sidebar root
   and active navigation.
3. Ticket list filters and search input are keyboard operable.
4. Admin queue pages render with status/priority/SLA labels and icons.
5. Confirm dialog appears before any destructive action and the destructive
   button text matches the action label.
6. After a destructive action, a toast appears with the correct tone and message.
7. Error boundary fallback is reachable if a route component throws during render.

Accessibility checks in e2e:
- Focus moves into modals on open and returns to trigger on close.
- Tab order does not include disabled submit buttons as active targets.
- Icon-only buttons have accessible names.
- Live regions update for toasts and list result counts.

## Non-functional checks
- Run an accessibility scan (for example axe-core via Playwright or a separate
  audit) on:
  - Home
  - Sign in / sign up / forgot password
  - Admin dashboard
  - Admin all tickets and ticket detail
  - Admin users
- Verify both light and dark themes render without broken contrast on the same
  screens.
- Verify mobile sidebar behavior at `<lg` widths.

## How to run (once wired)
- Unit: whatever test runner the repo adopts; keep it colocated with components.
- E2E: run against a staging/dev build with a stable seeded dataset so queue
  counts and ticket states are predictable.
- Accessibility: run as part of the same suite as the smoke flows, plus a
  separate static page audit for marketing pages.

## Out of scope for now
- Backend API tests.
- Real authentication flows.
- Performance benchmarks, because there are no real images or data yet.
