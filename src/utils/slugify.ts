/**
 * Removes non-alphanumeric characters by replacing them with dashes.
 * Note that consecutive non-alphanumeric characters are replaced with a single dash.
 *
 * @param str String to be slugified
 * @returns String that consists only of alphanumeric characters and dash ("-")
 */
export const slugify = (str: string) =>
  `${str ?? ""}`
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-"); // Replace non-alphanumeric chars: https://stackoverflow.com/a/8485137
