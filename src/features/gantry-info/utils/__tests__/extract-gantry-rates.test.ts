import { exportedForTesting } from "../extract-gantry-rates";

const {
  padGapsWithZeroRates,
  collapseRates,
  extractStartAndEndTime,
  extractGantryRates,
} = exportedForTesting;

describe("padGapsWithZeroRates", () => {
  it("should throw error when there are rates with overlapping time ranges", () => {
    expect(() =>
      padGapsWithZeroRates([
        { startTime: "00:00", endTime: "12:00", amount: 2 },
        { startTime: "10:00", endTime: "12:00", amount: 2 },
      ])
    ).toThrowError("Overlap in intervals!");
  });

  it("should pad entire day with a $0 charge when no rates are provided", () => {
    expect(padGapsWithZeroRates([])).toStrictEqual([
      { startTime: "00:00", endTime: "24:00", amount: 0 },
    ]);
  });

  it("should pad correctly when there's 1 rate that spans the entire day", () => {
    expect(
      padGapsWithZeroRates([
        { startTime: "00:00", endTime: "24:00", amount: 2 },
      ])
    ).toStrictEqual([{ startTime: "00:00", endTime: "24:00", amount: 2 }]);
  });

  it("should pad correctly when there's only 1 rate", () => {
    expect(
      padGapsWithZeroRates([
        { startTime: "08:00", endTime: "10:00", amount: 2 },
      ])
    ).toStrictEqual([
      { startTime: "00:00", endTime: "08:00", amount: 0 },
      { startTime: "08:00", endTime: "10:00", amount: 2 },
      { startTime: "10:00", endTime: "24:00", amount: 0 },
    ]);
  });

  it("should pad correctly when there's 2 consecutive rates", () => {
    expect(
      padGapsWithZeroRates([
        { startTime: "08:00", endTime: "10:00", amount: 2 },
        { startTime: "10:00", endTime: "11:00", amount: 3 },
      ])
    ).toStrictEqual([
      { startTime: "00:00", endTime: "08:00", amount: 0 },
      { startTime: "08:00", endTime: "10:00", amount: 2 },
      { startTime: "10:00", endTime: "11:00", amount: 3 },
      { startTime: "11:00", endTime: "24:00", amount: 0 },
    ]);
  });

  it("should pad correctly when there's 2 rates with a gap between", () => {
    expect(
      padGapsWithZeroRates([
        { startTime: "08:00", endTime: "10:00", amount: 2 },
        { startTime: "23:00", endTime: "24:00", amount: 3 },
      ])
    ).toStrictEqual([
      { startTime: "00:00", endTime: "08:00", amount: 0 },
      { startTime: "08:00", endTime: "10:00", amount: 2 },
      { startTime: "10:00", endTime: "23:00", amount: 0 },
      { startTime: "23:00", endTime: "24:00", amount: 3 },
    ]);
  });
});

describe("collapseRates", () => {
  it("should return empty array if there are no rates", () => {
    expect(collapseRates([])).toStrictEqual([]);
  });

  it("should return the same rates if no transformations need to made", () => {
    expect(
      collapseRates([{ startTime: "00:00", endTime: "24:00", amount: 0 }])
    ).toStrictEqual([{ startTime: "00:00", endTime: "24:00", amount: 0 }]);
  });

  it("should collapse same positive rates together", () => {
    expect(
      collapseRates([
        { startTime: "09:00", endTime: "10:00", amount: 1 },
        { startTime: "10:00", endTime: "11:00", amount: 1 },
      ])
    ).toStrictEqual([{ startTime: "09:00", endTime: "11:00", amount: 1 }]);
  });

  it("should collapse same zero rates together", () => {
    expect(
      collapseRates([
        { startTime: "09:00", endTime: "10:00", amount: 0 },
        { startTime: "10:00", endTime: "11:00", amount: 0 },
      ])
    ).toStrictEqual([{ startTime: "09:00", endTime: "11:00", amount: 0 }]);
  });

  it("should collapse same rates together", () => {
    expect(
      collapseRates([
        { startTime: "09:00", endTime: "10:00", amount: 1 },
        { startTime: "10:00", endTime: "11:00", amount: 1 },
        { startTime: "11:00", endTime: "12:00", amount: 0 },
        { startTime: "12:00", endTime: "13:00", amount: 0 },
        { startTime: "13:00", endTime: "14:00", amount: 2 },
      ])
    ).toStrictEqual([
      { startTime: "09:00", endTime: "11:00", amount: 1 },
      { startTime: "11:00", endTime: "13:00", amount: 0 },
      { startTime: "13:00", endTime: "14:00", amount: 2 },
    ]);
  });

  it("should collapse correctly when there are gaps in the time intervals", () => {
    expect(
      collapseRates([
        { startTime: "09:00", endTime: "10:00", amount: 1 },
        { startTime: "10:00", endTime: "11:00", amount: 1 },
        { startTime: "12:00", endTime: "13:00", amount: 0 },
        { startTime: "14:00", endTime: "15:00", amount: 2 },
        { startTime: "15:00", endTime: "15:30", amount: 2 },
        { startTime: "16:00", endTime: "17:00", amount: 3 },
      ])
    ).toStrictEqual([
      { startTime: "09:00", endTime: "11:00", amount: 1 },
      { startTime: "12:00", endTime: "13:00", amount: 0 },
      { startTime: "14:00", endTime: "15:30", amount: 2 },
      { startTime: "16:00", endTime: "17:00", amount: 3 },
    ]);
  });
});

describe("extractStartAndEndTime", () => {
  it("should extract and format the start and end times correctly", () => {
    expect(
      extractStartAndEndTime(
        "motorcycle-weekdays-08-00-09-00",
        "motorcycle-weekdays"
      )
    ).toStrictEqual({
      startTime: "08:00",
      endTime: "09:00",
    });

    expect(
      extractStartAndEndTime(
        "light-goods-vehicles-weekdays-00-00-24-00",
        "light-goods-vehicles-weekdays"
      )
    ).toStrictEqual({
      startTime: "00:00",
      endTime: "24:00",
    });
  });
});

describe("extractGantryRates", () => {
  const gantry = {
    bearing: 121.29359,
    id: "36",
    latitude: 1.2874,
    longitude: 103.79573,
    name: "AYE to City before Alexandra Road",
    zone: "AY1",
    "light-goods-vehicles-weekdays-09-00-09-05": 0.5,
    "light-goods-vehicles-weekdays-09-05-09-25": 1,
    "light-goods-vehicles-weekdays-09-25-09-30": 0.5,
    "motorcycles-weekdays-09-00-09-05": 0.25,
    "motorcycles-weekdays-09-05-09-25": 0.5,
    "motorcycles-weekdays-09-25-09-30": 0.25,
  };

  it("should return 0 maxRateAmount and empty rates array when gantry is undefined", () => {
    expect(
      extractGantryRates(undefined, "Motorcycles", "Weekdays")
    ).toStrictEqual({ maxRateAmount: 0, rates: [] });
  });

  it("should return the correct maxRateAmount and rates when the gantry has rates for the dayType", () => {
    expect(extractGantryRates(gantry, "Motorcycles", "Weekdays")).toStrictEqual(
      {
        maxRateAmount: 0.5,
        rates: [
          { startTime: "00:00", endTime: "09:00", amount: 0 },
          { startTime: "09:00", endTime: "09:05", amount: 0.25 },
          { startTime: "09:05", endTime: "09:25", amount: 0.5 },
          { startTime: "09:25", endTime: "09:30", amount: 0.25 },
          { startTime: "09:30", endTime: "24:00", amount: 0 },
        ],
      }
    );

    expect(
      extractGantryRates(gantry, "Light Goods Vehicles", "Weekdays")
    ).toStrictEqual({
      maxRateAmount: 1,
      rates: [
        { startTime: "00:00", endTime: "09:00", amount: 0 },
        { startTime: "09:00", endTime: "09:05", amount: 0.5 },
        { startTime: "09:05", endTime: "09:25", amount: 1 },
        { startTime: "09:25", endTime: "09:30", amount: 0.5 },
        { startTime: "09:30", endTime: "24:00", amount: 0 },
      ],
    });
  });

  it("should return 0 maxRateAmount and 1 $0 rate when the gantry has no rates for the dayType", () => {
    expect(extractGantryRates(gantry, "Motorcycles", "Saturday")).toStrictEqual(
      {
        maxRateAmount: 0,
        rates: [{ startTime: "00:00", endTime: "24:00", amount: 0 }],
      }
    );

    expect(
      extractGantryRates(gantry, "Light Goods Vehicles", "Saturday")
    ).toStrictEqual({
      maxRateAmount: 0,
      rates: [{ startTime: "00:00", endTime: "24:00", amount: 0 }],
    });
  });
});
