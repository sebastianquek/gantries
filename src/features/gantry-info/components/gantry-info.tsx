import type { Dimensions, ViewType } from "../types";
import type { Gantry, OutletContextType } from "src/types";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useOutletContext } from "react-router-dom";
import styled, { css, keyframes } from "styled-components";

import { useFilters } from "src/contexts/filters";
import { useIsMobileContext } from "src/contexts/is-mobile";

import { useGesture } from "../hooks/useGesture";
import { calcTranslateY } from "../utils/calc-translate-y";
import { extractGantryRates } from "../utils/extract-gantry-rates";

import { GantryRatesList } from "./gantry-rates-list";
import { GantryTitleBar } from "./gantry-title-bar";
import { GestureHelperText } from "./gesture-helper-text";

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
  background: var(--background-color-alt);
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
        background-color: var(--color-neutral-50);
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

const initialDimensions: Dimensions = {
  positionerHeight: undefined,
  panelYFromBottom: 0,
};

const GantryInfo = ({ gantry }: { gantry: Gantry | undefined }) => {
  const { vehicleType, dayType, time } = useFilters();
  const { maxRateAmount, rates } = useMemo(() => {
    return extractGantryRates(gantry, vehicleType, dayType);
  }, [dayType, gantry, vehicleType]);

  const isMobile = useIsMobileContext();
  const [viewType, setViewType] = useState<ViewType>("minimal");

  useEffect(() => {
    setViewType(isMobile ? "minimal" : "all");
  }, [isMobile]);

  const [{ positionerHeight, panelYFromBottom }, setDimensions] =
    useState<Dimensions>(initialDimensions);

  const hasMultipleRates = rates.length > 1;
  // Hint to the user that the bottom sheet is draggable
  const showBounceAnimation =
    hasShownBounceAnimation === false &&
    isMobile &&
    viewType === "minimal" &&
    hasMultipleRates &&
    positionerHeight === undefined; // implies that panel is not being dragged

  const positionerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { bind, dragY, dragYThreshold } = useGesture({
    isEnabled: hasMultipleRates,
    onStart: useCallback(() => {
      if (wrapperRef.current && positionerRef.current) {
        // In the event that the panel is still in transition and the user
        // starts dragging, the panel should start moving from the current
        // offset position
        const panelInitialYOffset =
          positionerRef.current.getBoundingClientRect().bottom -
          wrapperRef.current.getBoundingClientRect().bottom;
        setDimensions({
          positionerHeight:
            panelInitialYOffset +
            wrapperRef.current.getBoundingClientRect().height,
          panelYFromBottom: 0,
        });
      }
    }, []),
    onEnd: useCallback(
      (state, dragY, dragYThreshold) => {
        switch (state) {
          case "COLLAPSED":
            setViewType("minimal");
            break;
          case "EXPANDED":
            setViewType("all");
            break;
        }
        const dragYWithFriction = calcTranslateY(
          viewType,
          dragY,
          dragYThreshold
        );
        setDimensions((d) => ({
          ...d,
          positionerHeight: (d.positionerHeight ?? 0) - dragYWithFriction, // maintain height
        }));
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setDimensions((d) => {
              if (d.positionerHeight !== undefined) {
                const newHeight =
                  wrapperRef.current?.getBoundingClientRect().height ?? 0;
                return {
                  ...d,
                  panelYFromBottom: d.positionerHeight - newHeight,
                };
              }
              return d;
            });
          });
        });
      },
      [viewType]
    ),
  });

  const resetTransition = () => {
    setDimensions(initialDimensions);
  };

  useEffect(() => {
    resetTransition();
  }, [gantry]);

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

  return (
    <GantryInfoPositioner
      ref={positionerRef}
      style={{
        height:
          positionerHeight !== undefined
            ? `calc(${positionerHeight}px + (${-dragYWithFriction}px))`
            : "auto",
      }}
    >
      <Wrapper
        ref={wrapperRef}
        viewType={hasMultipleRates ? viewType : "all"}
        style={{
          transform: `translate3d(0, ${panelYFromBottom}px, 0)`,
          transition: panelYFromBottom !== 0 ? "transform 0.5s" : "none",
        }}
        isDraggable={isMobile && hasMultipleRates}
        showBounceAnimation={showBounceAnimation}
        onAnimationEnd={() => (hasShownBounceAnimation = true)}
        onTransitionEnd={(e) => {
          if (e.target === wrapperRef.current) {
            resetTransition();
          }
        }}
        {...bind}
      >
        <GantryTitleBar
          title={gantry.name}
          zone={gantry.zone}
          amount={currentRateAmount}
        />
        <GantryRatesList
          maxRateAmount={maxRateAmount}
          rates={rates}
          time={time}
          viewType={viewType}
        />
        {isMobile && hasMultipleRates && viewType === "minimal" && (
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
