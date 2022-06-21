import type { TouchEventHandler } from "react";

import { useCallback, useMemo, useRef, useState } from "react";

type GestureState = {
  isTracking: boolean;
  startX: number;
  startY: number;
  startTime: number;
  endX: number;
  endY: number;
  endTime: number;
};

const DEFAULT_DRAG_Y_THRESHOLD = 100;
const DEFAULT_DRAG_MS_THRESHOLD = 200;

export const useGesture = ({
  isEnabled,
  onStart,
  onEnd,
  dragYThreshold = DEFAULT_DRAG_Y_THRESHOLD,
  dragMSThreshold = DEFAULT_DRAG_MS_THRESHOLD,
}: {
  isEnabled: boolean;
  onStart: () => void;
  onEnd: (
    state: "NOOP" | "COLLAPSED" | "EXPANDED",
    dragY: number,
    dragYThreshold: number
  ) => void;
  dragYThreshold?: number;
  dragMSThreshold?: number;
}) => {
  const gestureState = useRef<GestureState>({
    isTracking: false,
    startX: 0,
    startY: 0,
    startTime: 0,
    endX: 0,
    endY: 0,
    endTime: 0,
  });

  const [dragY, setDragY] = useState(0);

  const onTouchMove: TouchEventHandler = useCallback((e) => {
    if (!gestureState.current.isTracking) {
      return;
    }
    gestureState.current.endX = e.targetTouches[0].clientX;
    gestureState.current.endY = e.targetTouches[0].clientY;
    gestureState.current.endTime = performance.now();
    setDragY(gestureState.current.endY - gestureState.current.startY);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!gestureState.current.isTracking) {
      return;
    }
    gestureState.current.isTracking = false;
    const deltaY = gestureState.current.endY - gestureState.current.startY;
    const deltaTime =
      gestureState.current.endTime - gestureState.current.startTime;

    if (
      (deltaTime < dragMSThreshold && deltaY > 0) ||
      deltaY > dragYThreshold
    ) {
      onEnd("COLLAPSED", deltaY, dragYThreshold);
    } else if (
      (deltaTime < dragMSThreshold && deltaY < 0) ||
      deltaY < -dragYThreshold
    ) {
      onEnd("EXPANDED", deltaY, dragYThreshold);
    } else {
      onEnd("NOOP", deltaY, dragYThreshold);
    }

    setDragY(0);
  }, [dragMSThreshold, dragYThreshold, onEnd]);

  const onTouchStart: TouchEventHandler = useCallback(
    (e) => {
      if (e.touches.length === 1 && isEnabled) {
        gestureState.current.isTracking = true;
        gestureState.current.startX = e.targetTouches[0].clientX;
        gestureState.current.startY = e.targetTouches[0].clientY;
        gestureState.current.startTime = performance.now();
        onStart();
      } else {
        // Resets state
        // E.g. when there are multiple touches, reset it isn't supported.
        onTouchEnd();
      }
    },
    [isEnabled, onStart, onTouchEnd]
  );

  const bind = useMemo(
    () => ({
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    }),
    [onTouchEnd, onTouchMove, onTouchStart]
  );

  return {
    bind,
    dragY,
    dragYThreshold,
    dragMSThreshold,
  };
};
