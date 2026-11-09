import { expect, test } from "@playwright/test";
import { createTicket, signIn, signOut, stamp } from "./helpers";

/**
 * Attachments are stored as bytes in Postgres and served through a route
 * handler that re-checks visibility. The security-relevant cases are here:
 * a customer must not be able to fetch a file attached to an internal note.
 */

test.describe("attachments", () => {
  test("a customer can attach a file and download it", async ({ page }) => {
    const subject = `With attachment ${stamp()}`;
    await signIn(page, "alex");
    await page.goto("/dashboard/tickets/new");

    await page.getByLabel("Subject").fill(subject);
    await page.getByLabel("Description").fill(
      "Here is a screenshot of the error we keep seeing on the invoice page.",
    );
    await page.getByLabel("Category").selectOption("bug");

    // Small text file so the test is fast and byte-exact.
    await page.locator('input[type="file"]').setInputFiles({
      name: "log.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("attachment-e2e-content"),
    });

    // Wait for the picker to register the file before submitting: the upload is
    // converted to bytes on submit, and clicking too early silently drops it.
    await expect(page.getByText(/log\.txt/).first()).toBeVisible();

    await page.getByRole("button", { name: /submit ticket/i }).click();
    await expect(page.getByText("Ticket created")).toBeVisible({ timeout: 20_000 });

    // Read the destination from the link rather than racing the client-side
    // navigation, then go there directly.
    const ticketHref = await page
      .getByRole("link", { name: /open ticket/i })
      .getAttribute("href");
    expect(ticketHref).toMatch(/^\/dashboard\/tickets\/HND-\d+$/);

    await page.goto(ticketHref!);
    const link = page.getByRole("link", { name: /log\.txt/i });
    await expect(link).toBeVisible({ timeout: 20_000 });

    const href = await link.getAttribute("href");
    expect(href).toMatch(/^\/api\/attachments\//);

    const response = await page.request.get(href!);
    expect(response.status()).toBe(200);
    expect(await response.text()).toBe("attachment-e2e-content");
    expect(response.headers()["content-disposition"]).toContain("attachment");
  });

  test("an oversized file is rejected before upload", async ({ page }) => {
    await signIn(page, "alex");
    await page.goto("/dashboard/tickets/new");

    // MAX_ATTACHMENT_BYTES is 10 MB; 11 MB must be refused client-side.
    await page.locator('input[type="file"]').setInputFiles({
      name: "huge.bin",
      mimeType: "application/octet-stream",
      buffer: Buffer.alloc(11 * 1024 * 1024),
    });

    await expect(page.getByText(/larger than|too large|10 MB/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  // One test, but each expensive step gets its own generous timeout budget:
  // the dev server cold-compiles each route, which pushed the total past 90s.
  test("a customer cannot download a file attached to an internal note", async ({ page }) => {
    test.setTimeout(180_000);

    const subject = `Staff-only file ${stamp()}`;
    const secretText = "Internal context for the team.";

    await signIn(page, "alex");
    const id = await createTicket(page, {
      subject,
      description: "Please look at the attached context for this account.",
    });

    await signOut(page);
    await signIn(page, "admin");
    await page.goto(`/admin/tickets/${id}`);

    await page.getByRole("checkbox", { name: /internal note/i }).check();
    await page.locator("#reply").fill(secretText);
    await page.locator('input[type="file"]').setInputFiles({
      name: "internal.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("staff-only-secret"),
    });
    await page.getByRole("button", { name: /add note/i }).click();

    await expect(page.getByText(secretText)).toBeVisible({ timeout: 45_000 });

    const adminLink = page.getByRole("link", { name: /internal\.txt/i });
    await expect(adminLink).toBeVisible({ timeout: 45_000 });
    const href = await adminLink.getAttribute("href");
    expect(href).toMatch(/^\/api\/attachments\//);

    const asAdmin = await page.request.get(href!);
    expect(asAdmin.status()).toBe(200);

    await signOut(page);
    await signIn(page, "alex");
    await page.goto(`/dashboard/tickets/${id}`);

    // The customer must not even see the link...
    await expect(page.getByRole("link", { name: /internal\.txt/i })).toHaveCount(0);

    // ...and fetching the URL directly must 404, not leak the bytes.
    const asCustomer = await page.request.get(href!);
    expect(asCustomer.status()).toBe(404);
    expect(await asCustomer.text()).not.toContain("staff-only-secret");
  });

  test("an anonymous visitor cannot fetch an attachment", async ({ page }) => {
    // Any id: the route must refuse before it looks at the row.
    const response = await page.request.get("/api/attachments/does-not-exist");
    expect(response.status()).toBe(404);
  });
});
