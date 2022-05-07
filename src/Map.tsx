import type { DayType, Gantry, VehicleType } from "./types";
import type { LngLatLike, MapLayerMouseEvent } from "mapbox-gl";

import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

import { AlertBanner } from "./AlertBanner";
import { TopBar } from "./TopBar";
import { GANTRY_BASE_LAYER_ID, VEHICLE_TYPES } from "./constants";
import { useLayerId } from "./useLayerId";
import { useMap } from "./useMap";
import { useMapLayers } from "./useMapLayers";
import { getDayType, getTime } from "./utils/datetime";
import { queryMap } from "./utils/queryMap";
import { useStateWithLocalStorage } from "./utils/useLocalStorage";

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

const AlertBannerPositioner = styled.div`
  position: absolute;
  right: 3.5rem;
  top: 3.5rem;

  @media (max-width: 768px) {
    left: 1rem;
  }

  @media (min-width: 768px) {
    width: 270px;
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

  const [vehicleType, setVehicleType] = useStateWithLocalStorage<VehicleType>(
    VEHICLE_TYPES[0],
    "vehicleType"
  );
  const [dayType, setDayType] = useState<DayType>(getDayType("Weekdays"));
  const [time, setTime] = useState<string>(getTime());

  const [layerId] = useLayerId(vehicleType, dayType, time);

  const navigate = useNavigate();
  const location = useLocation();
  const { gantryId } = useParams();

  const { map, isLoaded } = useMap({
    mapRef: mapRef,
    initialLng: 103.837,
    initialLat: 1.31,
    initialZoom: 12.15,
    mapStyle: "STREETS",
  });

  useEffect(() => {
    const onClick = (e: MapLayerMouseEvent) => {
      if (e.features && e.features.length > 0) {
        const gantry = e.features[0].properties as Gantry;
        navigate(gantry.id, { state: { gantry } });
      }
    };

    map?.on("click", GANTRY_BASE_LAYER_ID, onClick);

    return () => {
      map?.off("click", GANTRY_BASE_LAYER_ID, onClick);
    };
  }, [map, navigate]);

  useMapLayers(map, isLoaded, layerId, gantryId);

  useEffect(() => {
    if (!map || !isLoaded || !gantryId) {
      return;
    }
    let center: LngLatLike | undefined;
    const { gantry } = (location.state ?? {}) as { gantry?: Gantry };
    if (gantry) {
      center = [gantry.longitude, gantry.latitude];
    } else {
      const gantry = queryMap(map, gantryId);
      if (gantry?.longitude && gantry.latitude) {
        center = [gantry.longitude, gantry.latitude];
      }
    }
    if (center) {
      map.flyTo({
        center,
        offset: [0, -100], // selected marker shows up slightly higher than the horizontal midpoint
      });
    }
  }, [gantryId, isLoaded, location.state, map]);

  return (
    <Wrapper>
      <TopBar
        vehicleType={vehicleType}
        setVehicleType={setVehicleType}
        dayType={dayType}
        setDayType={setDayType}
        time={time}
        setTime={setTime}
      />
      <MapboxWrapper ref={mapRef} />
      {new Date().getDay() === 0 && (
        <AlertBannerPositioner>
          <AlertBanner>
            {`ERP is not operational on Sundays, you're seeing rates for
              ${dayType}.`}
          </AlertBanner>
        </AlertBannerPositioner>
      )}
      <GantryInfoPositioner>
        <Outlet
          context={{
            map: isLoaded ? map : undefined,
            vehicleType,
            dayType,
            time,
          }}
        />
      </GantryInfoPositioner>
    </Wrapper>
  );
};
