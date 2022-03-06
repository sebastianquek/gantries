import { pickSplit } from "../pickSplit";

describe("pickSplit", () => {
  it("should return null when no splits are provided", () => {
    expect(pickSplit(new Date(), [])).toBeNull();
  });

  it("should return null when the split does not close", () => {
    expect(
      pickSplit(new Date("2022-03-06T08:00:00"), ["08:00"]) // 08:00 is logically treated as an end interval
    ).toBeNull();
  });

  it("should return null when the split is before the first split", () => {
    expect(pickSplit(new Date("2022-03-06T08:00:00"), ["09:00"])).toBeNull();
  });

  it("should return null when the split is equal to or after the last split", () => {
    expect(pickSplit(new Date("2022-03-06T12:00:00"), ["12:00"])).toBeNull();
    expect(pickSplit(new Date("2022-03-06T12:00:00"), ["10:00"])).toBeNull();
  });

  it("should return the matching split when the time matches a split exactly", () => {
    expect(
      pickSplit(new Date("2022-03-06T08:00:00"), ["08:00", "09:00"])
    ).toStrictEqual("08:00-09:00");
  });

  it("should return the matching split when the time is within an interval", () => {
    expect(
      pickSplit(new Date("2022-03-06T08:30:00"), ["08:00", "09:00"])
    ).toStrictEqual("08:00-09:00");
  });

  it("should return the matching split when the time matches an end interval", () => {
    expect(
      pickSplit(new Date("2022-03-06T09:00:00"), ["08:00", "09:00", "10:00"])
    ).toStrictEqual("09:00-10:00");
  });
});
