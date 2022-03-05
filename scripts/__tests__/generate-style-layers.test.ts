import type { MapboxStyle } from "../types";

import axios from "axios";

import { exportedForTesting } from "../generate-style-layers";

import { style } from "./fixtures/style";

const {
  generateRateLayers,
  generateOperationalLayers,
  retrieveStyle,
  updateCompositeUrl,
  mergeStyleLayers,
  updateStyle,
} = exportedForTesting;

jest.mock("axios");
const axiosGetSpy = jest.spyOn(axios, "get");
const axiosPatchSpy = jest.spyOn(axios, "patch");

describe("generate-style-layers", () => {
  describe("generateRateLayers", () => {
    it("should return empty array if no keys are provided", () => {
      expect(generateRateLayers([], "sourceLayer", "rate")).toStrictEqual([]);
    });

    it("should return correctly when multiple keys are provided", () => {
      expect(
        generateRateLayers(["key1", "key2"], "sourceLayer", "rate")
      ).toStrictEqual([
        {
          id: "rate-key1",
          type: "symbol",
          source: "composite",
          "source-layer": "sourceLayer",
          paint: {},
          layout: {
            visibility: "none",
            "text-field": ["get", "key1"],
          },
        },
        {
          id: "rate-key2",
          type: "symbol",
          source: "composite",
          "source-layer": "sourceLayer",
          paint: {},
          layout: {
            visibility: "none",
            "text-field": ["get", "key2"],
          },
        },
      ]);
    });
  });

  describe("generateOperationalLayers", () => {
    it("should return empty array if no keys are provided", () => {
      expect(
        generateOperationalLayers(
          [],
          "sourceLayer",
          "operational",
          "gantry-on",
          "gantry-off"
        )
      ).toStrictEqual([]);
    });

    it("should return correctly when multiple keys are provided", () => {
      expect(
        generateOperationalLayers(
          ["key1", "key2"],
          "sourceLayer",
          "operational",
          "gantry-on",
          "gantry-off"
        )
      ).toStrictEqual([
        {
          id: "operational-key1",
          type: "symbol",
          source: "composite",
          "source-layer": "sourceLayer",
          paint: {},
          layout: {
            visibility: "none",
            "icon-image": [
              "case",
              [">", ["to-number", ["get", "key1"], 0], 0],
              "gantry-on",
              "gantry-off",
            ],
          },
        },
        {
          id: "operational-key2",
          type: "symbol",
          source: "composite",
          "source-layer": "sourceLayer",
          paint: {},
          layout: {
            visibility: "none",
            "icon-image": [
              "case",
              [">", ["to-number", ["get", "key2"], 0], 0],
              "gantry-on",
              "gantry-off",
            ],
          },
        },
      ]);
    });
  });

  describe("retrieveStyle", () => {
    it("should provide axios with the correct properties", async () => {
      axiosGetSpy.mockResolvedValueOnce({
        data: {},
      });
      await retrieveStyle(
        "baseCreateUrl",
        "username",
        "styleId",
        "accessToken"
      );
      expect(axiosGetSpy).toHaveBeenCalledWith(
        "baseCreateUrl/username/styleId",
        {
          params: {
            access_token: "accessToken",
            fresh: true,
          },
        }
      );
    });
  });

  describe("updateCompositeUrl", () => {
    it("should add the tileset url if not present", () => {
      expect(updateCompositeUrl(style, "username", "tilesetId")).toStrictEqual({
        ...style,
        sources: {
          composite: {
            url: "mapbox://mapbox.mapbox-streets-v8,username.tilesetId",
            type: "vector",
          },
        },
      });
    });

    it("should continue to include the tileset url if already present", () => {
      const styleWithTilesetUrl = {
        ...style,
        sources: {
          composite: {
            url: "mapbox://mapbox.mapbox-streets-v8,username.tilesetId",
            type: "vector",
          },
        },
      };
      expect(
        updateCompositeUrl(styleWithTilesetUrl, "username", "tilesetId")
      ).toStrictEqual(styleWithTilesetUrl);
    });
  });

  describe("mergeStyleLayers", () => {
    it("should add new layers when there are no existing layers with matching prefixes", () => {
      const newLayers = [
        {
          id: "rate-key1",
          type: "symbol",
          source: "composite",
          "source-layer": "sourceLayer",
          paint: {},
          layout: {
            visibility: "none",
            "text-field": ["get", "key1"],
          },
        },
        {
          id: "rate-key2",
          type: "symbol",
          source: "composite",
          "source-layer": "sourceLayer",
          paint: {},
          layout: {
            visibility: "none",
            "text-field": ["get", "key2"],
          },
        },
      ];
      const currentStyle = style; // has no layers

      expect(
        mergeStyleLayers(currentStyle, ["rate", "operational"], newLayers)
      ).toStrictEqual({
        ...currentStyle,
        layers: newLayers,
      });
    });

    it("should replace layers when there are existing layers", () => {
      const currentLayers = [
        {
          id: "rate-key1",
          type: "symbol",
          source: "composite",
          "source-layer": "sourceLayer",
          paint: {},
          layout: {
            visibility: "none",
            "text-field": ["get", "key1"],
          },
        },
        {
          id: "rate-key2",
          type: "symbol",
          source: "composite",
          "source-layer": "sourceLayer",
          paint: {},
          layout: {
            visibility: "none",
            "text-field": ["get", "key2"],
          },
        },
      ];
      const currentStyle = {
        ...style,
        layers: currentLayers,
      };
      const newLayers = currentLayers;

      expect(
        mergeStyleLayers(currentStyle, ["rate", "operational"], newLayers)
      ).toStrictEqual(currentStyle);
    });

    it("should remove layers when there are no new layers", () => {
      const currentLayers = [
        {
          id: "rate-key1",
          type: "symbol",
          source: "composite",
          "source-layer": "sourceLayer",
          paint: {},
          layout: {
            visibility: "none",
            "text-field": ["get", "key1"],
          },
        },
        {
          id: "rate-key2",
          type: "symbol",
          source: "composite",
          "source-layer": "sourceLayer",
          paint: {},
          layout: {
            visibility: "none",
            "text-field": ["get", "key2"],
          },
        },
      ];
      const currentStyle = {
        ...style,
        layers: currentLayers,
      };
      const newLayers: MapboxStyle["layers"] = [];

      expect(
        mergeStyleLayers(currentStyle, ["rate", "operational"], newLayers)
      ).toStrictEqual({
        ...style, // layers is empty
      });
    });

    it("should remove layers that do not appear in the new layers", () => {
      const currentLayers = [
        {
          id: "rate-key1",
          type: "symbol",
          source: "composite",
          "source-layer": "sourceLayer",
          paint: {},
          layout: {
            visibility: "none",
            "text-field": ["get", "key1"],
          },
        },
        {
          id: "rate-key2",
          type: "symbol",
          source: "composite",
          "source-layer": "sourceLayer",
          paint: {},
          layout: {
            visibility: "none",
            "text-field": ["get", "key2"],
          },
        },
      ];
      const currentStyle = {
        ...style,
        layers: currentLayers,
      };
      const newLayers = [
        {
          id: "rate-key3",
          type: "symbol",
          source: "composite",
          "source-layer": "sourceLayer",
          paint: {},
          layout: {
            visibility: "none",
            "text-field": ["get", "key3"],
          },
        },
      ];

      expect(
        mergeStyleLayers(currentStyle, ["rate", "operational"], newLayers)
      ).toStrictEqual({
        ...style,
        layers: newLayers,
      });
    });
  });

  describe("updateStyle", () => {
    it("should provide axios with the correct properties", async () => {
      axiosGetSpy.mockResolvedValueOnce({
        data: {},
      });
      const { created, modified, ...body } = style;

      await updateStyle(
        "baseUpdateUrl",
        "username",
        "styleId",
        "accessToken",
        body
      );
      expect(axiosPatchSpy).toHaveBeenCalledWith(
        "baseUpdateUrl/username/styleId",
        body,
        {
          params: {
            access_token: "accessToken",
          },
        }
      );
    });
  });
});
