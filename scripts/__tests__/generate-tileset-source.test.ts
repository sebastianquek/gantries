import { join } from "path";

import axios from "axios";

import { exportedForTesting } from "../generate-tileset-source";
const {
  convertGeoJSONPointFeaturestoLDGeoJSON,
  generateTilesetSourceGeoJSONFeatures,
  upsertTilesetSource,
} = exportedForTesting;

jest.mock("axios");
const axiosPutSpy = jest.spyOn(axios, "put");

describe("generate-tileset-source", () => {
  describe("generateTilesetSourceGeoJSONFeatures", () => {
    it("should return correctly when there are no gantries", () => {
      expect(generateTilesetSourceGeoJSONFeatures([], {})).toStrictEqual([]);
    });

    it("should return correctly when there are gantries, but no rates", () => {
      expect(
        generateTilesetSourceGeoJSONFeatures(
          [
            {
              id: "1",
              zone: "abc",
              name: "gantry abc",
              bearing: "1",
              longitude: "2",
              latitude: "3",
            },
          ],
          {}
        )
      ).toStrictEqual([
        {
          type: "Feature",
          id: "1",
          properties: {
            id: "1",
            zone: "abc",
            name: "gantry abc",
            bearing: 1,
            longitude: 2,
            latitude: 3,
          },
          geometry: {
            type: "Point",
            coordinates: [2, 3],
          },
        },
      ]);
    });

    it("should return correctly when there are gantries and rates, but rates do not belong to any gantry", () => {
      expect(
        generateTilesetSourceGeoJSONFeatures(
          [
            {
              id: "1",
              zone: "abc",
              name: "gantry abc",
              bearing: "1",
              longitude: "2",
              latitude: "3",
            },
          ],
          {
            "Motorcycle Weekday": [
              {
                VehicleType: "Motorcycle",
                DayType: "Weekday",
                ZoneID: "bcd", // does not match any gantry
                ChargeAmount: 1,
                StartTime: "08:00",
                EndTime: "09:00",
                EffectiveDate: "2022-03-03",
              },
            ],
          }
        )
      ).toStrictEqual([
        {
          type: "Feature",
          id: "1",
          properties: {
            id: "1",
            zone: "abc",
            name: "gantry abc",
            bearing: 1,
            longitude: 2,
            latitude: 3,
          },
          geometry: {
            type: "Point",
            coordinates: [2, 3],
          },
        },
      ]);
    });

    it("should return correctly when there are gantries (of the same zone) and rates", () => {
      expect(
        generateTilesetSourceGeoJSONFeatures(
          [
            {
              id: "1",
              zone: "abc",
              name: "gantry abc",
              bearing: "1",
              longitude: "2",
              latitude: "3",
            },
            {
              id: "2",
              zone: "abc",
              name: "gantry bcd",
              bearing: "2",
              longitude: "3",
              latitude: "4",
            },
          ],
          {
            "Motorcycle Weekday": [
              {
                VehicleType: "Motorcycle",
                DayType: "Weekday",
                ZoneID: "abc",
                ChargeAmount: 4,
                StartTime: "08:00",
                EndTime: "09:00",
                EffectiveDate: "2022-03-03",
              },
              {
                VehicleType: "Motorcycle",
                DayType: "Weekday",
                ZoneID: "abc",
                ChargeAmount: 4.5,
                StartTime: "09:00",
                EndTime: "10:00",
                EffectiveDate: "2022-03-03",
              },
            ],
          }
        )
      ).toStrictEqual([
        {
          type: "Feature",
          id: "1",
          properties: {
            id: "1",
            zone: "abc",
            name: "gantry abc",
            bearing: 1,
            longitude: 2,
            latitude: 3,
            "motorcycle-weekday-08-00-09-00": 4,
            "motorcycle-weekday-09-00-10-00": 4.5,
          },
          geometry: {
            type: "Point",
            coordinates: [2, 3],
          },
        },
        {
          type: "Feature",
          id: "2",
          properties: {
            id: "2",
            zone: "abc",
            name: "gantry bcd",
            bearing: 2,
            longitude: 3,
            latitude: 4,
            "motorcycle-weekday-08-00-09-00": 4,
            "motorcycle-weekday-09-00-10-00": 4.5,
          },
          geometry: {
            type: "Point",
            coordinates: [3, 4],
          },
        },
      ]);
    });

    it("should return correctly when there are gantries (of different zones) and rates", () => {
      expect(
        generateTilesetSourceGeoJSONFeatures(
          [
            {
              id: "1",
              zone: "abc",
              name: "gantry abc",
              bearing: "1",
              longitude: "2",
              latitude: "3",
            },
            {
              id: "2",
              zone: "efg",
              name: "gantry efg",
              bearing: "2",
              longitude: "3",
              latitude: "4",
            },
          ],
          {
            "Motorcycle Weekday": [
              {
                VehicleType: "Motorcycle",
                DayType: "Weekday",
                ZoneID: "abc",
                ChargeAmount: 4,
                StartTime: "08:00",
                EndTime: "09:00",
                EffectiveDate: "2022-03-03",
              },
              {
                VehicleType: "Motorcycle",
                DayType: "Weekday",
                ZoneID: "abc",
                ChargeAmount: 4.5,
                StartTime: "09:00",
                EndTime: "10:00",
                EffectiveDate: "2022-03-03",
              },
            ],
            "Taxi Weekday": [
              {
                VehicleType: "Motorcycle",
                DayType: "Weekday",
                ZoneID: "efg",
                ChargeAmount: 5,
                StartTime: "09:00",
                EndTime: "10:00",
                EffectiveDate: "2022-03-03",
              },
            ],
          }
        )
      ).toStrictEqual([
        {
          type: "Feature",
          id: "1",
          properties: {
            id: "1",
            zone: "abc",
            name: "gantry abc",
            bearing: 1,
            longitude: 2,
            latitude: 3,
            "motorcycle-weekday-08-00-09-00": 4,
            "motorcycle-weekday-09-00-10-00": 4.5,
          },
          geometry: {
            type: "Point",
            coordinates: [2, 3],
          },
        },
        {
          type: "Feature",
          id: "2",
          properties: {
            id: "2",
            zone: "efg",
            name: "gantry efg",
            bearing: 2,
            longitude: 3,
            latitude: 4,
            "taxi-weekday-09-00-10-00": 5,
          },
          geometry: {
            type: "Point",
            coordinates: [3, 4],
          },
        },
      ]);
    });

    it("should shorten the bearing, longitude and latitude", () => {
      expect(
        generateTilesetSourceGeoJSONFeatures(
          [
            {
              id: "1",
              zone: "abc",
              name: "gantry abc",
              bearing: "1.123456789",
              longitude: "2.123456789",
              latitude: "3.123456789",
            },
          ],
          {}
        )
      ).toStrictEqual([
        {
          type: "Feature",
          id: "1",
          properties: {
            id: "1",
            zone: "abc",
            name: "gantry abc",
            bearing: 1.12346,
            longitude: 2.12346,
            latitude: 3.12346,
          },
          geometry: {
            type: "Point",
            coordinates: [2.12346, 3.12346],
          },
        },
      ]);
    });
  });

  describe("convertGeoJSONPointFeaturestoLDGeoJSON", () => {
    it("should return correctly when there are no gantries", () => {
      expect(convertGeoJSONPointFeaturestoLDGeoJSON([])).toStrictEqual([]);
    });

    it("should return correctly when there's 1 gantry", () => {
      expect(
        convertGeoJSONPointFeaturestoLDGeoJSON([
          {
            type: "Feature",
            id: "1",
            properties: {
              id: "1",
              zone: "abc",
              name: "gantry abc",
              bearing: 1,
              longitude: 2,
              latitude: 3,
              "motorcycle-weekday-08-00-09-00": 4,
              "motorcycle-weekday-09-00-10-00": 4.5,
            },
            geometry: {
              type: "Point",
              coordinates: [2, 3],
            },
          },
        ])
      ).toStrictEqual([
        '{"type":"Feature","id":"1","properties":{"id":"1","zone":"abc","name":"gantry abc","bearing":1,"longitude":2,"latitude":3,"motorcycle-weekday-08-00-09-00":4,"motorcycle-weekday-09-00-10-00":4.5},"geometry":{"type":"Point","coordinates":[2,3]}}',
      ]);
    });

    it("should return correctly when there's 2 gantries", () => {
      expect(
        convertGeoJSONPointFeaturestoLDGeoJSON([
          {
            type: "Feature",
            id: "1",
            properties: {
              id: "1",
              zone: "abc",
              name: "gantry abc",
              bearing: 1,
              longitude: 2,
              latitude: 3,
              "motorcycle-weekday-08-00-09-00": 4,
              "motorcycle-weekday-09-00-10-00": 4.5,
            },
            geometry: {
              type: "Point",
              coordinates: [2, 3],
            },
          },
          {
            type: "Feature",
            id: "2",
            properties: {
              id: "2",
              zone: "efg",
              name: "gantry efg",
              bearing: 2,
              longitude: 3,
              latitude: 4,
              "taxi-weekday-09-00-10-00": 5,
            },
            geometry: {
              type: "Point",
              coordinates: [3, 4],
            },
          },
        ])
      ).toStrictEqual([
        '{"type":"Feature","id":"1","properties":{"id":"1","zone":"abc","name":"gantry abc","bearing":1,"longitude":2,"latitude":3,"motorcycle-weekday-08-00-09-00":4,"motorcycle-weekday-09-00-10-00":4.5},"geometry":{"type":"Point","coordinates":[2,3]}}',
        '{"type":"Feature","id":"2","properties":{"id":"2","zone":"efg","name":"gantry efg","bearing":2,"longitude":3,"latitude":4,"taxi-weekday-09-00-10-00":5},"geometry":{"type":"Point","coordinates":[3,4]}}',
      ]);
    });
  });

  describe("upsertTilesetSource", () => {
    it("should provide axios with the correct properties", async () => {
      axiosPutSpy.mockResolvedValueOnce({
        data: {
          id: "id",
          files: 1,
          source_size: 1,
          file_size: 1,
        },
      });
      await upsertTilesetSource(
        "baseUrl",
        "username",
        "tilesetSourceId",
        "accessToken",
        join(__dirname, "./fixtures/empty.ld.json")
      );
      expect(axiosPutSpy).toHaveBeenCalledWith(
        "baseUrl/username/tilesetSourceId",
        expect.objectContaining({
          _streams: expect.arrayContaining([
            expect.stringContaining(
              `Content-Disposition: form-data; name="file"; filename="empty.ld.json"`
            ),
          ]),
        }),
        {
          params: {
            access_token: "accessToken",
          },
          headers: {
            "content-type": expect.stringContaining(
              "multipart/form-data; boundary="
            ),
          },
        }
      );
    });
  });
});
