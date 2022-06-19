import type { Gantry, OutletContextType } from "../types";
import type { ViewType } from "./types";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useOutletContext } from "react-router-dom";
import styled, { css, keyframes } from "styled-components";

import { useFilters } from "../contexts/FiltersContext";
import { useMatchMedia } from "../utils/useMatchMedia";

import { GantryRatesList } from "./GantryRatesList";
import { GantryTitleBar } from "./GantryTitleBar";
import { GestureHelperText } from "./GestureHelperText";
import { useGesture } from "./useGesture";
import { calcTranslateY } from "./utils/calcTranslateY";
import { extractGantryRates } from "./utils/extractGantryRates";

const bounce = keyframes`
  0% {
    transform: translate3d(0, 0, 0);
    animation-timing-function: ease-out;
  }
  12% {
    transform: translate3d(0, -80px, 0);
  }
  32% {
    transform: translate3d(0, -80px, 0);
    animation-timing-function: ease-in;
  }
  59.2% {
    transform: translate3d(0, -24px, 0);
    animation-timing-function: ease-in;
  }
  76.2% {
    transform: translate3d(0, -12px, 0);
    animation-timing-function: ease-in;
  }
  87.76% {
    transform: translate3d(0, -6px, 0);
    animation-timing-function: ease-in;
  }
  95.24% {
    transform: translate3d(0, -4px, 0);
    animation-timing-function: ease-in;
  }
  49%,
  69.4%,
  83%,
  91.16%,
  100% {
    transform: translate3d(0, 0px, 0);
    animation-timing-function: ease-out;
  }
`;

const GantryInfoPositioner = styled.div`
  position: absolute;
  z-index: 10;
  left: 1rem;
  touch-action: none;

  @media (max-width: 768px) {
    bottom: 1rem;
    right: 1rem;
  }

  @media (min-width: 768px) {
    top: 3.5rem;
    width: 350px;
  }
`;

const Wrapper = styled.div<{
  viewType: ViewType;
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
    viewType === "minimal" &&
    css`
      padding-bottom: 0.5rem;
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
      animation: ${bounce} 2.5s linear 0.5s;
    `}
`;

// Bounce animation should only show once regardless of the GantryInfo instance
let hasShownBounceAnimation = false;

export const GantryInfo = ({ gantry }: { gantry: Gantry | undefined }) => {
  const { vehicleType, dayType, time } = useFilters();
  const { maxRateAmount, rates } = useMemo(() => {
    return extractGantryRates({
      gantry,
      vehicleType,
      dayType,
    });
  }, [dayType, gantry, vehicleType]);

  const isMobile = useMatchMedia("(max-width: 768px)");
  const [viewType, setViewType] = useState<ViewType>("minimal");

  useEffect(() => {
    setViewType(isMobile ? "minimal" : "all");
  }, [isMobile]);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const { dragY, dragYThreshold } = useGesture({
    ref: wrapperRef,
    onEnd: useCallback((state) => {
      switch (state) {
        case "COLLAPSED":
          setViewType("minimal");
          break;
        case "EXPANDED":
          setViewType("all");
          break;
      }
    }, []),
  });

  if (!gantry) {
    return (
      <GantryInfoPositioner>
        <Wrapper viewType="all" isDraggable={false}>
          <GantryTitleBar title="Loading..." />
        </Wrapper>
      </GantryInfoPositioner>
    );
  }

  const dragYWithFriction = calcTranslateY(viewType, dragY, dragYThreshold);
  const currentRateAmount = rates.find(
    ({ startTime, endTime }) => time >= startTime && time < endTime
  )?.amount;
  const hasMultipleRates = rates.length > 1;
  // Hint to the user that the bottom sheet is draggable
  const showBounceAnimation =
    hasShownBounceAnimation === false &&
    isMobile &&
    viewType === "minimal" &&
    hasMultipleRates;

  return (
    <GantryInfoPositioner>
      <Wrapper
        ref={wrapperRef}
        viewType={hasMultipleRates ? viewType : "all"}
        style={{
          transform: `translate3d(0, ${dragYWithFriction}px, 0)`,
          transition: dragY === 0 ? "transform 0.4s" : "none",
        }}
        isDraggable={isMobile && hasMultipleRates}
        showBounceAnimation={showBounceAnimation}
        onAnimationEnd={() => (hasShownBounceAnimation = true)}
      >
        <GantryTitleBar
          title={gantry.name}
          zone={gantry.zone}
          amount={currentRateAmount}
        />
        {rates.length > 0 && (
          <GantryRatesList
            maxRateAmount={maxRateAmount}
            rates={rates}
            time={time}
            viewType={viewType}
          />
        )}
        {hasMultipleRates && viewType === "minimal" && (
          <GestureHelperText
            state={dragY < -dragYThreshold ? "RELEASE" : "CONTINUE"}
          />
        )}
      </Wrapper>
    </GantryInfoPositioner>
  );
};

export const GantryInfoOutlet = () => {
  const { gantry } = useOutletContext<OutletContextType>();

  return gantry === null ? (
    <Navigate to="/" replace={true} />
  ) : (
    <GantryInfo gantry={gantry} />
  );
};

/**
 * Shows up when no gantry is selected
 */
export const GantryInfoHelpPanelOutlet = () => {
  return (
    <GantryInfoPositioner>
      <Wrapper viewType="all" isDraggable={false}>
        <GantryTitleBar title="Click on a gantry to see more" />
      </Wrapper>
    </GantryInfoPositioner>
  );
};
