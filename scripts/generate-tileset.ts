import type { AxiosError } from "axios";

import "dotenv/config";
import axios from "axios";

const MAPBOX_CREATE_TILESET_BASE_URL = "https://api.mapbox.com/tilesets/v1";
const MAPBOX_PUBLISH_TILESET_BASE_URL = "https://api.mapbox.com/tilesets/v1";
const MAPBOX_TILESET_SOURCE_BASE_URL = "mapbox://tileset-source";

/**
 * Creates tileset based on the tileset source
 * https://docs.mapbox.com/api/maps/mapbox-tiling-service/#create-a-tileset
 *
 * Note that this does not throw when the tileset had previously been created.
 *
 * @param baseCreateUrl
 * @param baseTilesetSourceUrl
 * @param username
 * @param tilesetId
 * @param tilesetSourceId
 * @param accessToken
 */
const createTileset = async (
  baseCreateUrl: string,
  baseTilesetSourceUrl: string,
  username: string,
  tilesetId: string,
  tilesetSourceId: string,
  accessToken: string
) => {
  const url = `${baseCreateUrl}/${username}.${tilesetId}`;
  const body = {
    recipe: {
      version: 1, // TODO: update this when a new version is created
      layers: {
        [tilesetId]: {
          maxzoom: 16,
          minzoom: 0,
          source: `${baseTilesetSourceUrl}/${username}/${tilesetSourceId}`,
        },
      },
    },
    name: tilesetId,
    private: true,
  };
  const config = {
    params: { access_token: accessToken },
    headers: { "Content-Type": "application/json" },
  };

  try {
    await axios.post<{ message: string }>(url, body, config);
    console.log("Successfully created tileset");
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const axiosError: AxiosError<{ message: string }> = e;
      if (
        axiosError.response?.status === 400 &&
        axiosError.response?.data.message.includes("already exists")
      ) {
        console.log("Tileset already exists, no need to create again");
      } else {
        throw e;
      }
    } else {
      throw e;
    }
  }
};

/**
 * Publish the tileset. This creates the job, MapBox asynchronously handles it.
 * https://docs.mapbox.com/api/maps/mapbox-tiling-service/#publish-a-tileset
 *
 * @param basePublishUrl
 * @param username
 * @param tilesetId
 * @param accessToken
 */
const publishTileset = async (
  basePublishUrl: string,
  username: string,
  tilesetId: string,
  accessToken: string
) => {
  const url = `${basePublishUrl}/${username}.${tilesetId}/publish`;
  const config = {
    params: {
      access_token: accessToken,
    },
  };

  const { data } = await axios.post<{ jobId: string }>(url, undefined, config);
  console.log(`Publishing, jobId: ${data.jobId}`);
};

const run = async () => {
  await createTileset(
    MAPBOX_CREATE_TILESET_BASE_URL,
    MAPBOX_TILESET_SOURCE_BASE_URL,
    process.env.MAPBOX_USERNAME ?? "",
    process.env.MAPBOX_TILESET_ID ?? "",
    process.env.MAPBOX_TILESET_SOURCE_ID ?? "",
    process.env.MAPBOX_PRIVATE_ACCESS_TOKEN ?? ""
  );
  await publishTileset(
    MAPBOX_PUBLISH_TILESET_BASE_URL,
    process.env.MAPBOX_USERNAME ?? "",
    process.env.MAPBOX_TILESET_ID ?? "",
    process.env.MAPBOX_PRIVATE_ACCESS_TOKEN ?? ""
  );
};

// Ensures that the fetching does not run when tests are ran on this module.
if (process.env.NODE_ENV !== "test") {
  void run();
}

export const exportedForTesting = {
  createTileset,
  publishTileset,
};
