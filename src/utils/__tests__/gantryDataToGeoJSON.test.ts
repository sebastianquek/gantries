import type { GantryLocationData } from "../gantryDataToGeoJSON";

import { gantryDataToGeoJSON } from "../gantryDataToGeoJSON";

describe("gantryDataToGeoJSON", () => {
  const data: GantryLocationData[] = [
    {
      id: 1,
      bearing: 1,
      longitude: 101,
      latitude: 1,
      name: "Gantry 1",
      zone: "Zone 1",
    },
    {
      id: 2,
      bearing: 2,
      longitude: 102,
      latitude: 2,
      name: "Gantry 2",
      zone: "Zone 2",
    },
  ];

  it("should format the data in GeoJSON correctly", () => {
    expect(gantryDataToGeoJSON(data)).toStrictEqual({
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [101, 1],
            },
            properties: {
              id: 1,
              name: "Gantry 1",
              zone: "Zone 1",
              bearing: 1,
            },
          },
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [102, 2],
            },
            properties: {
              id: 2,
              name: "Gantry 2",
              zone: "Zone 2",
              bearing: 2,
            },
          },
        ],
      },
    });
  });
});
