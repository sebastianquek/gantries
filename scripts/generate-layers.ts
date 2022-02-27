import type { Rate } from "./types";

import { groupBy } from "lodash";

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

/**
 * Given an array of rates, replaces the charge amount with a boolean defining
 * if the gantry is operational during the time interval.
 * If multiple consecutive rates are positive, they collapse into 1 time interval.
 * Does not mutate the rates param.
 *
 * @param rates Sorted by ascending start time
 * @returns Array of whether a gantry is operational for the time intervals
 */
export const collapseRates = <
  T extends Pick<Rate, "StartTime" | "EndTime" | "ChargeAmount">
>(
  rates: T[]
) => {
  const collapsedRates: (Omit<T, "ChargeAmount"> & {
    IsOperational: boolean;
  })[] = [];

  for (const rate of rates) {
    const previousRate = collapsedRates[collapsedRates.length - 1];
    if (
      !previousRate ||
      rate.StartTime !== previousRate.EndTime || // Not consecutive, need to add a new entry
      (rate.ChargeAmount > 0 && !previousRate.IsOperational) || // Current is operational while previous is not
      (rate.ChargeAmount === 0 && previousRate.IsOperational) // Current is not operational while previous is
    ) {
      const { ChargeAmount, ...rest } = rate;
      collapsedRates.push({ ...rest, IsOperational: ChargeAmount > 0 });
    } else {
      previousRate.EndTime = rate.EndTime;
    }
  }

  return collapsedRates;
};

/**
 * Splits rates into multiple time intervals if the start time does not match with
 * one of the specified splits.
 * Does not mutate the rates param.
 *
 * @param rates Sorted by ascending start time
 * @param splits Sorted by ascending value
 * @returns
 */
export const splitRates = <T extends Pick<Rate, "StartTime" | "EndTime">>(
  rates: T[],
  splits: string[]
) => {
  const processedRates: typeof rates = [];
  let rateIdx = 0;
  let splitIdx = 0;
  let candidateRate: typeof rates[0] | undefined;

  while (rateIdx < rates.length && splitIdx < splits.length) {
    if (!candidateRate) candidateRate = rates[rateIdx];
    const split = splits[splitIdx];

    if (candidateRate.EndTime <= split) {
      // Split is after the current interval
      processedRates.push(candidateRate);
      candidateRate = undefined;
      rateIdx += 1;
    } else if (split <= candidateRate.StartTime) {
      // Split is before the current interval
      splitIdx += 1;
    } else {
      // rate.EndTime > split && split > rate.StartTime
      processedRates.push({
        ...candidateRate,
        EndTime: split,
      });
      candidateRate.StartTime = split;
      splitIdx += 1;
    }
  }

  if (candidateRate) {
    processedRates.push(candidateRate);
    rateIdx += 1;
  }

  if (rateIdx < rates.length) {
    rates.slice(rateIdx, rates.length).forEach((r) => processedRates.push(r));
  }

  return processedRates;
};

/**
 * For the given rates, gets all the unique times.
 *
 * @param rates
 * @returns Set of times (splits)
 */
export const getSplits = <T extends Pick<Rate, "StartTime" | "EndTime">>(
  rates: T[]
) => {
  const splits = new Set<string>();
  for (const rate of rates) {
    splits.add(rate.StartTime);
    splits.add(rate.EndTime);
  }
  return splits;
};

/**
 * Gets the operational status of each gantry at every time interval.
 * The time intervals are calculated in a manner that minimises the number of
 * time intervals.
 *
 * @param rates Sorted by ascending start time
 * @returns Object that defines if a gantry is operational at a time interval
 */
export const getGantryOperationalStatusByTime = <
  T extends Pick<Rate, "StartTime" | "EndTime" | "ChargeAmount" | "ZoneID">
>(
  rates: T[]
) => {
  const splitsAcrossAllZones = new Set<string>();
  const ratesByZone = groupBy(rates, "ZoneID");
  const collapsedRatesByZone: {
    [zoneId: string]: ReturnType<typeof collapseRates>;
  } = {};

  // Collapse rates for each zone and find the time intervals (splits)
  for (const [zoneId, ratesOfZone] of Object.entries(ratesByZone)) {
    const collapsedRates = collapseRates(ratesOfZone);
    collapsedRatesByZone[zoneId] = collapsedRates;

    // Find time intervals and add them to the splits across all zones;
    const foundSplits = getSplits(collapsedRates);
    for (const foundSplit of Array.from(foundSplits)) {
      splitsAcrossAllZones.add(foundSplit);
    }
  }

  // Sets are not ordered, converting to array to be sorted
  const sortedSplitsArr = Array.from(splitsAcrossAllZones).sort();
  const result: {
    [timeInterval: string]: {
      [zoneId: string]: boolean;
    };
  } = {};

  // Adds whether the gantry is operational for each time interval (split)
  for (const [zoneId, ratesOfZone] of Object.entries(collapsedRatesByZone)) {
    const splitRatesOfZone = splitRates(ratesOfZone, sortedSplitsArr);
    for (const splitRate of splitRatesOfZone) {
      const key = `${splitRate.StartTime}-${splitRate.EndTime}`;
      result[key] = { ...result[key], [zoneId]: splitRate.IsOperational };
    }
  }

  return result;
};
