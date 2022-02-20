import type { MapStyle } from "./useMap";

import { useRef, useState } from "react";
import styled from "styled-components";

import { StyleSelector } from "./StyleSelector";
import { useMap } from "./useMap";

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

  useMap({
    mapRef: mapRef,
    initialLng: 103.8229313,
    initialLat: 1.3551607,
    initialZoom: 11.5,
    mapStyle: mapStyle,
  });

  return (
    <Wrapper>
      <MapboxWrapper ref={mapRef} />
      <StyleSelector mapStyle={mapStyle} setMapStyle={setmapStyle} />
    </Wrapper>
  );
};
