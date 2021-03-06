import type { Gantry } from "src/types";

import { useRef } from "react";
import { Outlet, useParams } from "react-router-dom";
import styled from "styled-components";

import { AlertBanner } from "src/features/alerts";
import {
  useMap,
  useMapInteractions,
  useToggleMapLayers,
} from "src/features/map";
import { TopBar } from "src/features/settings";
import { queryMap } from "src/utils/query-map";

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
    background: var(--background-color-alt);
    border: 1px solid var(--border-color);

    button:focus-visible {
      outline: -webkit-focus-ring-color auto 1px;
      box-shadow: none;
    }

    .mapboxgl-ctrl-icon {
      @media (prefers-color-scheme: dark) {
        filter: invert(100%);
      }
    }
  }

  .mapboxgl-ctrl-logo {
    opacity: 0.7;
  }
`;

export const App = () => {
  // Does not react to changes to media
  const prefersDarkScheme = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  const mapRef = useRef<HTMLDivElement>(null);
  const { gantryId } = useParams();

  const { map } = useMap({
    mapRef: mapRef,
    initialLng: 103.837,
    initialLat: 1.31,
    // Ensures that if a gantry param is provided, it can be found via queryMap.
    // Having a high initial zoom may not render gantries outside of the
    // viewport (mapbox optimisation) which causes queryMap to return null incorrectly.
    // Setting to 11 ensures the gantries at the boundary can still be queried.
    initialZoom: gantryId ? 11 : 12.15,
    mapStyle: prefersDarkScheme ? "DARK" : "LIGHT",
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
      <AlertBanner />
      <Outlet context={{ gantry }} />
    </Wrapper>
  );
};
