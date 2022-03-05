import "dotenv/config";
import { readFileSync } from "fs";
import { join } from "path";

import axios from "axios";

const MAPBOX_ADD_FONT_BASE_URL = "https://api.mapbox.com/fonts/v1";
const RED_HAT_TEXT_BOLD_PATH = join(__dirname, "./fonts/RedHatText-Bold.ttf");

const addFont = async (
  baseUrl: string,
  username: string,
  accessToken: string,
  fontPath: string
) => {
  const url = `${baseUrl}/${username}/`;
  const body = readFileSync(fontPath);
  const config = {
    params: { access_token: accessToken },
  };
  const { data } = await axios.post<{
    family_name: string;
    style_name: string;
    owner: string;
    visibility: string;
  }>(url, body, config);
  console.log({
    familyName: data.family_name,
    styleName: data.style_name,
  });
};

const run = async () => {
  await addFont(
    MAPBOX_ADD_FONT_BASE_URL,
    process.env.MAPBOX_USERNAME ?? "",
    process.env.MAPBOX_PRIVATE_ACCESS_TOKEN ?? "",
    RED_HAT_TEXT_BOLD_PATH
  );
};

// Ensures that the fetching does not run when tests are ran on this module.
if (process.env.NODE_ENV !== "test") {
  void run();
}

export const exportedForTesting = {
  addFont,
};
