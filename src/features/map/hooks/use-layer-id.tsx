import type { DayType, VehicleType } from "src/types";

import { useFetchJSON } from "src/hooks/use-fetch-json";
import { slugify } from "src/utils/slugify";

import { pickSplit } from "../utils/pick-split";

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
