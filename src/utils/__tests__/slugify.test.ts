import { slugify } from "../slugify";

describe("slugify", () => {
  it.each([
    ["", ""],
    [undefined, ""],
    [null, ""],
  ])(`should work for empty strings ("%s" => "%s")`, (input, output) => {
    expect(slugify(input as string)).toStrictEqual(output);
  });

  it.each([
    ["  ", ""],
    ["   asd", "asd"],
    [" asd   ", "asd"],
  ])(`should remove white-spaces ("%s" => "%s")`, (input, output) => {
    expect(slugify(input)).toStrictEqual(output);
  });

  it.each([
    ["ASD", "asd"],
    ["aSD", "asd"],
    ["as123D", "as123d"],
  ])(`should lowercase all characters ("%s" => "%s")`, (input, output) => {
    expect(slugify(input)).toStrictEqual(output);
  });

  it.each([
    ["a b c", "a-b-c"],
    ["a  b    c", "a-b-c"],
    ["abd def g", "abd-def-g"],
  ])(
    `should replace spaces between words with dash ("%s" => "%s")`,
    (input, output) => {
      expect(slugify(input)).toStrictEqual(output);
    }
  );

  it.each([
    ["a  b    c", "a-b-c"],
    ["!@#$%", "-"],
    ["!@#", "-"],
    ["asd!@#fgh", "asd-fgh"],
  ])(
    `should remove non-alphanumeric characters with dashes ("%s" => "%s")`,
    (input, output) => {
      expect(slugify(input)).toStrictEqual(output);
    }
  );
});
