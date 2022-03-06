import { format } from "date-fns";
/**
 * Based on the current time, ignoring timezones, pick the correct
 * time interval.
 *
 * @param date
 * @param splits Array of "HH:mm" strings, in ascending order
 * @returns String in format "HH:mm-HH:mm"
 */
export const pickSplit = (date: Date, splits: string[]): string | null => {
  const time = format(date, "HH:mm");
  for (let i = 0; i < splits.length; i++) {
    const split = splits[i];
    if ((i === 0 && time < split) || i === splits.length - 1) {
      // time is before the first split, so does not exist in any interval
      // time is after the last split, so does not exist in any interval
      return null;
    }
    if (time >= split && time < splits[i + 1]) {
      return `${split}-${splits[i + 1]}`;
    }
  }
  return null;
};
