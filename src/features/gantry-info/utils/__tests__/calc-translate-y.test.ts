import { calcTranslateY } from "../calc-translate-y";

const dragYThreshold = 50;

describe("calcTranslateY", () => {
  it("should return correctly when viewType is minimal and dragY is positive (dragging downwards)", () => {
    expect(calcTranslateY("minimal", 1, dragYThreshold)).toStrictEqual(1);
    expect(calcTranslateY("minimal", 4, dragYThreshold)).toStrictEqual(2);
    expect(calcTranslateY("minimal", 100, dragYThreshold)).toStrictEqual(10);
    expect(calcTranslateY("minimal", 144, dragYThreshold)).toStrictEqual(12);
  });

  it("should return correctly when viewType is minimal and dragY is negative and over the threshold (dragging upwards)", () => {
    expect(calcTranslateY("minimal", -200, dragYThreshold)).toStrictEqual(-130);
  });

  it("should return dragY when viewType is minimal and dragY is negative but less than the threshold (dragging upwards)", () => {
    expect(calcTranslateY("minimal", -100, dragYThreshold)).toStrictEqual(-100);
    expect(calcTranslateY("minimal", -1, dragYThreshold)).toStrictEqual(-1);
    expect(calcTranslateY("minimal", 0, dragYThreshold)).toStrictEqual(0);
  });

  it("should return correctly when viewType is all and dragY is negative (dragging upwards)", () => {
    expect(calcTranslateY("all", -1, dragYThreshold)).toStrictEqual(-1);
    expect(calcTranslateY("all", -4, dragYThreshold)).toStrictEqual(-2);
    expect(calcTranslateY("all", -100, dragYThreshold)).toStrictEqual(-10);
    expect(calcTranslateY("all", -144, dragYThreshold)).toStrictEqual(-12);
  });

  it("should return correctly when viewType is all and dragY is positive and over the threshold (dragging downwards)", () => {
    expect(calcTranslateY("all", 200, dragYThreshold)).toStrictEqual(130);
  });
  it("should return dragY when viewType is all and dragY is positive but less than the threshold (dragging downwards)", () => {
    expect(calcTranslateY("all", 100, dragYThreshold)).toStrictEqual(100);
    expect(calcTranslateY("all", 1, dragYThreshold)).toStrictEqual(1);
    expect(calcTranslateY("all", 0, dragYThreshold)).toStrictEqual(0);
  });
});
