import { pickSplit } from "../pickSplit";

describe("pickSplit", () => {
  it("should return null when no splits are provided", () => {
    expect(pickSplit("08:00", [])).toBeNull();
  });

  it("should return null when the split does not close", () => {
    // 08:00 is logically treated as an end interval
    expect(pickSplit("08:00", ["08:00"])).toBeNull();
  });

  it("should return null when the split is before the first split", () => {
    expect(pickSplit("08:00", ["09:00"])).toBeNull();
  });

  it("should return null when the split is equal to or after the last split", () => {
    expect(pickSplit("12:00", ["12:00"])).toBeNull();
    expect(pickSplit("12:00", ["10:00"])).toBeNull();
  });

  it("should return the matching split when the time matches a split exactly", () => {
    expect(pickSplit("08:00", ["08:00", "09:00"])).toStrictEqual("08:00-09:00");
  });

  it("should return the matching split when the time is within an interval", () => {
    expect(pickSplit("08:30", ["08:00", "09:00"])).toStrictEqual("08:00-09:00");
  });

  it("should return the matching split when the time matches an end interval", () => {
    expect(pickSplit("09:00", ["08:00", "09:00", "10:00"])).toStrictEqual(
      "09:00-10:00"
    );
  });
});
