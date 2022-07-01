import type { MapboxStyle } from "../types";

import axios from "axios";

import { exportedForTesting } from "../generate-style-layers";

import { style } from "./fixtures/style";

const {
  generateRateLayers,
  generateBaseOperationalLayer,
  generateOperationalLayers,
  generateHighlightOutlineLayer,
  retrieveStyle,
  updateCompositeUrl,
  updateGlyphs,
  mergeStyleLayers,
  updateStyle,
} = exportedForTesting;

jest.mock("axios");
const axiosGetSpy = jest.spyOn(axios, "get");
const axiosPatchSpy = jest.spyOn(axios, "patch");

describe("generate-style-layers", () => {
  describe("generateRateLayers", () => {
    it("should return empty array if no keys are provided", () => {
      expect(
        generateRateLayers([], "sourceLayer", "rate", "rate-bg")
      ).toStrictEqual([]);
    });

    it("should return correctly when multiple keys are provided", () => {
      expect(
        generateRateLayers(["key1", "key2"], "sourceLayer", "rate", "rate-bg")
      ).toStrictEqual([
        {
          id: "rate-key1",
          type: "symbol",
          source: "composite",
          "source-layer": "sourceLayer",
          paint: {
            "text-color": "hsl(0, 0%, 100%)",
          },
          layout: {
            "icon-allow-overlap": true,
            "icon-image": ["case", ["has", "key1"], "rate-bg", ""],
            "icon-text-fit": "both",
            "icon-text-fit-padding": [3, 7, 2, 7],
            "text-allow-overlap": ["step", ["zoom"], false, 14, true],
            "text-field": [
              "case",
              ["has", "key1"],
              ["concat", "$", ["get", "key1"]],
              "",
            ],
            "text-font": ["IBM Plex Sans Bold", "Arial Unicode MS Bold"],
            "text-pitch-alignment": "viewport",
            "text-radial-offset": 1.3,
            "text-size": 18,
            "text-variable-anchor": ["bottom"],
            visibility: "none",
          },
        },
        {
          id: "rate-key2",
          type: "symbol",
          source: "composite",
          "source-layer": "sourceLayer",
          paint: {
            "text-color": "hsl(0, 0%, 100%)",
          },
          layout: {
            "icon-allow-overlap": true,
            "icon-image": ["case", ["has", "key2"], "rate-bg", ""],
            "icon-text-fit": "both",
            "icon-text-fit-padding": [3, 7, 2, 7],
            "text-allow-overlap": ["step", ["zoom"], false, 14, true],
            "text-field": [
              "case",
              ["has", "key2"],
              ["concat", "$", ["get", "key2"]],
              "",
            ],
            "text-font": ["IBM Plex Sans Bold", "Arial Unicode MS Bold"],
            "text-pitch-alignment": "viewport",
            "text-radial-offset": 1.3,
            "text-size": 18,
            "text-variable-anchor": ["bottom"],
            visibility: "none",
          },
        },
      ]);
    });
  });

  describe("generateBaseOperationalLayer", () => {
    it("should return correctly", () => {
      expect(
        generateBaseOperationalLayer("sourceLayer", "operational", "gantry-off")
      ).toStrictEqual({
        id: "operational-base",
        type: "symbol",
        source: "composite",
        "source-layer": "sourceLayer",
        paint: {},
        layout: {
          "icon-allow-overlap": true,
          "icon-image": "gantry-off",
          "icon-rotate": ["get", "bearing"],
          "icon-rotation-alignment": "map",
        },
      });
    });
  });

  describe("generateOperationalLayers", () => {
    it("should return empty array if no keys are provided", () => {
      expect(
        generateOperationalLayers([], "sourceLayer", "operational", "gantry-on")
      ).toStrictEqual([]);
    });

    it("should return correctly when multiple keys are provided", () => {
      expect(
        generateOperationalLayers(
          ["key1", "key2"],
          "sourceLayer",
          "operational",
          "gantry-on"
        )
      ).toStrictEqual([
        {
          id: "operational-key1",
          type: "symbol",
          source: "composite",
          "source-layer": "sourceLayer",
          paint: {},
          layout: {
            "icon-allow-overlap": true,
            "icon-image": [
              "case",
              [">", ["to-number", ["get", "key1"], 0], 0],
              "gantry-on",
              "",
            ],
            "icon-rotate": ["get", "bearing"],
            "icon-rotation-alignment": "map",
            visibility: "none",
          },
        },
        {
          id: "operational-key2",
          type: "symbol",
          source: "composite",
          "source-layer": "sourceLayer",
          paint: {},
          layout: {
            "icon-allow-overlap": true,
            "icon-image": [
              "case",
              [">", ["to-number", ["get", "key2"], 0], 0],
              "gantry-on",
              "",
            ],
            "icon-rotate": ["get", "bearing"],
            "icon-rotation-alignment": "map",
            visibility: "none",
          },
        },
      ]);
    });
  });

  describe("generateHighlightOutlineLayer", () => {
    it("should return correctly", () => {
      expect(
        generateHighlightOutlineLayer(
          "sourceLayer",
          "highlight",
          "gantry-highlight-outline"
        )
      ).toStrictEqual({
        id: "highlight-base",
        type: "symbol",
        source: "composite",
        "source-layer": "sourceLayer",
        paint: {
          "icon-opacity": [
            "case",
            ["boolean", ["feature-state", "highlight"], false],
            1,
            0,
          ],
        },
        layout: {
          "icon-allow-overlap": true,
          "icon-image": "gantry-highlight-outline",
          "icon-rotate": ["get", "bearing"],
          "icon-rotation-alignment": "map",
        },
      });
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

  describe("updateGlyphs", () => {
    it("should update the glyphs property correctly", () => {
      expect(updateGlyphs(style, "username")).toStrictEqual({
        ...style,
        glyphs: "mapbox://fonts/username/{fontstack}/{range}.pbf",
      });
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
