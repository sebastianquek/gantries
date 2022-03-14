import type { DayType, Gantry, VehicleType } from "./types";

import styled from "styled-components";

import { GantryInfoIcon } from "./GantryInfoIcon";
import { GantryRatesList } from "./GantryRatesList";
import { useGantryRates } from "./useGantryRates";

const Wrapper = styled.div`
  border-radius: 1.5rem;
  background: white;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 0.5rem;
  width: 100%;
`;

const TitleBar = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const Name = styled.h2`
  margin: 0;
  font-size: 14px;
  font-weight: 800;
  flex-grow: 1;
`;

const CurrentRate = styled.p`
  font-size: 32px;
  margin: 0;
  font-weight: 700;
  font-family: "IBM Plex Sans";
  align-self: flex-start;
`;

export const GantryInfo = ({
  gantry,
  vehicleType,
  dayType,
  time,
}: {
  gantry: Gantry | undefined;
  vehicleType: VehicleType;
  dayType: DayType;
  time: string;
}) => {
  const { maxRateAmount, rates } = useGantryRates({
    gantry,
    vehicleType,
    dayType,
  });

  if (!gantry) {
    return (
      <Wrapper>
        <TitleBar>
          <GantryInfoIcon />
          <Name>Click on a gantry to see more</Name>
        </TitleBar>
      </Wrapper>
    );
  }

  const currentRateAmount = rates.find(
    ({ startTime, endTime }) => time >= startTime && time < endTime
  )?.amount;

  return (
    <Wrapper>
      <TitleBar>
        <GantryInfoIcon zone={gantry.zone} />
        <Name>{gantry.name}</Name>
        <CurrentRate>${currentRateAmount}</CurrentRate>
      </TitleBar>
      {rates.length > 0 && (
        <GantryRatesList
          maxRateAmount={maxRateAmount}
          rates={rates}
          time={time}
        />
      )}
    </Wrapper>
  );
};
