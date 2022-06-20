import type { Gantry } from "src/types";

import { GANTRY_SOURCE_LAYER } from "src/constants";

export const queryMap = (
  map: mapboxgl.Map,
  gantryId: string
): Gantry | null => {
  const foundGantry = map
    .querySourceFeatures("composite", {
      sourceLayer: GANTRY_SOURCE_LAYER,
    })
    .find((x) => x.id === Number(gantryId))?.properties as Gantry | undefined;
  return foundGantry ? foundGantry : null;
};
