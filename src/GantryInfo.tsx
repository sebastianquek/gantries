import type { DayType, Gantry, VehicleType } from "./types";

import { useCallback, useEffect, useRef, useState } from "react";
import styled, { css, keyframes } from "styled-components";

import { GantryInfoIcon } from "./GantryInfoIcon";
import { GantryRatesList } from "./GantryRatesList";
import { ReactComponent as ArrowUp } from "./svg/arrow-up-sharp.svg";
import { ReactComponent as Checkmark } from "./svg/checkmark-sharp.svg";
import { useGantryRates } from "./useGantryRates";
import { useMatchMedia } from "./utils/useMatchMedia";

const bounce = keyframes`
  0% {
    transform: translate3d(0, 0, 0);
    animation-timing-function: ease-out;
  }
  16% {
    transform: translate3d(0, -80px, 0);
  }
  25% {
    transform: translate3d(0, -80px, 0);
    animation-timing-function: ease-in;
  }
  55% {
    transform: translate3d(0, -24px, 0);
    animation-timing-function: ease-in;
  }
  73.75% {
    transform: translate3d(0, -12px, 0);
    animation-timing-function: ease-in;
  }
  86.5% {
    transform: translate3d(0, -6px, 0);
    animation-timing-function: ease-in;
  }
  94.75% {
    transform: translate3d(0, -4px, 0);
    animation-timing-function: ease-in;
  }
  43.75%,
  66.25%,
  81.25%,
  90.25%,
  100% {
    transform: translate3d(0, 0px, 0);
    animation-timing-function: ease-out;
  }
`;

const Wrapper = styled.div<{
  viewType: "minimal" | "all";
  isDraggable?: boolean;
  showBounceAnimation?: boolean;
}>`
  border-radius: 1.5rem;
  background: white;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 0.5rem;
  width: 100%;
  touch-action: none;
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

  ${({ isDraggable = true }) =>
    isDraggable &&
    css`
      padding-top: 1.5rem;

      &::before {
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
    `}

  ${({ showBounceAnimation = false }) =>
    showBounceAnimation &&
    css`
      animation: ${bounce} 2s linear 0.5s;
    `}
`;

const GestureHelperText = styled.div`
  position: absolute;
  top: 99%;
  left: 0;
  right: 0;
  height: 100vh;
  background-color: white;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.7rem;
  gap: 0.25em;

  p {
    margin: 0;
    text-align: center;
  }
`;

const GestureHelperIcon = styled.div`
  font-size: 1rem;
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

const DRAG_Y_THRESHOLD = 100;

const calcTranslateY = (dragOffsetY: number, viewType: "minimal" | "all") => {
  if (viewType === "minimal") {
    if (dragOffsetY > 0) {
      // dragging downwards
      return Math.sqrt(dragOffsetY);
    } else if (dragOffsetY < -DRAG_Y_THRESHOLD) {
      // dragging upwards and over the threshold
      const dragOffsetOverThreshold = -dragOffsetY - DRAG_Y_THRESHOLD;
      return -DRAG_Y_THRESHOLD - 3 * Math.sqrt(dragOffsetOverThreshold);
    } else {
      return dragOffsetY;
    }
  } else {
    if (dragOffsetY < 0) {
      // dragging upwards
      return -Math.sqrt(-dragOffsetY);
    } else if (dragOffsetY > DRAG_Y_THRESHOLD) {
      // dragging downwards and over the threshold
      const dragOffsetOverThreshold = dragOffsetY - DRAG_Y_THRESHOLD;
      return DRAG_Y_THRESHOLD + 3 * Math.sqrt(dragOffsetOverThreshold);
    } else {
      return dragOffsetY;
    }
  }
};

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

  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [showBounceAnimation, setShowBounceAnimation] = useState(false);

  useEffect(() => {
    setViewType(isMobile ? "minimal" : "all");
  }, [isMobile]);

  useEffect(() => {
    if (isMobile && gantry && rates.length > 1) {
      // hint to the user that the bottom sheet is draggable
      // when there's a selected gantry and it has more than 1 rate
      setShowBounceAnimation(true);
    }
  }, [gantry, isMobile, rates.length]);

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
      setDragOffsetY(gestureState.current.endY - gestureState.current.startY);
    }
  }, []);

  const gestureEnd = useCallback(() => {
    gestureState.current.isTracking = false;
    const deltaY = gestureState.current.endY - gestureState.current.startY;
    const deltaTime =
      gestureState.current.endTime - gestureState.current.startTime;

    if ((deltaTime < 200 && deltaY > 0) || deltaY > DRAG_Y_THRESHOLD) {
      setViewType("minimal");
    } else if ((deltaTime < 200 && deltaY < 0) || deltaY < -DRAG_Y_THRESHOLD) {
      setViewType("all");
    }

    setDragOffsetY(0);
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
      <Wrapper viewType="all" isDraggable={false}>
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
    <Wrapper
      ref={wrapperRef}
      viewType={viewType}
      style={{
        transform: `translate3d(0, ${calcTranslateY(
          dragOffsetY,
          viewType
        )}px, 0)`,
        transition: dragOffsetY === 0 ? "transform 0.4s" : "none",
      }}
      isDraggable={isMobile}
      showBounceAnimation={showBounceAnimation}
    >
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
      {viewType === "minimal" && (
        <GestureHelperText>
          {dragOffsetY < -DRAG_Y_THRESHOLD ? (
            <>
              <GestureHelperIcon>
                <Checkmark />
              </GestureHelperIcon>
              <p>Release to see all rates</p>
            </>
          ) : (
            <>
              <GestureHelperIcon>
                <ArrowUp />
              </GestureHelperIcon>
              <p>
                Continue dragging upwards
                <br />
                to see all rates
              </p>
            </>
          )}
        </GestureHelperText>
      )}
    </Wrapper>
  );
};
