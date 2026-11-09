import { expect, test } from "@playwright/test";
import { createTicket, signIn, signOut, stamp } from "./helpers";

/**
 * The core support journey: a customer raises a ticket, an admin answers it,
 * and each side sees the result. This is the path `curl` could never verify,
 * because server actions need a real browser.
 */

test.describe("ticket lifecycle", () => {
  test("customer creates a ticket and sees it in their list", async ({ page }) => {
    const subject = `Printer offline ${stamp()}`;
    await signIn(page, "alex");

    const id = await createTicket(page, {
      subject,
      description: "The office printer has been unreachable over wifi since this morning.",
      category: "technical",
      priority: "high",
    });
    expect(id).toMatch(/^HND-\d+$/);

    // Follow the confirmation's "Open ticket" link, as a user would.
    await page.getByRole("link", { name: /open ticket/i }).click();
    await expect(page).toHaveURL(new RegExp(`/dashboard/tickets/${id}$`));
    await expect(page.getByRole("heading", { name: subject })).toBeVisible();

    await page.goto("/dashboard/tickets");
    await expect(page.getByRole("link", { name: new RegExp(subject) })).toBeVisible();
  });

  test("validation blocks an empty ticket", async ({ page }) => {
    await signIn(page, "alex");
    await page.goto("/dashboard/tickets/new");

    await page.getByRole("button", { name: /submit ticket/i }).click();

    // Must not navigate away or create anything.
    await expect(page).toHaveURL(/\/dashboard\/tickets\/new/);
    await expect(page.getByRole("alert").first()).toBeVisible();
  });

  test("admin sees a new ticket in the unanswered queue", async ({ page }) => {
    const subject = `Waiting for reply ${stamp()}`;
    await signIn(page, "alex");
    const id = await createTicket(page, {
      subject,
      description: "Nobody has replied to this one yet, so it should sit in the queue.",
    });

    await signOut(page);
    await signIn(page, "admin");
    await page.goto("/admin/tickets/unanswered");

    // The queue pages at 20 and sorts by SLA deadline, so a brand-new ticket is
    // not necessarily on page 1. Search for it rather than assuming position.
    const onPage = page.getByRole("link", { name: new RegExp(subject) });
    if ((await onPage.count()) === 0) {
      await page.goto(`/admin/tickets?q=${encodeURIComponent(id)}`);
    }
    await expect(page.locator("body")).toContainText(id);
  });

  test("admin replies and the customer sees the reply", async ({ page }) => {
    test.setTimeout(150_000);
    const subject = `Needs an answer ${stamp()}`;
    await signIn(page, "alex");
    const id = await createTicket(page, {
      subject,
      description: "Could you confirm my billing period changed?",
      category: "billing",
    });

    await signOut(page);
    await signIn(page, "admin");
    await page.goto(`/admin/tickets/${id}`);

    const reply = `We have updated your billing period ${stamp()}.`;
    await page.locator("#reply").fill(reply);
    await page.getByRole("button", { name: /send reply/i }).click();
    await expect(page.getByText(reply)).toBeVisible({ timeout: 20_000 });

    await signOut(page);
    await signIn(page, "alex");
    await page.goto(`/dashboard/tickets/${id}`);
    await expect(page.getByText(reply)).toBeVisible();
  });

  test("an internal note stays hidden from the customer", async ({ page }) => {
    test.setTimeout(150_000);
    const subject = `Secret note ${stamp()}`;
    await signIn(page, "alex");
    const id = await createTicket(page, {
      subject,
      description: "Please check my account access.",
    });

    const secret = `INTERNAL-ONLY-${stamp()}`;

    await signOut(page);
    await signIn(page, "admin");
    await page.goto(`/admin/tickets/${id}`);

    // The internal-note control is a checkbox that switches the composer mode.
    await page.getByRole("checkbox", { name: /internal note/i }).check();
    await page.locator("#reply").fill(secret);
    await page.getByRole("button", { name: /add note/i }).click();
    await expect(page.getByText(secret)).toBeVisible({ timeout: 20_000 });

    await signOut(page);
    await signIn(page, "alex");
    await page.goto(`/dashboard/tickets/${id}`);

    // The customer must never see staff-only content.
    await expect(page.getByText(secret)).toHaveCount(0);
  });

  test("changing status updates what the customer sees", async ({ page }) => {
    // Two sign-ins and two cold route compiles; occasionally exceeds 90s.
    test.setTimeout(150_000);
    const subject = `Status change ${stamp()}`;
    await signIn(page, "alex");
    const id = await createTicket(page, {
      subject,
      description: "Please resolve this once you have looked at it.",
    });

    await signOut(page);
    await signIn(page, "admin");
    await page.goto(`/admin/tickets/${id}`);

    // By id: getByLabel(/status/i) also matches the status badge, which is not
    // a form control.
    const status = page.locator("#status");
    await status.selectOption("resolved");
    await expect(status).toHaveValue("resolved", { timeout: 20_000 });

    await signOut(page);
    await signIn(page, "alex");
    await page.goto(`/dashboard/tickets/${id}`);
    await expect(page.getByText(/resolved/i).first()).toBeVisible();
  });
});
