import { test } from "@playwright/test";

import { Map } from "./models/map";

for (const noGantriesOn of [false, true]) {
  let map: Map;

  test.beforeEach(async ({ page }) => {
    map = new Map(page, "MOBILE");
    await map.goto();
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

    test("[snapshot] should highlight and center the gantry when clicked", async () => {
      await map.mapCanvas.click({
        // click on gantry 34
        position: {
          x: 287,
          y: 283,
        },
      });
      await map.shouldMatchMapSnapshot();
    });

    test("[snapshot] should move the map on drag", async () => {
      await map.dragMap();
      await map.shouldMatchMapSnapshot();
    });

    test("[snapshot] should zoom the map on scroll", async ({
      browserName,
    }) => {
      test.skip(
        browserName === "webkit",
        "Mouse wheel is not supported in mobile WebKit"
      );
      await map.zoomInMap();
      await map.shouldMatchMapSnapshot();
    });

    test("[snapshot] should zoom in the map after clicking on a gantry if the map is zoomed out too far", async ({
      browserName,
    }) => {
      test.skip(
        browserName === "webkit",
        "Mouse wheel is not supported in mobile WebKit"
      );
      await map.zoomOutMap();
      await map.shouldMatchMapSnapshot();

      // click on gantry 34
      await map.mapCanvas.click({
        position: {
          x: 240,
          y: 310,
        },
      });
      await map.shouldMatchMapSnapshot();
    });

    test("[snapshot] should maintain zoom after clicking on a gantry if the map is already zoomed in sufficiently", async ({
      browserName,
    }) => {
      test.skip(
        browserName === "webkit",
        "Mouse wheel is not supported in mobile WebKit"
      );
      await map.zoomInMap();
      await map.zoomInMap();
      await map.shouldMatchMapSnapshot();

      // click on gantry 34
      await map.mapCanvas.click({
        position: {
          x: 329,
          y: 427,
        },
      });
      await map.shouldMatchMapSnapshot();
    });
  });
}