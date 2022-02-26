import { collapseRates, padGapsWithZeroRates } from "../generate-layers";

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

  describe("collapseRates", () => {
    it("should return empty array if there are no rates", () => {
      expect(collapseRates([])).toStrictEqual([]);
    });

    it("should return the same rates if no transformations need to made", () => {
      expect(
        collapseRates([
          {
            StartTime: "00:00",
            EndTime: "24:00",
            ChargeAmount: 0,
          },
        ])
      ).toStrictEqual([
        {
          StartTime: "00:00",
          EndTime: "24:00",
          IsOperational: false,
        },
      ]);
    });

    it("should collapse positive rates together", () => {
      expect(
        collapseRates([
          {
            StartTime: "09:00",
            EndTime: "10:00",
            ChargeAmount: 1,
          },
          {
            StartTime: "10:00",
            EndTime: "11:00",
            ChargeAmount: 2,
          },
        ])
      ).toStrictEqual([
        {
          StartTime: "09:00",
          EndTime: "11:00",
          IsOperational: true,
        },
      ]);
    });

    it("should collapse zero rates together", () => {
      expect(
        collapseRates([
          {
            StartTime: "09:00",
            EndTime: "10:00",
            ChargeAmount: 0,
          },
          {
            StartTime: "10:00",
            EndTime: "11:00",
            ChargeAmount: 0,
          },
        ])
      ).toStrictEqual([
        {
          StartTime: "09:00",
          EndTime: "11:00",
          IsOperational: false,
        },
      ]);
    });

    it("should collapse positive rates together, and 0 rates together", () => {
      expect(
        collapseRates([
          {
            StartTime: "09:00",
            EndTime: "10:00",
            ChargeAmount: 1,
          },
          {
            StartTime: "10:00",
            EndTime: "11:00",
            ChargeAmount: 2,
          },
          {
            StartTime: "11:00",
            EndTime: "12:00",
            ChargeAmount: 0,
          },
          {
            StartTime: "12:00",
            EndTime: "13:00",
            ChargeAmount: 0,
          },
          {
            StartTime: "13:00",
            EndTime: "14:00",
            ChargeAmount: 2,
          },
        ])
      ).toStrictEqual([
        {
          StartTime: "09:00",
          EndTime: "11:00",
          IsOperational: true,
        },
        {
          StartTime: "11:00",
          EndTime: "13:00",
          IsOperational: false,
        },
        {
          StartTime: "13:00",
          EndTime: "14:00",
          IsOperational: true,
        },
      ]);
    });

    it("should collapse correctly when there are gaps in the time intervals", () => {
      expect(
        collapseRates([
          {
            StartTime: "09:00",
            EndTime: "10:00",
            ChargeAmount: 1,
          },
          {
            StartTime: "12:00",
            EndTime: "13:00",
            ChargeAmount: 0,
          },
          {
            StartTime: "14:00",
            EndTime: "15:00",
            ChargeAmount: 2,
          },
          {
            StartTime: "16:00",
            EndTime: "17:00",
            ChargeAmount: 3,
          },
        ])
      ).toStrictEqual([
        {
          StartTime: "09:00",
          EndTime: "10:00",
          IsOperational: true,
        },
        {
          StartTime: "12:00",
          EndTime: "13:00",
          IsOperational: false,
        },
        {
          StartTime: "14:00",
          EndTime: "15:00",
          IsOperational: true,
        },
        {
          StartTime: "16:00",
          EndTime: "17:00",
          IsOperational: true,
        },
      ]);
    });
  });
});
