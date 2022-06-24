import type { Locator, Page } from "@playwright/test";

import { test, expect } from "@playwright/test";

class ProjectInfo {
  readonly page: Page;

  readonly infoButton: Locator;
  readonly closeButton: Locator;
  readonly backdrop: Locator;

  readonly gitHubLink: Locator;
  readonly lastUpdatedText: Locator;
  readonly versionText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.infoButton = page.locator('button:has-text("Info")');
    this.closeButton = page.locator('[data-test-id="close"]');
    this.backdrop = page.locator('[data-test-id="backdrop"]');

    this.gitHubLink = page.locator('a:has-text("GitHub")');
    this.lastUpdatedText = page.locator("text=Last check for updates");
    this.versionText = page.locator('[data-test-id="version"]');
  }

  async goto(options?: { gantryId?: boolean; fragment?: boolean }) {
    let url = "/";
    if (options?.gantryId) url += "42";
    if (options?.fragment) url += "#about";
    await this.page.goto(url);
  }

  async open() {
    await this.infoButton.click();
  }

  async close(via: "CLOSE_BUTTON" | "BACKDROP") {
    switch (via) {
      case "CLOSE_BUTTON":
        await this.closeButton.click();
        break;
      case "BACKDROP":
        await this.backdrop.click();
        break;
    }
  }

  async shouldSeeInfoPanel() {
    await expect(this.page).toHaveURL(/.*#about/);
    await expect(this.gitHubLink).toBeVisible();
  }

  async shouldNotSeeInfoPanel() {
    await expect(this.page).not.toHaveURL(/.*#about/);
    await expect(this.gitHubLink).not.toBeVisible();
  }

  async shouldSeeLastUpdatedAndVersion() {
    await expect(this.lastUpdatedText).toContainText("GMT+0800");
    await expect(this.versionText).toHaveText(/[a-z0-9]{7}/);
  }
}

test.describe("when info button is clicked", () => {
  let projectInfo: ProjectInfo;

  test.beforeEach(async ({ page }) => {
    projectInfo = new ProjectInfo(page);
    await projectInfo.goto();
    await projectInfo.open();
  });

  test("should see info panel", async () => {
    await projectInfo.shouldSeeInfoPanel();
  });

  test("should see last check for updates and version", async () => {
    test.skip(
      process.env.PLAYWRIGHT_BASE_URL === undefined,
      "Last check for updates and version are not shown when running locally"
    );
    await projectInfo.shouldSeeLastUpdatedAndVersion();
  });

  test("should close the info panel when the close button is clicked", async () => {
    await projectInfo.close("CLOSE_BUTTON");
    await projectInfo.shouldNotSeeInfoPanel();
  });

  test("should close the info panel when the backdrop is clicked", async () => {
    await projectInfo.close("BACKDROP");
    await projectInfo.shouldNotSeeInfoPanel();
  });

  test("should close the info panel on browser back", async ({ page }) => {
    await page.goBack();
    await projectInfo.shouldNotSeeInfoPanel();
  });
});

test.describe("when navigating to the root URL with the info hash", () => {
  let projectInfo: ProjectInfo;

  test.beforeEach(async ({ page }) => {
    projectInfo = new ProjectInfo(page);
    await projectInfo.goto({ fragment: true });
  });

  test("should see info panel", async () => {
    await projectInfo.shouldSeeInfoPanel();
  });

  test("should see last check for updates and version", async () => {
    test.skip(
      process.env.PLAYWRIGHT_BASE_URL === undefined,
      "Last check for updates and version are not shown when running locally"
    );
    await projectInfo.shouldSeeLastUpdatedAndVersion();
  });

  test("should close the info panel when the close button is clicked", async () => {
    await projectInfo.close("CLOSE_BUTTON");
    await projectInfo.shouldNotSeeInfoPanel();
  });

  test("should close the info panel when the backdrop is clicked", async () => {
    await projectInfo.close("BACKDROP");
    await projectInfo.shouldNotSeeInfoPanel();
  });

  test("should close the info panel on browser back", async ({ page }) => {
    await page.goBack();
    await projectInfo.shouldNotSeeInfoPanel();
  });
});

test.describe("when navigating to a gantry URL with the info hash", () => {
  let projectInfo: ProjectInfo;

  test.beforeEach(async ({ page }) => {
    projectInfo = new ProjectInfo(page);
    await projectInfo.goto({ gantryId: true, fragment: true });
  });

  test("should see info panel", async () => {
    await projectInfo.shouldSeeInfoPanel();
  });

  test("should see last check for updates and version", async () => {
    test.skip(
      process.env.PLAYWRIGHT_BASE_URL === undefined,
      "Last check for updates and version are not shown when running locally"
    );
    await projectInfo.shouldSeeLastUpdatedAndVersion();
  });

  test("should close the info panel when the close button is clicked and gantry info should be seen", async ({
    page,
  }) => {
    await projectInfo.close("CLOSE_BUTTON");
    await projectInfo.shouldNotSeeInfoPanel();

    await expect(page.locator('text="PE3"')).toBeVisible();
    await expect(page.locator('text="PIE into CTE"')).toBeVisible();
  });

  test("should close the info panel when the backdrop is clicked and gantry info should be seen", async ({
    page,
  }) => {
    await projectInfo.close("BACKDROP");
    await projectInfo.shouldNotSeeInfoPanel();

    await expect(page.locator('text="PE3"')).toBeVisible();
    await expect(page.locator('text="PIE into CTE"')).toBeVisible();
  });

  test("should exit browser session when the browser back is executed", async ({
    page,
  }) => {
    await page.goBack();

    await expect(page).toHaveURL("about:blank");
  });
});
