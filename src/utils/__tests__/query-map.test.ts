/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { queryMap } from "../query-map";

const mockMap = {
  querySourceFeatures: () => [
    {
      id: 1,
      properties: {
        bearing: 1,
        id: 1,
        latitude: 1,
        longitude: 1,
        name: "name",
        zone: "zone",
      },
    },
  ],
};

describe("queryMap", () => {
  it("should return null if no matching gantry is found", () => {
    expect(queryMap(mockMap as any, "2")).toStrictEqual(null);
  });
  it("should return the gantry if a matching gantry is found", () => {
    expect(queryMap(mockMap as any, "1")).toStrictEqual({
      bearing: 1,
      id: 1,
      latitude: 1,
      longitude: 1,
      name: "name",
      zone: "zone",
    });
  });
});
