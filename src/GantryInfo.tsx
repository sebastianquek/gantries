import type { DayType, Gantry, VehicleType } from "./types";

import { useCallback, useEffect, useRef, useState } from "react";
import styled, { css } from "styled-components";

import { GantryInfoIcon } from "./GantryInfoIcon";
import { GantryRatesList } from "./GantryRatesList";
import { useGantryRates } from "./useGantryRates";
import { useMatchMedia } from "./utils/useMatchMedia";

const Wrapper = styled.div<{ viewType: "minimal" | "all" }>`
  border-radius: 1.5rem;
  background: white;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  padding-top: 1.5rem;
  gap: 0.5rem;
  width: 100%;
  touch-action: none;
  transition: all 0.4s;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.15);

  ${({ viewType }) =>
    viewType === "all"
      ? css`
          margin-bottom: 1rem;
        `
      : css`
          padding-bottom: 1.5rem;
          border-bottom-right-radius: 0;
          border-bottom-left-radius: 0;
        `}

  &::after {
    content: "";
    position: absolute;
    top: 0.5rem;
    left: 50%;
    height: 2px;
    width: 3rem;
    background-color: hsla(0, 0%, 65%, 1);
    border-radius: 500px;
    transform: translateX(-50%);
  }
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

type GestureState = {
  isTracking: boolean;
  startX: number;
  startY: number;
  startTime: number;
  endX: number;
  endY: number;
  endTime: number;
};

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

  const isMobile = useMatchMedia("(max-width: 768px)");
  const [viewType, setViewType] = useState<"minimal" | "all">("minimal");

  useEffect(() => {
    setViewType(isMobile ? "minimal" : "all");
  }, [isMobile]);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const gestureState = useRef<GestureState>({
    isTracking: false,
    startX: 0,
    startY: 0,
    startTime: 0,
    endX: 0,
    endY: 0,
    endTime: 0,
  });

  const gestureStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      gestureState.current.isTracking = true;
      gestureState.current.startX = e.targetTouches[0].clientX;
      gestureState.current.startY = e.targetTouches[0].clientY;
      gestureState.current.startTime = performance.now();
    } else {
      gestureState.current.isTracking = false;
    }
  }, []);

  const gestureMove = useCallback((e: TouchEvent) => {
    if (gestureState.current.isTracking) {
      gestureState.current.endX = e.targetTouches[0].clientX;
      gestureState.current.endY = e.targetTouches[0].clientY;
      gestureState.current.endTime = performance.now();
    }
  }, []);

  const gestureEnd = useCallback(() => {
    gestureState.current.isTracking = false;
    const deltaY = gestureState.current.endY - gestureState.current.startY;
    const deltaTime =
      gestureState.current.endTime - gestureState.current.startTime;

    if ((deltaTime < 200 && deltaY > 0) || deltaY > 100) {
      setViewType("minimal");
    } else if ((deltaTime < 200 && deltaY > 0) || deltaY < -100) {
      setViewType("all");
    }
  }, []);

  useEffect(() => {
    const _wrapper = wrapperRef.current;

    _wrapper?.addEventListener("touchstart", gestureStart);
    _wrapper?.addEventListener("touchmove", gestureMove);
    _wrapper?.addEventListener("touchend", gestureEnd);

    return () => {
      _wrapper?.removeEventListener("touchstart", gestureStart);
      _wrapper?.removeEventListener("touchmove", gestureMove);
      _wrapper?.removeEventListener("touchend", gestureEnd);
    };
  });

  if (!gantry) {
    return (
      <Wrapper viewType={viewType}>
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
    <Wrapper ref={wrapperRef} viewType={viewType}>
      <TitleBar>
        <GantryInfoIcon zone={gantry.zone} />
        <Name>{gantry.name}</Name>
        {currentRateAmount !== undefined && (
          <CurrentRate>${currentRateAmount}</CurrentRate>
        )}
      </TitleBar>
      {rates.length > 0 && (
        <GantryRatesList
          maxRateAmount={maxRateAmount}
          rates={rates}
          time={time}
          viewType={viewType}
        />
      )}
    </Wrapper>
  );
};
