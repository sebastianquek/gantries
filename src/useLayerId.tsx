import type { DayType, VehicleType } from "./types";

import { pickSplit } from "./utils/pickSplit";
import { slugify } from "./utils/slugify";
import { useFetchJSON } from "./utils/useFetchJSON";

export const useLayerId = (
  vehicleType: VehicleType,
  dayType: DayType,
  time: string
): string | undefined => {
  const { result: splits } = useFetchJSON<{
    [vehicleAndDayType: string]: string[];
  }>("/data/splits.json");

  if (!splits) {
    return undefined;
  }
  const key = slugify(`${vehicleType}-${dayType}`);
  if (!splits[key]) {
    return undefined;
  }
  const split = pickSplit(time, splits[key]);
  return split ? slugify(`${key}-${split}`) : undefined;
};
