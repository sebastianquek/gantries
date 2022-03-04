import type { Rate } from "./types";

import "dotenv/config";
import { createReadStream, readFileSync, writeFileSync } from "fs";
import { join } from "path";

import axios from "axios";
import FormData from "form-data";

import { flattenRates, generateGantryRates } from "./generate-layers";
import { importCSVasJSON } from "./utils/importCSVasJSON";

const MAPBOX_PUT_TILESET_SOURCE_URL =
  "https://api.mapbox.com/tilesets/v1/sources";
const GANTRY_LOCATIONS_CSV_FILEPATH = join(
  __dirname,
  "../public/data/gantry-locations.csv"
);
const RATES_JSON_FILEPATH = join(__dirname, "../public/data/all-rates.json");
const GANTRIES_GEOJSON_LD_FILEPATH = join(
  __dirname,
  "../public/data/gantries.ld.json"
);

/**
 * Generate GeoJSON for the tileset source based on the gantries and rates.
 * Bearing, longitude and latitude have their fraction digits trimmed to 5 digits.
 *
 * @param gantries
 * @param rawRates
 */
const generateTilesetSourceGeoJSONFeatures = (
  gantries: {
    id: string;
    zone: string;
    name: string;
    bearing: string;
    longitude: string;
    latitude: string;
  }[],
  rawRates: {
    [vehicleTypeAndDayType: string]: Rate[];
  }
) => {
  const rates = generateGantryRates(rawRates);
  const flattenedRates = flattenRates(rates);
  return gantries.map(({ id, zone, name, bearing, longitude, latitude }) => {
    const shortenedLng = Number(Number(longitude).toFixed(5));
    const shortenedLat = Number(Number(latitude).toFixed(5));
    return {
      type: "Feature" as const,
      id,
      properties: {
        id,
        zone,
        name,
        bearing: Number(Number(bearing).toFixed(5)),
        longitude: shortenedLng,
        latitude: shortenedLat,
        ...flattenedRates[zone],
      },
      geometry: {
        type: "Point" as const,
        coordinates: [shortenedLng, shortenedLat] as const,
      },
    };
  });
};

/**
 * Converts GeoJSON point features to line-delimited GeoJSON
 *
 * @param features
 */
const convertGeoJSONPointFeaturestoLDGeoJSON = (
  features: {
    type: "Feature";
    id: string;
    properties: Record<string, string | number | boolean>;
    geometry: {
      type: "Point"; // caters only for points
      coordinates: readonly [number, number];
    };
  }[]
) => {
  return features.map((feature) => JSON.stringify(feature));
};

/**
 * Update/insert the tileset source via Mapbox's API
 *
 * @param baseUrl
 * @param username
 * @param tilesetSourceId
 * @param accessToken
 * @param filepath
 */
const upsertTilesetSource = async (
  baseUrl: string,
  username: string,
  tilesetSourceId: string,
  accessToken: string,
  filepath: string
) => {
  const url = `${baseUrl}/${username}/${tilesetSourceId}?access_token=${accessToken}`;
  const bodyFormData = new FormData();
  bodyFormData.append("file", createReadStream(filepath));
  try {
    const { data } = await axios.put<{ id: string }>(url, bodyFormData, {
      headers: bodyFormData.getHeaders(),
    });
    console.log(data);
  } catch (e) {
    if (axios.isAxiosError(e)) {
      console.log(e.toJSON());
    }
  }
};

const run = async () => {
  const gantries = importCSVasJSON<{
    id: string;
    zone: string;
    name: string;
    bearing: string;
    longitude: string;
    latitude: string;
  }>(GANTRY_LOCATIONS_CSV_FILEPATH);
  const rates: { [vehicleTypeAndDayType: string]: Rate[] } = JSON.parse(
    readFileSync(RATES_JSON_FILEPATH, "utf8")
  );
  const features = generateTilesetSourceGeoJSONFeatures(gantries, rates);
  const ldGeoJSON = convertGeoJSONPointFeaturestoLDGeoJSON(features);

  writeFileSync(GANTRIES_GEOJSON_LD_FILEPATH, ldGeoJSON.join("\n"));
  await upsertTilesetSource(
    MAPBOX_PUT_TILESET_SOURCE_URL,
    process.env.MAPBOX_USERNAME ?? "",
    process.env.MAPBOX_TILESET_SOURCE_ID ?? "",
    process.env.MAPBOX_PRIVATE_ACCESS_TOKEN ?? "",
    GANTRIES_GEOJSON_LD_FILEPATH
  );
};

// Ensures that the fetching does not run when tests are ran on this module.
if (process.env.NODE_ENV !== "test") {
  void run();
}

export const exportedForTesting = {
  generateTilesetSourceGeoJSONFeatures,
  convertGeoJSONPointFeaturestoLDGeoJSON,
  upsertTilesetSource,
};
