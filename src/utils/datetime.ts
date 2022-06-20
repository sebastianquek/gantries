import type { DayType } from "src/types";

import { format, getDay } from "date-fns";

export const getTime = (now = new Date()): string => {
  return format(now, "HH:mm");
};

export const getDayType = (
  now = new Date(),
  defaultDayType: DayType = "Weekdays"
): DayType => {
  switch (getDay(now)) {
    case 0: // ERP not operational on Sunday
      // TODO: let user know it's sunday
      return defaultDayType;
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
      return "Weekdays";
    case 6:
      return "Saturday";
  }
};
