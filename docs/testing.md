# Testing

Four layers. Each catches a class of bug the others cannot.

| Command | What it runs | Needs |
|---|---|---|
| `npm test` | Unit tests (~100 ms) | nothing |
| `npm run test:db` | Database integration tests | `DATABASE_URL` |
| `npm run test:e2e` | Browser end-to-end tests (~8 min) | `DATABASE_URL` + Chromium |
| `npm run typecheck` | `tsc` over app and tests | nothing |

## 1. Unit tests — `npm test`

Pure logic, no database, no session.

| File | Covers |
|---|---|
| `tests/pagination.test.ts` | `parsePage` clamps junk/negative/huge page numbers; `makePage` totals and next/prev flags |
| `tests/attachments.test.ts` | `validateAttachment` rejects empty, oversized, disallowed types, bad names |

These import `lib/attachments-config.ts` rather than the DAL, because the DAL is
`server-only` and needs a live session. That is why `validateAttachment` lives
in the config module: it is the server's enforcement point *and* unit-testable.

## 2. Database integration tests — `npm run test:db`

Runs against the real `DATABASE_URL` inside a transaction that is **rolled back**,
so it is safe against the demo database. Skips cleanly if `DATABASE_URL` is unset.

Protects: `HND-<n>` derivation, monotonic numbering, tenant scoping, internal-note
visibility, bytea round-trip, cascade delete, notification links, notification
scoping, stale-alert clearing, contact message lifecycle.

## 3. End-to-end tests — `npm run test:e2e`

Real Chromium driving the real app. This is the only layer that exercises server
actions, because they need a browser.

```
e2e/auth.spec.ts         sign-in, redirects, role gating, sign-out
e2e/tickets.spec.ts      create → reply → internal note → status change
e2e/attachments.spec.ts  upload, download, size limit, internal-note isolation
e2e/account.spec.ts      notifications, contact inbox, profile, password, deletion
e2e/console.spec.ts      no console errors, no nested anchors
```

### It uses its own database

`e2e/global-setup.ts` derives `<db>_e2e` from `DATABASE_URL`, drops and recreates
it, runs the real migrations, then the real seed. The demo database is never
touched. Override with `E2E_DATABASE_URL` if your provider forbids `CREATE DATABASE`.

### Two things to know before adding tests

- **`DISABLE_RATE_LIMIT=1` is set for the suite.** Tests sign in many times from
  one IP; the limiter is correct but would fail the run for the wrong reason.
  Never set this in production.
- **Give multi-step tests an explicit budget** (`test.setTimeout(...)`). The dev
  server cold-compiles each route, so a test that signs in twice and navigates
  twice can legitimately exceed the 90 s default.
- **Test isolation matters.** Rotating a seeded user's password or renaming them
  breaks every later test that signs in as that user. Tests that mutate identity
  sign up their own throwaway account.

## 4. Manual checks still worth running

```bash
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" localhost:3000/admin   # anon -> 307 /sign-in
```

## What is still not covered

- **No CI wiring.** These commands are not attached to a pipeline yet.
- **No visual regression testing.** Layout changes are not pixel-checked.
- **Email flows are untestable** until a provider exists; the reset link is
  logged to the server console instead (see below).

## Password reset (no email provider)

`sendResetPassword` in `lib/auth.ts` logs the link instead of sending it:

```
[auth] password reset for alex@brightpath.io: http://localhost:3000/api/auth/reset-password/<token>?callbackURL=%2Freset-password
```

Tokens are single-use and expire after one hour.
