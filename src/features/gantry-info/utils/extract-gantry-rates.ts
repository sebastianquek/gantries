import type { Rate } from "../types";
import type { DayType, Gantry, VehicleType } from "src/types";

import { slugify } from "src/utils/slugify";

const DAY_START_TIME = "00:00";
const DAY_END_TIME = "24:00";

/**
 * Given an array of rates, adds $0 rates of the missing intervals.
 * Does not mutate the rates param.
 *
 * Preconditions:
 * - `rates` are sorted by ascending start time
 *
 * @param rates Sorted by ascending start time
 * @returns Array of rates that spans the entire day
 */
const padGapsWithZeroRates = (rates: Rate[]) => {
  const paddedRates: typeof rates = [];

  for (const rate of rates) {
    const currentStartTime = rate.startTime;
    const previousEndTime =
      paddedRates[paddedRates.length - 1]?.endTime ?? DAY_START_TIME;

    if (currentStartTime === previousEndTime) {
      // current time range is directly after previous range
      paddedRates.push(rate);
    } else if (currentStartTime > previousEndTime) {
      // there's a gap in time range, so add a $0 rate
      paddedRates.push({
        startTime: previousEndTime,
        endTime: currentStartTime,
        amount: 0,
      });

      // then add the current rate
      paddedRates.push(rate);
    } else {
      throw new Error("Overlap in intervals!");
    }
  }

  const lastRateEndTime =
    paddedRates[paddedRates.length - 1]?.endTime ?? DAY_START_TIME;
  if (lastRateEndTime !== DAY_END_TIME) {
    // Add a rate that ends at DAY_END_TIME
    paddedRates.push({
      startTime: lastRateEndTime,
      endTime: DAY_END_TIME,
      amount: 0,
    });
  }

  return paddedRates;
};

/**
 * Given an array of rates, if multiple consecutive rates are the same,
 * they collapse into 1 time interval.
 * Does not mutate the rates param.
 *
 * Preconditions:
 * - `rates` are sorted by ascending start time
 *
 * @param rates Sorted by ascending start time
 * @returns Array of rates with consecutive of the same rate collapsed
 */
const collapseRates = (rates: Rate[]) => {
  const collapsedRates: Rate[] = [];

  for (const rate of rates) {
    const previousRate = collapsedRates[collapsedRates.length - 1];
    if (
      !previousRate ||
      rate.startTime !== previousRate.endTime || // Not consecutive, need to add a new entry
      rate.amount !== previousRate.amount // Current is different from previous
    ) {
      collapsedRates.push(rate);
    } else {
      previousRate.endTime = rate.endTime;
    }
  }

  return collapsedRates;
};

/**
 * Given a string such as "motorcycle-weekdays-08-00-09-00", extracts
 * out the start and end times.
 *
 * @param str
 * @param rateKeyPrefix
 * @returns start and end time
 */
const extractStartAndEndTime = (str: string, rateKeyPrefix: string) => {
  const rawInterval = str.slice(rateKeyPrefix.length + 1).replaceAll("-", ":");
  const startTime = `${rawInterval.slice(0, 5)}`;
  const endTime = `${rawInterval.slice(6)}`;
  return { startTime, endTime };
};

export const extractGantryRates = ({
  gantry,
  vehicleType,
  dayType,
}: {
  gantry: Gantry | undefined;
  vehicleType: VehicleType;
  dayType: DayType;
}) => {
  const rateKeyPrefix = slugify(`${vehicleType}-${dayType}`);
  let maxRateAmount = 0;
  let rates: Rate[] = [];

  if (gantry) {
    rates = Object.entries(gantry)
      .filter(([key]) => key.startsWith(rateKeyPrefix))
      .sort()
      .reduce((ratesArr, [key, value]) => {
        const { startTime, endTime } = extractStartAndEndTime(
          key,
          rateKeyPrefix
        );
        const amount = Number(value);
        maxRateAmount = Math.max(maxRateAmount, amount);
        ratesArr.push({
          startTime,
          endTime,
          amount,
        });
        return ratesArr;
      }, [] as { startTime: string; endTime: string; amount: number }[]);

    rates = collapseRates(rates);
    rates = padGapsWithZeroRates(rates);
  }

  return {
    maxRateAmount,
    rates,
  };
};

export const exportedForTesting = {
  padGapsWithZeroRates,
  collapseRates,
  extractStartAndEndTime,
  extractGantryRates,
};
