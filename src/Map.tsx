import type { DayType, Gantry, VehicleType } from "./types";
import type { MapLayerMouseEvent } from "mapbox-gl";

import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

import { AlertBanner } from "./AlertBanner";
import { GantryInfo } from "./GantryInfo";
import { ProjectInfo } from "./ProjectInfo";
import { dayTypes, vehicleTypes } from "./constants";
import { ReactComponent as Bus } from "./svg/bus.svg";
import { ReactComponent as Car } from "./svg/car.svg";
import { ReactComponent as CrossIcon } from "./svg/close-outline.svg";
import { ReactComponent as Motorcycle } from "./svg/motorcycle.svg";
import { ReactComponent as Truck } from "./svg/truck.svg";
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
`;

const MapboxWrapper = styled.div`
  position: absolute;
  top: 3rem;
  bottom: 0.5rem;
  left: 0.5rem;
  right: 0.5rem;

  canvas {
    border-radius: 1.5rem;
  }

  .mapboxgl-ctrl-group {
    border-radius: 500px;
  }
`;

const TopBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  margin: 0.5rem;
  display: flex;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.8rem;
`;

const Left = styled.div`
  flex: 1;
  display: flex;
  gap: 0.5rem;
`;

const Middle = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Right = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
`;

const Pill = styled.div`
  display: flex;
`;

const VehicleSelectWrapper = styled.div`
  position: relative;
  display: flex;
  width: 4ch;
  overflow: hidden;
  border: 1px solid hsl(0deg 0% 40%);
  background: white;
  border-right: none;
  border-top-left-radius: 500px;
  border-bottom-left-radius: 500px;
`;

const VehicleIcon = styled.div`
  position: absolute;
  padding: 5px 10px 5px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Select = styled.select`
  appearance: none;
  border: 1px solid hsl(0deg 0% 40%);
  background: white;
  padding: 8px 12px 6px;
  border-right: none;
  line-height: 1;
  border-radius: 0;
`;

const VehicleSelect = styled(Select)`
  opacity: 0;
`;

const DayTypeSelect = styled(Select)``;

const TimeInput = styled.input`
  appearance: none;
  border: 1px solid hsl(0deg 0% 40%);
  background: white;
  padding: 8px 12px 6px;
  line-height: 1;
  max-width: 13ch;
  border-radius: 0;
  border-top-right-radius: 500px;
  border-bottom-right-radius: 500px;

  &[type="time" i]::-webkit-calendar-picker-indicator {
    padding: 0;
    margin: -2px 0 0 4px;
  }
`;

const AppTitle = styled.h1`
  margin: 0;
  padding: 0;
  line-height: 1;
  text-transform: uppercase;
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0.1em;
`;

const Button = styled.button`
  background: white;
  border: 1px solid hsl(0deg 0% 40%);
  border-radius: 500px;
  padding: 8px 12px 6px;
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

const ProjectInfoPositioner = styled.div`
  position: absolute;
  z-index: 20;

  @media (max-width: 768px) {
    left: 0;
  }

  @media (min-width: 768px) {
    width: 300px;
  }
`;

const Backdrop = styled.div`
  position: fixed;
  z-index: -1;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(4px);
  cursor: pointer;
`;

const ProjectInfoCloseButton = styled.button`
  border: none;
  padding: 1em;
  font-size: 20px;
  z-index: 40;
  background: none;
  cursor: pointer;

  position: absolute;
  top: 0;
  right: 0;
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

const GANTRY_BASE_LAYER_ID = "operational-base";

export const Map = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  const [isProjectInfoVisible, setIsProjectInfoVisible] = useState(false);

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

  const setDayTypeAndTimeToNow = () => {
    const now = new Date();
    setTime(getTime(now));
    setDayType((current) => getDayType(current, now));
  };

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

  let vehicleIcon;
  switch (vehicleType) {
    case "Passenger Cars/Light Goods Vehicles/Taxis":
    case "Light Goods Vehicles":
    case "Taxis":
      vehicleIcon = <Car />;
      break;
    case "Motorcycles":
      vehicleIcon = <Motorcycle />;
      break;
    case "Heavy Goods Vehicles/Small Buses":
      vehicleIcon = <Bus />;
      break;
    case "Very Heavy Goods Vehicles/Big Buses":
      vehicleIcon = <Truck />;
      break;
  }

  return (
    <Wrapper>
      <MapboxWrapper ref={mapRef} />
      <TopBar>
        <Left>
          <Pill>
            <VehicleSelectWrapper>
              <VehicleIcon>{vehicleIcon}</VehicleIcon>
              <VehicleSelect
                value={vehicleType}
                onChange={(event) =>
                  setVehicleType(event.target.value as VehicleType)
                }
              >
                {vehicleTypes.map((vehicleType) => (
                  <option key={vehicleType} value={vehicleType}>
                    {vehicleType}
                  </option>
                ))}
              </VehicleSelect>
            </VehicleSelectWrapper>
            <DayTypeSelect
              value={dayType}
              onChange={(event) => setDayType(event.target.value as DayType)}
            >
              {dayTypes.map((dayType) => (
                <option key={dayType} value={dayType}>
                  {dayType}
                </option>
              ))}
            </DayTypeSelect>
            <TimeInput
              type="time"
              value={time}
              pattern="[0-9]{2}:[0-9]{2}"
              onChange={(event) => setTime(event.target.value)}
            />
          </Pill>
          <Button onClick={setDayTypeAndTimeToNow}>Now</Button>
        </Left>
        <Middle>
          <AppTitle>Gantries</AppTitle>
        </Middle>
        <Right>
          {isProjectInfoVisible ? (
            <ProjectInfoPositioner>
              <Backdrop onClick={() => setIsProjectInfoVisible((b) => !b)} />
              <ProjectInfo
                lastCheckDate={
                  process.env.REACT_APP_LAST_CHECK_DATE
                    ? new Date(Number(process.env.REACT_APP_LAST_CHECK_DATE))
                    : undefined
                }
                version={process.env.REACT_APP_COMMIT_REF}
              />
              <ProjectInfoCloseButton
                onClick={() => setIsProjectInfoVisible((b) => !b)}
              >
                <CrossIcon />
              </ProjectInfoCloseButton>
            </ProjectInfoPositioner>
          ) : (
            <Button onClick={() => setIsProjectInfoVisible((b) => !b)}>
              Info
            </Button>
          )}
        </Right>
      </TopBar>
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
