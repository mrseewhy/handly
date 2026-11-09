import { expect, test } from "@playwright/test";
import { USERS, signIn } from "./helpers";

/**
 * Authentication and authorization.
 *
 * The important guarantee is that authorization is enforced, not merely hidden:
 * every check here asserts on the URL the server actually sent the browser to.
 */

test.describe("authentication", () => {
  test("anonymous visitors are redirected away from private areas", async ({ page }) => {
    for (const path of ["/admin", "/dashboard", "/dashboard/settings", "/admin/users"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/sign-in/);
    }
  });

  test("an anonymous visitor is sent back to where they were going", async ({ page }) => {
    await page.goto("/dashboard/tickets");
    await expect(page).toHaveURL(/\/sign-in\?next=%2Fdashboard%2Ftickets/);

    await page.locator("#signin-email").fill(USERS.alex.email);
    await page.locator("#signin-password").fill(USERS.alex.password);
    await page.getByRole("button", { name: /sign in/i }).click();

    // The `next` param must be honoured, not dropped.
    await expect(page).toHaveURL(/\/dashboard\/tickets$/, { timeout: 20_000 });
  });

  test("wrong password is rejected and the form says so", async ({ page }) => {
    await page.goto("/sign-in");
    await page.locator("#signin-email").fill(USERS.alex.email);
    await page.locator("#signin-password").fill("definitely-not-the-password");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("admin signs in and lands on the admin area", async ({ page }) => {
    await signIn(page, "admin");
    // Straight to /admin, not via the customer dashboard.
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("customer signs in and lands on their dashboard", async ({ page }) => {
    await signIn(page, "alex");
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});

test.describe("role gating", () => {
  test("a customer is bounced from every admin route", async ({ page }) => {
    await signIn(page, "alex");

    for (const path of [
      "/admin",
      "/admin/tickets",
      "/admin/users",
      "/admin/admins",
      "/admin/messages",
      "/admin/activity",
      "/admin/notifications",
      "/admin/profile",
    ]) {
      await page.goto(path);
      await expect(page, `${path} must not be reachable by a customer`).toHaveURL(
        /\/dashboard/,
      );
    }
  });

  test("an admin sees admin navigation", async ({ page }) => {
    await signIn(page, "admin");
    const nav = page.getByRole("navigation").first();
    await expect(nav.getByRole("link", { name: "Unanswered" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "All tickets" })).toBeVisible();
  });

  test("a customer cannot read another customer's ticket", async ({ page }) => {
    // Alex's ticket id from the seed; Dana must not be able to open it.
    await signIn(page, "alex");
    await page.goto("/dashboard/tickets");
    const href = await page
      .getByRole("link", { name: /HND-\d+/ })
      .first()
      .getAttribute("href");
    expect(href).toBeTruthy();

    await page.context().clearCookies();
    await signIn(page, "dana");
    const response = await page.goto(href!);

    // Not found, rather than a peek at someone else's data.
    expect(response?.status()).toBe(404);
  });
});

test.describe("sign out", () => {
  test("signing out ends the session", async ({ page }) => {
    await signIn(page, "alex");
    await page.goto("/dashboard");

    await page.getByRole("button", { name: /sign out/i }).click();
    await page.waitForURL((url) => !url.pathname.startsWith("/dashboard"), {
      timeout: 20_000,
    });

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/sign-in/);
  });
});
