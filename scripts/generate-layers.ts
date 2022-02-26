import type { Rate } from "./types";

const DAY_START_TIME = "00:00";
const DAY_END_TIME = "24:00";

/**
 * Given an array of rates, adds $0 rates of the missing intervals.
 * Does not mutate the rates param.
 *
 * @param rates Sorted by ascending start time
 * @returns Array of rates that spans the entire day
 */
export const padGapsWithZeroRates = (
  rates: Pick<Rate, "StartTime" | "EndTime" | "ChargeAmount">[]
) => {
  const paddedRates: typeof rates = [];

  for (const rate of rates) {
    const currentStartTime = rate.StartTime;
    const previousEndTime =
      paddedRates[paddedRates.length - 1]?.EndTime ?? DAY_START_TIME;

    if (currentStartTime === previousEndTime) {
      // current time range is directly after previous range
      paddedRates.push(rate);
    } else if (currentStartTime > previousEndTime) {
      // there's a gap in time range, so add a $0 rate
      paddedRates.push({
        StartTime: previousEndTime,
        EndTime: currentStartTime,
        ChargeAmount: 0,
      });

      // then add the current rate
      paddedRates.push(rate);
    } else {
      throw new Error("Overlap in intervals!");
    }
  }

  const lastRateEndTime =
    paddedRates[paddedRates.length - 1]?.EndTime ?? DAY_START_TIME;
  if (lastRateEndTime !== DAY_END_TIME) {
    // Add a rate that ends at DAY_END_TIME
    paddedRates.push({
      StartTime: lastRateEndTime,
      EndTime: DAY_END_TIME,
      ChargeAmount: 0,
    });
  }

  return paddedRates;
};
