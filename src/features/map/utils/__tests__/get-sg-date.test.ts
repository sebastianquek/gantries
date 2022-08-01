import { getSGDate } from "../get-sg-date";

describe("getSGDate", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("should return the correct Singapore date when system is in SG time", () => {
    jest
      .useFakeTimers()
      .setSystemTime(new Date("2022-08-01T00:00:00.000+08:00"));
    expect(getSGDate()).toStrictEqual("2022-08-01");
  });

  it("should return the correct Singapore date when system is in UTC", () => {
    jest.useFakeTimers().setSystemTime(new Date("2022-07-31T16:00:00.000Z"));
    expect(getSGDate()).toStrictEqual("2022-08-01");

    jest.useFakeTimers().setSystemTime(new Date("2022-07-31T15:00:00.000Z"));
    expect(getSGDate()).toStrictEqual("2022-07-31");
  });
});
