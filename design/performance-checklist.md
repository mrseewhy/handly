# Performance checklist

This is guidance for future work, not a benchmark of the current static site.

## Current state
- Most routes ship as static HTML with small client bundles for theme toggle,
  dialogs, toasts, and a few interactive widgets.
- There are no production images yet. When images are added, optimize before
  measuring.

## Images
- Use `next/image` for any product screenshots, avatars pulled from a service,
  and marketing images.
- Prefer `placeholder="blur"` only for above-the-fold hero imagery where a blur
  hash is available; otherwise leave it off to avoid extra payload.
- Set explicit `width` and `height` so layout does not shift.
- Use `sizes` that match the responsive layout; do not use `100vw` for images
  that only appear in constrained cards.
- Avoid lazy-loading above-the-fold images.

## Lists
- Ticket lists and admin tables are currently small; keep filtering state local
  and avoid re-rendering the entire page on filter change.
- If a list grows, prefer virtualization only after measuring a real slow case;
  do not add it preemptively.

## Measurement
- Run Lighthouse (or equivalent) against built static output and against a dev
  run with JS enabled.
- Measure Core Web Vitals only after the app has real navigation and images;
  static pages will already score well.
- Keep a before/after note whenever a component is made client-only.
