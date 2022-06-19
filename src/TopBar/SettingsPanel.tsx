import type { DayType, VehicleType } from "../types";

import styled from "styled-components";

import { Button } from "../common/Button";
import { DAY_TYPES, VEHICLE_TYPES } from "../constants";
import { useFilters, useFiltersDispatch } from "../contexts/FiltersContext";
import { ReactComponent as Bus } from "../svg/bus.svg";
import { ReactComponent as Car } from "../svg/car.svg";
import { ReactComponent as Motorcycle } from "../svg/motorcycle.svg";
import { ReactComponent as Truck } from "../svg/truck.svg";
import { getDayType, getTime } from "../utils/datetime";

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

  &:focus-within {
    outline: -webkit-focus-ring-color auto 1px;
  }
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

  &:focus-visible {
    z-index: 10;
  }
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

export const SettingsPanel = () => {
  const { vehicleType, dayType, time } = useFilters();
  const dispatch = useFiltersDispatch();

  const setVehicleType = (vehicleType: VehicleType) => {
    dispatch?.({ type: "changed_vehicle_type", vehicleType });
  };

  const setDayType = (dayType: DayType) => {
    dispatch?.({ type: "changed_day_type", dayType });
  };

  const setTime = (time: string) => {
    dispatch?.({ type: "changed_time", time });
  };

  const setDayTypeAndTimeToNow = () => {
    const now = new Date();
    setTime(getTime(now));
    setDayType(getDayType(now));
  };

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
    <>
      <Pill>
        <VehicleSelectWrapper>
          <VehicleIcon>{vehicleIcon}</VehicleIcon>
          <VehicleSelect
            value={vehicleType}
            onChange={(event) =>
              setVehicleType(event.target.value as VehicleType)
            }
          >
            {VEHICLE_TYPES.map((vehicleType) => (
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
          {DAY_TYPES.map((dayType) => (
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
    </>
  );
};
