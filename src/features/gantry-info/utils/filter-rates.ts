import type { Rate, ViewType } from "../types";

export const filterRates = (
  rates: Rate[],
  viewType: ViewType,
  time: string
) => {
  let filteredRates = rates;
  if (viewType === "minimal" && rates.length > 4) {
    const idx = filteredRates.findIndex(({ startTime, endTime }) => {
      return time >= startTime && time < endTime;
    });
    // Ensure at least 0 so the slice doesn't take incorrect elements
    const loopAroundIdx = Math.max(0, 4 - (rates.length - idx));
    filteredRates = [
      ...rates.slice(idx, idx + 4),
      ...rates.slice(0, loopAroundIdx),
    ];
  }
  return filteredRates;
};
