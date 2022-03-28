import type { DayType, VehicleType } from "../types";
import type { Dispatch, SetStateAction } from "react";

import styled from "styled-components";

import { ProjectInfo } from "./ProjectInfo";
import { SettingsPanel } from "./SettingsPanel";

const Wrapper = styled.div`
  position: relative;
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

const AppTitle = styled.h1`
  margin: 0;
  padding: 0;
  line-height: 1;
  text-transform: uppercase;
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0.1em;
`;

type TopBarProps = {
  vehicleType: VehicleType;
  setVehicleType: Dispatch<SetStateAction<VehicleType>>;
  dayType: DayType;
  setDayType: Dispatch<SetStateAction<DayType>>;
  time: string;
  setTime: Dispatch<SetStateAction<string>>;
};

export const TopBar = ({
  vehicleType,
  setVehicleType,
  dayType,
  setDayType,
  time,
  setTime,
}: TopBarProps) => {
  return (
    <Wrapper>
      <Left>
        <SettingsPanel
          vehicleType={vehicleType}
          setVehicleType={setVehicleType}
          dayType={dayType}
          setDayType={setDayType}
          time={time}
          setTime={setTime}
        />
      </Left>
      <Middle>
        <AppTitle>Gantries</AppTitle>
      </Middle>
      <Right>
        <ProjectInfo />
      </Right>
    </Wrapper>
  );
};
