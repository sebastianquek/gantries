import type { DayType, VehicleType } from "./types";

import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

import { dayTypes, vehicleTypes } from "./constants";
import { useMap } from "./useMap";
import { pickSplit } from "./utils/pickSplit";
import { slugify } from "./utils/slugify";
import { useFetchJSON } from "./utils/useFetchJSON";
import { usePrevious } from "./utils/usePrevious";

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

const Controls = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  margin: 1em;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
`;

const Select = styled.select`
  font-family: inherit;
`;

const Input = styled.input`
  font-family: inherit;
  width: 12ch;
`;

export const Map = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  const [vehicleType, setVechicleType] = useState<VehicleType>(vehicleTypes[0]);
  const [dayType, setDayType] = useState<DayType>(dayTypes[0]);
  const [time, setTime] = useState<string>("08:00");

  const [layerId, setLayerId] = useState<string | null>(null);
  const prevLayerId = usePrevious(layerId);

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
    const split = pickSplit(time, splits[key]);
    setLayerId(split ? slugify(`${key}-${split}`) : null);
  }, [vehicleType, dayType, time, splits]);

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
      <MapboxWrapper ref={mapRef} />
      <Controls>
        <Select
          value={vehicleType}
          onChange={(event) =>
            setVechicleType(event.target.value as VehicleType)
          }
        >
          {vehicleTypes.map((vehicleType) => (
            <option key={vehicleType} value={vehicleType}>
              {vehicleType}
            </option>
          ))}
        </Select>
        <Select
          value={dayType}
          onChange={(event) => setDayType(event.target.value as DayType)}
        >
          {dayTypes.map((dayType) => (
            <option key={dayType} value={dayType}>
              {dayType}
            </option>
          ))}
        </Select>
        <Input
          type="time"
          value={time}
          onChange={(event) => setTime(event.target.value)}
        ></Input>
      </Controls>
    </Wrapper>
  );
};
