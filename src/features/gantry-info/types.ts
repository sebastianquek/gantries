export type ViewType = "minimal" | "all";
export type Rate = { startTime: string; endTime: string; amount: number };

export type Dimensions = {
  positionerHeight: number | undefined;
  panelYFromBottom: number;
};
