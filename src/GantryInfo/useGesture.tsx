import { useCallback, useEffect, useRef, useState } from "react";

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
  ref,
  onEnd,
  dragYThreshold = DEFAULT_DRAG_Y_THRESHOLD,
  dragMSThreshold = DEFAULT_DRAG_MS_THRESHOLD,
}: {
  ref: React.RefObject<HTMLElement>;
  onEnd: (state: "COLLAPSED" | "EXPANDED") => void;
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
      setDragY(gestureState.current.endY - gestureState.current.startY);
    }
  }, []);

  const gestureEnd = useCallback(() => {
    gestureState.current.isTracking = false;
    const deltaY = gestureState.current.endY - gestureState.current.startY;
    const deltaTime =
      gestureState.current.endTime - gestureState.current.startTime;

    if (
      (deltaTime < dragMSThreshold && deltaY > 0) ||
      deltaY > dragYThreshold
    ) {
      onEnd("COLLAPSED");
    } else if (
      (deltaTime < dragMSThreshold && deltaY < 0) ||
      deltaY < -dragYThreshold
    ) {
      onEnd("EXPANDED");
    }

    setDragY(0);
  }, [dragMSThreshold, dragYThreshold, onEnd]);

  useEffect(() => {
    const target = ref.current;

    target?.addEventListener("touchstart", gestureStart);
    target?.addEventListener("touchmove", gestureMove);
    target?.addEventListener("touchend", gestureEnd);

    return () => {
      target?.removeEventListener("touchstart", gestureStart);
      target?.removeEventListener("touchmove", gestureMove);
      target?.removeEventListener("touchend", gestureEnd);
    };
  }, [gestureEnd, gestureMove, gestureStart, ref]);

  return {
    dragY,
    dragYThreshold,
    dragMSThreshold,
  };
};
