import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(async () => {
    const isIdle = await new Promise<boolean>((res) => {
      document.addEventListener("idle", () => res(true), { once: true });
    });
    return isIdle;
  });
});

test.describe("when filters are set to a timing without operational gantries", () => {
  test.beforeEach(async ({ page }) => {
    await page
      .locator('select[data-test-id="day-type"]')
      .selectOption("Weekdays");
    await page.locator('[data-test-id="time-filter"]').fill("00:00");
  });

  test("[snapshot] should highlight and center the gantry when clicked", async ({
    page,
  }) => {
    const locator = page.locator('[aria-label="Map"]');
    await locator.click({
      position: {
        x: 734,
        y: 281,
      },
    });

    await expect(page.locator("text=CTE from Balestier Road")).toBeVisible();

    // Move the map to the front so the screenshot only takes the map without other elements (e.g. alert banner)
    // TODO: move this out to a custom matcher once Playwright is able to
    // have custom matchers that can reference other in-built matchers (i.e. toHaveScreenshot)
    const elementHandle = await locator.elementHandle();
    await elementHandle?.evaluate((node) => (node.style.zIndex = "9999"));

    await expect(locator).toHaveScreenshot();
  });

  test("[snapshot] should move the map on drag", async ({ page }) => {
    await page.mouse.move(720, 170);
    await page.mouse.down();
    await page.mouse.move(470, 500);
    await page.mouse.up();

    const locator = page.locator('[aria-label="Map"]');

    // Move the map to the front so the screenshot only takes the map without other elements (e.g. alert banner)
    // TODO: move this out to a custom matcher once Playwright is able to
    // have custom matchers that can reference other in-built matchers (i.e. toHaveScreenshot)
    const elementHandle = await locator.elementHandle();
    await elementHandle?.evaluate((node) => (node.style.zIndex = "9999"));

    await expect(locator).toHaveScreenshot();
  });

  test("[snapshot] should zoom the map on scroll", async ({ page }) => {
    await page.mouse.move(720, 170);
    await page.mouse.wheel(0, -5000);

    // Wait for map to zoom in as the wheel method does not wait for the scrolling to finish before returning
    // https://playwright.dev/docs/api/class-mouse#mouse-wheel
    await page.waitForTimeout(2000);

    const locator = page.locator('[aria-label="Map"]');

    // Move the map to the front so the screenshot only takes the map without other elements (e.g. alert banner)
    // TODO: move this out to a custom matcher once Playwright is able to
    // have custom matchers that can reference other in-built matchers (i.e. toHaveScreenshot)
    const elementHandle = await locator.elementHandle();
    await elementHandle?.evaluate((node) => (node.style.zIndex = "9999"));

    await expect(locator).toHaveScreenshot();
  });

  test("[snapshot] should zoom in the map after clicking on a gantry if the map is zoomed out too far", async ({
    page,
  }) => {
    const locator = page.locator('[aria-label="Map"]');

    await page.mouse.move(720, 170);
    await page.mouse.wheel(0, 5000);

    // Wait for map to zoom in as the wheel method does not wait for the scrolling to finish before returning
    // https://playwright.dev/docs/api/class-mouse#mouse-wheel
    await page.waitForTimeout(2000);

    const elementHandle = await locator.elementHandle();
    await elementHandle?.evaluate((node) => (node.style.zIndex = "9999"));

    // Should be zoomed out
    await expect(locator).toHaveScreenshot();

    await elementHandle?.evaluate((node) => (node.style.zIndex = "unset"));

    await locator.click({
      position: {
        x: 734,
        y: 281,
      },
    });

    // Move the map to the front so the screenshot only takes the map without other elements (e.g. alert banner)
    // TODO: move this out to a custom matcher once Playwright is able to
    // have custom matchers that can reference other in-built matchers (i.e. toHaveScreenshot)
    await elementHandle?.evaluate((node) => (node.style.zIndex = "9999"));

    // Should be zoomed back in
    await expect(locator).toHaveScreenshot();
  });

  test("[snapshot] should maintain zoom after clicking on a gantry if the map is already zoomed in sufficiently", async ({
    page,
  }) => {
    const locator = page.locator('[aria-label="Map"]');

    await page.mouse.move(720, 170);
    await page.mouse.wheel(0, -5000);

    // Wait for map to zoom in as the wheel method does not wait for the scrolling to finish before returning
    // https://playwright.dev/docs/api/class-mouse#mouse-wheel
    await page.waitForTimeout(2000);

    await page.mouse.wheel(0, -5000);
    await page.waitForTimeout(2000);

    const elementHandle = await locator.elementHandle();
    await elementHandle?.evaluate((node) => (node.style.zIndex = "9999"));

    // Should be zoomed in
    await expect(locator).toHaveScreenshot();

    await elementHandle?.evaluate((node) => (node.style.zIndex = "unset"));

    await locator.click({
      position: {
        x: 1002,
        y: 545,
      },
    });

    // Move the map to the front so the screenshot only takes the map without other elements (e.g. alert banner)
    // TODO: move this out to a custom matcher once Playwright is able to
    // have custom matchers that can reference other in-built matchers (i.e. toHaveScreenshot)
    await elementHandle?.evaluate((node) => (node.style.zIndex = "9999"));

    // Should maintain zoom
    await expect(locator).toHaveScreenshot();
  });
});

test.describe("when filters are set to a timing with operational gantries", () => {
  test.beforeEach(async ({ page }) => {
    await page
      .locator('select[data-test-id="day-type"]')
      .selectOption("Weekdays");
    await page.locator('[data-test-id="time-filter"]').fill("08:32");
  });

  test("[snapshot] should highlight and center the gantry when clicked", async ({
    page,
  }) => {
    const locator = page.locator('[aria-label="Map"]');
    await locator.click({
      position: {
        x: 734,
        y: 281,
      },
    });

    await expect(page.locator("text=CTE from Balestier Road")).toBeVisible();

    // Move the map to the front so the screenshot only takes the map without other elements (e.g. alert banner)
    // TODO: move this out to a custom matcher once Playwright is able to
    // have custom matchers that can reference other in-built matchers (i.e. toHaveScreenshot)
    const elementHandle = await locator.elementHandle();
    await elementHandle?.evaluate((node) => (node.style.zIndex = "9999"));

    await expect(locator).toHaveScreenshot();
  });

  test("[snapshot] should move the map on drag", async ({ page }) => {
    await page.mouse.move(720, 170);
    await page.mouse.down();
    await page.mouse.move(470, 500);
    await page.mouse.up();

    const locator = page.locator('[aria-label="Map"]');

    // Move the map to the front so the screenshot only takes the map without other elements (e.g. alert banner)
    // TODO: move this out to a custom matcher once Playwright is able to
    // have custom matchers that can reference other in-built matchers (i.e. toHaveScreenshot)
    const elementHandle = await locator.elementHandle();
    await elementHandle?.evaluate((node) => (node.style.zIndex = "9999"));

    await expect(locator).toHaveScreenshot();
  });

  test("[snapshot] should zoom the map on scroll", async ({ page }) => {
    await page.mouse.move(720, 170);
    await page.mouse.wheel(0, -5000);

    // Wait for map to zoom in as the wheel method does not wait for the scrolling to finish before returning
    // https://playwright.dev/docs/api/class-mouse#mouse-wheel
    await page.waitForTimeout(2000);

    const locator = page.locator('[aria-label="Map"]');

    // Move the map to the front so the screenshot only takes the map without other elements (e.g. alert banner)
    // TODO: move this out to a custom matcher once Playwright is able to
    // have custom matchers that can reference other in-built matchers (i.e. toHaveScreenshot)
    const elementHandle = await locator.elementHandle();
    await elementHandle?.evaluate((node) => (node.style.zIndex = "9999"));

    await expect(locator).toHaveScreenshot();
  });

  test("[snapshot] should zoom in the map after clicking on a gantry if the map is zoomed out too far", async ({
    page,
  }) => {
    const locator = page.locator('[aria-label="Map"]');

    await page.mouse.move(720, 170);
    await page.mouse.wheel(0, 5000);

    // Wait for map to zoom in as the wheel method does not wait for the scrolling to finish before returning
    // https://playwright.dev/docs/api/class-mouse#mouse-wheel
    await page.waitForTimeout(2000);

    const elementHandle = await locator.elementHandle();
    await elementHandle?.evaluate((node) => (node.style.zIndex = "9999"));

    // Should be zoomed out
    await expect(locator).toHaveScreenshot();

    await elementHandle?.evaluate((node) => (node.style.zIndex = "unset"));

    await locator.click({
      position: {
        x: 734,
        y: 281,
      },
    });

    // Move the map to the front so the screenshot only takes the map without other elements (e.g. alert banner)
    // TODO: move this out to a custom matcher once Playwright is able to
    // have custom matchers that can reference other in-built matchers (i.e. toHaveScreenshot)
    await elementHandle?.evaluate((node) => (node.style.zIndex = "9999"));

    // Should be zoomed back in
    await expect(locator).toHaveScreenshot();
  });

  test("[snapshot] should maintain zoom after clicking on a gantry if the map is already zoomed in sufficiently", async ({
    page,
  }) => {
    const locator = page.locator('[aria-label="Map"]');

    await page.mouse.move(720, 170);
    await page.mouse.wheel(0, -5000);

    // Wait for map to zoom in as the wheel method does not wait for the scrolling to finish before returning
    // https://playwright.dev/docs/api/class-mouse#mouse-wheel
    await page.waitForTimeout(2000);

    await page.mouse.wheel(0, -5000);
    await page.waitForTimeout(2000);

    const elementHandle = await locator.elementHandle();
    await elementHandle?.evaluate((node) => (node.style.zIndex = "9999"));

    // Should be zoomed in
    await expect(locator).toHaveScreenshot();

    await elementHandle?.evaluate((node) => (node.style.zIndex = "unset"));

    await locator.click({
      position: {
        x: 1002,
        y: 545,
      },
    });

    // Move the map to the front so the screenshot only takes the map without other elements (e.g. alert banner)
    // TODO: move this out to a custom matcher once Playwright is able to
    // have custom matchers that can reference other in-built matchers (i.e. toHaveScreenshot)
    await elementHandle?.evaluate((node) => (node.style.zIndex = "9999"));

    // Should maintain zoom
    await expect(locator).toHaveScreenshot();
  });
});
