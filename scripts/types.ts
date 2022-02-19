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
