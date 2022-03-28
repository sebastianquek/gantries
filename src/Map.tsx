import type { DayType, Gantry, VehicleType } from "./types";
import type { MapLayerMouseEvent } from "mapbox-gl";

import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

import { AlertBanner } from "./AlertBanner";
import { GantryInfo } from "./GantryInfo";
import { TopBar } from "./TopBar";
import { vehicleTypes } from "./constants";
import { useMap } from "./useMap";
import { getDayType, getTime } from "./utils/datetime";
import { pickSplit } from "./utils/pickSplit";
import { slugify } from "./utils/slugify";
import { useFetchJSON } from "./utils/useFetchJSON";
import { useStateWithLocalStorage } from "./utils/useLocalStorage";
import { usePrevious } from "./utils/usePrevious";

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
  height: 100%;

  canvas {
    border-radius: 1.5rem;
  }

  .mapboxgl-ctrl-group {
    border-radius: 500px;
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

const GANTRY_BASE_LAYER_ID = "operational-base";

export const Map = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  const [vehicleType, setVehicleType] = useStateWithLocalStorage<VehicleType>(
    vehicleTypes[0],
    "vehicleType"
  );
  const [dayType, setDayType] = useState<DayType>(getDayType("Weekdays"));
  const [time, setTime] = useState<string>(getTime());

  const [layerId, setLayerId] = useState<string | null>(null);
  const prevLayerId = usePrevious(layerId);

  const [selectedGantry, setSelectedGantry] = useState<Gantry>();
  const [selectedGantryId, setSelectedGantryId] = useState<string | number>();
  const prevSelectedGantryId = usePrevious(selectedGantryId);

  const { result: splits } =
    useFetchJSON<{ [vehicleAndDayType: string]: string[] }>(
      "/data/splits.json"
    );

  const { map, isLoaded } = useMap({
    mapRef: mapRef,
    initialLng: 103.837,
    initialLat: 1.31,
    initialZoom: 12.15,
    mapStyle: "STREETS",
  });

  /**
   * Update target layer id to toggle on based on
   * vehicleType, dayType and time.
   */
  useEffect(() => {
    if (!splits) {
      return;
    }
    const key = slugify(`${vehicleType}-${dayType}`);
    if (!splits[key]) {
      return;
    }
    const split = pickSplit(time, splits[key]);
    setLayerId(split ? slugify(`${key}-${split}`) : null);
  }, [vehicleType, dayType, time, splits]);

  useEffect(() => {
    const onClick = (e: MapLayerMouseEvent) => {
      if (e.features && e.features.length > 0) {
        const gantry = e.features[0].properties as Gantry;
        setSelectedGantry(gantry);
        setSelectedGantryId(e.features[0].id);
        map?.flyTo({
          center: [gantry.longitude, gantry.latitude],
          offset: [0, -100], // selected marker shows up slightly higher than the horizontal midpoint
        });
      }
    };

    map?.on("click", GANTRY_BASE_LAYER_ID, onClick);

    return () => {
      map?.off("click", GANTRY_BASE_LAYER_ID, onClick);
    };
  }, [map]);

  useEffect(() => {
    if (prevSelectedGantryId) {
      map?.setFeatureState(
        {
          source: "composite",
          id: prevSelectedGantryId,
          sourceLayer: "gantries",
        },
        { highlight: false }
      );
    }

    if (selectedGantryId) {
      map?.setFeatureState(
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
    if (!isLoaded || !map) {
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
  }, [isLoaded, layerId, map, prevLayerId]);

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
        <GantryInfo
          gantry={selectedGantry}
          vehicleType={vehicleType}
          dayType={dayType}
          time={time}
        />
      </GantryInfoPositioner>
    </Wrapper>
  );
};
