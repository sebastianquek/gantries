/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { act, renderHook, waitFor } from "@testing-library/react";

import { useFetchJSON } from "../use-fetch-json";

const fetchSpy = jest.spyOn(global, "fetch");

describe("useFetchJSON", () => {
  it("should fetch json immediately when immediate is true and fetching succeeds", async () => {
    fetchSpy.mockResolvedValueOnce({
      json: () => "result",
    } as any);

    const { result } = renderHook(() => useFetchJSON(""));
    expect(result.current.state).toStrictEqual("FETCHING");
    expect(result.current.result).toBeUndefined();
    expect(result.current.error).toBeUndefined();

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    // Once fetch has been called, wait for the result state to update
    await waitFor(() => {
      expect(result.current.result).toStrictEqual("result");
    });

    // Verify that after the result has been updated, other state
    // is also updated correctly.
    expect(result.current.state).toStrictEqual("SUCCESS");
    expect(result.current.error).toBeUndefined();
  });

  it("should fetch json immediately when immediate is true and fetching fails", async () => {
    const error = new Error("Network error");
    fetchSpy.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useFetchJSON(""));
    expect(result.current.state).toStrictEqual("FETCHING");
    expect(result.current.result).toBeUndefined();
    expect(result.current.error).toBeUndefined();

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    // Once fetch has been called, wait for the error state to update
    await waitFor(() => {
      expect(result.current.error).toStrictEqual(error);
    });

    // Verify that after the error has been updated, other state
    // is also updated correctly.
    expect(result.current.state).toStrictEqual("FAILURE");
    expect(result.current.result).toBeUndefined();
  });

  it("should work when run is called and fetching succeeds", async () => {
    fetchSpy.mockResolvedValueOnce({
      json: () => "result",
    } as any);

    const { result } = renderHook(() => useFetchJSON("", undefined, false));
    expect(result.current.state).toStrictEqual("IDLE");
    expect(result.current.result).toBeUndefined();
    expect(result.current.error).toBeUndefined();

    act(() => {
      void result.current.run();
    });

    await waitFor(() => {
      expect(result.current.state).toStrictEqual("FETCHING");
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // Once fetch has been called, wait for the result state to update
    await waitFor(() => {
      expect(result.current.result).toStrictEqual("result");
    });

    // Verify that after the result has been updated, other state
    // is also updated correctly.
    expect(result.current.state).toStrictEqual("SUCCESS");
    expect(result.current.error).toBeUndefined();
  });

  it("should work when run is called and fetching fails", async () => {
    const error = new Error("Network error");
    fetchSpy.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useFetchJSON("", undefined, false));
    expect(result.current.state).toStrictEqual("IDLE");
    expect(result.current.result).toBeUndefined();
    expect(result.current.error).toBeUndefined();

    act(() => {
      void result.current.run();
    });

    await waitFor(() => {
      expect(result.current.state).toStrictEqual("FETCHING");
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // Once fetch has been called, wait for the error state to update
    await waitFor(() => {
      expect(result.current.error).toStrictEqual(error);
    });

    // Verify that after the error has been updated, other state
    // is also updated correctly.
    expect(result.current.state).toStrictEqual("FAILURE");
    expect(result.current.result).toBeUndefined();
  });

  it("should reset state correctly", async () => {
    fetchSpy.mockResolvedValueOnce({
      json: () => "result",
    } as any);

    const { result } = renderHook(() => useFetchJSON(""));
    expect(result.current.state).toStrictEqual("FETCHING");
    expect(result.current.result).toBeUndefined();
    expect(result.current.error).toBeUndefined();

    // Once fetch has been called, wait for the result state to update
    await waitFor(() => {
      expect(result.current.result).toStrictEqual("result");
    });

    // Verify that after the result has been updated, other state
    // is also updated correctly.
    expect(result.current.state).toStrictEqual("SUCCESS");
    expect(result.current.error).toBeUndefined();

    act(() => {
      result.current.reset();
    });

    expect(result.current.state).toStrictEqual("IDLE");
    expect(result.current.result).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });
});
