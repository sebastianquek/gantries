import { test } from "@playwright/test";

import { Map } from "./models/map";

for (const colorScheme of ["light", "dark"] as const) {
  for (const noGantriesOn of [false, true]) {
    test.describe(`when filters are set to a timing ${
      noGantriesOn ? "without" : "with"
    } operational gantries (${colorScheme} mode)`, () => {
      let map: Map;

      test.beforeEach(async ({ page }, workerInfo) => {
        map = new Map(page, workerInfo.project.name, colorScheme);
        await map.goto();

        if (noGantriesOn) {
          await map.initNoGantriesOn();
        } else {
          await map.initSomeGantriesOn();
        }
      });

      test(`[snapshot] should see ${
        noGantriesOn ? "no" : "some"
      } gantries with amount labels (${colorScheme} mode)`, async () => {
        await map.shouldMatchMapSnapshot();
      });
    });
  }
}

test.describe("when navigating to a gantry URL", () => {
  for (const noGantriesOn of [false, true]) {
    let map: Map;

    test.beforeEach(async ({ page }, workerInfo) => {
      map = new Map(page, workerInfo.project.name);
      await map.goto({ gantryId: true });
    });

    test.describe(`when filters are set to a timing ${
      noGantriesOn ? "without" : "with"
    } operational gantries`, () => {
      test.beforeEach(async () => {
        if (noGantriesOn) {
          await map.initNoGantriesOn();
        } else {
          await map.initSomeGantriesOn();
        }
      });

      test(`[snapshot] should center the map to the gantry`, async () => {
        await map.shouldMatchMapSnapshot();
      });
    });
  }
});
