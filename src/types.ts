import type { DAY_TYPES, VEHICLE_TYPES } from "./constants";

export type VehicleType = typeof VEHICLE_TYPES[number];
export type DayType = typeof DAY_TYPES[number];

export type Gantry = {
  bearing: number;
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  zone: string;
  [rate: string]: string | number;
};

export type OutletContextType = {
  gantry: Gantry | null | undefined;
};
