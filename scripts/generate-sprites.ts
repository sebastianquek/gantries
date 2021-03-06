import "dotenv/config";
import { readFileSync } from "fs";
import { join } from "path";

import axios from "axios";

const MAPBOX_ADD_IMAGE_BASE_URL = "https://api.mapbox.com/styles/v1";

const GANTRY_ON_SVG_PATH = join(__dirname, "./sprites/gantry-on.svg");
const RATE_BG_SVG_PATH = join(__dirname, "./sprites/rate-bg.svg");

// Light mode
const GANTRY_OFF_LIGHT_SVG_PATH = join(
  __dirname,
  "./sprites/gantry-off-light.svg"
);
const GANTRY_HIGHLIGHT_OUTLINE_LIGHT_SVG_PATH = join(
  __dirname,
  "./sprites/gantry-highlight-outline-light.svg"
);

// Dark mode
const GANTRY_OFF_DARK_SVG_PATH = join(
  __dirname,
  "./sprites/gantry-off-dark.svg"
);
const GANTRY_HIGHLIGHT_OUTLINE_DARK_SVG_PATH = join(
  __dirname,
  "./sprites/gantry-highlight-outline-dark.svg"
);

/**
 * Add SVG to sprite
 * https://docs.mapbox.com/api/maps/styles/#add-new-image-to-sprite
 *
 * @param baseUrl
 * @param username
 * @param styleId
 * @param iconName
 * @param accessToken
 * @param svgPath
 */
const addSvgToSprite = async (
  baseUrl: string,
  username: string,
  styleId: string,
  iconName: string,
  accessToken: string,
  svgPath: string
) => {
  const url = `${baseUrl}/${username}/${styleId}/sprite/${iconName}`;
  const data = readFileSync(svgPath);
  const config = {
    params: { access_token: accessToken },
    headers: { "Content-Type": "image/svg+xml" },
  };
  await axios.put(url, data, config);
};

/**
 * Add gantry SVGs to style's sprite
 */
const addGantrySvgs = async ({
  styleId,
  gantryOffSvgPath,
  gantryHighlightOutlineSvgPath,
}: {
  styleId: string;
  gantryOffSvgPath: string;
  gantryHighlightOutlineSvgPath: string;
}) => {
  await addSvgToSprite(
    MAPBOX_ADD_IMAGE_BASE_URL,
    process.env.MAPBOX_USERNAME ?? "",
    styleId,
    process.env.MAPBOX_SPRITE_GANTRY_ON ?? "",
    process.env.MAPBOX_PRIVATE_ACCESS_TOKEN ?? "",
    GANTRY_ON_SVG_PATH
  );

  await addSvgToSprite(
    MAPBOX_ADD_IMAGE_BASE_URL,
    process.env.MAPBOX_USERNAME ?? "",
    styleId,
    process.env.MAPBOX_SPRITE_GANTRY_OFF ?? "",
    process.env.MAPBOX_PRIVATE_ACCESS_TOKEN ?? "",
    gantryOffSvgPath
  );

  await addSvgToSprite(
    MAPBOX_ADD_IMAGE_BASE_URL,
    process.env.MAPBOX_USERNAME ?? "",
    styleId,
    process.env.MAPBOX_SPRITE_GANTRY_HIGHLIGHT_OUTLINE ?? "",
    process.env.MAPBOX_PRIVATE_ACCESS_TOKEN ?? "",
    gantryHighlightOutlineSvgPath
  );

  await addSvgToSprite(
    MAPBOX_ADD_IMAGE_BASE_URL,
    process.env.MAPBOX_USERNAME ?? "",
    styleId,
    process.env.MAPBOX_SPRITE_RATE_BG ?? "",
    process.env.MAPBOX_PRIVATE_ACCESS_TOKEN ?? "",
    RATE_BG_SVG_PATH
  );
};

const run = async () => {
  await Promise.all([
    // Light mode
    addGantrySvgs({
      styleId: process.env.MAPBOX_STYLE_ID_LIGHT ?? "",
      gantryOffSvgPath: GANTRY_OFF_LIGHT_SVG_PATH,
      gantryHighlightOutlineSvgPath: GANTRY_HIGHLIGHT_OUTLINE_LIGHT_SVG_PATH,
    }),
    // Dark mode
    addGantrySvgs({
      styleId: process.env.MAPBOX_STYLE_ID_DARK ?? "",
      gantryOffSvgPath: GANTRY_OFF_DARK_SVG_PATH,
      gantryHighlightOutlineSvgPath: GANTRY_HIGHLIGHT_OUTLINE_DARK_SVG_PATH,
    }),
  ]);
};

// Ensures that the fetching does not run when tests are ran on this module.
if (process.env.NODE_ENV !== "test") {
  void run();
}

export const exportedForTesting = {
  addSvgToSprite,
};
