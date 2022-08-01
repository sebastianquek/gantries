export const VEHICLE_TYPES = [
  "Passenger Cars/Light Goods Vehicles/Taxis",
  "Motorcycles",
  "Heavy Goods Vehicles/Small Buses",
  "Very Heavy Goods Vehicles/Big Buses",
  "Light Goods Vehicles",
  "Taxis",
] as const;

export const DAY_TYPES = ["Weekdays", "Saturday"] as const;

export const GANTRY_BASE_LAYER_ID = "operational-base";
export const GANTRY_SOURCE_LAYER = process.env.REACT_APP_MAPBOX_TILESET_ID;

export const RATES_EFFECTIVE_DATE = process.env.REACT_APP_RATES_EFFECTIVE_DATE;
