import { expect, type Page } from "@playwright/test";

/**
 * Shared helpers for the E2E suite.
 *
 * Signing in through the real form is deliberate: it is the path a user takes,
 * and it proves the session cookie the rest of each test depends on.
 */

export const USERS = {
  admin: { email: "admin@handly.app", password: "handly-demo-2026" },
  alex: { email: "alex@brightpath.io", password: "handly-demo-2026" },
  dana: { email: "dana@northwind.co", password: "handly-demo-2026" },
} as const;

/** Signs in via the UI and waits until the destination renders. */
export async function signIn(page: Page, who: keyof typeof USERS) {
  await page.goto("/sign-in");
  // By id, not label: the "Show password" toggle also matches /Password/.
  await page.locator("#signin-email").fill(USERS[who].email);
  await page.locator("#signin-password").fill(USERS[who].password);
  await page.getByRole("button", { name: /sign in/i }).click();
  // Sign-in redirects out of the auth layout. The dev server cold-compiles
  // routes, so the first sign-in of a run can take considerably longer.
  await page.waitForURL((url) => !url.pathname.startsWith("/sign-in"), {
    timeout: 60_000,
  });
}

/**
 * Signs out through the real form.
 *
 * `context.clearCookies()` is not enough: the app holds the session in client
 * state, so the next sign-in raced and the previous user stayed active.
 */
export async function signOut(page: Page) {
  // Find whichever shell this user has. Visiting /admin as a customer lands on
  // /dashboard, which is fine: the button lives in both shells.
  const button = page.getByRole("button", { name: /sign out/i });

  for (const path of ["/dashboard", "/admin"]) {
    await page.goto(path);
    if ((await button.count()) > 0) break;
  }

  if ((await button.count()) === 0) return; // already signed out

  await button.click();

  // The action redirects to /sign-in. Poll for the outcome rather than pinning
  // one URL: a redirect chain can settle on "/" or an intermediate page.
  await expect
    .poll(async () => (await button.count()) === 0, { timeout: 60_000 })
    .toBe(true);

  await page.goto("/sign-in");
  await expect(page.locator("#signin-email")).toBeVisible({ timeout: 60_000 });
}

/**
 * Creates a ticket through the real form and returns its HND- id.
 * `description` must be at least 15 characters or client validation blocks submit.
 */
export async function createTicket(
  page: Page,
  opts: {
    subject: string;
    description: string;
    /** Required by the form's client validation. */
    category?: string;
    priority?: string;
  },
): Promise<string> {
  await page.goto("/dashboard/tickets/new");
  await page.getByLabel("Subject").fill(opts.subject);
  await page.getByLabel("Description").fill(opts.description);
  // Category is required: the form's `rules.choice` blocks submit without it.
  await page.getByLabel("Category").selectOption(opts.category ?? "other");
  if (opts.priority) await page.getByLabel("Priority").selectOption(opts.priority);
  await page.getByRole("button", { name: /submit ticket/i }).click();

  // The form does not navigate on success: it swaps itself for a confirmation
  // card showing the new id. Reading the id from the URL would always time out.
  await expect(page.getByText("Ticket created")).toBeVisible({ timeout: 60_000 });
  const shown = await page.getByText(/Your ticket is/).textContent();
  const id = /(HND-\d+)/.exec(shown ?? "")?.[1];
  if (!id) throw new Error(`no ticket id in confirmation: ${shown}`);
  return id;
}

/** Unique-ish suffix so repeated runs never collide on subject text. */
export function stamp(): string {
  return `${Date.now().toString(36)}${Math.floor(Math.random() * 1e3)}`;
}

export async function expectHeading(page: Page, name: string | RegExp) {
  await expect(page.getByRole("heading", { name, level: 1 })).toBeVisible();
}
