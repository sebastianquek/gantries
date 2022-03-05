import type { MapboxStyle } from "../../types";

export const style: MapboxStyle = {
  version: 8,
  name: "Sample",
  metadata: {},
  center: [103.85202, 1.28418],
  zoom: 14.17,
  bearing: 0,
  pitch: 0,
  sources: {
    composite: {
      url: "mapbox://mapbox.mapbox-streets-v8",
      type: "vector",
    },
  },
  sprite: "spriteUrl",
  glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
  layers: [],
  created: "2022-02-28T14:35:41.518Z",
  modified: "2022-03-05T08:54:11.352Z",
  id: "styleId",
  owner: "username",
  visibility: "private",
  protected: false,
  draft: false,
};
