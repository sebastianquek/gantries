import type { Gantry, OutletContextType } from "../types";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useOutletContext } from "react-router-dom";
import styled, { css, keyframes } from "styled-components";

import { useFilters } from "../contexts/FiltersContext";
import { ReactComponent as ArrowUp } from "../svg/arrow-up-sharp.svg";
import { ReactComponent as Checkmark } from "../svg/checkmark-sharp.svg";
import { useMatchMedia } from "../utils/useMatchMedia";

import { GantryRatesList } from "./GantryRatesList";
import { GantryTitleBar } from "./GantryTitleBar";
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
      animation: ${bounce} 2.5s linear 0.5s;
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
  const [viewType, setViewType] = useState<"minimal" | "all">("minimal");

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
      <Wrapper viewType="all" isDraggable={false}>
        <GantryTitleBar title="Loading..." />
      </Wrapper>
    );
  }

  const dragYWithFriction = calcTranslateY(viewType, dragY, dragYThreshold);
  const currentRateAmount = rates.find(
    ({ startTime, endTime }) => time >= startTime && time < endTime
  )?.amount;

  return (
    <Wrapper
      ref={wrapperRef}
      viewType={viewType}
      style={{
        transform: `translate3d(0, ${dragYWithFriction}px, 0)`,
        transition: dragY === 0 ? "transform 0.4s" : "none",
      }}
      isDraggable={isMobile}
      showBounceAnimation={showBounceAnimation}
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
      {viewType === "minimal" && (
        <GestureHelperText>
          {dragY < -dragYThreshold ? (
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
    <Wrapper viewType="all" isDraggable={false}>
      <GantryTitleBar title="Click on a gantry to see more" />
    </Wrapper>
  );
};
