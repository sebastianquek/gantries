export type Rate = {
  VehicleType: string;
  DayType: string;
  StartTime: string;
  EndTime: string;
  ZoneID: string;
  ChargeAmount: number;
  EffectiveDate: string;
};

export type RatesData = {
  value: Rate[];
};

export type MapboxStyle = {
  version: number;
  name: string;
  metadata: Record<string, unknown>;
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
  sources: {
    composite: {
      url: string;
      type: string;
    };
  };
  sprite: string;
  glyphs: string;
  layers: {
    id: string;
    type: string;
    source?: string;
    "source-layer"?: string;
    paint: Record<string, unknown>;
    layout: Record<string, unknown>;
  }[];
  created: string;
  modified: string;
  id: string;
  owner: string;
  visibility: string;
  protected: boolean;
  draft: boolean;
};
