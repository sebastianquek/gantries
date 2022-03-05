import "dotenv/config";
import type { MapboxStyle, Rate } from "./types";

import { readFileSync } from "fs";
import { join } from "path";

import axios from "axios";

import { flattenRates, generateGantryRates } from "./generate-layers";

const RATE_LAYER_ID_PREFIX = "rate";
const OPERATIONAL_LAYER_ID_PREFIX = "operational";
const MAPBOX_RETRIEVE_STYLE_BASE_URL = "https://api.mapbox.com/styles/v1";
const MAPBOX_UPDATE_STYLE_BASE_URL = "https://api.mapbox.com/styles/v1";
const RATES_JSON_FILEPATH = join(__dirname, "../public/data/all-rates.json");

/**
 * Generates layers to be used to show the current rate of each gantry.
 *
 * @param keys
 * @param sourceLayer
 * @param idPrefix
 */
const generateRateLayers = (
  keys: string[],
  sourceLayer: string,
  idPrefix: string
): MapboxStyle["layers"] => {
  return keys.map((key) => ({
    id: `${idPrefix}-${key}`,
    type: "symbol",
    source: "composite",
    "source-layer": sourceLayer,
    paint: {},
    layout: {
      "text-allow-overlap": true,
      "text-field": ["get", key],
      "text-pitch-alignment": "viewport",
      "text-radial-offset": 1.2,
      "text-variable-anchor": ["left"],
      visibility: "none",
    },
  }));
};

/**
 * Generates layers to be used to show whether a gantry is operational.
 *
 * @param keys
 * @param sourceLayer
 * @param idPrefix
 * @param gantryOnSpriteName
 * @param gantryOffSpriteName
 */
const generateOperationalLayers = (
  keys: string[],
  sourceLayer: string,
  idPrefix: string,
  gantryOnSpriteName: string,
  gantryOffSpriteName: string
): MapboxStyle["layers"] => {
  return keys.map((key) => ({
    id: `${idPrefix}-${key}`,
    type: "symbol",
    source: "composite",
    "source-layer": sourceLayer,
    paint: {},
    layout: {
      "icon-allow-overlap": true,
      "icon-image": [
        "case",
        [">", ["to-number", ["get", key], 0], 0],
        gantryOnSpriteName,
        gantryOffSpriteName,
      ],
      "icon-rotate": ["get", "bearing"],
      "icon-rotation-alignment": "map",
      visibility: "none",
    },
  }));
};

/**
 * Retrieves the current style object
 *
 * @param baseRetrieveUrl
 * @param username
 * @param styleId
 * @param accessToken
 */
const retrieveStyle = async (
  baseRetrieveUrl: string,
  username: string,
  styleId: string,
  accessToken: string
) => {
  const url = `${baseRetrieveUrl}/${username}/${styleId}`;
  const config = {
    params: { access_token: accessToken, fresh: true }, // fresh ensures the latest non-cached version is returned
  };
  const { data } = await axios.get<MapboxStyle>(url, config);
  return data;
};

/**
 * Ensures the composite URL contains a reference to the tilset id
 *
 * @param currentStyle
 * @param username
 * @param tilesetId
 */
const updateCompositeUrl = (
  currentStyle: MapboxStyle,
  username: string,
  tilesetId: string
) => {
  const compositeUrlComponents = currentStyle.sources.composite.url.split(",");
  if (!compositeUrlComponents.includes(`${username}.${tilesetId}`)) {
    compositeUrlComponents.push(`${username}.${tilesetId}`);
  }
  const compositeUrl = compositeUrlComponents.join(",");

  return {
    ...currentStyle,
    sources: {
      ...currentStyle.sources,
      composite: {
        ...currentStyle.sources.composite,
        url: compositeUrl,
      },
    },
  };
};

/**
 * Removes layers whose id starts with one of the prefixes, then adds the new
 * layers.
 *
 * @param currentStyle
 * @param prefixes
 * @param layers
 */
const mergeStyleLayers = (
  currentStyle: MapboxStyle,
  prefixes: string[],
  newLayers: MapboxStyle["layers"]
): MapboxStyle => {
  const styleWithoutTargetLayers: MapboxStyle = {
    ...currentStyle,
    layers: currentStyle.layers.filter((layer) => {
      for (const prefix of prefixes) {
        if (layer.id.startsWith(prefix)) {
          return false;
        }
      }
      return true;
    }),
  };

  return {
    ...styleWithoutTargetLayers,
    layers: [...styleWithoutTargetLayers.layers, ...newLayers],
  };
};

/**
 * Updates the style.
 * https://docs.mapbox.com/api/maps/styles/#update-a-style
 *
 * Note that the body should not have "created" or "modified" as mentioned in
 * the docs.
 *
 * @param baseUpdateUrl
 * @param username
 * @param styleId
 * @param accessToken
 * @param body
 */
const updateStyle = async (
  baseUpdateUrl: string,
  username: string,
  styleId: string,
  accessToken: string,
  body: Omit<MapboxStyle, "created" | "modified">
) => {
  const url = `${baseUpdateUrl}/${username}/${styleId}`;
  const config = {
    params: { access_token: accessToken },
  };
  await axios.patch<MapboxStyle>(url, body, config);
};

const run = async () => {
  // TODO: refactor generation of keys to fetch-rates
  const rawRates: { [vehicleTypeAndDayType: string]: Rate[] } = JSON.parse(
    readFileSync(RATES_JSON_FILEPATH, "utf8")
  );
  const rates = generateGantryRates(rawRates);
  const flattenedRates = flattenRates(rates);
  const keysSet = new Set<string>();
  for (const [_, ratesOfZone] of Object.entries(flattenedRates)) {
    for (const key of Object.keys(ratesOfZone)) {
      keysSet.add(key);
    }
  }
  const keys = Array.from(keysSet);

  // Generate layers
  const rateLayers = generateRateLayers(
    keys,
    process.env.MAPBOX_TILESET_ID ?? "",
    RATE_LAYER_ID_PREFIX
  );
  const operationalLayers = generateOperationalLayers(
    keys,
    process.env.MAPBOX_TILESET_ID ?? "",
    OPERATIONAL_LAYER_ID_PREFIX,
    process.env.MAPBOX_SPRITE_GANTRY_ON ?? "",
    process.env.MAPBOX_SPRITE_GANTRY_OFF ?? ""
  );

  // Retrieve and update style object
  const currentStyle = await retrieveStyle(
    MAPBOX_RETRIEVE_STYLE_BASE_URL,
    process.env.MAPBOX_USERNAME ?? "",
    process.env.MAPBOX_STYLE_ID ?? "",
    process.env.MAPBOX_PRIVATE_ACCESS_TOKEN ?? ""
  );
  const updatedStyle = updateCompositeUrl(
    currentStyle,
    process.env.MAPBOX_USERNAME ?? "",
    process.env.MAPBOX_TILESET_ID ?? ""
  );
  const { created, modified, ...newStyle } = mergeStyleLayers(
    updatedStyle,
    [RATE_LAYER_ID_PREFIX, OPERATIONAL_LAYER_ID_PREFIX],
    [...rateLayers, ...operationalLayers]
  );

  // Push changes to Mapbox
  await updateStyle(
    MAPBOX_UPDATE_STYLE_BASE_URL,
    process.env.MAPBOX_USERNAME ?? "",
    process.env.MAPBOX_STYLE_ID ?? "",
    process.env.MAPBOX_PRIVATE_ACCESS_TOKEN ?? "",
    newStyle
  );
};

// Ensures that the fetching does not run when tests are ran on this module.
if (process.env.NODE_ENV !== "test") {
  void run();
}

export const exportedForTesting = {
  generateRateLayers,
  generateOperationalLayers,
  retrieveStyle,
  updateCompositeUrl,
  mergeStyleLayers,
  updateStyle,
};
