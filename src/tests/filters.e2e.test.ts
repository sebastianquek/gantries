import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("when page loads", () => {
  test("should see default vehicle type filter", async ({ page }) => {
    await expect(
      page.locator('select[data-test-id="vehicle-type"]')
    ).toHaveValue("Passenger Cars/Light Goods Vehicles/Taxis");

    await expect(
      page.locator('[data-test-id="vehicle-icon"] title')
    ).toHaveText("car icon");
  });

  test("should see the current day type and time", async ({ page }) => {
    const isWeekdayOrSunday = await page.evaluate(
      () => new Date().getDay() !== 6
    );
    await expect(page.locator('select[data-test-id="day-type"]')).toHaveValue(
      isWeekdayOrSunday ? "Weekdays" : "Saturday"
    );

    const hour = await page.evaluate(() => new Date().getHours());
    const minute = await page.evaluate(() => new Date().getMinutes());
    const hourString = `${hour}`.padStart(2, "0");
    const minuteString = `${minute}`.padStart(2, "0");
    const time = `${hourString}:${minuteString}`;

    await expect(page.locator('input[data-test-id="time-filter"]')).toHaveValue(
      time
    );
  });
});

test.describe("when filter changes", () => {
  test("should see different vehicle type icon when vehicle type changes", async ({
    page,
  }) => {
    await expect(
      page.locator('[data-test-id="vehicle-icon"] title')
    ).toHaveText("car icon");
    await page
      .locator('select[data-test-id="vehicle-type"]')
      .selectOption("Motorcycles");
    await expect(
      page.locator('[data-test-id="vehicle-icon"] title')
    ).toHaveText("motorcycle icon");
  });

  test("should maintain the vehicle type filter across reloads", async ({
    page,
    context,
    browser,
  }) => {
    await page
      .locator('select[data-test-id="vehicle-type"]')
      .selectOption("Motorcycles");
    const state = await context.storageState();

    const newContext = await browser.newContext({ storageState: state });
    const newPage = await newContext.newPage();
    await newPage.goto("/");
    await expect(
      newPage.locator('[data-test-id="vehicle-icon"] title')
    ).toHaveText("motorcycle icon");
  });

  test("should set the day type and time to now when now button is clicked", async ({
    page,
  }) => {
    // Set day type to be the opposite of the current value
    const isWeekdayOrSunday = await page.evaluate(
      () => new Date().getDay() !== 6
    );
    const dayType = isWeekdayOrSunday ? "Weekdays" : "Saturday";
    const newDayType = isWeekdayOrSunday ? "Saturday" : "Weekdays"; // Toggle day type
    await page
      .locator('select[data-test-id="day-type"]')
      .selectOption(newDayType);
    await expect(page.locator('select[data-test-id="day-type"]')).toHaveValue(
      newDayType
    );

    // Set time to be 1 hour, 20 minutes ahead;
    const hour = await page.evaluate(() => new Date().getHours());
    const minute = await page.evaluate(() => new Date().getMinutes());
    const hourString = `${hour}`.padStart(2, "0");
    const minuteString = `${minute}`.padStart(2, "0");
    const time = `${hourString}:${minuteString}`;

    const newHourString = `${(hour + 1) % 24}`.padStart(2, "0");
    const newMinuteString = `${(minute + 20) % 60}`.padStart(2, "0");
    const newTime = `${newHourString}:${newMinuteString}`;

    await page.locator('[data-test-id="time-filter"]').fill(newTime);
    await expect(page.locator('input[data-test-id="time-filter"]')).toHaveValue(
      newTime
    );

    // Click on now
    await page.locator("text=Now").click();
    await expect(page.locator('select[data-test-id="day-type"]')).toHaveValue(
      dayType
    );
    await expect(page.locator('input[data-test-id="time-filter"]')).toHaveValue(
      time
    );
  });
});
