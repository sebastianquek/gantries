import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("when filters are set to a timing without operational gantries", () => {
  test.beforeEach(async ({ page }) => {
    await page
      .locator('select[data-test-id="day-type"]')
      .selectOption("Weekdays");
    await page.locator('[data-test-id="time-filter"]').fill("00:00");
  });

  test("[snapshot] should see no gantries highlighted", async ({ page }) => {
    await expect(page.locator('[aria-label="Map"]')).toBeVisible();
    // Move the map to the front so the screenshot only takes the map without other elements (e.g. alert banner)
    // TODO: figure out how to abstract this
    await page.evaluate(() => {
      const map: HTMLDivElement | null =
        document.querySelector("[aria-label='Map']");
      if (map) map.style.zIndex = "999";
    });
    await expect(page.locator('[aria-label="Map"]')).toHaveScreenshot();
  });
});
