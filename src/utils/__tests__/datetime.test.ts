import { getDayType, getTime } from "../datetime";

describe("datetime", () => {
  afterAll(() => {
    jest.useRealTimers();
  });

  describe("getTime", () => {
    it.each([
      [new Date("2022-01-01T00:00:00"), "00:00"],
      [new Date("2022-01-01T12:13:00"), "12:13"],
      [new Date("2022-01-01T02:13:14"), "02:13"],
    ])(`should format correctly ("%s" => "%s")`, (input, output) => {
      expect(getTime(input)).toStrictEqual(output);
    });

    it("should format correctly when no date is provided", () => {
      jest.useFakeTimers().setSystemTime(new Date("2022-01-01T09:10:11"));
      expect(getTime()).toStrictEqual("09:10");
    });
  });

  describe("getDayType", () => {
    it.each([
      [new Date("2022-01-01T00:00:00"), "Saturday"],
      [new Date("2022-01-02T00:00:00"), "Weekdays"],
      [new Date("2022-01-03T00:00:00"), "Weekdays"],
      [new Date("2022-01-04T00:00:00"), "Weekdays"],
      [new Date("2022-01-05T00:00:00"), "Weekdays"],
      [new Date("2022-01-06T00:00:00"), "Weekdays"],
      [new Date("2022-01-07T00:00:00"), "Weekdays"],
    ])(
      `should return the correct day type based on date ("%s" => "%s")`,
      (input, output) => {
        expect(getDayType(input)).toStrictEqual(output);
      }
    );
  });

  it("should return the correct day type when no date is provided", () => {
    jest.useFakeTimers().setSystemTime(new Date("2022-01-01T09:10:11"));
    expect(getDayType()).toStrictEqual("Saturday");
  });

  it("should return the correct day type when default day type is provided", () => {
    expect(
      getDayType(new Date("2022-01-02T00:00:00"), "Saturday")
    ).toStrictEqual("Saturday");
  });
});
