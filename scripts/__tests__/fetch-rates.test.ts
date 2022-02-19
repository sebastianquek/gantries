import { parseRates, parseVehicleTypes } from "../fetch-rates";

import {
  includesNonPositiveChargeAmounts,
  ungrouped,
  unsorted,
} from "./fixtures/rates";

describe("fetch-rates", () => {
  describe("parseRates", () => {
    it("should filter positive rates", () => {
      expect(parseRates(includesNonPositiveChargeAmounts)).toStrictEqual({
        "Motorcycles Weekdays": [
          {
            VehicleType: "Motorcycles",
            DayType: "Weekdays",
            StartTime: "08:30",
            EndTime: "08:35",
            ZoneID: "KP2",
            ChargeAmount: 0.25,
            EffectiveDate: "2022-02-14",
          },
          {
            VehicleType: "Motorcycles",
            DayType: "Weekdays",
            StartTime: "08:35",
            EndTime: "08:55",
            ZoneID: "KP2",
            ChargeAmount: 1,
            EffectiveDate: "2022-02-14",
          },
        ],
      });
    });

    it("should sort by ZoneID, StartTime, then EndTime", () => {
      expect(parseRates(unsorted)).toStrictEqual({
        "Heavy Goods Vehicles/Small Buses Weekdays": [
          {
            ChargeAmount: 0.75,
            DayType: "Weekdays",
            EffectiveDate: "2022-02-14",
            EndTime: "17:35",
            StartTime: "17:30",
            VehicleType: "Heavy Goods Vehicles/Small Buses",
            ZoneID: "AYC",
          },
          {
            ChargeAmount: 1.5,
            DayType: "Weekdays",
            EffectiveDate: "2022-02-14",
            EndTime: "18:25",
            StartTime: "17:35",
            VehicleType: "Heavy Goods Vehicles/Small Buses",
            ZoneID: "AYC",
          },
          {
            ChargeAmount: 0.75,
            DayType: "Weekdays",
            EffectiveDate: "2022-02-14",
            EndTime: "18:30",
            StartTime: "18:25",
            VehicleType: "Heavy Goods Vehicles/Small Buses",
            ZoneID: "AYC",
          },
          {
            ChargeAmount: 0.75,
            DayType: "Weekdays",
            EffectiveDate: "2022-02-14",
            EndTime: "08:35",
            StartTime: "08:30",
            VehicleType: "Heavy Goods Vehicles/Small Buses",
            ZoneID: "KP2",
          },
          {
            ChargeAmount: 1.5,
            DayType: "Weekdays",
            EffectiveDate: "2022-02-14",
            EndTime: "08:55",
            StartTime: "08:35",
            VehicleType: "Heavy Goods Vehicles/Small Buses",
            ZoneID: "KP2",
          },
          {
            ChargeAmount: 0.75,
            DayType: "Weekdays",
            EffectiveDate: "2022-02-14",
            EndTime: "09:00",
            StartTime: "08:55",
            VehicleType: "Heavy Goods Vehicles/Small Buses",
            ZoneID: "KP2",
          },
        ],
      });
    });

    it("should group by VechicleType and DayType", () => {
      expect(parseRates(ungrouped)).toStrictEqual({
        "Passenger Cars/Light Goods Vehicles/Taxis Weekdays": [
          {
            VehicleType: "Passenger Cars/Light Goods Vehicles/Taxis",
            DayType: "Weekdays",
            StartTime: "18:05",
            EndTime: "18:55",
            ZoneID: "AYT",
            ChargeAmount: 1,
            EffectiveDate: "2022-02-14",
          },
        ],
        "Passenger Cars/Light Goods Vehicles/Taxis Saturday": [
          {
            VehicleType: "Passenger Cars/Light Goods Vehicles/Taxis",
            DayType: "Saturday",
            StartTime: "07:00",
            EndTime: "12:30",
            ZoneID: "BMC",
            ChargeAmount: 1,
            EffectiveDate: "2022-02-14",
          },
          {
            VehicleType: "Passenger Cars/Light Goods Vehicles/Taxis",
            DayType: "Saturday",
            StartTime: "12:30",
            EndTime: "12:35",
            ZoneID: "BMC",
            ChargeAmount: 2,
            EffectiveDate: "2022-02-14",
          },
        ],
        "Heavy Goods Vehicles/Small Buses Weekdays": [
          {
            VehicleType: "Heavy Goods Vehicles/Small Buses",
            DayType: "Weekdays",
            StartTime: "08:35",
            EndTime: "08:55",
            ZoneID: "KP2",
            ChargeAmount: 1.5,
            EffectiveDate: "2022-02-14",
          },
        ],
        "Light Goods Vehicles Weekdays": [
          {
            VehicleType: "Light Goods Vehicles",
            DayType: "Weekdays",
            StartTime: "18:00",
            EndTime: "18:05",
            ZoneID: "AYT",
            ChargeAmount: 0.5,
            EffectiveDate: "2022-02-14",
          },
        ],
      });
    });
  });

  describe("parseVehicleTypes", () => {
    it("should extract out unique vehicle types", () => {
      expect(parseVehicleTypes(ungrouped)).toStrictEqual([
        { VehicleType: "Heavy Goods Vehicles/Small Buses" },
        { VehicleType: "Light Goods Vehicles" },
        { VehicleType: "Passenger Cars/Light Goods Vehicles/Taxis" },
      ]);
    });
  });
});
