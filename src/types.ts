import type { dayTypes, vehicleTypes } from "./constants";

export type VehicleType = typeof vehicleTypes[number];
export type DayType = typeof dayTypes[number];

export type Gantry = {
  bearing: number;
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  zone: string;
} & {
  [rate: string]: number;
};
