import { useEffect } from "react";

import { usePrevious } from "./utils/usePrevious";

export const useMapLayers = (
  map: mapboxgl.Map | undefined,
  layerId: string | undefined,
  selectedGantryId: string | undefined
) => {
  const prevLayerId = usePrevious(layerId);
  const prevSelectedGantryId = usePrevious(selectedGantryId);

  useEffect(() => {
    if (!map) {
      return;
    }

    if (prevSelectedGantryId) {
      map.setFeatureState(
        {
          source: "composite",
          id: prevSelectedGantryId,
          sourceLayer: "gantries",
        },
        { highlight: false }
      );
    }

    if (selectedGantryId) {
      map.setFeatureState(
        {
          source: "composite",
          id: selectedGantryId,
          sourceLayer: "gantries",
        },
        { highlight: true }
      );
    }
  }, [map, prevSelectedGantryId, selectedGantryId]);

  /**
   * Toggle off the previous target layer id
   * Toggle on the current target layer id
   */
  useEffect(() => {
    if (!map) {
      return;
    }
    if (prevLayerId) {
      const operationalId = `operational-${prevLayerId}`;
      const rateId = `rate-${prevLayerId}`;
      if (map.getLayer(operationalId)) {
        map.setLayoutProperty(operationalId, "visibility", "none");
      }
      if (map.getLayer(rateId)) {
        map.setLayoutProperty(rateId, "visibility", "none");
      }
    }
    if (layerId) {
      const operationalId = `operational-${layerId}`;
      const rateId = `rate-${layerId}`;
      if (map.getLayer(operationalId)) {
        map.setLayoutProperty(operationalId, "visibility", "visible");
      }
      if (map.getLayer(rateId)) {
        map.setLayoutProperty(rateId, "visibility", "visible");
      }
    }
  }, [layerId, map, prevLayerId]);
};
