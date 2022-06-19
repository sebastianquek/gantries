import type { DayType, Gantry, VehicleType } from "./types";

import { useRef } from "react";
import { Outlet, useParams } from "react-router-dom";
import styled from "styled-components";

import { AlertBanner } from "./AlertBanner";
import { TopBar } from "./TopBar";
import { useFilters } from "./contexts/FiltersContext";
import { useMap } from "./useMap";
import { useMapInteractions } from "./useMapInteractions";
import { useToggleMapLayers } from "./useToggleMapLayers";
import { queryMap } from "./utils/queryMap";

const Wrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const MapboxWrapper = styled.div`
  position: relative;
  height: 100%;

  canvas {
    border-radius: 1.5rem;
  }

  .mapboxgl-ctrl-group {
    border-radius: 500px;
    box-shadow: none;
    border: 1px solid hsl(0deg 0% 40%);

    button:focus-visible {
      outline: -webkit-focus-ring-color auto 1px;
      box-shadow: none;
    }
  }
`;

const GantryInfoPositioner = styled.div`
  position: absolute;
  z-index: 10;
  left: 1rem;

  @media (max-width: 768px) {
    bottom: 0;
    right: 1rem;
  }

  @media (min-width: 768px) {
    top: 3.5rem;
    width: 350px;
  }
`;

export type OutletContextType = {
  map: mapboxgl.Map | undefined;
  vehicleType: VehicleType;
  dayType: DayType;
  time: string;
};

export const Map = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  const { vehicleType, dayType, time } = useFilters();
  const { gantryId } = useParams();

  const { map } = useMap({
    mapRef: mapRef,
    initialLng: 103.837,
    initialLat: 1.31,
    initialZoom: 12.15,
    mapStyle: "STREETS",
  });

  let gantry: Gantry | null | undefined = undefined;
  if (map && gantryId) {
    gantry = queryMap(map, gantryId);
  }
  useMapInteractions(map, gantry);
  useToggleMapLayers(map, gantryId);

  return (
    <Wrapper>
      <TopBar />
      <MapboxWrapper ref={mapRef} />
      <GantryInfoPositioner>
        <Outlet
          context={{
            map,
            vehicleType,
            dayType,
            time,
          }}
        />
      </GantryInfoPositioner>
      <AlertBanner />
    </Wrapper>
  );
};
