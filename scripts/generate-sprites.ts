import "dotenv/config";
import { readFileSync } from "fs";
import { join } from "path";

import axios from "axios";

const MAPBOX_ADD_IMAGE_BASE_URL = "https://api.mapbox.com/styles/v1";
const GANTRY_ON_SVG_PATH = join(__dirname, "./sprites/gantry-on.svg");
const GANTRY_OFF_SVG_PATH = join(__dirname, "./sprites/gantry-off.svg");

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

const run = async () => {
  await addSvgToSprite(
    MAPBOX_ADD_IMAGE_BASE_URL,
    process.env.MAPBOX_USERNAME ?? "",
    process.env.MAPBOX_STYLE_ID ?? "",
    process.env.MAPBOX_SPRITE_GANTRY_ON ?? "",
    process.env.MAPBOX_PRIVATE_ACCESS_TOKEN ?? "",
    GANTRY_ON_SVG_PATH
  );

  await addSvgToSprite(
    MAPBOX_ADD_IMAGE_BASE_URL,
    process.env.MAPBOX_USERNAME ?? "",
    process.env.MAPBOX_STYLE_ID ?? "",
    process.env.MAPBOX_SPRITE_GANTRY_OFF ?? "",
    process.env.MAPBOX_PRIVATE_ACCESS_TOKEN ?? "",
    GANTRY_OFF_SVG_PATH
  );
};

// Ensures that the fetching does not run when tests are ran on this module.
if (process.env.NODE_ENV !== "test") {
  void run();
}

export const exportedForTesting = {
  addSvgToSprite,
};
