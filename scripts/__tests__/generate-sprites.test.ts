import { join } from "path";

import axios from "axios";

import { exportedForTesting } from "../generate-sprites";

const { addSvgToSprite } = exportedForTesting;

jest.mock("axios");
const axiosPutSpy = jest.spyOn(axios, "put");

describe("generate-sprites", () => {
  describe("addSvgToSprite", () => {
    it("should provide axios with the correct properties", async () => {
      const svgPath = join(__dirname, "./fixtures/gantry-on.svg");
      axiosPutSpy.mockResolvedValueOnce({
        data: {},
      });

      await addSvgToSprite(
        "baseUrl",
        "username",
        "styleId",
        "gantry-on",
        "accessToken",
        svgPath
      );

      expect(axiosPutSpy).toHaveBeenCalledWith(
        "baseUrl/username/styleId/sprite/gantry-on",
        expect.any(Buffer),
        {
          params: { access_token: "accessToken" },
          headers: { "Content-Type": "image/svg+xml" },
        }
      );
    });
  });
});
