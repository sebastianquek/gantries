import { filterRates } from "../filter-rates";

describe("filterRates", () => {
  it("should return empty array if no rates are provided", () => {
    expect(filterRates([], "all", "doesnt-matter")).toStrictEqual([]);
    expect(filterRates([], "minimal", "doesnt-matter")).toStrictEqual([]);
  });

  it("should return all rates if viewType is 'all'", () => {
    expect(
      filterRates(
        [{ amount: 1, startTime: "08:00", endTime: "09:00" }],
        "all",
        "doesnt-matter"
      )
    ).toStrictEqual([{ amount: 1, startTime: "08:00", endTime: "09:00" }]);

    expect(
      filterRates(
        [
          { amount: 0, startTime: "00:00", endTime: "08:00" },
          { amount: 0.25, startTime: "08:00", endTime: "08:05" },
          { amount: 0.5, startTime: "08:05", endTime: "08:30" },
          { amount: 1, startTime: "08:30", endTime: "08:35" },
          { amount: 1.5, startTime: "08:35", endTime: "09:55" },
        ],
        "all",
        "doesnt-matter"
      )
    ).toStrictEqual([
      { amount: 0, startTime: "00:00", endTime: "08:00" },
      { amount: 0.25, startTime: "08:00", endTime: "08:05" },
      { amount: 0.5, startTime: "08:05", endTime: "08:30" },
      { amount: 1, startTime: "08:30", endTime: "08:35" },
      { amount: 1.5, startTime: "08:35", endTime: "09:55" },
    ]);
  });

  it("should return all rates if viewType is 'minimal' but there are 4 or fewer rates", () => {
    expect(
      filterRates(
        [{ amount: 0, startTime: "00:00", endTime: "08:00" }],
        "minimal",
        "doesnt-matter"
      )
    ).toStrictEqual([{ amount: 0, startTime: "00:00", endTime: "08:00" }]);

    expect(
      filterRates(
        [
          { amount: 0, startTime: "00:00", endTime: "08:00" },
          { amount: 0.25, startTime: "08:00", endTime: "08:05" },
          { amount: 0.5, startTime: "08:05", endTime: "08:30" },
          { amount: 1, startTime: "08:30", endTime: "08:35" },
        ],
        "minimal",
        "doesnt-matter"
      )
    ).toStrictEqual([
      { amount: 0, startTime: "00:00", endTime: "08:00" },
      { amount: 0.25, startTime: "08:00", endTime: "08:05" },
      { amount: 0.5, startTime: "08:05", endTime: "08:30" },
      { amount: 1, startTime: "08:30", endTime: "08:35" },
    ]);
  });

  it("should return filtered rates if viewType is 'minimal', there are more than 4 rates", () => {
    const rates = [
      { amount: 0, startTime: "00:00", endTime: "08:00" },
      { amount: 0.25, startTime: "08:00", endTime: "08:05" },
      { amount: 0.5, startTime: "08:05", endTime: "08:30" },
      { amount: 1, startTime: "08:30", endTime: "08:35" },
      { amount: 1.5, startTime: "08:35", endTime: "09:55" },
    ];

    expect(filterRates(rates, "minimal", "00:00")).toStrictEqual(
      rates.slice(0, 4)
    );
    expect(filterRates(rates, "minimal", "07:00")).toStrictEqual(
      rates.slice(0, 4)
    );

    // The interval "08:30" - "08:35" is first in the list because the time
    // provided is within this interval.
    // Rates are looped around so that the returned array always has 4 rates
    expect(filterRates(rates, "minimal", "08:32")).toStrictEqual([
      rates[3],
      rates[4],
      rates[0],
      rates[1],
    ]);
  });

  it("should return empty array if viewType is 'minimal' and there are more than 4 rates, but the provided time is not found in any interval", () => {
    // Note that this case should never happen as the rates should not have any gaps within a 24 hour period.
    const rates = [
      { amount: 0, startTime: "00:00", endTime: "08:00" },
      { amount: 0.25, startTime: "08:00", endTime: "08:05" },
      { amount: 0.5, startTime: "08:05", endTime: "08:30" },
      { amount: 1, startTime: "08:30", endTime: "08:35" },
      { amount: 1.5, startTime: "08:35", endTime: "09:55" },
    ];

    expect(filterRates(rates, "minimal", "09:55")).toStrictEqual([]);
    expect(filterRates(rates, "minimal", "10:00")).toStrictEqual([]);
  });
});
