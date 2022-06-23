import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("when page loads", () => {
  test("should see the title of the site", async ({ page }) => {
    await expect(page.locator('[data-test-id="app-title"]')).toBeVisible();
  });
});
