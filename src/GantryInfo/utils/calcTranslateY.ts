import type { ViewType } from "../types";

export const calcTranslateY = (
  viewType: ViewType,
  dragY: number,
  dragYThreshold: number
) => {
  const doubleDragYThreshold = dragYThreshold * 2;
  if (viewType === "minimal") {
    if (dragY > 0) {
      // dragging downwards
      return Math.sqrt(dragY);
    } else if (dragY < -doubleDragYThreshold) {
      // dragging upwards and over the threshold
      const dragOffsetOverThreshold = -dragY - doubleDragYThreshold;
      return -doubleDragYThreshold - 3 * Math.sqrt(dragOffsetOverThreshold);
    } else {
      return dragY;
    }
  } else {
    if (dragY < 0) {
      // dragging upwards
      return -Math.sqrt(-dragY);
    } else if (dragY > doubleDragYThreshold) {
      // dragging downwards and over the threshold
      const dragOffsetOverThreshold = dragY - doubleDragYThreshold;
      return doubleDragYThreshold + 3 * Math.sqrt(dragOffsetOverThreshold);
    } else {
      return dragY;
    }
  }
};
