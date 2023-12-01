import type { Dimensions, ViewType } from "../types";
import type { Gantry } from "src/types";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useFilters } from "src/contexts/filters";
import { useIsMobileContext } from "src/contexts/is-mobile";

import { useGesture } from "../hooks/useGesture";
import { calcTranslateY } from "../utils/calc-translate-y";
import { extractGantryRates } from "../utils/extract-gantry-rates";

import { GantryRatesList } from "./gantry-rates-list";
import { GantryTitleBar } from "./gantry-title-bar";
import { GestureHelperText } from "./gesture-helper-text";
import { GantryInfoPositioner, Wrapper } from "./positioner";

// Bounce animation should only show once regardless of the GantryInfo instance
let hasShownBounceAnimation = false;

const initialDimensions: Dimensions = {
  positionerHeight: undefined,
  panelYFromBottom: 0,
};

export const GantryInfo = ({ gantry }: { gantry: Gantry }) => {
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

/**
 * Facilitates code-splitting as React currently only supports default exports
 * https://reactjs.org/docs/code-splitting.html#named-exports
 */
export default GantryInfo;
