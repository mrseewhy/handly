import { expect, test } from "@playwright/test";

/**
 * Guards against console-level regressions that assertions on text would miss.
 *
 * A hydration mismatch renders a page that looks fine but throws in the console
 * and silently re-renders client-side. That is exactly how a nested <a> inside
 * the logo <Link> shipped: every page "worked" while erroring on every load.
 */

const IGNORABLE = [
  /Download the React DevTools/i,
  /\[Fast Refresh\]/i,
  /nextjs-portal/i,
];

function isRealError(text: string): boolean {
  return !IGNORABLE.some((re) => re.test(text));
}

const PUBLIC_PATHS = ["/", "/sign-in", "/sign-up", "/pricing", "/contact", "/reset-password?token=x"];

test.describe("no console errors", () => {
  for (const path of PUBLIC_PATHS) {
    test(`public page ${path} loads cleanly`, async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error" && isRealError(msg.text())) errors.push(msg.text());
      });
      page.on("pageerror", (err) => {
        if (isRealError(err.message)) errors.push(`pageerror: ${err.message}`);
      });

      await page.goto(path, { waitUntil: "networkidle" });

      // Nested anchors are invalid HTML and the usual source of hydration errors.
      const nested = await page.locator("a a").count();
      expect(nested, "found an <a> nested inside another <a>").toBe(0);

      expect(errors, `console errors on ${path}:\n${errors.join("\n")}`).toEqual([]);
    });
  }

  test("authenticated pages load without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && isRealError(msg.text())) errors.push(msg.text());
    });
    page.on("pageerror", (err) => {
      if (isRealError(err.message)) errors.push(`pageerror: ${err.message}`);
    });

    await page.goto("/sign-in");
    await page.locator("#signin-email").fill("admin@handly.app");
    await page.locator("#signin-password").fill("handly-demo-2026");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/admin$/, { timeout: 20_000 });

    for (const path of ["/admin", "/admin/tickets", "/admin/messages", "/admin/notifications"]) {
      await page.goto(path, { waitUntil: "networkidle" });
      expect(await page.locator("a a").count(), `nested anchors on ${path}`).toBe(0);
    }

    expect(errors, `console errors:\n${errors.join("\n")}`).toEqual([]);
  });
});
