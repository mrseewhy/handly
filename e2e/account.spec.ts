import { expect, test } from "@playwright/test";
import { createTicket, signIn, signOut, stamp } from "./helpers";

/**
 * Notifications, contact messages and profile settings — the surfaces added
 * most recently and therefore the least exercised by hand.
 */

test.describe("notifications", () => {
  test("an admin is told about a new ticket and can open it from the list", async ({ page }) => {
    // Signs in twice and creates a ticket; the dev server compiles routes on
    // first hit, so this needs more than the default budget.
    test.setTimeout(180_000);
    const subject = `Notify me ${stamp()}`;
    await signIn(page, "alex");
    const id = await createTicket(page, {
      subject,
      description: "This should generate a notification for the support team.",
    });

    await signOut(page);
    await signIn(page, "admin");
    await page.goto("/admin/notifications");

    const item = page.getByRole("link", { name: new RegExp(id) }).first();
    await expect(item).toBeVisible();

    // Links from the admin list must stay inside /admin, never /dashboard.
    const href = await item.getAttribute("href");
    expect(href).toMatch(/^\/admin\/tickets\//);
  });

  test("clicking a notification marks it read and drops the unread count", async ({ page }) => {
    test.setTimeout(180_000);
    // Create the notification in this run: relying on seed rows makes the test
    // fail on the second run, once they are already read.
    const subject = `Unread probe ${stamp()}`;
    await signIn(page, "alex");
    await createTicket(page, {
      subject,
      description: "This ticket exists only to generate an admin notification.",
    });
    await signOut(page);
    await signIn(page, "admin");

    const unreadCount = async () => {
      await page.goto("/admin/notifications");
      const label =
        (await page.getByRole("button", { name: /Notifications/ }).getAttribute("aria-label")) ??
        "";
      return Number(/\((\d+) unread\)/.exec(label)?.[1] ?? 0);
    };

    const before = await unreadCount();
    expect(before).toBeGreaterThan(0);

    // Target an *unread* row: the first link in the list may already be read,
    // in which case clicking it changes nothing and the assertion is meaningless.
    await page.locator("li a.bg-primary-subtle\\/40").first().click();
    await page.waitForURL(/\/admin\/tickets\//, { timeout: 60_000 });

    expect(await unreadCount()).toBeLessThan(before);
  });

  test("the dropdown offers a link to the full list", async ({ page }) => {
    await signIn(page, "admin");
    await page.getByRole("button", { name: /Notifications/ }).click();

    const viewAll = page.getByRole("link", { name: /view all notifications/i });
    await expect(viewAll).toBeVisible();
    await expect(viewAll).toHaveAttribute("href", "/admin/notifications");
  });
});

test.describe("contact messages", () => {
  test("a submitted message appears in the admin inbox and can be handled", async ({ page }) => {
    const unique = `E2E message ${stamp()}`;

    await page.goto("/contact");
    await page.getByLabel(/name/i).fill("E2E Sender");
    await page.getByLabel(/email/i).fill("e2e-sender@example.com");
    await page.getByLabel(/topic/i).selectOption({ index: 1 }).catch(() => {});
    await page.getByLabel(/message/i).fill(
      `${unique} — this is an automated end-to-end probe of the contact form.`,
    );
    await page.getByRole("button", { name: /send|submit/i }).click();

    await expect(page.getByText(/thank|received|sent/i).first()).toBeVisible({
      timeout: 20_000,
    });

    await signIn(page, "admin");
    await page.goto("/admin/messages");
    await expect(page.getByText(unique)).toBeVisible();

    // Marking handled should persist across a reload.
    const row = page.locator("li", { hasText: unique });
    await row.getByRole("button", { name: /mark handled/i }).click();
    await page.reload();
    await expect(page.locator("li", { hasText: unique })).toContainText(/handled/i);
  });
});

test.describe("profile & settings", () => {
  test("a user can change their name and it persists", async ({ page }) => {
    // Own account: renaming a seeded user leaks into other tests' expectations.
    const email = `rename-${stamp()}@example.com`;
    const name = `Renamed Person ${stamp()}`;

    await page.goto("/sign-up");
    await page.locator("#signup-name").fill("Original Name");
    await page.locator("#signup-email").fill(email);
    await page.locator("#signup-password").fill("original-password-123");
    await page.getByRole("button", { name: /create account/i }).click();
    await page.waitForURL((url) => !url.pathname.startsWith("/sign-up"), { timeout: 20_000 });

    await page.goto("/dashboard/settings");

    const field = page.locator("#settings-name, input[name='fullName']").first();
    await field.fill(name);
    await page.getByRole("button", { name: /save/i }).first().click();
    await expect(page.getByText(/profile saved/i)).toBeVisible({ timeout: 20_000 });

    await page.reload();
    await expect(page.locator("#settings-name, input[name='fullName']").first()).toHaveValue(name);
  });

  test("a wrong current password is refused", async ({ page }) => {
    await signIn(page, "alex");
    await page.goto("/dashboard/settings");

    await page.locator("#settings-current").fill("not-the-right-password");
    await page.locator("#settings-new").fill("brand-new-password-123");
    await page.getByRole("button", { name: /update password/i }).click();

    const error = page.locator('p[role="alert"]');
    await expect(error).toBeVisible({ timeout: 20_000 });
    await expect(error).toContainText(/not correct|invalid|password/i);
  });

  test("changing the password works and the new one signs in", async ({ page }) => {
    // A throwaway account, not a seeded one: rotating a shared user's password
    // would break every later test that signs in as them.
    const email = `pw-rotate-${stamp()}@example.com`;
    const original = "original-password-123";
    const next = `rotated-${stamp()}`;

    await page.goto("/sign-up");
    await page.locator("#signup-name").fill("Password Rotator");
    await page.locator("#signup-email").fill(email);
    await page.locator("#signup-password").fill(original);
    await page.getByRole("button", { name: /create account|sign up/i }).click();
    await page.waitForURL((url) => !url.pathname.startsWith("/sign-up"), { timeout: 20_000 });

    await page.goto("/dashboard/settings");
    await page.locator("#settings-current").fill(original);
    await page.locator("#settings-new").fill(next);
    await page.getByRole("button", { name: /update password/i }).click();
    await expect(page.getByText(/password updated/i)).toBeVisible({ timeout: 20_000 });

    await signOut(page);

    await page.goto("/sign-in");
    await page.locator("#signin-email").fill(email);
    await page.locator("#signin-password").fill(next);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 });
  });

  test("an admin has a profile page of their own", async ({ page }) => {
    await signIn(page, "admin");
    await page.goto("/admin/profile");

    await expect(page.locator("#settings-current")).toBeVisible();
    await expect(page.getByRole("button", { name: /update password/i })).toBeVisible();
  });

  // Uses its own account so a password rotated by the previous test cannot
  // make this one fail for an unrelated reason.
  test("deleting an account that owns tickets is refused", async ({ page }) => {
    await signIn(page, "dana");
    await page.goto("/dashboard/settings");

    await page.getByRole("button", { name: /^delete account$/i }).click();
    await page.locator("#delete-password").fill("handly-demo-2026");
    await page.getByRole("button", { name: /permanently delete/i }).click();

    // Alex owns seeded tickets, so the guard must refuse rather than cascade.
    await expect(page.locator('p[role="alert"]')).toContainText(
      /still own|still have|cannot delete/i,
      { timeout: 20_000 },
    );
    await expect(page).toHaveURL(/\/dashboard\/settings/);
  });
});
