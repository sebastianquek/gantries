import axios from "axios";

import { exportedForTesting } from "../generate-tileset";

const { createTileset, publishTileset } = exportedForTesting;

jest.mock("axios");
const axiosIsAxiosErrorSpy = jest.spyOn(axios, "isAxiosError");
const axiosPostSpy = jest.spyOn(axios, "post");

describe("generate-tileset", () => {
  describe("createTileset", () => {
    it("should provide axios with the correct properties", async () => {
      axiosPostSpy.mockResolvedValueOnce({
        data: {
          message:
            "Successfully created empty tileset <>. Publish your tileset to begin processing your data into vector tiles.",
        },
      });
      await createTileset(
        "baseCreateUrl",
        "baseTilesetSourceUrl",
        "username",
        "tilesetId",
        "tilesetSourceId",
        "accessToken"
      );
      expect(axiosPostSpy).toHaveBeenCalledWith(
        "baseCreateUrl/username.tilesetId",
        {
          recipe: {
            version: 1,
            layers: {
              tilesetId: {
                maxzoom: 16,
                minzoom: 0,
                source: "baseTilesetSourceUrl/username/tilesetSourceId",
              },
            },
          },
          name: "tilesetId",
          private: true,
        },
        {
          params: {
            access_token: "accessToken",
          },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    it("should not throw an error if the tileset already exists", async () => {
      // This is needed since `jest.mock("axios")` removes all existing functionality.
      axiosIsAxiosErrorSpy.mockReturnValueOnce(true);
      axiosPostSpy.mockRejectedValueOnce({
        isAxiosError: true,
        response: {
          status: 400,
          data: {
            message: "<> already exists",
          },
        },
      });
      await expect(
        createTileset(
          "baseCreateUrl",
          "baseTilesetSourceUrl",
          "username",
          "tilesetId",
          "tilesetSourceId",
          "accessToken"
        )
      ).resolves.not.toThrow();
    });

    it(`should throw an error if it's not a "tileset already exists" error`, async () => {
      // This is needed since `jest.mock("axios")` removes all existing functionality.
      axiosIsAxiosErrorSpy.mockReturnValueOnce(true);
      axiosPostSpy.mockRejectedValueOnce({
        isAxiosError: true,
        response: {
          status: 404,
        },
      });
      await expect(
        createTileset(
          "baseCreateUrl",
          "baseTilesetSourceUrl",
          "username",
          "tilesetId",
          "tilesetSourceId",
          "accessToken"
        )
      ).rejects.toStrictEqual({
        // Cannot use toThrow as the rejected value is not an Error
        isAxiosError: true,
        response: {
          status: 404,
        },
      });
    });
  });

  describe("publishTileset", () => {
    it("should provide axios with the correct properties", async () => {
      axiosPostSpy.mockResolvedValueOnce({
        data: {
          message: "Processing <>",
          jobId: "jobId",
        },
      });
      await publishTileset(
        "basePublishUrl",
        "username",
        "tilesetId",
        "accessToken"
      );
      expect(axiosPostSpy).toHaveBeenCalledWith(
        "basePublishUrl/username.tilesetId/publish",
        undefined,
        {
          params: {
            access_token: "accessToken",
          },
        }
      );
    });
  });
});
