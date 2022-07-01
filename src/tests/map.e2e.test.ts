import { test, expect } from "@playwright/test";

test.describe("when filters are set to a timing without operational gantries", () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      page.waitForFunction(async () => {
        const isIdle = await new Promise<boolean>((res) => {
          document.addEventListener("idle", () => res(true), { once: true });
        });
        return isIdle;
      }),
      page.goto("/"),
    ]);
    await page
      .locator('select[data-test-id="day-type"]')
      .selectOption("Weekdays");
    await page.locator('[data-test-id="time-filter"]').fill("00:00");
  });

  test("[snapshot] should see no gantries with amount labels", async ({
    page,
  }) => {
    const locator = page.locator('[aria-label="Map"]');

    // Move the map to the front so the screenshot only takes the map without other elements (e.g. alert banner)
    // TODO: move this out to a custom matcher once Playwright is able to
    // have custom matchers that can reference other in-built matchers (i.e. toHaveScreenshot)
    const elementHandle = await locator.elementHandle();
    await elementHandle?.evaluate((node) => (node.style.zIndex = "9999"));

    await expect(locator).toHaveScreenshot();
  });
});

test.describe("when filters are set to a timing with operational gantries", () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      page.waitForFunction(async () => {
        const isIdle = await new Promise<boolean>((res) => {
          document.addEventListener("idle", () => res(true), { once: true });
        });
        return isIdle;
      }),
      page.goto("/"),
    ]);
    await page
      .locator('select[data-test-id="day-type"]')
      .selectOption("Weekdays");
    await page.locator('[data-test-id="time-filter"]').fill("08:32");
  });

  test("[snapshot] should see some gantries with amount labels", async ({
    page,
  }) => {
    const locator = page.locator('[aria-label="Map"]');

    // Move the map to the front so the screenshot only takes the map without other elements (e.g. alert banner)
    // TODO: move this out to a custom matcher once Playwright is able to
    // have custom matchers that can reference other in-built matchers (i.e. toHaveScreenshot)
    const elementHandle = await locator.elementHandle();
    await elementHandle?.evaluate((node) => (node.style.zIndex = "9999"));

    await expect(locator).toHaveScreenshot();
  });
});

test.describe("when navigating to a gantry URL", () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      page.waitForFunction(async () => {
        const isIdle = await new Promise<boolean>((res) => {
          document.addEventListener("idle", () => res(true), { once: true });
        });
        return isIdle;
      }),
      page.goto("/42"),
    ]);
  });

  test("[snapshot] should center the map to the gantry when filters are set to a timing without operational gantries", async ({
    page,
  }) => {
    await page
      .locator('select[data-test-id="day-type"]')
      .selectOption("Weekdays");
    await page.locator('[data-test-id="time-filter"]').fill("00:00");

    const locator = page.locator('[aria-label="Map"]');

    // Move the map to the front so the screenshot only takes the map without other elements (e.g. alert banner)
    // TODO: move this out to a custom matcher once Playwright is able to
    // have custom matchers that can reference other in-built matchers (i.e. toHaveScreenshot)
    const elementHandle = await locator.elementHandle();
    await elementHandle?.evaluate((node) => (node.style.zIndex = "9999"));

    await expect(locator).toHaveScreenshot();
  });

  test("[snapshot] should center the map to the gantry when filters are set to a timing with operational gantries", async ({
    page,
  }) => {
    await page
      .locator('select[data-test-id="day-type"]')
      .selectOption("Weekdays");
    await page.locator('[data-test-id="time-filter"]').fill("08:32");

    const locator = page.locator('[aria-label="Map"]');

    // Move the map to the front so the screenshot only takes the map without other elements (e.g. alert banner)
    // TODO: move this out to a custom matcher once Playwright is able to
    // have custom matchers that can reference other in-built matchers (i.e. toHaveScreenshot)
    const elementHandle = await locator.elementHandle();
    await elementHandle?.evaluate((node) => (node.style.zIndex = "9999"));

    await expect(locator).toHaveScreenshot();
  });
});
