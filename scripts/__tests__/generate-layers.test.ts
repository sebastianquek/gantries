import {
  collapseRates,
  getGantryOperationalStatusByTime,
  getSplits,
  padGapsWithZeroRates,
  splitRates,
} from "../generate-layers";

describe("generate-layers", () => {
  describe("padGapsWithZeroRates", () => {
    it("should throw error when there are rates with overlapping time ranges", () => {
      expect(() =>
        padGapsWithZeroRates([
          { StartTime: "00:00", EndTime: "12:00", ChargeAmount: 2 },
          { StartTime: "10:00", EndTime: "12:00", ChargeAmount: 2 },
        ])
      ).toThrowError("Overlap in intervals!");
    });

    it("should pad entire day with a $0 charge when no rates are provided", () => {
      expect(padGapsWithZeroRates([])).toStrictEqual([
        { StartTime: "00:00", EndTime: "24:00", ChargeAmount: 0 },
      ]);
    });

    it("should pad correctly when there's 1 rate that spans the entire day", () => {
      expect(
        padGapsWithZeroRates([
          { StartTime: "00:00", EndTime: "24:00", ChargeAmount: 2 },
        ])
      ).toStrictEqual([
        { StartTime: "00:00", EndTime: "24:00", ChargeAmount: 2 },
      ]);
    });

    it("should pad correctly when there's only 1 rate", () => {
      expect(
        padGapsWithZeroRates([
          { StartTime: "08:00", EndTime: "10:00", ChargeAmount: 2 },
        ])
      ).toStrictEqual([
        { StartTime: "00:00", EndTime: "08:00", ChargeAmount: 0 },
        { StartTime: "08:00", EndTime: "10:00", ChargeAmount: 2 },
        { StartTime: "10:00", EndTime: "24:00", ChargeAmount: 0 },
      ]);
    });

    it("should pad correctly when there's 2 consecutive rates", () => {
      expect(
        padGapsWithZeroRates([
          { StartTime: "08:00", EndTime: "10:00", ChargeAmount: 2 },
          { StartTime: "10:00", EndTime: "11:00", ChargeAmount: 3 },
        ])
      ).toStrictEqual([
        { StartTime: "00:00", EndTime: "08:00", ChargeAmount: 0 },
        { StartTime: "08:00", EndTime: "10:00", ChargeAmount: 2 },
        { StartTime: "10:00", EndTime: "11:00", ChargeAmount: 3 },
        { StartTime: "11:00", EndTime: "24:00", ChargeAmount: 0 },
      ]);
    });

    it("should pad correctly when there's 2 rates with a gap between", () => {
      expect(
        padGapsWithZeroRates([
          { StartTime: "08:00", EndTime: "10:00", ChargeAmount: 2 },
          { StartTime: "23:00", EndTime: "24:00", ChargeAmount: 3 },
        ])
      ).toStrictEqual([
        { StartTime: "00:00", EndTime: "08:00", ChargeAmount: 0 },
        { StartTime: "08:00", EndTime: "10:00", ChargeAmount: 2 },
        { StartTime: "10:00", EndTime: "23:00", ChargeAmount: 0 },
        { StartTime: "23:00", EndTime: "24:00", ChargeAmount: 3 },
      ]);
    });
  });

  describe("collapseRates", () => {
    it("should return empty array if there are no rates", () => {
      expect(collapseRates([])).toStrictEqual([]);
    });

    it("should return the same rates if no transformations need to made", () => {
      expect(
        collapseRates([
          { StartTime: "00:00", EndTime: "24:00", ChargeAmount: 0 },
        ])
      ).toStrictEqual([
        { StartTime: "00:00", EndTime: "24:00", IsOperational: false },
      ]);
    });

    it("should collapse positive rates together", () => {
      expect(
        collapseRates([
          { StartTime: "09:00", EndTime: "10:00", ChargeAmount: 1 },
          { StartTime: "10:00", EndTime: "11:00", ChargeAmount: 2 },
        ])
      ).toStrictEqual([
        { StartTime: "09:00", EndTime: "11:00", IsOperational: true },
      ]);
    });

    it("should collapse zero rates together", () => {
      expect(
        collapseRates([
          { StartTime: "09:00", EndTime: "10:00", ChargeAmount: 0 },
          { StartTime: "10:00", EndTime: "11:00", ChargeAmount: 0 },
        ])
      ).toStrictEqual([
        { StartTime: "09:00", EndTime: "11:00", IsOperational: false },
      ]);
    });

    it("should collapse positive rates together, and 0 rates together", () => {
      expect(
        collapseRates([
          { StartTime: "09:00", EndTime: "10:00", ChargeAmount: 1 },
          { StartTime: "10:00", EndTime: "11:00", ChargeAmount: 2 },
          { StartTime: "11:00", EndTime: "12:00", ChargeAmount: 0 },
          { StartTime: "12:00", EndTime: "13:00", ChargeAmount: 0 },
          { StartTime: "13:00", EndTime: "14:00", ChargeAmount: 2 },
        ])
      ).toStrictEqual([
        { StartTime: "09:00", EndTime: "11:00", IsOperational: true },
        { StartTime: "11:00", EndTime: "13:00", IsOperational: false },
        { StartTime: "13:00", EndTime: "14:00", IsOperational: true },
      ]);
    });

    it("should collapse correctly when there are gaps in the time intervals", () => {
      expect(
        collapseRates([
          { StartTime: "09:00", EndTime: "10:00", ChargeAmount: 1 },
          { StartTime: "12:00", EndTime: "13:00", ChargeAmount: 0 },
          { StartTime: "14:00", EndTime: "15:00", ChargeAmount: 2 },
          { StartTime: "16:00", EndTime: "17:00", ChargeAmount: 3 },
        ])
      ).toStrictEqual([
        { StartTime: "09:00", EndTime: "10:00", IsOperational: true },
        { StartTime: "12:00", EndTime: "13:00", IsOperational: false },
        { StartTime: "14:00", EndTime: "15:00", IsOperational: true },
        { StartTime: "16:00", EndTime: "17:00", IsOperational: true },
      ]);
    });
  });

  describe("splitRates", () => {
    it("should not split rates if splits is empty", () => {
      expect(
        splitRates([{ StartTime: "00:00", EndTime: "10:00" }], [])
      ).toStrictEqual([{ StartTime: "00:00", EndTime: "10:00" }]);
    });

    it("should return empty array if rates are empty", () => {
      expect(splitRates([], [])).toStrictEqual([]);
      expect(splitRates([], ["10:00"])).toStrictEqual([]);
    });

    it("should split a single rate into 2", () => {
      expect(
        splitRates([{ StartTime: "00:00", EndTime: "10:00" }], ["08:00"])
      ).toStrictEqual([
        { StartTime: "00:00", EndTime: "08:00" },
        { StartTime: "08:00", EndTime: "10:00" },
      ]);
    });

    it("should not split rates whose start time is same as a split", () => {
      expect(
        splitRates([{ StartTime: "00:00", EndTime: "10:00" }], ["00:00"])
      ).toStrictEqual([{ StartTime: "00:00", EndTime: "10:00" }]);
    });

    it("should not split rates whose end time is same as a split", () => {
      expect(
        splitRates(
          [
            { StartTime: "07:00", EndTime: "08:00" },
            { StartTime: "08:00", EndTime: "10:00" },
          ],
          ["10:00"]
        )
      ).toStrictEqual([
        { StartTime: "07:00", EndTime: "08:00" },
        { StartTime: "08:00", EndTime: "10:00" },
      ]);
    });

    it("should not split rates that are outside of the splits", () => {
      expect(
        splitRates(
          [
            { StartTime: "09:00", EndTime: "10:00" },
            { StartTime: "12:00", EndTime: "13:00" },
          ],
          ["08:00", "11:00"]
        )
      ).toStrictEqual([
        { StartTime: "09:00", EndTime: "10:00" },
        { StartTime: "12:00", EndTime: "13:00" },
      ]);
    });

    it("should split a single rate multiple times", () => {
      expect(
        splitRates(
          [{ StartTime: "08:00", EndTime: "12:00" }],
          ["07:00", "09:00", "10:00", "11:00"]
        )
      ).toStrictEqual([
        { StartTime: "08:00", EndTime: "09:00" },
        { StartTime: "09:00", EndTime: "10:00" },
        { StartTime: "10:00", EndTime: "11:00" },
        { StartTime: "11:00", EndTime: "12:00" },
      ]);
    });

    it("should include additional properties correctly", () => {
      expect(
        splitRates(
          [
            { StartTime: "08:00", EndTime: "12:00", NewProperty: "hello" },
            { StartTime: "12:00", EndTime: "14:00", ChargeAmount: 2 },
            { StartTime: "14:00", EndTime: "15:00", IsOperational: true },
          ],
          ["07:00", "09:00", "13:00"]
        )
      ).toStrictEqual([
        { StartTime: "08:00", EndTime: "09:00", NewProperty: "hello" },
        { StartTime: "09:00", EndTime: "12:00", NewProperty: "hello" },
        { StartTime: "12:00", EndTime: "13:00", ChargeAmount: 2 },
        { StartTime: "13:00", EndTime: "14:00", ChargeAmount: 2 },
        { StartTime: "14:00", EndTime: "15:00", IsOperational: true },
      ]);
    });
  });

  describe("getSplits", () => {
    it("should return empty set when there are no rates", () => {
      expect(getSplits([])).toStrictEqual(new Set());
    });

    it("should return correct set when there's only 1 rate", () => {
      expect(
        getSplits([{ StartTime: "08:00", EndTime: "10:00" }])
      ).toStrictEqual(new Set(["08:00", "10:00"]));
    });

    it("should return correct set when there are 2 rates with no overlap", () => {
      expect(
        getSplits([
          { StartTime: "08:00", EndTime: "10:00" },
          { StartTime: "10:00", EndTime: "11:00" },
        ])
      ).toStrictEqual(new Set(["08:00", "10:00", "11:00"]));
    });

    it("should return correct set when there are 2 rates with overlaps", () => {
      // Note that overlaps occur because the rates could belong to different zones
      expect(
        getSplits([
          { StartTime: "08:00", EndTime: "10:00", ZoneID: "ABC" },
          { StartTime: "09:00", EndTime: "11:00", ZoneID: "DEF" },
        ])
      ).toStrictEqual(new Set(["08:00", "10:00", "09:00", "11:00"]));
    });
  });

  describe("getGantryOperationalStatusByTime", () => {
    it("should return correct result when there's only 1 zone with non-consecutive positive rates", () => {
      expect(
        getGantryOperationalStatusByTime([
          {
            StartTime: "08:00",
            EndTime: "10:00",
            ChargeAmount: 2,
            ZoneID: "ABC",
          },
          {
            StartTime: "11:00",
            EndTime: "12:00",
            ChargeAmount: 1.5,
            ZoneID: "ABC",
          },
        ])
      ).toStrictEqual({
        "08:00-10:00": {
          ABC: true,
        },
        "11:00-12:00": {
          ABC: true,
        },
      });
    });

    it("should return correct result when there's only 1 zone with consecutive positive rates", () => {
      expect(
        getGantryOperationalStatusByTime([
          {
            StartTime: "08:00",
            EndTime: "10:00",
            ChargeAmount: 2,
            ZoneID: "ABC",
          },
          {
            StartTime: "10:00",
            EndTime: "12:00",
            ChargeAmount: 1.5,
            ZoneID: "ABC",
          },
        ])
      ).toStrictEqual({
        "08:00-12:00": {
          ABC: true,
        },
      });
    });

    it("should return correct result when there's 2 zones with 1 interval", () => {
      expect(
        getGantryOperationalStatusByTime([
          {
            StartTime: "08:00",
            EndTime: "10:00",
            ChargeAmount: 2,
            ZoneID: "ABC",
          },
          {
            StartTime: "08:00",
            EndTime: "10:00",
            ChargeAmount: 1.5,
            ZoneID: "DEF",
          },
        ])
      ).toStrictEqual({
        "08:00-10:00": {
          ABC: true,
          DEF: true,
        },
      });
    });

    it("should return correct result when there's 2 zones with 2 different intervals that do not overlap", () => {
      expect(
        getGantryOperationalStatusByTime([
          {
            StartTime: "08:00",
            EndTime: "10:00",
            ChargeAmount: 2,
            ZoneID: "ABC",
          },
          {
            StartTime: "10:00",
            EndTime: "11:00",
            ChargeAmount: 1.5,
            ZoneID: "DEF",
          },
        ])
      ).toStrictEqual({
        "08:00-10:00": {
          ABC: true,
        },
        "10:00-11:00": {
          DEF: true,
        },
      });
    });

    it("should return correct result when there's 2 zones with 2 different intervals that overlap", () => {
      expect(
        getGantryOperationalStatusByTime([
          {
            StartTime: "08:00",
            EndTime: "10:00",
            ChargeAmount: 2,
            ZoneID: "ABC",
          },
          {
            StartTime: "09:00",
            EndTime: "11:00",
            ChargeAmount: 1.5,
            ZoneID: "DEF",
          },
        ])
      ).toStrictEqual({
        "08:00-09:00": {
          ABC: true,
        },
        "09:00-10:00": {
          ABC: true,
          DEF: true,
        },
        "10:00-11:00": {
          DEF: true,
        },
      });
    });
  });
});
