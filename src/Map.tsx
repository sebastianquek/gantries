import type { MapStyle } from "./useMap";
import type { GeoJSONSourceRaw } from "mapbox-gl";

import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

import { StyleSelector } from "./StyleSelector";
import { useMap } from "./useMap";
import { gantryDataToGeoJSON } from "./utils/gantryDataToGeoJSON";
import { useFetch } from "./utils/useFetch";

const Wrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

const MapboxWrapper = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

export const Map = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  const [mapStyle, setmapStyle] = useState<MapStyle>("STREETS");

  const { map, isLoaded } = useMap({
    mapRef: mapRef,
    initialLng: 103.8229313,
    initialLat: 1.3551607,
    initialZoom: 11.5,
    mapStyle: mapStyle,
  });

  const { result: gantryLocations } = useFetch<
    Parameters<typeof gantryDataToGeoJSON>[0][0]
  >("/data/gantry-locations.csv", "csv");

  useEffect(() => {
    if (isLoaded && map && gantryLocations) {
      map.loadImage("/mapbox-marker.png", (err, image) => {
        if (err) throw err;
        if (!image) throw new Error("No image was loaded");
        map.addImage("gantry-marker", image);
        map.addSource(
          "points",
          gantryDataToGeoJSON(gantryLocations) as GeoJSONSourceRaw
        );
        map.addLayer({
          id: "points",
          type: "symbol",
          source: "points",
          layout: {
            "icon-image": "gantry-marker",
          },
        });
      });
    }
  }, [gantryLocations, isLoaded, map]);

  return (
    <Wrapper>
      <MapboxWrapper ref={mapRef} />
      <StyleSelector mapStyle={mapStyle} setMapStyle={setmapStyle} />
    </Wrapper>
  );
};
