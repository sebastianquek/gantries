export const VEHICLE_TYPES = [
  "Passenger Cars/Light Goods Vehicles/Taxis",
  "Motorcycles",
  "Heavy Goods Vehicles/Small Buses",
  "Very Heavy Goods Vehicles/Big Buses",
  "Light Goods Vehicles",
  "Taxis",
] as const;

export const DAY_TYPES = ["Weekdays", "Saturday"] as const;

export const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
// Style type is used as a means to toggle between style IDs
// to ensure the latest layers are always shown correctly.
export const MAPBOX_STYLE_TYPE = process.env.REACT_APP_MAPBOX_STYLE_TYPE ?? "A";
export const MAPBOX_STYLE_DARK_A = process.env.REACT_APP_MAPBOX_STYLE_DARK_A;
export const MAPBOX_STYLE_LIGHT_A = process.env.REACT_APP_MAPBOX_STYLE_LIGHT_A;
export const MAPBOX_STYLE_DARK_B = process.env.REACT_APP_MAPBOX_STYLE_DARK_B;
export const MAPBOX_STYLE_LIGHT_B = process.env.REACT_APP_MAPBOX_STYLE_LIGHT_B;

export const GANTRY_BASE_LAYER_ID = "operational-base";
export const GANTRY_SOURCE_LAYER = process.env.REACT_APP_MAPBOX_TILESET_ID;

export const LAST_CHECK_DATE = process.env.REACT_APP_LAST_CHECK_DATE
  ? new Date(Number(process.env.REACT_APP_LAST_CHECK_DATE))
  : undefined;
export const RATES_EFFECTIVE_DATE = process.env.REACT_APP_RATES_EFFECTIVE_DATE;
export const COMMIT_REF = process.env.REACT_APP_COMMIT_REF;
