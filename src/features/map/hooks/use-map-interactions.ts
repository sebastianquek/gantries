import type { MapLayerMouseEvent } from "mapbox-gl";
import type { Gantry } from "src/types";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { GANTRY_BASE_LAYER_ID } from "src/constants";

export const useMapInteractions = (
  map: mapboxgl.Map | undefined,
  gantry: Gantry | null | undefined
) => {
  const navigate = useNavigate();

  // Set up event handlers
  useEffect(() => {
    if (!map) {
      return;
    }

    const onClick = (e: MapLayerMouseEvent) => {
      if (e.features && e.features.length > 0) {
        const gantry = e.features[0].properties as Gantry;
        navigate(gantry.id);
      }
    };

    map.on("click", GANTRY_BASE_LAYER_ID, onClick);

    return () => {
      map.off("click", GANTRY_BASE_LAYER_ID, onClick);
    };
  }, [map, navigate]);

  // Move map based on the gantry that has been selected
  useEffect(() => {
    if (!map || !gantry) {
      return;
    }

    map.flyTo({
      center: [gantry.longitude, gantry.latitude],
      zoom: Math.max(map.getZoom(), 12.15), // zoom should be minimum 12.15
      offset: [0, -100], // selected marker shows up slightly higher than the horizontal midpoint
    });
  }, [gantry, map]);
};
