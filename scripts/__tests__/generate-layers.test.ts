import { padGapsWithZeroRates } from "../generate-layers";

describe("generate-layers", () => {
  describe("padGapsWithZeroRates", () => {
    it("should throw error when there are rates with overlapping time ranges", () => {
      expect(() =>
        padGapsWithZeroRates([
          {
            StartTime: "00:00",
            EndTime: "12:00",
            ChargeAmount: 2,
          },
          {
            StartTime: "10:00",
            EndTime: "12:00",
            ChargeAmount: 2,
          },
        ])
      ).toThrowError("Overlap in intervals!");
    });

    it("should pad entire day with a $0 charge when no rates are provided", () => {
      expect(padGapsWithZeroRates([])).toStrictEqual([
        {
          StartTime: "00:00",
          EndTime: "24:00",
          ChargeAmount: 0,
        },
      ]);
    });

    it("should pad correctly when there's 1 rate that spans the entire day", () => {
      expect(
        padGapsWithZeroRates([
          {
            StartTime: "00:00",
            EndTime: "24:00",
            ChargeAmount: 2,
          },
        ])
      ).toStrictEqual([
        {
          StartTime: "00:00",
          EndTime: "24:00",
          ChargeAmount: 2,
        },
      ]);
    });

    it("should pad correctly when there's only 1 rate", () => {
      expect(
        padGapsWithZeroRates([
          {
            StartTime: "08:00",
            EndTime: "10:00",
            ChargeAmount: 2,
          },
        ])
      ).toStrictEqual([
        {
          StartTime: "00:00",
          EndTime: "08:00",
          ChargeAmount: 0,
        },
        {
          StartTime: "08:00",
          EndTime: "10:00",
          ChargeAmount: 2,
        },
        {
          StartTime: "10:00",
          EndTime: "24:00",
          ChargeAmount: 0,
        },
      ]);
    });

    it("should pad correctly when there's 2 consecutive rates", () => {
      expect(
        padGapsWithZeroRates([
          {
            StartTime: "08:00",
            EndTime: "10:00",
            ChargeAmount: 2,
          },
          {
            StartTime: "10:00",
            EndTime: "11:00",
            ChargeAmount: 3,
          },
        ])
      ).toStrictEqual([
        {
          StartTime: "00:00",
          EndTime: "08:00",
          ChargeAmount: 0,
        },
        {
          StartTime: "08:00",
          EndTime: "10:00",
          ChargeAmount: 2,
        },
        {
          StartTime: "10:00",
          EndTime: "11:00",
          ChargeAmount: 3,
        },
        {
          StartTime: "11:00",
          EndTime: "24:00",
          ChargeAmount: 0,
        },
      ]);
    });

    it("should pad correctly when there's 2 rates with a gap between", () => {
      expect(
        padGapsWithZeroRates([
          {
            StartTime: "08:00",
            EndTime: "10:00",
            ChargeAmount: 2,
          },
          {
            StartTime: "23:00",
            EndTime: "24:00",
            ChargeAmount: 3,
          },
        ])
      ).toStrictEqual([
        {
          StartTime: "00:00",
          EndTime: "08:00",
          ChargeAmount: 0,
        },
        {
          StartTime: "08:00",
          EndTime: "10:00",
          ChargeAmount: 2,
        },
        {
          StartTime: "10:00",
          EndTime: "23:00",
          ChargeAmount: 0,
        },
        {
          StartTime: "23:00",
          EndTime: "24:00",
          ChargeAmount: 3,
        },
      ]);
    });
  });
});
