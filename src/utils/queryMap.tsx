import type { Gantry } from "../types";

import { GANTRY_SOURCE_LAYER } from "../constants";

export const queryMap = (map: mapboxgl.Map, gantryId: string) => {
  return map
    .querySourceFeatures("composite", {
      sourceLayer: GANTRY_SOURCE_LAYER,
    })
    .find((x) => x.id === Number(gantryId))?.properties as Gantry | undefined;
};
