/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook } from "@testing-library/react";

import * as useFetchJSONModule from "src/hooks/use-fetch-json";

import { useLayerId } from "../use-layer-id";

const useFetchJsonSpy = jest.spyOn(useFetchJSONModule, "useFetchJSON");

const mockJson = {
  "motorcycles-weekdays": [
    "07:30",
    "07:35",
    "08:00",
    "08:05",
    "08:30",
    "08:35",
    "08:55",
    "09:00",
  ],
};

describe("useLayerId", () => {
  it("should return undefined when there are no splits", () => {
    useFetchJsonSpy.mockReturnValueOnce({ result: [] } as any);
    const { result } = renderHook(() =>
      useLayerId("Motorcycles", "Weekdays", "08:00")
    );
    expect(result.current).toBeUndefined();
  });

  it("should return undefined when there are no associated splits for the vehicle and day type", () => {
    useFetchJsonSpy.mockReturnValueOnce({ result: mockJson } as any);
    // There are no rates for Saturday
    const { result } = renderHook(() =>
      useLayerId("Motorcycles", "Saturday", "08:00")
    );
    expect(result.current).toBeUndefined();
  });

  it("should return undefined when the time does not exist in the splits", () => {
    useFetchJsonSpy.mockReturnValueOnce({ result: mockJson } as any);
    // There are no rates for Saturday
    const { result } = renderHook(() =>
      useLayerId("Motorcycles", "Weekdays", "01:00")
    );
    expect(result.current).toBeUndefined();
  });

  it("should return correctly when all conditions are satisfied", () => {
    useFetchJsonSpy.mockReturnValueOnce({ result: mockJson } as any);
    const { result } = renderHook(() =>
      useLayerId("Motorcycles", "Weekdays", "08:00")
    );
    expect(result.current).toStrictEqual("motorcycles-weekdays-08-00-08-05");

    useFetchJsonSpy.mockReturnValueOnce({ result: mockJson } as any);
    const { result: result2 } = renderHook(() =>
      useLayerId("Motorcycles", "Weekdays", "07:30")
    );
    expect(result2.current).toStrictEqual("motorcycles-weekdays-07-30-07-35");
  });
});
