import type { DayType, VehicleType } from "./types";
import type { Dispatch, SetStateAction } from "react";

import { useEffect, useState } from "react";

import { pickSplit } from "./utils/pickSplit";
import { slugify } from "./utils/slugify";
import { useFetchJSON } from "./utils/useFetchJSON";

export const useLayerId = (
  vehicleType: VehicleType,
  dayType: DayType,
  time: string
): [string | undefined, Dispatch<SetStateAction<string | undefined>>] => {
  const [layerId, setLayerId] = useState<string>();

  const { result: splits } =
    useFetchJSON<{ [vehicleAndDayType: string]: string[] }>(
      "/data/splits.json"
    );

  /**
   * Update target layer id to toggle on based on
   * vehicleType, dayType and time.
   */
  useEffect(() => {
    if (!splits) {
      return;
    }
    const key = slugify(`${vehicleType}-${dayType}`);
    if (!splits[key]) {
      setLayerId(undefined);
      return;
    }
    const split = pickSplit(time, splits[key]);
    setLayerId(split ? slugify(`${key}-${split}`) : undefined);
  }, [vehicleType, dayType, time, splits]);

  return [layerId, setLayerId];
};
