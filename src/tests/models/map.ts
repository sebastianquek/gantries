import type { Locator, Page } from "@playwright/test";

import { expect } from "@playwright/test";

type ColorScheme = "light" | "dark";

export class Map {
  readonly dayTypeSelect: Locator;
  readonly timeInput: Locator;
  readonly mapCanvas: Locator;

  constructor(
    readonly page: Page,
    readonly projectName: string,
    readonly colorScheme: ColorScheme = "light"
  ) {
    this.page = page;
    this.projectName = projectName;
    this.colorScheme = colorScheme;

    this.dayTypeSelect = page.locator('select[data-test-id="day-type"]');
    this.timeInput = page.locator('[data-test-id="time-filter"]');

    this.mapCanvas = page.locator('[aria-label="Map"]');
  }

  async goto(options?: { gantryId?: boolean }) {
    await this.page.emulateMedia({
      colorScheme: this.colorScheme,
    });

    let url = "/";
    if (options?.gantryId) url += "42";
    await Promise.all([
      this.page.waitForFunction(async () => {
        const isIdle = await new Promise<boolean>((res) => {
          document.addEventListener("idle", () => res(true), { once: true });
        });
        return isIdle;
      }),
      this.page.goto(url),
    ]);
  }

  async initSomeGantriesOn() {
    await this.dayTypeSelect.selectOption("Weekdays");
    await this.timeInput.fill("08:32");
  }

  async initNoGantriesOn() {
    await this.dayTypeSelect.selectOption("Weekdays");
    await this.timeInput.fill("00:00");
  }

  async dragMap() {
    if (
      this.projectName === "mobile-chrome" ||
      this.projectName === "mobile-safari"
    ) {
      // TODO: This can be improved once Playwright exposes better touchscreen support
      await this.page.mouse.move(200, 360);
      await this.page.mouse.down();
      await this.page.mouse.move(100, 260);
      await this.page.mouse.up();
    } else {
      await this.page.mouse.move(720, 170);
      await this.page.mouse.down();
      await this.page.mouse.move(470, 500);
      await this.page.mouse.up();
    }
  }

  async zoomInMap() {
    if (
      this.projectName === "mobile-chrome" ||
      this.projectName === "mobile-safari"
    ) {
      // TODO: This can be improved once Playwright exposes better touchscreen support
      await this.page.mouse.move(280, 280);
      await this.page.mouse.wheel(0, -5000);
    } else {
      await this.page.mouse.move(640, 320); // middle of viewport
      await this.page.mouse.wheel(0, -5000);
    }

    // Wait for map to zoom in as the wheel method does not wait for the scrolling to finish before returning
    // https://playwright.dev/docs/api/class-mouse#mouse-wheel
    await this.page.waitForTimeout(2000);
  }

  async zoomOutMap() {
    if (
      this.projectName === "mobile-chrome" ||
      this.projectName === "mobile-safari"
    ) {
      // TODO: This can be improved once Playwright exposes better touchscreen support
      await this.page.mouse.move(200, 360);
      await this.page.mouse.wheel(0, 5000);
    } else {
      await this.page.mouse.move(640, 320); // middle of viewport
      await this.page.mouse.wheel(0, 5000);
    }

    // Wait for map to zoom out as the wheel method does not wait for the scrolling to finish before returning
    // https://playwright.dev/docs/api/class-mouse#mouse-wheel
    await this.page.waitForTimeout(2000);
  }

  // Move the map to the front so the screenshot only takes the map without other elements (e.g. alert banner)
  async shouldMatchMapSnapshot() {
    // TODO: move this out to a custom matcher once Playwright is able to
    // have custom matchers that can reference other in-built matchers (i.e. toHaveScreenshot)
    const elementHandle = await this.mapCanvas.elementHandle();
    await elementHandle?.evaluate((node) => (node.style.zIndex = "9999"));

    await expect(this.mapCanvas).toHaveScreenshot();

    // Reset z-index
    await elementHandle?.evaluate((node) => (node.style.zIndex = "unset"));
  }
}
