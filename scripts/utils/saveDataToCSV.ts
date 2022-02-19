import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";

import { stringify } from "csv-stringify";

/**
 * Saves an array of objects into a CSV file.
 * The array of objects must include a header as the first element.
 *
 * @param fileName Target file name
 * @param dataWithHeader Array of objects
 * @param saveDir Directory of where to save the file to
 */
export const saveDataToCSV = (
  fileName: string,
  dataWithHeader: Record<string, unknown>[],
  saveDir: string
) => {
  stringify(dataWithHeader, { header: true }, (err, output) => {
    if (!err) {
      if (!existsSync(saveDir)) {
        mkdirSync(saveDir);
      }
      writeFileSync(join(saveDir, `${fileName}.csv`), output);
    }
  });
};
