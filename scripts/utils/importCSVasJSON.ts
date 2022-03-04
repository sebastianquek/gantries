import { readFileSync } from "fs";

import { parse } from "papaparse";

/**
 * Imports CSV as JSON
 * - CSV must include a header
 * - Empty lines are skipped
 *
 * @param path
 * @returns
 */
export const importCSVasJSON = <T extends Record<string, string>>(
  path: string
) => {
  const csvData = readFileSync(path);
  const { data } = parse<T>(csvData.toString(), {
    header: true,
    skipEmptyLines: true,
  });
  return data;
};
