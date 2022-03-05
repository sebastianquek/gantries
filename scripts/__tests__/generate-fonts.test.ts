import { join } from "path";

import axios from "axios";

import { exportedForTesting } from "../generate-fonts";

const { addFont } = exportedForTesting;

jest.mock("axios");
const axiosPostSpy = jest.spyOn(axios, "post");

describe("generate-fonts", () => {
  describe("addFont", () => {
    it("should provide axios with the correct properties", async () => {
      const fontPath = join(__dirname, "./fixtures/RedHatText-Bold.ttf");
      axiosPostSpy.mockResolvedValueOnce({
        data: {
          family_name: "Red Hat Text",
          style_name: "Bold",
          owner: "owner",
          visibility: "private",
        },
      });

      await addFont("baseUrl", "username", "accessToken", fontPath);

      expect(axiosPostSpy).toHaveBeenCalledWith(
        "baseUrl/username/",
        expect.any(Buffer),
        {
          params: { access_token: "accessToken" },
        }
      );
    });
  });
});
